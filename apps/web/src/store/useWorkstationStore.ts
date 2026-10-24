import { create } from 'zustand';
import { Claim, ClaimStatus, Policy, AssessmentReport } from '@papaya/shared';
import {
  BenefitCalculationData,
  IneligibleItem,
} from '@/components/copilot/BenefitCalculationCard';

export interface QueueClaimItem {
  id: string;
  claimId: string;
  policyId: string;
  policyNumber: string;
  insuredName: string;
  patientName: string;
  nationalId: string;
  hospitalName: string;
  icd10Code: string;
  icd10Description: string;
  treatmentType: string;
  claimedAmount: number;
  totalRequested: number;
  aiSuggestedAmount?: number;
  aiRecommendation: 'APPROVE' | 'REJECT' | 'NEED_MORE_INFO' | 'PENDING';
  aiConfidence: number;
  aiReason?: string;
  status: ClaimStatus;
  hitlDecision: ClaimStatus;
  slaHoursLeft: number;
  submittedAt: string;
  testCaseLabel?: string;
}

export interface CreateClaimInput {
  claimId?: string;
  policyNumber: string;
  patientName: string;
  nationalId: string;
  hospitalName: string;
  admissionDate: string;
  dischargeDate: string;
  diagnosisIcd10: string;
  diagnosisDescription: string;
  totalRequested: number;
  items?: Array<{
    itemId?: string;
    description: string;
    category: 'INPATIENT' | 'OUTPATIENT' | 'SURGERY' | 'MEDICATION' | 'LABORATORY' | 'DENTAL';
    amountRequested: number;
  }>;
  documents?: Array<{
    docId?: string;
    docType:
      | 'HOSPITAL_DISCHARGE'
      | 'DETAILED_INVOICE'
      | 'VAT_INVOICE'
      | 'SURGICAL_REPORT'
      | 'LAB_RESULT'
      | 'PRESCRIPTION'
      | 'OTHER';
    fileName: string;
    uploadedAt?: string;
    status: 'VALID' | 'INVALID' | 'REQUIRES_REVIEW' | 'PENDING';
    notes?: string;
  }>;
}

interface WorkstationState {
  // State
  activeClaimId: string | null;
  claim: Claim | null;
  policy: Policy | null;
  assessment: AssessmentReport | null;
  claimsQueue: QueueClaimItem[];
  isQueueLoading: boolean;
  queueError: string | null;
  isLoading: boolean;
  isAssessing: boolean;
  error: string | null;
  approvedAmount: number;

  // Actions
  setActiveClaimId: (id: string | null) => void;
  setApprovedAmount: (amount: number) => void;
  fetchClaimsQueue: () => Promise<void>;
  createClaim: (input: CreateClaimInput) => Promise<Claim>;
  fetchClaimDetails: (claimId: string, autoAssess?: boolean) => Promise<void>;
  addClaimDocument: (
    claimId: string,
    doc: {
      docType: string;
      fileName: string;
      status?: 'VALID' | 'INVALID' | 'REQUIRES_REVIEW' | 'PENDING';
      notes?: string;
    },
  ) => Promise<Claim>;
  runMastraAssessment: (claimId?: string) => Promise<void>;
  updateClaimStatus: (
    status: ClaimStatus,
    totalApproved?: number,
    reason?: string,
  ) => Promise<void>;
  updateClaim: (claimId: string, data: Partial<Claim>) => Promise<Claim>;
  getDerivedCalculation: () => BenefitCalculationData;
}

export const useWorkstationStore = create<WorkstationState>((set, get) => ({
  activeClaimId: null,
  claim: null,
  policy: null,
  assessment: null,
  claimsQueue: [],
  isQueueLoading: false,
  queueError: null,
  isLoading: false,
  isAssessing: false,
  error: null,
  approvedAmount: 0,

  setActiveClaimId: (id: string | null) => {
    set({ activeClaimId: id });
  },

  setApprovedAmount: (amount: number) => {
    set({ approvedAmount: amount });
  },

  fetchClaimsQueue: async () => {
    set({ isQueueLoading: true, queueError: null });

    try {
      const res = await fetch('/api/claims');
      if (!res.ok) {
        throw new Error(`Lỗi tải hàng đợi bồi thường (${res.status} ${res.statusText})`);
      }

      const rawClaims: Claim[] = await res.json();

      if (Array.isArray(rawClaims)) {
        const mappedQueue: QueueClaimItem[] = rawClaims.map(c => {
          // Determine treatment type dynamically from admission/discharge dates or items
          const isSameDay =
            new Date(c.admissionDate).toDateString() === new Date(c.dischargeDate).toDateString();
          const hasSurgery = (c.items || []).some(it => it.category === 'SURGERY');
          const treatmentType = hasSurgery
            ? 'Phẫu thuật nội trú'
            : isSameDay
              ? 'Ngoại trú trong ngày'
              : 'Nội trú tiêu chuẩn';

          // Calculate SLA hours remaining dynamically (standard 24h turnaround)
          const createdTime = new Date(c.createdAt || Date.now()).getTime();
          const now = Date.now();
          const hoursElapsed = Math.max(0, (now - createdTime) / (1000 * 60 * 60));
          const slaHoursLeft =
            c.status === 'SUBMITTED' || c.status === 'ASSESSING'
              ? Math.max(0.5, Math.round((24 - hoursElapsed) * 10) / 10)
              : 0;

          // Lấy đề xuất thực tế từ Mastra Assessment
          const assessment = c.latestAssessment;
          let aiRecommendation: 'APPROVE' | 'REJECT' | 'NEED_MORE_INFO' | 'PENDING' = 'PENDING';
          let aiReason: string | undefined = undefined;

          if (assessment) {
            if (assessment.finalRecommendation === 'APPROVE') {
              aiRecommendation = 'APPROVE';
            } else if (assessment.finalRecommendation === 'REJECT') {
              aiRecommendation = 'REJECT';
              aiReason = assessment.executiveSummary || 'Không thuộc phạm vi bảo hiểm';
            } else if (assessment.finalRecommendation === 'REQUEST_MORE_INFO') {
              aiRecommendation = 'NEED_MORE_INFO';
              aiReason = assessment.executiveSummary || 'Cần nộp bổ sung chứng từ';
            } else {
              aiRecommendation = 'NEED_MORE_INFO';
              aiReason = assessment.executiveSummary || 'Cần giám định y khoa';
            }
          } else {
            // Khi chưa có kết quả đánh giá, chỉ suy luận nếu hồ sơ đã có status rõ ràng
            if (c.status === 'REJECTED') {
              aiRecommendation = 'REJECT';
              aiReason = 'Từ chối chi trả';
            } else if (c.status === 'PENDING_MORE_INFO') {
              aiRecommendation = 'NEED_MORE_INFO';
              aiReason = 'Cần bổ sung chứng từ';
            } else if (c.status === 'APPROVED' || c.status === 'OVERRIDDEN') {
              aiRecommendation = 'APPROVE';
            } else {
              aiRecommendation = 'PENDING';
            }
          }

          const aiSuggestedAmount =
            typeof assessment?.totalPayable === 'number'
              ? assessment.totalPayable
              : typeof c.totalApproved === 'number'
                ? c.totalApproved
                : undefined;

          const aiConfidence = assessment?.confidenceScore || 95.0;

          return {
            id: c.claimId,
            claimId: c.claimId,
            policyId: c.policyNumber,
            policyNumber: c.policyNumber,
            insuredName: c.patientName,
            patientName: c.patientName,
            nationalId: c.nationalId,
            hospitalName: c.hospitalName,
            icd10Code: c.diagnosisIcd10,
            icd10Description: c.diagnosisDescription,
            treatmentType,
            claimedAmount: c.totalRequested,
            totalRequested: c.totalRequested,
            aiSuggestedAmount,
            aiRecommendation,
            aiConfidence,
            aiReason,
            status: c.status,
            hitlDecision: c.status,
            slaHoursLeft,
            submittedAt: new Date(c.createdAt || Date.now()).toLocaleDateString('vi-VN', {
              hour: '2-digit',
              minute: '2-digit',
              day: '2-digit',
              month: '2-digit',
            }),
          };
        });

        set({ claimsQueue: mappedQueue, isQueueLoading: false, queueError: null });
      } else {
        set({ claimsQueue: [], isQueueLoading: false, queueError: null });
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Lỗi kết nối cơ sở dữ liệu';
      set({ queueError: msg, isQueueLoading: false });
      console.error('Failed to fetch claims queue from API:', err);
    }
  },

  createClaim: async (input: CreateClaimInput): Promise<Claim> => {
    const res = await fetch('/api/claims', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(input),
    });

    if (!res.ok) {
      let errorDetail = `Lỗi khởi tạo hồ sơ (${res.status} ${res.statusText})`;
      try {
        const errJson = await res.json();
        if (errJson.message) {
          errorDetail = Array.isArray(errJson.message)
            ? errJson.message.join(', ')
            : errJson.message;
        }
      } catch {
        // ignore parse error
      }
      throw new Error(errorDetail);
    }

    const createdClaim: Claim = await res.json();

    // Re-fetch queue to include newly ingested claim
    await get().fetchClaimsQueue();

    return createdClaim;
  },

  fetchClaimDetails: async (claimId: string, autoAssess = true) => {
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
        approvedAmount: typeof claimData.totalApproved === 'number' ? claimData.totalApproved : 0,
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
      let hasValidAssessment = false;
      try {
        const assessRes = await fetch(`/api/claims/${claimId}/assessment`);
        if (assessRes.ok) {
          const assessData = await assessRes.json();
          if (assessData && assessData.assessmentId) {
            hasValidAssessment = true;
            set({
              assessment: assessData,
              approvedAmount:
                typeof claimData.totalApproved === 'number'
                  ? claimData.totalApproved
                  : (assessData.totalPayable ?? 0),
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

      // 4. Auto-trigger Mastra Assessment if claim is new (SUBMITTED) or has no assessment yet
      if (autoAssess && !hasValidAssessment && !get().isAssessing) {
        setTimeout(() => {
          get().runMastraAssessment(claimId);
        }, 50);
      }
    } catch (err: unknown) {
      set({
        error: err instanceof Error ? err.message : 'Lỗi kết nối cơ sở dữ liệu',
      });
    } finally {
      set({ isLoading: false });
    }
  },

  addClaimDocument: async (
    claimId: string,
    doc: {
      docType: string;
      fileName: string;
      status?: 'VALID' | 'INVALID' | 'REQUIRES_REVIEW' | 'PENDING';
      notes?: string;
    },
  ): Promise<Claim> => {
    const res = await fetch(`/api/claims/${claimId}/documents`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(doc),
    });

    if (!res.ok) {
      throw new Error(`Lỗi tải lên chứng từ bổ sung (${res.status})`);
    }

    const updatedClaim: Claim = await res.json();
    set({ claim: updatedClaim });

    // Automatically trigger re-assessment with the newly added document
    await get().runMastraAssessment(claimId);

    return updatedClaim;
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
        // Re-fetch claim without re-triggering assessment loop
        await get().fetchClaimDetails(targetId, false);
        await get().fetchClaimsQueue();
      }
    } catch (err) {
      console.error('Failed to run Mastra assessment:', err);
    } finally {
      set({ isAssessing: false });
    }
  },

  updateClaimStatus: async (status: ClaimStatus, totalApproved?: number, reason?: string) => {
    const claimId = get().activeClaimId;
    if (!claimId) return;

    try {
      const res = await fetch(`/api/claims/${claimId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status,
          totalApproved: totalApproved ?? get().approvedAmount,
          reason,
        }),
      });

      if (res.ok) {
        await get().fetchClaimDetails(claimId);
        await get().fetchClaimsQueue();
      }
    } catch (err) {
      console.error('Failed to update claim status:', err);
    }
  },

  updateClaim: async (claimId: string, data: Partial<Claim>) => {
    try {
      const res = await fetch(`/api/claims/${claimId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (res.ok) {
        const updated: Claim = await res.json();
        set({
          claim: updated,
          approvedAmount:
            typeof updated.totalApproved === 'number'
              ? updated.totalApproved
              : get().approvedAmount,
        });
        await get().fetchClaimDetails(claimId, false);
        await get().fetchClaimsQueue();
        return updated;
      }
      throw new Error(`Cập nhật thông tin hồ sơ thất bại (${res.status})`);
    } catch (err) {
      console.error('Failed to update claim details:', err);
      throw err;
    }
  },

  getDerivedCalculation: (): BenefitCalculationData => {
    const { claim, policy, assessment, approvedAmount } = get();

    const totalClaimed = claim?.totalRequested ?? assessment?.totalRequested ?? 0;
    const annualLimit = policy?.annualTotalLimit || 500000000;
    const annualUsed = policy?.annualUsedAmount || 0;
    const remainingBefore = Math.max(0, annualLimit - annualUsed);

    const isOverridden = claim?.status === 'OVERRIDDEN';
    const isManuallyApproved = claim?.status === 'APPROVED';
    const isClaimRejected = claim?.status === 'REJECTED';
    const isRequestMoreInfo = assessment?.finalRecommendation === 'REQUEST_MORE_INFO';
    const isAssessmentReject = assessment?.finalRecommendation === 'REJECT';
    const step4 = assessment?.steps?.find(s => s.step === 'CALCULATE_BENEFIT');
    const isStep4Pending = step4?.status === 'PENDING';

    // 1. If human assessor manually overrode or approved, the human decision takes absolute precedence!
    if (isOverridden || isManuallyApproved) {
      const finalAmount =
        typeof approvedAmount === 'number'
          ? approvedAmount
          : typeof claim?.totalApproved === 'number'
            ? claim.totalApproved
            : (assessment?.totalPayable ?? 0);

      const eligible = totalClaimed;
      const copay = Math.max(0, eligible - finalAmount);
      const copayPct = eligible > 0 ? Math.round((copay / eligible) * 100) : 0;

      return {
        totalClaimedAmount: totalClaimed,
        eligibleAmount: eligible,
        deductibleApplied: 0,
        copayPercentage: copayPct,
        copayAmount: copay,
        ineligibleItems: [],
        finalPayableAmount: finalAmount,
        annualLimitRemainingBefore: remainingBefore,
        annualLimitRemainingAfter: Math.max(0, remainingBefore - finalAmount),
      };
    }

    // 2. When documents missing, claim rejected, or step 4 pending calculation: return 0 approved
    if (isRequestMoreInfo || isAssessmentReject || isClaimRejected || isStep4Pending) {
      return {
        totalClaimedAmount: totalClaimed,
        eligibleAmount: 0,
        deductibleApplied: 0,
        copayPercentage: 0,
        copayAmount: 0,
        ineligibleItems:
          isAssessmentReject || isClaimRejected
            ? [
                {
                  description: 'Toàn bộ chi phí bị từ chối bồi thường',
                  amount: totalClaimed,
                  reason:
                    assessment?.policyExclusionsMatched?.[0] ||
                    'Không thỏa mãn điều kiện theo quy tắc bảo hiểm',
                },
              ]
            : [],
        finalPayableAmount: 0,
        annualLimitRemainingBefore: remainingBefore,
        annualLimitRemainingAfter: remainingBefore,
      };
    }

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

      const finalAmount =
        typeof approvedAmount === 'number' ? approvedAmount : (assessment.totalPayable ?? 0);

      return {
        totalClaimedAmount: totalClaimed,
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

    const isApprovedOrAssessed =
      assessment?.finalRecommendation === 'APPROVE' || step4?.status === 'PASSED';

    const finalAmount =
      typeof approvedAmount === 'number'
        ? approvedAmount
        : (assessment?.totalPayable ?? (isApprovedOrAssessed ? Math.round(totalClaimed * 0.8) : 0));

    const eligibleAmount =
      assessment?.totalPayable !== undefined && assessment?.totalPayable > 0
        ? totalClaimed
        : isApprovedOrAssessed
          ? Math.round(totalClaimed * 0.8)
          : 0;

    const copayAmount = Math.max(0, eligibleAmount - finalAmount);

    return {
      totalClaimedAmount: totalClaimed,
      eligibleAmount,
      deductibleApplied: 0,
      copayPercentage:
        eligibleAmount > 0
          ? Math.round((copayAmount / eligibleAmount) * 100)
          : isApprovedOrAssessed
            ? 20
            : 0,
      copayAmount,
      ineligibleItems: [],
      finalPayableAmount: finalAmount,
      annualLimitRemainingBefore: remainingBefore,
      annualLimitRemainingAfter: Math.max(0, remainingBefore - finalAmount),
    };
  },
}));
