/**
 * Guardrail: PII (Personally Identifiable Information) Masker & Sanitizer
 *
 * Implements strict data anonymization compliant with Vietnam Decree 13/2023/ND-CP
 * and Papaya Data Deletion & Privacy Policy.
 *
 * Guarantees that sensitive national IDs (CCCD/CMND), phone numbers, customer names,
 * and private contact details are redacted or masked before transmission to external LLMs
 * or displayed on unprivileged UI views.
 */

export { maskNationalId, maskPhoneNumber, maskEmail, maskPatientName } from '@papaya/shared';

import { maskPatientName } from '@papaya/shared';

/**
 * Sanitizes any text string by searching for and redacting unmasked PII
 * (12-digit CCCD, 10-digit phone numbers, emails, and patient full name).
 */
export function sanitizePiiFromPrompt(text: string, knownPatientName?: string): string {
  if (!text) return text;

  let sanitized = text;

  // Mask 12-digit CCCD: e.g. 079198001234 -> 079*****1234
  sanitized = sanitized.replace(/\b(\d{3})\d{5}(\d{4})\b/g, '$1*****$2');

  // Mask 9-digit CMND: e.g. 025123456 -> 025***456
  sanitized = sanitized.replace(/\b(\d{3})\d{3}(\d{3})\b/g, '$1***$2');

  // Mask 10-digit Vietnamese phone numbers starting with 0: e.g. 0901234567 -> 090****567
  sanitized = sanitized.replace(/\b(0\d{2})\d{4}(\d{3})\b/g, '$1****$2');

  // Mask emails: e.g. assessor@papaya.insure -> a******r@papaya.insure
  sanitized = sanitized.replace(
    /\b([A-Za-z0-9._%+-])[A-Za-z0-9._%+-]+([A-Za-z0-9])@([A-Za-z0-9.-]+\.[A-Za-z]{2,})\b/g,
    '$1****$2@$3',
  );

  // Mask known patient name if provided
  if (knownPatientName && knownPatientName.trim().length > 2) {
    const escaped = knownPatientName.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(`\\b${escaped}\\b`, 'gi');
    sanitized = sanitized.replace(regex, maskPatientName(knownPatientName));
  }

  return sanitized;
}

/**
 * Scans text and reports any unmasked PII violations.
 */
export function detectPiiViolations(
  text: string,
  knownPatientName?: string,
): {
  hasPii: boolean;
  violations: string[];
} {
  const violations: string[] = [];

  // Check for raw 12-digit national IDs
  const cccdMatches = text.match(/\b\d{12}\b/g);
  if (cccdMatches) {
    violations.push(`Unmasked 12-digit National ID detected (${cccdMatches.length} occurrence(s))`);
  }

  // Check for raw 10-digit phone numbers starting with 03, 05, 07, 08, 09
  const phoneMatches = text.match(/\b0(3|5|7|8|9)\d{8}\b/g);
  if (phoneMatches) {
    violations.push(`Unmasked phone number detected (${phoneMatches.length} occurrence(s))`);
  }

  // Check for raw emails
  const emailMatches = text.match(/\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}\b/g);
  if (emailMatches) {
    violations.push(`Unmasked email address detected (${emailMatches.length} occurrence(s))`);
  }

  // Check for raw patient name if provided
  if (knownPatientName && knownPatientName.trim().length > 2) {
    const escaped = knownPatientName.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(`\\b${escaped}\\b`, 'i');
    if (regex.test(text)) {
      violations.push(`Unmasked patient full name detected: "${knownPatientName}"`);
    }
  }

  return {
    hasPii: violations.length > 0,
    violations,
  };
}
