import { describe, it, expect } from 'vitest';
import { executeClaimsAssessmentWorkflow } from '../../apps/api/src/modules/mastra/mastra.workflow';
import { Claim, Policy } from '../../packages/shared/src';

describe('E2E Assessment Workflow Flow', () => {
  const claim: Claim = {
    claimId: 'CLM-E2E-001',
    policyNumber: 'POL-GOLD-99882',
    patientName: 'Nguyen Van A',
    nationalId: '001099012345',
    hospitalName: 'FV Hospital',
    admissionDate: '2026-03-10',
    dischargeDate: '2026-03-13',
    diagnosisIcd10: 'K35',
    diagnosisDescription: 'Acute Appendicitis',
    status: 'SUBMITTED',
    totalRequested: 25000000,
    items: [
      {
        itemId: 'ITEM-1',
        description: 'Laparoscopic Appendectomy',
        category: 'SURGERY',
        amountRequested: 25000000,
      },
    ],
    documents: [
      {
        docId: 'DOC-1',
        docType: 'HOSPITAL_DISCHARGE',
        fileName: 'discharge.pdf',
        uploadedAt: '2026-03-13T10:00:00Z',
        status: 'VALID',
      },
      {
        docId: 'DOC-2',
        docType: 'DETAILED_INVOICE',
        fileName: 'invoice.pdf',
        uploadedAt: '2026-03-13T10:00:00Z',
        status: 'VALID',
      },
      {
        docId: 'DOC-3',
        docType: 'VAT_INVOICE',
        fileName: 'vat.pdf',
        uploadedAt: '2026-03-13T10:00:00Z',
        status: 'VALID',
      },
    ],
    createdAt: '2026-03-14T08:00:00Z',
    updatedAt: '2026-03-14T08:00:00Z',
  };

  const policy: Policy = {
    policyNumber: 'POL-GOLD-99882',
    insuredName: 'Nguyen Van A',
    nationalId: '001099012345',
    planName: 'Healthcare Gold',
    status: 'ACTIVE',
    effectiveDate: '2026-01-01',
    expiryDate: '2026-12-31',
    annualTotalLimit: 500000000,
    annualUsedAmount: 0,
    exclusions: ['K21'],
    benefits: [
      {
        category: 'SURGERY',
        maxLimitPerClaim: 30000000,
        maxLimitPerYear: 100000000,
        copayRate: 0.2,
      },
    ],
  };

  it('runs complete 4-step workflow and returns APPROVE report with accurate calculations', async () => {
    const report = await executeClaimsAssessmentWorkflow({ claim, policy });

    expect(report.finalRecommendation).toBe('APPROVE');
    expect(report.totalRequested).toBe(25000000);
    expect(report.totalPayable).toBe(20000000);
    expect(report.steps.length).toBe(4);
    expect(report.confidenceScore).toBeGreaterThanOrEqual(90);
  });
});
