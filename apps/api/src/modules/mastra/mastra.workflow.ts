import {
  verifyDocument,
  lookupPolicy,
  checkMedicalNecessity,
  calculateBenefit,
} from '@papaya/mcp-server';
import { Claim, Policy, AssessmentReport } from '@papaya/shared';

export interface WorkflowAssessmentInput {
  claim: Claim;
  policy: Policy;
}

/**
 * Sequential Deterministic 4-Step Claims Assessment Workflow
 * Step 1: verifyDocument
 * Step 2: lookupPolicy
 * Step 3: checkMedicalNecessity
 * Step 4: calculateBenefit
 * Step 5: Synthesize AssessmentReport
 */
export async function executeClaimsAssessmentWorkflow(
  input: WorkflowAssessmentInput,
  onStepProgress?: (step: string, data: unknown) => void,
): Promise<AssessmentReport> {
  const { claim, policy } = input;
  const steps: AssessmentReport['steps'] = [];

  // ---------------------------------------------------------------------------
  // Step 1: Verify Documents
  // ---------------------------------------------------------------------------
  onStepProgress?.('VERIFY_DOCUMENT_START', { claimId: claim.claimId });
  const docResult = await verifyDocument({
    claimId: claim.claimId,
    documents: claim.documents,
    requiredDocTypes: ['HOSPITAL_DISCHARGE', 'DETAILED_INVOICE', 'VAT_INVOICE'],
  });

  const step1Passed = docResult.isComplete;
  steps.push({
    step: 'VERIFY_DOCUMENT',
    status: step1Passed ? 'PASSED' : 'ACTION_REQUIRED',
    score: step1Passed ? 100 : Math.round((docResult.verifiedDocumentsCount / (docResult.verifiedDocumentsCount + docResult.missingTypes.length)) * 100),
    message: step1Passed ? 'All mandatory documents verified' : `Missing: ${docResult.missingTypes.join(', ')}`,
    details: docResult as unknown as Record<string, unknown>,
    executedAt: new Date().toISOString(),
  });
  onStepProgress?.('VERIFY_DOCUMENT_COMPLETE', docResult);

  // ---------------------------------------------------------------------------
  // Step 2: Lookup Policy
  // ---------------------------------------------------------------------------
  onStepProgress?.('LOOKUP_POLICY_START', { policyNumber: claim.policyNumber });
  const policyResult = await lookupPolicy(
    {
      policyNumber: claim.policyNumber,
      serviceDate: claim.admissionDate,
      diagnosisIcd10: claim.diagnosisIcd10,
    },
    policy,
  );

  const step2Passed = policyResult.isEligible;
  steps.push({
    step: 'LOOKUP_POLICY',
    status: step2Passed ? 'PASSED' : 'FAILED',
    score: step2Passed ? 100 : 0,
    message: step2Passed ? 'Policy active and eligible for treatment dates' : (policyResult.rejectionReason || 'Policy check failed'),
    details: policyResult as unknown as Record<string, unknown>,
    executedAt: new Date().toISOString(),
  });
  onStepProgress?.('LOOKUP_POLICY_COMPLETE', policyResult);

  // ---------------------------------------------------------------------------
  // Step 3: Check Medical Necessity
  // ---------------------------------------------------------------------------
  onStepProgress?.('CHECK_MEDICAL_NECESSITY_START', { diagnosis: claim.diagnosisIcd10 });
  const stayDays = Math.max(
    1,
    Math.round(
      (new Date(claim.dischargeDate).getTime() - new Date(claim.admissionDate).getTime()) /
        (1000 * 60 * 60 * 24),
    ),
  );

  const necessityResult = await checkMedicalNecessity({
    diagnosisIcd10: claim.diagnosisIcd10,
    diagnosisDescription: claim.diagnosisDescription,
    items: claim.items,
    lengthOfStayDays: stayDays,
  });

  steps.push({
    step: 'CHECK_MEDICAL_NECESSITY',
    status: necessityResult.isPassed ? 'PASSED' : 'WARNING',
    score: necessityResult.overallScore,
    message: necessityResult.isPassed
      ? 'Medical necessity validated against clinical guidelines'
      : `Flagged items detected: ${necessityResult.warningFlags.join('; ')}`,
    details: necessityResult as unknown as Record<string, unknown>,
    executedAt: new Date().toISOString(),
  });
  onStepProgress?.('CHECK_MEDICAL_NECESSITY_COMPLETE', necessityResult);

  // ---------------------------------------------------------------------------
  // Step 4: Calculate Benefit
  // ---------------------------------------------------------------------------
  onStepProgress?.('CALCULATE_BENEFIT_START', { itemsCount: claim.items.length });
  const calculationResult = await calculateBenefit({
    claimId: claim.claimId,
    items: claim.items,
    policy,
  });

  steps.push({
    step: 'CALCULATE_BENEFIT',
    status: 'PASSED',
    score: 100,
    message: `Payable amount: ${calculationResult.totalPayable.toLocaleString()} VND (Deductions: ${calculationResult.totalDeductions.toLocaleString()} VND)`,
    details: calculationResult as unknown as Record<string, unknown>,
    executedAt: new Date().toISOString(),
  });
  onStepProgress?.('CALCULATE_BENEFIT_COMPLETE', calculationResult);

  // ---------------------------------------------------------------------------
  // Step 5: Synthesize Final Recommendation
  // ---------------------------------------------------------------------------
  let finalRecommendation: AssessmentReport['finalRecommendation'] = 'APPROVE';
  if (docResult.missingTypes.length > 0) {
    finalRecommendation = 'REQUEST_MORE_INFO';
  } else if (!policyResult.isEligible) {
    finalRecommendation = 'REJECT';
  } else if (!necessityResult.isPassed) {
    finalRecommendation = 'MANUAL_ESCALATION';
  }

  const confidenceScore = Math.round(
    (steps.reduce((acc, s) => acc + (s.score || 0), 0) / (steps.length * 100)) * 100,
  );

  const report: AssessmentReport = {
    assessmentId: `ASM-${claim.claimId}-${Date.now().toString().slice(-4)}`,
    claimId: claim.claimId,
    policyNumber: claim.policyNumber,
    finalRecommendation,
    totalRequested: calculationResult.totalRequested,
    totalPayable: calculationResult.totalPayable,
    totalDeductions: calculationResult.totalDeductions,
    confidenceScore,
    executiveSummary: `Automated assessment completed for Claim ${claim.claimId}. Recommendation: ${finalRecommendation}. Total payable: ${calculationResult.totalPayable.toLocaleString()} VND.`,
    steps,
    breakdown: calculationResult.breakdown,
    missingDocuments: docResult.missingTypes,
    policyExclusionsMatched: policyResult.matchedExclusions,
    assessedAt: new Date().toISOString(),
  };

  onStepProgress?.('REPORT_COMPLETE', report);
  return report;
}
