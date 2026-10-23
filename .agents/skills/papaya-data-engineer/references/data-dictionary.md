# Papaya Enterprise Data Dictionary & Schema Specification

Tài liệu từ điển dữ liệu chuẩn hóa hệ thống thẩm định bồi thường Papaya Claims Copilot.

---

## 1. Bảng `policies` (Hợp Đồng Bảo Hiểm)

Lưu trữ thông tin hợp đồng bảo hiểm, đối tượng được bảo hiểm, hạn mức và quy tắc quyền lợi.

| Tên Cột              | Kiểu Dữ Liệu       | Ràng Buộc            | Ý Nghĩa Nghiệp Vụ & Mô Tả Chi Tiết                                        |
| :------------------- | :----------------- | :------------------- | :------------------------------------------------------------------------ |
| `id`                 | `VARCHAR(36)`      | `PRIMARY KEY`        | UUID định danh bản ghi hệ thống.                                          |
| `policyNumber`       | `VARCHAR(50)`      | `UNIQUE`, `NOT NULL` | Số hiệu hợp đồng (vd: `POL-GOLD-99882`, `POL-SILVER-11223`).              |
| `insuredName`        | `VARCHAR(255)`     | `NOT NULL`           | Họ tên người được bảo hiểm (chuẩn hóa Unicode).                           |
| `nationalId`         | `VARCHAR(20)`      | `NOT NULL`, `INDEX`  | Số CCCD/Hộ chiếu người được bảo hiểm.                                     |
| `planName`           | `VARCHAR(100)`     | `NOT NULL`           | Tên gói bảo hiểm (vd: `Healthcare Gold`, `Healthcare Silver`).            |
| `status`             | `VARCHAR(20)`      | `DEFAULT 'ACTIVE'`   | Trạng thái: `ACTIVE`, `LAPSED`, `TERMINATED`, `EXPIRED`.                  |
| `effectiveDate`      | `TIMESTAMP`        | `NOT NULL`           | Ngày bắt đầu có hiệu lực của hợp đồng (UTC).                              |
| `expiryDate`         | `TIMESTAMP`        | `NOT NULL`           | Ngày hết hạn của hợp đồng (UTC).                                          |
| `annualTotalLimit`   | `DOUBLE PRECISION` | `NOT NULL, >= 0`     | Tổng hạn mức chi trả bảo hiểm tối đa trong năm (VND).                     |
| `annualUsedAmount`   | `DOUBLE PRECISION` | `DEFAULT 0, >= 0`    | Số tiền bảo hiểm đã chi trả lũy kế trong năm (VND).                       |
| `exclusionsJson`     | `TEXT / JSONB`     | `DEFAULT '[]'`       | Mảng mã ICD-10 và thủ thuật y tế bị loại trừ (vd: `["K21", "Z41.1"]`).    |
| `benefitsJson`       | `TEXT / JSONB`     | `DEFAULT '[]'`       | Mảng các quy tắc quyền lợi theo nhóm (Inpatient, Surgery, Medication...). |
| `waitingPeriodsJson` | `TEXT / JSONB`     | `DEFAULT '{}'`       | Bản đồ quy định thời gian chờ theo ngày (vd: `{"SPECIAL_DISEASE": 180}`). |
| `createdAt`          | `TIMESTAMP`        | `DEFAULT NOW()`      | Thời điểm tạo bản ghi.                                                    |
| `updatedAt`          | `TIMESTAMP`        | `AUTO UPDATE`        | Thời điểm cập nhật bản ghi gần nhất.                                      |

### Cấu Trúc Chi Tiết Của `benefitsJson`

```json
[
  {
    "category": "SURGERY",
    "maxLimitPerClaim": 50000000,
    "maxLimitPerYear": 150000000,
    "copayRate": 0.2
  },
  {
    "category": "INPATIENT",
    "maxLimitPerClaim": 60000000,
    "maxLimitPerYear": 200000000,
    "copayRate": 0.1,
    "subLimitPerDay": 3000000
  }
]
```

---

## 2. Bảng `claims` (Hồ Sơ Yêu Cầu Bồi Thường)

Lưu trữ thông tin tiếp nhận hồ sơ viện phí do khách hàng nộp lên.

| Tên Cột                | Kiểu Dữ Liệu       | Ràng Buộc             | Ý Nghĩa Nghiệp Vụ & Mô Tả Chi Tiết                                          |
| :--------------------- | :----------------- | :-------------------- | :-------------------------------------------------------------------------- |
| `id`                   | `VARCHAR(36)`      | `PRIMARY KEY`         | UUID định danh bản ghi hệ thống.                                            |
| `claimId`              | `VARCHAR(50)`      | `UNIQUE`, `NOT NULL`  | Mã định danh hồ sơ bồi thường (vd: `CLM-2026-001`).                         |
| `policyNumber`         | `VARCHAR(50)`      | `FOREIGN KEY`         | Tham chiếu tới `policies(policyNumber)`.                                    |
| `patientName`          | `VARCHAR(255)`     | `NOT NULL`            | Họ tên bệnh nhân điều trị thực tế.                                          |
| `nationalId`           | `VARCHAR(20)`      | `NOT NULL`            | Số CCCD/Hộ chiếu của người khám bệnh.                                       |
| `hospitalName`         | `VARCHAR(255)`     | `NOT NULL`            | Tên cơ sở y tế / Bệnh viện điều trị.                                        |
| `admissionDate`        | `TIMESTAMP`        | `NOT NULL`            | Thời điểm nhập viện điều trị.                                               |
| `dischargeDate`        | `TIMESTAMP`        | `NOT NULL`            | Thời điểm xuất viện (bắt buộc $\ge$ `admissionDate`).                       |
| `diagnosisIcd10`       | `VARCHAR(20)`      | `NOT NULL, INDEX`     | Mã chẩn đoán quốc tế ICD-10 (vd: `K35`, `J20`).                             |
| `diagnosisDescription` | `TEXT`             | `NOT NULL`            | Mô tả lâm sàng / kết luận chẩn đoán ra viện.                                |
| `status`               | `VARCHAR(30)`      | `DEFAULT 'SUBMITTED'` | Trạng thái: `SUBMITTED`, `ASSESSING`, `APPROVED`, `REJECTED`, `OVERRIDDEN`. |
| `totalRequested`       | `DOUBLE PRECISION` | `NOT NULL, > 0`       | Tổng số tiền viện phí yêu cầu bồi thường (VND).                             |
| `totalApproved`        | `DOUBLE PRECISION` | `NULLABLE`            | Số tiền bồi thường thực tế sau thẩm định (VND).                             |
| `itemsJson`            | `TEXT / JSONB`     | `DEFAULT '[]'`        | Mảng các hóa đơn / khoản mục chi tiết viện phí.                             |
| `documentsJson`        | `TEXT / JSONB`     | `DEFAULT '[]'`        | Mảng danh mục tài liệu, giấy tờ y tế đính kèm.                              |
| `createdAt`            | `TIMESTAMP`        | `DEFAULT NOW()`       | Thời điểm nộp hồ sơ.                                                        |
| `updatedAt`            | `TIMESTAMP`        | `AUTO UPDATE`         | Thời điểm cập nhật trạng thái hồ sơ.                                        |

---

## 3. Bảng `assessments` (Báo Cáo Thẩm Định Tự Động & AI)

Lưu trữ kết quả thực thi luồng thẩm định tất định Mastra Workflow và phản hồi của Agent.

| Tên Cột                | Kiểu Dữ Liệu       | Ràng Buộc            | Ý Nghĩa Nghiệp Vụ & Mô Tả Chi Tiết                                         |
| :--------------------- | :----------------- | :------------------- | :------------------------------------------------------------------------- |
| `id`                   | `VARCHAR(36)`      | `PRIMARY KEY`        | UUID định danh bản ghi báo cáo.                                            |
| `assessmentId`         | `VARCHAR(50)`      | `UNIQUE`, `NOT NULL` | Mã phiên thẩm định (vd: `ASM-CLM-2026-001`).                               |
| `claimId`              | `VARCHAR(50)`      | `FOREIGN KEY`        | Tham chiếu tới `claims(claimId)`.                                          |
| `finalRecommendation`  | `VARCHAR(30)`      | `NOT NULL`           | Quyết định: `APPROVE`, `REJECT`, `REQUEST_MORE_INFO`, `MANUAL_ESCALATION`. |
| `confidenceScore`      | `DOUBLE PRECISION` | `0 <= x <= 100`      | Điểm độ tin cậy của thuật toán thẩm định (%).                              |
| `totalRequested`       | `DOUBLE PRECISION` | `NOT NULL`           | Tổng tiền đề nghị ban đầu (VND).                                           |
| `totalPayable`         | `DOUBLE PRECISION` | `NOT NULL, >= 0`     | Số tiền hệ thống chấp thuận chi trả (VND).                                 |
| `totalDeductions`      | `DOUBLE PRECISION` | `NOT NULL, >= 0`     | Số tiền khấu trừ (Loại trừ, Copay, Vượt trần) (VND).                       |
| `executiveSummary`     | `TEXT`             | `NOT NULL`           | Tóm tắt lý do và cơ sở thẩm định cho Assessor.                             |
| `stepsJson`            | `TEXT / JSONB`     | `NOT NULL`           | Chi tiết 4 bước thực thi Mastra Workflow.                                  |
| `breakdownJson`        | `TEXT / JSONB`     | `NOT NULL`           | Bảng kê chi tiết khấu trừ theo từng khoản mục.                             |
| `missingDocumentsJson` | `TEXT / JSONB`     | `DEFAULT '[]'`       | Danh sách các chứng từ bị thiếu cần bổ sung.                               |
| `assessedAt`           | `TIMESTAMP`        | `DEFAULT NOW()`      | Thời điểm hoàn thành báo cáo thẩm định.                                    |

---

## 4. Bảng `audit_logs` (Nhật Ký Kiểm Toán & Can Thiệp Chuyên Viên)

Bảo đảm tính minh bạch, lưu vết mọi hành động ghi đè hoặc phê duyệt (Human-in-the-Loop).

| Tên Cột      | Kiểu Dữ Liệu  | Ràng Buộc       | Ý Nghĩa Nghiệp Vụ & Mô Tả Chi Tiết                                   |
| :----------- | :------------ | :-------------- | :------------------------------------------------------------------- |
| `id`         | `VARCHAR(36)` | `PRIMARY KEY`   | UUID định danh dòng log.                                             |
| `claimId`    | `VARCHAR(50)` | `FOREIGN KEY`   | Tham chiếu tới `claims(claimId)`.                                    |
| `actorId`    | `VARCHAR(50)` | `NOT NULL`      | Định danh người thao tác (`ASSESSOR_01`, `SYSTEM_MASTRA`).           |
| `actorRole`  | `VARCHAR(30)` | `NOT NULL`      | Vai trò: `ASSESSOR`, `SUPERVISOR`, `AI_AGENT`, `AUDITOR`.            |
| `actionType` | `VARCHAR(50)` | `NOT NULL`      | Hành động: `ASSESSMENT_RUN`, `OVERRIDE_DECISION`, `APPROVE_PAYMENT`. |
| `oldValue`   | `TEXT`        | `NULLABLE`      | Giá trị trước khi thay đổi (JSON).                                   |
| `newValue`   | `TEXT`        | `NULLABLE`      | Giá trị sau khi can thiệp (JSON).                                    |
| `reason`     | `TEXT`        | `NULLABLE`      | Lý do chuyên viên quyết định ghi đè kết luận AI.                     |
| `timestamp`  | `TIMESTAMP`   | `DEFAULT NOW()` | Thời điểm phát sinh sự kiện kiểm toán.                               |
