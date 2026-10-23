import { z } from 'zod';
import { Policy } from '@papaya/shared';

export const LookupPolicyInputSchema = z.object({
  policyNumber: z.string(),
  serviceDate: z.string(), // ISO date of admission/treatment
  diagnosisIcd10: z.string(),
});

export type LookupPolicyInput = z.infer<typeof LookupPolicyInputSchema>;

export interface LookupPolicyOutput {
  policyNumber: string;
  isEligible: boolean;
  status: string;
  isExpired: boolean;
  isExclusionMatched: boolean;
  matchedExclusions: string[];
  remainingAnnualLimit: number;
  policyDetails?: Policy;
  rejectionReason?: string;
}

/**
 * Pure function: Validates policy validity, coverage dates, and exclusion list
 */
export async function lookupPolicy(
  input: LookupPolicyInput,
  policyData?: Policy,
): Promise<LookupPolicyOutput> {
  if (!policyData) {
    return {
      policyNumber: input.policyNumber,
      isEligible: false,
      status: 'NOT_FOUND',
      isExpired: false,
      isExclusionMatched: false,
      matchedExclusions: [],
      remainingAnnualLimit: 0,
      rejectionReason: `Policy ${input.policyNumber} not found in system`,
    };
  }

  const serviceTime = new Date(input.serviceDate).getTime();
  const effectiveTime = new Date(policyData.effectiveDate).getTime();
  const expiryTime = new Date(policyData.expiryDate).getTime();

  const isExpired = serviceTime < effectiveTime || serviceTime > expiryTime;
  const isStatusActive = policyData.status === 'ACTIVE';

  const matchedExclusions = policyData.exclusions.filter(
    ex => ex.toUpperCase() === input.diagnosisIcd10.toUpperCase(),
  );
  const isExclusionMatched = matchedExclusions.length > 0;

  const remainingAnnualLimit = Math.max(
    0,
    policyData.annualTotalLimit - policyData.annualUsedAmount,
  );

  let rejectionReason: string | undefined;
  if (!isStatusActive) {
    rejectionReason = `Policy status is ${policyData.status}, must be ACTIVE`;
  } else if (isExpired) {
    rejectionReason = `Service date ${input.serviceDate} is outside policy validity period (${policyData.effectiveDate} to ${policyData.expiryDate})`;
  } else if (isExclusionMatched) {
    rejectionReason = `Diagnosis ICD-10 ${input.diagnosisIcd10} matches policy exclusion list`;
  } else if (remainingAnnualLimit <= 0) {
    rejectionReason = 'Annual policy limit has been fully exhausted';
  }

  const isEligible =
    isStatusActive && !isExpired && !isExclusionMatched && remainingAnnualLimit > 0;

  return {
    policyNumber: input.policyNumber,
    isEligible,
    status: policyData.status,
    isExpired,
    isExclusionMatched,
    matchedExclusions,
    remainingAnnualLimit,
    policyDetails: policyData,
    rejectionReason,
  };
}
