import { z } from 'zod';
import { ClaimItemSchema } from '@papaya/shared';

export const CheckNecessityInputSchema = z.object({
  diagnosisIcd10: z.string(),
  diagnosisDescription: z.string(),
  items: z.array(ClaimItemSchema),
  lengthOfStayDays: z.number().int().nonnegative(),
});

export type CheckNecessityInput = z.infer<typeof CheckNecessityInputSchema>;

export interface NecessityItemCheck {
  itemId: string;
  isMedicallyNecessary: boolean;
  confidenceScore: number;
  reason: string;
}

export interface CheckNecessityOutput {
  isPassed: boolean;
  overallScore: number;
  itemsEvaluation: NecessityItemCheck[];
  warningFlags: string[];
}

/**
 * Pure function: Evaluates medical necessity and treatment appropriateness
 */
export async function checkMedicalNecessity(
  input: CheckNecessityInput,
): Promise<CheckNecessityOutput> {
  const itemsEvaluation: NecessityItemCheck[] = [];
  const warningFlags: string[] = [];

  // Basic clinical heuristics for demo/MVP
  for (const item of input.items) {
    let isNecessary = true;
    let reason = 'Medication/treatment aligns with standard clinical practice for diagnosis';
    let score = 95;

    // Cosmetic / elective checks
    const descLower = item.description.toLowerCase();
    if (
      descLower.includes('cosmetic') ||
      descLower.includes('thẩm mỹ') ||
      descLower.includes('làm đẹp')
    ) {
      isNecessary = false;
      reason = 'Elective/Cosmetic treatment is not deemed medically necessary';
      score = 15;
      warningFlags.push(`Item ${item.description} flagged as non-necessary cosmetic procedure`);
    } else if (descLower.includes('supplement') || descLower.includes('thực phẩm chức năng')) {
      isNecessary = false;
      reason = 'Nutritional supplements are not eligible for medical necessity coverage';
      score = 30;
      warningFlags.push(`Item ${item.description} flagged as nutritional supplement`);
    }

    itemsEvaluation.push({
      itemId: item.itemId,
      isMedicallyNecessary: isNecessary,
      confidenceScore: score,
      reason,
    });
  }

  const allNecessary = itemsEvaluation.every(item => item.isMedicallyNecessary);
  const averageScore =
    itemsEvaluation.length > 0
      ? Math.round(
          itemsEvaluation.reduce((acc, curr) => acc + curr.confidenceScore, 0) /
            itemsEvaluation.length,
        )
      : 100;

  return {
    isPassed: allNecessary,
    overallScore: averageScore,
    itemsEvaluation,
    warningFlags,
  };
}
