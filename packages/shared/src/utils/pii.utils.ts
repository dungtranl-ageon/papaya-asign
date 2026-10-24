/**
 * PII Masking & Data Privacy Utilities (Decree 13/2023/ND-CP)
 */

export function maskNationalId(id: string | null | undefined): string {
  if (!id) return '';
  const cleanId = id.trim();
  if (cleanId.length === 12) {
    return `${cleanId.slice(0, 3)}*****${cleanId.slice(8)}`;
  }
  if (cleanId.length === 9) {
    return `${cleanId.slice(0, 3)}***${cleanId.slice(6)}`;
  }
  if (cleanId.length > 6) {
    return `${cleanId.slice(0, 2)}***${cleanId.slice(-2)}`;
  }
  return cleanId;
}

export function maskPhoneNumber(phone: string | null | undefined): string {
  if (!phone) return '';
  const cleanPhone = phone.trim().replace(/\s+/g, '');
  if (cleanPhone.length >= 10) {
    return `${cleanPhone.slice(0, 3)}****${cleanPhone.slice(-3)}`;
  }
  return cleanPhone;
}

export function maskEmail(email: string | null | undefined): string {
  if (!email) return '';
  const parts = email.trim().split('@');
  if (parts.length !== 2 || !parts[0] || !parts[1]) return email;
  const user = parts[0];
  const domain = parts[1];
  if (user.length <= 2) {
    return `${user[0]}*@${domain}`;
  }
  return `${user[0]}${'*'.repeat(Math.min(user.length - 2, 8))}${user[user.length - 1]}@${domain}`;
}

/**
 * Masks patient / customer full name for PII protection.
 * Example: "Nguyen Van A" -> "N**** A"
 *          "Trần Thị Bích" -> "T*** Bích"
 */
export function maskPatientName(name: string | null | undefined): string {
  if (!name) return '';
  const trimmed = name.trim();
  const parts = trimmed.split(/\s+/);
  if (parts.length === 1) {
    const single = parts[0]!;
    if (single.length <= 2) return `${single[0]}*`;
    return `${single[0]}${'*'.repeat(Math.max(single.length - 2, 3))}${single[single.length - 1]}`;
  }
  const firstName = parts[0]!;
  const lastName = parts[parts.length - 1]!;
  return `${firstName[0]}${'*'.repeat(Math.max(firstName.length - 1, 3))} ${lastName}`;
}

export function sanitizePiiFromText(text: string, knownPatientName?: string): string {
  if (!text) return text;
  let sanitized = text;

  // Mask 12-digit CCCD
  sanitized = sanitized.replace(/\b(\d{3})\d{5}(\d{4})\b/g, '$1*****$2');

  // Mask 9-digit CMND
  sanitized = sanitized.replace(/\b(\d{3})\d{3}(\d{3})\b/g, '$1***$2');

  // Mask 10-digit phone
  sanitized = sanitized.replace(/\b(0\d{2})\d{4}(\d{3})\b/g, '$1****$2');

  // Mask email
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
