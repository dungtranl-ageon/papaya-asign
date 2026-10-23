import { describe, it, expect } from 'vitest';
import {
  verifyDocument,
  lookupPolicy,
  checkMedicalNecessity,
  calculateBenefit,
} from '../../packages/mcp-server/src';
import { Policy } from '../../packages/shared/src';

describe('MCP Tools Unit & Contract Verification', () => {
  const mockPolicy: Policy = {
    policyNumber: 'POL-GOLD-99882',
    insuredName: 'Nguyen Van A',
    nationalId: '001099012345',
    planName: 'Healthcare Gold',
    status: 'ACTIVE',
    effectiveDate: '2026-01-01',
    expiryDate: '2026-12-31',
    annualTotalLimit: 500000000,
    annualUsedAmount: 15000000,
    exclusions: ['K21'],
    benefits: [
      {
        category: 'SURGERY',
        maxLimitPerClaim: 30000000,
        maxLimitPerYear: 100000000,
        copayRate: 0.2, // 20% copay
      },
    ],
  };

  it('Tool 1: verifyDocument passes when all required docs are present and valid', async () => {
    const result = await verifyDocument({
      claimId: 'CLM-001',
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
    });

    expect(result.isComplete).toBe(true);
    expect(result.missingTypes.length).toBe(0);
  });

  it('Tool 2: lookupPolicy correctly rejects claim if diagnosis matches exclusion', async () => {
    const result = await lookupPolicy(
      {
        policyNumber: 'POL-GOLD-99882',
        serviceDate: '2026-03-10',
        diagnosisIcd10: 'K21',
      },
      mockPolicy,
    );

    expect(result.isEligible).toBe(false);
    expect(result.isExclusionMatched).toBe(true);
  });

  it('Tool 3: checkMedicalNecessity flags cosmetic treatments', async () => {
    const result = await checkMedicalNecessity({
      diagnosisIcd10: 'K35',
      diagnosisDescription: 'Acute Appendicitis',
      items: [
        {
          itemId: 'ITEM-1',
          description: 'Cosmetic skin care',
          category: 'SPECIALIST_FEE',
          amountRequested: 5000000,
        },
      ],
      lengthOfStayDays: 3,
    });

    expect(result.isPassed).toBe(false);
    expect(result.warningFlags.length).toBeGreaterThan(0);
  });

  it('Tool 4: calculateBenefit calculates correct copay and payable amount', async () => {
    const result = await calculateBenefit({
      claimId: 'CLM-001',
      items: [
        {
          itemId: 'ITEM-SURGERY',
          description: 'Appendectomy',
          category: 'SURGERY',
          amountRequested: 25000000,
        },
      ],
      policy: mockPolicy,
    });

    // 25M requested, eligible: 25M, 20% copay = 5M, payable = 20M
    expect(result.totalRequested).toBe(25000000);
    expect(result.totalPayable).toBe(20000000);
    expect(result.totalDeductions).toBe(5000000);
  });
});
