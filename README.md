# Papaya Claims Assessment Copilot (Monorepo)

> Hệ thống Trợ lý Thẩm định Bồi thường Bảo hiểm Sức khỏe (AI Health Insurance Claims Assessment Copilot) — Challenge 11.

---

## 1. Tổng quan Kiến trúc

Dự án được tổ chức theo mô hình **Monorepo** quản lý bằng **pnpm Workspaces** và **Turborepo**:

* **`apps/web`:** Next.js 15+ App Router, Vercel AI SDK (`ai/react`), TailwindCSS thuần túy + Lucide icons.
* **`apps/api`:** NestJS 10+, Mastra Core (`@mastra/core`), Prisma ORM (SQLite / PostgreSQL), SSE streaming.
* **`packages/shared`:** Zod validation schemas & TypeScript types dùng chung toàn hệ thống.
* **`packages/mcp-server`:** 4 Tools nghiệp vụ cốt lõi (Dual-Export: Stdio MCP Server CLI + Direct Import cho Mastra).
* **`data/`:** Bộ dữ liệu mẫu, 3 test cases chuẩn hóa (`tc01-approve.json`, `tc02-reject.json`, `tc03-request-info.json`), policies, và SQL scripts.
* **`tests/`:** Kiểm thử hợp đồng MCP tools, integration tests và e2e workflow.
* **`docs/`:** Tài liệu kiến trúc, wireframe UI/UX, và blueprint kỹ thuật chi tiết.
* **`.agents/`:** Bộ quy chuẩn Antigravity (Rules, Skills, MCP configurations).

---

## 2. Bắt đầu Nhanh (Quick Start)

### Yêu cầu Tiên quyết
* **Node.js:** v20+ hoặc v24+
* **pnpm:** v9+ hoặc v12+ (`corepack enable pnpm`)

### Cài đặt & Khởi động
```bash
# 1. Sao chép biến môi trường mẫu
cp .env.example .env

# 2. Cài đặt toàn bộ dependencies trong monorepo
pnpm install

# 3. Chạy kiểm thử tự động
pnpm test

# 4. Khởi động môi trường phát triển (Next.js + NestJS đồng thời qua Turbo)
pnpm dev
```

* Frontend: `http://localhost:3000`
* Backend API: `http://localhost:3001`

---

## 3. Các Lệnh Điều phối (Monorepo Scripts)

| Lệnh | Ý nghĩa |
| :--- | :--- |
| `pnpm dev` | Khởi chạy `apps/web` và `apps/api` ở chế độ hot-reload |
| `pnpm build` | Biên dịch toàn bộ các packages và applications theo thứ tự phụ thuộc |
| `pnpm test` | Chạy toàn bộ bộ test suite với Vitest |
| `pnpm lint` | Kiểm tra cú pháp và quy chuẩn TypeScript nghiêm ngặt |
| `pnpm format` | Tự động định dạng mã nguồn theo Prettier |
| `pnpm db:seed` | Nạp 3 hồ sơ mẫu và chính sách bảo hiểm vào cơ sở dữ liệu |

---

## 4. Tài liệu Tham chiếu Chi tiết
* [01. Đánh giá & Lựa chọn Thách thức](docs/01_CHALLENGE_EVALUATION_AND_SELECTION.md)
* [02. Đặc tả Nghiệp vụ Challenge 11](docs/02_CHALLENGE_11_SPECIFICATION_AND_REQUIREMENTS.md)
* [03. Kiến trúc Hệ thống Doanh nghiệp](docs/03_ENTERPRISE_SYSTEM_ARCHITECTURE.md)
* [04. Đặc tả Docker & AI Bổ trợ](docs/04_AUXILIARY_AI_AND_DOCKER_SPEC.md)
* [05. Mô hình Dữ liệu & 3 Ca Kiểm thử](docs/05_DATA_MODELS_AND_TEST_CASES.md)
* [06. Thiết kế Wireframe & UI/UX](docs/06_UI_UX_WIREFRAME_AND_SPECIFICATION.md)
* [07. Bản thiết kế Công nghệ Chi tiết](docs/07_TECH_STACK_AND_IMPLEMENTATION_BLUEPRINT.md)
