---
name: papaya-fullstack-senior
description: >-
  Use this skill for senior fullstack engineering leadership across the monorepo:
  guiding architecture decisions, enforcing Clean Architecture and type safety across
  Next.js 15+ and NestJS 10+, optimizing SSE streaming performance, and ensuring production readiness.
---

# Papaya Senior Fullstack Engineer Skill

Skill này đóng vai trò là kim chỉ nam dành cho **Senior Fullstack Engineer / Autonomous Technical Lead**, chịu trách nhiệm bảo toàn tính toàn vẹn kiến trúc, chất lượng mã nguồn từ giao diện người dùng (Next.js) đến tầng dịch vụ doanh nghiệp (NestJS) và cơ sở dữ liệu (Prisma).

---

## 1. Trọng Trách & Tư Duy Kỹ Thuật (Senior Mindset)

1. **End-to-End Type Safety (Từ DB đến UI):**
   * Mọi schema dữ liệu bắt nguồn từ `packages/shared` (Zod schemas).
   * Backend NestJS dùng Zod schema để parse & validate Request/Response.
   * Frontend Next.js dùng kiểu dữ liệu suy diễn (`z.infer<typeof Schema>`) để render UI mà không bao giờ ép kiểu thủ công (`as any`).
2. **Kiến Trúc Bền Vững (Clean Architecture & Separation of Concerns):**
   * **Domain Core (Thuần túy):** Các hàm toán học, logic tính toán quyền lợi bảo hiểm, rule kiểm tra chứng từ phải là pure functions, không phụ thuộc framework hay I/O.
   * **Application Layer (Điều phối):** Mastra Workflow & NestJS Services kết nối các tools và điều phối luồng nghiệp vụ.
   * **Infrastructure Layer (Chuyển đổi):** Prisma Repositories, MCP Server Transport, HTTP Controllers, SSE Stream Adapters.
   * **Presentation Layer (Trực quan):** Next.js App Router, TailwindCSS, Vercel AI SDK hooks.
3. **Hiệu Năng & Trải Nghiệm Thời Gian Thực:**
   * Tối ưu hóa luồng Server-Sent Events (SSE): đóng gói các chunk sự kiện chuẩn xác, không làm nghẽn Event Loop của Node.js.
   * Tránh re-render thừa thãi trên Next.js: tách nhỏ các component Generative UI, memoize các dữ liệu tính toán lớn.

---

## 2. Quy Chuẩn Triển Khai Tính Năng Mới (Step-by-Step Runbook)

Khi được yêu cầu xây dựng một tính năng mới (Fullstack Feature):

```
Pha 1: Data Contract First (packages/shared)
   └── Định nghĩa TypeScript interface & Zod validation schema
           │
           ▼
Pha 2: Core Domain Logic & MCP Tool (packages/mcp-server)
   └── Viết pure logic + Unit Test kiểm chứng 100% logic toán học
           │
           ▼
Pha 3: Backend Integration (apps/api - NestJS)
   └── Tích hợp vào Prisma Model, Mastra Workflow/Agent, Controller xuất SSE
           │
           ▼
Pha 4: Frontend Presentation (apps/web - Next.js)
   └── Dựng giao diện TailwindCSS, kết nối useChat Vercel AI SDK, render Direct UI
           │
           ▼
Pha 5: Fullstack Verification
   └── Chạy linter, typecheck toàn monorepo: pnpm build && pnpm test
```

---

## 3. Checklist Tự Thẩm Định Code (Senior Self-Review Checklist)

Trước khi bàn giao bất kỳ tính năng nào, Senior Fullstack Engineer phải tự kiểm tra:
* [ ] **Zero `any`:** Không có bất kỳ biến nào mang kiểu `any` hoặc bị `@ts-ignore` vô cớ.
* [ ] **Error Boundary & Graceful Degradation:** Nếu LLM API timeout hoặc Ollama sập, backend có trả về lỗi có ngữ cảnh và UI có hiển thị thông báo thân thiện hay không?
* [ ] **Secret Leaks:** Không có API key, database password nào bị hardcode.
* [ ] **Monorepo Boundaries:** Code trong `apps/web` không được import trực tiếp code private của `apps/api` (chỉ import qua `packages/shared`).
* [ ] **Memory & Resource Leak:** Không rò rỉ kết nối stream SSE hoặc unhandled listeners.
