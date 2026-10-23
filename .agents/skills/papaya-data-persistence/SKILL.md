---
name: papaya-data-persistence
description: >-
  Use this skill to manage Prisma ORM schemas, database migrations, and seed
  the 3 official test cases (Approve, Reject, Request More Info) on SQLite or PostgreSQL.
---

# Papaya Data Persistence Skill

Skill này hướng dẫn quy chuẩn quản lý schema dữ liệu bằng **Prisma ORM** và quy trình nạp dữ liệu mẫu (Seeding) cho **3 kịch bản kiểm thử bắt buộc** của AI Challenge 11.

---

## 1. Cấu Hình Cơ Sở Dữ Liệu Hybrid (Prisma Schema)

File schema tại `apps/api/prisma/schema.prisma` hỗ trợ 2 chế độ:

- **Mặc định (Local Development):** Chạy trên file SQLite cục bộ (`file:./papaya_claims.db`). Không cần cài đặt bất kỳ database server nào, clone code về là chạy được ngay.
- **Môi trường Production/Docker:** Chuyển sang PostgreSQL chỉ bằng cách đổi biến môi trường `DATABASE_URL=postgresql://...`.

---

## 2. Các Lệnh Điều Hành Dữ Liệu Chuẩn

```bash
# 1. Sinh Prisma Client sau khi thay đổi schema
pnpm --filter @papaya/api prisma generate

# 2. Đồng bộ schema xuống cơ sở dữ liệu (SQLite file)
pnpm --filter @papaya/api prisma db push

# 3. Nạp dữ liệu 3 Test Cases mẫu vào database
pnpm --filter @papaya/api db:seed

# 4. Mở giao diện trực quan Prisma Studio để xem dữ liệu
pnpm --filter @papaya/api prisma studio
```

---

## 3. Danh Mục 3 Test Cases Được Nạp Mặc Định

1. **`CLM-2024-TC01` (Ngoại trú — Viêm phế quản J20.9):**
   - Số tiền: 2.500.000 VND. Đủ hóa đơn VAT & toa thuốc.
   - Kết quả kỳ vọng: **`APPROVE`** (Duyệt 2.000.000 VND, Copay 20% = 500.000 VND).
2. **`CLM-2024-TC02` (Nội trú — Nâng mũi thẩm mỹ Z41.1):**
   - Số tiền: 35.000.000 VND. Đủ giấy tờ nhưng thuộc điều khoản loại trừ.
   - Kết quả kỳ vọng: **`REJECT`** (Từ chối, trích dẫn Điều 8.2).
3. **`CLM-2024-TC03` (Nội trú — Viêm ruột thừa K35.8):**
   - Số tiền: 22.000.000 VND. Bị **thiếu Giấy ra viện**.
   - Kết quả kỳ vọng: **`REQUEST_MORE_INFO`** (Yêu cầu bổ sung, tuyệt đối không reject).
