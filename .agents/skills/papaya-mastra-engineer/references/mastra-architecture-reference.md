# Mastra AI Architecture & Engineering Reference

Tài liệu tham chiếu chuẩn mực kỹ thuật dành cho **Senior Mastra AI Engineer** khi thiết kế, xây dựng và tối ưu hóa hệ thống Agentic AI trong dự án Papaya Claims Copilot.

---

## 1. Mô Hình Lõi Mastra (`@mastra/core`)

Mastra đóng vai trò là Orchestrator trung tâm kết nối giữa Deterministic Business Workflows, LLM Agents, Tools và Memory:

```text
┌─────────────────────────────────────────────────────────────────────────────┐
│                             MASTRA INSTANCE                                 │
│                                                                             │
│  ┌─────────────────────────┐           ┌─────────────────────────────────┐  │
│  │    Mastra Workflows     │           │          Mastra Agents          │  │
│  │  (100% Deterministic)   │           │    (Conversational & Copilot)   │  │
│  │                         │           │                                 │  │
│  │  - verifyDocument       │   Event   │  - System Instructions / Prompt │  │
│  │  - lookupPolicy         │──────────>│  - Model Router (OpenAI Gateway)│  │
│  │  - checkNecessity       │   State   │  - Mastra Memory (Thread/Recall)│  │
│  │  - calculateBenefit     │           │  - Evals & Scorers (Guardrails) │  │
│  └─────────────────────────┘           └─────────────────────────────────┘  │
│               │                                         │                   │
│               ▼                                         ▼                   │
│  ┌───────────────────────────────────────────────────────────────────────┐  │
│  │                         MCP & TOOLS ENGINE                            │  │
│  │   - Stdio MCP Server (External IDE & CLI connection)                  │  │
│  │   - Direct Pure Function Import (Zero network latency in NestJS)      │  │
│  └───────────────────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 2. Mastra Workflows: Đồ Thị Tất Định (Deterministic Graph)

Khác với ReAct Agents tự do có thể rơi vào vòng lặp vô tận (infinite loop) hoặc nhảy cóc các bước quan trọng, **Quy trình thẩm định bồi thường bảo hiểm bắt buộc phải là một đồ thị tuần tự tất định**:

1. **Step 1: `verifyDocument`**
   - Kiểm tra tính đầy đủ của bộ chứng từ bắt buộc (Giấy ra viện, Bảng kê chi tiết, Hóa đơn VAT).
   - Kiểm tra tính toàn vẹn (con dấu mộc đỏ, phát hiện chỉnh sửa Photoshop/ELA).
2. **Step 2: `lookupPolicy`**
   - Xác thực hợp đồng còn hiệu lực tại thời điểm nhập viện (`admissionDate`).
   - Kiểm tra danh mục loại trừ ICD-10 (`exclusionsJson`) và thời gian chờ (`waitingPeriodsJson`).
3. **Step 3: `checkMedicalNecessity`**
   - Đối chiếu chẩn đoán chính và thời gian nằm viện thực tế so với phác đồ điều trị chuẩn của Bộ Y tế.
   - Phát hiện các chỉ định bất thường (over-treatment) hoặc kê đơn ngoài danh mục.
4. **Step 4: `calculateBenefit`**
   - Động cơ toán học thuần túy: Áp dụng hạn mức quyền lợi (Limit), trừ khấu trừ (Deductible), tính tỷ lệ đồng chi trả (Copay).
   - Kiểm soát số dư hạn mức năm (`annualUsedAmount` và `annualTotalLimit`).
5. **Step 5: `synthesizeReport`**
   - Tổng hợp báo cáo `AssessmentReport` có cấu trúc theo Zod Schema, tính điểm tin cậy `confidenceScore` (0–100%).

---

## 3. Mastra Agents: Chuyên Viên Copilot Đàm Thoại

Sau khi Workflow hoàn tất và tạo ra Báo cáo sơ bộ, Mastra Agent nhận ngữ cảnh này vào Thread Memory để hỗ trợ Assessor:

- **Persona:** Senior Claims Assessment Copilot (khách quan, viện dẫn điều khoản chính xác, tuân thủ đạo luật bảo hiểm).
- **Khả năng:**
  1. Trích dẫn chính xác từng dòng điều khoản hợp đồng khi Assessor yêu cầu giải thích lý do từ chối.
  2. Tiếp nhận chỉ đạo can thiệp (Human-in-the-loop Override) từ Assessor và ghi nhận lý do vào `AuditLog`.
  3. Soạn thảo công văn yêu cầu bổ sung chứng từ gửi cho khách hàng khi thiếu hóa đơn VAT hoặc bảng kê bị mờ.

---

## 4. Model Routing & Cấu Hình Gateway Độc Lập

Mastra sử dụng Provider tương thích OpenAI Gateway (`createOpenAI` từ `@ai-sdk/openai`), cho phép chuyển đổi linh hoạt không sửa mã:

- **Local Ollama:** `http://localhost:11434/v1` (mô hình `llama3.3`, `qwen2.5:32b`).
- **Ollama Cloud:** `http://ollama.com/v1` (mô hình `muse-spark-open:cloud`).
- **OpenRouter / vLLM / OpenAI:** Hoàn toàn tương thích thông qua `OPENAI_BASE_URL` và `OPENAI_API_KEY`.

---

## 5. Tích Hợp NestJS & Vercel AI SDK (Streaming Protocol)

1. **NestJS Service Adapter:**
   - `MastraService` quản lý vòng đời và thread pool của Mastra.
   - Đóng gói các bước workflow thành sự kiện SSE dạng chuẩn:
     - `event: step-start`
     - `event: tool-result`
     - `event: report-complete`
2. **Next.js Workstation (Dual-Pane UI):**
   - Sử dụng hook `useChat` từ `@ai-sdk/react`.
   - Client tự động parse SSE stream và hiển thị các thẻ Direct UI (`BenefitCard`, `Timeline`, `CitationPill`) tương ứng với từng chunk sự kiện.
