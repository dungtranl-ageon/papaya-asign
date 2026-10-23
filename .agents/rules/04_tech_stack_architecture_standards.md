---
trigger: always_on
description: "Quy chuẩn kiến trúc công nghệ Monorepo, NestJS, Next.js, Mastra Engine, Dual-Export MCP và Vercel AI SDK"
---

# Chuẩn Mực Kiến Trúc Công Nghệ Dự Án (Tech Stack Architecture Standards)

Quy tắc này quy định các chuẩn mực kỹ thuật bắt buộc khi xây dựng mã nguồn cho dự án theo [docs/07_TECH_STACK_AND_IMPLEMENTATION_BLUEPRINT.md](file:///Users/tranquocdung/Projects/papaya-asign/docs/07_TECH_STACK_AND_IMPLEMENTATION_BLUEPRINT.md).

---

## 1. Cấu trúc Monorepo (pnpm workspace + Turborepo)

* **`apps/web` (Next.js 15+ App Router):**
  * Giao diện Workstation Copilot chia đôi màn hình (Dual-Pane).
  * Chat AI Core: **Vercel AI SDK (`ai/react`)** sử dụng hook `useChat`.
  * Styling: **TailwindCSS thuần túy + `lucide-react`** (Không cài đặt Shadcn CLI hay Ant Design cồng kềnh).
* **`apps/api` (NestJS 10+):**
  * Xương sống backend điều phối Mastra Engine, Prisma ORM, và Controllers.
  * Xuất dữ liệu qua giao thức **Server-Sent Events (SSE)** tương thích luồng AI SDK.
* **`packages/shared`:**
  * Thư viện chứa Zod Schemas và TypeScript interfaces dùng chung giữa Frontend và Backend.
* **`packages/mcp-server`:**
  * Thư viện chứa 4 tools nghiệp vụ cốt lõi: `verifyDocument`, `lookupPolicy`, `checkMedicalNecessity`, `calculateBenefit`.

---

## 2. Mô hình AI Agent Hybrid với Mastra Core

* **Pha 1 — Thẩm định Bắt buộc Đúng Luồng (Mastra Workflow):**
  * Bắt buộc dùng **Mastra Workflow** để chạy tuần tự 4 bước theo graph tất định (100% deterministic):
    $$\text{verifyDocument} \rightarrow \text{lookupPolicy} \rightarrow \text{checkMedicalNecessity} \rightarrow \text{calculateBenefit}$$
  * Nghiêm cấm để LLM nhảy cóc hoặc bỏ qua bước kiểm tra chứng từ và thời hạn hợp đồng.
* **Pha 2 — Đối thoại & Phản hồi Chuyên viên (Mastra Agent):**
  * Gắn kết quả báo cáo thẩm định vào Mastra Agent để hỗ trợ Assessor chat hỏi đáp, yêu cầu trích dẫn điều khoản hoặc ghi đè quyết định.

---

## 3. Kiến trúc Tool & MCP (Dual-Export Strategy)

* 4 Tools phải được viết dưới dạng pure functions bằng TypeScript với schema Zod chặt chẽ.
* **Cơ chế Dual-Export:**
  1. **Stdio MCP Server:** Chạy qua entrypoint CLI để Antigravity IDE (và các AI tools) kết nối trực tiếp qua [.agents/mcp_config.json](file:///Users/tranquocdung/Projects/papaya-asign/.agents/mcp_config.json).
  2. **Direct Import:** Tích hợp trực tiếp vào Mastra Workflow trong NestJS, không qua trung gian mạng.

---

## 4. LLM Provider & Lớp Cơ sở Dữ liệu

* **LLM Client:** Sử dụng endpoint **OpenAI-compatible** (cấu hình qua `.env` với `OPENAI_BASE_URL` và `OPENAI_API_KEY`) để hỗ trợ linh hoạt Ollama Cloud, local Ollama, OpenRouter hoặc standard OpenAI.
* **Prisma ORM:** Sử dụng schema Hybrid (Relational columns cho query + JSON fields cho cấu trúc quyền lợi và báo cáo). Mặc định chạy file SQLite cục bộ (`./data/papaya_claims.db`).
