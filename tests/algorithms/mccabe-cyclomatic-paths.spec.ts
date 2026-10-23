import { describe, it, expect } from 'vitest';
import {
  calculateBenefit,
  checkMedicalNecessity,
  lookupPolicy,
} from '../../packages/mcp-server/src';
import { mockGoldPolicy } from '../fixtures/mock-policies';
import { Policy } from '../../packages/shared/src';

describe('Algorithm 3: McCabe Cyclomatic Complexity & Linear Path Coverage', () => {
  // ---------------------------------------------------------------------------
  // Function 1: calculateBenefit (Cyclomatic Complexity V(G) = 4)
  // Path 1: Category Not in Schedule -> 100% Deductible
  // Path 2: Category Found, Requested <= MaxLimit -> Standard Copay
  // Path 3: Category Found, Requested > MaxLimit -> Sublimit Exceeded + Copay
  // ---------------------------------------------------------------------------
  describe('McCabe Path Coverage: calculateBenefit', () => {
    it('McCabe-01 (Path 1): Uncovered Category -> 100% Deductible Branch', async () => {
      const result = await calculateBenefit({
        claimId: 'CLM-MCCABE-01',
        items: [
          {
            itemId: 'ITM-DENTAL',
            description: 'Routine Dental Scaling',
            category: 'DENTAL', // Not covered in mockGoldPolicy
            amountRequested: 2000000,
          },
        ],
        policy: mockGoldPolicy,
      });

      expect(result.totalPayable).toBe(0);
      expect(result.totalDeductions).toBe(2000000);
      expect(result.breakdown[0]?.appliedRule).toContain('Category not covered');
      expect(result.breakdown[0]?.notes).toBe('Deducted 100%');
    });

    it('McCabe-02 (Path 2): Covered Category, Within Sublimit -> Standard Copay Branch', async () => {
      const result = await calculateBenefit({
        claimId: 'CLM-MCCABE-02',
        items: [
          {
            itemId: 'ITM-MED',
            description: 'Post-op pain killers',
            category: 'MEDICATION', // Max: 15M, Copay: 10%
            amountRequested: 6000000, // < 15M
          },
        ],
        policy: mockGoldPolicy,
      });

      // Eligible: 6M, Copay 10% = 600K, Payable: 5.4M
      expect(result.breakdown[0]?.eligibleAmount).toBe(6000000);
      expect(result.breakdown[0]?.copayAmount).toBe(600000);
      expect(result.breakdown[0]?.payableAmount).toBe(5400000);
      expect(result.breakdown[0]?.deductibleAmount).toBe(600000);
      expect(result.breakdown[0]?.notes).toBeUndefined();
    });

    it('McCabe-03 (Path 3): Covered Category, Exceeding Sublimit -> Sublimit Branch with Note', async () => {
      const result = await calculateBenefit({
        claimId: 'CLM-MCCABE-03',
        items: [
          {
            itemId: 'ITM-MED-EXCEED',
            description: 'Specialty Oncology Drug',
            category: 'MEDICATION', // Max: 15M
            amountRequested: 25000000, // Exceeds by 10M
          },
        ],
        policy: mockGoldPolicy,
      });

      // Eligible capped at 15M. Copay 10% = 1.5M. Sublimit exceeded = 10M.
      // Payable = 13.5M. Total Deductions = 10M + 1.5M = 11.5M.
      expect(result.breakdown[0]?.eligibleAmount).toBe(15000000);
      expect(result.breakdown[0]?.copayAmount).toBe(1500000);
      expect(result.breakdown[0]?.payableAmount).toBe(13500000);
      expect(result.breakdown[0]?.deductibleAmount).toBe(11500000);
      expect(result.breakdown[0]?.notes).toContain('Sublimit exceeded by 10000000');
    });
  });

  // ---------------------------------------------------------------------------
  // Function 2: checkMedicalNecessity (Cyclomatic Complexity V(G) = 5)
  // Path 1: Empty Items Array -> Edge condition (Score 100)
  // Path 2: Standard Medical Item -> Necessary = true, Score = 95
  // Path 3: Cosmetic / Elective Procedure -> Necessary = false, Score = 15, Warning Flag
  // Path 4: Nutritional Supplement -> Necessary = false, Score = 30, Warning Flag
  // ---------------------------------------------------------------------------
  describe('McCabe Path Coverage: checkMedicalNecessity', () => {
    it('McCabe-04 (Path 1): Empty Items Array -> Overall Score 100 & Passed', async () => {
      const result = await checkMedicalNecessity({
        diagnosisIcd10: 'K35',
        diagnosisDescription: 'Acute Appendicitis',
        items: [],
        lengthOfStayDays: 1,
      });

      expect(result.isPassed).toBe(true);
      expect(result.overallScore).toBe(100);
      expect(result.itemsEvaluation.length).toBe(0);
      expect(result.warningFlags.length).toBe(0);
    });

    it('McCabe-05 (Path 2): Standard Clinical Treatment -> Pass Branch', async () => {
      const result = await checkMedicalNecessity({
        diagnosisIcd10: 'K35',
        diagnosisDescription: 'Acute Appendicitis',
        items: [
          {
            itemId: 'ITM-STD',
            description: 'Laparoscopic Surgery',
            category: 'SURGERY',
            amountRequested: 25000000,
          },
        ],
        lengthOfStayDays: 3,
      });

      expect(result.isPassed).toBe(true);
      expect(result.overallScore).toBe(95);
      expect(result.itemsEvaluation[0]?.isMedicallyNecessary).toBe(true);
      expect(result.warningFlags.length).toBe(0);
    });

    it('McCabe-06 (Path 3): Cosmetic Procedure Keyword -> Cosmetic Flag Branch', async () => {
      const result = await checkMedicalNecessity({
        diagnosisIcd10: 'L70',
        diagnosisDescription: 'Acne vulgaris',
        items: [
          {
            itemId: 'ITM-COSMETIC',
            description: 'Phẫu thuật thẩm mỹ làm đẹp da mặt',
            category: 'SPECIALIST_FEE',
            amountRequested: 15000000,
          },
        ],
        lengthOfStayDays: 0,
      });

      expect(result.isPassed).toBe(false);
      expect(result.itemsEvaluation[0]?.isMedicallyNecessary).toBe(false);
      expect(result.itemsEvaluation[0]?.confidenceScore).toBe(15);
      expect(result.warningFlags[0]).toContain('non-necessary cosmetic procedure');
    });

    it('McCabe-07 (Path 4): Supplement Keyword -> Nutritional Supplement Flag Branch', async () => {
      const result = await checkMedicalNecessity({
        diagnosisIcd10: 'E63',
        diagnosisDescription: 'Nutritional deficiency',
        items: [
          {
            itemId: 'ITM-SUPP',
            description: 'Thực phẩm chức năng tăng cường sức đề kháng',
            category: 'MEDICATION',
            amountRequested: 3000000,
          },
        ],
        lengthOfStayDays: 0,
      });

      expect(result.isPassed).toBe(false);
      expect(result.itemsEvaluation[0]?.isMedicallyNecessary).toBe(false);
      expect(result.itemsEvaluation[0]?.confidenceScore).toBe(30);
      expect(result.warningFlags[0]).toContain('nutritional supplement');
    });
  });

  // ---------------------------------------------------------------------------
  // Function 3: lookupPolicy (Cyclomatic Complexity V(G) = 6)
  // Path 1: Undefined Policy -> NOT_FOUND Early Return
  // Path 2: Policy Not Active -> Inactive Rejection Reason
  // ---------------------------------------------------------------------------
  describe('McCabe Path Coverage: lookupPolicy', () => {
    it('McCabe-08 (Path 1): Policy Not Found Branch -> Early Return status NOT_FOUND', async () => {
      const result = await lookupPolicy(
        {
          policyNumber: 'POL-NON-EXISTENT-000',
          serviceDate: '2026-03-10',
          diagnosisIcd10: 'K35',
        },
        undefined, // Policy does not exist
      );

      expect(result.isEligible).toBe(false);
      expect(result.status).toBe('NOT_FOUND');
      expect(result.rejectionReason).toContain('not found in system');
    });

    it('McCabe-09 (Path 2): Policy Terminated Branch -> Rejection Reason Terminated', async () => {
      const terminatedPolicy: Policy = {
        ...mockGoldPolicy,
        status: 'TERMINATED',
      };

      const result = await lookupPolicy(
        {
          policyNumber: terminatedPolicy.policyNumber,
          serviceDate: '2026-03-10',
          diagnosisIcd10: 'K35',
        },
        terminatedPolicy,
      );

      expect(result.isEligible).toBe(false);
      expect(result.status).toBe('TERMINATED');
      expect(result.rejectionReason).toContain('Policy status is TERMINATED, must be ACTIVE');
    });
  });
});
