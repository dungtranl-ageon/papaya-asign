import { describe, it, expect } from 'vitest';
import { verifyDocument, calculateBenefit } from '../../packages/mcp-server/src';
import { mockGoldPolicy } from '../fixtures/mock-policies';

describe('Adverse Claim Variants & Edge Anomaly Resilience', () => {
  // ---------------------------------------------------------------------------
  // Test 1: Multiple Invalid Documents with Varied Failure Reasons
  // ---------------------------------------------------------------------------
  it('ADV-01: Correctly aggregates multiple invalid documents with independent reasons', async () => {
    const result = await verifyDocument({
      claimId: 'CLM-ADV-MULTI-INVALID',
      documents: [
        {
          docId: 'DOC-INV-01',
          docType: 'HOSPITAL_DISCHARGE',
          fileName: 'discharge_fake.pdf',
          uploadedAt: '2026-03-01T00:00:00Z',
          status: 'INVALID',
          notes: 'Missing hospital official stamp and doctor signature',
        },
        {
          docId: 'DOC-INV-02',
          docType: 'VAT_INVOICE',
          fileName: 'vat_blurred.pdf',
          uploadedAt: '2026-03-01T00:00:00Z',
          status: 'INVALID',
          notes: 'Tax authority QR code is unreadable due to low scan resolution',
        },
        {
          docId: 'DOC-VAL-03',
          docType: 'DETAILED_INVOICE',
          fileName: 'detailed_valid.pdf',
          uploadedAt: '2026-03-01T00:00:00Z',
          status: 'VALID',
        },
      ],
    });

    expect(result.isComplete).toBe(false);
    expect(result.invalidDocuments.length).toBe(2);
    expect(result.invalidDocuments[0].reason).toContain('Missing hospital official stamp');
    expect(result.invalidDocuments[1].reason).toContain('Tax authority QR code');
    expect(result.verifiedDocumentsCount).toBe(1);
  });

  // ---------------------------------------------------------------------------
  // Test 2: Extreme Requested Amount (Stress Test: 10 Billion VND Claim)
  // ---------------------------------------------------------------------------
  it('ADV-02: Stress calculation with 10,000,000,000 VND requested against 500,000,000 limit', async () => {
    const massiveClaimAmount = 10000000000; // 10 Billion VND
    const result = await calculateBenefit({
      claimId: 'CLM-ADV-STRESS-10B',
      items: [
        {
          itemId: 'ITM-ORGAN-TX',
          description: 'Organ Transplant Comprehensive Care',
          category: 'SURGERY',
          amountRequested: massiveClaimAmount,
        },
      ],
      policy: mockGoldPolicy, // Surgery sublimit: 50,000,000 VND, copay: 20%
    });

    // Sublimit is 50,000,000 VND
    // Deductions: 10B - 50M = 9,950,000,000 (sublimit excess) + 10,000,000 (20% copay on 50M) = 9,960,000,000 VND
    // Payable: 40,000,000 VND
    expect(result.totalRequested).toBe(massiveClaimAmount);
    expect(result.totalPayable).toBe(40000000);
    expect(result.totalDeductions).toBe(9960000000);
    expect(result.totalPayable + result.totalDeductions).toBe(massiveClaimAmount);
  });

  // ---------------------------------------------------------------------------
  // Test 3: Zero-Day Outpatient Same Day Care (Admission = Discharge)
  // ---------------------------------------------------------------------------
  it('ADV-03: Inpatient stay of 0 duration (same day admission and discharge) defaults to 1 day charge', async () => {
    const result = await calculateBenefit({
      claimId: 'CLM-ADV-SAMEDAY',
      items: [
        {
          itemId: 'ITM-ROOM-SAMEDAY',
          description: 'Day-ward Observation Bed',
          category: 'INPATIENT',
          amountRequested: 2000000,
        },
      ],
      policy: mockGoldPolicy, // Sublimit: 3,000,000/day, copay: 10%
    });

    // 2,000,000 is under 3,000,000 sublimit
    // Copay 10% on 2,000,000 = 200,000
    // Payable = 1,800,000
    expect(result.totalRequested).toBe(2000000);
    expect(result.totalPayable).toBe(1800000);
    expect(result.totalDeductions).toBe(200000);
  });

  // ---------------------------------------------------------------------------
  // Test 4: Fully Uncovered Category Item (Custom Category Not in Policy Benefits)
  // ---------------------------------------------------------------------------
  it('ADV-04: Item category not defined in policy benefits is completely deducted (0 payable)', async () => {
    const policyWithoutDental = {
      ...mockGoldPolicy,
      benefits: mockGoldPolicy.benefits.filter(b => b.category !== 'OUTPATIENT'),
    };

    const result = await calculateBenefit({
      claimId: 'CLM-ADV-NO-BENEFIT',
      items: [
        {
          itemId: 'ITM-DENTAL-01',
          description: 'Wisdom Tooth Extraction',
          category: 'OUTPATIENT' as const, // Not covered in benefits
          amountRequested: 3500000,
        },
      ],
      policy: policyWithoutDental,
    });

    // Because OUTPATIENT category is not found in policy benefits, eligibleAmount = 0
    expect(result.totalRequested).toBe(3500000);
    expect(result.totalPayable).toBe(0);
    expect(result.totalDeductions).toBe(3500000);
  });
});
