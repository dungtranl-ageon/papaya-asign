/**
 * Guardrail: Jargon Filter & Sanitizer
 *
 * Ensures that all outputs communicated to end-users (Claims Assessors)
 * are strictly in professional insurance & healthcare domain terminology.
 * Completely strips or replaces internal technical framework jargon
 * (e.g. Mastra, Vercel AI SDK, NestJS, Prisma, SSE, Zod, LLM Gateway, etc.).
 */

export interface JargonFilterRule {
  pattern: RegExp;
  replacement: string;
}

export const INTERNAL_JARGON_RULES: JargonFilterRule[] = [
  { pattern: /\bMastra\s+Workflow\b/gi, replacement: 'Quy trình thẩm định tự động' },
  { pattern: /\bMastra\s+Agent\b/gi, replacement: 'Trợ lý thẩm định chuyên sâu' },
  { pattern: /\bMastra\s+Copilot\b/gi, replacement: 'Trợ lý thẩm định' },
  { pattern: /\bMastra\b/gi, replacement: 'Hệ thống thẩm định Papaya' },
  { pattern: /\bVercel\s+AI\s+SDK\b/gi, replacement: 'Cổng tương tác trực tuyến' },
  { pattern: /\bNestJS\b/gi, replacement: 'Hệ thống máy chủ' },
  { pattern: /\bPrisma\b/gi, replacement: 'Cơ sở dữ liệu nghiệp vụ' },
  { pattern: /\bSQLite\b/gi, replacement: 'Kho lưu trữ cục bộ' },
  { pattern: /\bPostgreSQL\b/gi, replacement: 'Kho dữ liệu tập trung' },
  { pattern: /\bLLM\s+Gateway\b/gi, replacement: 'Bộ xử lý ngôn ngữ' },
  { pattern: /\bLLM\b/gi, replacement: 'Trí tuệ nhân tạo' },
  { pattern: /\bServer-Sent\s+Events\b/gi, replacement: 'Dòng dữ liệu tức thì' },
  { pattern: /\bSSE\b/gi, replacement: 'Luồng dữ liệu thời gian thực' },
  { pattern: /\bZod\s+Schema\b/gi, replacement: 'Quy chuẩn dữ liệu' },
  { pattern: /\bZod\b/gi, replacement: 'Chuẩn kiểm tra' },
  { pattern: /\bStdio\s+MCP\b/gi, replacement: 'Giao diện công cụ' },
  { pattern: /\bMCP\s+Server\b/gi, replacement: 'Cụm công cụ thẩm định' },
  { pattern: /\bMCP\s+Tools\b/gi, replacement: 'Bộ công cụ nghiệp vụ' },
  { pattern: /\bMCP\b/gi, replacement: 'Công cụ nghiệp vụ' },
  { pattern: /\bendpoint\b/gi, replacement: 'cổng giao tiếp' },
  { pattern: /\bJSON-RPC\b/gi, replacement: 'giao thức kết nối' },
];

/**
 * Sanitizes any text string by stripping or transforming internal tech jargon
 */
export function sanitizeUserFacingText(text: string): string {
  if (!text) return text;
  let sanitized = text;

  for (const rule of INTERNAL_JARGON_RULES) {
    sanitized = sanitized.replace(rule.pattern, rule.replacement);
  }

  return sanitized;
}

/**
 * Validates whether a text contains unauthorized internal technical jargon.
 * Returns true if clean, false if jargon detected.
 */
export function validateNoInternalJargon(text: string): {
  isClean: boolean;
  violations: string[];
} {
  const violations: string[] = [];

  for (const rule of INTERNAL_JARGON_RULES) {
    if (rule.pattern.test(text)) {
      violations.push(rule.pattern.source);
    }
  }

  return {
    isClean: violations.length === 0,
    violations,
  };
}
