/**
 * PII Detection and Anonymization for Dutch Market
 *
 * Detects and anonymizes personally identifiable information (PII) from
 * recruiting and freelance data, with specific support for Dutch patterns.
 *
 * @module data-monetization/anonymization/pii-detector
 */

import crypto from 'crypto';
import { faker } from '@faker-js/faker';

// Set Dutch locale for Faker
faker.locale = 'nl';

// ========== TYPES ==========

/**
 * Types of PII that can be detected
 */
export enum PIIType {
  NAME = 'name',
  EMAIL = 'email',
  PHONE = 'phone',
  ADDRESS = 'address',
  POSTCODE = 'postcode',
  BIRTHDATE = 'birthdate',
  BSN = 'bsn', // Dutch social security number
  IBAN = 'iban',
  LINKEDIN = 'linkedin',
  COMPANY_NAME = 'company_name',
  IP_ADDRESS = 'ip_address',
  URL = 'url',
}

/**
 * Anonymization method
 */
export enum AnonymizationMethod {
  /** Replace with synthetic data (Faker.js) */
  SYNTHETIC = 'synthetic',

  /** Hash with SHA-256 (consistent but irreversible) */
  HASH = 'hash',

  /** Remove entirely */
  REDACT = 'redact',

  /** Generalize (e.g., "Amsterdam" → "Noord-Holland") */
  GENERALIZE = 'generalize',

  /** Mask partially (e.g., "+31612345678" → "+3161234****") */
  MASK = 'mask',
}

/**
 * Detected PII instance
 */
export interface DetectedPII {
  /** Type of PII */
  type: PIIType;

  /** Original value */
  value: string;

  /** Replacement value */
  replacement: string;

  /** Method used for anonymization */
  method: AnonymizationMethod;

  /** Position in text (start index) */
  position: number;

  /** Confidence (0-1) */
  confidence: number;
}

/**
 * Anonymization result
 */
export interface AnonymizationResult {
  /** Original text */
  original: string;

  /** Anonymized text */
  anonymized: string;

  /** All detected PII instances */
  piiDetected: DetectedPII[];

  /** Is reversible? (MUST BE FALSE for GDPR compliance) */
  reversible: boolean;

  /** Overall confidence (0-1) */
  confidence: number;

  /** Processing time in ms */
  processingTimeMs: number;
}

/**
 * Audit log entry for GDPR compliance
 */
export interface AnonymizationAuditLog {
  timestamp: Date;
  originalFieldTypes: PIIType[];
  anonymizedFieldTypes: PIIType[];
  transformationMethod: string;
  reversible: boolean;
  piiDetectedCount: number;
  piiAnonymizedCount: number;
  userId?: string;
  documentId?: string;
}

// ========== REGEX PATTERNS ==========

/**
 * Dutch-specific regex patterns for PII detection
 */
const PATTERNS = {
  // Dutch email pattern
  EMAIL: /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g,

  // Dutch phone numbers (+31, 06, 0031, etc.)
  PHONE: /(?:\+31|0031|0)(?:\s*\(?0?\)?\s*)?[1-9](?:[\s-]?\d){8}\b/g,

  // Dutch postcode (1234AB format)
  POSTCODE: /\b\d{4}\s?[A-Z]{2}\b/g,

  // Dutch BSN (social security number, 9 digits)
  BSN: /\b\d{9}\b/g,

  // IBAN (NL format)
  IBAN: /\bNL\d{2}[A-Z]{4}\d{10}\b/g,

  // LinkedIn URL
  LINKEDIN: /(?:https?:\/\/)?(?:www\.)?linkedin\.com\/in\/[\w-]+\/?/gi,

  // Generic URL
  URL: /https?:\/\/(?:www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b(?:[-a-zA-Z0-9()@:%_\+.~#?&\/=]*)/gi,

  // IP Address
  IP: /\b(?:[0-9]{1,3}\.){3}[0-9]{1,3}\b/g,

  // Birthdate patterns (DD-MM-YYYY, DD/MM/YYYY, etc.)
  BIRTHDATE: /\b(?:0?[1-9]|[12][0-9]|3[01])[-\/.](?:0?[1-9]|1[0-2])[-\/.](?:19|20)\d{2}\b/g,
};

/**
 * Common Dutch first names (for name detection)
 */
const DUTCH_FIRST_NAMES = new Set([
  'jan', 'peter', 'anna', 'maria', 'linda', 'thomas', 'lars', 'lisa',
  'emma', 'sophie', 'david', 'mark', 'jessica', 'laura', 'tim', 'bas',
  'daan', 'finn', 'lotte', 'eva', 'noah', 'luuk', 'julia', 'sara',
  'thijs', 'sem', 'bram', 'max', 'milan', 'lucas', 'sanne', 'isa',
]);

/**
 * Common Dutch last name patterns
 */
const DUTCH_LAST_NAME_PATTERNS = [
  /\bvan\s+\w+/gi,  // van den Berg, van der Meer
  /\bde\s+\w+/gi,   // de Vries, de Boer
  /\bvan de\s+\w+/gi, // van de Pol
];

// ========== PII DETECTOR CLASS ==========

export class PIIDetector {
  /**
   * Detect all PII in text
   */
  detect(text: string): DetectedPII[] {
    const detected: DetectedPII[] = [];

    // Email
    for (const match of text.matchAll(PATTERNS.EMAIL)) {
      detected.push({
        type: PIIType.EMAIL,
        value: match[0],
        replacement: this.hashEmail(match[0]),
        method: AnonymizationMethod.HASH,
        position: match.index!,
        confidence: 1.0,
      });
    }

    // Phone
    for (const match of text.matchAll(PATTERNS.PHONE)) {
      detected.push({
        type: PIIType.PHONE,
        value: match[0],
        replacement: this.maskPhone(match[0]),
        method: AnonymizationMethod.MASK,
        position: match.index!,
        confidence: 0.95,
      });
    }

    // Dutch postcode
    for (const match of text.matchAll(PATTERNS.POSTCODE)) {
      detected.push({
        type: PIIType.POSTCODE,
        value: match[0],
        replacement: faker.address.zipCode(),
        method: AnonymizationMethod.SYNTHETIC,
        position: match.index!,
        confidence: 0.98,
      });
    }

    // BSN (with 11-check validation)
    for (const match of text.matchAll(PATTERNS.BSN)) {
      if (this.isValidBSN(match[0])) {
        detected.push({
          type: PIIType.BSN,
          value: match[0],
          replacement: '[REDACTED_BSN]',
          method: AnonymizationMethod.REDACT,
          position: match.index!,
          confidence: 1.0,
        });
      }
    }

    // IBAN
    for (const match of text.matchAll(PATTERNS.IBAN)) {
      detected.push({
        type: PIIType.IBAN,
        value: match[0],
        replacement: '[REDACTED_IBAN]',
        method: AnonymizationMethod.REDACT,
        position: match.index!,
        confidence: 1.0,
      });
    }

    // LinkedIn URL
    for (const match of text.matchAll(PATTERNS.LINKEDIN)) {
      detected.push({
        type: PIIType.LINKEDIN,
        value: match[0],
        replacement: this.hashURL(match[0]),
        method: AnonymizationMethod.HASH,
        position: match.index!,
        confidence: 1.0,
      });
    }

    // Generic URLs
    for (const match of text.matchAll(PATTERNS.URL)) {
      // Skip if already detected as LinkedIn
      if (!detected.some(d => d.value === match[0])) {
        detected.push({
          type: PIIType.URL,
          value: match[0],
          replacement: '[URL]',
          method: AnonymizationMethod.REDACT,
          position: match.index!,
          confidence: 0.9,
        });
      }
    }

    // IP addresses
    for (const match of text.matchAll(PATTERNS.IP)) {
      detected.push({
        type: PIIType.IP_ADDRESS,
        value: match[0],
        replacement: faker.internet.ip(),
        method: AnonymizationMethod.SYNTHETIC,
        position: match.index!,
        confidence: 0.85,
      });
    }

    // Birthdates
    for (const match of text.matchAll(PATTERNS.BIRTHDATE)) {
      detected.push({
        type: PIIType.BIRTHDATE,
        value: match[0],
        replacement: '[BIRTHDATE]',
        method: AnonymizationMethod.REDACT,
        position: match.index!,
        confidence: 0.9,
      });
    }

    // Dutch names (simple heuristic)
    const nameDetections = this.detectDutchNames(text);
    detected.push(...nameDetections);

    // Sort by position (descending) for proper replacement
    return detected.sort((a, b) => b.position - a.position);
  }

  /**
   * Anonymize text by replacing all detected PII
   */
  anonymize(text: string): AnonymizationResult {
    const startTime = Date.now();

    const piiDetected = this.detect(text);
    let anonymized = text;

    // Replace PII (from end to start to preserve indices)
    for (const pii of piiDetected) {
      anonymized =
        anonymized.substring(0, pii.position) +
        pii.replacement +
        anonymized.substring(pii.position + pii.value.length);
    }

    const processingTimeMs = Date.now() - startTime;

    return {
      original: text,
      anonymized,
      piiDetected,
      reversible: false, // CRITICAL: Always false for GDPR compliance
      confidence: piiDetected.length > 0
        ? piiDetected.reduce((sum, p) => sum + p.confidence, 0) / piiDetected.length
        : 1.0,
      processingTimeMs,
    };
  }

  /**
   * Create audit log for GDPR compliance
   */
  createAuditLog(
    result: AnonymizationResult,
    userId?: string,
    documentId?: string
  ): AnonymizationAuditLog {
    return {
      timestamp: new Date(),
      originalFieldTypes: result.piiDetected.map(p => p.type),
      anonymizedFieldTypes: result.piiDetected.map(p => p.type),
      transformationMethod: 'hash+synthetic+redact',
      reversible: false,
      piiDetectedCount: result.piiDetected.length,
      piiAnonymizedCount: result.piiDetected.length,
      userId,
      documentId,
    };
  }

  // ========== PRIVATE HELPERS ==========

  /**
   * Hash email (consistent but irreversible)
   */
  private hashEmail(email: string): string {
    const hash = crypto.createHash('sha256').update(email.toLowerCase()).digest('hex');
    return `user_${hash.substring(0, 8)}@anonymized.local`;
  }

  /**
   * Hash URL (consistent but irreversible)
   */
  private hashURL(url: string): string {
    const hash = crypto.createHash('sha256').update(url.toLowerCase()).digest('hex');
    return `[URL_${hash.substring(0, 8)}]`;
  }

  /**
   * Mask phone number (keep prefix, mask rest)
   */
  private maskPhone(phone: string): string {
    const digits = phone.replace(/\D/g, '');
    if (digits.length >= 10) {
      const prefix = digits.substring(0, 5);
      const masked = '*'.repeat(digits.length - 5);
      return `+${prefix}${masked}`;
    }
    return '[PHONE]';
  }

  /**
   * Validate Dutch BSN (11-check)
   */
  private isValidBSN(bsn: string): boolean {
    if (bsn.length !== 9) return false;

    const digits = bsn.split('').map(Number);
    const sum = digits.reduce((acc, digit, index) => {
      const multiplier = index === 8 ? -1 : 9 - index;
      return acc + digit * multiplier;
    }, 0);

    return sum % 11 === 0;
  }

  /**
   * Detect Dutch names (simple heuristic)
   */
  private detectDutchNames(text: string): DetectedPII[] {
    const detected: DetectedPII[] = [];
    const words = text.split(/\s+/);

    for (let i = 0; i < words.length - 1; i++) {
      const word1 = words[i].toLowerCase().replace(/[^a-z]/g, '');
      const word2 = words[i + 1].toLowerCase().replace(/[^a-z]/g, '');

      // Check if first name + last name
      if (DUTCH_FIRST_NAMES.has(word1) && word2.length > 2) {
        const fullName = `${words[i]} ${words[i + 1]}`;
        const position = text.indexOf(fullName);

        if (position !== -1) {
          detected.push({
            type: PIIType.NAME,
            value: fullName,
            replacement: faker.name.fullName(),
            method: AnonymizationMethod.SYNTHETIC,
            position,
            confidence: 0.7, // Lower confidence for heuristic detection
          });
        }
      }

      // Check for Dutch name patterns (van, de, etc.)
      for (const pattern of DUTCH_LAST_NAME_PATTERNS) {
        const match = text.substring(text.indexOf(words[i])).match(pattern);
        if (match) {
          detected.push({
            type: PIIType.NAME,
            value: match[0],
            replacement: faker.name.lastName(),
            method: AnonymizationMethod.SYNTHETIC,
            position: text.indexOf(match[0]),
            confidence: 0.75,
          });
        }
      }
    }

    return detected;
  }
}

// ========== CONVENIENCE FUNCTIONS ==========

/**
 * Quick anonymization function
 */
export function anonymizePII(text: string): AnonymizationResult {
  const detector = new PIIDetector();
  return detector.anonymize(text);
}

/**
 * Anonymize resume text
 */
export async function anonymizeResume(resumeText: string): Promise<AnonymizationResult> {
  const detector = new PIIDetector();
  const result = detector.anonymize(resumeText);

  // Additional resume-specific anonymization
  // (e.g., remove photos, signature images, etc.)

  return result;
}

/**
 * Anonymize candidate data
 */
export async function anonymizeCandidate(candidate: {
  name?: string;
  email?: string;
  phone?: string;
  address?: string;
  resume?: string;
  linkedin?: string;
}): Promise<Record<string, string>> {
  const detector = new PIIDetector();

  return {
    name: candidate.name ? detector.anonymize(candidate.name).anonymized : '',
    email: candidate.email ? detector.anonymize(candidate.email).anonymized : '',
    phone: candidate.phone ? detector.anonymize(candidate.phone).anonymized : '',
    address: candidate.address ? detector.anonymize(candidate.address).anonymized : '',
    resume: candidate.resume ? detector.anonymize(candidate.resume).anonymized : '',
    linkedin: candidate.linkedin ? detector.anonymize(candidate.linkedin).anonymized : '',
  };
}

// ========== EXAMPLE USAGE ==========

if (require.main === module) {
  async function example() {
    const testData = `
Jan de Vries
Email: jan.devries@example.nl
Phone: +31 6 12345678
Address: Kalverstraat 123, 1012 AB Amsterdam
BSN: 123456782
LinkedIn: https://linkedin.com/in/jan-de-vries
Born: 15-03-1990
    `.trim();

    console.log('🔍 Detecting PII in Dutch candidate data...\n');
    console.log('Original:', testData);
    console.log('\n' + '='.repeat(60) + '\n');

    const result = anonymizePII(testData);

    console.log('Anonymized:', result.anonymized);
    console.log('\n📊 Detection Summary:');
    console.log(`  - PII detected: ${result.piiDetected.length}`);
    console.log(`  - Confidence: ${(result.confidence * 100).toFixed(1)}%`);
    console.log(`  - Processing time: ${result.processingTimeMs}ms`);
    console.log(`  - Reversible: ${result.reversible} ✅`);

    console.log('\n🔎 Detected PII:');
    for (const pii of result.piiDetected) {
      console.log(`  - ${pii.type.toUpperCase()}: "${pii.value}" → "${pii.replacement}" (${pii.method})`);
    }

    // Audit log
    const detector = new PIIDetector();
    const auditLog = detector.createAuditLog(result, 'user_123', 'resume_456');
    console.log('\n📝 Audit Log:');
    console.log(JSON.stringify(auditLog, null, 2));
  }

  example().catch(console.error);
}

export default PIIDetector;
