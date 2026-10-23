# QUY CHUẨN KỸ THUẬT MASTRA CORE & AI AGENT (MASTRA ENGINEERING GUIDELINES)

Tài liệu này xác định các nguyên tắc, tiêu chuẩn kiến trúc bắt buộc và quy chuẩn an toàn cho toàn bộ hệ sinh thái **Mastra Core (`@mastra/core`)** trong dự án Papaya Claims Copilot.

---

## 1. Ranh Giới Kiến Trúc & Quy Tắc Khai Báo Bắt Buộc

### 1.1. Khai báo Tường minh (Explicit Declaration Rule)

- **NGHIÊM CẤM:** Gọi trực tiếp LLM hoặc viết logic phân tán mà không thông qua các lớp đối tượng chuẩn của Mastra.
- **BẮT BUỘC:**
  1. Mọi Agent phải được khởi tạo tường minh bằng `new Agent({ ... })` từ `@mastra/core/agent`.
  2. Mọi Workflow phải được khởi tạo bằng `createWorkflow({ ... })` và `createStep({ ... })` từ `@mastra/core/workflows`.
  3. Instance trung tâm `mastra` phải được đăng ký và xuất (export) tại [mastra.instance.ts](file:///Users/tranquocdung/Projects/papaya-asign/apps/api/src/modules/mastra/mastra.instance.ts) để toàn bộ hệ thống (NestJS, Tests, Tools) có thể tham chiếu và tái sử dụng.

```typescript
// apps/api/src/modules/mastra/mastra.instance.ts
import { Mastra } from '@mastra/core';
import { assessorCopilotAgent } from './agents/assessor.agent';
import { claimsAssessmentWorkflow } from './workflows/assessment.workflow';

export const mastra = new Mastra({
  agents: {
    assessorCopilotAgent,
  },
  workflows: {
    claimsAssessmentWorkflow,
  },
});
```

---

## 2. Phân Tách Bạch Minh: Workflow vs Agent

| Thành phần         | **Mastra Workflow (Tất định 100%)**                                  | **Mastra Agent (Đàm thoại & Trợ lý)**                            |
| :----------------- | :------------------------------------------------------------------- | :--------------------------------------------------------------- |
| **Bản chất**       | Đồ thị tất định (Deterministic Graph) khóa cứng 4 bước.              | Mô hình hội thoại thông minh hỗ trợ Chuyên viên Thẩm định.       |
| **Quyền hạn**      | Tính toán số học, kiểm tra chứng từ, đối soát điều khoản hợp đồng.   | Trích dẫn quy tắc, giải thích lý do khấu trừ, gợi ý override.    |
| **Độ tin cậy**     | 100% tất định, zero ảo giác, bảo toàn số học.                        | Có rào chắn Guardrail ngăn chặn rò rỉ thuật ngữ kỹ thuật nội bộ. |
| **Điểm can thiệp** | Tự động phát hiện bất thường và chuyển trạng thái `ACTION_REQUIRED`. | Tiếp nhận chỉ thị can thiệp từ con người (Human-In-The-Loop).    |

---

## 3. Quy Chuẩn Ngôn Ngữ & Rào Chắn An Toàn (Guardrails & Jargon Filter)

### 3.1. Ngôn ngữ Giao tiếp với Người dùng (Assessor Workstation)

- **BẮT BUỘC:** 100% câu chữ hiển thị trên màn hình và câu trả lời của AI phải sử dụng **ngôn ngữ nghiệp vụ giám định bảo hiểm y tế**:
  - _Hồ sơ yêu cầu bồi thường_, _Hạn mức quyền lợi năm_, _Mức đồng chi trả (Copay)_.
  - _Mức khấu trừ (Deductible)_, _Trần phụ ngạch (Sublimit)_, _Thời gian chờ (Waiting Period)_.
  - _Mã bệnh ICD-10_, _Phác đồ điều trị_, _Chứng từ bắt buộc (Giấy ra viện, Hóa đơn VAT, Bảng kê chi phí)_.
  - _Trích dẫn điều khoản hợp đồng bảo hiểm_.
- **NGHIÊM CẤM TUYỆT ĐỐI:** Không để lộ các thuật ngữ kỹ thuật nội bộ ra ngoài giao diện người dùng:
  - CẤM: `Mastra`, `Vercel AI SDK`, `NestJS`, `Prisma`, `SQLite`, `SSE`, `Zod`, `LLM Gateway`, `endpoint`, `JSON-RPC`.
  - Thay bằng: `Hệ thống thẩm định Papaya`, `Trợ lý thẩm định`, `Quy trình thẩm định tự động`, `Cơ sở dữ liệu nghiệp vụ`.

### 3.2. Cơ chế Lọc Rào chắn Tự động (Automated Sanitizer)

Mọi phản hồi từ `AssessorCopilotAgent` trước khi trả về client hoặc stream đều phải đi qua bộ lọc [jargon-filter.guardrail.ts](file:///Users/tranquocdung/Projects/papaya-asign/apps/api/src/modules/mastra/guardrails/jargon-filter.guardrail.ts):

```typescript
import { sanitizeUserFacingText } from '../guardrails/jargon-filter.guardrail';

const cleanResponse = sanitizeUserFacingText(rawLlmResponse);
```

---

## 4. Cơ Chế Human-In-The-Loop (HITL) & Xử Lý Quay Lui (Rollback)

1. **Khuyến nghị không phải Phán quyết Tối hậu:**
   - Kết quả từ 4 bước của Workflow chỉ là **Khuyến nghị (Recommendation)**.
   - Chuyên viên thẩm định (Assessor) là người giữ quyền phê duyệt cuối cùng.
2. **Xử lý khi phát hiện lỗi ở Bước trước:**
   - Nếu Workflow tự động hoàn tất nhưng Assessor phát hiện lỗi chứng từ ở Bước 1:
   - Assessor bấm nút **[Yêu cầu bổ sung chứng từ]** hoặc **[Từ chối hồ sơ]**.
   - Hành động này gửi lệnh override lên NestJS, tạo một bản ghi `AuditLog` bất biến, vô hiệu hóa đề xuất tự động và chuyển hồ sơ về trạng thái chờ xử lý lại.

---

## 5. Danh Mục Thư Mục Trong `apps/api/src/modules/mastra/`

```
apps/api/src/modules/mastra/
├── mastra.instance.ts               # Registry trung tâm khởi tạo Mastra (Singleton)
├── mastra.module.ts                 # NestJS Module đăng ký DI
├── mastra.service.ts                # Service điều phối SSE stream & Agent calls
├── agents/                          # Khai báo các Mastra Agent
│   └── assessor.agent.ts            # Agent Trợ lý Thẩm định Bồi thường
├── workflows/                       # Khai báo các Mastra Workflow và Steps
│   └── assessment.workflow.ts       # Đồ thị 4 bước thẩm định tuần tự
├── guardrails/                      # Rào chắn ngôn ngữ & an toàn nghiệp vụ
│   └── jargon-filter.guardrail.ts   # Bộ lọc thuật ngữ kỹ thuật nội bộ
├── prompts/                         # System prompts và templates chuẩn nghiệp vụ
│   └── assessor.prompts.ts
├── rag/                             # Dịch vụ trích xuất điều khoản hợp đồng
│   └── policy-rag.service.ts
├── scorers/                         # Bộ đánh giá chất lượng (Evals)
│   └── assessment.scorers.ts        # Math Conservation, Grounding, Confidence
└── tools/                           # Adapters kết nối 4 tools từ @papaya/mcp-server
    └── mcp.tools.ts
```
