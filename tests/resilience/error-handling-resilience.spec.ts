import { describe, it, expect } from 'vitest';
import { ClaimSchema, PolicySchema, ZodError } from '../../packages/shared/src';
import { verifyDocument, lookupPolicy } from '../../packages/mcp-server/src';

describe('Resilience & Boundary Error Handling Test Suite', () => {
  // ---------------------------------------------------------------------------
  // Test 1: Schema Boundary Validation with Negative Amount
  // ---------------------------------------------------------------------------
  it('RES-01: ClaimSchema should reject negative or zero requested amount', () => {
    const invalidClaimData = {
      claimId: 'CLM-INVALID-01',
      policyNumber: 'POL-001',
      patientName: 'John Doe',
      nationalId: '123456789',
      hospitalName: 'Hospital',
      admissionDate: '2026-01-01',
      dischargeDate: '2026-01-02',
      diagnosisIcd10: 'K35',
      diagnosisDescription: 'Appendicitis',
      status: 'SUBMITTED',
      totalRequested: -5000000, // Negative amount
      items: [],
      documents: [],
      createdAt: '2026-01-03',
      updatedAt: '2026-01-03',
    };

    expect(() => ClaimSchema.parse(invalidClaimData)).toThrowError(ZodError);
  });

  // ---------------------------------------------------------------------------
  // Test 2: PolicySchema Boundary Validation with Invalid Copay Rate (> 1.0)
  // ---------------------------------------------------------------------------
  it('RES-02: PolicySchema should reject copayRate greater than 1.0 (100%)', () => {
    const invalidPolicyData = {
      policyNumber: 'POL-INVALID-01',
      insuredName: 'Jane Doe',
      nationalId: '123456789',
      planName: 'Gold',
      status: 'ACTIVE',
      effectiveDate: '2026-01-01',
      expiryDate: '2026-12-31',
      annualTotalLimit: 100000000,
      annualUsedAmount: 0,
      benefits: [
        {
          category: 'SURGERY',
          maxLimitPerClaim: 50000000,
          maxLimitPerYear: 100000000,
          copayRate: 1.5, // 150% is invalid
        },
      ],
    };

    expect(() => PolicySchema.parse(invalidPolicyData)).toThrowError(ZodError);
  });

  // ---------------------------------------------------------------------------
  // Test 3: verifyDocument with Empty Documents Array
  // ---------------------------------------------------------------------------
  it('RES-03: verifyDocument handles empty documents gracefully without crashing', async () => {
    const result = await verifyDocument({
      claimId: 'CLM-EMPTY-DOCS',
      documents: [],
      requiredDocTypes: ['HOSPITAL_DISCHARGE', 'DETAILED_INVOICE', 'VAT_INVOICE'],
    });

    expect(result.isComplete).toBe(false);
    expect(result.missingTypes.length).toBe(3);
    expect(result.verifiedDocumentsCount).toBe(0);
    expect(result.invalidDocuments.length).toBe(0);
  });

  // ---------------------------------------------------------------------------
  // Test 4: lookupPolicy with Non-Existent Policy (Undefined)
  // ---------------------------------------------------------------------------
  it('RES-04: lookupPolicy returns safe NOT_FOUND payload when policy is undefined', async () => {
    const result = await lookupPolicy(
      {
        policyNumber: 'POL-MISSING-999',
        serviceDate: '2026-03-10',
        diagnosisIcd10: 'K35',
      },
      undefined,
    );

    expect(result.isEligible).toBe(false);
    expect(result.status).toBe('NOT_FOUND');
    expect(result.policyDetails).toBeUndefined();
    expect(result.rejectionReason).toContain('not found in system');
  });
});
