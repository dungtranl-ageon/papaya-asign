---
name: papaya-tester-senior
description: >-
  Use this skill for senior QA leadership and comprehensive test engineering:
  designing deterministic test suites for AI workflows, validating the 3 official test cases,
  hunting edge cases, asserting mathematical correctness, and enforcing the reproduce-first bug fixing discipline.
---

# Papaya Senior Test Engineer Skill

Skill này đóng vai trò là kim chỉ nam dành cho **Senior QA / Test Automation Architect**, đảm bảo tính đúng đắn tuyệt đối, độ tin cậy và khả năng tái lập (reproducibility) của hệ thống thẩm định bồi thường trước khi bàn giao cho người dùng hoặc nộp bài.

---

## 1. Kim Tự Tháp Kiểm Thử (Testing Pyramid)

```
                     / \
                    /   \
                   / E2E \       Playwright / Workstation UI Flows (Dual-Pane)
                  /───────\
                 /  Integ  \     NestJS Supertest + Mastra Workflow Execution
                /───────────\
               /  Unit Tests \   Pure Math Engine, Zod Parsers, MCP Tool Contracts
              /───────────────\
```

1. **Unit Tests (Cực nhanh, bao phủ 100% Core Logic):**
   * Kiểm thử độc lập 4 tools trong `packages/mcp-server`:
     * `calculateBenefit`: Kiểm tra tính trừ tiền, mức miễn thường, copay, và trần hạn mức.
     * `lookupPolicy`: Kiểm tra nạp đúng danh mục loại trừ và bảng quyền lợi.
     * `checkMedicalNecessity`: Kiểm tra đối chiếu chẩn đoán ICD-10 và thủ thuật.
     * `verifyDocument`: Kiểm tra phát hiện thiếu chứng từ, mộc đỏ, và cờ giả mạo.
2. **Integration Tests (Khảo sát Luồng Mastra Workflow):**
   * Kiểm thử Mastra Workflow 4 bước tuần tự bằng cách mock phản hồi LLM (Deterministic Test Fixtures) để đảm bảo test chạy ổn định, nhanh và không tốn tiền API trong CI/CD.
3. **Contract Tests (Ranh giới I/O):**
   * Đảm bảo mọi phản hồi từ NestJS sang Next.js khớp 100% với Zod schema trong `packages/shared`.

---

## 2. Quy Chuẩn Kiểm Thử 3 Kịch Bản Bắt Buộc (Official Benchmark)

Senior Tester phải đảm bảo có bộ test tự động kiểm chứng chính xác 3 kịch bản:

```typescript
describe('Claim Assessment Official Test Suite', () => {
  // Kịch bản 1: Phê duyệt thường quy
  it('TC-01: Should APPROVE valid outpatient claim with 20% copay', async () => {
    const result = await workflow.execute(testCase01Payload);
    expect(result.recommendation).toBe('APPROVE');
    expect(result.benefit_calculation.submitted_amount).toBe(2500000);
    expect(result.benefit_calculation.covered_amount).toBe(2000000);
    expect(result.benefit_calculation.copay_amount).toBe(500000);
    expect(result.benefit_calculation.remaining_balance_after_claim).toBe(43000000);
    expect(result.policy_citations.length).toBeGreaterThanOrEqual(1);
  });

  // Kịch bản 2: Từ chối do loại trừ
  it('TC-02: Should REJECT cosmetic surgery under Clause 8.2', async () => {
    const result = await workflow.execute(testCase02Payload);
    expect(result.recommendation).toBe('REJECT');
    expect(result.benefit_calculation.covered_amount).toBe(0);
    expect(result.benefit_calculation.member_pays).toBe(35000000);
    expect(result.policy_citations).toEqual(
      expect.arrayContaining([expect.objectContaining({ clause_id: expect.stringMatching(/EXCL.*COSMETIC/i) })])
    );
  });

  // Kịch bản 3: Yêu cầu bổ sung chứng từ (Bẫy đề bài)
  it('TC-03: Should REQUEST_MORE_INFO when discharge summary is missing (NEVER REJECT)', async () => {
    const result = await workflow.execute(testCase03Payload);
    expect(result.recommendation).toBe('REQUEST_MORE_INFO');
    expect(result.recommendation).not.toBe('REJECT');
    expect(result.document_review.status).toBe('INCOMPLETE');
    expect(result.document_review.required_documents_missing).toContainEqual(
      expect.stringMatching(/giấy ra viện|discharge/i)
    );
  });
});
```

---

## 3. Danh Mục Ca Biên Cần Thẩm Định (Edge Cases Checklist)

* [ ] **Biên Hạn mức (Limit Boundary):** Số tiền claim lớn hơn hạn mức còn lại (`submitted > balance`) -> Chỉ duyệt tối đa phần hạn mức còn lại (`PARTIALLY_COVERED`).
* [ ] **Biên Thời gian chờ (Waiting Period Boundary):** 
  * Điều trị vào ngày thứ 29 (Thời gian chờ 30 ngày) -> Từ chối do chưa hết thời gian chờ.
  * Điều trị vào ngày thứ 31 -> Chấp thuận hợp lệ.
* [ ] **Số tiền Bất thường:** Hóa đơn bằng 0 hoặc âm -> Hệ thống bắt lỗi Validation Error ngay tại cổng vào, không chuyển cho Agent xử lý.
* [ ] **Tài liệu Mâu thuẫn:** Tên trên hóa đơn viện phí khác tên thành viên trong hợp đồng -> Gắn cờ cảnh báo nghi vấn gian lận.

---

## 4. Kỷ Luật Sửa Lỗi (Bug-Fixing Protocol)

Khi phát hiện bug hoặc reviewer phản hồi sai số:
1. **Bước 1 (Reproduce):** Viết một test case mô phỏng đúng điều kiện lỗi, chạy test và xác nhận kết quả `FAILED`.
2. **Bước 2 (Fix):** Chỉnh sửa tối thiểu mã nguồn tại gốc rễ vấn đề.
3. **Bước 3 (Verify):** Chạy lại test vừa viết (`PASSED`) và chạy toàn bộ test suite (`Regression Passed`) trước khi báo cáo hoàn thành.
