---
trigger: always_on
description: 'Quy chuẩn kiểm thử tự động, tái hiện lỗi và xác minh tính đúng đắn trước khi hoàn thành nhiệm vụ'
---

# Quy Chuẩn Kiểm Thử & Xác Minh (Testing & Verification)

Quy tắc này bắt buộc Antigravity phải duy trì kỷ luật kiểm thử nghiêm ngặt, đảm bảo mọi đoạn mã được bàn giao cho người dùng đều đã qua kiểm chứng độc lập.

---

## 1. Kỷ luật Xác minh Độc lập (Verification First)

- **Không bao giờ khẳng định hoàn tất một tác vụ khi chưa chạy test thực tế.**
- Sau khi viết code mới hoặc sửa code:
  1. Chạy linter hoặc typecheck: `npm run lint` hoặc `npx tsc --noEmit`.
  2. Chạy bộ unit tests liên quan: `npm test` hoặc `npx vitest run / npx jest`.
  3. Kiểm tra output thực tế của terminal để xác nhận kết quả `PASSED`.

---

## 2. Quy trình Sửa Lỗi (Bug-Fixing Discipline)

Khi người dùng báo lỗi hoặc phát hiện bug trong hệ thống:

1. **Pha 1 — Tái hiện (Reproduce):** Viết một unit test hoặc script nhỏ mô phỏng đúng điều kiện gây lỗi để chứng minh lỗi thực sự tồn tại (test ban đầu phải `FAILED`).
2. **Pha 2 — Sửa đổi (Fix):** Chỉnh sửa mã nguồn tối thiểu để giải quyết nguyên nhân gốc rễ.
3. **Pha 3 — Xác nhận (Verify):** Chạy lại test vừa viết; test phải chuyển sang `PASSED`. Đồng thời chạy toàn bộ test suite hiện có để đảm bảo không bị regression.

---

## 3. Tiêu chuẩn Bao phủ Ca kiểm thử (Test Coverage Standards)

Một bộ test tiêu chuẩn phải bao quát đầy đủ 3 nhóm trường hợp:

1. **Happy Path:** Dữ liệu chuẩn, luồng thành công chính thống.
2. **Edge Cases:**
   - Dữ liệu rỗng (`null`, `undefined`, chuỗi rỗng `""`, mảng rỗng `[]`).
   - Giá trị biên (số 0, số âm, số vượt trần cực đại, ngày tháng chuyển giao năm).
3. **Error Paths:** Dữ liệu sai định dạng, dịch vụ phụ thuộc phản hồi lỗi (500, timeout), vi phạm ràng buộc schema.
