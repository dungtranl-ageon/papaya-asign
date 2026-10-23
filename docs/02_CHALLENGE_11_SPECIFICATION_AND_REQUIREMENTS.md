# 02. Chi tiết Yêu cầu AI Challenge 11 (Claim Assessment AI Agent)

Tài liệu này bóc tách chi tiết toàn bộ yêu cầu, bẫy chấm điểm, và giải quyết 6 câu hỏi kỹ thuật cốt lõi cho **AI Challenge 11**.

---

## 1. Bản chất & Mục tiêu Bài toán

- **Bối cảnh thực tế tại Papaya:**
  Một chuyên viên bồi thường (Assessor) phải xử lý khối lượng lớn hồ sơ claim mỗi ngày. Quy trình thẩm định thủ công bao gồm: đọc giấy ra viện, kiểm tra hóa đơn tài chính, đối chiếu bảng quyền lợi và các điều khoản loại trừ trong hợp đồng bảo hiểm, tính toán số tiền bảo hiểm chi trả (sau khi trừ deductible và copay), và viết báo cáo thẩm định. Quá trình này tiêu tốn **30–60 phút/hồ sơ**.
- **Mục tiêu của AI Agent:**
  Đóng vai trò là **"First-tier Assessor" (Thẩm định viên sơ cấp)**:
  1. Tự động gọi các công cụ nghiệp vụ để kiểm tra tính toàn vẹn của hồ sơ.
  2. Tra cứu hợp đồng bảo hiểm và kiểm tra tính hợp lý của chỉ định y khoa (Medical Necessity).
  3. Tính toán chính xác số tiền bồi thường và hạn mức còn lại.
  4. Xuất **Báo cáo thẩm định có cấu trúc (Structured Assessment Report)** kèm trích dẫn điều khoản hợp đồng cụ thể, giảm thời gian xử lý xuống **dưới 30 giây/hồ sơ**.

---

## 2. Làm rõ 6 Câu hỏi Kỹ thuật Cốt lõi

### Câu hỏi 1: Đây là 1 ứng dụng Chatbot thông thường hay SaaS có Floating Chatbox?

- **Bản chất nghiệp vụ:** Đây **KHÔNG PHẢI** là chatbot hỏi-đáp chém gió tự do như ChatGPT/Gemini, mà là một **Assessor Copilot Workstation (Giao diện thẩm định chuyên dụng)**.
- **Luồng tương tác:**
  - Assessor chọn một hồ sơ bồi thường (Claim ID).
  - Agent tự động kích hoạt chuỗi suy luận (ReAct / Tool Execution loop) theo trình tự bắt buộc.
  - Agent xuất Báo cáo thẩm định có cấu trúc lên màn hình.
  - Assessor có thể trao đổi trong khung chat để yêu cầu giải trình thêm (ví dụ: _"Tại sao ca này bị áp mức copay 20%?", "Hóa đơn viện phí có dấu mộc đỏ không?"_) hoặc can thiệp điều chỉnh (Human-in-the-loop Override).

### Câu hỏi 2: Có RAG (Retrieval-Augmented Generation) không?

- **Có RAG, nhưng theo mô hình Structured & Hierarchical RAG:**
  - Đề bài yêu cầu: _"Every point in the recommendation must cite the specific policy clause it relies on"_ và _"Agent must not hallucinate policy terms"_.
  - Hợp đồng bảo hiểm bao gồm: Bảng quyền lợi có cấu trúc (JSON) và Quy tắc & Điều khoản pháp lý (T&C) dạng văn bản dài.
  - **Giải pháp RAG tối ưu:** Tổ chức văn bản điều khoản theo cấu trúc phân cấp (Hierarchical ID, ví dụ: `CLAUSE-INPATIENT-LIMIT`, `CLAUSE-EXCL-COSMETIC`). Khi Agent gọi `lookupPolicy(policyId)`, hệ thống kết hợp tìm kiếm từ khóa metadata + ngữ nghĩa để trả về đúng phân đoạn điều khoản cần trích dẫn, đảm bảo độ chính xác 100% không bịa đặt.

### Câu hỏi 3: Có Scorer và Guardrails không?

- **BẮT BUỘC PHẢI CÓ:**
  1. **Deterministic Math Guardrail:** Cấm tuyệt đối việc để LLM tự tính nhẩm tiền trong prompt. Số tiền được bảo hiểm chi trả (`covered_amount`) bắt buộc phải nhận từ engine toán học `calculateBenefit()`.
  2. **Workflow Sequence Guardrail:** Agent phải tuân thủ đúng thứ tự:
     $$\text{verifyDocument} \rightarrow \text{lookupPolicy} \rightarrow \text{checkMedicalNecessity} \rightarrow \text{calculateBenefit}$$
  3. **Decision Guardrail (Bẫy đề bài):** Nếu phát hiện thiếu chứng từ hoặc chứng từ không hợp lệ, Agent **chỉ được phép chọn `REQUEST_MORE_INFO`**, tuyệt đối **không được chọn `REJECT`**.

### Câu hỏi 4: Có Integrate Direct UI (Generative UI) trong Chatbox không?

- **CÓ, đây là điểm tạo ấn tượng mạnh nhất:**
  - Áp dụng **Vercel AI SDK**: Khi Agent gọi tool `calculateBenefit`, trong khung chat sẽ render trực tiếp một **Interactive Card** hiển thị bảng chiết tính viện phí, biểu đồ hạn mức còn lại, và 2 nút hành động `[Chấp thuận bồi thường]` / `[Yêu cầu bổ sung chứng từ]` cho phép Assessor click ngay trong chat.

### Câu hỏi 5: Có các AI phụ trợ không?

- **Hệ thống kết hợp các AI chuyên biệt độc lập:**
  1. **PII Redactor:** Tự động che số CCCD, thẻ BHYT, tên riêng trước khi xử lý (tuân thủ Whitepaper Data Deletion).
  2. **Medical Coding Mapper:** Chuẩn hóa chẩn đoán dạng văn bản tự do của bác sĩ thành mã **ICD-10 chuẩn**.
  3. **Vision/OCR Extractor:** Bóc tách bảng kê viện phí và phát hiện chữ ký, mộc đỏ.
  4. **Document Forensics:** Phát hiện chỉnh sửa số tiền bằng ELA và phát hiện nộp trùng lặp bằng pHash.
  5. **Evaluator Judge:** Thẩm định chéo kiểm tra ảo giác và tính đúng đắn toán học trước khi hiển thị báo cáo.

### Câu hỏi 6: Có Skill và Tài liệu mẫu trên mạng không?

- **Có đầy đủ và đã được đồng bộ vào dự án:**
  - Tài liệu domain Papaya: [Medical_Insurance_101.md](../requirements/Software_Artisan_Handbook/resources/Medical_Insurance_101.md) và [Data_Deletion.md](../requirements/Whitepapers/Data_Deletion.md).
  - Danh mục chuẩn quốc tế: Bảng mã ICD-10 WHO và Mẫu giấy ra viện chuẩn Bộ Y Tế.
  - Hợp đồng bảo hiểm mẫu: Quy tắc bảo hiểm sức khỏe doanh nghiệp và cá nhân.

---

## 3. Đặc tả 4 Tools của Agent (Data Contracts)

```
                       [ Incoming Claim ]
                                │
                                ▼
    Step 1: verifyDocument(documentId)
            ├── Kiểm tra đầy đủ: Hóa đơn, Giấy ra viện, Toa thuốc
            └── Kiểm tra tính hợp lệ: Mộc đỏ, chữ ký, không tẩy xóa
                                │
                                ▼
    Step 2: lookupPolicy(policyId)
            ├── Kiểm tra thời hạn hiệu lực HĐ (Effective & Expiry Date)
            └── Lấy danh mục quyền lợi, hạn mức, thời gian chờ, loại trừ
                                │
                                ▼
    Step 3: checkMedicalNecessity(diagnosis, procedures)
            └── Đối chiếu mã ICD-10 với chỉ định điều trị y khoa
                                │
                                ▼
    Step 4: calculateBenefit(policyId, claimType, amount)
            └── Tính toán Deductible, Copay, Áp trần Hạn mức còn lại
                                │
                                ▼
          [ GENERATE STRUCTURED ASSESSMENT REPORT ]
```

### Chi tiết Input & Output của từng Tool:

1. **`verifyDocument(documentId: string)`**
   - _Mô tả:_ Xác thực tài liệu được nộp (loại chứng từ, tính hợp lệ, đầy đủ hay thiếu).
   - _Output:_
     ```json
     {
       "document_id": "DOC-001",
       "document_type": "discharge_summary",
       "status": "VALID", // VALID, INCOMPLETE, MISSING, SUSPICIOUS
       "has_official_stamp": true,
       "issues": []
     }
     ```

2. **`lookupPolicy(policyId: string)`**
   - _Mô tả:_ Lấy thông tin điều khoản, quyền lợi, hạn mức năm, copay và danh sách điều khoản loại trừ.
   - _Output:_
     ```json
     {
       "policy_id": "POL-2024-001",
       "status": "ACTIVE",
       "effective_date": "2024-01-01",
       "expiry_date": "2024-12-31",
       "annual_limit": 100000000,
       "balance_remaining": 85000000,
       "copay_percentage": 20,
       "waiting_period_days": 30,
       "exclusions": [
         {
           "clause_id": "EXCL-01",
           "description": "Phẫu thuật thẩm mỹ và các can thiệp thẩm mỹ tự chọn"
         },
         { "clause_id": "EXCL-02", "description": "Các bệnh có sẵn trong 12 tháng đầu tiên" }
       ]
     }
     ```

3. **`checkMedicalNecessity(diagnosis: string, procedures: string[])`**
   - _Mô tả:_ Kiểm tra tính hợp lý về mặt y khoa giữa chẩn đoán (ICD-10) và danh mục can thiệp/điều trị.
   - _Output:_
     ```json
     {
       "diagnosis": "J20.9 - Acute bronchitis",
       "is_appropriate": true,
       "flagged_procedures": [],
       "clinical_rationale": "Chỉ định điều trị khí dung và kháng sinh phù hợp với chẩn đoán viêm phế quản cấp."
     }
     ```

4. **`calculateBenefit(policyId: string, claimType: string, amount: number)`**
   - _Mô tả:_ Tính toán quyền lợi tài chính: số tiền bảo hiểm chi trả, số tiền khách tự trả (copay/deductible), hạn mức còn lại sau claim.
   - _Output:_
     ```json
     {
       "submitted_amount": 2500000,
       "covered_amount": 2000000,
       "copay_amount": 500000,
       "deductible_amount": 0,
       "member_pays": 500000,
       "remaining_annual_limit": 83000000,
       "calculation_explanation": "Áp dụng đồng chi trả 20% (500.000 VND). Bảo hiểm chi trả 80% (2.000.000 VND)."
     }
     ```

---

## 4. Định dạng Báo cáo Thẩm định Chuẩn (Assessment Report Format)

```json
{
  "assessment_id": "ASM-2024-0091",
  "claim_id": "CLM-2024-0102",
  "assessed_at": "2024-03-20T10:15:30Z",
  "document_review": {
    "total_submitted": 2,
    "status": "ALL_DOCUMENTS_VERIFIED",
    "details": [
      { "name": "Hóa đơn VAT", "status": "COMPLETE" },
      { "name": "Toa thuốc có chữ ký BS", "status": "COMPLETE" }
    ]
  },
  "policy_verification": {
    "is_active": true,
    "is_member_covered": true,
    "is_within_coverage_period": true,
    "waiting_period_passed": true
  },
  "medical_necessity": {
    "is_medically_necessary": true,
    "icd10_code": "J20.9",
    "rationale": "Điều trị phù hợp với phác đồ chuẩn của Bộ Y Tế."
  },
  "benefit_calculation": {
    "submitted_amount": 2500000,
    "covered_amount": 2000000,
    "copay_amount": 500000,
    "member_responsibility": 500000,
    "remaining_balance": 83000000
  },
  "recommendation": "APPROVE", // APPROVE | REJECT | REQUEST_MORE_INFO
  "reasoning": "Hồ sơ đầy đủ tính pháp lý, điều trị nằm trong phạm vi quyền lợi và không thuộc điểm loại trừ.",
  "policy_citations": [
    "Điều 4.1: Quyền lợi điều trị Ngoại trú theo HĐ POL-2024-001",
    "Điều 6.2: Quy định về tỷ lệ đồng chi trả 20% đối với người được bảo hiểm"
  ]
}
```

---

## 5. Tiêu chuẩn Đánh giá & Ranh giới Thao tác

| Tiêu chí                          | Đạt chuẩn bình thường   | Đạt chuẩn Xuất sắc (Target)                                                                                      |
| :-------------------------------- | :---------------------- | :--------------------------------------------------------------------------------------------------------------- |
| **Xử lý 3 Test Cases**            | Ra đúng kết quả chung   | Đúng 100% từng con số, trích dẫn đúng điều khoản và phân biệt rạch ròi giữa Reject và Request Info.              |
| **Tool Orchestration**            | Gọi đủ 4 tools          | Gọi tuần tự có phụ thuộc dữ liệu, log đầy đủ input/output của từng bước.                                         |
| **Chống Ảo giác (Hallucination)** | Nhắc đến tên điều khoản | Trích dẫn đúng nguyên văn mã điều khoản (`Clause ID`) từ kết quả lookup, không tự sáng tạo câu chữ.              |
| **Giao diện & Trải nghiệm**       | CLI hoặc log console    | **Direct Generative UI Web App** (Next.js), có thể bấm tương tác, xem trước tài liệu và phê duyệt claim tức thì. |
