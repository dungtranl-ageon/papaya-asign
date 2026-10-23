import { describe, it, expect } from 'vitest';
import { executeClaimsAssessmentWorkflow } from '../../apps/api/src/modules/mastra/mastra.workflow';
import { Claim } from '../../packages/shared/src';
import { mockBronzePolicy, mockPlatinumPolicy, mockSilverPolicy } from '../fixtures/mock-policies';

describe('Plan Tier Variants & Parameterized Benchmarks', () => {
  // ---------------------------------------------------------------------------
  // Variant TC-01A: Bronze Plan with 30% Copay (Hernia Repair - K40)
  // ---------------------------------------------------------------------------
  it('TC-VAR-01: Bronze Plan (30% copay) with Laparoscopic Inguinal Hernia (K40)', async () => {
    const bronzeClaim: Claim = {
      claimId: 'CLM-BRONZE-01',
      policyNumber: 'POL-BRONZE-55441',
      patientName: 'Le Van C',
      nationalId: '048200112233',
      hospitalName: 'Da Nang General Hospital',
      admissionDate: '2026-05-10T08:00:00Z',
      dischargeDate: '2026-05-12T10:00:00Z',
      diagnosisIcd10: 'K40',
      diagnosisDescription: 'Unilateral inguinal hernia without obstruction',
      status: 'SUBMITTED',
      totalRequested: 24000000,
      items: [
        {
          itemId: 'ITM-BRZ-01',
          description: 'Hernia Repair Surgery',
          category: 'SURGERY',
          amountRequested: 20000000,
        },
        {
          itemId: 'ITM-BRZ-02',
          description: 'Medication and recovery IV',
          category: 'MEDICATION',
          amountRequested: 4000000,
        },
      ],
      documents: [
        {
          docId: 'DOC-BRZ-01',
          docType: 'HOSPITAL_DISCHARGE',
          fileName: 'giay_ra_vien_k40.pdf',
          uploadedAt: '2026-05-13T08:00:00Z',
          status: 'VALID',
        },
        {
          docId: 'DOC-BRZ-02',
          docType: 'DETAILED_INVOICE',
          fileName: 'bang_ke_k40.pdf',
          uploadedAt: '2026-05-13T08:00:00Z',
          status: 'VALID',
        },
        {
          docId: 'DOC-BRZ-03',
          docType: 'VAT_INVOICE',
          fileName: 'vat_k40.pdf',
          uploadedAt: '2026-05-13T08:00:00Z',
          status: 'VALID',
        },
      ],
      createdAt: '2026-05-13T09:00:00Z',
      updatedAt: '2026-05-13T09:00:00Z',
    };

    const report = await executeClaimsAssessmentWorkflow({
      claim: bronzeClaim,
      policy: mockBronzePolicy,
    });

    // Bronze copay is 30% for both surgery and medication:
    // Surgery: 20,000,000 * 70% = 14,000,000; Deductions = 6,000,000
    // Medication: 4,000,000 * 70% = 2,800,000; Deductions = 1,200,000
    // Total Requested: 24,000,000; Total Payable: 16,800,000; Total Deductions: 7,200,000
    expect(report.finalRecommendation).toBe('APPROVE');
    expect(report.totalRequested).toBe(24000000);
    expect(report.totalPayable).toBe(16800000);
    expect(report.totalDeductions).toBe(7200000);
    expect(report.totalPayable + report.totalDeductions).toBe(report.totalRequested);
  });

  // ---------------------------------------------------------------------------
  // Variant TC-01B: Platinum VIP Plan with 0% Copay (Gallbladder Cholecystectomy - K80)
  // ---------------------------------------------------------------------------
  it('TC-VAR-02: Platinum VIP Plan (0% copay) with Laparoscopic Cholecystectomy (K80)', async () => {
    const platinumClaim: Claim = {
      claimId: 'CLM-PLAT-01',
      policyNumber: 'POL-PLATINUM-88888',
      patientName: 'Dang Thi D',
      nationalId: '001199554433',
      hospitalName: 'Vinmec Central Park',
      admissionDate: '2026-06-01T08:00:00Z',
      dischargeDate: '2026-06-04T12:00:00Z',
      diagnosisIcd10: 'K80',
      diagnosisDescription: 'Calculus of gallbladder with acute cholecystitis',
      status: 'SUBMITTED',
      totalRequested: 65000000,
      items: [
        {
          itemId: 'ITM-PLT-01',
          description: 'Cholecystectomy Surgery',
          category: 'SURGERY',
          amountRequested: 50000000,
        },
        {
          itemId: 'ITM-PLT-02',
          description: 'VIP Inpatient Room (3 days)',
          category: 'INPATIENT',
          amountRequested: 15000000, // 5,000,000/day <= sublimit 5,000,000/day
        },
      ],
      documents: [
        {
          docId: 'DOC-PLT-01',
          docType: 'HOSPITAL_DISCHARGE',
          fileName: 'vinmec_discharge.pdf',
          uploadedAt: '2026-06-05T08:00:00Z',
          status: 'VALID',
        },
        {
          docId: 'DOC-PLT-02',
          docType: 'DETAILED_INVOICE',
          fileName: 'vinmec_invoice.pdf',
          uploadedAt: '2026-06-05T08:00:00Z',
          status: 'VALID',
        },
        {
          docId: 'DOC-PLT-03',
          docType: 'VAT_INVOICE',
          fileName: 'vinmec_vat.pdf',
          uploadedAt: '2026-06-05T08:00:00Z',
          status: 'VALID',
        },
      ],
      createdAt: '2026-06-05T09:00:00Z',
      updatedAt: '2026-06-05T09:00:00Z',
    };

    const report = await executeClaimsAssessmentWorkflow({
      claim: platinumClaim,
      policy: mockPlatinumPolicy,
    });

    // 0% Copay -> 100% reimbursed without deduction
    expect(report.finalRecommendation).toBe('APPROVE');
    expect(report.totalRequested).toBe(65000000);
    expect(report.totalPayable).toBe(65000000);
    expect(report.totalDeductions).toBe(0);
  });

  // ---------------------------------------------------------------------------
  // Variant TC-02B: Rejection by Specific Policy Exclusion (Low back pain - M54.5)
  // ---------------------------------------------------------------------------
  it('TC-VAR-03: Rejection on Silver Policy for Low Back Pain (M54.5) matching exclusions', async () => {
    const excludedClaim: Claim = {
      claimId: 'CLM-SILVER-EXC',
      policyNumber: 'POL-SILVER-11223',
      patientName: 'Tran Thi B',
      nationalId: '079198054321',
      hospitalName: 'Orthopedic Hospital',
      admissionDate: '2026-04-10T08:00:00Z',
      dischargeDate: '2026-04-10T17:00:00Z',
      diagnosisIcd10: 'M54.5',
      diagnosisDescription: 'Low back pain chronic strain',
      status: 'SUBMITTED',
      totalRequested: 4200000,
      items: [
        {
          itemId: 'ITM-EXC-01',
          description: 'Physiotherapy & Lumbar Traction',
          category: 'OUTPATIENT',
          amountRequested: 2200000,
        },
        {
          itemId: 'ITM-EXC-02',
          description: 'Muscle relaxants',
          category: 'MEDICATION',
          amountRequested: 2000000,
        },
      ],
      documents: [
        {
          docId: 'DOC-EXC-01',
          docType: 'HOSPITAL_DISCHARGE',
          fileName: 'discharge.pdf',
          uploadedAt: '2026-04-11T08:00:00Z',
          status: 'VALID',
        },
        {
          docId: 'DOC-EXC-02',
          docType: 'DETAILED_INVOICE',
          fileName: 'detailed.pdf',
          uploadedAt: '2026-04-11T08:00:00Z',
          status: 'VALID',
        },
        {
          docId: 'DOC-EXC-03',
          docType: 'VAT_INVOICE',
          fileName: 'vat.pdf',
          uploadedAt: '2026-04-11T08:00:00Z',
          status: 'VALID',
        },
      ],
      createdAt: '2026-04-11T09:00:00Z',
      updatedAt: '2026-04-11T09:00:00Z',
    };

    const report = await executeClaimsAssessmentWorkflow({
      claim: excludedClaim,
      policy: mockSilverPolicy,
    });

    expect(report.finalRecommendation).toBe('REJECT');
    expect(report.policyExclusionsMatched).toContain('M54.5');
    expect(report.totalPayable).toBe(0);
    expect(report.totalDeductions).toBe(4200000);
  });

  // ---------------------------------------------------------------------------
  // Variant TC-03B: Request More Info due to Missing Hospital Discharge Summary
  // ---------------------------------------------------------------------------
  it('TC-VAR-04: REQUEST_MORE_INFO when HOSPITAL_DISCHARGE is missing (has VAT and Detailed)', async () => {
    const missingDischargeClaim: Claim = {
      claimId: 'CLM-MISSING-DISCHARGE',
      policyNumber: 'POL-SILVER-11223',
      patientName: 'Tran Thi B',
      nationalId: '079198054321',
      hospitalName: 'Community Hospital',
      admissionDate: '2026-04-01T08:00:00Z',
      dischargeDate: '2026-04-03T10:00:00Z',
      diagnosisIcd10: 'J06.9',
      diagnosisDescription: 'Acute upper respiratory infection',
      status: 'SUBMITTED',
      totalRequested: 5000000,
      items: [
        {
          itemId: 'ITM-MD-01',
          description: 'Medication',
          category: 'MEDICATION',
          amountRequested: 5000000,
        },
      ],
      documents: [
        {
          docId: 'DOC-MD-01',
          docType: 'DETAILED_INVOICE',
          fileName: 'detailed.pdf',
          uploadedAt: '2026-04-04T08:00:00Z',
          status: 'VALID',
        },
        {
          docId: 'DOC-MD-02',
          docType: 'VAT_INVOICE',
          fileName: 'vat.pdf',
          uploadedAt: '2026-04-04T08:00:00Z',
          status: 'VALID',
        },
      ],
      createdAt: '2026-04-04T09:00:00Z',
      updatedAt: '2026-04-04T09:00:00Z',
    };

    const report = await executeClaimsAssessmentWorkflow({
      claim: missingDischargeClaim,
      policy: mockSilverPolicy,
    });

    expect(report.finalRecommendation).toBe('REQUEST_MORE_INFO');
    expect(report.missingDocuments).toContain('HOSPITAL_DISCHARGE');
    expect(report.totalPayable).toBe(0);
  });
});
