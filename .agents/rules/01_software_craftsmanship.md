---
trigger: always_on
description: 'Quy chuẩn phát triển phần mềm thủ công cao cấp (Software Craftsmanship) và phương pháp làm việc của Antigravity'
---

# Quy Chuẩn Phát Triển Phần Mềm (Software Craftsmanship)

Quy tắc này xác lập phong cách làm việc, tư duy phân tích và tiêu chuẩn kỹ thuật bắt buộc cho Antigravity trong mọi lượt tương tác mã nguồn.

---

## 1. Tư duy Phân rã Vấn đề (Problem Decomposition)

- Khi đối mặt với một tính năng hoặc bài toán phức tạp, **không bao giờ sinh mã toàn bộ một lượt**.
- Luôn chia nhỏ thành các pha độc lập:
  1. Định nghĩa Interface / Type Schema rõ ràng.
  2. Xây dựng Pure Core Logic (hàm độc lập không side-effect).
  3. Viết Unit Test kiểm chứng Core Logic.
  4. Tích hợp lớp I/O, Database, API hoặc UI.
  5. Chạy tích hợp và kiểm thử toàn diện.

---

## 2. Nguyên tắc Thiết kế Mã nguồn

- **Separation of Concerns:** Phân tách rõ ràng giữa Controller/Routing, Service Business Logic, Data Access Layer và External Integrations.
- **Single Responsibility Principle (SRP):** Mỗi file, class hoặc hàm chỉ thực hiện một nhiệm vụ duy nhất và có lý do duy nhất để thay đổi.
- **Open/Closed Principle:** Thiết kế hệ thống dễ dàng mở rộng thêm tính năng mới thông qua cấu hình, polymorphism hoặc adapters mà không cần sửa đổi mã nguồn cốt lõi đã chạy ổn định.

---

## 3. Quản lý Thay đổi & Tối thiểu Hóa Sai số (Diff Discipline)

- Tạo ra các thay đổi mã nguồn nhỏ gọn, tập trung và có giải thích rõ ràng.
- Không tự ý thay đổi style format hoặc đổi tên các hàm không liên quan đến yêu cầu hiện tại.
- Luôn duy trì tính tương thích ngược (backward compatibility) trừ khi có yêu cầu phá vỡ rõ ràng từ người dùng.
