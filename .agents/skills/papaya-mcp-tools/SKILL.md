---
name: papaya-mcp-tools
description: >-
  Use this skill to develop, test, and run the 4 Papaya MCP tools (verifyDocument,
  lookupPolicy, checkMedicalNecessity, calculateBenefit) in packages/mcp-server with
  dual-export for Stdio MCP and Mastra direct integration.
---

# Papaya MCP Tools Skill

Skill này hướng dẫn quy chuẩn phát triển, kiểm thử và vận hành 4 công cụ nghiệp vụ cốt lõi theo chuẩn **Model Context Protocol (MCP)** trong `packages/mcp-server`.

---

## 1. Danh Mục 4 Tools & Ràng Buộc Hợp Đồng (Zod Contracts)

| Tool Name | Tham số Input (Zod) | Output Schema | Ràng buộc nghiệp vụ |
| :--- | :--- | :--- | :--- |
| **`verifyDocument`** | `{ documentId: string }` | `{ status: "VALID" \| "INCOMPLETE" \| "SUSPICIOUS", hasStamp: boolean, issues: string[] }` | Nếu thiếu chứng từ bắt buộc (VD: Giấy ra viện ca nội trú) -> trả về `INCOMPLETE`. |
| **`lookupPolicy`** | `{ policyId: string }` | `{ status: "ACTIVE" \| "LAPSED", annualLimit: number, copay: number, exclusions: Clause[] }` | Trả về danh sách điều khoản có `clauseId` rõ ràng để trích dẫn. |
| **`checkMedicalNecessity`**| `{ icd10: string, procedures: string[] }` | `{ isAppropriate: boolean, clinicalRationale: string, flaggedProcedures: string[] }` | Kiểm tra thủ thuật có phù hợp với chẩn đoán ICD-10 hay không. |
| **`calculateBenefit`** | `{ policyId: string, claimType: string, amount: number }` | `{ submittedAmount, coveredAmount, copayAmount, memberPays, remainingBalance }` | **Pure Math Engine**: Tính toán số học chính xác tuyệt đối, cấm LLM tự tính. |

---

## 2. Quy Chuẩn Dual-Export

Tất cả các tool trong `packages/mcp-server` bắt buộc phải hỗ trợ 2 hình thức xuất:
1. **Export 1 — Stdio MCP Server (`src/server.ts`):**
   * Cho phép Antigravity IDE kết nối trực tiếp qua file cấu hình [.agents/mcp_config.json](file:///Users/tranquocdung/Projects/papaya-asign/.agents/mcp_config.json).
2. **Export 2 — Direct TypeScript Functions / Mastra Tools (`src/index.ts`):**
   * Cho phép backend NestJS và Mastra Workflow import trực tiếp trong cùng tiến trình (In-process execution), triệt tiêu độ trễ mạng.

---

## 3. Lệnh Kiểm Thử Độc Lập

```bash
# Chạy Unit Tests kiểm chứng tính toán 4 tools
pnpm --filter @papaya/mcp-server test

# Chạy server MCP qua Stdio để test với MCP Inspector
pnpm --filter @papaya/mcp-server start:stdio
```
