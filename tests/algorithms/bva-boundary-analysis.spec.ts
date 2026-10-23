import { describe, it, expect } from 'vitest';
import { calculateBenefit, lookupPolicy } from '../../packages/mcp-server/src';
import { mockGoldPolicy } from '../fixtures/mock-policies';
import { Policy } from '../../packages/shared/src';

describe('Algorithm 1: Boundary Value Analysis (BVA) Test Suite', () => {
  // ---------------------------------------------------------------------------
  // BVA Group 1: Policy Date Validity Boundaries
  // Effective: 2026-01-01T00:00:00Z | Expiry: 2026-12-31T23:59:59Z
  // ---------------------------------------------------------------------------
  describe('BVA: Policy Validity Date Boundaries', () => {
    it('BVA-01: Boundary Min-1 (1 sec before effective date) -> REJECT', async () => {
      const result = await lookupPolicy(
        {
          policyNumber: mockGoldPolicy.policyNumber,
          serviceDate: '2025-12-31T23:59:59Z',
          diagnosisIcd10: 'K35',
        },
        mockGoldPolicy,
      );
      expect(result.isEligible).toBe(false);
      expect(result.isExpired).toBe(true);
      expect(result.rejectionReason).toContain('outside policy validity period');
    });

    it('BVA-02: Boundary Min (Exact effective date start) -> PASS', async () => {
      const result = await lookupPolicy(
        {
          policyNumber: mockGoldPolicy.policyNumber,
          serviceDate: '2026-01-01T00:00:00Z',
          diagnosisIcd10: 'K35',
        },
        mockGoldPolicy,
      );
      expect(result.isEligible).toBe(true);
      expect(result.isExpired).toBe(false);
    });

    it('BVA-03: Boundary Max (Exact expiry date second) -> PASS', async () => {
      const result = await lookupPolicy(
        {
          policyNumber: mockGoldPolicy.policyNumber,
          serviceDate: '2026-12-31T23:59:59Z',
          diagnosisIcd10: 'K35',
        },
        mockGoldPolicy,
      );
      expect(result.isEligible).toBe(true);
      expect(result.isExpired).toBe(false);
    });

    it('BVA-04: Boundary Max+1 (1 sec after expiry date) -> REJECT', async () => {
      const result = await lookupPolicy(
        {
          policyNumber: mockGoldPolicy.policyNumber,
          serviceDate: '2027-01-01T00:00:00Z',
          diagnosisIcd10: 'K35',
        },
        mockGoldPolicy,
      );
      expect(result.isEligible).toBe(false);
      expect(result.isExpired).toBe(true);
      expect(result.rejectionReason).toContain('outside policy validity period');
    });
  });

  // ---------------------------------------------------------------------------
  // BVA Group 2: Annual Remaining Limit Boundaries
  // Limit: 500M | Used: 490M -> Remaining: 10M
  // ---------------------------------------------------------------------------
  describe('BVA: Annual Policy Limit Exhaustion Boundaries', () => {
    it('BVA-05: Boundary Limit = 0 (Annual limit completely exhausted) -> REJECT', async () => {
      const exhaustedPolicy: Policy = {
        ...mockGoldPolicy,
        annualTotalLimit: 500000000,
        annualUsedAmount: 500000000, // 0 remaining
      };

      const result = await lookupPolicy(
        {
          policyNumber: exhaustedPolicy.policyNumber,
          serviceDate: '2026-03-10',
          diagnosisIcd10: 'K35',
        },
        exhaustedPolicy,
      );
      expect(result.isEligible).toBe(false);
      expect(result.remainingAnnualLimit).toBe(0);
      expect(result.rejectionReason).toContain('exhausted');
    });

    it('BVA-06: Boundary Limit = 1 VND (Micro balance remaining) -> PASS', async () => {
      const microPolicy: Policy = {
        ...mockGoldPolicy,
        annualTotalLimit: 500000000,
        annualUsedAmount: 499999999, // 1 VND remaining
      };

      const result = await lookupPolicy(
        {
          policyNumber: microPolicy.policyNumber,
          serviceDate: '2026-03-10',
          diagnosisIcd10: 'K35',
        },
        microPolicy,
      );
      expect(result.isEligible).toBe(true);
      expect(result.remainingAnnualLimit).toBe(1);
    });
  });

  // ---------------------------------------------------------------------------
  // BVA Group 3: Claim Per-Item Sublimit Boundaries (Surgery: Max 50,000,000 VND)
  // ---------------------------------------------------------------------------
  describe('BVA: Per-Claim Category Sublimits & Copay Calculations', () => {
    it('BVA-07: Requested = Sublimit - 1 (49,999,999 VND) -> No sublimit deduction', async () => {
      const result = await calculateBenefit({
        claimId: 'CLM-BVA-01',
        items: [
          {
            itemId: 'ITM-SUB-1',
            description: 'Major Surgery',
            category: 'SURGERY',
            amountRequested: 49999999,
          },
        ],
        policy: mockGoldPolicy, // Surgery copay: 20%, max: 50M
      });

      // Eligible: 49,999,999. Copay 20% = 10,000,000. Payable: 39,999,999.
      expect(result.breakdown[0]?.eligibleAmount).toBe(49999999);
      expect(result.breakdown[0]?.copayAmount).toBe(10000000);
      expect(result.breakdown[0]?.payableAmount).toBe(39999999);
      expect(result.breakdown[0]?.notes).toBeUndefined();
    });

    it('BVA-08: Requested = Sublimit Exact (50,000,000 VND) -> Max claim cap', async () => {
      const result = await calculateBenefit({
        claimId: 'CLM-BVA-02',
        items: [
          {
            itemId: 'ITM-SUB-2',
            description: 'Major Surgery',
            category: 'SURGERY',
            amountRequested: 50000000,
          },
        ],
        policy: mockGoldPolicy,
      });

      // Eligible: 50M. Copay 20% = 10M. Payable: 40M.
      expect(result.breakdown[0]?.eligibleAmount).toBe(50000000);
      expect(result.breakdown[0]?.copayAmount).toBe(10000000);
      expect(result.breakdown[0]?.payableAmount).toBe(40000000);
      expect(result.breakdown[0]?.notes).toBeUndefined();
    });

    it('BVA-09: Requested = Sublimit + 1 (50,000,001 VND) -> 1 VND Sublimit Exceeded', async () => {
      const result = await calculateBenefit({
        claimId: 'CLM-BVA-03',
        items: [
          {
            itemId: 'ITM-SUB-3',
            description: 'Major Surgery',
            category: 'SURGERY',
            amountRequested: 50000001,
          },
        ],
        policy: mockGoldPolicy,
      });

      // Eligible capped at 50M. Copay 20% = 10M. Sublimit exceeded: 1. Total deductions = 10M + 1.
      expect(result.breakdown[0]?.eligibleAmount).toBe(50000000);
      expect(result.breakdown[0]?.deductibleAmount).toBe(10000001);
      expect(result.breakdown[0]?.payableAmount).toBe(40000000);
      expect(result.breakdown[0]?.notes).toContain('Sublimit exceeded by 1');
    });

    it('BVA-10: Copay Rate 0% Boundary -> 100% Payable Amount', async () => {
      const zeroCopayPolicy: Policy = {
        ...mockGoldPolicy,
        benefits: [
          {
            category: 'MEDICATION',
            maxLimitPerClaim: 10000000,
            maxLimitPerYear: 50000000,
            copayRate: 0.0, // 0% Copay
          },
        ],
      };

      const result = await calculateBenefit({
        claimId: 'CLM-BVA-04',
        items: [
          {
            itemId: 'ITM-MED-1',
            description: 'Essential Antibiotics',
            category: 'MEDICATION',
            amountRequested: 5000000,
          },
        ],
        policy: zeroCopayPolicy,
      });

      expect(result.breakdown[0]?.copayAmount).toBe(0);
      expect(result.breakdown[0]?.payableAmount).toBe(5000000);
      expect(result.totalDeductions).toBe(0);
    });

    it('BVA-11: High Copay Boundary (50% Copay on 10,000,000 VND)', async () => {
      const halfCopayPolicy = {
        ...mockGoldPolicy,
        benefits: [
          {
            category: 'MEDICATION' as const,
            maxLimitPerClaim: 20000000,
            maxLimitPerYear: 50000000,
            copayRate: 0.5, // 50% copay
          },
        ],
      };

      const result = await calculateBenefit({
        claimId: 'CLM-BVA-50PCT',
        items: [
          {
            itemId: 'ITM-MED-50',
            description: 'Specialty Injection',
            category: 'MEDICATION',
            amountRequested: 10000000,
          },
        ],
        policy: halfCopayPolicy,
      });

      expect(result.totalRequested).toBe(10000000);
      expect(result.totalPayable).toBe(5000000);
      expect(result.totalDeductions).toBe(5000000);
      expect(result.totalPayable + result.totalDeductions).toBe(10000000);
    });

    it('BVA-12: Minimum Positive Requested Amount (1 VND Boundary)', async () => {
      const result = await calculateBenefit({
        claimId: 'CLM-BVA-1VND',
        items: [
          {
            itemId: 'ITM-MIN-1',
            description: 'Micro Administration Fee',
            category: 'MEDICATION',
            amountRequested: 1,
          },
        ],
        policy: mockGoldPolicy, // 10% copay
      });

      expect(result.totalRequested).toBe(1);
      // Math.round(1 * 0.1) = 0 copay, payable = 1
      expect(result.totalPayable).toBe(1);
      expect(result.totalDeductions).toBe(0);
    });

    it('BVA-13: Multiple Items Summing Exactly to Category Sublimit (25M + 25M = 50M)', async () => {
      const result = await calculateBenefit({
        claimId: 'CLM-BVA-SPLIT',
        items: [
          {
            itemId: 'ITM-SURG-A',
            description: 'Primary Procedure',
            category: 'SURGERY',
            amountRequested: 25000000,
          },
          {
            itemId: 'ITM-SURG-B',
            description: 'Secondary Procedure',
            category: 'SURGERY',
            amountRequested: 25000000,
          },
        ],
        policy: mockGoldPolicy, // Surgery: max 50M, 20% copay
      });

      expect(result.totalRequested).toBe(50000000);
      // Total 50M is within 50M sublimit. 20% copay on 50M = 10M deductions, 40M payable.
      expect(result.totalPayable).toBe(40000000);
      expect(result.totalDeductions).toBe(10000000);
    });
  });
});
