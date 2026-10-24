import { z } from 'zod';

export const AssessmentStepResultSchema = z.object({
  step: z.enum([
    'VERIFY_DOCUMENT',
    'LOOKUP_POLICY',
    'CHECK_MEDICAL_NECESSITY',
    'CALCULATE_BENEFIT',
    'GENERATE_REPORT',
  ]),
  status: z.enum(['PASSED', 'FAILED', 'WARNING', 'ACTION_REQUIRED', 'PENDING']),
  score: z.number().min(0).max(100).optional(),
  message: z.string(),
  details: z.record(z.string(), z.unknown()),
  executedAt: z.string(),
});

export const BenefitCalculationItemSchema = z.object({
  itemId: z.string(),
  description: z.string(),
  category: z.string(),
  requestedAmount: z.number().nonnegative(),
  eligibleAmount: z.number().nonnegative(),
  copayAmount: z.number().nonnegative(),
  deductibleAmount: z.number().nonnegative(),
  payableAmount: z.number().nonnegative(),
  appliedRule: z.string(),
  notes: z.string().optional(),
});

export const AssessmentReportSchema = z.object({
  assessmentId: z.string(),
  claimId: z.string(),
  policyNumber: z.string(),
  finalRecommendation: z.enum(['APPROVE', 'REJECT', 'REQUEST_MORE_INFO', 'MANUAL_ESCALATION']),
  totalRequested: z.number().nonnegative(),
  totalPayable: z.number().nonnegative(),
  totalDeductions: z.number().nonnegative(),
  confidenceScore: z.number().min(0).max(100),
  executiveSummary: z.string(),
  steps: z.array(AssessmentStepResultSchema),
  breakdown: z.array(BenefitCalculationItemSchema),
  missingDocuments: z.array(z.string()).default([]),
  policyExclusionsMatched: z.array(z.string()).default([]),
  assessedAt: z.string(),
});

export type AssessmentStepResult = z.infer<typeof AssessmentStepResultSchema>;
export type BenefitCalculationItem = z.infer<typeof BenefitCalculationItemSchema>;
export type AssessmentReport = z.infer<typeof AssessmentReportSchema>;
