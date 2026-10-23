import { describe, it, expect } from 'vitest';
import { executeClaimsAssessmentWorkflow } from '../../apps/api/src/modules/mastra/mastra.workflow';
import { mockGoldPolicy, mockSilverPolicy } from '../fixtures/mock-policies';
import { mockTc01Claim, mockTc02Claim, mockTc03Claim } from '../fixtures/mock-claims';

describe('Official Benchmark Test Suite (Mandated Test Cases)', () => {
  // ---------------------------------------------------------------------------
  // Kịch bản 1: Phê duyệt thường quy (TC01 - Viêm ruột thừa cấp, FV Hospital)
  // ---------------------------------------------------------------------------
  it('TC-01: Should APPROVE valid acute appendicitis claim with 20% surgery copay and 10% inpatient copay', async () => {
    const report = await executeClaimsAssessmentWorkflow({
      claim: mockTc01Claim,
      policy: mockGoldPolicy,
    });

    // Verification 1: Recommendation & Confidence
    expect(report.finalRecommendation).toBe('APPROVE');
    expect(report.confidenceScore).toBeGreaterThanOrEqual(90);

    // Verification 2: Mathematical Precision
    // Surgery: 25M, copay 20% = 5M copay, payable 20M
    // Inpatient: 9M, copay 10% = 900K copay, payable 8.1M
    // Medication: 6M, copay 10% = 600K copay, payable 5.4M
    // Laboratory: 5M, copay 10% = 500K copay, payable 4.5M
    // Total Requested: 45M
    // Total Payable: 20M + 8.1M + 5.4M + 4.5M = 38M
    // Total Deductions (Copay): 5M + 0.9M + 0.6M + 0.5M = 7M
    expect(report.totalRequested).toBe(45000000);
    expect(report.totalPayable).toBe(38000000);
    expect(report.totalDeductions).toBe(7000000);
    expect(report.totalPayable + report.totalDeductions).toBe(report.totalRequested);

    // Verification 3: Steps & Documents
    expect(report.missingDocuments.length).toBe(0);
    expect(report.steps.every(s => s.status === 'PASSED')).toBe(true);
    expect(report.breakdown.length).toBe(4);
  });

  // ---------------------------------------------------------------------------
  // Kịch bản 2: Từ chối do loại trừ (TC02 - Trào ngược GERD K21)
  // ---------------------------------------------------------------------------
  it('TC-02: Should REJECT claim when diagnosis matches policy exclusions (K21)', async () => {
    const report = await executeClaimsAssessmentWorkflow({
      claim: mockTc02Claim,
      policy: mockGoldPolicy,
    });

    // Verification 1: Recommendation
    expect(report.finalRecommendation).toBe('REJECT');

    // Verification 2: Policy Exclusions Citation
    expect(report.policyExclusionsMatched).toContain('K21');
    const policyStep = report.steps.find(s => s.step === 'LOOKUP_POLICY');
    expect(policyStep?.status).toBe('FAILED');
    expect(policyStep?.message).toContain('matches policy exclusion list');

    // Verification 3: Payout is zero
    expect(report.totalPayable).toBe(0);
  });

  // ---------------------------------------------------------------------------
  // Kịch bản 3: Yêu cầu bổ sung chứng từ (TC03 - Thiếu hóa đơn VAT và bản kê mờ)
  // ---------------------------------------------------------------------------
  it('TC-03: Should REQUEST_MORE_INFO when documents are missing or invalid (NEVER REJECT)', async () => {
    const report = await executeClaimsAssessmentWorkflow({
      claim: mockTc03Claim,
      policy: mockSilverPolicy,
    });

    // Verification 1: Recommendation MUST NOT BE REJECT
    expect(report.finalRecommendation).toBe('REQUEST_MORE_INFO');
    expect(report.finalRecommendation).not.toBe('REJECT');

    // Verification 2: Missing Documents Cited
    expect(report.missingDocuments).toContain('VAT_INVOICE');
    const docStep = report.steps.find(s => s.step === 'VERIFY_DOCUMENT');
    expect(docStep?.status).toBe('ACTION_REQUIRED');
    expect(docStep?.message).toContain('Missing: VAT_INVOICE');
  });
});
