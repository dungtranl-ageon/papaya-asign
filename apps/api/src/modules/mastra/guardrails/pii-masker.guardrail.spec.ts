import { describe, it, expect } from 'vitest';
import {
  maskNationalId,
  maskPhoneNumber,
  maskEmail,
  maskPatientName,
  sanitizePiiFromPrompt,
  detectPiiViolations,
} from './pii-masker.guardrail';

describe('PII Masker Guardrail', () => {
  describe('maskNationalId', () => {
    it('should mask 12-digit Vietnamese CCCD leaving first 3 and last 4 digits', () => {
      expect(maskNationalId('079198001234')).toBe('079*****1234');
      expect(maskNationalId('001099005544')).toBe('001*****5544');
    });

    it('should mask 9-digit CMND leaving first 3 and last 3 digits', () => {
      expect(maskNationalId('025123456')).toBe('025***456');
    });

    it('should handle null, undefined, or empty strings safely', () => {
      expect(maskNationalId('')).toBe('');
      expect(maskNationalId(null)).toBe('');
      expect(maskNationalId(undefined)).toBe('');
    });
  });

  describe('maskPatientName', () => {
    it('should mask Vietnamese and English names correctly', () => {
      expect(maskPatientName('Nguyen Van A')).toBe('N***** A');
      expect(maskPatientName('Trần Thị B')).toBe('T*** B');
      expect(maskPatientName('John Doe')).toBe('J*** Doe');
    });

    it('should handle single word names', () => {
      expect(maskPatientName('Nguyen')).toBe('N****n');
      expect(maskPatientName('An')).toBe('A*');
    });

    it('should handle empty or null values', () => {
      expect(maskPatientName('')).toBe('');
      expect(maskPatientName(null)).toBe('');
      expect(maskPatientName(undefined)).toBe('');
    });
  });

  describe('maskPhoneNumber', () => {
    it('should mask 10-digit phone numbers leaving first 3 and last 3 digits', () => {
      expect(maskPhoneNumber('0901234567')).toBe('090****567');
      expect(maskPhoneNumber('0987654321')).toBe('098****321');
    });

    it('should handle empty or null phone numbers', () => {
      expect(maskPhoneNumber('')).toBe('');
      expect(maskPhoneNumber(null)).toBe('');
    });
  });

  describe('maskEmail', () => {
    it('should mask username portion of email addresses', () => {
      expect(maskEmail('nguyenvana@gmail.com')).toBe('n********a@gmail.com');
      expect(maskEmail('ab@test.com')).toBe('a*@test.com');
    });
  });

  describe('sanitizePiiFromPrompt', () => {
    it('should redact CCCD, phone numbers, emails, and patient names embedded in long prompt text', () => {
      const rawPrompt = `
        Bệnh nhân Nguyen Van A, số CCCD 079198001234, số điện thoại 0901234567.
        Email liên hệ: patient.test@gmail.com.
        Khám tại BV Chợ Rẫy, chẩn đoán Viêm ruột thừa cấp.
      `;

      const sanitized = sanitizePiiFromPrompt(rawPrompt, 'Nguyen Van A');

      expect(sanitized).not.toContain('079198001234');
      expect(sanitized).toContain('079*****1234');

      expect(sanitized).not.toContain('0901234567');
      expect(sanitized).toContain('090****567');

      expect(sanitized).not.toContain('patient.test@gmail.com');
      expect(sanitized).not.toContain('Nguyen Van A');
      expect(sanitized).toContain('N***** A');
      expect(sanitized).toContain('Chợ Rẫy');
      expect(sanitized).toContain('Viêm ruột thừa cấp');
    });
  });

  describe('detectPiiViolations', () => {
    it('should detect unmasked CCCD and phone numbers and patient names', () => {
      const textWithPii = 'Hồ sơ Nguyen Van A có CCCD: 079198001234 và SĐT 0912345678';
      const result = detectPiiViolations(textWithPii, 'Nguyen Van A');

      expect(result.hasPii).toBe(true);
      expect(result.violations.length).toBe(3);
    });

    it('should return clean when text has already been masked', () => {
      const maskedText = 'Hồ sơ N***** A có CCCD: 079*****1234 và SĐT 091****678';
      const result = detectPiiViolations(maskedText, 'Nguyen Van A');

      expect(result.hasPii).toBe(false);
      expect(result.violations.length).toBe(0);
    });
  });
});
