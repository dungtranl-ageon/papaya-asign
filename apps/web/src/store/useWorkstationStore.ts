import { create } from 'zustand';
import { Claim, ClaimStatus, Policy, AssessmentReport } from '@papaya/shared';
import {
  BenefitCalculationData,
  IneligibleItem,
} from '@/components/copilot/BenefitCalculationCard';

interface WorkstationState {
  // State
  activeClaimId: string | null;
  claim: Claim | null;
  policy: Policy | null;
  assessment: AssessmentReport | null;
  isLoading: boolean;
  isAssessing: boolean;
  error: string | null;
  approvedAmount: number;

  // Actions
  setActiveClaimId: (id: string) => void;
  setApprovedAmount: (amount: number) => void;
  fetchClaimDetails: (claimId: string) => Promise<void>;
  runMastraAssessment: (claimId?: string) => Promise<void>;
  updateClaimStatus: (status: ClaimStatus, totalApproved?: number) => Promise<void>;
  getDerivedCalculation: () => BenefitCalculationData;
}

export const useWorkstationStore = create<WorkstationState>((set, get) => ({
  activeClaimId: null,
  claim: null,
  policy: null,
  assessment: null,
  isLoading: false,
  isAssessing: false,
  error: null,
  approvedAmount: 0,

  setActiveClaimId: (id: string) => {
    set({ activeClaimId: id });
  },

  setApprovedAmount: (amount: number) => {
    set({ approvedAmount: amount });
  },

  fetchClaimDetails: async (claimId: string) => {
    set({ isLoading: true, error: null, activeClaimId: claimId });

    try {
      // 1. Fetch Claim
      const claimRes = await fetch(`/api/claims/${claimId}`);
      if (!claimRes.ok) {
        throw new Error(`Không thể nạp dữ liệu hồ sơ bồi thường ${claimId}`);
      }
      const claimData: Claim = await claimRes.json();
      set({
        claim: claimData,
        approvedAmount: claimData.totalApproved || 0,
      });

      // 2. Fetch Policy
      if (claimData.policyNumber) {
        try {
          const policyRes = await fetch(`/api/policies/${claimData.policyNumber}`);
          if (policyRes.ok) {
            const policyData: Policy = await policyRes.json();
            set({ policy: policyData });
          } else {
            set({ policy: null });
          }
        } catch {
          set({ policy: null });
        }
      }

      // 3. Fetch Assessment
      try {
        const assessRes = await fetch(`/api/claims/${claimId}/assessment`);
        if (assessRes.ok) {
          const assessData = await assessRes.json();
          if (assessData && assessData.assessmentId) {
            set({
              assessment: assessData,
              approvedAmount: claimData.totalApproved || assessData.totalPayable || 0,
            });
          } else {
            set({ assessment: null });
          }
        } else {
          set({ assessment: null });
        }
      } catch {
        set({ assessment: null });
      }
    } catch (err: unknown) {
      set({
        error: err instanceof Error ? err.message : 'Lỗi kết nối cơ sở dữ liệu',
      });
    } finally {
      set({ isLoading: false });
    }
  },

  runMastraAssessment: async (claimId?: string) => {
    const targetId = claimId || get().activeClaimId;
    if (!targetId) return;

    set({ isAssessing: true });
    try {
      const res = await fetch(`/api/claims/${targetId}/assess`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });

      if (res.ok) {
        const report: AssessmentReport = await res.json();
        set({
          assessment: report,
          approvedAmount: report.totalPayable || 0,
        });
        // Re-fetch claim to sync status updated by Mastra
        await get().fetchClaimDetails(targetId);
      }
    } catch (err) {
      console.error('Failed to run Mastra assessment:', err);
    } finally {
      set({ isAssessing: false });
    }
  },

  updateClaimStatus: async (status: ClaimStatus, totalApproved?: number) => {
    const claimId = get().activeClaimId;
    if (!claimId) return;

    try {
      const res = await fetch(`/api/claims/${claimId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status,
          totalApproved: totalApproved ?? get().approvedAmount,
        }),
      });

      if (res.ok) {
        await get().fetchClaimDetails(claimId);
      }
    } catch (err) {
      console.error('Failed to update claim status:', err);
    }
  },

  getDerivedCalculation: (): BenefitCalculationData => {
    const { claim, policy, assessment, approvedAmount } = get();

    const totalClaimed = claim?.totalRequested || 0;
    const annualLimit = policy?.annualTotalLimit || 500000000;
    const annualUsed = policy?.annualUsedAmount || 0;
    const remainingBefore = Math.max(0, annualLimit - annualUsed);

    if (assessment && assessment.breakdown && assessment.breakdown.length > 0) {
      const eligible = assessment.breakdown.reduce(
        (sum, item) => sum + (item.eligibleAmount || 0),
        0,
      );
      const deductible = assessment.breakdown.reduce(
        (sum, item) => sum + (item.deductibleAmount || 0),
        0,
      );
      const copay = assessment.breakdown.reduce((sum, item) => sum + (item.copayAmount || 0), 0);
      const copayPct = eligible > 0 ? Math.round((copay / eligible) * 100) : 20;

      const ineligible: IneligibleItem[] = assessment.breakdown
        .filter(it => it.requestedAmount > it.eligibleAmount)
        .map(it => ({
          description: it.description,
          amount: it.requestedAmount - it.eligibleAmount,
          reason: it.appliedRule || 'Loại trừ theo điều khoản hợp đồng',
        }));

      if (
        assessment.missingDocuments &&
        assessment.missingDocuments.length > 0 &&
        ineligible.length === 0
      ) {
        ineligible.push({
          description: 'Hồ sơ thiếu chứng từ hợp lệ',
          amount: totalClaimed,
          reason: `Thiếu ${assessment.missingDocuments.join(', ')}`,
        });
      }

      const finalAmount = approvedAmount || assessment.totalPayable;

      return {
        totalClaimedAmount: assessment.totalRequested || totalClaimed,
        eligibleAmount: eligible,
        deductibleApplied: deductible,
        copayPercentage: copayPct,
        copayAmount: copay,
        ineligibleItems: ineligible,
        finalPayableAmount: finalAmount,
        annualLimitRemainingBefore: remainingBefore,
        annualLimitRemainingAfter: Math.max(0, remainingBefore - finalAmount),
      };
    }

    const isApproved = claim?.status === 'APPROVED';
    const isRejected = claim?.status === 'REJECTED';
    const eligibleAmount = isRejected ? 0 : Math.round(totalClaimed * 0.8);
    const copayAmount = isRejected ? 0 : Math.round(eligibleAmount * 0.2);
    const finalAmount = approvedAmount || (isApproved ? eligibleAmount - copayAmount : 0);

    return {
      totalClaimedAmount: totalClaimed,
      eligibleAmount,
      deductibleApplied: 0,
      copayPercentage: isRejected ? 0 : 20,
      copayAmount,
      ineligibleItems: isRejected
        ? [
            {
              description: 'Toàn bộ chi phí bị từ chối bồi thường',
              amount: totalClaimed,
              reason: 'Không thỏa mãn điều kiện theo quy tắc bảo hiểm',
            },
          ]
        : [],
      finalPayableAmount: finalAmount,
      annualLimitRemainingBefore: remainingBefore,
      annualLimitRemainingAfter: Math.max(0, remainingBefore - finalAmount),
    };
  },
}));
