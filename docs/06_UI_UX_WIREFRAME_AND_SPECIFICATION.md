# 06. Đặc tả Thiết kế UI/UX & Wireframe Chi tiết (UI/UX Wireframe & Component Specification)

Tài liệu này đặc tả chi tiết toàn bộ kiến trúc giao diện người dùng (UI), trải nghiệm thao tác (UX), bố cục wireframe dạng trực quan, hệ thống component và các modal/drawer cho hệ thống **Papaya Claims Assessment Copilot Workstation**.

---

## 1. Triết lý Thiết kế & Định vị Sản phẩm

* **Đối tượng sử dụng chính (Persona):** Chuyên viên thẩm định bồi thường bảo hiểm (**Claims Assessor**), Trưởng nhóm bồi thường (**Team Lead**), và Giám sát viên tuân thủ (**Compliance Auditor**).
* **Mục tiêu UX:**
  * Giảm thời gian thao tác thẩm định từ 30–60 phút xuống **dưới 1 phút/hồ sơ**.
  * Mô hình **Dual-Brain Collaboration**: Màn hình làm việc chia đôi (Split View) — Bên trái hiển thị bằng chứng hồ sơ thực tế (Ground-Truth Documents), bên phải là Trợ lý AI Agent tương tác trực tiếp qua **Direct Generative UI**.
  * **Zero Surprise & Zero Hallucination:** Mọi đề xuất của AI đều phải có visual badge minh bạch, kèm liên kết trích dẫn điều khoản hợp đồng (`Clause ID`) có thể bấm xem ngay lập tức.
  * **Tương tác bàn phím (Keyboard-First):** Hỗ trợ phím tắt điều hướng nhanh (`Cmd + K` tìm kiếm, `Cmd + Enter` duyệt nhanh, `Esc` đóng modal).

---

## 2. Bản đồ Cấu trúc Điều hướng (Information Architecture - IA)

```
[ Claims Assessment Copilot ]
├── 1. Global Navigation Bar (Header)
│   ├── Tenant & Country Switcher (VN / TH / HK)
│   ├── Quick Search (Claim ID, Member Name, ICD-10)
│   ├── AI Engine Status Indicator (Claude / Gemini / Docker Microservices)
│   └── User Profile & Role Badge (Assessor / Team Lead)
│
├── 2. Primary Screen 1: Claims Queue & Ingestion Inbox
│   ├── KPI Summary Cards (Pending, Need Info, Auto-Approved, High Risk)
│   ├── Multi-dimensional Filter Bar (Status, Claim Type, Amount Range, SLA Risk)
│   └── Claims Data Table with Fast Preview
│
├── 3. Primary Screen 2: Dual-Pane Assessment Workstation (Trọng tâm)
│   ├── Left Pane: Ground-Truth Dossier (Hồ sơ chứng từ y tế)
│   │   ├── Member & Policy Context Card
│   │   ├── Treatment & Medical Diagnosis Card (ICD-10 Badge)
│   │   └── Interactive Document Inspector (PDF/Image Viewer, OCR Layer, Zoom/Pan, ELA Forensics)
│   │
│   └── Right Pane: AI Copilot & Generative UI Chatbox (Vercel AI SDK)
│       ├── Streaming Agent Reasoning & Tool Calls Sequence Bar
│       ├── Generative Card: verifyDocument Result
│       ├── Generative Card: lookupPolicy & Citations
│       ├── Generative Card: checkMedicalNecessity Evaluation
│       ├── Generative Card: Benefit Calculation Breakdown (Interactive Slider)
│       └── Final Decision Action Box (APPROVE / REJECT / REQUEST_MORE_INFO)
│
├── 4. Secondary Views & Drawers
│   ├── Policy Wording & T&C Hierarchical Browser (Drawer phải)
│   ├── Immutable Audit Trail & Timeline (Drawer dưới)
│   └── Forensics & Duplicate Image Inspector (Modal)
│
└── 5. Action Modals (Human-In-The-Loop)
    ├── Modal A: Phê duyệt Bồi thường (Approve Confirmation & Payout Schedule)
    ├── Modal B: Từ chối Bồi thường (Rejection Notice & Appeal Deadline)
    ├── Modal C: Yêu cầu Bổ sung Tài liệu (Missing Document Checklist & SMS/Email Link)
    └── Modal D: Ghi đè Số tiền / Quyết định (Manual Override Justification)
```

---

## 3. Wireframe Màn hình 1: Danh sách Hồ sơ Bồi thường (Claims Queue & Inbox)

Màn hình đầu tiên khi Assessor đăng nhập hệ thống, hiển thị danh sách hồ sơ bồi thường cần xử lý, cảnh báo hạn xử lý (SLA) và cờ rủi ro gian lận.

```
+----------------------------------------------------------------------------------------------------------------------------------+
| [LOGO] PAPAYA INSURTECH | Claims Copilot          [Tenant: Vietnam - Gold] [Search: Claim, Member...]  [AI: ACTIVE] [Assessor: Dung]|
+----------------------------------------------------------------------------------------------------------------------------------+
|  KPIs: [ 42 Pending Review ]  |  [ 15 Need More Info ]  |  [ 128 Approved Today ]  |  [ 4 High Risk / SLA Warning (⚠️) ]          |
+----------------------------------------------------------------------------------------------------------------------------------+
|  FILTERS: [All Types v]  [All Insurers v]  [Date Range: Last 30 Days v]  [Sort: SLA Urgency v]            [+ Export CSV] [Refresh] |
+----------------------------------------------------------------------------------------------------------------------------------+
| [ ] CLAIM ID      | MEMBER NAME     | CLAIM TYPE  | DIAGNOSIS / ICD-10     | AMOUNT (VND) | SLA REMAINING | RISK | ACTION            |
|----------------------------------------------------------------------------------------------------------------------------------|
| [ ] CLM-2024-TC01 | Trần Quốc Dũng  | OUTPATIENT  | Viêm phế quản (J20.9)  |    2,500,000 | 2 ngày còn lại| LOW  | [ Thẩm định Ngay ]|
| [ ] CLM-2024-TC02 | Lê Thị Mai      | INPATIENT   | Nâng mũi cấu trúc (Z41)|   35,000,000 | 5 ngày còn lại| HIGH | [ Thẩm định Ngay ]|
| [ ] CLM-2024-TC03 | Phạm Hoàng Nam  | INPATIENT   | Viêm ruột thừa (K35.8) |   22,000,000 | 1 ngày (Gấp!) | MED  | [ Thẩm định Ngay ]|
| [ ] CLM-2024-0094 | Vũ Minh Khang   | DENTAL      | Cạo vôi răng           |      450,000 | 8 ngày còn lại| LOW  | [ Thẩm định Ngay ]|
| [ ] CLM-2024-0095 | Nguyễn Thu Hà   | OUTPATIENT  | Viêm dạ dày (K29.7)    |    1,850,000 | 4 ngày còn lại| LOW  | [ Thẩm định Ngay ]|
+----------------------------------------------------------------------------------------------------------------------------------+
| Showing 1 - 5 of 42 claims                                                             [<<] [<] [1] [2] [3] [>] [>>]  Rows/page: 10 |
+----------------------------------------------------------------------------------------------------------------------------------+
```

---

## 4. Wireframe Màn hình 2: Assessment Workstation (Dual-Pane Split View)

Đây là **màn hình trọng tâm số 1 của ứng dụng**. Màn hình chia theo tỷ lệ 50:50 hoặc 55:45:
* **Cột trái:** Hồ sơ gốc, dữ liệu y tế, trình xem ảnh hóa đơn / giấy ra viện có layer OCR.
* **Cột phải:** Khung chat AI Copilot với các thẻ **Direct Generative UI** hiển thị theo thời gian thực khi Agent gọi từng tool.

```
+----------------------------------------------------------------------------------------------------------------------------------+
| [<- Back to Queue]  Claim: CLM-2024-TC01 | Member: Trần Quốc Dũng | Policy: POL-2024-GOLD-01 (ACTIVE)      [Audit Log] [Policy T&C] |
+----------------------------------------------------------------------------------------------------------------------------------+
|               LEFT PANE: GROUND-TRUTH DOSSIER                |               RIGHT PANE: AI COPILOT WORKSTATION                  |
|--------------------------------------------------------------|-------------------------------------------------------------------|
| [1. THÔNG TIN HỢP ĐỒNG & THÀNH VIÊN]                         | [AI STATUS: Reasoning Completed in 1.4s] [Tokens: 840]            |
| • Policy: Gói Sức Khỏe Toàn Diện Gold (HĐ Doanh nghiệp)      |                                                                   |
| • Hiệu lực: 01/01/2024 -> 31/12/2024 | Thời gian chờ: Đạt   | [Agent Step 1: verifyDocument]                                    |
| • Hạn mức năm: 100,000,000 VND | Số dư còn lại: 45,000,000   | +---------------------------------------------------------------+ |
| • Hạn mức ngoại trú/lần: 5,000,000 VND | Copay: 20%          | | [OK] 2/2 Chứng từ Hợp lệ | Dấu mộc: Có | Forensics: Sạch (99%) | |
|--------------------------------------------------------------| | - Hóa đơn VAT điện tử BV ĐHYD (DOC-01): Khớp số tiền 2.500.000 | |
| [2. CHẨN ĐOÁN & ĐIỀU TRỊ]                                    | | - Toa thuốc BS CKI (DOC-02): Khớp chỉ định điều trị             | |
| • Chẩn đoán BS: "Viêm phế quản cấp"                          | +---------------------------------------------------------------+ |
| • Mã ICD-10 chuẩn hóa: [ J20.9 - Acute Bronchitis ] (98%)    |                                                                   |
| • Cơ sở y tế: BV Đại học Y Dược TP.HCM                       | [Agent Step 2: lookupPolicy & checkMedicalNecessity]              |
| • Ngày khám: 20/03/2024 | Ngày nộp hồ sơ: 22/03/2024         | +---------------------------------------------------------------+ |
|--------------------------------------------------------------| | [PASS] Hợp đồng Active | Đã qua 30 ngày thời gian chờ           | |
| [3. BỘ CHỨNG TỪ ĐÍNH KÈM (2 FILE)]                           | | [PASS] Chỉ định thuốc & khí dung phù hợp với mã ICD-10 J20.9   | |
| [Tab: Hoa_don_VAT.pdf]  [Tab: Toa_thuoc.jpg]                 | | [PASS] Không rơi vào điểm loại trừ (Non-exclusion)             | |
| +----------------------------------------------------------+ | +---------------------------------------------------------------+ |
| | [Toolbar: Zoom In | Zoom Out | Rotate | Toggle OCR Layer]| |                                                                   |
| | ======================================================== | | [Agent Step 3: calculateBenefit (Direct Generative Card)]         |
| |                 HÓA ĐƠN GIÁ TRỊ GIA TĂNG                 | | +---------------------------------------------------------------+ |
| | Bệnh viện Đại học Y Dược TP.HCM       Mẫu số: 01GTKT0/001| | | BẢNG CHIẾT TÍNH QUYỀN LỢI CHI TRẢ (VND)                       | |
| | Bệnh nhân: Trần Quốc Dũng             Ngày: 20/03/2024   | | | ------------------------------------------------------------- | |
| |                                                          | | | • Số tiền yêu cầu (Claimed):                     2,500,000    | |
| | 1. Khám chuyên khoa hô hấp:                   300.000 đ  | | | • Mức miễn thường (Deductible):                          0    | |
| | 2. Xét nghiệm X-quang phổi thẳng:             450.000 đ  | | | • Đồng chi trả thành viên chịu (Copay 20%):       -500,000    | |
| | 3. Thuốc theo toa (Kháng sinh, kháng viêm): 1.750.000 đ  | | | ------------------------------------------------------------- | |
| | -------------------------------------------------------- | | | => BẢO HIỂM DUYỆT CHI TRẢ (80%):              2,000,000    | |
| | TỔNG CỘNG THANH TOÁN:                       2.500.000 đ  | | | • Hạn mức năm còn lại sau claim:                43,000,000    | |
| | [ DẤU MỘC TRÒN XÁC NHẬN CỦA BỆNH VIỆN - VALID ]         | | +---------------------------------------------------------------+ |
| +----------------------------------------------------------+ |                                                                   |
| [OCR Extracted Key-Values]                                   | [ĐỀ XUẤT QUYẾT ĐỊNH CỦA AI: APPROVE (CHẤP THUẬN)]                |
| • Hospital: BV ĐHYD TP.HCM (Conf: 0.99)                      | Trích dẫn căn cứ hợp đồng:                                        |
| • Date: 2024-03-20 (Conf: 0.98) | Total: 2,500,000 (Conf:0.99)| • [Điều 4.2: Quyền lợi Ngoại trú gói Gold Plus]                   |
|                                                              | • [Điều 6.1: Tỷ lệ đồng chi trả 20% tại bệnh viện công lập]       |
|                                                              |                                                                   |
|                                                              | +---------------------------------------------------------------+ |
|                                                              | | Assessor Input: [ Hỏi thêm Agent hoặc ghi chú...          ] | |
|                                                              | | [✓ APPROVE (2.000.000 đ)]  [? REQUEST MORE INFO]  [✗ REJECT]   | |
|                                                              | +---------------------------------------------------------------+ |
+----------------------------------------------------------------------------------------------------------------------------------+
```

---

## 5. Đặc tả Chi tiết các Component Generative UI trong Khung Chat

Các component này được render tự động dựa trên trạng thái `toolInvocation` của **Vercel AI SDK**:

### 5.1. Component 1: `ToolExecutionTimeline` (Thanh tiến trình gọi tool)
Hiển thị quá trình AI Agent thực thi tuần tự 4 tool theo đúng thứ tự logic:
* **Trạng thái:** `PENDING` (Xám) -> `EXECUTING` (Spinner xanh dương) -> `SUCCESS` (Tick xanh lá) -> `FAILED` (Chấm than đỏ).
* **Wireframe:**
```
[ (1) verifyDocument: 2 docs OK ✓ ] -> [ (2) lookupPolicy: Active ✓ ] -> [ (3) checkNecessity: J20.9 ✓ ] -> [ (4) calculate: 2.0M ✓ ]
```

### 5.2. Component 2: `BenefitCalculationCard` (Thẻ chiết tính viện phí tương tác)
Render trực tiếp khi tool `calculateBenefit` trả về kết quả:
* **Phần hiển thị:**
  * Header: Badge màu xanh lá (`Chấp thuận một phần do áp Copay`).
  * Danh sách phân rã dòng tiền: Số tiền yêu cầu, Mức miễn thường, Đồng chi trả, Số tiền duyệt.
  * Thanh Bar trực quan hóa: Tỷ lệ % Bảo hiểm chi trả vs % Khách hàng tự chịu.
  * Hạn mức năm: Tiến trình thanh tiến độ (`45M -> 43M còn lại`).
* **Tính năng tương tác (Interactive):**
  * Cho phép Assessor kéo thanh trượt Copay (ví dụ: từ 20% sang 10% nếu có chính sách ưu đãi đặc biệt) để xem số tiền tự động cập nhật ngay trên giao diện.

### 5.3. Component 3: `PolicyCitationPill` (Pill trích dẫn điều khoản chống ảo giác)
* **Đặc điểm:** Mỗi điều khoản được render dưới dạng Pill Badge có thể click:
  ```
  [ 📜 Điều 4.2 - Quyền lợi Ngoại Trú (POL-GOLD-01) ▾ ]
  ```
* **Khi hover hoặc click:** Mở một Popover hiển thị nguyên văn đoạn trích trong hợp đồng gốc mà Agent đã đọc được từ RAG, ngăn ngừa 100% rủi ro Agent bịa đặt điều khoản.

---

## 6. Đặc tả Chi tiết các Action Modals (Human-In-The-Loop)

---

### Modal A: Xác nhận Phê duyệt (`ApproveClaimModal`)
* **Kích hoạt:** Khi Assessor bấm nút xanh `[✓ APPROVE (2,000,000 đ)]`.
* **Wireframe:**
```
+------------------------------------------------------------------------------+
| XÁC NHẬN PHÊ DUYỆT BỒI THƯỜNG - CLM-2024-TC01                            [X] |
+------------------------------------------------------------------------------+
| • Người thụ hưởng: Trần Quốc Dũng                                            |
| • Số tiền chuyển khoản: 2,000,000 VND (Hai triệu đồng chẵn)                  |
| • Tài khoản nhận: 0123456789 - Vietcombank (Chi nhánh Tân Bình)              |
|                                                                              |
| THÔNG BÁO TỰ ĐỘNG GỬI KHÁCH HÀNG:                                            |
| [x] Gửi Email thông báo bồi thường (Template 04: Claim Approved)             |
| [x] Gửi tin nhắn SMS cập nhật trạng thái bồi thường                          |
|                                                                              |
| Ghi chú của chuyên viên (Nội bộ):                                            |
| [ Hồ sơ đầy đủ, áp dụng đồng chi trả 20% theo quy định gói Gold.           ] |
|                                                                              |
|                             [ Hủy bỏ ]   [ Xác nhận & Tạo Lệnh Thanh Toán ]  |
+------------------------------------------------------------------------------+
```

---

### Modal B: Từ chối Bồi thường (`RejectClaimModal`)
* **Kích hoạt:** Khi Assessor bấm nút đỏ `[✗ REJECT]`.
* **Wireframe:**
```
+------------------------------------------------------------------------------+
| TỪ CHỐI YÊU CẦU BỒI THƯỜNG - CLM-2024-TC02                               [X] |
+------------------------------------------------------------------------------+
| CẢNH BÁO: Thao tác này sẽ phát hành Thư từ chối bồi thường chính thức.       |
|                                                                              |
| • Căn cứ từ chối (Bắt buộc chọn ít nhất 1 điều khoản):                       |
|   [x] Điều 8.2: Phẫu thuật thẩm mỹ và các can thiệp chỉnh hình tự chọn      |
|   [ ] Điều 8.5: Bệnh có sẵn phát sinh trong 12 tháng đầu tiên                 |
|   [ ] Điều 12.1: Quá thời hạn nộp hồ sơ quy định                             |
|                                                                              |
| • Lý do chi tiết gửi khách hàng (Soạn thảo văn phong chuẩn mực):             |
| +--------------------------------------------------------------------------+ |
| | Kính gửi Quý khách, qua thẩm định hồ sơ điều trị nâng mũi ngày           | |
| | 10/04/2024, chi phí phẫu thuật thuộc điểm loại trừ tại Điều 8.2 của HĐ.  | |
| | Quý khách có quyền khiếu nại trong vòng 30 ngày kể từ ngày nhận thông báo| |
| +--------------------------------------------------------------------------+ |
| • Hạn chót nộp đơn khiếu nại (Appeal Deadline): 10/05/2024 (Tự động 30 ngày) |
|                                                                              |
|                             [ Quay lại ]   [ Xác nhận Từ chối Hồ sơ ]        |
+------------------------------------------------------------------------------+
```

---

### Modal C: Yêu cầu Bổ sung Tài liệu (`RequestMoreInfoModal`)
* **Kích hoạt:** Khi hồ sơ thiếu chứng từ bắt buộc (ví dụ: Case TC03 thiếu Giấy ra viện) hoặc Assessor bấm nút vàng `[? REQUEST MORE INFO]`.
* **Wireframe:**
```
+------------------------------------------------------------------------------+
| YÊU CẦU BỔ SUNG CHỨNG TỪ - CLM-2024-TC03                                 [X] |
+------------------------------------------------------------------------------+
| Hồ sơ hiện tại: Điều trị nội trú Viêm ruột thừa cấp (K35.8).                 |
| AI phát hiện thiếu các chứng từ bắt buộc sau:                               |
|                                                                              |
| [x] Giấy ra viện (Bản gốc hoặc bản sao y chứng thực)                         |
| [x] Bảng kê chi tiết viện phí (Mẫu 01/BV phân tách tiền giường, tiền thuốc)  |
| [ ] Toa thuốc xuất viện (Tùy chọn)                                           |
|                                                                              |
| Kênh gửi thông báo và link upload cho khách hàng:                            |
| • Email: nam.pham@acme.com                                                   |
| • SMS: 0908***123                                                            |
| • Thời hạn bổ sung: 30 ngày (Đến hết 22/04/2024)                             |
| • Magic Link upload tài liệu: https://claims.papaya.asia/upload/u9f8a2       |
|                                                                              |
|                             [ Hủy ]   [ Gửi Yêu cầu Bổ sung cho Khách hàng ] |
+------------------------------------------------------------------------------+
```

---

### Modal D: Ghi đè Quyết định & Số tiền (`ManualOverrideModal`)
* **Kích hoạt:** Khi Assessor không đồng ý với tính toán của AI hoặc áp dụng ngoại lệ thương mại (Commercial Exception).
* **Wireframe:**
```
+------------------------------------------------------------------------------+
| ĐIỀU CHỈNH THỦ CÔNG (MANUAL OVERRIDE)                                    [X] |
+------------------------------------------------------------------------------+
| • Số tiền AI đề xuất duyệt: 2,000,000 VND                                    |
| • Số tiền Assessor điều chỉnh: [ 2,250,000 ] VND                             |
|                                                                              |
| • Lý do ghi đè (Bắt buộc nhập để lưu Audit Trail):                           |
| [ Khách hàng VIP doanh nghiệp, duyệt bổ sung chi phí tiền khám đặc biệt theo |
|   phê duyệt của Trưởng bộ phận bồi thường (Email đính kèm #REF-992).       ] |
|                                                                              |
| Cảnh báo: Mọi thao tác ghi đè sẽ được gắn cờ và gửi báo cáo cho Compliance.  |
|                                                                              |
|                             [ Hủy ]   [ Xác nhận Ghi đè Quyết định ]         |
+------------------------------------------------------------------------------+
```

---

## 7. Drawer Phụ: Tra cứu Hợp đồng (`PolicyBrowserDrawer`) & Audit Trail

### 7.1. Drawer Tra cứu Điều khoản Hợp đồng (Mở trượt từ mép phải)
* Cây thư mục phân cấp điều khoản:
  * Chương I: Định nghĩa & Đối tượng bảo hiểm.
  * Chương II: Bảng quyền lợi & Hạn mức chi trả.
  * Chương III: Các điểm loại trừ trách nhiệm bảo hiểm (32 điều khoản loại trừ).
  * Chương IV: Quy định hồ sơ khiếu nại bồi thường.
* Thanh tìm kiếm nhanh: Lọc tức thời theo từ khóa (VD: *"nâng mũi"*, *"răng"*, *"thời gian chờ"*).

### 7.2. Drawer Lịch sử Thẩm định & Audit Trail (Mở trượt từ đáy màn hình)
* Hiển thị bảng timeline bất biến (Immutable Event Log):
  * `10:14:02` — AI Agent gọi `verifyDocument(DOC-01)` -> Result: `VALID`.
  * `10:14:03` — AI Agent gọi `lookupPolicy(POL-001)` -> Result: `ACTIVE, Limit: 100M`.
  * `10:14:04` — AI Agent đề xuất `APPROVE` chi trả 2.000.000 VND.
  * `10:15:20` — Chuyên viên `Trần Quốc Dũng` xác nhận phê duyệt bồi thường.
  * `10:15:22` — Lệnh thanh toán chuyển sang cổng chi trả ERP Papaya.

---

## 8. Hệ thống Thiết kế (Design System & Color Tokens)

Bám sát Brand Guidelines chuẩn của Papaya và phong cách Fintech/Insurtech hiện đại:

| Token | Giá trị Hex | Ứng dụng trong giao diện |
| :--- | :--- | :--- |
| `primary-blue` | `#2563EB` | Màu thương hiệu chính, nút Action chính, Link, Tool execution active. |
| `success-green` | `#10B981` | Phê duyệt (`APPROVE`), Số tiền bảo hiểm chi trả, Chứng từ hợp lệ. |
| `warning-amber`| `#F59E0B` | Yêu cầu bổ sung (`REQUEST_MORE_INFO`), Cảnh báo SLA, Copay/Deductible. |
| `danger-red` | `#EF4444` | Từ chối bồi thường (`REJECT`), Gian lận, Phát hiện sửa ảnh (Forensics). |
| `surface-bg` | `#F8FAFC` | Nền màn hình tổng thể, dịu mắt cho Assessor làm việc liên tục 8 tiếng. |
| `card-bg` | `#FFFFFF` | Nền các thẻ hồ sơ, border `1px solid #E2E8F0`, shadow tinh tế. |
| `text-primary` | `#0F172A` | Tiêu đề, số tiền, thông tin quan trọng. |
| `text-muted` | `#64748B` | Nhãn phụ, mã claim, ngày tháng. |

---

## 9. Phím tắt Bàn phím Dành cho Power-Users (Keyboard Shortcuts)

| Phím tắt | Thao tác nhanh |
| :--- | :--- |
| `Cmd + K` (Mac) / `Ctrl + K` (Win) | Mở thanh tìm kiếm toàn cục (Claim, Member, ICD-10). |
| `Cmd + Enter` | Chấp thuận phê duyệt claim hiện tại (`APPROVE`). |
| `Cmd + Shift + R` | Mở modal Từ chối claim (`REJECT`). |
| `Cmd + Shift + I` | Mở modal Yêu cầu bổ sung chứng từ (`REQUEST MORE INFO`). |
| `[ / ]` (Ngoặc vuông) | Chuyển nhanh giữa Chứng từ trước / Chứng từ tiếp theo. |
| `Esc` | Đóng mọi Modal hoặc Drawer đang mở. |
