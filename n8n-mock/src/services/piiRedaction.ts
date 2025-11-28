/**
 * PII Redaction Service
 * Removes SSN, phone numbers, and email addresses from text
 */

import { logger } from '../utils/logger';

/**
 * PII Redaction Patterns
 */
const PII_PATTERNS = [
  // SSN: XXX-XX-XXXX
  {
    pattern: /\b\d{3}-\d{2}-\d{4}\b/g,
    replacement: '[SSN REDACTED]',
    name: 'SSN',
  },
  // Phone: XXX-XXX-XXXX or (XXX) XXX-XXXX
  {
    pattern: /\b\d{3}-\d{3}-\d{4}\b|\b\(\d{3}\)\s?\d{3}-\d{4}\b/g,
    replacement: '[PHONE REDACTED]',
    name: 'Phone',
  },
  // Email addresses
  {
    pattern: /\b[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}\b/g,
    replacement: '[EMAIL REDACTED]',
    name: 'Email',
  },
];

/**
 * Redacts PII from text using regex patterns
 */
export function redactPII(text: string): string {
  let redactedText = text;
  let redactionCount = 0;

  for (const { pattern, replacement, name } of PII_PATTERNS) {
    const matches = redactedText.match(pattern);
    if (matches) {
      redactedText = redactedText.replace(pattern, replacement);
      redactionCount += matches.length;
      logger.debug(`Redacted ${matches.length} ${name} pattern(s)`);
    }
  }

  if (redactionCount > 0) {
    logger.info(`Total PII redactions: ${redactionCount}`);
  }

  return redactedText;
}

