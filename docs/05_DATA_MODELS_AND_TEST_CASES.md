# 05. Mô hình Dữ liệu & 3 Kịch bản Thẩm định (Data Models & Test Cases)

Tài liệu này định nghĩa chi tiết các schema dữ liệu cốt lõi (TypeScript / Zod) và đặc tả chi tiết **3 kịch bản kiểm thử (Test Cases)** bắt buộc của đề bài Challenge 11: `APPROVE`, `REJECT` và `REQUEST_MORE_INFO`.

---

## 1. Mô hình Dữ liệu Cốt lõi (Data Schemas)

### 1.1. Schema Hợp đồng Bảo hiểm (`Policy`)

```typescript
export interface PolicyBenefit {
  type: 'OUTPATIENT' | 'INPATIENT' | 'DENTAL' | 'MATERNITY';
  annual_limit: number; // Hạn mức tối đa/năm (-1 là không giới hạn)
  limit_per_event?: number; // Giới hạn chi trả tối đa cho 1 đợt điều trị
  limit_per_day?: number; // Giới hạn chi trả tiền phòng/ngày
  max_days_per_year?: number; // Số ngày nằm viện tối đa/năm
  waiting_period_days: number; // Thời gian chờ áp dụng cho quyền lợi này
}

export interface PolicyExclusion {
  clause_id: string; // Mã định danh điều khoản (VD: "CLAUSE-EXCL-01")
  category: string;
  description: string;
  keywords: string[];
}

export interface Policy {
  policy_id: string; // Mã hợp đồng (VD: "POL-2024-VN-001")
  policy_holder_name: string; // Tên Bên mua bảo hiểm (PO)
  insured_person_name: string; // Tên Người được bảo hiểm (IP)
  effective_date: string; // Ngày bắt đầu hiệu lực (ISO YYYY-MM-DD)
  expiry_date: string; // Ngày hết hạn (ISO YYYY-MM-DD)
  status: 'ACTIVE' | 'LAPSED' | 'TERMINATED';
  currency: string; // "VND" | "THB" | "USD"
  copay_percentage: number; // Tỷ lệ đồng chi trả của người bệnh (%)
  deductible_amount: number; // Mức khấu trừ/miễn thường hằng năm
  current_balance: number; // Hạn mức còn lại trong năm tính đến hiện tại
  benefits: Record<string, PolicyBenefit>;
  exclusions: PolicyExclusion[];
}
```

### 1.2. Schema Hồ sơ Yêu cầu Bồi thường (`Claim`)

```typescript
export interface ClaimDocument {
  document_id: string;
  document_type: 'HOSPITAL_RECEIPT' | 'DISCHARGE_SUMMARY' | 'PRESCRIPTION' | 'LAB_REPORT';
  file_url: string;
  submitted_at: string;
  has_stamp: boolean; // Có dấu mộc đỏ cơ sở y tế
  has_doctor_signature: boolean; // Có chữ ký bác sĩ điều trị
  extracted_total?: number; // Số tiền bóc tách từ hóa đơn
}

export interface Claim {
  claim_id: string; // Mã hồ sơ (VD: "CLM-2024-001")
  policy_id: string; // Mã hợp đồng liên kết
  member_id: string;
  claim_type: 'OUTPATIENT' | 'INPATIENT' | 'DENTAL';
  diagnosis_text: string; // Chẩn đoán của bác sĩ
  icd10_code: string; // Mã ICD-10 tương ứng
  treatment_date_start: string; // Ngày bắt đầu điều trị
  treatment_date_end: string; // Ngày kết thúc điều trị
  hospital_name: string; // Tên bệnh viện / phòng khám
  submitted_amount: number; // Tổng số tiền yêu cầu thanh toán
  documents: ClaimDocument[];
}
```

### 1.3. Schema Báo cáo Thẩm định của AI (`AssessmentReport`)

```typescript
export interface AssessmentReport {
  assessment_id: string;
  claim_id: string;
  assessed_at: string;

  // 1. Kết quả kiểm tra tài liệu
  document_review: {
    status: 'COMPLETE' | 'INCOMPLETE' | 'SUSPICIOUS';
    verified_documents_count: number;
    required_documents_missing: string[];
    notes: string;
  };

  // 2. Kết quả kiểm tra hợp đồng
  policy_verification: {
    policy_active: boolean;
    within_effective_dates: boolean;
    waiting_period_satisfied: boolean;
    has_sufficient_balance: boolean;
  };

  // 3. Đánh giá tính cần thiết y khoa
  medical_necessity: {
    is_appropriate: boolean;
    icd10: string;
    clinical_rationale: string;
  };

  // 4. Chi tiết tính toán quyền lợi
  benefit_calculation: {
    submitted_amount: number;
    covered_amount: number;
    deductible_applied: number;
    copay_amount: number;
    member_pays: number;
    remaining_balance_after_claim: number;
  };

  // 5. Khuyến nghị & Quyết định
  recommendation: 'APPROVE' | 'REJECT' | 'REQUEST_MORE_INFO';
  reasoning: string;

  // 6. Trích dẫn điều khoản hợp đồng cụ thể
  policy_citations: Array<{
    clause_id: string;
    citation_text: string;
  }>;
}
```

---

## 2. Chi tiết 3 Kịch bản Kiểm thử Thực chiến (3 Test Cases)

### Kịch bản 1: Phê duyệt Chấp thuận (`APPROVE`) — Ca Thường quy Đạt chuẩn

- **Mục tiêu:** Kiểm tra khả năng xử lý hồ sơ ngoại trú hợp lệ, tính đúng copay và giảm trừ hạn mức năm.
- **Thông tin Hồ sơ (Claim):**
  - `claim_id`: `CLM-2024-TC01`
  - `policy_id`: `POL-2024-GOLD-01` (Hiệu lực: `2024-01-01` đến `2024-12-31`).
  - `treatment_date`: `2024-03-20` (Đã qua thời gian chờ 30 ngày).
  - `claim_type`: `OUTPATIENT` (Ngoại trú).
  - `hospital_name`: Bệnh viện Đại học Y Dược TP.HCM.
  - `diagnosis`: Viêm phế quản cấp (`J20.9`).
  - `submitted_amount`: **2.500.000 VND**.
  - `documents`:
    1. Hóa đơn điện tử VAT BV ĐHYD (Đầy đủ mã tra cứu, dấu cơ quan thuế).
    2. Toa thuốc có chữ ký BS chuyên khoa hô hấp.
- **Quyền lợi Hợp đồng:**
  - Hạn mức ngoại trú: 5.000.000 VND / lần khám; Hạn mức năm còn lại: 45.000.000 VND.
  - Đồng chi trả (Copay): **20%**; Mức miễn thường (Deductible): 0 VND.
- **Kết quả Kỳ vọng của AI Agent:**
  - `recommendation`: **`APPROVE`**
  - `covered_amount`: **2.000.000 VND** (80% do bảo hiểm chi trả).
  - `copay_amount`: **500.000 VND** (20% do người bệnh tự chi trả).
  - `remaining_balance_after_claim`: **43.000.000 VND** ($45.000.000 - 2.000.000$).
  - `policy_citations`:
    - _"Điều 4.2: Quyền lợi điều trị Ngoại trú theo gói Gold Plus"_.
    - _"Điều 6.1: Tỷ lệ đồng chi trả 20% áp dụng cho dịch vụ ngoại trú tại bệnh viện công lập"_.

---

### Kịch bản 2: Từ chối Chi trả (`REJECT`) — Vi phạm Điều khoản Loại trừ

- **Mục tiêu:** Kiểm tra khả năng phát hiện thủ thuật y khoa thuộc danh mục loại trừ (Exclusion), trích dẫn đúng điều khoản từ chối mà không làm sai lệch số liệu.
- **Thông tin Hồ sơ (Claim):**
  - `claim_id`: `CLM-2024-TC02`
  - `policy_id`: `POL-2024-GOLD-01`.
  - `treatment_date`: `2024-04-10`.
  - `claim_type`: `INPATIENT` (Nội trú 2 ngày).
  - `hospital_name`: Bệnh viện Thẩm mỹ Kangnam.
  - `diagnosis`: Phẫu thuật tạo hình sống mũi cấu trúc kết hợp thu gọn cánh mũi (`Z41.1 - Other plastic surgery for unacceptable cosmetic appearance`).
  - `submitted_amount`: **35.000.000 VND**.
  - `documents`: Đầy đủ Hóa đơn tài chính, Giấy ra viện có chữ ký giám đốc bệnh viện và mộc đỏ.
- **Quyền lợi Hợp đồng:**
  - Điều khoản loại trừ số 8: `CLAUSE-EXCL-COSMETIC-01` quy định rõ: _Không chi trả cho mọi chi phí phẫu thuật thẩm mỹ, chỉnh hình nâng mũi, cắt mí hoặc can thiệp không nhằm mục đích điều trị bệnh lý/tai nạn_.
- **Kết quả Kỳ vọng của AI Agent:**
  - `recommendation`: **`REJECT`**
  - `covered_amount`: **0 VND**.
  - `member_pays`: **35.000.000 VND**.
  - `reasoning`: _"Chỉ định phẫu thuật tạo hình sống mũi thẩm mỹ không mang tính chất thiết yếu về mặt y khoa để điều trị bệnh lý hoặc tai nạn, thuộc điểm loại trừ tuyệt đối của hợp đồng."_
  - `policy_citations`:
    - _"Điều 8, Khoản 8.2: Danh mục loại trừ trách nhiệm bảo hiểm — Phẫu thuật thẩm mỹ và các thủ thuật chỉnh hình tự chọn"_.

---

### Kịch bản 3: Yêu cầu Bổ sung Chứng từ (`REQUEST_MORE_INFO`) — Bẫy Điểm của Đề bài

- **Mục tiêu:** Kiểm tra khả năng phát hiện thiếu chứng từ bắt buộc đối với ca nội trú, kích hoạt cơ chế `REQUEST_MORE_INFO` thay vì vội vàng từ chối (`REJECT`).
- **Thông tin Hồ sơ (Claim):**
  - `claim_id`: `CLM-2024-TC03`
  - `policy_id`: `POL-2024-GOLD-01`.
  - `treatment_date`: `2024-05-15` đến `2024-05-18` (3 ngày nằm viện).
  - `claim_type`: `INPATIENT` (Nội trú).
  - `hospital_name`: Bệnh viện Nhân dân Gia Định.
  - `diagnosis`: Viêm ruột thừa cấp đã phẫu thuật nội soi (`K35.8`).
  - `submitted_amount`: **22.000.000 VND**.
  - `documents`:
    1. Phiếu thu tạm ứng & Hóa đơn viện phí điện tử (Có dấu cơ quan).
    2. _(THIẾU)_: **Không có Giấy ra viện (Discharge Summary)** và Bảng kê chi tiết tiền giường/phẫu thuật.
- **Quy tắc Kiểm tra Chứng từ (Document Rule):**
  - Theo quy định điều trị nội trú: Bắt buộc phải có Giấy ra viện để xác định số ngày nằm viện thực tế và Bảng kê chi tiết viện phí để tách tiền giường/thuốc.
- **Kết quả Kỳ vọng của AI Agent:**
  - `recommendation`: **`REQUEST_MORE_INFO`** _(TUYỆT ĐỐI KHÔNG REJECT)_.
  - `covered_amount`: **0 VND** (Tạm treo chờ bổ sung chứng từ).
  - `required_documents_missing`:
    - _"Giấy ra viện (Bản gốc hoặc bản sao có chứng thực của Bệnh viện Gia Định)"_
    - _"Bảng kê chi tiết viện phí (Mẫu 01/BV ban hành kèm theo Thông tư Bộ Y tế)"_
  - `reasoning`: _"Hồ sơ điều trị nội trú viêm ruột thừa cấp cần Giấy ra viện để xác thực số ngày nằm viện thực tế và Bảng kê chi phí để thẩm định tiền phòng theo hạn mức hợp đồng. Yêu cầu thành viên bổ sung trong vòng 30 ngày."_
  - `policy_citations`:
    - _"Điều 11.2: Hồ sơ yêu cầu bồi thường đối với trường hợp điều trị nội trú"_.

---

## 3. Bảng Đối soát Tiêu chí Đánh giá Tự động (Automated Test Assertions)

| Chỉ số Assert               | Test Case 1 (`APPROVE`) | Test Case 2 (`REJECT`)  | Test Case 3 (`REQUEST_MORE_INFO`) |
| :-------------------------- | :---------------------: | :---------------------: | :-------------------------------: |
| `report.recommendation`     |       `'APPROVE'`       |       `'REJECT'`        |       `'REQUEST_MORE_INFO'`       |
| `report.covered_amount`     |        `2000000`        |           `0`           |                `0`                |
| `report.copay_amount`       |        `500000`         |           `0`           |                `0`                |
| `tool_calls.verifyDocument` |     Status: `VALID`     |     Status: `VALID`     |       Status: `INCOMPLETE`        |
| `tool_calls.checkNecessity` | `is_appropriate: true`  | `is_appropriate: false` |      `is_appropriate: true`       |
| `policy_citations.length`   |         $\ge 1$         |         $\ge 1$         |              $\ge 1$              |
