/**
 * Tier Management System for Cadans Data Monetization
 *
 * Manages user tiers (Shared, Private, Enterprise) and consent for pattern contribution.
 * GDPR-compliant consent tracking with audit trail.
 *
 * @module data-monetization/tier-manager
 */

import { EventEmitter } from 'events';

// ========== TYPES ==========

/**
 * User subscription tier
 */
export enum SubscriptionTier {
  /** €49/mo - Multi-tenant, contributes anonymized patterns to global pool */
  SHARED = 'shared',

  /** €99/mo - Multi-tenant, no pattern contribution, isolated data */
  PRIVATE = 'private',

  /** €499/mo - Dedicated VPS, full control, custom DPA */
  ENTERPRISE = 'enterprise',
}

/**
 * Consent status for pattern contribution
 */
export interface PatternContributionConsent {
  /** Has user given consent? */
  granted: boolean;

  /** When was consent given/revoked? */
  timestamp: Date;

  /** User's IP address (for audit trail) */
  ipAddress: string;

  /** Granular consent options */
  options: {
    /** Contribute recruiting patterns? */
    recruiting: boolean;

    /** Contribute contract patterns? */
    contracts: boolean;

    /** Contribute invoicing patterns? */
    invoicing: boolean;

    /** Contribute general workflow patterns? */
    workflows: boolean;
  };

  /** Version of consent form accepted */
  consentVersion: string;
}

/**
 * User tier configuration
 */
export interface UserTierConfig {
  /** Unique user ID */
  userId: string;

  /** Current subscription tier */
  tier: SubscriptionTier;

  /** Pattern contribution consent (only relevant for Shared tier) */
  consent?: PatternContributionConsent;

  /** Tier subscription start date */
  subscriptionStart: Date;

  /** Tier change history (for audit trail) */
  tierHistory: Array<{
    tier: SubscriptionTier;
    changedAt: Date;
    reason: 'signup' | 'upgrade' | 'downgrade' | 'cancellation';
  }>;

  /** Billing status */
  billing: {
    status: 'active' | 'past_due' | 'cancelled';
    nextBillingDate?: Date;
    lastPaymentDate?: Date;
  };
}

/**
 * Tier change request
 */
export interface TierChangeRequest {
  /** User requesting change */
  userId: string;

  /** Target tier */
  targetTier: SubscriptionTier;

  /** Reason for change */
  reason: 'upgrade' | 'downgrade' | 'cancellation';

  /** Effective date (immediate or future) */
  effectiveDate: Date;

  /** User confirmation (for downgrades with data implications) */
  userConfirmed?: boolean;
}

/**
 * Tier features matrix
 */
interface TierFeatures {
  /** Monthly price in EUR */
  price: number;

  /** Can access global pattern library? */
  globalPatternAccess: boolean;

  /** Contributes patterns to global pool? */
  contributesPatterns: boolean;

  /** Dedicated VPS? */
  dedicatedVPS: boolean;

  /** Custom DPA? */
  customDPA: boolean;

  /** SLA guarantee */
  sla: 'best-effort' | '99%' | '99.9%';

  /** Max agents per account */
  maxAgents: number;

  /** Storage limit (GB) */
  storageGB: number;

  /** Support level */
  support: 'community' | 'email' | 'priority';
}

// ========== TIER FEATURES MATRIX ==========

const TIER_FEATURES: Record<SubscriptionTier, TierFeatures> = {
  [SubscriptionTier.SHARED]: {
    price: 49,
    globalPatternAccess: true,
    contributesPatterns: true,
    dedicatedVPS: false,
    customDPA: false,
    sla: 'best-effort',
    maxAgents: 3,
    storageGB: 10,
    support: 'community',
  },
  [SubscriptionTier.PRIVATE]: {
    price: 99,
    globalPatternAccess: false,
    contributesPatterns: false,
    dedicatedVPS: false,
    customDPA: false,
    sla: '99%',
    maxAgents: 10,
    storageGB: 50,
    support: 'email',
  },
  [SubscriptionTier.ENTERPRISE]: {
    price: 499,
    globalPatternAccess: false,
    contributesPatterns: false,
    dedicatedVPS: true,
    customDPA: true,
    sla: '99.9%',
    maxAgents: -1, // unlimited
    storageGB: 500,
    support: 'priority',
  },
};

// ========== TIER MANAGER ==========

/**
 * Manages user tiers and consent for pattern contribution
 */
export class TierManager extends EventEmitter {
  private userConfigs: Map<string, UserTierConfig> = new Map();
  private consentVersion = '1.0'; // Increment when consent form changes

  constructor() {
    super();
  }

  /**
   * Create new user with tier selection
   */
  async createUser(
    userId: string,
    tier: SubscriptionTier,
    consent?: PatternContributionConsent
  ): Promise<UserTierConfig> {
    // Validate tier
    if (!Object.values(SubscriptionTier).includes(tier)) {
      throw new Error(`Invalid tier: ${tier}`);
    }

    // Shared tier requires consent
    if (tier === SubscriptionTier.SHARED && !consent) {
      throw new Error('Shared tier requires pattern contribution consent');
    }

    // Private/Enterprise cannot have consent (no contribution)
    if (tier !== SubscriptionTier.SHARED && consent?.granted) {
      throw new Error(`${tier} tier does not contribute patterns`);
    }

    const config: UserTierConfig = {
      userId,
      tier,
      consent: tier === SubscriptionTier.SHARED ? consent : undefined,
      subscriptionStart: new Date(),
      tierHistory: [
        {
          tier,
          changedAt: new Date(),
          reason: 'signup',
        },
      ],
      billing: {
        status: 'active',
        nextBillingDate: this.calculateNextBillingDate(new Date()),
      },
    };

    this.userConfigs.set(userId, config);

    this.emit('user:created', { userId, tier, consent });

    return config;
  }

  /**
   * Get user tier configuration
   */
  getUserConfig(userId: string): UserTierConfig | undefined {
    return this.userConfigs.get(userId);
  }

  /**
   * Check if user can contribute patterns
   */
  canContributePatterns(userId: string, patternDomain?: string): boolean {
    const config = this.userConfigs.get(userId);
    if (!config) return false;

    // Only Shared tier contributes
    if (config.tier !== SubscriptionTier.SHARED) return false;

    // Check consent
    if (!config.consent?.granted) return false;

    // Check granular consent for specific domain
    if (patternDomain) {
      const domainKey = patternDomain as keyof typeof config.consent.options;
      if (config.consent.options[domainKey] !== undefined) {
        return config.consent.options[domainKey];
      }
    }

    return true;
  }

  /**
   * Check if user can access global pattern library
   */
  canAccessGlobalPatterns(userId: string): boolean {
    const config = this.userConfigs.get(userId);
    if (!config) return false;

    const features = TIER_FEATURES[config.tier];
    return features.globalPatternAccess;
  }

  /**
   * Request tier change
   */
  async changeTier(request: TierChangeRequest): Promise<UserTierConfig> {
    const config = this.userConfigs.get(request.userId);
    if (!config) {
      throw new Error(`User not found: ${request.userId}`);
    }

    // Check if downgrade requires data migration/deletion
    if (request.reason === 'downgrade') {
      const currentFeatures = TIER_FEATURES[config.tier];
      const targetFeatures = TIER_FEATURES[request.targetTier];

      // Check storage limits
      if (targetFeatures.storageGB < currentFeatures.storageGB) {
        if (!request.userConfirmed) {
          throw new Error(
            'Downgrade requires user confirmation due to storage limit reduction'
          );
        }
      }

      // Warn about losing global pattern access
      if (currentFeatures.globalPatternAccess && !targetFeatures.globalPatternAccess) {
        if (!request.userConfirmed) {
          throw new Error(
            'Downgrade will revoke access to global pattern library. User confirmation required.'
          );
        }
      }
    }

    // Update tier
    const oldTier = config.tier;
    config.tier = request.targetTier;

    // Update consent (revoke if moving away from Shared)
    if (request.targetTier !== SubscriptionTier.SHARED && config.consent) {
      config.consent.granted = false;
      config.consent.timestamp = new Date();
    }

    // Add to history
    config.tierHistory.push({
      tier: request.targetTier,
      changedAt: request.effectiveDate,
      reason: request.reason,
    });

    // Update billing
    config.billing.nextBillingDate = this.calculateNextBillingDate(request.effectiveDate);

    this.emit('tier:changed', {
      userId: request.userId,
      oldTier,
      newTier: request.targetTier,
      reason: request.reason,
    });

    return config;
  }

  /**
   * Update consent for pattern contribution
   */
  async updateConsent(
    userId: string,
    consent: PatternContributionConsent
  ): Promise<void> {
    const config = this.userConfigs.get(userId);
    if (!config) {
      throw new Error(`User not found: ${userId}`);
    }

    // Only Shared tier can have consent
    if (config.tier !== SubscriptionTier.SHARED) {
      throw new Error('Only Shared tier users can contribute patterns');
    }

    // Validate consent version
    if (consent.consentVersion !== this.consentVersion) {
      throw new Error(
        `Consent version mismatch. Expected ${this.consentVersion}, got ${consent.consentVersion}`
      );
    }

    const oldConsent = config.consent;
    config.consent = consent;

    this.emit('consent:updated', {
      userId,
      oldConsent,
      newConsent: consent,
      timestamp: consent.timestamp,
    });
  }

  /**
   * Revoke consent (withdraw from pattern contribution)
   */
  async revokeConsent(userId: string, ipAddress: string): Promise<void> {
    const config = this.userConfigs.get(userId);
    if (!config || !config.consent) {
      throw new Error(`User not found or no consent to revoke: ${userId}`);
    }

    config.consent.granted = false;
    config.consent.timestamp = new Date();
    config.consent.ipAddress = ipAddress;

    this.emit('consent:revoked', {
      userId,
      timestamp: new Date(),
    });
  }

  /**
   * Get tier features for user
   */
  getFeatures(userId: string): TierFeatures | undefined {
    const config = this.userConfigs.get(userId);
    if (!config) return undefined;

    return TIER_FEATURES[config.tier];
  }

  /**
   * Get billing summary
   */
  getBillingSummary(userId: string): {
    tier: SubscriptionTier;
    monthlyPrice: number;
    nextBillingDate?: Date;
    status: string;
  } | undefined {
    const config = this.userConfigs.get(userId);
    if (!config) return undefined;

    const features = TIER_FEATURES[config.tier];

    return {
      tier: config.tier,
      monthlyPrice: features.price,
      nextBillingDate: config.billing.nextBillingDate,
      status: config.billing.status,
    };
  }

  /**
   * Export user configuration for GDPR data portability
   */
  exportUserData(userId: string): UserTierConfig | undefined {
    return this.userConfigs.get(userId);
  }

  /**
   * Delete user (GDPR right to erasure)
   */
  async deleteUser(userId: string): Promise<void> {
    const config = this.userConfigs.get(userId);
    if (!config) {
      throw new Error(`User not found: ${userId}`);
    }

    this.userConfigs.delete(userId);

    this.emit('user:deleted', {
      userId,
      deletedAt: new Date(),
    });
  }

  /**
   * Get statistics for acquisition metrics
   */
  getStatistics(): {
    totalUsers: number;
    byTier: Record<SubscriptionTier, number>;
    contributingUsers: number;
    monthlyRecurringRevenue: number;
  } {
    const byTier: Record<SubscriptionTier, number> = {
      [SubscriptionTier.SHARED]: 0,
      [SubscriptionTier.PRIVATE]: 0,
      [SubscriptionTier.ENTERPRISE]: 0,
    };

    let contributingUsers = 0;
    let monthlyRecurringRevenue = 0;

    for (const config of this.userConfigs.values()) {
      byTier[config.tier]++;

      if (this.canContributePatterns(config.userId)) {
        contributingUsers++;
      }

      const features = TIER_FEATURES[config.tier];
      monthlyRecurringRevenue += features.price;
    }

    return {
      totalUsers: this.userConfigs.size,
      byTier,
      contributingUsers,
      monthlyRecurringRevenue,
    };
  }

  // ========== PRIVATE HELPERS ==========

  private calculateNextBillingDate(start: Date): Date {
    const next = new Date(start);
    next.setMonth(next.getMonth() + 1);
    return next;
  }
}

// ========== CONSENT TEMPLATES ==========

/**
 * Generate consent form text (for UI)
 */
export function generateConsentText(tier: SubscriptionTier): string {
  if (tier !== SubscriptionTier.SHARED) {
    return `As a ${tier} tier subscriber, your data remains fully isolated and is not contributed to any shared pattern library.`;
  }

  return `
## Pattern Contribution Consent

By subscribing to Cadans Shared (€49/mo), you agree to contribute **anonymized workflow patterns** to our collective intelligence pool. This helps improve AI performance for all users.

### What We Collect
- ✅ **Anonymized patterns:** Strategies, workflows, success rates
- ✅ **Aggregated metrics:** Industry benchmarks, timing patterns
- ❌ **Never:** Names, emails, client data, financial details

### How We Anonymize
1. All personal identifiable information (PII) is removed
2. Patterns are aggregated with at least 5 other similar users (k-anonymity)
3. Statistical noise is added to prevent re-identification (differential privacy)
4. Transformations are irreversible (cannot reconstruct original data)

### Your Rights
- **Access:** View what patterns have been contributed
- **Withdraw:** Switch to Private tier at any time (€99/mo)
- **Delete:** Delete your account and all associated patterns
- **Portability:** Export your data in JSON format

### Granular Consent
You can choose which types of patterns to contribute:

- [ ] Recruiting patterns (candidate sourcing, screening workflows)
- [ ] Contract patterns (negotiation tactics, payment terms)
- [ ] Invoicing patterns (payment follow-up, late payment handling)
- [ ] General workflow patterns (task automation, scheduling)

### Legal Basis
This consent is based on GDPR Article 6(1)(a) - Explicit Consent. You can withdraw at any time without affecting the lawfulness of processing based on consent before its withdrawal.

### Questions?
Contact our Data Protection Officer: dpo@cadans.nl

---

**I understand and agree to contribute anonymized patterns to improve Cadans AI for all users.**

Consent Version: 1.0
Date: ${new Date().toISOString().split('T')[0]}
  `.trim();
}

// ========== EXAMPLE USAGE ==========

if (require.main === module) {
  async function example() {
    const tierManager = new TierManager();

    // Create Shared tier user with consent
    const sharedUser = await tierManager.createUser(
      'user_001',
      SubscriptionTier.SHARED,
      {
        granted: true,
        timestamp: new Date(),
        ipAddress: '192.168.1.1',
        options: {
          recruiting: true,
          contracts: true,
          invoicing: true,
          workflows: true,
        },
        consentVersion: '1.0',
      }
    );

    console.log('✅ Created Shared tier user:', sharedUser.userId);
    console.log('   Can contribute patterns?', tierManager.canContributePatterns('user_001'));
    console.log('   Can access global patterns?', tierManager.canAccessGlobalPatterns('user_001'));

    // Create Private tier user (no consent)
    const privateUser = await tierManager.createUser('user_002', SubscriptionTier.PRIVATE);

    console.log('\n✅ Created Private tier user:', privateUser.userId);
    console.log('   Can contribute patterns?', tierManager.canContributePatterns('user_002'));
    console.log('   Can access global patterns?', tierManager.canAccessGlobalPatterns('user_002'));

    // Downgrade from Shared to Private (revokes consent)
    await tierManager.changeTier({
      userId: 'user_001',
      targetTier: SubscriptionTier.PRIVATE,
      reason: 'downgrade',
      effectiveDate: new Date(),
      userConfirmed: true,
    });

    console.log('\n✅ Downgraded user_001 to Private');
    console.log('   Can contribute patterns?', tierManager.canContributePatterns('user_001'));

    // Statistics
    const stats = tierManager.getStatistics();
    console.log('\n📊 Statistics:');
    console.log('   Total users:', stats.totalUsers);
    console.log('   Shared tier:', stats.byTier.shared);
    console.log('   Private tier:', stats.byTier.private);
    console.log('   Contributing users:', stats.contributingUsers);
    console.log('   MRR: €' + stats.monthlyRecurringRevenue);
  }

  example().catch(console.error);
}

export default TierManager;
