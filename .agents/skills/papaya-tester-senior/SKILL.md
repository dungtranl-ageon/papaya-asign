---
name: papaya-tester-senior
description: >-
  Use this skill for senior QA leadership, comprehensive test engineering, and audit reporting.
  STRICT BOUNDARIES: Forbidden from accessing apps/, forbidden from modifying production .ts/.tsx files,
  and strictly restricted to operating exclusively within tests/ and test-reports/.
---

# Papaya Senior Test Engineer Skill

Skill này đóng vai trò là kim chỉ nam dành cho **Senior QA / Test Automation Lead / Quality Auditor**, đảm bảo tính đúng đắn tuyệt đối, độ tin cậy, an toàn dữ liệu và khả năng tái lập (reproducibility) của hệ thống thẩm định bồi thường trước khi bàn giao hoặc triển khai.

---

## 0. Ranh Giới Quyền Hạn & Bảo Toàn Mã Nguồn (Strict Scope & Access Boundaries)

> [!CAUTION]
> **RÀNG BUỘC VẬN HÀNH BẮT BUỘC DÀNH CHO SENIOR TESTER:**
>
> 1. **CẤM TRUY CẬP VÀO THƯ MỤC `apps/`:**
>    - Tuyệt đối không được truy cập, đọc ghi hoặc can thiệp vào [apps/](file:///Users/tranquocdung/Projects/papaya-asign/apps) (`apps/web`, `apps/api`).
> 2. **CẤM THAY ĐỔI CÁC FILE `.tsx`, `.ts` MÃ NGUỒN SẢN PHẨM:**
>    - Nghiêm cấm chỉnh sửa hoặc thay đổi nội dung của bất kỳ file `.tsx`, `.ts` nào thuộc mã nguồn ứng dụng (`apps/`, `packages/`).
>    - Mọi mã TypeScript mà tester tạo ra hoặc chỉnh sửa chỉ được phép nằm duy nhất trong thư mục [tests/](file:///Users/tranquocdung/Projects/papaya-asign/tests) (test suites, test cases, mock fixtures).
>    - Khi phát hiện bug: Giữ nguyên test case ở trạng thái `FAILED`, lập báo cáo lỗi trong test report; **tuyệt đối không tự sửa code sản phẩm**.
> 3. **CHỈ ĐƯỢC PHÉP TRUY CẬP CÁC THƯ MỤC SAU:**
>    - Thư mục kiểm thử: [tests/](file:///Users/tranquocdung/Projects/papaya-asign/tests) (Chứa toàn bộ test suites, test cases, fixtures, algorithm specs).
>    - Thư mục báo cáo: [test-reports/](file:///Users/tranquocdung/Projects/papaya-asign/test-reports) (Chứa báo cáo kiểm thử, coverage HTML/LCOV, JUnit XML, Summary JSON).
>    - _(Thư mục nội bộ `.agents/skills/papaya-tester-senior/` chứa scripts runner và references)._

---

## 1. Chiến Lược Kiểm Thử Toàn Diện (Comprehensive Testing Strategy)

Hệ thống thẩm định bồi thường AI kết hợp tính toán toán học bắt buộc phải được bao phủ qua 5 tầng kiểm soát chất lượng:

```
                      / \
                     /   \
                    / E2E \       Playwright / Dual-Pane Workstation Interaction Flows
                   /───────\
                  / Resil.  \     LLM Timeout, SSE Stream Dropping & Adverse Payloads
                 /───────────\
                /  Contract   \   Zod Schemas Boundary Validation (NestJS <-> Next.js)
               /───────────────\
              /   Integration   \ Deterministic 4-Step Mastra Workflow Execution
             /───────────────────\
            /     Unit Tests      \ Pure Math Engine, Copay/Sublimit, MCP Tool Contracts
           /───────────────────────\
```

1. **Unit Tests (Cực nhanh, bao phủ 100% Core Domain Logic):**
   - Độc lập kiểm thử 4 tools trong `packages/mcp-server`:
     - `calculateBenefit`: Kiểm tra tính toán trừ tiền, copay (đồng chi trả), sublimits (hạn mức phụ theo ngày/đợt), deductibles.
     - `lookupPolicy`: Kiểm tra nạp chính sách bảo hiểm, thời hạn hiệu lực, kiểm tra danh mục loại trừ ICD-10.
     - `checkMedicalNecessity`: Kiểm tra quy tắc lâm sàng (loại trừ thủ thuật thẩm mỹ, thực phẩm chức năng).
     - `verifyDocument`: Kiểm tra phát hiện thiếu hóa đơn VAT, bản kê mờ nhòe, trạng thái chứng từ không hợp lệ.
2. **Integration Tests (Khảo sát Luồng Mastra Workflow Tất Định):**
   - Kiểm thử Mastra Workflow 4 bước tuần tự theo graph tất định (100% deterministic), mock phản hồi LLM hoặc sử dụng deterministic fixtures để đảm bảo test chạy ổn định, nhanh và không tốn chi phí token trong CI/CD.
3. **Contract Tests (Bảo Vệ Ranh Giới Dữ Liệu I/O):**
   - Đảm bảo 100% dữ liệu trao đổi giữa Backend NestJS và Frontend Next.js tuân thủ nghiêm ngặt Zod schema tại `packages/shared`.
4. **Resilience & Fault Tolerance Tests (Kiểm Thử Khả Năng Chịu Lỗi):**
   - Kiểm thử kịch bản timeout của LLM Provider, rớt kết nối stream Server-Sent Events (SSE), dịch vụ ngoài phản hồi lỗi 500.
5. **End-to-End Tests (E2E Workstation Flows):**
   - Kiểm thử luồng thao tác hoàn chỉnh từ lúc chọn hồ sơ, AI chạy thẩm định 4 bước, cập nhật thanh tiến trình, hiển thị Generative UI cards, và chuyên viên thực hiện Action Modal (Approve, Reject, Request Info, Override).

---

## 2. Quy Chuẩn Kiểm Thử 3 Kịch Bản Bắt Buộc (Official Benchmark Suite)

Senior Tester bắt buộc phải xây dựng và duy trì bộ test tự động kiểm chứng chính xác 3 kịch bản chuẩn hóa dựa trên schema thực tế của hệ thống:

```typescript
import { describe, it, expect } from 'vitest';
import { executeClaimsAssessmentWorkflow } from '../../apps/api/src/modules/mastra/mastra.workflow';
import { Claim, Policy } from '@papaya/shared';

describe('Claim Assessment Official Benchmark Suite', () => {
  // ---------------------------------------------------------------------------
  // Kịch bản 1: Phê duyệt thường quy (TC01 - Viêm ruột thừa cấp)
  // ---------------------------------------------------------------------------
  it('TC-01: Should APPROVE valid acute appendicitis claim with 20% copay on surgery', async () => {
    const report = await executeClaimsAssessmentWorkflow({ claim: tc01Claim, policy: goldPolicy });

    expect(report.finalRecommendation).toBe('APPROVE');
    expect(report.totalRequested).toBe(45000000);
    expect(report.totalPayable).toBe(36000000); // 20% copay phẫu thuật, các mục khác theo rule
    expect(report.totalDeductions).toBe(9000000);
    expect(report.missingDocuments.length).toBe(0);
    expect(report.confidenceScore).toBeGreaterThanOrEqual(90);
    expect(report.steps.every(s => s.status === 'PASSED')).toBe(true);
  });

  // ---------------------------------------------------------------------------
  // Kịch bản 2: Từ chối do loại trừ (TC02 - Trào ngược GERD khớp exclusion K21)
  // ---------------------------------------------------------------------------
  it('TC-02: Should REJECT claim when diagnosis matches policy exclusions', async () => {
    const report = await executeClaimsAssessmentWorkflow({ claim: tc02Claim, policy: goldPolicy });

    expect(report.finalRecommendation).toBe('REJECT');
    expect(report.policyExclusionsMatched).toContain('K21');
    expect(report.steps.find(s => s.step === 'LOOKUP_POLICY')?.status).toBe('FAILED');
    expect(report.totalPayable).toBe(0);
  });

  // ---------------------------------------------------------------------------
  // Kịch bản 3: Yêu cầu bổ sung chứng từ (TC03 - Thiếu VAT hoặc bản kê mờ)
  // ---------------------------------------------------------------------------
  it('TC-03: Should REQUEST_MORE_INFO when invoice is missing or invalid (NEVER auto-reject)', async () => {
    const report = await executeClaimsAssessmentWorkflow({
      claim: tc03Claim,
      policy: silverPolicy,
    });

    expect(report.finalRecommendation).toBe('REQUEST_MORE_INFO');
    expect(report.finalRecommendation).not.toBe('REJECT');
    expect(report.missingDocuments.length).toBeGreaterThan(0);
    expect(report.steps.find(s => s.step === 'VERIFY_DOCUMENT')?.status).toBe('ACTION_REQUIRED');
  });
});
```

---

## 3. Ma Trận Ca Biên & Kịch Bản Tiêu Cực (Edge Cases & Adverse Matrix)

Senior Tester phải chủ động kiểm chứng các ca biên đặc thù trong nghiệp vụ bảo hiểm y tế:

| Nhóm Kiểm Thử                      | Trường Hợp Ca Biên                                                  | Kết Quả Mong Đợi (Assert)                                                        |
| :--------------------------------- | :------------------------------------------------------------------ | :------------------------------------------------------------------------------- |
| **Hạn mức năm (Annual Limit)**     | Số tiền claim vượt quá hạn mức còn lại (`requested > balance`)      | Chỉ duyệt tối đa phần hạn mức còn lại, phần vượt ghi nhận vào `deductibleAmount` |
| **Hạn mức ngày (Daily Sublimit)**  | Tiền phòng 3.000.000 VND/ngày, hợp đồng giới hạn 1.500.000 VND/ngày | Trừ 1.500.000 VND/ngày vượt hạn mức vào deduction                                |
| **Thời gian chờ (Waiting Period)** | Điều trị bệnh đặc biệt vào ngày 29 (thời gian chờ 30 ngày)          | Báo lỗi vi phạm thời gian chờ, không duyệt quyền lợi                             |
| **Thời hạn hợp đồng**              | Ngày khám nằm ngoài khoảng `effectiveDate` đến `expiryDate`         | Từ chối bảo hiểm do hợp đồng chưa có hiệu lực hoặc đã hết hạn                    |
| **Số tiền bất thường**             | Số tiền hóa đơn $\le 0$, số lượng âm, định dạng chuỗi chữ           | Bắt lỗi ngay tại Zod Schema Boundary Validation, HTTP 400                        |
| **Tài liệu giả mạo/mờ**            | File scan chất lượng thấp, thiếu mộc đỏ bệnh viện                   | Cờ `INVALID` kích hoạt luồng `REQUEST_MORE_INFO`                                 |
| **Thẩm mỹ / Không thiết yếu**      | Hóa đơn chứa thủ thuật thẩm mỹ, thực phẩm chức năng                 | `checkMedicalNecessity` gắn cờ cảnh báo, loại trừ 100% khoản mục                 |

---

## 4. Cơ Chế Xuất Báo Cáo Kiểm Thử Tự Động ([test-reports/](file:///Users/tranquocdung/Projects/papaya-asign/test-reports))

Mọi lần chạy kiểm thử phục vụ nghiệm thu, audit nội bộ hoặc trong pipeline CI/CD **bắt buộc phải xuất dữ liệu ra thư mục [test-reports/](file:///Users/tranquocdung/Projects/papaya-asign/test-reports)** với các định dạng tiêu chuẩn:

### 1. Cấu Trúc Báo Cáo Xuất Bản

```text
test-reports/
├── coverage/                   # Báo cáo tỷ lệ bao phủ mã nguồn (Code Coverage)
│   ├── index.html              # Báo cáo trực quan HTML mở trên trình duyệt
│   ├── lcov.info               # Định dạng chuẩn SonarQube / Codecov
│   └── coverage-final.json     # Dữ liệu phân tích chi tiết
├── junit.xml                   # Báo cáo kết quả kiểm thử chuẩn JUnit (CI/CD Dashboard)
└── summary.json                # Tổng hợp số ca pass/fail, thời gian thực thi và tỷ lệ đạt
```

### 2. Ngưỡng Chất Lượng Tối Thiểu (QA Quality Gates Thresholds)

Mã nguồn chỉ được xem là đạt điều kiện bàn giao khi thỏa mãn các ngưỡng bao phủ tối thiểu:

- **Statements:** $\ge 85\%$
- **Branches:** $\ge 80\%$
- **Functions:** $\ge 90\%$
- **Lines:** $\ge 85\%$

---

## 5. Bộ Scripts & References Thực Thi Tự Động

Skill này cung cấp các công cụ kiểm thử tự động hóa đính kèm:

1. **[scripts/run-all-tests.sh](file:///Users/tranquocdung/Projects/papaya-asign/.agents/skills/papaya-tester-senior/scripts/run-all-tests.sh):** Script 1-lệnh thực thi toàn bộ test suite (Contracts, E2E, Unit), tự động tính toán code coverage và xuất đầy đủ báo cáo vào `test-reports/`.
2. **[scripts/verify-coverage-threshold.sh](file:///Users/tranquocdung/Projects/papaya-asign/.agents/skills/papaya-tester-senior/scripts/verify-coverage-threshold.sh):** Script thẩm định ngưỡng Quality Gate tự động, phát cảnh báo nếu tỷ lệ test coverage bị tụt giảm.
3. **[references/vitest.report.config.ts](file:///Users/tranquocdung/Projects/papaya-asign/.agents/skills/papaya-tester-senior/references/vitest.report.config.ts):** Mẫu cấu hình Vitest xuất báo cáo đa định dạng (HTML, LCOV, JUnit XML, JSON).
4. **[references/test-matrix-checklist.md](file:///Users/tranquocdung/Projects/papaya-asign/.agents/skills/papaya-tester-senior/references/test-matrix-checklist.md):** Bảng ma trận chi tiết đối chiếu các ca kiểm thử nghiệp vụ bảo hiểm y tế.
