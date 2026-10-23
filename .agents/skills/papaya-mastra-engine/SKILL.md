---
name: papaya-mastra-engine
description: >-
  Use this skill to design, orchestrate, and test the Mastra Hybrid Engine in NestJS:
  executing the strict 4-step assessment workflow and managing the conversational
  Assessor Copilot agent with OpenAI-compatible endpoints.
---

# Papaya Mastra Engine Skill

Skill này hướng dẫn quy chuẩn triển khai và điều phối mô hình **Hybrid AI Engine** bằng **Mastra Core (`@mastra/core`)** bên trong backend NestJS (`apps/api`).

---

## 1. Kiến Trúc Luồng Hybrid

Mastra được tổ chức thành 2 module chuyên trách:

1. **Mastra Assessment Workflow (Bắt buộc Tuần tự — 100% Deterministic):**
   - Định nghĩa bằng `createWorkflow()` trong Mastra.
   - Chạy graph 4 bước tuần tự không thể nhảy cóc:
     $$\text{Step 1 (verifyDocument)} \rightarrow \text{Step 2 (lookupPolicy)} \rightarrow \text{Step 3 (checkNecessity)} \rightarrow \text{Step 4 (calculateBenefit)}$$
   - Bước 5 tổng hợp báo cáo bằng LLM theo cấu trúc `AssessmentReport` Zod Schema.
2. **Mastra Conversational Copilot Agent:**
   - Khởi tạo bằng `new Agent()`.
   - Nhận context báo cáo từ Workflow để hỗ trợ Assessor chat hỏi đáp, trích dẫn chi tiết các điều khoản hợp đồng hoặc tiếp nhận chỉ thị ghi đè.

---

## 2. Cấu Hình OpenAI-Compatible Endpoint

Để hỗ trợ linh hoạt Ollama Cloud, local Ollama hoặc OpenRouter, cấu hình model trong Mastra phải đọc qua biến môi trường:

```typescript
import { Mastra } from '@mastra/core';
import { createOpenAI } from '@ai-sdk/openai';

const customProvider = createOpenAI({
  baseURL: process.env.OPENAI_BASE_URL || 'http://localhost:11434/v1',
  apiKey: process.env.OPENAI_API_KEY || 'ollama',
});

export const mastraModel = customProvider(process.env.MODEL_NAME || 'llama3.3');
```

---

## 3. Xuất Luồng Dữ Liệu Server-Sent Events (SSE)

NestJS Controller phải chuyển đổi (adapter) trạng thái của Mastra Workflow sang SSE stream:

- `event: step-start` -> Báo hiệu bắt đầu bước (VD: Đang verify chứng từ).
- `event: tool-result` -> Trả về dữ liệu chi tiết của tool.
- `event: report-complete` -> Trả về JSON báo cáo thẩm định cuối cùng.
