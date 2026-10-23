import { z } from 'zod';
import { BenefitCalculationItem, ClaimItemSchema, PolicySchema } from '@papaya/shared';

export const CalculateBenefitInputSchema = z.object({
  claimId: z.string(),
  items: z.array(ClaimItemSchema),
  policy: PolicySchema,
});

export type CalculateBenefitInput = z.infer<typeof CalculateBenefitInputSchema>;

export interface CalculateBenefitOutput {
  claimId: string;
  totalRequested: number;
  totalPayable: number;
  totalDeductions: number;
  breakdown: BenefitCalculationItem[];
}

/**
 * Pure function: Calculates exact payable amounts with copay, deductibles and sublimits
 */
export async function calculateBenefit(
  input: CalculateBenefitInput,
): Promise<CalculateBenefitOutput> {
  const breakdown: BenefitCalculationItem[] = [];
  let totalRequested = 0;
  let totalPayable = 0;
  let totalDeductions = 0;

  for (const item of input.items) {
    const requested = item.amountRequested;
    totalRequested += requested;

    // Find rule for category
    const rule = input.policy.benefits.find(b => b.category === item.category);

    if (!rule) {
      // Default to 100% deduction if category not covered
      breakdown.push({
        itemId: item.itemId,
        description: item.description,
        category: item.category,
        requestedAmount: requested,
        eligibleAmount: 0,
        copayAmount: 0,
        deductibleAmount: requested,
        payableAmount: 0,
        appliedRule: 'Category not covered in policy schedule',
        notes: 'Deducted 100%',
      });
      totalDeductions += requested;
      continue;
    }

    // Apply sublimit
    const eligibleAmount = Math.min(requested, rule.maxLimitPerClaim);
    const sublimitExceeded = requested - eligibleAmount;

    // Apply copay (e.g. 20% copay means patient pays 20%, insurance pays 80%)
    const copayAmount = Math.round(eligibleAmount * rule.copayRate);
    const payableAmount = eligibleAmount - copayAmount;
    const deductibleAmount = sublimitExceeded + copayAmount;

    totalPayable += payableAmount;
    totalDeductions += deductibleAmount;

    breakdown.push({
      itemId: item.itemId,
      description: item.description,
      category: item.category,
      requestedAmount: requested,
      eligibleAmount,
      copayAmount,
      deductibleAmount,
      payableAmount,
      appliedRule: `${rule.category} (Copay: ${rule.copayRate * 100}%, MaxClaim: ${rule.maxLimitPerClaim})`,
      notes: sublimitExceeded > 0 ? `Sublimit exceeded by ${sublimitExceeded}` : undefined,
    });
  }

  return {
    claimId: input.claimId,
    totalRequested,
    totalPayable,
    totalDeductions,
    breakdown,
  };
}
