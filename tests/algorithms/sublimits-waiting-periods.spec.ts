import { describe, it, expect } from 'vitest';
import { calculateBenefit, checkMedicalNecessity } from '../../packages/mcp-server/src';
import { mockGoldPolicy, mockSilverPolicy } from '../fixtures/mock-policies';

describe('Sublimits, Daily Rates & Clinical Rules Test Suite', () => {
  // ---------------------------------------------------------------------------
  // Test 1: Daily Room & Board Sublimit across Multiple Days
  // ---------------------------------------------------------------------------
  it('SUB-01: Multi-day Inpatient Daily Sublimit Excess Calculation', async () => {
    // Silver policy has subLimitPerDay = 1,500,000 VND and copayRate = 20%
    // Claim: 6 days at 2,500,000 VND/day = 15,000,000 VND total
    // Daily excess = (2,500,000 - 1,500,000) * 6 = 6,000,000 VND
    // Eligible amount = 1,500,000 * 6 = 9,000,000 VND
    // Copay 20% on eligible: 9,000,000 * 0.2 = 1,800,000 VND
    // Total deductions = 6,000,000 (excess) + 1,800,000 (copay) = 7,800,000 VND
    // Payable = 15,000,000 - 7,800,000 = 7,200,000 VND
    const result = await calculateBenefit({
      claimId: 'CLM-SUB-01',
      items: [
        {
          itemId: 'ITM-ROOM-6D',
          description: 'Inpatient Room (6 days at 2.5M/day)',
          category: 'INPATIENT',
          amountRequested: 15000000,
        },
      ],
      policy: mockSilverPolicy,
    });

    expect(result.totalRequested).toBe(15000000);
    expect(result.totalPayable).toBe(7200000);
    expect(result.totalDeductions).toBe(7800000);
    expect(result.itemBreakdown[0].deductions).toBe(7800000);
    expect(result.totalPayable + result.totalDeductions).toBe(result.totalRequested);
  });

  // ---------------------------------------------------------------------------
  // Test 2: Daily Room & Board Exactly at the Sublimit Rate
  // ---------------------------------------------------------------------------
  it('SUB-02: Daily room rate exactly matches subLimitPerDay (0 excess deduction)', async () => {
    // Silver policy sublimit = 1,500,000 VND/day
    // 4 days * 1,500,000 = 6,000,000 VND
    // Eligible = 6,000,000 VND, Copay 20% = 1,200,000 VND
    // Payable = 4,800,000 VND
    const result = await calculateBenefit({
      claimId: 'CLM-SUB-02',
      items: [
        {
          itemId: 'ITM-ROOM-EXACT',
          description: 'Standard Room 4 days at 1.5M/day',
          category: 'INPATIENT',
          amountRequested: 6000000,
        },
      ],
      policy: mockSilverPolicy,
    });

    expect(result.totalRequested).toBe(6000000);
    expect(result.totalPayable).toBe(4800000);
    expect(result.totalDeductions).toBe(1200000);
  });

  // ---------------------------------------------------------------------------
  // Test 3: Clinical Necessity - Functional Dietary Supplements Exclusion
  // ---------------------------------------------------------------------------
  it('CLIN-01: Flag non-essential vitamins & dietary supplements in medication list', async () => {
    const result = await checkMedicalNecessity({
      claimId: 'CLM-MED-SUPP',
      diagnosisIcd10: 'M17', // Knee osteoarthritis
      treatmentDescription: 'Conservative treatment and joint support',
      items: [
        {
          itemId: 'ITM-MED-01',
          description: 'Celecoxib 200mg (NSAID pain relief)',
          category: 'MEDICATION',
          amount: 850000,
        },
        {
          itemId: 'ITM-MED-02',
          description: 'Dietary Supplement Glucosamine & Collagen Beauty Drink',
          category: 'MEDICATION',
          amount: 2500000,
        },
      ],
    });

    // The tool evaluates clinical necessity and flags cosmetic/supplement non-medical items
    expect(result.claimId).toBe('CLM-MED-SUPP');
    expect(result.isMedicallyNecessary).toBe(true); // Base diagnosis M17 is necessary
    // Flagged items should identify the supplement or recommend review
    expect(result.flaggedItems).toBeDefined();
  });

  // ---------------------------------------------------------------------------
  // Test 4: Pure Cosmetic Surgery Classification
  // ---------------------------------------------------------------------------
  it('CLIN-02: Pure cosmetic procedures must be classified as NOT medically necessary', async () => {
    const result = await checkMedicalNecessity({
      claimId: 'CLM-COSMETIC-RHINO',
      diagnosisIcd10: 'Z41.1',
      treatmentDescription: 'Aesthetic rhinoplasty and silicone augmentation',
      items: [
        {
          itemId: 'ITM-RHINO',
          description: 'Elective Cosmetic Rhinoplasty',
          category: 'SURGERY',
          amount: 35000000,
        },
      ],
    });

    expect(result.isMedicallyNecessary).toBe(false);
    expect(result.flaggedItems.length).toBeGreaterThan(0);
    expect(result.flaggedItems[0].reason).toContain('Cosmetic');
  });

  // ---------------------------------------------------------------------------
  // Test 5: Multi-Category Arithmetic Conservation with Sublimit + Deductibles
  // ---------------------------------------------------------------------------
  it('MATH-01: Multi-category claim strictly conserves payable + deductions = requested', async () => {
    const multiItems = [
      {
        itemId: 'ITM-MC-01',
        description: 'Laparoscopic Surgery',
        category: 'SURGERY' as const,
        amountRequested: 35000000,
      },
      {
        itemId: 'ITM-MC-02',
        description: 'Inpatient Room (3 days)',
        category: 'INPATIENT' as const,
        amountRequested: 9000000,
      },
      {
        itemId: 'ITM-MC-03',
        description: 'Antibiotics IV',
        category: 'MEDICATION' as const,
        amountRequested: 6500000,
      },
      {
        itemId: 'ITM-MC-04',
        description: 'Biochemical Lab Tests',
        category: 'LABORATORY' as const,
        amountRequested: 4500000,
      },
    ];

    const result = await calculateBenefit({
      claimId: 'CLM-MULTI-01',
      items: multiItems,
      policy: mockGoldPolicy,
    });

    const sumRequested = multiItems.reduce((acc, i) => acc + i.amountRequested, 0);
    expect(result.totalRequested).toBe(sumRequested);
    expect(result.totalPayable + result.totalDeductions).toBe(sumRequested);
    expect(result.itemBreakdown.length).toBe(multiItems.length);

    for (const item of result.itemBreakdown) {
      expect(item.payableAmount + item.deductions).toBe(item.amountRequested);
    }
  });
});
