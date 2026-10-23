---
name: papaya-mastra-engineer
description: >-
  Use this skill for designing, developing, operating, and evaluating autonomous AI agents
  and deterministic workflows using Mastra Core (@mastra/core) across the monorepo:
  enforcing strict 4-step assessment graphs, building conversational Assessor Copilots,
  managing prompt templates, MCP tool integration, RAG knowledge retrieval,
  and executing rigorous evaluators (Math conservation, Citation grounding, Confidence scoring).
---

# Papaya Mastra AI Engineer Skill

Skill này đóng vai trò là kim chỉ nam dành cho **Senior Mastra AI Engineer / Agentic Framework Architect**, chịu trách nhiệm toàn diện về thiết kế, phát triển, vận hành, kiểm soát chất lượng (QA/Evals) và rào chắn an toàn (Guardrails) của các AI Agents và Workflows trong hệ sinh thái Papaya Claims Copilot.

---

## 1. Trọng Trách & Triết Lý Kỹ Nghệ AI Agent (Mastra Mindset)

1. **Phân Tách Bạch Minh Giữa Workflow và Agent (Hybrid Determinism):**
   - **Mastra Workflow (100% Deterministic):** Quy trình nghiệp vụ mang tính pháp lý và tài chính (kiểm tra chứng từ, thời hạn hợp đồng, đối soát viện phí) **bắt buộc phải là đồ thị tất định tuần tự**. Nghiêm cấm tuyệt đối để LLM tự quyết định thứ tự thực thi các bước hoặc nhảy cóc khâu kiểm tra mộc đỏ.
   - **Mastra Agent (Conversational Copilot):** LLM chỉ được kích hoạt sau khi Workflow đã tạo ra báo cáo sơ bộ, đóng vai trò là trợ lý đàm thoại hỗ trợ chuyên viên bồi thường (Assessor) tra cứu điều khoản, giải trình quyết định và tiếp nhận can thiệp (Human-in-the-loop Override).
2. **Bảo Toàn Số Học & Không Bịa Đặt Điều Khoản (Zero Hallucination Policy):**
   - Mọi khoản tiền chi trả hoặc từ chối phải bảo toàn số học tuyệt đối:
     $$\text{totalRequested} \equiv \text{totalPayable} + \text{totalDeductions}$$
   - Mọi lý do từ chối chi trả bắt buộc phải trích dẫn trực tiếp mã điều khoản có thật trong hợp đồng bảo hiểm (`policy.exclusionsJson`). Tuyệt đối không suy diễn.
3. **Phù Hợp Tech Stack Doanh Nghiệp (NestJS + Next.js + Vercel AI SDK):**
   - Đóng gói Mastra dưới dạng NestJS Service có Dependency Injection chuẩn mực.
   - Xuất dữ liệu qua Server-Sent Events (SSE) tương thích hoàn hảo với hook `useChat` của `@ai-sdk/react`.

---

## 2. Kiến Trúc Agentic Chuẩn Mực Trong Mastra (`@mastra/core`)

Hệ thống được tổ chức theo chuẩn cấu trúc khung Agentic Frameworks:

```
apps/api/src/modules/mastra/
├── mastra.module.ts                 # NestJS Module đăng ký Mastra Engine
├── mastra.service.ts                # Service quản lý SSE Streaming & Agent Execution
├── mastra.workflow.ts               # Workflow Thẩm định tuần tự 4 bước (Deterministic)
└── (Mastra Registry)
    ├── Workflows: claimsAssessmentWorkflow
    ├── Agents   : assessorCopilotAgent
    ├── Tools    : 4 MCP Core Tools (verifyDocument, lookupPolicy, ...)
    ├── Scorers  : MathConservation, CitationGrounding, ConfidenceCalibrator
    └── Memory   : MastraMemory (Thread tracking theo Claim ID)
```

### 1. Đồ Thị Thẩm Định 4 Bước (Mastra Workflow Graph)

$$\text{Step 1: verifyDocument} \longrightarrow \text{Step 2: lookupPolicy} \longrightarrow \text{Step 3: checkNecessity} \longrightarrow \text{Step 4: calculateBenefit} \longrightarrow \text{Step 5: synthesizeReport}$$

- **Step 1 (`verifyDocument`):** Kiểm tra tính toàn vẹn tài liệu (mộc đỏ, giấy ra viện, hóa đơn VAT, bảng kê viện phí).
- **Step 2 (`lookupPolicy`):** Kiểm tra hiệu lực hợp đồng tại thời điểm nhập viện và danh mục loại trừ ICD-10.
- **Step 3 (`checkNecessity`):** Kiểm tra tính hợp lý y khoa (thời gian nằm viện so với phác đồ chuẩn Bộ Y tế).
- **Step 4 (`calculateBenefit`):** Động cơ toán học tính Copay, Deductible, Sublimit và số dư hạn mức năm.
- **Step 5 (`synthesizeReport`):** Tổng hợp `AssessmentReport` có cấu trúc theo Zod Schema và tính `confidenceScore`.

---

## 3. Cấu Hình Model Router & Gateway Tương Thích OpenAI

Mastra hỗ trợ chuyển đổi linh hoạt giữa các nhà cung cấp mô hình (Ollama Local, Ollama Cloud, OpenRouter, OpenAI, vLLM) thông qua biến môi trường trong [.env](file:///Users/tranquocdung/Projects/papaya-asign/.env):

```typescript
import { createOpenAI } from '@ai-sdk/openai';

const customProvider = createOpenAI({
  baseURL: process.env.OPENAI_BASE_URL || 'http://localhost:11434/v1',
  apiKey: process.env.OPENAI_API_KEY || 'ollama',
});

export const mastraModel = customProvider(process.env.MODEL_NAME || 'llama3.3');
```

---

## 4. Giao Thức Truyền Phát SSE Thời Gian Thực (Streaming Contract)

NestJS Controller chuyển đổi các bước tiến độ của Mastra Workflow thành luồng SSE thời gian thực gửi về Next.js Workstation:

```typescript
// Định dạng khung sự kiện SSE
subject.next({
  data: JSON.stringify({
    event: 'VERIFY_DOCUMENT_COMPLETE',
    timestamp: new Date().toISOString(),
    payload: docResult,
  }),
});
```

- **Next.js Dual-Pane UI:** Nhận các sự kiện này qua `@ai-sdk/react` để render tức thì các thẻ Generative UI Component (`BenefitCard`, `Timeline`, `CitationPill`).

---

## 5. Hệ Thống Đánh Giá & Rào Chắn Chất Lượng (Guardrails & Evals)

Mastra Engineer bắt buộc phải kiểm soát 4 tiêu chí đánh giá độc lập (Scorers):

1. **Math Conservation Scorer:**
   $$|\text{totalRequested} - (\text{totalPayable} + \text{totalDeductions})| < 0.01$$
2. **Policy Grounding Scorer:** Kiểm tra 100% điều khoản loại trừ trong báo cáo phải tồn tại trong cơ sở dữ liệu hợp đồng gốc.
3. **Medical Plausibility Scorer:** Đối chiếu số ngày lưu viện thực tế với khung ngày giường chuẩn của Bộ Y tế Việt Nam.
4. **Confidence Scoring Calibrator:**
   $$\text{ConfidenceScore} = 0.35 \times S_{\text{doc}} + 0.30 \times S_{\text{pol}} + 0.20 \times S_{\text{med}} + 0.15 \times S_{\text{calc}}$$

---

## 6. Bộ Tài Liệu Tham Chiếu & Scripts Đi Kèm

Skill cung cấp bộ tài liệu chuyên sâu và scripts kiểm thử tự động trong thư mục:

1. **[references/mastra-architecture-reference.md](file:///Users/tranquocdung/Projects/papaya-asign/.agents/skills/papaya-mastra-engineer/references/mastra-architecture-reference.md):** Cẩm nang kiến trúc Mastra Core, Workflows, Agents, Memory và MCP.
2. **[references/prompt-engineering-playbook.md](file:///Users/tranquocdung/Projects/papaya-asign/.agents/skills/papaya-mastra-engineer/references/prompt-engineering-playbook.md):** Sổ tay thiết kế System Prompts, Few-Shot và mẫu Persona Chuyên viên Thẩm định.
3. **[references/guardrails-and-evals-matrix.md](file:///Users/tranquocdung/Projects/papaya-asign/.agents/skills/papaya-mastra-engineer/references/guardrails-and-evals-matrix.md):** Ma trận rào chắn an toàn và công thức tính điểm của 4 Scorers.
4. **[references/sse-streaming-contract.md](file:///Users/tranquocdung/Projects/papaya-asign/.agents/skills/papaya-mastra-engineer/references/sse-streaming-contract.md):** Đặc tả giao thức luồng sự kiện SSE giữa NestJS và Next.js.
5. **[scripts/verify-workflow-graph.ts](file:///Users/tranquocdung/Projects/papaya-asign/.agents/skills/papaya-mastra-engineer/scripts/verify-workflow-graph.ts):** Script tự động chạy kiểm chứng tính tất định của đồ thị thẩm định.
6. **[scripts/test-agent-evals.ts](file:///Users/tranquocdung/Projects/papaya-asign/.agents/skills/papaya-mastra-engineer/scripts/test-agent-evals.ts):** Công cụ chạy đánh giá Scorers: bảo toàn số học, căn cứ pháp lý và độ trễ.

---

## 7. Checklist Tự Thẩm Định Của Mastra Engineer (Self-Review Checklist)

Trước khi nghiệm thu bất kỳ tính năng Agentic nào:

- [ ] **Tuân Thủ Thứ Tự Graph:** Workflow thực thi đúng thứ tự 4 bước, không bước nào bị nhảy cóc.
- [ ] **Bảo Toàn Số Học 100%:** Chạy `npx tsx .agents/skills/papaya-mastra-engineer/scripts/test-agent-evals.ts` đạt kết quả `Math Conservation: 100%`.
- [ ] **Không Bịa Đặt Điều Khoản:** Kết quả `Policy Grounding` đạt `100% Grounded`.
- [ ] **Khả Năng Chịu Lỗi Stream:** Đã cấu hình heartbeat ping và error boundary khi LLM gateway timeout.
- [ ] **Tương Thích Gateway Đa Dạng:** Model router nạp cấu hình sạch sẽ từ biến môi trường `OPENAI_BASE_URL` và `MODEL_NAME`.
