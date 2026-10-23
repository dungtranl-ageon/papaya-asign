# Health Insurance Claims Assessment - Comprehensive Test Matrix

Bảng ma trận này xác định 15 nhóm ca kiểm thử kiểm chứng toàn diện chất lượng cho hệ thống Trợ lý Thẩm định Bồi thường Bảo hiểm Sức khỏe (Papaya Claims Copilot).

---

## 1. Official Benchmark Test Cases (3 Kịch Bản Bắt Buộc)

| ID        | Tên Kịch Bản                   | Dữ Liệu Đầu Vào                                                                                 | Kỳ Vọng Đầu Ra                                                                                         | Mức Độ        |
| :-------- | :----------------------------- | :---------------------------------------------------------------------------------------------- | :----------------------------------------------------------------------------------------------------- | :------------ |
| **TC-01** | Phê duyệt thường quy (Approve) | Hồ sơ Viêm ruột thừa cấp (`K35`), đủ 4 chứng từ hợp lệ, Hợp đồng Gold còn hạn mức               | `finalRecommendation: APPROVE`, tính đúng 20% copay phẫu thuật, `confidenceScore >= 90%`               | P0 (Critical) |
| **TC-02** | Từ chối do loại trừ (Reject)   | Hồ sơ Trào ngược thực quản (`K21`), chẩn đoán nằm trong danh mục `exclusions` của Hợp đồng Gold | `finalRecommendation: REJECT`, trích dẫn điều khoản loại trừ K21, số tiền bồi thường = 0               | P0 (Critical) |
| **TC-03** | Yêu cầu bổ sung (Request Info) | Hồ sơ Viêm phế quản cấp (`J20`), thiếu hóa đơn VAT, bản kê viện phí bị mờ nhòe                  | `finalRecommendation: REQUEST_MORE_INFO`, **tuyệt đối không REJECT**, liệt kê danh sách chứng từ thiếu | P0 (Critical) |

---

## 2. Policy & Eligibility Boundary Cases (Hợp Đồng & Thời Hạn)

| ID        | Tên Kịch Bản                     | Điều Kiện Thử Nghiệm                                       | Kỳ Vọng                                                       |
| :-------- | :------------------------------- | :--------------------------------------------------------- | :------------------------------------------------------------ |
| **TC-04** | Hết hạn hợp đồng                 | Ngày khám sau ngày `expiryDate`                            | `LOOKUP_POLICY` failed, từ chối quyền lợi                     |
| **TC-05** | Chưa đến ngày hiệu lực           | Ngày khám trước ngày `effectiveDate`                       | `LOOKUP_POLICY` failed, từ chối quyền lợi                     |
| **TC-06** | Vi phạm thời gian chờ            | Điều trị bệnh đặc biệt vào ngày 29 (thời gian chờ 30 ngày) | Báo lỗi vi phạm thời gian chờ, không duyệt quyền lợi          |
| **TC-07** | Đúng ngày kết thúc thời gian chờ | Điều trị vào ngày thứ 31                                   | Chấp thuận hợp lệ                                             |
| **TC-08** | Cạn kiệt hạn mức năm             | `annualUsedAmount >= annualTotalLimit`                     | `remainingAnnualLimit = 0`, từ chối thanh toán do hết hạn mức |

---

## 3. Financial & Benefit Calculation Cases (Toán Học & Đồng Chi Trả)

| ID        | Tên Kịch Bản                  | Điều Kiện Thử Nghiệm                                                | Kỳ Vọng                                                                                           |
| :-------- | :---------------------------- | :------------------------------------------------------------------ | :------------------------------------------------------------------------------------------------ |
| **TC-09** | Vượt hạn mức phụ (Sublimit)   | Tiền phòng 3.000.000 VND/ngày, hợp đồng giới hạn 1.500.000 VND/ngày | Trừ 1.500.000 VND vượt trần vào deduction, chỉ chi trả tối đa hạn mức phụ                         |
| **TC-10** | Trừ tiền Copay chính xác      | Chi phí phẫu thuật 25.000.000 VND, copay 20%                        | Bệnh nhân trả 5.000.000 VND, bảo hiểm trả 20.000.000 VND                                          |
| **TC-11** | Khoản mục không thuộc phạm vi | Hóa đơn chứa khoản mục không có trong biểu quyền lợi hợp đồng       | Trừ 100% chi phí khoản mục đó vào deduction                                                       |
| **TC-12** | Tổng duyệt nhiều khoản mục    | Hồ sơ kết hợp: Nội trú + Phẫu thuật + Thuốc men + Xét nghiệm        | Tính độc lập từng mục và tổng hợp chính xác `totalPayable` + `totalDeductions` = `totalRequested` |

---

## 4. Medical Necessity & Fraud Detection (Thiết Yếu & Gian Lận)

| ID        | Tên Kịch Bản        | Điều Kiện Thử Nghiệm                              | Kỳ Vọng                                           |
| :-------- | :------------------ | :------------------------------------------------ | :------------------------------------------------ |
| **TC-13** | Thủ thuật thẩm mỹ   | Hóa đơn chứa phẫu thuật thẩm mỹ, làm đẹp, trị mụn | Cờ `isMedicallyNecessary = false`, deduction 100% |
| **TC-14** | Thực phẩm chức năng | Đơn thuốc kê vitamin bổ sung, thực phẩm chức năng | Loại trừ khỏi danh mục thuốc điều trị thiết yếu   |
| **TC-15** | Bất thường số tiền  | Chi phí $\le 0$ hoặc số lượng âm                  | Bắt lỗi Validation Error ngay tại Data Boundary   |
