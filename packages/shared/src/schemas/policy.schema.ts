import { z } from 'zod';

export const BenefitRuleSchema = z.object({
  category: z.string(),
  maxLimitPerClaim: z.number().nonnegative(),
  maxLimitPerYear: z.number().nonnegative(),
  copayRate: z.number().min(0).max(1), // e.g. 0.20 for 20%
  subLimitPerDay: z.number().nonnegative().optional(),
  waitingPeriodDays: z.number().int().nonnegative().default(0),
  requiresPreAuth: z.boolean().default(false),
});

export const PolicySchema = z.object({
  policyNumber: z.string(),
  insuredName: z.string(),
  nationalId: z.string(),
  planName: z.string(),
  status: z.enum(['ACTIVE', 'LAPSED', 'TERMINATED', 'GRACE_PERIOD']),
  effectiveDate: z.string(),
  expiryDate: z.string(),
  annualTotalLimit: z.number().positive(),
  annualUsedAmount: z.number().nonnegative().default(0),
  waitingPeriods: z.record(z.string(), z.number()).optional(), // e.g. { "PRE_EXISTING": 365, "MATERNITY": 270, "SPECIAL_DISEASE": 180 }
  exclusions: z.array(z.string()).default([]), // ICD-10 or keywords
  benefits: z.array(BenefitRuleSchema),
});

export type BenefitRule = z.infer<typeof BenefitRuleSchema>;
export type Policy = z.infer<typeof PolicySchema>;
