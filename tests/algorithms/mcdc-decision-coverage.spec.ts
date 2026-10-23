import { describe, it, expect } from 'vitest';
import { lookupPolicy, verifyDocument } from '../../packages/mcp-server/src';
import { mockGoldPolicy } from '../fixtures/mock-policies';
import { Policy } from '../../packages/shared/src';

describe('Algorithm 2: Modified Condition / Decision Coverage (MC/DC)', () => {
  // ---------------------------------------------------------------------------
  // MC/DC Formula 1: lookupPolicy Eligibility
  // isEligible = A (isStatusActive) AND B (!isExpired) AND C (!isExclusionMatched) AND D (remainingLimit > 0)
  // Required: 5 orthogonal test vectors demonstrating independent effect of each condition.
  // ---------------------------------------------------------------------------
  describe('MC/DC: Policy Eligibility Compound Condition [A && B && C && D]', () => {
    // Vector 1: [A=T, B=T, C=T, D=T] -> Outcome = TRUE (Baseline)
    it('MC/DC-01 (Baseline): A=T, B=T, C=T, D=T -> isEligible is TRUE', async () => {
      const result = await lookupPolicy(
        {
          policyNumber: mockGoldPolicy.policyNumber,
          serviceDate: '2026-06-15T10:00:00Z', // B=T
          diagnosisIcd10: 'K35', // C=T (not in [K21, Z41.1, F32])
        },
        mockGoldPolicy, // A=T (ACTIVE), D=T (485M remaining)
      );
      expect(result.isEligible).toBe(true);
      expect(result.rejectionReason).toBeUndefined();
    });

    // Vector 2: [A=F, B=T, C=T, D=T] -> Outcome = FALSE (Proves A independently flips outcome)
    it('MC/DC-02 (Condition A): A=F (LAPSED), B=T, C=T, D=T -> isEligible is FALSE', async () => {
      const lapsedPolicy: Policy = {
        ...mockGoldPolicy,
        status: 'LAPSED', // A=F
      };
      const result = await lookupPolicy(
        {
          policyNumber: lapsedPolicy.policyNumber,
          serviceDate: '2026-06-15T10:00:00Z', // B=T
          diagnosisIcd10: 'K35', // C=T
        },
        lapsedPolicy, // D=T
      );
      expect(result.isEligible).toBe(false);
      expect(result.rejectionReason).toContain('Policy status is LAPSED');
    });

    // Vector 3: [A=T, B=F, C=T, D=T] -> Outcome = FALSE (Proves B independently flips outcome)
    it('MC/DC-03 (Condition B): A=T, B=F (Expired), C=T, D=T -> isEligible is FALSE', async () => {
      const result = await lookupPolicy(
        {
          policyNumber: mockGoldPolicy.policyNumber,
          serviceDate: '2027-02-01T10:00:00Z', // B=F (Past expiry)
          diagnosisIcd10: 'K35', // C=T
        },
        mockGoldPolicy, // A=T, D=T
      );
      expect(result.isEligible).toBe(false);
      expect(result.isExpired).toBe(true);
      expect(result.rejectionReason).toContain('outside policy validity period');
    });

    // Vector 4: [A=T, B=T, C=F, D=T] -> Outcome = FALSE (Proves C independently flips outcome)
    it('MC/DC-04 (Condition C): A=T, B=T, C=F (Matched Exclusion), D=T -> isEligible is FALSE', async () => {
      const result = await lookupPolicy(
        {
          policyNumber: mockGoldPolicy.policyNumber,
          serviceDate: '2026-06-15T10:00:00Z', // B=T
          diagnosisIcd10: 'K21', // C=F (K21 is in exclusions)
        },
        mockGoldPolicy, // A=T, D=T
      );
      expect(result.isEligible).toBe(false);
      expect(result.isExclusionMatched).toBe(true);
      expect(result.matchedExclusions).toContain('K21');
      expect(result.rejectionReason).toContain('matches policy exclusion list');
    });

    // Vector 5: [A=T, B=T, C=T, D=F] -> Outcome = FALSE (Proves D independently flips outcome)
    it('MC/DC-05 (Condition D): A=T, B=T, C=T, D=F (Limit Exhausted) -> isEligible is FALSE', async () => {
      const exhaustedPolicy: Policy = {
        ...mockGoldPolicy,
        annualUsedAmount: 500000000, // D=F (0 limit left)
      };
      const result = await lookupPolicy(
        {
          policyNumber: exhaustedPolicy.policyNumber,
          serviceDate: '2026-06-15T10:00:00Z', // B=T
          diagnosisIcd10: 'K35', // C=T
        },
        exhaustedPolicy, // A=T
      );
      expect(result.isEligible).toBe(false);
      expect(result.remainingAnnualLimit).toBe(0);
      expect(result.rejectionReason).toContain('Annual policy limit has been fully exhausted');
    });
  });

  // ---------------------------------------------------------------------------
  // MC/DC Formula 2: verifyDocument Completeness
  // isComplete = X (missingTypes.length == 0) AND Y (invalidDocuments.length == 0)
  // Required: 3 orthogonal test vectors.
  // ---------------------------------------------------------------------------
  describe('MC/DC: Document Completeness Compound Condition [X && Y]', () => {
    // Vector 1: [X=T, Y=T] -> isComplete = TRUE
    it('MC/DC-06: X=T (No missing docs) AND Y=T (No invalid docs) -> isComplete is TRUE', async () => {
      const result = await verifyDocument({
        claimId: 'CLM-MCDC-01',
        documents: [
          {
            docId: 'D1',
            docType: 'HOSPITAL_DISCHARGE',
            fileName: 'd.pdf',
            uploadedAt: '2026-03-10',
            status: 'VALID',
          },
          {
            docId: 'D2',
            docType: 'DETAILED_INVOICE',
            fileName: 'i.pdf',
            uploadedAt: '2026-03-10',
            status: 'VALID',
          },
          {
            docId: 'D3',
            docType: 'VAT_INVOICE',
            fileName: 'v.pdf',
            uploadedAt: '2026-03-10',
            status: 'VALID',
          },
        ],
      });
      expect(result.isComplete).toBe(true);
      expect(result.missingTypes.length).toBe(0);
      expect(result.invalidDocuments.length).toBe(0);
    });

    // Vector 2: [X=F, Y=T] -> isComplete = FALSE (Proves X independently flips outcome)
    it('MC/DC-07: X=F (Missing VAT Invoice) AND Y=T (All uploaded are valid) -> isComplete is FALSE', async () => {
      const result = await verifyDocument({
        claimId: 'CLM-MCDC-02',
        documents: [
          {
            docId: 'D1',
            docType: 'HOSPITAL_DISCHARGE',
            fileName: 'd.pdf',
            uploadedAt: '2026-03-10',
            status: 'VALID',
          },
          {
            docId: 'D2',
            docType: 'DETAILED_INVOICE',
            fileName: 'i.pdf',
            uploadedAt: '2026-03-10',
            status: 'VALID',
          },
          // Missing VAT_INVOICE
        ],
      });
      expect(result.isComplete).toBe(false);
      expect(result.missingTypes).toContain('VAT_INVOICE');
      expect(result.invalidDocuments.length).toBe(0);
    });

    // Vector 3: [X=T, Y=F] -> isComplete = FALSE (Proves Y independently flips outcome)
    it('MC/DC-08: X=T (All required types present) AND Y=F (1 blurred/invalid doc) -> isComplete is FALSE', async () => {
      const result = await verifyDocument({
        claimId: 'CLM-MCDC-03',
        documents: [
          {
            docId: 'D1',
            docType: 'HOSPITAL_DISCHARGE',
            fileName: 'd.pdf',
            uploadedAt: '2026-03-10',
            status: 'VALID',
          },
          {
            docId: 'D2',
            docType: 'DETAILED_INVOICE',
            fileName: 'i.pdf',
            uploadedAt: '2026-03-10',
            status: 'INVALID',
            notes: 'Blurred stamp',
          },
          {
            docId: 'D3',
            docType: 'VAT_INVOICE',
            fileName: 'v.pdf',
            uploadedAt: '2026-03-10',
            status: 'VALID',
          },
        ],
      });
      expect(result.isComplete).toBe(false);
      expect(result.missingTypes.length).toBe(0);
      expect(result.invalidDocuments.length).toBe(1);
      expect(result.invalidDocuments[0]?.reason).toContain('Blurred stamp');
    });
  });
});
