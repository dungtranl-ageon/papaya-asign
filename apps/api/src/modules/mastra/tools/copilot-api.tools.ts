import { tool } from 'ai';
import { z } from 'zod';
import { PrismaClient } from '@prisma/client';
import { calculateBenefit } from '@papaya/mcp-server';
import { ClaimItem, Policy } from '@papaya/shared';

// Singleton Prisma instance for copilot tools execution
const prisma = new PrismaClient();

/**
 * 1. Tool: Tra cứu thông tin chi tiết hồ sơ yêu cầu bồi thường từ cơ sở dữ liệu
 */
export const getClaimDetailsTool = tool({
  description:
    'Lấy thông tin chi tiết đầy đủ của hồ sơ bồi thường (Bệnh nhân, bệnh viện, mã chẩn đoán ICD-10, ngày nhập/xuất viện, tổng tiền yêu cầu, số tiền đã duyệt, trạng thái hồ sơ).',
  parameters: z.object({
    claimId: z.string().describe('Mã định danh hồ sơ bồi thường, ví dụ: CLM-2026-43948'),
  }),
  execute: async ({ claimId }) => {
    try {
      const claim = await prisma.claim.findUnique({
        where: { claimId },
        include: { policy: true },
      });
      if (!claim) {
        return { error: `Không tìm thấy hồ sơ bồi thường với mã ${claimId}` };
      }

      let items: ClaimItem[] = [];
      let documents: unknown[] = [];
      try {
        items = JSON.parse(claim.itemsJson || '[]');
      } catch {
        items = [];
      }
      try {
        documents = JSON.parse(claim.documentsJson || '[]');
      } catch {
        documents = [];
      }

      return {
        claimId: claim.claimId,
        policyNumber: claim.policyNumber,
        patientName: claim.patientName,
        nationalId: claim.nationalId,
        hospitalName: claim.hospitalName,
        admissionDate: claim.admissionDate.toISOString().split('T')[0],
        dischargeDate: claim.dischargeDate.toISOString().split('T')[0],
        diagnosisIcd10: claim.diagnosisIcd10,
        diagnosisDescription: claim.diagnosisDescription,
        status: claim.status,
        totalRequested: claim.totalRequested,
        totalApproved: claim.totalApproved,
        itemsCount: items.length,
        documentsCount: documents.length,
        planName: claim.policy?.planName,
        policyStatus: claim.policy?.status,
      };
    } catch (err: unknown) {
      return {
        error: `Lỗi truy vấn cơ sở dữ liệu: ${err instanceof Error ? err.message : String(err)}`,
      };
    }
  },
});

/**
 * 2. Tool: Tra cứu danh mục chứng từ đính kèm của hồ sơ
 */
export const getClaimDocumentsTool = tool({
  description:
    'Lấy danh sách các chứng từ y tế, hóa đơn, bảng kê viện phí đính kèm trong hồ sơ và tình trạng hợp lệ/OCR của từng chứng từ.',
  parameters: z.object({
    claimId: z.string().describe('Mã định danh hồ sơ bồi thường'),
  }),
  execute: async ({ claimId }) => {
    try {
      const claim = await prisma.claim.findUnique({
        where: { claimId },
        select: { claimId: true, documentsJson: true },
      });
      if (!claim) {
        return { error: `Không tìm thấy hồ sơ ${claimId}` };
      }
      const documents = JSON.parse(claim.documentsJson || '[]');
      return {
        claimId,
        documentsCount: documents.length,
        documents,
      };
    } catch (err: unknown) {
      return {
        error: `Lỗi truy vấn chứng từ: ${err instanceof Error ? err.message : String(err)}`,
      };
    }
  },
});

/**
 * 3. Tool: Tra cứu chi tiết các khoản chi phí viện phí bóc tách (Claim Items)
 */
export const getClaimItemsTool = tool({
  description:
    'Lấy danh sách chi tiết các khoản chi phí bồi thường được bóc tách theo từng danh mục (Phẫu thuật, tiền phòng, thuốc men, xét nghiệm, chẩn đoán hình ảnh).',
  parameters: z.object({
    claimId: z.string().describe('Mã định danh hồ sơ bồi thường'),
  }),
  execute: async ({ claimId }) => {
    try {
      const claim = await prisma.claim.findUnique({
        where: { claimId },
        select: { claimId: true, totalRequested: true, itemsJson: true },
      });
      if (!claim) {
        return { error: `Không tìm thấy hồ sơ ${claimId}` };
      }
      const items: ClaimItem[] = JSON.parse(claim.itemsJson || '[]');
      return {
        claimId,
        totalRequested: claim.totalRequested,
        items,
      };
    } catch (err: unknown) {
      return { error: `Lỗi truy vấn chi phí: ${err instanceof Error ? err.message : String(err)}` };
    }
  },
});

/**
 * 4. Tool: Tra cứu quyền lợi, hạn mức và quy tắc của Hợp đồng bảo hiểm
 */
export const getPolicyScheduleTool = tool({
  description:
    'Tra cứu quy tắc hợp đồng bảo hiểm: hạn mức năm tối đa, hạn mức đã dùng, danh mục điểm loại trừ ICD-10, thời gian chờ, tỷ lệ đồng chi trả Copay và giới hạn phụ (sublimit) từng quyền lợi.',
  parameters: z.object({
    policyNumber: z.string().describe('Số hợp đồng bảo hiểm, ví dụ: POL-GOLD-99882'),
  }),
  execute: async ({ policyNumber }) => {
    try {
      const policy = await prisma.policy.findUnique({
        where: { policyNumber },
      });
      if (!policy) {
        return { error: `Không tìm thấy hợp đồng bảo hiểm ${policyNumber}` };
      }

      const exclusions: string[] = JSON.parse(policy.exclusionsJson || '[]');
      const benefits: unknown[] = JSON.parse(policy.benefitsJson || '[]');
      const waitingPeriods: Record<string, number> = JSON.parse(policy.waitingPeriodsJson || '{}');

      return {
        policyNumber: policy.policyNumber,
        planName: policy.planName,
        status: policy.status,
        effectiveDate: policy.effectiveDate.toISOString().split('T')[0],
        expiryDate: policy.expiryDate.toISOString().split('T')[0],
        annualTotalLimit: policy.annualTotalLimit,
        annualUsedAmount: policy.annualUsedAmount,
        annualRemainingLimit: Math.max(0, policy.annualTotalLimit - policy.annualUsedAmount),
        exclusions,
        benefits,
        waitingPeriods,
      };
    } catch (err: unknown) {
      return { error: `Lỗi tra cứu hợp đồng: ${err instanceof Error ? err.message : String(err)}` };
    }
  },
});

/**
 * 5. Tool: Tra cứu kết quả thẩm định mới nhất của Workflow AI
 */
export const getLatestAssessmentTool = tool({
  description:
    'Lấy báo cáo kết quả thẩm định tự động mới nhất từ Workflow AI (kết luận APPROVE / REJECT / REQUEST_MORE_INFO, số tiền chấp thuận chi trả, số tiền khấu trừ/đồng chi trả, tóm tắt điều hành, kết quả từng bước và bảng chiết tính breakdown).',
  parameters: z.object({
    claimId: z.string().describe('Mã định danh hồ sơ bồi thường'),
  }),
  execute: async ({ claimId }) => {
    try {
      const assessment = await prisma.assessment.findFirst({
        where: { claimId },
        orderBy: { assessedAt: 'desc' },
      });
      if (!assessment) {
        return {
          message: `Hồ sơ ${claimId} chưa có báo cáo thẩm định tự động nào trong cơ sở dữ liệu.`,
        };
      }

      return {
        assessmentId: assessment.assessmentId,
        claimId: assessment.claimId,
        finalRecommendation: assessment.finalRecommendation,
        confidenceScore: assessment.confidenceScore,
        totalRequested: assessment.totalRequested,
        totalPayable: assessment.totalPayable,
        totalDeductions: assessment.totalDeductions,
        executiveSummary: assessment.executiveSummary,
        steps: JSON.parse(assessment.stepsJson || '[]'),
        breakdown: JSON.parse(assessment.breakdownJson || '[]'),
        missingDocuments: JSON.parse(assessment.missingDocumentsJson || '[]'),
        assessedAt: assessment.assessedAt.toISOString(),
      };
    } catch (err: unknown) {
      return {
        error: `Lỗi tra cứu báo cáo thẩm định: ${err instanceof Error ? err.message : String(err)}`,
      };
    }
  },
});

/**
 * 6. Tool: Mô phỏng chiết tính quyền lợi tài chính (Simulate Benefit Calculation)
 */
export const simulateBenefitCalculationTool = tool({
  description:
    'Mô phỏng động tính toán lại quyền lợi chi trả cho hồ sơ dựa trên danh sách hạng mục chi phí và quy tắc hợp đồng, có thể điều chỉnh tỷ lệ đồng chi trả Copay.',
  parameters: z.object({
    claimId: z.string().describe('Mã định danh hồ sơ bồi thường'),
    customCopayPercent: z
      .number()
      .min(0)
      .max(100)
      .optional()
      .describe('Tùy chọn tỷ lệ đồng chi trả (0-100%) muốn mô phỏng'),
  }),
  execute: async ({ claimId, customCopayPercent }) => {
    try {
      const claim = await prisma.claim.findUnique({
        where: { claimId },
        include: { policy: true },
      });
      if (!claim || !claim.policy) {
        return { error: `Không tìm thấy hồ sơ hoặc hợp đồng của ${claimId}` };
      }

      const items: ClaimItem[] = JSON.parse(claim.itemsJson || '[]');
      const policy: Policy = {
        policyNumber: claim.policy.policyNumber,
        planName: claim.policy.planName,
        insuredName: claim.policy.insuredName,
        nationalId: claim.policy.nationalId,
        status: claim.policy.status as 'ACTIVE' | 'LAPSED' | 'TERMINATED',
        effectiveDate: claim.policy.effectiveDate.toISOString(),
        expiryDate: claim.policy.expiryDate.toISOString(),
        annualTotalLimit: claim.policy.annualTotalLimit,
        annualUsedAmount: claim.policy.annualUsedAmount,
        exclusions: JSON.parse(claim.policy.exclusionsJson || '[]'),
        benefits: JSON.parse(claim.policy.benefitsJson || '[]'),
        waitingPeriods: JSON.parse(claim.policy.waitingPeriodsJson || '{}'),
      };

      // If custom copay percentage provided, override benefit copay rates
      if (customCopayPercent !== undefined) {
        const rate = customCopayPercent / 100;
        policy.benefits = policy.benefits.map(b => ({ ...b, copayRate: rate }));
      }

      const result = await calculateBenefit({
        claimId,
        items,
        policy,
      });

      return {
        claimId,
        appliedCopayPercent: customCopayPercent ?? 'Mặc định theo hợp đồng',
        totalRequested: result.totalRequested,
        totalPayable: result.totalPayable,
        totalDeductions: result.totalDeductions,
        breakdown: result.breakdown,
      };
    } catch (err: unknown) {
      return {
        error: `Lỗi mô phỏng chiết tính: ${err instanceof Error ? err.message : String(err)}`,
      };
    }
  },
});

/**
 * Export toàn bộ công cụ Copilot API
 */
export const copilotApiTools = {
  getClaimDetails: getClaimDetailsTool,
  getClaimDocuments: getClaimDocumentsTool,
  getClaimItems: getClaimItemsTool,
  getPolicySchedule: getPolicyScheduleTool,
  getLatestAssessment: getLatestAssessmentTool,
  simulateBenefitCalculation: simulateBenefitCalculationTool,
};
