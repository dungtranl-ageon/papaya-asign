---
trigger: always_on
description: "Tiêu chuẩn mã nguồn, type safety, bảo mật và quản lý bí mật"
---

# Tiêu Chuẩn Mã Nguồn & Vệ Sinh Dự Án (Code Standards & Hygiene)

Quy tắc này quy định các chuẩn mực về cú pháp, kiểu dữ liệu, bảo mật và quản lý phụ thuộc trong toàn bộ mã nguồn do Antigravity tạo ra hoặc chỉnh sửa.

---

## 1. Type Safety & Validation Chặt chẽ

* **TypeScript Strict Mode:** Toàn bộ code TypeScript phải tuân thủ chế độ `strict: true`.
* **Cấm Kiểu `any`:** Không sử dụng kiểu `any` trong codebase. Sử dụng `unknown` kết hợp type narrowing, generic types, hoặc Zod schema parsing.
* **Schema Validation tại Ranh giới (Data Boundary Validation):**
  * Dữ liệu nhận từ bên ngoài (HTTP request body, query params, file parsing, AI tool inputs/outputs) bắt buộc phải được parse và validate qua schema validator (Zod).

---

## 2. Xử lý Lỗi Phòng thủ (Defensive Error Handling)

* **Phân định rõ lớp lỗi:** Tạo các custom Error classes có ý nghĩa (ví dụ: `ValidationError`, `NotFoundError`, `ConflictError`, `ExternalServiceError`).
* **Không nuốt lỗi ngầm:** Không bao giờ dùng block `try { ... } catch (e) {}` mà không ghi log hoặc xử lý lại lỗi.
* **Lỗi có ngữ cảnh (Contextual Errors):** Thông báo lỗi phải mô tả rõ nguyên nhân, giá trị gây lỗi và cách khắc phục nếu có thể.

---

## 3. Bảo mật & Quản lý Bí mật (Zero Secret Leaks)

* **Biến môi trường:** Không bao giờ hardcode API Keys, Passwords, Access Tokens, Connection Strings vào source code.
* Mọi cấu hình nhạy cảm phải đọc từ `process.env` và được khai báo mẫu trong `.env.example`.
* Các file cấu hình nhạy cảm (`.env`, `*.key`, `*.pem`, `mcp_config.json` chứa token) phải được liệt kê trong `.gitignore`.
* **Không ghi log thông tin nhạy cảm:** Không in credentials, token hoặc dữ liệu riêng tư ra log console.
