import { createStep, createWorkflow } from '@mastra/core/workflows';
import { z } from 'zod';
import { mastraMcpTools } from '../tools/mcp.tools';
import { Claim, Policy, AssessmentReport, AssessmentStepResult } from '@papaya/shared';
import {
  VerifyDocumentOutput,
  LookupPolicyOutput,
  CheckNecessityOutput,
  CalculateBenefitOutput,
} from '@papaya/mcp-server';
import {
  scoreMathConservation,
  scorePolicyGrounding,
  calculateOverallConfidence,
} from '../scorers/assessment.scorers';
import { sanitizeUserFacingText } from '../guardrails/jargon-filter.guardrail';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export interface WorkflowAssessmentInput {
  claim: Claim;
  policy: Policy;
}

export interface AssessmentWorkflowState {
  claim: Claim;
  policy: Policy;
  steps: AssessmentStepResult[];
  docResult?: VerifyDocumentOutput;
  policyResult?: LookupPolicyOutput;
  necessityResult?: CheckNecessityOutput;
  calculationResult?: CalculateBenefitOutput;
}

// =============================================================================
// STEP 1: VERIFY DOCUMENTS (verifyDocumentStep)
// Trích xuất toàn bộ chứng từ đính kèm của Claim để kiểm tra tính toàn vẹn
// =============================================================================
export const verifyDocumentStep = createStep({
  id: 'verifyDocumentStep',
  description: 'Trích xuất và kiểm tra tính đầy đủ, hợp lệ của chứng từ đính kèm trong hồ sơ',
  inputSchema: z.object({
    claim: z.any(),
    policy: z.any(),
    steps: z.array(z.any()).optional(),
  }),
  outputSchema: z.any(),
  execute: async ({ inputData }): Promise<AssessmentWorkflowState> => {
    const { claim, policy } = inputData as { claim: Claim; policy: Policy };

    // Trích xuất danh mục chứng từ từ claim trong DB
    const documents = claim.documents || [];
    const docResult = await mastraMcpTools.verifyDocument.execute({
      claimId: claim.claimId,
      documents,
      requiredDocTypes: ['HOSPITAL_DISCHARGE', 'DETAILED_INVOICE', 'VAT_INVOICE'],
    });

    const step1Passed = docResult.isComplete;
    const step1Score = step1Passed
      ? 100
      : Math.round(
          (docResult.verifiedDocumentsCount /
            Math.max(1, docResult.verifiedDocumentsCount + docResult.missingTypes.length)) *
            100,
        );

    const step1Result: AssessmentStepResult = {
      step: 'VERIFY_DOCUMENT',
      status: step1Passed ? 'PASSED' : 'ACTION_REQUIRED',
      score: step1Score,
      message: step1Passed
        ? 'Tất cả chứng từ bắt buộc đã được xác minh'
        : `Missing: ${docResult.missingTypes.join(', ')}`,
      details: docResult as unknown as Record<string, unknown>,
      executedAt: new Date().toISOString(),
    };

    return {
      claim,
      policy,
      steps: [step1Result],
      docResult,
    };
  },
});

// =============================================================================
// STEP 2: LOOKUP POLICY (lookupPolicyStep)
// Trích xuất ngày điều trị, mã chẩn đoán ICD-10 và đối soát với quy tắc hợp đồng
// =============================================================================
export const lookupPolicyStep = createStep({
  id: 'lookupPolicyStep',
  description: 'Đối soát thời hạn bảo hiểm, trạng thái hiệu lực và danh mục loại trừ ICD-10',
  inputSchema: z.any(),
  outputSchema: z.any(),
  execute: async ({ inputData }): Promise<AssessmentWorkflowState> => {
    const state = inputData as AssessmentWorkflowState;
    const { claim, policy, docResult, steps } = state;

    // GATING: Nếu Bước 1 chưa hoàn tất (thiếu chứng từ), giữ trạng thái PENDING
    if (!docResult?.isComplete) {
      const pendingStep: AssessmentStepResult = {
        step: 'LOOKUP_POLICY',
        status: 'PENDING',
        score: undefined,
        message: '',
        details: { pendingStep: 'VERIFY_DOCUMENT' },
        executedAt: new Date().toISOString(),
      };
      return {
        ...state,
        steps: [...steps, pendingStep],
      };
    }

    // Trích xuất ngày nhập viện, mã ICD-10 từ hồ sơ
    const policyResult = await mastraMcpTools.lookupPolicy.execute(
      {
        policyNumber: claim.policyNumber,
        serviceDate: claim.admissionDate,
        diagnosisIcd10: claim.diagnosisIcd10,
      },
      policy,
    );

    const step2Passed = policyResult.isEligible;
    const step2Result: AssessmentStepResult = {
      step: 'LOOKUP_POLICY',
      status: step2Passed ? 'PASSED' : 'FAILED',
      score: step2Passed ? 100 : 0,
      message: step2Passed
        ? 'Hợp đồng bảo hiểm có hiệu lực vào thời điểm điều trị'
        : policyResult.rejectionReason || 'Hợp đồng không đủ điều kiện chi trả',
      details: policyResult as unknown as Record<string, unknown>,
      executedAt: new Date().toISOString(),
    };

    return {
      ...state,
      policyResult,
      steps: [...steps, step2Result],
    };
  },
});

// =============================================================================
// STEP 3: CHECK MEDICAL NECESSITY (checkMedicalNecessityStep)
// Trích xuất chẩn đoán, phác đồ, và tính số ngày lưu viện từ ngày nhập-xuất viện
// =============================================================================
export const checkMedicalNecessityStep = createStep({
  id: 'checkMedicalNecessityStep',
  description: 'Đánh giá tính cần thiết y khoa của chỉ định, thời gian điều trị theo phác đồ',
  inputSchema: z.any(),
  outputSchema: z.any(),
  execute: async ({ inputData }): Promise<AssessmentWorkflowState> => {
    const state = inputData as AssessmentWorkflowState;
    const { claim, docResult, policyResult, steps } = state;

    // GATING: Nếu Bước 1 thiếu chứng từ hoặc Bước 2 bị từ chối hợp đồng, giữ PENDING
    if (!docResult?.isComplete || (policyResult && !policyResult.isEligible)) {
      const pendingStep: AssessmentStepResult = {
        step: 'CHECK_MEDICAL_NECESSITY',
        status: 'PENDING',
        score: undefined,
        message: '',
        details: {},
        executedAt: new Date().toISOString(),
      };
      return {
        ...state,
        steps: [...steps, pendingStep],
      };
    }

    // Trích xuất và tính toán số ngày lưu viện thực tế từ DB
    const admissionTime = new Date(claim.admissionDate).getTime();
    const dischargeTime = new Date(claim.dischargeDate).getTime();
    const lengthOfStayDays = Math.max(
      1,
      Math.round((dischargeTime - admissionTime) / (1000 * 60 * 60 * 24)),
    );

    const necessityResult = await mastraMcpTools.checkMedicalNecessity.execute({
      diagnosisIcd10: claim.diagnosisIcd10,
      diagnosisDescription: claim.diagnosisDescription,
      items: claim.items || [],
      lengthOfStayDays,
    });

    const step3Result: AssessmentStepResult = {
      step: 'CHECK_MEDICAL_NECESSITY',
      status: necessityResult.isPassed ? 'PASSED' : 'WARNING',
      score: necessityResult.overallScore,
      message: necessityResult.isPassed
        ? 'Chỉ định y khoa phù hợp với chẩn đoán bệnh theo phác đồ'
        : `Phát hiện điểm lưu ý y khoa: ${necessityResult.warningFlags.join('; ')}`,
      details: necessityResult as unknown as Record<string, unknown>,
      executedAt: new Date().toISOString(),
    };

    return {
      ...state,
      necessityResult,
      steps: [...steps, step3Result],
    };
  },
});

// =============================================================================
// STEP 4: CALCULATE BENEFIT (calculateBenefitStep)
// Trích xuất các khoản viện phí bóc tách để tính Copay, Deductible, Sublimit
// =============================================================================
export const calculateBenefitStep = createStep({
  id: 'calculateBenefitStep',
  description: 'Động cơ tài chính tính toán chiết tính quyền lợi, đồng chi trả và khấu trừ',
  inputSchema: z.any(),
  outputSchema: z.any(),
  execute: async ({ inputData }): Promise<AssessmentWorkflowState> => {
    const state = inputData as AssessmentWorkflowState;
    const { claim, policy, docResult, policyResult, steps } = state;

    // GATING: Nếu Bước 1 thiếu chứng từ hoặc Bước 2 bị từ chối hợp đồng, giữ PENDING
    if (!docResult?.isComplete || (policyResult && !policyResult.isEligible)) {
      const pendingStep: AssessmentStepResult = {
        step: 'CALCULATE_BENEFIT',
        status: 'PENDING',
        score: undefined,
        message: '',
        details: {},
        executedAt: new Date().toISOString(),
      };
      return {
        ...state,
        steps: [...steps, pendingStep],
      };
    }

    // Chuẩn hóa danh sách items sao cho tổng các khoản khớp 100% với claim.totalRequested
    let itemsToCalculate = claim.items && claim.items.length > 0 ? claim.items : [];
    const claimRequested = claim.totalRequested || 0;

    if (itemsToCalculate.length === 0) {
      itemsToCalculate = [
        {
          itemId: 'ITM-DEFAULT',
          description: claim.diagnosisDescription || 'Chi phí điều trị theo hồ sơ yêu cầu',
          category: 'INPATIENT' as const,
          amountRequested: claimRequested,
        },
      ];
    } else if (claimRequested > 0) {
      const currentSum = itemsToCalculate.reduce((acc, it) => acc + (it.amountRequested || 0), 0);
      if (currentSum > 0 && currentSum !== claimRequested) {
        const ratio = claimRequested / currentSum;
        let running = 0;
        itemsToCalculate = itemsToCalculate.map((it, idx) => {
          if (idx === itemsToCalculate.length - 1) {
            return {
              ...it,
              amountRequested: Math.max(0, claimRequested - running),
            };
          }
          const scaled = Math.round(it.amountRequested * ratio);
          running += scaled;
          return {
            ...it,
            amountRequested: scaled,
          };
        });
      }
    }

    const calculationResult = await mastraMcpTools.calculateBenefit.execute({
      claimId: claim.claimId,
      items: itemsToCalculate,
      policy,
    });

    const step4Result: AssessmentStepResult = {
      step: 'CALCULATE_BENEFIT',
      status: 'PASSED',
      score: 100,
      message: `Số tiền duyệt: ${calculationResult.totalPayable.toLocaleString()} VND (Khấu trừ/Đồng chi trả: ${calculationResult.totalDeductions.toLocaleString()} VND)`,
      details: calculationResult as unknown as Record<string, unknown>,
      executedAt: new Date().toISOString(),
    };

    return {
      ...state,
      calculationResult,
      steps: [...steps, step4Result],
    };
  },
});

// =============================================================================
// STEP 5: SYNTHESIZE REPORT & RUN SCORERS (synthesizeReportStep)
// Tổng hợp kết quả toàn diện từ cả 4 bước, xác lập khuyến nghị và rào chắn an toàn
// =============================================================================
export const synthesizeReportStep = createStep({
  id: 'synthesizeReportStep',
  description: 'Tổng hợp AssessmentReport, đánh giá rào chắn số học và căn cứ pháp lý',
  inputSchema: z.any(),
  outputSchema: z.any(),
  execute: async ({ inputData }): Promise<AssessmentReport> => {
    const state = inputData as AssessmentWorkflowState;
    const { claim, policy, docResult, policyResult, necessityResult, calculationResult, steps } =
      state;

    const actualRequested = claim.totalRequested || calculationResult?.totalRequested || 0;

    // Xác định Khuyến nghị Quyết định (Decision Hierarchy)
    let finalRecommendation: AssessmentReport['finalRecommendation'] = 'APPROVE';
    let totalPayable = calculationResult?.totalPayable ?? 0;
    let totalDeductions = calculationResult?.totalDeductions ?? actualRequested;
    let reportBreakdown = calculationResult?.breakdown || [];
    let summaryText = '';

    if (docResult && !docResult.isComplete) {
      // Ưu tiên 1: Thiếu chứng từ bắt buộc -> Yêu cầu bổ sung
      finalRecommendation = 'REQUEST_MORE_INFO';
      totalPayable = 0;
      totalDeductions = actualRequested;
      summaryText = `Hồ sơ ${claim.claimId} cần bổ sung chứng từ bắt buộc (${docResult.missingTypes.join(', ')}).`;
    } else if (policyResult && !policyResult.isEligible) {
      // Ưu tiên 2: Vi phạm loại trừ hoặc hết hạn hợp đồng -> Từ chối chi trả
      finalRecommendation = 'REJECT';
      totalPayable = 0;
      totalDeductions = actualRequested;
      summaryText = `Từ chối chi trả cho hồ sơ ${claim.claimId}. Lý do: ${policyResult.rejectionReason || 'Vi phạm điều khoản loại trừ hợp đồng'}.`;
      reportBreakdown = (claim.items || []).map(item => ({
        itemId: item.itemId,
        description: item.description,
        category: item.category,
        requestedAmount: item.amountRequested,
        eligibleAmount: 0,
        copayAmount: 0,
        deductibleAmount: item.amountRequested,
        payableAmount: 0,
        appliedRule:
          policyResult.rejectionReason || 'Từ chối chi trả theo điều khoản loại trừ hợp đồng',
        notes: 'Không thuộc phạm vi bảo hiểm bảo vệ',
      }));
    } else if (necessityResult && !necessityResult.isPassed) {
      // Ưu tiên 3: Có cảnh báo y khoa bất thường -> Chuyển giám định y khoa
      finalRecommendation = 'MANUAL_ESCALATION';
      totalPayable = Math.min(totalPayable, actualRequested);
      totalDeductions = Math.max(0, actualRequested - totalPayable);
      summaryText = `Hồ sơ ${claim.claimId} có cảnh báo y khoa cần chuyên gia giám định: ${necessityResult.warningFlags.join('; ')}.`;
    } else {
      // Ưu tiên 4: Tất cả các khía cạnh đều hợp lệ -> Chấp thuận chi trả
      finalRecommendation = 'APPROVE';
      // Rào chắn bảo toàn số học: Số tiền duyệt không bao giờ vượt quá số tiền yêu cầu thực tế
      totalPayable = Math.min(totalPayable, actualRequested);
      totalDeductions = Math.max(0, actualRequested - totalPayable);
      summaryText = `Thẩm định hoàn tất cho hồ sơ ${claim.claimId}. Khuyến nghị: APPROVE. Số tiền chi trả: ${totalPayable.toLocaleString()} VND. Khấu trừ/đồng chi trả: ${totalDeductions.toLocaleString()} VND.`;
    }

    const confidenceScore = calculateOverallConfidence({
      docScore: steps[0]?.score || 0,
      policyScore: steps[1]?.score || 0,
      medScore: steps[2]?.score || 0,
      calcScore: steps[3]?.score || 0,
    });

    const sanitizedSummary = sanitizeUserFacingText(summaryText);

    const report: AssessmentReport = {
      assessmentId: `ASM-${claim.claimId}-${Date.now().toString().slice(-4)}`,
      claimId: claim.claimId,
      policyNumber: claim.policyNumber,
      finalRecommendation,
      totalRequested: actualRequested,
      totalPayable,
      totalDeductions,
      confidenceScore,
      executiveSummary: sanitizedSummary,
      steps,
      breakdown: reportBreakdown,
      missingDocuments: docResult?.missingTypes || [],
      policyExclusionsMatched: policyResult?.matchedExclusions || [],
      assessedAt: new Date().toISOString(),
    };

    // Quality Scorers
    const mathEval = scoreMathConservation(report);
    const groundingEval = scorePolicyGrounding(report, policy);
    if (!mathEval.passed) {
      console.warn(`[Scorer Warning] Math conservation: ${mathEval.reason}`);
    }
    if (!groundingEval.passed) {
      console.warn(`[Scorer Warning] Policy grounding: ${groundingEval.reason}`);
    }

    return report;
  },
});

// =============================================================================
// CANONICAL MASTRA WORKFLOW DEFINITION
// Chuỗi tuần tự 5 bước theo chuẩn Mastra Core Engine
// =============================================================================
export const claimsAssessmentWorkflow = createWorkflow({
  id: 'claimsAssessmentWorkflow',
  inputSchema: z.object({
    claim: z.any(),
    policy: z.any(),
    steps: z.array(z.any()).optional(),
  }),
  outputSchema: z.any(),
})
  .then(verifyDocumentStep)
  .then(lookupPolicyStep)
  .then(checkMedicalNecessityStep)
  .then(calculateBenefitStep)
  .then(synthesizeReportStep)
  .commit();

/**
 * Helper: Tự động cập nhật dữ liệu thẩm định vào lưu trữ (Prisma Database)
 */
async function persistAssessmentResult(report: AssessmentReport) {
  try {
    const existing = await prisma.claim.findUnique({
      where: { claimId: report.claimId },
    });
    if (!existing) {
      return; // Không tồn tại trong DB (ví dụ unit test chạy in-memory mock), bỏ qua an toàn
    }

    await prisma.assessment.create({
      data: {
        assessmentId: report.assessmentId,
        claimId: report.claimId,
        finalRecommendation: report.finalRecommendation,
        confidenceScore: report.confidenceScore,
        totalRequested: report.totalRequested,
        totalPayable: report.totalPayable,
        totalDeductions: report.totalDeductions,
        executiveSummary: report.executiveSummary,
        stepsJson: JSON.stringify(report.steps),
        breakdownJson: JSON.stringify(report.breakdown),
        missingDocumentsJson: JSON.stringify(report.missingDocuments || []),
        assessedAt: new Date(report.assessedAt),
      },
    });

    // Do NOT overwrite user manual override, approved, or rejected status
    const isManualDecision =
      existing.status === 'OVERRIDDEN' ||
      existing.status === 'APPROVED' ||
      existing.status === 'REJECTED';

    if (!isManualDecision) {
      await prisma.claim.update({
        where: { claimId: report.claimId },
        data: {
          status: 'ASSESSING',
          totalApproved: report.finalRecommendation === 'APPROVE' ? report.totalPayable : 0,
        },
      });
    }

    await prisma.auditLog.create({
      data: {
        claimId: report.claimId,
        actorId: 'MASTRA_WORKFLOW_ENGINE',
        actorRole: 'AI_AGENT',
        actionType: 'ASSESSMENT_RUN',
        newValue: JSON.stringify({
          finalRecommendation: report.finalRecommendation,
          totalPayable: report.totalPayable,
          confidenceScore: report.confidenceScore,
        }),
        reason: `Mastra Workflow hoàn tất đánh giá 4 bước: ${report.finalRecommendation}`,
      },
    });
  } catch (err) {
    console.warn(`[Persistence Warning] Could not persist assessment for ${report.claimId}:`, err);
  }
}

// =============================================================================
// MASTRA WORKFLOW RUNNER (executeClaimsAssessmentWorkflow)
// Thực thi đồ thị Mastra Core và tự động đồng bộ hóa kết quả vào cơ sở dữ liệu
// =============================================================================
export async function executeClaimsAssessmentWorkflow(
  input: WorkflowAssessmentInput,
  onStepProgress?: (step: string, data: unknown) => void,
): Promise<AssessmentReport> {
  const run = await claimsAssessmentWorkflow.createRun();

  // If streaming listener is requested (e.g. for Server-Sent Events SSE stream)
  if (onStepProgress) {
    const stream = run.stream({
      inputData: {
        claim: input.claim,
        policy: input.policy,
        steps: [],
      },
    });

    for await (const chunk of stream.fullStream) {
      const typedChunk = chunk as unknown as {
        payload?: {
          id?: string;
          stepName?: string;
          output?: {
            docResult?: VerifyDocumentOutput;
            policyResult?: LookupPolicyOutput;
            necessityResult?: CheckNecessityOutput;
            calculationResult?: CalculateBenefitOutput;
          };
        };
      };

      if (chunk.type === 'workflow-step-start') {
        const payload = typedChunk.payload;
        const stepId = payload?.id || payload?.stepName;
        if (stepId === 'verifyDocumentStep') {
          onStepProgress('VERIFY_DOCUMENT_START', { claimId: input.claim.claimId });
        } else if (stepId === 'lookupPolicyStep') {
          onStepProgress('LOOKUP_POLICY_START', { policyNumber: input.claim.policyNumber });
        } else if (stepId === 'checkMedicalNecessityStep') {
          onStepProgress('CHECK_MEDICAL_NECESSITY_START', {
            diagnosis: input.claim.diagnosisIcd10,
          });
        } else if (stepId === 'calculateBenefitStep') {
          onStepProgress('CALCULATE_BENEFIT_START', {
            itemsCount: input.claim.items?.length || 0,
          });
        }
      } else if (chunk.type === 'workflow-step-result') {
        const payload = typedChunk.payload;
        const stepId = payload?.id || payload?.stepName;
        const output = payload?.output;
        if (stepId === 'verifyDocumentStep') {
          onStepProgress('VERIFY_DOCUMENT_COMPLETE', output?.docResult);
        } else if (stepId === 'lookupPolicyStep') {
          onStepProgress('LOOKUP_POLICY_COMPLETE', output?.policyResult);
        } else if (stepId === 'checkMedicalNecessityStep') {
          onStepProgress('CHECK_MEDICAL_NECESSITY_COMPLETE', output?.necessityResult);
        } else if (stepId === 'calculateBenefitStep') {
          onStepProgress('CALCULATE_BENEFIT_COMPLETE', output?.calculationResult);
        }
      }
    }

    const streamRes = await stream.result;
    if (streamRes.status === 'success') {
      const finalReport = streamRes.result as AssessmentReport;
      // Tự động đồng bộ hóa kết quả vào cơ sở dữ liệu
      await persistAssessmentResult(finalReport);
      onStepProgress('REPORT_COMPLETE', finalReport);
      return finalReport;
    } else {
      const errorMsg =
        streamRes.status === 'failed' && streamRes.error
          ? (streamRes.error as Error).message
          : 'Unknown error';
      throw new Error(`Mastra Workflow failed with status ${streamRes.status}: ${errorMsg}`);
    }
  }

  // Non-streaming execution via Mastra run.start()
  const result = await run.start({
    inputData: {
      claim: input.claim,
      policy: input.policy,
      steps: [],
    },
  });

  if (result.status === 'success') {
    const finalReport = result.result as AssessmentReport;
    // Tự động đồng bộ hóa kết quả vào cơ sở dữ liệu
    await persistAssessmentResult(finalReport);
    return finalReport;
  } else {
    const errorMsg =
      result.status === 'failed' && result.error
        ? (result.error as Error).message
        : 'Unknown error';
    throw new Error(`Mastra Workflow failed with status ${result.status}: ${errorMsg}`);
  }
}
