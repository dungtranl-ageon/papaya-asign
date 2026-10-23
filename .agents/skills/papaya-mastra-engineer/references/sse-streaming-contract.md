# Server-Sent Events (SSE) Streaming Contract

Đặc tả giao thức truyền dữ liệu thời gian thực (SSE Protocol) giữa NestJS Mastra Service (`apps/api`) và Next.js Workstation (`apps/web` - `@ai-sdk/react`).

---

## 1. Kiến Trúc Luồng Sự Kiện

```text
Next.js (useChat / EventSource)               NestJS Mastra Controller
             │                                         │
             │─── POST /claims/:id/assess (SSE) ──────>│
             │                                         │── Kích hoạt Workflow
             │<── HTTP 200 (text/event-stream) ────────│
             │                                         │
             │<── event: VERIFY_DOCUMENT_START ────────│
             │<── event: VERIFY_DOCUMENT_COMPLETE ─────│── Render Tick Xanh
             │                                         │
             │<── event: LOOKUP_POLICY_START ──────────│
             │<── event: LOOKUP_POLICY_COMPLETE ───────│── Render Citations
             │                                         │
             │<── event: CHECK_NECESSITY_COMPLETE ─────│
             │<── event: CALCULATE_BENEFIT_COMPLETE ───│── Render BenefitCard
             │                                         │
             │<── event: WORKFLOW_FINISHED ────────────│── Render Final Report
             │                                         │
             │─── Stream Complete ─────────────────────│
```

---

## 2. Cấu Trúc Khung Tin Nhắn Chuẩn (Message Frame Format)

Mỗi khung sự kiện tuân theo chuẩn W3C Server-Sent Events:

```text
id: <uuid_or_timestamp>
event: <EVENT_TYPE>
data: {"event":"<EVENT_TYPE>","timestamp":"<ISO8601>","payload":{ ... }}

```

### Danh Mục Các Event Types

| Event Type                         | Ý Nghĩa Nghiệp Vụ                  | Dữ Liệu Payload                                                      |
| :--------------------------------- | :--------------------------------- | :------------------------------------------------------------------- |
| `VERIFY_DOCUMENT_START`            | Bắt đầu kiểm tra chứng từ y tế     | `{ claimId: string }`                                                |
| `VERIFY_DOCUMENT_COMPLETE`         | Hoàn tất kiểm tra chứng từ         | `VerifyDocumentResult` (danh sách loại chứng từ thiếu, cờ hợp lệ)    |
| `LOOKUP_POLICY_START`              | Bắt đầu tra cứu hợp đồng bảo hiểm  | `{ policyNumber: string }`                                           |
| `LOOKUP_POLICY_COMPLETE`           | Hoàn tất đối chiếu hợp đồng        | `LookupPolicyResult` (tình trạng hiệu lực, danh sách loại trừ)       |
| `CHECK_MEDICAL_NECESSITY_COMPLETE` | Kết quả đối soát phác đồ y khoa    | `CheckNecessityResult` (điểm lâm sàng, cờ cảnh báo quá ngày giường)  |
| `CALCULATE_BENEFIT_COMPLETE`       | Bảng chiết tính tài chính chi tiết | `CalculateBenefitResult` (số tiền bảo hiểm chi trả, khấu trừ, copay) |
| `WORKFLOW_FINISHED`                | Hoàn tất toàn bộ thẩm định         | `AssessmentReport` đầy đủ theo Zod schema                            |
| `WORKFLOW_ERROR`                   | Xảy ra sự cố trong quá trình xử lý | `{ code: string, message: string, step: string }`                    |

---

## 3. Khả Năng Chống Chịu Lỗi & Graceful Degradation

1. **Heartbeat / Ping:**
   - Cứ mỗi 15 giây, nếu bước tính toán của LLM kéo dài, NestJS phát chunk bình luận `: ping` để giữ kết nối không bị đóng bởi Reverse Proxy (Nginx / Cloudflare).
2. **Error Boundary:**
   - Nếu LLM API timeout hoặc Ollama không phản hồi trong 30 giây:
     - Workflow **KHÔNG crash** đột ngột.
     - Hệ thống tự động fallback sử dụng Pure Logic kết quả của 4 bước MCP Tools để tạo báo cáo cơ bản, gán `finalRecommendation: 'MANUAL_ESCALATION'` và gửi sự kiện kết thúc luồng an toàn.
