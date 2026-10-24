# Papaya Claims Assessment Copilot (Monorepo)

> **Hệ thống Trợ lý Thẩm định Bồi thường Bảo hiểm Sức khỏe Thông minh (AI Health Insurance Claims Assessment Copilot)**  
> Bài giải pháp toàn diện cho **Challenge 11** — Tuyển dụng Kỹ sư AI / Phần mềm tại **Papaya Insurtech**.

[![TypeScript Strict](https://img.shields.io/badge/TypeScript-Strict_Mode-blue?logo=typescript)](https://www.typescriptlang.org/)
[![Turborepo](https://img.shields.io/badge/Monorepo-Turborepo_+_pnpm-ef4444?logo=turborepo)](https://turbo.build/)
[![Next.js 15](https://img.shields.io/badge/Frontend-Next.js_15_App_Router-black?logo=next.js)](https://nextjs.org/)
[![NestJS 10](https://img.shields.io/badge/Backend-NestJS_10-E0234E?logo=nestjs)](https://nestjs.com/)
[![Mastra Core](https://img.shields.io/badge/AI_Engine-Mastra_Core-6366f1)](https://mastra.ai/)
[![Tests](https://img.shields.io/badge/Unit_&_Integration_Tests-91%2F91_PASSED-emerald)](#4-kiểm-thử--đảm-bảo-chất-lượng-testing--verification)

---

## 📌 Mục Lục Dành Cho Người Chấm Bài (Evaluator Quick Index)

1. [Hướng dẫn Khởi Chạy Nhanh (1-Click Quickstart)](#1-hướng-dẫn-khởi-chạy-nhanh-1-click-quickstart)
2. [Kịch Bản Đánh Giá Nghiệp Vụ (Walkthrough Guide)](#2-kịch-bản-đánh-giá-nghiệp-vụ-walkthrough-guide)
   - [Ca 1: TC-01 — Cấp cứu Ruột thừa (Tự động Phê duyệt / Approve)](#ca-1-tc-01--cấp-cứu-ruột-thừa-tự-động-phê-duyệt--approve)
   - [Ca 2: TC-02 — Bệnh Loại trừ / Thời gian chờ (Từ chối / Reject)](#ca-2-tc-02--bệnh-loại-trừ--thời-gian-chờ-từ-chối--reject)
   - [Ca 3: TC-03 — Thiếu hóa đơn VAT / Bảng kê mờ (Yêu cầu Bổ sung / Request Info)](#ca-3-tc-03--thiếu-hóa-đơn-vat--bảng-kê-mờ-yêu-cầu-bổ-sung--request-info)
3. [Các Tính Năng Nổi Bật Trên Trạm Làm Việc (Workstation Features)](#3-các-tính-năng-nổi-bật-trên-trạm-làm-việc-workstation-features)
4. [Kiểm Thử & Đảm Bảo Chất Lượng (Testing & Verification)](#4-kiểm-thử--đảm-bảo-chất-lượng-testing--verification)
5. [Gói Bàn Giao Hồ Sơ & Lịch Sử Đối Thoại (Submission Artifacts)](#5-gói-bàn-giao-hồ-sơ--lịch-sử-đối-thoại-submission-artifacts)
6. [Cấu Trúc Kiến Trúc & Công Nghệ (Monorepo Blueprint)](#6-cấu-trúc-kiến-trúc--công-nghệ-monorepo-blueprint)

---

## 1. Hướng Dẫn Khởi Chạy Nhanh (1-Click Quickstart)

### Yêu cầu Tiên quyết

- **Node.js:** v20.x hoặc v22.x+
- **pnpm:** v9.x+ hoặc v12.x+ (`corepack enable pnpm`)
- _(Tùy chọn)_ **Docker & Docker Compose** nếu muốn chạy qua container.

### Phương Án A: Khởi chạy Trực tiếp bằng PNPM (Khuyến nghị để chấm bài)

```bash
# Bước 1: Sao chép biến môi trường mẫu
cp .env.example .env

# Bước 2: Cài đặt toàn bộ dependencies trong monorepo
pnpm install

# Bước 3: Khởi tạo database SQLite & nạp dữ liệu mẫu 3 ca benchmark
pnpm db:seed

# Bước 4: Chạy toàn bộ 91 bài kiểm thử tự động
pnpm test

# Bước 5: Khởi động song song cả Frontend & Backend
pnpm dev
```

Sau khi chạy lệnh `pnpm dev`:

- **Giao diện Trạm Thẩm định (Workstation Copilot):** [http://localhost:3000](http://localhost:3000)
- **Backend API & Mastra SSE Streaming:** [http://localhost:3001](http://localhost:3001)

### Phương Án B: Khởi chạy Đóng gói bằng Docker Compose

```bash
docker compose up --build
```

Hệ thống sẽ tự động khởi động các containers cô lập cho cả Frontend Next.js, Backend NestJS và SQLite database.

---

## 2. Kịch Bản Đánh Giá Nghiệp Vụ (Walkthrough Guide)

Khi truy cập vào [http://localhost:3000](http://localhost:3000), người chấm bài sẽ nhìn thấy giao diện **Danh sách Hồ sơ Bồi thường (Claims Queue)** kèm thanh KPI tự động:

- **Tỷ lệ STP Tự động (Straight-Through Processing):** Thống kê tỷ lệ hồ sơ được AI xử lý tự động thành công.
- **Nút "Tạo Hồ Sơ Mới":** Tích hợp bộ **Faker Generator chuẩn y tế Việt Nam** giúp sinh hồ sơ ngẫu nhiên không trùng lặp nhưng vẫn bảo toàn chuẩn xác logic nghiệp vụ của 3 kịch bản kiểm thử:

---

### Ca 1: TC-01 — Cấp cứu Ruột thừa (Tự động Phê duyệt / Approve)

- **Mô tả nghiệp vụ:** Người bệnh nhập viện cấp cứu phẫu thuật cắt ruột thừa nội soi (`K35`, `K35.2`, `K35.8`) tại bệnh viện đạt chuẩn. Hợp đồng `POL-GOLD-99882` còn hiệu lực, đầy đủ 4 chứng từ gốc (Giấy ra viện, Bảng kê chi tiết, Hóa đơn VAT, Phiếu phẫu thuật).
- **Các bước thực hiện:**
  1. Bấm **"Tạo Hồ Sơ Mới"** -> chọn kịch bản **TC-01: Cấp cứu Ruột thừa (Approve)** _(mỗi lần bấm hệ thống sẽ dùng Faker sinh một bệnh nhân và viện phí ngẫu nhiên mới)_ -> Bấm **"Tạo Hồ Sơ & Thẩm Định"**.
  2. Bấm vào hồ sơ vừa tạo trong danh sách để mở màn hình **Workstation Thẩm định chia đôi (Dual-Pane)**.
- **Kết quả mong đợi:**
  - AI Workflow chạy tuần tự 4 bước qua SSE streaming và đạt trạng thái **`APPROVED`**.
  - Thẻ **Chiết tính Quyền lợi (Benefit Card)** hiển thị chi tiết:
    - _Quyền lợi Phẫu thuật:_ Đồng chi trả 20%, chi trả 80%.
    - _Quyền lợi Nội trú tiêu chuẩn:_ Đồng chi trả 10%, chi trả 90%.
    - _Hạn mức bồi thường hàng năm còn lại_ được khấu trừ chính xác.
  - Hộp thoại Copilot hiển thị gợi ý phê duyệt kèm số tiền đề xuất chi trả.
  - Assessor có thể bấm nút **"Duyệt Hồ Sơ"** để lưu quyết định cuối cùng.

---

### Ca 2: TC-02 — Bệnh Loại trừ / Thời gian chờ (Từ chối / Reject)

- **Mô tả nghiệp vụ:** Người bệnh yêu cầu bồi thường điều trị ngoại trú với chẩn đoán nằm trong danh mục loại trừ của hợp đồng `POL-GOLD-99882` (`K21` - Trào ngược dạ dày thực quản GERD, `Z41.1` - Phẫu thuật thẩm mỹ, hoặc `F32` - Trầm cảm/tâm lý).
- **Các bước thực hiện:**
  1. Bấm **"Tạo Hồ Sơ Mới"** -> chọn **TC-02: Bệnh Loại trừ (Reject)** -> Bấm **"Tạo Hồ Sơ & Thẩm Định"**.
  2. Vào chi tiết hồ sơ để xem Copilot đánh giá.
- **Kết quả mong đợi:**
  - Bước 1 (Kiểm tra chứng từ) đạt điểm tuyệt đối vì chứng từ hợp lệ.
  - **Bước 2 (`lookupPolicyStep`) lập tức phát hiện mã bệnh nằm trong `exclusions`** của hợp đồng.
  - Toàn bộ hồ sơ chuyển trạng thái **`REJECTED`** ngay lập tức, ngăn chặn giải ngân sai lệch.
  - Copilot trích dẫn đúng điều khoản loại trừ (kèm **Policy Citation Pill** màu đỏ có thể bấm mở Drawer tra cứu).
  - Assessor có thể bấm **"Từ Chối Bồi Thường"** với mẫu thư từ chối tự động gửi khách hàng.

---

### Ca 3: TC-03 — Thiếu hóa đơn VAT / Bảng kê mờ (Yêu cầu Bổ sung / Request Info)

- **Mô tả nghiệp vụ:** Bệnh nhân viêm phế quản cấp (`J20`) điều trị nội trú nhưng hồ sơ gửi lên thiếu Hóa đơn VAT điện tử và Bảng kê viện phí bị scan nhòe số tiền không đọc được OCR.
- **Các bước thực hiện:**
  1. Bấm **"Tạo Hồ Sơ Mới"** -> chọn **TC-03: Chứng từ mờ / Thiếu VAT** -> Bấm **"Tạo Hồ Sơ & Thẩm Định"**.
  2. Vào chi tiết hồ sơ để xem phản hồi của hệ thống.
- **Kết quả mong đợi:**
  - **Bước 1 (`verifyDocumentStep`) cảnh báo thiếu chứng từ bắt buộc** và gắn cờ tài liệu `INVALID`.
  - Trạng thái hồ sơ chuyển sang **`REQUEST_INFO`** (_Hành động bổ sung_).
  - Assessor có thể bấm nút **"Tải Lên Chứng Từ Mới"** ở tab Chứng từ để upload file VAT bổ sung -> Hệ thống tự động kích hoạt thẩm định lại hồ sơ.
  - Hoặc bấm **"Yêu Cầu Bổ Sung"** để sinh thông báo gửi bệnh nhân yêu cầu cung cấp hóa đơn gốc.

---

## 3. Các Tính Năng Nổi Bật Trên Trạm Làm Việc (Workstation Features)

1. **Dual-Pane Workstation (Giao diện 2 Cột Chuyên Nghiệp):**
   - _Cột trái (Dossier View):_ Thẻ Thành viên & Hợp đồng, Chẩn đoán y khoa & Bảng viện phí phân loại chi tiết, Trình duyệt hồ sơ chứng từ (Document Inspector) có zoom/xoay/xác thực chữ ký số.
   - _Cột phải (Copilot Engine):_ Dòng thời gian thực thi 4 bước thẩm định theo thời gian thực (SSE), Thẻ chiết tính quyền lợi động, Hộp thoại hỏi đáp tương tác với chuyên viên.
2. **Direct Generative UI & Policy Citation Pills:**
   - Khi Copilot trích dẫn điều khoản (ví dụ: `[CLAUSE-EXCL-POL-GOLD-99882-01]`), câu trả lời sinh ra một **Policy Citation Pill** có thể nhấp chuột để trượt ra **Policy Browser Drawer**, hiển thị nguyên văn chương, điều, khoản và tiền lệ áp dụng.
3. **Assessor Copilot Chat & Interactive Overrides:**
   - Người thẩm định có thể hỏi Copilot bất kỳ câu hỏi nào:
     - _"Tại sao hồ sơ này bị giảm trừ số tiền?"_
     - _"Bệnh K21 có được thanh toán nếu điều trị cấp cứu không?"_
     - _"Trích dẫn điều khoản quy định về thời gian chờ bệnh có sẵn."_
   - Hỗ trợ **Manual Override Modal** cho phép Assessor ghi đè quyết định của AI kèm lý do nghiệp vụ và lưu vết kiểm toán (Audit Trail).
4. **Bảo vệ Dữ liệu Riêng tư (PII Masking Guardrail):**
   - Bộ lọc PII tự động che dấu số CMND/CCCD (`001099***45`), số điện thoại (`0908***456`) và thông tin nhạy cảm trước khi đưa vào luồng đối thoại.

---

## 4. Kiểm Thử & Đảm Bảo Chất Lượng (Testing & Verification)

Dự án áp dụng kỷ luật kiểm thử chất lượng phần mềm cao cấp với **17 Test Suites (91 Tests) đạt tỷ lệ Pass 100%**:

```bash
pnpm test
```

### Phân loại các Bộ Test Chuyên sâu:

- **`tests/benchmark/official-benchmarks.spec.ts`:** Kiểm tra 3 ca kiểm thử bắt buộc của đề bài (TC-01, TC-02, TC-03) đảm bảo tính toán đồng chi trả và khấu trừ chính xác từng đồng.
- **`tests/benchmark/expanded-scenarios.spec.ts`:** Kiểm tra các ca biên mở rộng (Hợp đồng hết hạn, vượt trần hạn mức năm, bệnh có sẵn trong thời gian chờ).
- **`tests/algorithms/bva-boundary-analysis.spec.ts`:** Phân tích giá trị biên (Boundary Value Analysis) cho số tiền bồi thường, hạn mức ngày, độ tuổi bảo hiểm.
- **`tests/algorithms/mcdc-decision-coverage.spec.ts`:** Độ bao phủ quyết định MC/DC (Modified Condition/Decision Coverage) cho toàn bộ nhánh rẽ trong quy tắc bảo hiểm.
- **`tests/algorithms/mccabe-cyclomatic-paths.spec.ts`:** Kiểm tra toàn bộ đường đi độc lập (Cyclomatic Complexity) của workflow.
- **`tests/algorithms/pairwise-matrix.spec.ts`:** Ma trận tổ hợp Pairwise giữa các gói bảo hiểm (Bronze, Silver, Gold, Platinum) với các hình thức điều trị.
- **`apps/api/src/modules/mastra/guardrails/pii-masker.guardrail.spec.ts`:** Kiểm thử 12 ca che giấu dữ liệu định danh người dùng.

---

## 5. Gói Bàn Giao Hồ Sơ & Lịch Sử Đối Thoại (Submission Artifacts)

Mọi báo cáo chi tiết và nhật ký tương tác phục vụ việc chấm điểm được lưu trữ sẵn trong repository:

| File Artifact                                                                       | Mô tả nội dung                                                                                 |
| :---------------------------------------------------------------------------------- | :--------------------------------------------------------------------------------------------- |
| 📄 [submission/EVALUATION_REPORT.md](submission/EVALUATION_REPORT.md)               | Báo cáo đánh giá kiến trúc, kết quả chạy 3 ca benchmark, so sánh hiệu năng và phân tích sai số |
| 📋 [submission/TOOL_CALL_LOGS.json](submission/TOOL_CALL_LOGS.json)                 | Toàn bộ log gọi 4 MCP tools chi tiết (Input, Output, Execution Time) của TC-01, TC-02, TC-03   |
| 💬 [conversations/LATEST_CONVERSATION.md](conversations/LATEST_CONVERSATION.md)     | Lịch sử toàn văn hơn 118 lượt tương tác phát triển dự án giữa Assessor và AI Agent             |
| 🛠️ [scripts/generate-submission-package.ts](scripts/generate-submission-package.ts) | Script tự động chạy lại benchmark và xuất mới bộ hồ sơ nộp bài (`pnpm eval:report`)            |
| 🔄 [scripts/export-conversation.py](scripts/export-conversation.py)                 | Script trích xuất lịch sử hội thoại mới nhất từ brain ra file Markdown (`pnpm export:chat`)    |

---

## 6. Cấu Trúc Kiến Trúc & Công Nghệ (Monorepo Blueprint)

```
papaya-asign/
├── apps/
│   ├── web/                     # Next.js 15+ App Router, Vercel AI SDK, TailwindCSS
│   │   ├── src/app/claims/      # Claims Queue & Workstation Dual-Pane Router
│   │   ├── src/components/      # Copilot Chat, Dossier Viewer, Drawers & Action Modals
│   │   └── src/fixtures/        # Dữ liệu mẫu & Faker Vietnamese Medical Claim Generator
│   └── api/                     # NestJS 10 Backend điều phối Mastra Engine
│       ├── src/modules/mastra/  # Workflow 4 bước tuần tự, Agent Assessor & Scorers
│       ├── src/modules/claims/  # Nghiệp vụ quản lý hồ sơ bồi thường
│       └── src/modules/policies/# Quản lý hợp đồng bảo hiểm và tra cứu điều khoản
├── packages/
│   ├── shared/                  # Zod Schemas & TypeScript interfaces dùng chung
│   └── mcp-server/              # 4 Core Assessment Tools (Stdio Server + Direct Import)
├── data/
│   ├── fixtures/                # Dữ liệu chuẩn hóa TC01, TC02, TC03 (JSON)
│   └── policies/                # Cấu hình 4 gói bảo hiểm (Bronze, Silver, Gold, Platinum)
├── submission/                  # Báo cáo đánh giá Evals & Tool Call Logs
├── conversations/               # Lịch sử hội thoại quá trình lập trình
└── tests/                       # Bộ kiểm thử 91 test cases (BVA, MCDC, McCabe, Benchmark)
```

---

## 7. Các Lệnh Điều Phối Hữu Ích

| Lệnh                | Mô tả                                                                   |
| :------------------ | :---------------------------------------------------------------------- |
| `pnpm dev`          | Khởi chạy đồng thời Next.js frontend (3000) và NestJS backend (3001)    |
| `pnpm test`         | Chạy toàn bộ 91 bài kiểm thử tự động với Vitest                         |
| `pnpm lint`         | Kiểm tra linter và typecheck nghiêm ngặt                                |
| `pnpm format:check` | Kiểm tra định dạng mã nguồn theo Prettier                               |
| `pnpm db:seed`      | Nạp lại dữ liệu cơ sở dữ liệu mẫu về trạng thái ban đầu                 |
| `pnpm eval:report`  | Tự động chạy lại 3 ca kiểm thử benchmark và xuất file báo cáo thẩm định |
| `pnpm export:chat`  | Trích xuất toàn bộ lịch sử trò chuyện AI thành file Markdown            |

---

_Bản quyền giải pháp thuộc về Ứng viên tham gia thử thách tuyển dụng Papaya Insurtech © 2026._
