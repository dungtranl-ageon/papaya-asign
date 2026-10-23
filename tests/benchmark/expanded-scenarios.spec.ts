import { describe, it, expect } from 'vitest';
import { executeClaimsAssessmentWorkflow } from '../../apps/api/src/modules/mastra/mastra.workflow';
import { mockGoldPolicy, mockSilverPolicy } from '../fixtures/mock-policies';
import { Claim, Policy } from '../../packages/shared/src';

describe('Expanded Scenarios Test Suite (Non-Mandated Critical Cases)', () => {
  // ---------------------------------------------------------------------------
  // Kịch bản 4: Hợp đồng đã hết hạn (Expired Policy)
  // ---------------------------------------------------------------------------
  it('TC-04: Should REJECT when service date occurs after policy expiration', async () => {
    const expiredClaim: Claim = {
      claimId: 'CLM-EXP-01',
      policyNumber: mockGoldPolicy.policyNumber,
      patientName: 'Nguyen Van A',
      nationalId: '001099012345',
      hospitalName: 'FV Hospital',
      admissionDate: '2027-03-10T08:00:00Z', // 2027 is past expiry 2026-12-31
      dischargeDate: '2027-03-12T14:00:00Z',
      diagnosisIcd10: 'K35',
      diagnosisDescription: 'Acute appendicitis',
      status: 'SUBMITTED',
      totalRequested: 20000000,
      items: [
        {
          itemId: 'ITM-1',
          description: 'Laparoscopic Surgery',
          category: 'SURGERY',
          amountRequested: 20000000,
        },
      ],
      documents: [
        {
          docId: 'D1',
          docType: 'HOSPITAL_DISCHARGE',
          fileName: 'd.pdf',
          uploadedAt: '2027-03-13',
          status: 'VALID',
        },
        {
          docId: 'D2',
          docType: 'DETAILED_INVOICE',
          fileName: 'i.pdf',
          uploadedAt: '2027-03-13',
          status: 'VALID',
        },
        {
          docId: 'D3',
          docType: 'VAT_INVOICE',
          fileName: 'v.pdf',
          uploadedAt: '2027-03-13',
          status: 'VALID',
        },
      ],
      createdAt: '2027-03-14T10:00:00Z',
      updatedAt: '2027-03-14T10:00:00Z',
    };

    const report = await executeClaimsAssessmentWorkflow({
      claim: expiredClaim,
      policy: mockGoldPolicy,
    });

    expect(report.finalRecommendation).toBe('REJECT');
    const policyStep = report.steps.find(s => s.step === 'LOOKUP_POLICY');
    expect(policyStep?.status).toBe('FAILED');
    expect(policyStep?.message).toContain('outside policy validity period');
    expect(report.totalPayable).toBe(0);
  });

  // ---------------------------------------------------------------------------
  // Kịch bản 5: Hạn mức năm đã cạn kiệt (Annual Limit Exhaustion)
  // ---------------------------------------------------------------------------
  it('TC-05: Should REJECT when policy annual total limit is fully exhausted', async () => {
    const exhaustedPolicy: Policy = {
      ...mockGoldPolicy,
      annualTotalLimit: 500000000,
      annualUsedAmount: 500000000, // 0 remaining
    };

    const testClaim: Claim = {
      claimId: 'CLM-LIMIT-01',
      policyNumber: exhaustedPolicy.policyNumber,
      patientName: 'Nguyen Van A',
      nationalId: '001099012345',
      hospitalName: 'FV Hospital',
      admissionDate: '2026-05-10T08:00:00Z',
      dischargeDate: '2026-05-12T14:00:00Z',
      diagnosisIcd10: 'K35',
      diagnosisDescription: 'Acute appendicitis',
      status: 'SUBMITTED',
      totalRequested: 20000000,
      items: [
        {
          itemId: 'ITM-1',
          description: 'Emergency Surgery',
          category: 'SURGERY',
          amountRequested: 20000000,
        },
      ],
      documents: [
        {
          docId: 'D1',
          docType: 'HOSPITAL_DISCHARGE',
          fileName: 'd.pdf',
          uploadedAt: '2026-05-13',
          status: 'VALID',
        },
        {
          docId: 'D2',
          docType: 'DETAILED_INVOICE',
          fileName: 'i.pdf',
          uploadedAt: '2026-05-13',
          status: 'VALID',
        },
        {
          docId: 'D3',
          docType: 'VAT_INVOICE',
          fileName: 'v.pdf',
          uploadedAt: '2026-05-13',
          status: 'VALID',
        },
      ],
      createdAt: '2026-05-14T10:00:00Z',
      updatedAt: '2026-05-14T10:00:00Z',
    };

    const report = await executeClaimsAssessmentWorkflow({
      claim: testClaim,
      policy: exhaustedPolicy,
    });

    expect(report.finalRecommendation).toBe('REJECT');
    const policyStep = report.steps.find(s => s.step === 'LOOKUP_POLICY');
    expect(policyStep?.status).toBe('FAILED');
    expect(policyStep?.message).toContain('exhausted');
    expect(report.totalPayable).toBe(0);
  });

  // ---------------------------------------------------------------------------
  // Kịch bản 6: Can thiệp thẩm mỹ không thiết yếu (MANUAL_ESCALATION)
  // ---------------------------------------------------------------------------
  it('TC-06: Should trigger MANUAL_ESCALATION when treatment is flagged as non-necessary cosmetic surgery', async () => {
    const cosmeticClaim: Claim = {
      claimId: 'CLM-COSMETIC-01',
      policyNumber: mockGoldPolicy.policyNumber,
      patientName: 'Nguyen Van A',
      nationalId: '001099012345',
      hospitalName: 'Aesthetic Clinic',
      admissionDate: '2026-04-10T08:00:00Z',
      dischargeDate: '2026-04-10T16:00:00Z',
      diagnosisIcd10: 'L70',
      diagnosisDescription: 'Acne and skin condition',
      status: 'SUBMITTED',
      totalRequested: 15000000,
      items: [
        {
          itemId: 'ITM-COSMETIC',
          description: 'Phẫu thuật thẩm mỹ làm đẹp da mặt',
          category: 'SURGERY',
          amountRequested: 15000000,
        },
      ],
      documents: [
        {
          docId: 'D1',
          docType: 'HOSPITAL_DISCHARGE',
          fileName: 'd.pdf',
          uploadedAt: '2026-04-11',
          status: 'VALID',
        },
        {
          docId: 'D2',
          docType: 'DETAILED_INVOICE',
          fileName: 'i.pdf',
          uploadedAt: '2026-04-11',
          status: 'VALID',
        },
        {
          docId: 'D3',
          docType: 'VAT_INVOICE',
          fileName: 'v.pdf',
          uploadedAt: '2026-04-11',
          status: 'VALID',
        },
      ],
      createdAt: '2026-04-12T10:00:00Z',
      updatedAt: '2026-04-12T10:00:00Z',
    };

    const report = await executeClaimsAssessmentWorkflow({
      claim: cosmeticClaim,
      policy: mockGoldPolicy,
    });

    expect(report.finalRecommendation).toBe('MANUAL_ESCALATION');
    const necessityStep = report.steps.find(s => s.step === 'CHECK_MEDICAL_NECESSITY');
    expect(necessityStep?.status).toBe('WARNING');
    expect(necessityStep?.message).toContain('cosmetic');
  });

  // ---------------------------------------------------------------------------
  // Kịch bản 7: Nhiều khoản mục kết hợp & kiểm tra bảo toàn số học
  // ---------------------------------------------------------------------------
  it('TC-07: Should calculate complex multi-item claim with absolute arithmetic conservation', async () => {
    const multiItemClaim: Claim = {
      claimId: 'CLM-MULTI-01',
      policyNumber: mockSilverPolicy.policyNumber,
      patientName: 'Tran Thi B',
      nationalId: '079198054321',
      hospitalName: 'Cho Ray Hospital',
      admissionDate: '2026-07-01T08:00:00Z',
      dischargeDate: '2026-07-05T12:00:00Z',
      diagnosisIcd10: 'J18', // Pneumonia
      diagnosisDescription: 'Pneumonia',
      status: 'SUBMITTED',
      totalRequested: 28000000,
      items: [
        {
          itemId: 'ITM-1',
          description: 'Inpatient Care (4 days)',
          category: 'INPATIENT',
          amountRequested: 15000000,
        },
        {
          itemId: 'ITM-2',
          description: 'IV Antibiotics',
          category: 'MEDICATION',
          amountRequested: 8000000,
        },
        {
          itemId: 'ITM-3',
          description: 'Outpatient Follow-up Consultation',
          category: 'OUTPATIENT',
          amountRequested: 3000000,
        },
        {
          itemId: 'ITM-4',
          description: 'Dental check',
          category: 'DENTAL', // Not covered in Silver
          amountRequested: 2000000,
        },
      ],
      documents: [
        {
          docId: 'D1',
          docType: 'HOSPITAL_DISCHARGE',
          fileName: 'd.pdf',
          uploadedAt: '2026-07-06',
          status: 'VALID',
        },
        {
          docId: 'D2',
          docType: 'DETAILED_INVOICE',
          fileName: 'i.pdf',
          uploadedAt: '2026-07-06',
          status: 'VALID',
        },
        {
          docId: 'D3',
          docType: 'VAT_INVOICE',
          fileName: 'v.pdf',
          uploadedAt: '2026-07-06',
          status: 'VALID',
        },
      ],
      createdAt: '2026-07-07T10:00:00Z',
      updatedAt: '2026-07-07T10:00:00Z',
    };

    const report = await executeClaimsAssessmentWorkflow({
      claim: multiItemClaim,
      policy: mockSilverPolicy,
    });

    expect(report.finalRecommendation).toBe('APPROVE');
    expect(report.totalRequested).toBe(28000000);
    // Uncovered DENTAL (2M) must be in deductions
    const dentalItem = report.breakdown.find(b => b.category === 'DENTAL');
    expect(dentalItem?.payableAmount).toBe(0);
    expect(dentalItem?.deductibleAmount).toBe(2000000);

    // Invariant: Total Payable + Total Deductions == Total Requested
    expect(report.totalPayable + report.totalDeductions).toBe(report.totalRequested);
  });
});
