# Papaya Claims Assessment Copilot (Monorepo)

> **Hệ thống Trợ lý Thẩm định Bồi thường Bảo hiểm Sức khỏe Thông minh (AI Health Insurance Claims Assessment Copilot)**  
> Bài giải pháp toàn diện cho **Challenge 11** — Tuyển dụng Kỹ sư AI / Phần mềm tại **Papaya Insurtech**.

[![TypeScript Strict](https://img.shields.io/badge/TypeScript-Strict_Mode-blue?logo=typescript)](https://www.typescriptlang.org/)
[![Turborepo](https://img.shields.io/badge/Monorepo-Turborepo_+_pnpm-ef4444?logo=turborepo)](https://turbo.build/)
[![Next.js 15](https://img.shields.io/badge/Frontend-Next.js_15_App_Router-black?logo=next.js)](https://nextjs.org/)
[![NestJS 10](https://img.shields.io/badge/Backend-NestJS_10-E0234E?logo=nestjs)](https://nestjs.com/)
[![Mastra Core](https://img.shields.io/badge/AI_Engine-Mastra_Core-6366f1)](https://mastra.ai/)
[![Tests](https://img.shields.io/badge/Unit_&_Integration_Tests-91%2F91_PASSED-emerald)](#5-kiểm-thử--đảm-bảo-chất-lượng-testing--verification)

---

## 📌 Mục Lục Dành Cho Người Chấm Bài (Evaluator Quick Index)

1. [Hướng dẫn Khởi Chạy Nhanh (1-Click Quickstart)](#1-hướng-dẫn-khởi-chạy-nhanh-1-click-quickstart)
2. [Cấu Hình Nhà Cung Cấp LLM & AI Engine (LLM Setup)](#2-cấu-hình-nhà-cung-cấp-llm--ai-engine-llm-setup)
3. [Hướng Dẫn Sử Dụng Trạm Thẩm Định Chi Tiết (User Guide)](#3-hướng-dẫn-sử-dụng-trạm-thẩm-định-chi-tiết-user-guide)
4. [Kịch Bản Đánh Giá 3 Ca Benchmark (Walkthrough Guide)](#4-kịch-bản-đánh-giá-3-ca-benchmark-walkthrough-guide)
5. [Kiểm Thử & Đảm Bảo Chất Lượng (Testing & Verification)](#5-kiểm-thử--đảm-bảo-chất-lượng-testing--verification)
6. [Gói Bàn Giao Hồ Sơ & Lịch Sử Đối Thoại (Submission Artifacts)](#6-gói-bàn-giao-hồ-sơ--lịch-sử-đối-thoại-submission-artifacts)
7. [Cấu Trúc Kiến Trúc & Công Nghệ (Monorepo Blueprint)](#7-cấu-trúc-kiến-trúc--công-nghệ-monorepo-blueprint)

---

## 1. Hướng Dẫn Khởi Chạy Nhanh (1-Click Quickstart)

### Yêu cầu Tiên quyết

- **Node.js:** v20.x hoặc v22.x+
- **pnpm:** v9.x+ hoặc v12.x+ (`corepack enable pnpm`)
- _(Tùy chọn)_ **Docker & Docker Compose** nếu muốn chạy đóng gói container.

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

## 2. Cấu Hình Nhà Cung Cấp LLM & AI Engine (LLM Setup)

Hệ thống được thiết kế theo tiêu chuẩn mở **OpenAI-Compatible Gateway** thông qua `@ai-sdk/openai`, cho phép kết nối linh hoạt tới bất kỳ LLM provider nào mà **không cần thay đổi mã nguồn**.

Cấu hình tại file `.env` ở thư mục gốc:

```env
OPENAI_BASE_URL="https://ollama.com/v1"
OPENAI_API_KEY="your-api-key-here"
MODEL_NAME="gemma4:31b-cloud"
```

### Bảng Cấu Hình Từng Nhà Cung Cấp:

| Nhà cung cấp                  | `OPENAI_BASE_URL`                | `OPENAI_API_KEY`   | `MODEL_NAME`                  | Ghi chú                                |
| :---------------------------- | :------------------------------- | :----------------- | :---------------------------- | :------------------------------------- |
| **Ollama Cloud** _(Mặc định)_ | `https://ollama.com/v1`          | `<OLLAMA_API_KEY>` | `gemma4:31b-cloud`            | Miễn phí, tốc độ cao, hỗ trợ sẵn       |
| **Ollama Local** _(Offline)_  | `http://localhost:11434/v1`      | `ollama`           | `llama3.3` hoặc `qwen2.5:14b` | Chạy offline trên máy local, zero cost |
| **OpenAI Official**           | `https://api.openai.com/v1`      | `sk-proj-...`      | `gpt-4o-mini` hoặc `gpt-4o`   | Mô hình thương mại tiêu chuẩn          |
| **OpenRouter**                | `https://openrouter.ai/api/v1`   | `sk-or-...`        | `anthropic/claude-3.5-sonnet` | Gateway đa mô hình                     |
| **Groq Cloud**                | `https://api.groq.com/openai/v1` | `gsk_...`          | `llama-3.3-70b-versatile`     | Tốc độ suy luận siêu tốc               |

### 🛡️ Nguyên Tắc Thiết Kế Cốt Lõi: Hybrid Mastra (AI An Toàn)

1. **Workflow Thẩm định 4 Bước là Tất Định (100% Deterministic Pure Logic):**
   - 4 bước nghiệp vụ cốt lõi: `verifyDocument` -> `lookupPolicy` -> `checkMedicalNecessity` -> `calculateBenefit` được thực thi hoàn toàn bằng TypeScript Engine thuần túy.
   - **Hoàn toàn KHÔNG phụ thuộc vào LLM để tính tiền hay ra quyết định bồi thường**. Điều này loại bỏ 100% rủi ro ảo giác (AI Hallucination) và đảm bảo an toàn tài chính trong bảo hiểm.
   - Ngay cả khi không có kết nối Internet hoặc chưa cấu hình API Key, **toàn bộ hệ thống thẩm định vẫn tính toán chính xác 100%**.
2. **LLM Assessor Copilot phụ trách Giao Tiếp Tự Nhiên & Giải Thích:**
   - LLM nhận kết quả thẩm định đã được tính toán chính xác để đối thoại với chuyên viên, trích dẫn điều khoản hợp đồng bằng Policy Citation Pill, giải thích căn cứ y khoa và hỗ trợ ghi đè (Manual Override).
   - Tự động lọc dữ liệu nhạy cảm PII (CCCD, SĐT) trước khi gửi qua API của LLM.

---

## 3. Hướng Dẫn Sử Dụng Trạm Thẩm Định Chi Tiết (User Guide)

Giao diện trạm làm việc được thiết kế theo phong cách chuyên nghiệp, hiện đại, tối ưu cho năng suất của Chuyên viên Thẩm định (Claims Assessor).

### 3.1. Màn Hình Hàng Đợi Hồ Sơ (Claims Queue — `/claims`)

- **Thanh Chỉ Số Hiệu Suất (KPI Bar):**
  - _Tổng số hồ sơ:_ Đếm số lượng hồ sơ trong hệ thống.
  - _Tỷ lệ STP Tự động (Straight-Through Processing):_ Tự động tính toán tỷ lệ hồ sơ được AI phê duyệt tự động mà không cần can thiệp thủ công.
  - _Thống kê theo trạng thái:_ Phê duyệt (`APPROVED`), Từ chối (`REJECTED`), Cần bổ sung (`REQUEST_INFO`), Đang chờ (`PENDING`).
- **Bộ Lọc & Tìm Kiếm Nhanh:** Lọc theo trạng thái hoặc gõ tên bệnh nhân, số hợp đồng, mã ICD-10.
- **Nút "Tạo Hồ Sơ Mới":**
  - Tích hợp công cụ **Faker Y Tế Việt Nam** sinh động: Khi bấm vào các nút kịch bản nhanh `TC-01`, `TC-02`, `TC-03`, hệ thống tự động sinh ra một bộ dữ liệu bệnh nhân mới (Họ tên tiếng Việt, số CCCD 12 số chuẩn quốc gia, số điện thoại, viện phí ngẫu nhiên) nhưng vẫn bảo toàn chính xác logic nghiệp vụ của kịch bản.

---

### 3.2. Màn Hình Trạm Thẩm Định Chia Đôi (Workstation Dual-Pane — `/claims/[id]`)

Màn hình làm việc chia làm 2 cột độc lập giúp chuyên viên vừa soi chiếu chứng từ vừa tương tác với AI:

#### Cột Trái: Hồ Sơ Bồi Thường Toàn Diện (Dossier View)

1. **Thẻ Thành Viên & Hợp Đồng (Member & Policy Card):**
   - Hiển thị gói bảo hiểm (_Healthcare Gold, Silver, Bronze, Platinum_), thời hạn hợp đồng, số CCCD được che mặt nạ PII (`001099***45`), hạn mức năm còn lại.
   - Nút **"Xem Điều Khoản Hợp Đồng"**: Mở ngăn kéo tra cứu điều khoản chi tiết.
2. **Chẩn Đoán Y Khoa & Chi Phí Yêu Cầu (Diagnosis & Invoice Breakdown):**
   - Mã ICD-10 chính và mô tả chẩn đoán y khoa.
   - Bảng phân tách viện phí chi tiết theo danh mục: Phẫu thuật (`SURGERY`), Tiền giường nội trú (`INPATIENT`), Tiền thuốc (`MEDICATION`), Xét nghiệm (`LABORATORY`).
3. **Trình Soi Chiếu Chứng Từ (Document Inspector):**
   - Danh sách tài liệu đính kèm: Giấy ra viện, Bảng kê chi phí, Hóa đơn VAT điện tử, Phiếu phẫu thuật.
   - Hỗ trợ xem trực quan bản scan: Phóng to (`Zoom In`), thu nhỏ (`Zoom Out`), xoay (`Rotate`), toàn màn hình.
   - Hiển thị cờ kiểm tra chữ ký bác sĩ, mộc đỏ bệnh viện và kết quả trích xuất OCR.
   - Nút **"Tải Lên Chứng Từ Mới"**: Cho phép upload bổ sung file tài liệu để AI tự động đánh giá lại.

#### Cột Phải: Trợ Lý AI Copilot & Ra Quyết Định (Copilot Engine)

1. **Dòng Thời Gian Thẩm Định (Tool Execution Timeline):**
   - Hiển thị trực quan 4 bước thẩm định theo thời gian thực (Server-Sent Events streaming):
     - Bước 1: _Kiểm tra tính hợp lệ và đầy đủ của chứng từ bắt buộc_.
     - Bước 2: _Đối soát thời hạn hợp đồng và danh mục loại trừ ICD-10_.
     - Bước 3: _Kiểm tra tính cần thiết y khoa và chỉ định điều trị_.
     - Bước 4: _Chiết tính số tiền bồi thường, khấu trừ và đồng chi trả_.
2. **Thẻ Chiết Tính Quyền Lợi (Benefit Calculation Card):**
   - Hiển thị bảng tính minh bạch: Chi phí yêu cầu -> Chi phí không hợp lệ -> Chi phí đủ điều kiện -> Tỷ lệ đồng chi trả -> Hạn mức ngày/vụ -> **Số tiền AI đề xuất chi trả cuối cùng**.
3. **Hộp Thoại Đối Thoại AI (Copilot Chat):**
   - Nhắn tin hỏi đáp trực tiếp với AI Agent.
   - Các câu hỏi gợi ý nhanh:
     - _"Tại sao hồ sơ này bị từ chối?"_
     - _"Quyền lợi phẫu thuật được chi trả bao nhiêu phần trăm?"_
     - _"Hóa đơn VAT có hợp lệ không?"_
   - **Policy Citation Pill:** Khi AI trả lời trích dẫn điều khoản hợp đồng (ví dụ: `[CLAUSE-EXCL-POL-GOLD-99882-01]`), câu trả lời sẽ xuất hiện một thẻ màu đỏ có thể nhấp vào để mở ngăn kéo tra cứu nguyên văn điều khoản.
4. **Thanh Thao Tác Quyết Định Cuối Cùng (Action Bar):**
   - **Duyệt Hồ Sơ (`Approve`):** Mở modal xác nhận duyệt số tiền chi trả, gửi thông báo phê duyệt.
   - **Từ Chối (`Reject`):** Mở modal từ chối kèm mẫu thư giải thích viện dẫn điều khoản tự động.
   - **Yêu Cầu Bổ Sung (`Request Info`):** Mở modal liệt kê danh mục chứng từ thiếu cần bệnh nhân gửi lại.
   - **Ghi Đè AI (`Manual Override`):** Cho phép chuyên viên thay đổi quyết định hoặc điều chỉnh số tiền chi trả kèm ghi chú lý do nghiệp vụ.

---

### 3.3. Các Ngăn Kéo Tra Cứu Bổ Trợ (Drawers)

- **Policy Browser Drawer:** Tra cứu toàn bộ các chương mục điều khoản hợp đồng, bảng hạn mức quyền lợi và danh mục loại trừ mà không cần rời màn hình thẩm định.
- **Audit Trail Drawer:** Xem toàn bộ lịch sử vết kiểm toán (Ai đã tạo hồ sơ, AI đã thẩm định lúc nào, công cụ nào đã chạy, chuyên viên nào đã phê duyệt hoặc ghi đè).

---

## 4. Kịch Bản Đánh Giá 3 Ca Benchmark (Walkthrough Guide)

---

### Ca 1: TC-01 — Cấp cứu Ruột thừa (Tự động Phê duyệt / Approve)

- **Mô tả nghiệp vụ:** Bệnh nhân nhập viện cấp cứu phẫu thuật nội soi cắt ruột thừa (`K35`, `K35.2`, `K35.8`) tại bệnh viện chuẩn. Hợp đồng `POL-GOLD-99882` còn hiệu lực, đầy đủ 4 chứng từ gốc hợp lệ.
- **Các bước thực hiện:**
  1. Vào [http://localhost:3000](http://localhost:3000) -> Bấm **"Tạo Hồ Sơ Mới"**.
  2. Bấm vào nút kịch bản **TC-01: Cấp cứu Ruột thừa (Approve)** _(Dữ liệu bệnh nhân & viện phí được sinh động ngẫu nhiên)_ -> Bấm **"Tạo Hồ Sơ & Thẩm Định"**.
  3. Mở hồ sơ vừa tạo trong danh sách để vào Workstation.
- **Kết quả mong đợi:**
  - AI Workflow hoàn thành 4 bước đạt trạng thái **`APPROVED`**.
  - Thẻ **Chiết tính Quyền lợi (Benefit Card)** thể hiện chính xác:
    - _Quyền lợi Phẫu thuật:_ Đồng chi trả 20%, bảo hiểm thanh toán 80%.
    - _Quyền lợi Nội trú tiêu chuẩn:_ Đồng chi trả 10%, bảo hiểm thanh toán 90%.
    - _Hạn mức bồi thường hàng năm còn lại_ được trừ tương ứng.
  - Assessor có thể bấm nút **"Duyệt Hồ Sơ"** để chốt thanh toán.

---

### Ca 2: TC-02 — Bệnh Loại trừ / Thời gian chờ (Từ chối / Reject)

- **Mô tả nghiệp vụ:** Người bệnh yêu cầu bồi thường điều trị ngoại trú với mã chẩn đoán nằm trong danh mục loại trừ của hợp đồng `POL-GOLD-99882` (`K21` - Trào ngược dạ dày thực quản GERD, `Z41.1` - Phẫu thuật thẩm mỹ, hoặc `F32` - Trầm cảm/tâm lý).
- **Các bước thực hiện:**
  1. Bấm **"Tạo Hồ Sơ Mới"** -> Chọn **TC-02: Bệnh Loại trừ (Reject)** -> Bấm **"Tạo Hồ Sơ & Thẩm Định"**.
  2. Mở hồ sơ để xem Copilot đánh giá.
- **Kết quả mong đợi:**
  - Bước 1 (Kiểm tra chứng từ) đạt điểm tuyệt đối vì chứng từ hợp lệ.
  - **Bước 2 (`lookupPolicyStep`) phát hiện mã bệnh nằm trong `exclusions`** của hợp đồng.
  - Toàn bộ hồ sơ chuyển trạng thái **`REJECTED`** ngay lập tức, ngăn chặn rủi ro chi trả sai.
  - Copilot trích dẫn đúng điều khoản loại trừ (kèm **Policy Citation Pill** màu đỏ).
  - Assessor có thể bấm **"Từ Chối Bồi Thường"** để gửi thư thông báo tới khách hàng.

---

### Ca 3: TC-03 — Thiếu hóa đơn VAT / Bảng kê mờ (Yêu cầu Bổ sung / Request Info)

- **Mô tả nghiệp vụ:** Bệnh nhân viêm phế quản cấp (`J20`) điều trị nội trú nhưng hồ sơ gửi lên thiếu Hóa đơn VAT điện tử và Bảng kê viện phí bị scan nhòe số tiền không đọc được OCR.
- **Các bước thực hiện:**
  1. Bấm **"Tạo Hồ Sơ Mới"** -> Chọn **TC-03: Chứng từ mờ / Thiếu VAT** -> Bấm **"Tạo Hồ Sơ & Thẩm Định"**.
  2. Mở hồ sơ để xem phản hồi của hệ thống.
- **Kết quả mong đợi:**
  - **Bước 1 (`verifyDocumentStep`) cảnh báo thiếu chứng từ bắt buộc** và gắn cờ tài liệu `INVALID`.
  - Trạng thái hồ sơ chuyển sang **`REQUEST_INFO`** (_Hành động bổ sung_).
  - Assessor có thể bấm nút **"Tải Lên Chứng Từ Mới"** ở tab Chứng từ để upload file VAT bổ sung -> Hệ thống tự động kích hoạt thẩm định lại hồ sơ.
  - Hoặc bấm **"Yêu Cầu Bổ Sung"** để xuất phiếu yêu cầu bổ sung chứng từ gửi khách hàng.

---

## 5. Kiểm Thử & Đảm Bảo Chất Lượng (Testing & Verification)

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

## 6. Gói Bàn Giao Hồ Sơ & Lịch Sử Đối Thoại (Submission Artifacts)

Mọi báo cáo chi tiết và nhật ký tương tác phục vụ việc chấm điểm được lưu trữ sẵn trong repository:

| File Artifact                                                                       | Mô tả nội dung                                                                                 |
| :---------------------------------------------------------------------------------- | :--------------------------------------------------------------------------------------------- |
| 📄 [submission/EVALUATION_REPORT.md](submission/EVALUATION_REPORT.md)               | Báo cáo đánh giá kiến trúc, kết quả chạy 3 ca benchmark, so sánh hiệu năng và phân tích sai số |
| 📋 [submission/TOOL_CALL_LOGS.json](submission/TOOL_CALL_LOGS.json)                 | Toàn bộ log gọi 4 MCP tools chi tiết (Input, Output, Execution Time) của TC-01, TC-02, TC-03   |
| 💬 [conversations/LATEST_CONVERSATION.md](conversations/LATEST_CONVERSATION.md)     | Lịch sử toàn văn hơn 120 lượt tương tác phát triển dự án giữa Assessor và AI Agent             |
| 🛠️ [scripts/generate-submission-package.ts](scripts/generate-submission-package.ts) | Script tự động chạy lại benchmark và xuất mới bộ hồ sơ nộp bài (`pnpm eval:report`)            |
| 🔄 [scripts/export-conversation.py](scripts/export-conversation.py)                 | Script trích xuất lịch sử hội thoại mới nhất từ brain ra file Markdown (`pnpm export:chat`)    |

---

## 7. Cấu Trúc Kiến Trúc & Công Nghệ (Monorepo Blueprint)

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

## 8. Các Lệnh Điều Phối Hữu Ích

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
