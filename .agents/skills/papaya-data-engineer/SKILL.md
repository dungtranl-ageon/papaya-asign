---
name: papaya-data-engineer
description: >-
  Use this skill for database architecture, schema migrations, synthetic data generation,
  data reconciliation, and ETL processing: managing Prisma ORM hybrid models (SQLite/PostgreSQL),
  seeding realistic Vietnamese insurance claim dossiers, verifying mathematical integrity, and managing data backups.
---

# Papaya Senior Data Engineer Skill

Skill này đóng vai trò là kim chỉ nam dành cho **Senior Data Engineer / Data Architect**, chịu trách nhiệm toàn diện về kiến trúc dữ liệu, mô hình hóa cơ sở dữ liệu (Data Modeling), tạo lập dữ liệu thử nghiệm tổng hợp (Synthetic Data Generation), đối soát tính toán số học (Data Reconciliation) và xây dựng đường ống xử lý dữ liệu (ETL Pipelines) cho hệ sinh thái thẩm định bồi thường y tế Papaya Claims Copilot.

---

## 1. Triết Lý Kỹ Nghệ Dữ Liệu (Core Data Engineering Philosophy)

1. **Kiến Trúc Hybrid Linh Hoạt (Relational + JSON Document):**
   - Sử dụng các cột quan hệ (Relational Columns: `policyNumber`, `claimId`, `nationalId`) cho việc đánh chỉ mục (indexing), tìm kiếm tốc độ cao và bảo đảm ràng buộc khóa ngoại (Foreign Keys).
   - Sử dụng các trường cấu trúc linh hoạt (`JSON / JSONB`: `benefitsJson`, `itemsJson`, `documentsJson`, `stepsJson`) để lưu trữ các bảng kê viện phí nhiều danh mục và báo cáo thẩm định phân cấp phức tạp mà không làm phân mảnh cơ sở dữ liệu.
2. **Bảo Toàn Số Học Tuyệt Đối (Mathematical Conservation & Zero Rounding Error):**
   - Mọi bản ghi viện phí phải tuân thủ nghiêm ngặt định luật bảo toàn:
     $$\text{totalRequested} \equiv \sum_{i=1}^{n} \text{item}_{i}.\text{amountRequested}$$
     $$\text{totalRequested} \equiv \text{totalPayable} + \text{totalDeductions}$$
   - Bắt buộc kiểm soát sai số làm tròn số học, đặc biệt trong các phép tính tỷ lệ đồng chi trả (copay) và khấu trừ hạn mức ngày giường (sublimit).
3. **Bảo Mật Dữ Liệu Riêng Tư & Y Tế (Zero PII Leakage & Healthcare Data Privacy):**
   - Dữ liệu định danh cá nhân (Số CCCD, Mã số bảo hiểm, Tên bệnh nhân, Lịch sử bệnh án) khi xuất ra môi trường kiểm thử (Staging/Dev/Demo) bắt buộc phải qua cơ chế làm mờ (Masking/Anonymization).
   - Không lưu trữ tệp tin nhị phân lớn (Binary blobs/PDF scan gốc) trực tiếp vào bảng cơ sở dữ liệu; chỉ lưu URI/Path và metadata trong `documentsJson`.

---

## 2. Mô Hình Dữ Liệu & Quản Trị Prisma Schema (Data Modeling)

Toàn bộ schema trung tâm được định nghĩa tại `apps/api/prisma/schema.prisma` và liên kết chặt chẽ với Zod Schemas tại `packages/shared/src/schemas/`:

```
┌─────────────────────────────────┐           ┌─────────────────────────────────┐
│        Policy (policies)        │           │          Claim (claims)         │
├─────────────────────────────────┤           ├─────────────────────────────────┤
│ PK  id                          │ 1       n │ PK  id                          │
│ UQ  policyNumber                │───────────│ UQ  claimId                     │
│     insuredName, nationalId     │           │ FK  policyNumber                │
│     effectiveDate, expiryDate   │           │     patientName, nationalId     │
│     annualTotalLimit, usedAmount│           │     admissionDate, dischargeDate│
│     exclusionsJson              │           │     diagnosisIcd10              │
│     benefitsJson                │           │     totalRequested, totalApproved│
│     waitingPeriodsJson          │           │     itemsJson, documentsJson    │
└─────────────────────────────────┘           └─────────────────────────────────┘
                                                               │ 1
                                                               │
                                              ┌────────────────┼────────────────┐
                                            n │                                 │ n
                              ┌───────────────────────────────┐ ┌───────────────────────────────┐
                              │    Assessment (assessments)   │ │      AuditLog (audit_logs)    │
                              ├───────────────────────────────┤ ├───────────────────────────────┤
                              │ PK  id                        │ │ PK  id                        │
                              │ UQ  assessmentId              │ │ FK  claimId                   │
                              │ FK  claimId                   │ │     actorId, actorRole        │
                              │     finalRecommendation       │ │     actionType                │
                              │     confidenceScore           │ │     oldValue, newValue        │
                              │     totalPayable, deductions  │ │     reason, timestamp         │
                              │     stepsJson, breakdownJson  │ └───────────────────────────────┘
                              └───────────────────────────────┘
```

### Các Lệnh Vận Hành Cơ Sở Dữ Liệu

```bash
# 1. Sinh Prisma Client sau khi sửa schema
pnpm --filter @papaya/api prisma generate

# 2. Đồng bộ schema trực tiếp xuống Database cục bộ (SQLite)
pnpm --filter @papaya/api prisma db push

# 3. Tạo migration chính thức có lưu vết phiên bản (Production/PostgreSQL)
pnpm --filter @papaya/api prisma migrate dev --name <migration_name>

# 4. Nạp dữ liệu Seeding mặc định vào Database
pnpm --filter @papaya/api db:seed

# 5. Mở giao diện trực quan Prisma Studio để tra cứu & chỉnh sửa bản ghi
pnpm --filter @papaya/api prisma studio
```

---

## 3. Tạo Lập Dữ Liệu Mẫu & Sinh Dữ Liệu Thử Nghiệm (Synthetic Data & Mocking)

Data Engineer chịu trách nhiệm cung cấp và quản lý nguồn dữ liệu phục vụ phát triển, benchmark và kiểm thử:

### 1. Dữ Liệu 3 Kịch Bản Chuẩn Đề Bài (`data/fixtures/` & `data/policies/`)

- **`tc01-approve.json` (Viêm ruột thừa cấp K35):** Đủ hóa đơn VAT, bảng kê viện phí, giấy ra viện. Duyệt chi trả đúng tỷ lệ đồng chi trả 20% trên phẫu thuật.
- **`tc02-reject.json` (Trào ngược dạ dày K21):** Khớp điều khoản loại trừ hợp đồng (`policyExclusionsMatched: ['K21']`).
- **`tc03-request-info.json` (Viêm phế quản J20):** Bảng kê chi tiết viện phí bị mờ nhòe (`status: 'INVALID'`), kích hoạt luồng yêu cầu bổ sung chứng từ.

### 2. Sinh Dữ Liệu Thử Nghiệm Tự Động (Synthetic Generator)

Data Engineer sử dụng script chuẩn hóa để sinh hàng loạt hồ sơ viện phí sát thực tế bệnh viện Việt Nam:

```bash
# Chạy script sinh dữ liệu y tế tổng hợp
npx ts-node .agents/skills/papaya-data-engineer/scripts/seed-synthetic-data.ts
```

---

## 4. Kiểm Tra & Đối Soát Tính Toàn Vẹn Dữ Liệu (Data Integrity & Reconciliation)

Mọi thay đổi dữ liệu hoặc trước khi bàn giao đợt chạy mới, Data Engineer **bắt buộc phải chạy script kiểm tra toàn vẹn**:

```bash
npx ts-node .agents/skills/papaya-data-engineer/scripts/verify-data-integrity.ts
```

### Quy Tắc Đối Soát (Reconciliation Rules)

1. **Kiểm Tra Schema (Zod Validation):** Toàn bộ tệp tin JSON trong `data/` phải pass 100% qua `PolicySchema` và `ClaimSchema`.
2. **Kiểm Tra Ràng Buộc Khóa Ngoại (Foreign Key Sanity):** Mọi `claim.policyNumber` phải tham chiếu đến một hợp đồng có thật trong `data/policies/`.
3. **Kiểm Tra Tính Hợp Lý Thời Gian (Temporal Consistency):**
   $$\text{claim.admissionDate} \le \text{claim.dischargeDate}$$
   $$\text{policy.effectiveDate} < \text{policy.expiryDate}$$
4. **Kiểm Tra Bảo Toàn Tổng Tiền Viện Phí (Item Sum Conservation):**
   $$\text{totalRequested} == \sum \text{items.amountRequested}$$

---

## 5. Giải Pháp Lưu Trữ, Sao Lưu & Đổi Môi Trường (Storage & Disaster Recovery)

### 1. Kiến Trúc Lưu Trữ 2 Chế Độ

- **Chế độ Mặc định (Local SQLite):** `DATABASE_URL="file:./data/papaya_claims.db"`. Không cần cấu hình server, sẵn sàng hoạt động ngay khi checkout mã nguồn.
- **Chế độ Doanh Nghiệp (PostgreSQL Docker/K8s):** `DATABASE_URL="postgresql://papaya_user:secret@localhost:5432/papaya_claims"`. Phù hợp cho môi trường tải cao, đa phiên đồng thời (high concurrency) và giao dịch ACID chặt chẽ.

### 2. Script Tự Động Sao Lưu Cơ Sở Dữ Liệu (Backup Script)

Thực thi bản snapshot dự phòng trước các đợt cập nhật schema lớn:

```bash
bash .agents/skills/papaya-data-engineer/scripts/backup-database.sh
```

File sao lưu sẽ được nén và đặt trong `data/backups/papaya_<type>_<timestamp>.db`.

---

## 6. Bộ Tài Liệu & Scripts Đi Kèm (References & Tooling)

1. **[scripts/verify-data-integrity.ts](file:///Users/tranquocdung/Projects/papaya-asign/.agents/skills/papaya-data-engineer/scripts/verify-data-integrity.ts):** Script tự động đối soát toàn bộ cơ sở dữ liệu và fixtures JSON.
2. **[scripts/seed-synthetic-data.ts](file:///Users/tranquocdung/Projects/papaya-asign/.agents/skills/papaya-data-engineer/scripts/seed-synthetic-data.ts):** Công cụ sinh tự động hồ sơ viện phí chuẩn ICD-10 Việt Nam.
3. **[scripts/backup-database.sh](file:///Users/tranquocdung/Projects/papaya-asign/.agents/skills/papaya-data-engineer/scripts/backup-database.sh):** Script sao lưu nhanh cơ sở dữ liệu SQLite / PostgreSQL.
4. **[references/data-dictionary.md](file:///Users/tranquocdung/Projects/papaya-asign/.agents/skills/papaya-data-engineer/references/data-dictionary.md):** Từ điển dữ liệu toàn diện (Data Dictionary) của 4 thực thể chính.
5. **[references/icd10-vietnam-reference.json](file:///Users/tranquocdung/Projects/papaya-asign/.agents/skills/papaya-data-engineer/references/icd10-vietnam-reference.json):** Danh mục tra cứu mã bệnh lâm sàng và biểu phí tiêu chuẩn tại Việt Nam.
6. **[references/migration-playbook.md](file:///Users/tranquocdung/Projects/papaya-asign/.agents/skills/papaya-data-engineer/references/migration-playbook.md):** Cẩm nang điều hướng migration, index strategy và chuyển đổi môi trường.
