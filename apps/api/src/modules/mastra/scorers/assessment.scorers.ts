import { AssessmentReport, Policy, Claim } from '@papaya/shared';

export interface EvaluationResult {
  passed: boolean;
  score: number; // 0.0 - 1.0 or 0 - 100
  reason: string;
}

/**
 * Math Conservation Scorer: Checks that totalRequested = totalPayable + totalDeductions
 */
export function scoreMathConservation(report: AssessmentReport): EvaluationResult {
  const delta = Math.abs(report.totalRequested - (report.totalPayable + report.totalDeductions));
  const passed = delta < 0.01;
  return {
    passed,
    score: passed ? 1.0 : 0.0,
    reason: passed
      ? 'Arithmetic conserved: totalRequested === totalPayable + totalDeductions'
      : `Arithmetic violation: discrepancy of ${delta.toFixed(2)} VND`,
  };
}

/**
 * Policy Grounding Scorer: Verifies all cited rejection reasons and exclusions are grounded in policy data
 */
export function scorePolicyGrounding(report: AssessmentReport, policy: Policy): EvaluationResult {
  if (report.finalRecommendation !== 'REJECT') {
    return { passed: true, score: 1.0, reason: 'Not a rejection claim, grounding check passed' };
  }

  const rawExclusions: string[] = policy.exclusions || [];
  const matched = report.policyExclusionsMatched || [];
  if (matched.length === 0) {
    return { passed: false, score: 0.0, reason: 'Rejection without cited policy exclusions' };
  }

  const allGrounded = matched.every(ex => rawExclusions.includes(ex));
  return {
    passed: allGrounded,
    score: allGrounded ? 1.0 : 0.0,
    reason: allGrounded
      ? `All cited exclusions [${matched.join(', ')}] exist in policy terms`
      : 'Hallucinated policy exclusion detected',
  };
}

/**
 * Medical Plausibility Scorer: Checks length of stay against medical standards
 */
export function scoreMedicalPlausibility(claim: Claim): EvaluationResult {
  const stayDays = Math.max(
    1,
    Math.round(
      (new Date(claim.dischargeDate).getTime() - new Date(claim.admissionDate).getTime()) /
        (1000 * 60 * 60 * 24),
    ),
  );

  // Standard guideline: typical acute inpatient stay is under 14 days without ICU
  const isPlausible = stayDays <= 21;
  const score = Math.max(0, Math.min(100, 100 - Math.max(0, stayDays - 7) * 5));

  return {
    passed: isPlausible,
    score: score / 100,
    reason: `Length of stay: ${stayDays} days (Plausibility score: ${score}%)`,
  };
}

/**
 * Overall Confidence Calibrator
 */
export function calculateOverallConfidence(scores: {
  docScore: number;
  policyScore: number;
  medScore: number;
  calcScore: number;
}): number {
  return Math.round(
    scores.docScore * 0.35 +
      scores.policyScore * 0.3 +
      scores.medScore * 0.2 +
      scores.calcScore * 0.15,
  );
}
