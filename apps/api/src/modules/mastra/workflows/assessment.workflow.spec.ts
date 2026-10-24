import { describe, it, expect, vi } from 'vitest';
import { AssessmentReport } from '@papaya/shared';
import { claimsAssessmentWorkflow, executeClaimsAssessmentWorkflow } from './assessment.workflow';
import { mockGoldPolicy, mockSilverPolicy } from '../../../../../../tests/fixtures/mock-policies';
import {
  mockTc01Claim,
  mockTc02Claim,
  mockTc03Claim,
} from '../../../../../../tests/fixtures/mock-claims';

describe('Mastra Workflow Canonical Engine Specification', () => {
  it('registers 5 distinct steps in claimsAssessmentWorkflow', () => {
    expect(claimsAssessmentWorkflow.id).toBe('claimsAssessmentWorkflow');
    expect(claimsAssessmentWorkflow.steps).toBeDefined();
    const stepIds = Object.keys(claimsAssessmentWorkflow.steps);
    expect(stepIds).toContain('verifyDocumentStep');
    expect(stepIds).toContain('lookupPolicyStep');
    expect(stepIds).toContain('checkMedicalNecessityStep');
    expect(stepIds).toContain('calculateBenefitStep');
    expect(stepIds).toContain('synthesizeReportStep');
  });

  it('executes end-to-end via Mastra createRun() and run.start() directly', async () => {
    const run = await claimsAssessmentWorkflow.createRun();
    const res = await run.start({
      inputData: {
        claim: mockTc01Claim,
        policy: mockGoldPolicy,
        steps: [],
      },
    });

    expect(res.status).toBe('success');
    if (res.status === 'success') {
      const report = res.result as AssessmentReport;
      expect(report.finalRecommendation).toBe('APPROVE');
      expect(report.totalRequested).toBe(45000000);
      expect(report.totalPayable).toBe(38000000);
      expect(report.totalDeductions).toBe(7000000);
      expect(report.steps.length).toBe(4);
      expect(report.steps.every((s: { status: string }) => s.status === 'PASSED')).toBe(true);
    }
  });

  it('streams Mastra workflow chunks and triggers step callbacks', async () => {
    const onProgress = vi.fn();
    const report = await executeClaimsAssessmentWorkflow(
      {
        claim: mockTc01Claim,
        policy: mockGoldPolicy,
      },
      onProgress,
    );

    expect(report.finalRecommendation).toBe('APPROVE');
    expect(onProgress).toHaveBeenCalledWith('VERIFY_DOCUMENT_START', expect.any(Object));
    expect(onProgress).toHaveBeenCalledWith('VERIFY_DOCUMENT_COMPLETE', expect.any(Object));
    expect(onProgress).toHaveBeenCalledWith('LOOKUP_POLICY_START', expect.any(Object));
    expect(onProgress).toHaveBeenCalledWith('LOOKUP_POLICY_COMPLETE', expect.any(Object));
    expect(onProgress).toHaveBeenCalledWith('CHECK_MEDICAL_NECESSITY_START', expect.any(Object));
    expect(onProgress).toHaveBeenCalledWith('CHECK_MEDICAL_NECESSITY_COMPLETE', expect.any(Object));
    expect(onProgress).toHaveBeenCalledWith('CALCULATE_BENEFIT_START', expect.any(Object));
    expect(onProgress).toHaveBeenCalledWith('CALCULATE_BENEFIT_COMPLETE', expect.any(Object));
    expect(onProgress).toHaveBeenCalledWith('REPORT_COMPLETE', expect.any(Object));
  });

  it('stops downstream tools and gates properly when Step 1 is incomplete', async () => {
    const report = await executeClaimsAssessmentWorkflow({
      claim: mockTc03Claim,
      policy: mockSilverPolicy,
    });

    expect(report.finalRecommendation).toBe('REQUEST_MORE_INFO');
    expect(report.totalPayable).toBe(0);
    expect(report.totalDeductions).toBe(mockTc03Claim.totalRequested);
    expect(report.missingDocuments).toContain('VAT_INVOICE');

    const step1 = report.steps.find(s => s.step === 'VERIFY_DOCUMENT');
    const step2 = report.steps.find(s => s.step === 'LOOKUP_POLICY');
    const step3 = report.steps.find(s => s.step === 'CHECK_MEDICAL_NECESSITY');
    const step4 = report.steps.find(s => s.step === 'CALCULATE_BENEFIT');

    expect(step1?.status).toBe('ACTION_REQUIRED');
    expect(step2?.status).toBe('PENDING');
    expect(step3?.status).toBe('PENDING');
    expect(step4?.status).toBe('PENDING');
  });

  it('rejects claim and halts downstream processing when Step 2 policy check fails', async () => {
    const report = await executeClaimsAssessmentWorkflow({
      claim: mockTc02Claim,
      policy: mockGoldPolicy,
    });

    expect(report.finalRecommendation).toBe('REJECT');
    expect(report.totalPayable).toBe(0);
    expect(report.policyExclusionsMatched).toContain('K21');

    const step1 = report.steps.find(s => s.step === 'VERIFY_DOCUMENT');
    const step2 = report.steps.find(s => s.step === 'LOOKUP_POLICY');
    const step3 = report.steps.find(s => s.step === 'CHECK_MEDICAL_NECESSITY');
    const step4 = report.steps.find(s => s.step === 'CALCULATE_BENEFIT');

    expect(step1?.status).toBe('PASSED');
    expect(step2?.status).toBe('FAILED');
    expect(step3?.status).toBe('PENDING');
    expect(step4?.status).toBe('PENDING');
  });
});
