# Papaya Database Migration & Operations Playbook

Sổ tay hướng dẫn quản trị cơ sở dữ liệu, điều hướng migration và chuyển đổi giữa SQLite (Local Dev) và PostgreSQL (Production / Docker).

---

## 1. Chiến Lược Hai Môi Trường (Dual-Environment Architecture)

Hệ thống được thiết kế với kiến trúc **Hybrid Storage**:

```text
┌───────────────────────────┐         ┌───────────────────────────┐
│   Local Dev / Testing     │         │   Docker / Production     │
│   Database: SQLite        │         │   Database: PostgreSQL    │
│   URL: file:./papaya.db   │         │   URL: postgresql://...   │
│   Fast, Zero Config       │         │   ACID, JSONB, Concurrent │
└───────────────────────────┘         └───────────────────────────┘
```

### Chuyển Đổi Nhanh Giữa Hai Môi Trường

1. **Chế độ SQLite (Mặc định cho Dev & CI/CD):**
   ```env
   DATABASE_URL="file:./data/papaya_claims.db"
   ```
2. **Chế độ PostgreSQL (Production / Docker Compose):**
   ```env
   DATABASE_URL="postgresql://papaya_user:papaya_secret_2026@localhost:5432/papaya_claims?schema=public"
   ```

---

## 2. Quy Trình Thực Hiện Migration Chuẩn (Prisma Workflow)

Khi có bất kỳ thay đổi nào trong `apps/api/prisma/schema.prisma`:

### Bước 1: Kiểm Tra Tính Nhất Quán với Zod Schemas

- Mọi model trong Prisma (`Policy`, `Claim`, `Assessment`) bắt buộc phải đồng bộ 100% với Zod schemas trong `packages/shared/src/schemas/`.

### Bước 2: Sinh Prisma Client

```bash
pnpm --filter @papaya/api prisma generate
```

### Bước 3: Đẩy Thay Đổi Xuống DB (Development)

```bash
pnpm --filter @papaya/api prisma db push
```

### Bước 4: Tạo Migration Chính Thức (Production Versioning)

```bash
pnpm --filter @papaya/api prisma migrate dev --name <migration_description>
```

---

## 3. Chiến Lược Đánh Chỉ Mục Tối Ưu Truy Vấn (Index Strategy)

Để đảm bảo hiệu năng cao khi tra cứu trong thời gian thực của AI Copilot:

1. **`policies(policyNumber)`**: Khóa Unique, B-Tree Index mặc định để `lookupPolicy` phản hồi dưới 5ms.
2. **`policies(nationalId)`**: Index tra cứu lịch sử hợp đồng theo số CCCD của công dân.
3. **`claims(claimId)`**: Khóa Unique cho từng hồ sơ bồi thường.
4. **`claims(policyNumber, status)`**: Composite index phục vụ bộ lọc danh sách hồ sơ bồi thường trên giao diện Workstation.
5. **`claims(diagnosisIcd10)`**: Index phục vụ thống kê tần suất bệnh lý và phát hiện bất thường gian lận.
6. **`audit_logs(claimId, timestamp)`**: Composite index phục vụ hiển thị toàn bộ dòng lịch sử kiểm toán theo thứ tự thời gian.

---

## 4. Checklist Đối Soát & Kiểm Toán Dữ Liệu Trước Khi Triển Khai (Pre-flight QA)

Trước khi bàn giao cơ sở dữ liệu:

- [ ] Chạy script kiểm tra toàn vẹn: `npx ts-node .agents/skills/papaya-data-engineer/scripts/verify-data-integrity.ts`.
- [ ] Kiểm tra 100% `policyNumber` trong bảng `claims` phải tồn tại trong bảng `policies`.
- [ ] Đảm bảo công thức bảo toàn: $\text{totalRequested} = \sum \text{amountRequested}$ của từng item.
- [ ] Xác nhận không có số âm trong các trường tiền tệ (`totalRequested`, `annualTotalLimit`).
- [ ] Dữ liệu nhạy cảm PII đã được che mờ (mask) trên môi trường staging/test.
