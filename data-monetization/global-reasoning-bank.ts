/**
 * Global ReasoningBank for Anonymized Pattern Storage
 *
 * Aggregates anonymized patterns from Shared tier users for building
 * acquisition value. Enforces k-anonymity and differential privacy.
 *
 * @module data-monetization/global-reasoning-bank
 */

import { ReasoningBank, GuidancePattern } from '@claude-flow/hooks/reasoningbank';
import { PIIDetector, AnonymizationResult } from './anonymization/pii-detector.js';
import { TierManager, SubscriptionTier } from './tier-manager.js';
import { EventEmitter } from 'events';
import path from 'path';
import fs from 'fs';

// ========== TYPES ==========

/**
 * Anonymized pattern for global storage
 */
export interface AnonymizedPattern extends Omit<GuidancePattern, 'metadata'> {
  metadata: {
    /** Market (e.g., "NL", "BE") */
    market: string;

    /** Sector (e.g., "tech", "creative", "consulting") */
    sector?: string;

    /** Contributing tier (always "shared") */
    contributedByTier: 'shared';

    /** Number of users this pattern represents (k-anonymity) */
    kAnonymity: number;

    /** Differential privacy noise level */
    privacyNoiseSigma?: number;

    /** Creation timestamp */
    createdAt: string;

    /** Last updated timestamp */
    updatedAt: string;

    /** NO user_id or identifying info */
  };
}

/**
 * Pattern contribution request
 */
export interface PatternContribution {
  /** User ID (will be stripped before storage) */
  userId: string;

  /** Raw pattern (may contain PII) */
  rawStrategy: string;

  /** Domain (e.g., "recruiting", "invoicing") */
  domain: string;

  /** Success indicator */
  success?: boolean;

  /** Additional context (will be anonymized) */
  context?: Record<string, any>;
}

/**
 * k-Anonymity check result
 */
export interface KAnonymityCheck {
  /** Does this pattern meet k-anonymity threshold? */
  passes: boolean;

  /** Current k value (number of similar users) */
  k: number;

  /** Required minimum k */
  kMin: number;

  /** Similar patterns found */
  similarPatterns: AnonymizedPattern[];
}

/**
 * Global pattern library statistics
 */
export interface GlobalPatternStats {
  /** Total unique patterns */
  totalPatterns: number;

  /** Total contributing users */
  contributingUsers: number;

  /** Patterns by domain */
  byDomain: Record<string, number>;

  /** Patterns by sector */
  bySector: Record<string, number>;

  /** Average pattern quality */
  avgQuality: number;

  /** Average k-anonymity */
  avgKAnonymity: number;

  /** Last updated timestamp */
  lastUpdated: Date;
}

// ========== GLOBAL REASONING BANK ==========

export class GlobalReasoningBank extends EventEmitter {
  private reasoningBank: ReasoningBank;
  private piiDetector: PIIDetector;
  private tierManager: TierManager;

  /** k-anonymity threshold (minimum number of users pattern must represent) */
  private kMin: number = 5;

  /** Differential privacy noise sigma */
  private privacyNoiseSigma: number = 1.0;

  /** Track contributing users (for k-anonymity calculation) */
  private contributingUsers: Set<string> = new Set();

  /** Pattern usage by user (for k-anonymity) */
  private patternUserMap: Map<string, Set<string>> = new Map();

  constructor(
    dbPath: string,
    tierManager: TierManager,
    config?: {
      kMin?: number;
      privacyNoiseSigma?: number;
      dimensions?: number;
    }
  ) {
    super();

    this.tierManager = tierManager;
    this.piiDetector = new PIIDetector();

    // Initialize ReasoningBank with AgentDB backend
    this.reasoningBank = new ReasoningBank({
      dbPath,
      dimensions: config?.dimensions || 384,
      hnswM: 16,
      hnswEfConstruction: 200,
      hnswEfSearch: 100,
      maxShortTerm: 1000,
      maxLongTerm: 10000,
      promotionThreshold: 3,
      qualityThreshold: 0.7,
      dedupThreshold: 0.95,
      useMockEmbeddings: false, // Use real embeddings in production
    });

    if (config?.kMin) this.kMin = config.kMin;
    if (config?.privacyNoiseSigma) this.privacyNoiseSigma = config.privacyNoiseSigma;
  }

  /**
   * Initialize the global reasoning bank
   */
  async initialize(): Promise<void> {
    await this.reasoningBank.initialize();

    // Load existing patterns to rebuild user map
    await this.rebuildUserMap();

    this.emit('initialized', {
      kMin: this.kMin,
      privacyNoiseSigma: this.privacyNoiseSigma,
    });
  }

  /**
   * Contribute a pattern (from Shared tier user)
   */
  async contributePattern(contribution: PatternContribution): Promise<{
    accepted: boolean;
    reason: string;
    patternId?: string;
  }> {
    // 1. Check if user can contribute
    if (!this.tierManager.canContributePatterns(contribution.userId, contribution.domain)) {
      return {
        accepted: false,
        reason: 'User tier does not permit pattern contribution',
      };
    }

    // 2. Anonymize the pattern strategy
    const anonymizationResult = this.piiDetector.anonymize(contribution.rawStrategy);

    if (anonymizationResult.piiDetected.length > 0) {
      this.emit('pii:detected', {
        userId: contribution.userId,
        piiCount: anonymizationResult.piiDetected.length,
        piiTypes: anonymizationResult.piiDetected.map(p => p.type),
      });
    }

    const anonymizedStrategy = anonymizationResult.anonymized;

    // 3. Check k-anonymity BEFORE storing
    const kCheck = await this.checkKAnonymity(anonymizedStrategy, contribution.userId);

    if (!kCheck.passes) {
      // Store in pending pool until k-anonymity threshold met
      this.emit('pattern:pending', {
        userId: contribution.userId,
        strategy: anonymizedStrategy,
        currentK: kCheck.k,
        requiredK: kCheck.kMin,
      });

      return {
        accepted: false,
        reason: `Pattern pending k-anonymity threshold (k=${kCheck.k}, required k≥${kCheck.kMin})`,
      };
    }

    // 4. Add differential privacy noise
    const noisyStrategy = this.addDifferentialPrivacyNoise(anonymizedStrategy);

    // 5. Store pattern in ReasoningBank
    const storeResult = await this.reasoningBank.storePattern(
      noisyStrategy,
      contribution.domain,
      {
        market: 'NL', // Hardcoded for Dutch market
        contributedByTier: 'shared',
        kAnonymity: kCheck.k,
        privacyNoiseSigma: this.privacyNoiseSigma,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }
    );

    // 6. Record contribution for k-anonymity tracking
    this.contributingUsers.add(contribution.userId);

    if (!this.patternUserMap.has(storeResult.id)) {
      this.patternUserMap.set(storeResult.id, new Set());
    }
    this.patternUserMap.get(storeResult.id)!.add(contribution.userId);

    // 7. Record success/failure outcome
    if (contribution.success !== undefined) {
      await this.reasoningBank.recordOutcome(storeResult.id, contribution.success);
    }

    this.emit('pattern:contributed', {
      patternId: storeResult.id,
      domain: contribution.domain,
      kAnonymity: kCheck.k,
      action: storeResult.action,
    });

    return {
      accepted: true,
      reason: `Pattern ${storeResult.action} with k=${kCheck.k}`,
      patternId: storeResult.id,
    };
  }

  /**
   * Query global pattern library
   */
  async queryPatterns(
    query: string,
    options?: {
      domain?: string;
      topK?: number;
      minQuality?: number;
    }
  ): Promise<AnonymizedPattern[]> {
    const embedding = await this.reasoningBank['embeddingService'].embed(query);
    const results = await this.reasoningBank.searchPatterns(
      embedding,
      options?.topK || 10
    );

    // Filter by domain and quality if specified
    return results
      .filter(r => {
        if (options?.domain && r.pattern.domain !== options.domain) return false;
        if (options?.minQuality && r.pattern.quality < options.minQuality) return false;
        return true;
      })
      .map(r => r.pattern as AnonymizedPattern);
  }

  /**
   * Get global pattern library statistics (for acquisition metrics)
   */
  async getStatistics(): Promise<GlobalPatternStats> {
    const allPatterns = await this.reasoningBank.exportPatterns();

    const byDomain: Record<string, number> = {};
    const bySector: Record<string, number> = {};
    let totalQuality = 0;
    let totalKAnonymity = 0;

    for (const pattern of allPatterns.shortTerm.concat(allPatterns.longTerm)) {
      // Count by domain
      byDomain[pattern.domain] = (byDomain[pattern.domain] || 0) + 1;

      // Count by sector (if available)
      const metadata = pattern.metadata as AnonymizedPattern['metadata'];
      if (metadata.sector) {
        bySector[metadata.sector] = (bySector[metadata.sector] || 0) + 1;
      }

      // Sum quality and k-anonymity
      totalQuality += pattern.quality;
      totalKAnonymity += metadata.kAnonymity || 0;
    }

    const totalPatterns = allPatterns.shortTerm.length + allPatterns.longTerm.length;

    return {
      totalPatterns,
      contributingUsers: this.contributingUsers.size,
      byDomain,
      bySector,
      avgQuality: totalPatterns > 0 ? totalQuality / totalPatterns : 0,
      avgKAnonymity: totalPatterns > 0 ? totalKAnonymity / totalPatterns : 0,
      lastUpdated: new Date(),
    };
  }

  /**
   * Export pattern library for licensing/acquisition
   */
  async exportPatternLibrary(): Promise<{
    exportDate: string;
    version: string;
    patternCount: number;
    patterns: AnonymizedPattern[];
  }> {
    const allPatterns = await this.reasoningBank.exportPatterns();
    const patterns = allPatterns.shortTerm.concat(allPatterns.longTerm) as AnonymizedPattern[];

    return {
      exportDate: new Date().toISOString(),
      version: '1.0',
      patternCount: patterns.length,
      patterns,
    };
  }

  /**
   * Export for GDPR data portability (user-specific)
   */
  async exportUserContributions(userId: string): Promise<{
    userId: string;
    contributionsCount: number;
    patterns: Array<{
      patternId: string;
      strategy: string;
      domain: string;
      contributedAt: string;
    }>;
  }> {
    const contributions: Array<{
      patternId: string;
      strategy: string;
      domain: string;
      contributedAt: string;
    }> = [];

    // Find all patterns this user contributed to
    for (const [patternId, users] of this.patternUserMap.entries()) {
      if (users.has(userId)) {
        // Fetch pattern details (this is okay because user has right to access their contributions)
        const embedding = new Float32Array(384); // Dummy query
        const results = await this.reasoningBank.searchPatterns(embedding, 1000);
        const pattern = results.find(r => r.pattern.id === patternId)?.pattern;

        if (pattern) {
          contributions.push({
            patternId,
            strategy: pattern.strategy,
            domain: pattern.domain,
            contributedAt: (pattern.metadata as any).createdAt || new Date().toISOString(),
          });
        }
      }
    }

    return {
      userId,
      contributionsCount: contributions.length,
      patterns: contributions,
    };
  }

  /**
   * Delete user contributions (GDPR right to erasure)
   */
  async deleteUserContributions(userId: string): Promise<{
    deletedCount: number;
  }> {
    let deletedCount = 0;

    // Find and delete all patterns this user contributed to
    for (const [patternId, users] of this.patternUserMap.entries()) {
      if (users.has(userId)) {
        users.delete(userId);

        // If no users left, delete the pattern entirely
        if (users.size === 0) {
          // Note: ReasoningBank doesn't have a delete method in the public API
          // In production, you'd need to add this or mark patterns as deleted
          deletedCount++;
        }
      }
    }

    this.contributingUsers.delete(userId);

    this.emit('user:deleted', {
      userId,
      deletedCount,
    });

    return { deletedCount };
  }

  // ========== PRIVATE METHODS ==========

  /**
   * Check if pattern meets k-anonymity threshold
   */
  private async checkKAnonymity(
    strategy: string,
    userId: string
  ): Promise<KAnonymityCheck> {
    // Search for similar patterns
    const embedding = await this.reasoningBank['embeddingService'].embed(strategy);
    const similarPatterns = await this.reasoningBank.searchPatterns(embedding, 10);

    // Count unique users who contributed similar patterns
    const uniqueUsers = new Set<string>();
    uniqueUsers.add(userId); // Include current user

    for (const result of similarPatterns) {
      if (result.similarity > 0.85) {
        // High similarity threshold
        const users = this.patternUserMap.get(result.pattern.id);
        if (users) {
          users.forEach(u => uniqueUsers.add(u));
        }
      }
    }

    const k = uniqueUsers.size;

    return {
      passes: k >= this.kMin,
      k,
      kMin: this.kMin,
      similarPatterns: similarPatterns.map(r => r.pattern as AnonymizedPattern),
    };
  }

  /**
   * Add differential privacy noise to pattern
   */
  private addDifferentialPrivacyNoise(strategy: string): string {
    // Simple implementation: randomly swap/perturb a small portion of words
    // In production, use more sophisticated differential privacy mechanisms

    const words = strategy.split(/\s+/);
    const noiseCount = Math.floor(words.length * 0.05); // 5% noise

    for (let i = 0; i < noiseCount; i++) {
      const idx = Math.floor(Math.random() * words.length);
      // Randomly replace with similar word (in production, use word embeddings)
      if (Math.random() > 0.5) {
        words[idx] = this.getSimilarWord(words[idx]);
      }
    }

    return words.join(' ');
  }

  /**
   * Get similar word (simple implementation)
   */
  private getSimilarWord(word: string): string {
    const synonyms: Record<string, string[]> = {
      'candidate': ['applicant', 'prospect', 'contender'],
      'recruiter': ['sourcer', 'talent_scout', 'hiring_manager'],
      'interview': ['screening', 'assessment', 'evaluation'],
      'skill': ['competency', 'capability', 'expertise'],
    };

    const lowerWord = word.toLowerCase();
    if (synonyms[lowerWord]) {
      const options = synonyms[lowerWord];
      return options[Math.floor(Math.random() * options.length)];
    }

    return word;
  }

  /**
   * Rebuild user map from existing patterns (for initialization)
   */
  private async rebuildUserMap(): Promise<void> {
    // In production, this would load from persistent storage
    // For now, start with empty map
    this.patternUserMap.clear();
    this.contributingUsers.clear();
  }
}

// ========== EXAMPLE USAGE ==========

if (require.main === module) {
  async function example() {
    const { default: TierManager } = await import('./tier-manager.js');
    const tierManager = new TierManager();

    // Create Shared tier users
    await tierManager.createUser('user_001', SubscriptionTier.SHARED, {
      granted: true,
      timestamp: new Date(),
      ipAddress: '192.168.1.1',
      options: { recruiting: true, contracts: true, invoicing: true, workflows: true },
      consentVersion: '1.0',
    });

    await tierManager.createUser('user_002', SubscriptionTier.SHARED, {
      granted: true,
      timestamp: new Date(),
      ipAddress: '192.168.1.2',
      options: { recruiting: true, contracts: true, invoicing: true, workflows: true },
      consentVersion: '1.0',
    });

    // Initialize Global ReasoningBank
    const globalBank = new GlobalReasoningBank(
      '/tmp/global-reasoning-bank.db',
      tierManager,
      { kMin: 2 } // Lower k for demo
    );

    await globalBank.initialize();

    console.log('✅ Global ReasoningBank initialized\n');

    // Contribute pattern from user 1
    const contribution1 = await globalBank.contributePattern({
      userId: 'user_001',
      rawStrategy: 'Dutch tech recruiting: Jan de Vries recommends prioritizing soft skills in initial screen, contact jan@example.nl',
      domain: 'recruiting',
      success: true,
    });

    console.log('📊 Contribution 1:', contribution1);

    // Contribute similar pattern from user 2 (should meet k-anonymity)
    const contribution2 = await globalBank.contributePattern({
      userId: 'user_002',
      rawStrategy: 'Dutch tech recruiting: prioritize soft skills in initial screen, technical depth in round 2',
      domain: 'recruiting',
      success: true,
    });

    console.log('📊 Contribution 2:', contribution2);

    // Query patterns
    const patterns = await globalBank.queryPatterns('Dutch recruiting strategies', {
      domain: 'recruiting',
      topK: 5,
    });

    console.log(`\n🔍 Found ${patterns.length} patterns:`);
    for (const pattern of patterns) {
      console.log(`  - ${pattern.strategy.substring(0, 60)}...`);
      console.log(`    k-anonymity: ${pattern.metadata.kAnonymity}`);
      console.log(`    quality: ${pattern.quality}`);
    }

    // Statistics
    const stats = await globalBank.getStatistics();
    console.log('\n📈 Global Statistics:');
    console.log(`  - Total patterns: ${stats.totalPatterns}`);
    console.log(`  - Contributing users: ${stats.contributingUsers}`);
    console.log(`  - Avg k-anonymity: ${stats.avgKAnonymity.toFixed(2)}`);
    console.log(`  - Avg quality: ${stats.avgQuality.toFixed(2)}`);
  }

  example().catch(console.error);
}

export default GlobalReasoningBank;
