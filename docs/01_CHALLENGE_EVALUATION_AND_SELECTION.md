# 01. Phân tích & Lựa chọn Thử thách (Challenge Evaluation & Selection)

Tài liệu này tổng hợp phân tích toàn diện 15 bài thử thách trong repository [pumpkin](file:///Users/tranquocdung/Projects/papaya-asign/requirements) của Papaya Insurtech và đưa ra cơ sở lựa chọn chiến lược để đạt đúng **3 điểm** theo yêu cầu tuyển dụng.

---

## 1. Quy định Tuyển dụng Cốt lõi của Papaya Insurtech

1. **Nguyên tắc "Đúng 3 Points":**
   - Beginner = 1 điểm (bài 01 - 05).
   - Intermediate = 2 điểm (bài 06, 07, 09).
   - Advanced = 3 điểm (bài 08, 10, 11, 12, 13, 14, 15).
   - Thí sinh phải nộp: **Đúng 1 bài Advanced (3đ)** HOẶC **1 bài Intermediate (2đ) + 1 bài Beginner (1đ)** HOẶC **3 bài Beginner (1đ)**.
   - _Ghi chú từ đề bài:_ Đối với ứng viên Senior, hội đồng tuyển dụng kỳ vọng chọn **1 bài Advanced** để thể hiện năng lực thiết kế phần mềm và phán đoán kỹ thuật; việc nộp 3 bài Beginner từ ứng viên Senior sẽ bị đánh giá là né tránh bài toán khó.
2. **Quy tắc AI-Agent-First & Nghiêm cấm "One-shotting":**
   - Papaya hoạt động với văn hóa AI-first (toàn bộ đội ngũ dùng Claude Code, Cursor hàng ngày).
   - Đề bài cấm tuyệt đối việc copy-paste đề bài cho AI sinh code rồi nộp nguyên bản ("One-shotting" = Trượt 100%).
   - Thí sinh đóng vai trò **Director & Evaluator**: chỉ đạo AI, phân rã bài toán, bắt lỗi edge cases, và chịu trách nhiệm về chất lượng từng dòng code.
3. **Quy định BẮT BUỘC về AI Conversation Log:**
   - Nộp kèm toàn bộ tin nhắn/lịch sử hội thoại nguyên văn với AI coding agent. Không có log hội thoại = Đánh trượt tự động (Auto-fail).

---

## 2. Bảng Ma trận So sánh 15 Bài thử thách

|   Mã   | Tên Thử thách                                                                                               | Điểm | Type Kỹ thuật                   | Độ khó | Thời gian ước tính | Tiêu chí đánh giá trọng tâm                                                          | Khả năng liên kết luồng      |
| :----: | :---------------------------------------------------------------------------------------------------------- | :--: | :------------------------------ | :----: | :----------------: | :----------------------------------------------------------------------------------- | :--------------------------- |
| **01** | [Plan Comparison Page](../requirements/Hiring/AI_Engineering_Challenges/AI_Challenge_01.md)                 |  1   | Frontend / Responsive UI        |  1/5   |        2–3h        | Bảng so sánh 3 gói, badge Recommended tự động, mobile stack.                         | Ghép với 05, 06, 07          |
| **02** | [Claims Data Cleanup & Report](../requirements/Hiring/AI_Engineering_Challenges/AI_Challenge_02.md)         |  1   | Data Script / Pandas / Node.js  |  2/5   |        2–3h        | Dọn 500 dòng CSV bẩn (15-20% lỗi kép), báo cáo Before/After.                         | Ghép với 09                  |
| **03** | [Claim Notification Email Templates](../requirements/Hiring/AI_Engineering_Challenges/AI_Challenge_03.md)   |  1   | HTML Email / Templating         | 1.5/5  |        2–3h        | 6 template email vòng đời claim, biến nội suy, web preview.                          | Ghép với 07, 14              |
| **04** | [Insurance Glossary Search App](../requirements/Hiring/AI_Engineering_Challenges/AI_Challenge_04.md)        |  1   | Frontend / Search UX            | 1.5/5  |        2–3h        | Từ điển 40 thuật ngữ, tìm kiếm full-text, A-Z jump, chạy offline.                    | Kém (độc lập)                |
| **05** | [Policy Summary Generator](../requirements/Hiring/AI_Engineering_Challenges/AI_Challenge_05.md)             |  1   | Data Transform / Document UI    |  2/5   |        2–4h        | Render JSON hợp đồng ra trang tóm tắt quyền lợi (SOB), linh hoạt 2 JSON.             | Ghép rất tốt với 06          |
| **06** | [Policy Benefits Calculator](../requirements/Hiring/AI_Engineering_Challenges/AI_Challenge_06.md)           |  2   | Business Engine / Unit Testing  |  3/5   |        2–4h        | Tính toán chi trả 20 hóa đơn, Deductible, Copay, Limit, 10 Unit Tests.               | Ghép hoàn hảo với 01, 05, 07 |
| **07** | [Claims Intake Wizard](../requirements/Hiring/AI_Engineering_Challenges/AI_Challenge_07.md)                 |  2   | Complex Form / UX Logic         |  3/5   |        3–5h        | Form nộp claim 5 bước, logic động theo loại claim, autocomplete ICD-10.              | Ghép với 06, 03              |
| **09** | [Claims Analytics Dashboard](../requirements/Hiring/AI_Engineering_Challenges/AI_Challenge_09.md)           |  2   | Data Viz / Frontend Dashboard   |  3/5   |        3–5h        | Dashboard 5.000 claims, 6 chart, global filter đồng bộ, drill-down table.            | Ghép với 02                  |
| **08** | [Medical Document Extractor](../requirements/Hiring/AI_Engineering_Challenges/AI_Challenge_08.md)           |  3   | AI Vision / Prompt Engineering  |  4/5   |        4–6h        | Phân loại 4 loại giấy tờ, trích xuất JSON kèm confidence score, validate tổng tiền.  | Độc lập (3 điểm)             |
| **10** | [Fraud Detection Scoring Engine](../requirements/Hiring/AI_Engineering_Challenges/AI_Challenge_10.md)       |  3   | Statistical / Rule Engine       |  4/5   |        4–6h        | 8 rule gian lận trên 2.000 claims, đạt Recall ≥70%, FPR ≤20%, <30s.                  | Độc lập (3 điểm)             |
| **11** | [Claim Assessment AI Agent](../requirements/Hiring/AI_Engineering_Challenges/AI_Challenge_11.md)            |  3   | Agentic AI / Tool Orchestration | 4.5/5  |        6–8h        | Agent gọi 4 tools theo trình tự, lý luận, xuất báo cáo trích dẫn điều khoản.         | Độc lập (3 điểm)             |
| **12** | [Multi-Country Regulatory Rule Engine](../requirements/Hiring/AI_Engineering_Challenges/AI_Challenge_12.md) |  3   | Architecture / Config as Code   |  4/5   |        4–6h        | Engine kiểm tra tuân thủ đa quốc gia (VN, TH, HK), rule diff, rule versioning.       | Độc lập (3 điểm)             |
| **13** | [Partner Integration SDK](../requirements/Hiring/AI_Engineering_Challenges/AI_Challenge_13.md)              |  3   | SDK / API Design / TypeScript   |  4/5   |        5–7h        | TS SDK kèm Mock Server, tự refresh JWT, tự retry 503 exponential backoff.            | Độc lập (3 điểm)             |
| **14** | [Claims Workflow Orchestrator](../requirements/Hiring/AI_Engineering_Challenges/AI_Challenge_14.md)         |  3   | State Machine / RBAC Engine     | 4.5/5  |        5–8h        | State machine 8 trạng thái, preconditions, audit trail bất biến, cycle detection ≤3. | Độc lập (3 điểm)             |
| **15** | [Multi-Tenant Configuration Platform](../requirements/Hiring/AI_Engineering_Challenges/AI_Challenge_15.md)  |  3   | Fullstack SaaS / Admin Engine   |  5/5   |        5–8h        | Nền tảng multi-tenant, config diff, versioning rollback, runtime claim processing.   | Độc lập (3 điểm)             |

---

## 3. Cơ sở Lựa chọn Chiến lược: Tại sao chọn AI Challenge 11?

### Lý do 1: Phù hợp tuyệt đối với Văn hóa "AI-Agent-First" của Papaya

Papaya định nghĩa văn hóa làm việc xoay quanh các AI Agent (xem [Software_Artisan_Handbook.md](../requirements/Software_Artisan_Handbook/Software_Artisan_Handbook.md)). Bài 11 đòi hỏi thí sinh phải thiết kế một **AI Agent tự hành (Autonomous Agent)** có khả năng sử dụng công cụ (Tool Calling), tư duy suy luận có kiểm soát, và sản sinh ra báo cáo thẩm định chuẩn xác.

### Lý do 2: Bao trùm toàn diện Domain Bảo hiểm Sức khỏe (Medical Insurance 101)

Bài 11 tích hợp toàn bộ các khái niệm nghiệp vụ bảo hiểm phức tạp nhất:

- Phân loại bồi thường thực thanh (Reimbursement) vs Bảo lãnh (Direct Billing).
- Cân đối hạn mức năm (`Annual Limit`), số dư khả dụng (`Balance = Limit - Claimed`), mức miễn thường (`Deductible`), và tỷ lệ đồng chi trả (`Co-payment`).
- Phân biệt rõ điểm loại trừ (`Exclusions`) và thời gian chờ (`Waiting Periods`).
- Nhận thức rủi ro: **Thiếu chứng từ thì yêu cầu bổ sung (`REQUEST_MORE_INFO`), tuyệt đối không được từ chối (`REJECT`)**.

### Lý do 3: Chuẩn bị trực tiếp cho Vòng Phỏng vấn Trực tiếp (Interview Day)

Theo tài liệu đề bài, trong ngày phỏng vấn trực tiếp, ứng viên sẽ phải live-code giải quyết 1 trong 4 bài toán:

1. Phát hiện tài liệu giả mạo do AI tạo.
2. Phát hiện tài liệu bị chỉnh sửa/tẩy xóa sau khi scan.
3. Tối ưu chi phí bóc tách tài liệu y tế (Flue + Gemini).
4. Xây dựng pipeline bóc tách Giấy ra viện (Hospital Discharge Paper) đạt độ chính xác cao.

Việc triển khai **AI Challenge 11** kết hợp với các **AI phụ trợ (OCR, Document Forensics, ICD-10 Normalizer)** chính là bước chuẩn bị hoàn hảo nhất để tự tin bước vào vòng phỏng vấn thực chiến.
