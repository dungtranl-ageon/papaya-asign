'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import {
  ArrowLeft,
  Zap,
  Loader2,
  AlertOctagon,
  RefreshCw,
  CheckCircle2,
  HelpCircle,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { useWorkstationStore, useUiStore } from '@/store';
import { maskPatientName } from '@papaya/shared';

// Dossier Components
import { MemberPolicyCard } from '@/components/dossier/MemberPolicyCard';
import { DiagnosisCard } from '@/components/dossier/DiagnosisCard';
import { DocumentInspector } from '@/components/dossier/DocumentInspector';

// Copilot Components
import { ToolExecutionTimeline } from '@/components/copilot/ToolExecutionTimeline';
import { BenefitCalculationCard } from '@/components/copilot/BenefitCalculationCard';
import { CopilotChat } from '@/components/copilot/CopilotChat';

// Action Modals
import { ApproveClaimModal } from '@/components/modals/ApproveClaimModal';
import { RejectClaimModal } from '@/components/modals/RejectClaimModal';
import { RequestMoreInfoModal } from '@/components/modals/RequestMoreInfoModal';
import { ManualOverrideModal } from '@/components/modals/ManualOverrideModal';

export default function ClaimWorkstationPage() {
  const router = useRouter();
  const routeParams = useParams();
  const claimId = (routeParams?.id as string) || '';

  const {
    claim,
    policy,
    assessment,
    claimsQueue,
    isLoading,
    isAssessing,
    error,
    approvedAmount,
    fetchClaimsQueue,
    fetchClaimDetails,
    runMastraAssessment,
    setApprovedAmount,
    updateClaimStatus,
    updateClaim,
    getDerivedCalculation,
  } = useWorkstationStore();

  const {
    isApproveModalOpen,
    isRejectModalOpen,
    isRequestInfoModalOpen,
    isManualOverrideModalOpen,
    setApproveModalOpen,
    setRejectModalOpen,
    setRequestInfoModalOpen,
    setManualOverrideModalOpen,
    openPolicyDrawer,
  } = useUiStore();

  useEffect(() => {
    if (claimId) {
      fetchClaimDetails(claimId);
    }
  }, [claimId, fetchClaimDetails]);

  useEffect(() => {
    fetchClaimsQueue();
  }, [fetchClaimsQueue]);

  const currentIndex = claimsQueue.findIndex(c => c.claimId === claimId);
  const prevClaim = currentIndex > 0 ? claimsQueue[currentIndex - 1] : null;
  const nextClaim =
    currentIndex >= 0 && currentIndex < claimsQueue.length - 1
      ? claimsQueue[currentIndex + 1]
      : null;

  const calculation = getDerivedCalculation();

  return (
    <div className="space-y-4">
      {/* Context Sub-Header & Breadcrumb Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-3.5 rounded-2xl border border-slate-200 shadow-2xs">
        <div className="flex items-center gap-3">
          <Link
            href="/claims"
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 bg-slate-50 hover:bg-slate-100 rounded-xl border border-slate-200 transition-colors"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>Quay lại Hàng đợi</span>
          </Link>

          <div className="h-4 w-px bg-slate-200" />

          <div className="flex items-center gap-2 text-xs">
            <span className="font-mono font-bold text-slate-900 text-sm">{claimId}</span>
            <span className="text-slate-400">•</span>
            <span className="font-semibold text-slate-700">
              {claim?.patientName ? maskPatientName(claim.patientName) : 'Đang nạp hồ sơ...'}
            </span>
            <span className="text-slate-400">•</span>
            <span className="font-mono text-slate-500">
              {claim?.policyNumber || 'Đang nạp hợp đồng...'}
            </span>
          </div>
        </div>

        {/* Dynamic Queue Switcher & Trigger AI Assessment */}
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => runMastraAssessment(claimId)}
            disabled={isAssessing || !claim}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-teal-800 bg-teal-50 hover:bg-teal-100 active:bg-teal-200 border border-teal-200 rounded-xl transition-all disabled:opacity-50 cursor-pointer shadow-2xs"
            title="Chạy lại luồng kiểm định tự động 4 bước Mastra"
          >
            {isAssessing ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin text-teal-700" />
            ) : (
              <Zap className="h-3.5 w-3.5 text-teal-600" />
            )}
            <span>{isAssessing ? 'Đang thẩm định...' : 'Thẩm định AI (Mastra)'}</span>
          </button>

          <div className="h-4 w-px bg-slate-200 hidden sm:block" />

          {/* Dynamic Claims Queue Navigation */}
          {claimsQueue.length > 0 && (
            <div className="flex items-center gap-1.5 bg-slate-50 p-1 rounded-xl border border-slate-200 text-xs">
              <button
                type="button"
                onClick={() => prevClaim && router.push(`/claims/${prevClaim.claimId}`)}
                disabled={!prevClaim}
                className="p-1 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-white disabled:opacity-30 disabled:hover:bg-transparent transition-all cursor-pointer disabled:cursor-not-allowed"
                title={
                  prevClaim
                    ? `Hồ sơ trước: ${prevClaim.claimId} (${maskPatientName(prevClaim.patientName)})`
                    : 'Đầu danh sách'
                }
              >
                <ChevronLeft className="h-3.5 w-3.5" />
              </button>

              <div className="relative">
                <select
                  value={claimId}
                  onChange={e => router.push(`/claims/${e.target.value}`)}
                  className="bg-white border border-slate-200/90 hover:border-teal-400 text-slate-800 font-semibold text-[11px] rounded-lg px-2 py-1 focus:outline-none focus:ring-1 focus:ring-teal-500 cursor-pointer max-w-[210px] truncate transition-all"
                  title="Chuyển hồ sơ trong hàng đợi"
                >
                  {claimsQueue.map((item, idx) => (
                    <option key={item.claimId} value={item.claimId}>
                      #{idx + 1} {item.claimId} - {maskPatientName(item.patientName)} ({item.status}
                      )
                    </option>
                  ))}
                </select>
              </div>

              <button
                type="button"
                onClick={() => nextClaim && router.push(`/claims/${nextClaim.claimId}`)}
                disabled={!nextClaim}
                className="p-1 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-white disabled:opacity-30 disabled:hover:bg-transparent transition-all cursor-pointer disabled:cursor-not-allowed"
                title={
                  nextClaim
                    ? `Hồ sơ kế tiếp: ${nextClaim.claimId} (${nextClaim.patientName})`
                    : 'Cuối danh sách'
                }
              >
                <ChevronRight className="h-3.5 w-3.5" />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Loading & Error Handling */}
      {isLoading && !claim ? (
        <div className="flex flex-col items-center justify-center p-16 bg-white rounded-2xl border border-slate-200 shadow-2xs">
          <Loader2 className="h-8 w-8 animate-spin text-teal-600 mb-3" />
          <span className="text-sm font-bold text-slate-700">
            Đang nạp hồ sơ bồi thường {claimId} từ Database...
          </span>
          <span className="text-xs text-slate-400 mt-1">
            Đang đồng bộ điều khoản hợp đồng và lịch sử kiểm định
          </span>
        </div>
      ) : error ? (
        <div className="p-6 bg-white border border-rose-200 rounded-2xl shadow-2xs space-y-3">
          <div className="flex items-center gap-2 text-rose-700 text-sm font-bold">
            <AlertOctagon className="h-5 w-5 text-rose-600" />
            <span>{error}</span>
          </div>
          <p className="text-xs text-slate-500">
            Hồ sơ <strong className="font-mono text-slate-700">{claimId}</strong> chưa tồn tại trong
            cơ sở dữ liệu SQLite hoặc máy chủ chưa sẵn sàng. Bạn có thể thử nạp lại hoặc quay về
            danh sách hàng đợi.
          </p>
          <div className="flex items-center gap-2 pt-1">
            <button
              onClick={() => fetchClaimDetails(claimId)}
              className="px-3.5 py-1.5 bg-teal-700 text-white rounded-xl text-xs font-bold hover:bg-teal-800 transition-colors flex items-center gap-1.5 cursor-pointer shadow-2xs"
            >
              <RefreshCw className="h-3.5 w-3.5" />
              <span>Thử nạp lại</span>
            </button>
            <Link
              href="/claims"
              className="px-3.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold transition-colors flex items-center gap-1.5"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              <span>Quay lại Hàng đợi bồi thường</span>
            </Link>
          </div>
        </div>
      ) : claim ? (
        /* DUAL-PANE WORKSTATION GRID */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
          {/* LEFT PANE: Dossier & Document Inspection (55% width -> 7 cols) */}
          <div className="lg:col-span-7 space-y-4">
            {/* 1. Member Policy Card */}
            <MemberPolicyCard claim={claim} policy={policy} />

            {/* 2. Benefit Calculation Card with Real-time Copay Slider */}
            <BenefitCalculationCard
              calculation={calculation}
              annualLimitTotal={policy?.annualTotalLimit || 500000000}
              onOpenManualOverride={() => setManualOverrideModalOpen(true)}
              onOpenPolicyBrowser={clauseId => openPolicyDrawer(clauseId)}
              onUpdateClaimedAmount={async (newAmount: number) => {
                await updateClaim(claimId, { totalRequested: newAmount });
              }}
              onApplyCopay={async (copayPct: number, finalAmount: number) => {
                setApprovedAmount(finalAmount);
                await updateClaimStatus(
                  'OVERRIDDEN',
                  finalAmount,
                  `Chuyên viên áp dụng tỷ lệ đồng chi trả Copay điều chỉnh: ${copayPct}%`,
                );
              }}
            />
            {/* 3. Interactive Document Inspector with High-Fi Canvas */}
            <DocumentInspector claim={claim} missingTypes={assessment?.missingDocuments} />
          </div>

          {/* RIGHT PANE: Copilot Workspace & Financial Engine (45% width -> 5 cols) */}
          <div className="lg:col-span-5 space-y-4">
            {/* 2. Medical Event & Diagnosis Card */}
            <DiagnosisCard
              claim={claim}
              policyExclusions={policy?.exclusions}
              medicalNecessityScore={assessment?.confidenceScore}
            />
            {/* 1. Deterministic Mastra Workflow 4-Step Timeline */}
            <ToolExecutionTimeline
              steps={assessment?.steps}
              isAssessing={isAssessing}
              onReAssess={() => runMastraAssessment(claimId)}
            />

            {/* 3. Copilot AI Interactive Grounded RAG Chat */}
            <CopilotChat
              claimId={claimId}
              patientName={claim.patientName}
              policyNumber={claim.policyNumber}
              onOpenPolicyBrowser={clauseId => openPolicyDrawer(clauseId)}
            />

            {/* 4. Sticky Action Bar for Assessor Final Decision */}
            <div className="sticky bottom-4 z-20 p-4 rounded-2xl bg-white/95 backdrop-blur-md border border-slate-200/90 shadow-xl flex flex-wrap items-center justify-between gap-3">
              <div className="text-xs">
                <span className="text-slate-500 block text-[10px]">Quyết định thẩm định</span>
                <span className="font-bold text-slate-800">
                  {claim.status === 'APPROVED' ? (
                    <span className="text-emerald-700 flex items-center gap-1 font-extrabold">
                      <CheckCircle2 className="h-4 w-4" /> Đã Phê duyệt Chi trả
                    </span>
                  ) : claim.status === 'REJECTED' ? (
                    <span className="text-rose-700 flex items-center gap-1 font-extrabold">
                      <AlertOctagon className="h-4 w-4" /> Đã Từ chối Bồi thường
                    </span>
                  ) : claim.status === 'PENDING_MORE_INFO' ? (
                    <span className="text-amber-700 flex items-center gap-1 font-extrabold">
                      <HelpCircle className="h-4 w-4" /> Đang Chờ Bổ sung
                    </span>
                  ) : (
                    <button
                      onClick={() => runMastraAssessment(claimId)}
                      disabled={isAssessing}
                      className="text-teal-700 hover:text-teal-800 flex items-center gap-1 font-extrabold cursor-pointer group"
                      title="Bấm để kích hoạt AI thẩm định lại hồ sơ"
                    >
                      <Zap
                        className={`h-4 w-4 ${isAssessing ? 'animate-bounce text-amber-500' : 'group-hover:scale-110 transition-transform'}`}
                      />
                      <span>{isAssessing ? 'Đang Thẩm định AI...' : 'Đang Thẩm định AI'}</span>
                    </button>
                  )}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setRejectModalOpen(true)}
                  className="px-3 py-2 text-xs font-bold text-rose-700 bg-rose-50 hover:bg-rose-100 active:bg-rose-200 border border-rose-200 rounded-xl transition-all cursor-pointer"
                  title="Phím tắt: Cmd + Shift + R"
                >
                  Từ chối
                </button>

                <button
                  onClick={() => setRequestInfoModalOpen(true)}
                  className="px-3 py-2 text-xs font-bold text-amber-700 bg-amber-50 hover:bg-amber-100 active:bg-amber-200 border border-amber-200 rounded-xl transition-all cursor-pointer"
                  title="Phím tắt: Cmd + Shift + I"
                >
                  Yêu cầu Bổ sung
                </button>

                <button
                  onClick={() => setApproveModalOpen(true)}
                  className="px-4 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 rounded-xl shadow-xs transition-all flex items-center gap-1.5 cursor-pointer"
                  title="Phím tắt: Cmd + Enter"
                >
                  <CheckCircle2 className="h-4 w-4" />
                  <span>Phê duyệt (Cmd+Enter)</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : null}

      {/* Action Modals */}
      {claim && (
        <>
          <ApproveClaimModal
            isOpen={isApproveModalOpen}
            onClose={() => setApproveModalOpen(false)}
            claimId={claimId}
            suggestedAmount={calculation.finalPayableAmount || approvedAmount}
            insuredName={claim.patientName}
            onConfirm={async data => {
              await updateClaimStatus('APPROVED', data.approvedAmount);
              setApproveModalOpen(false);
            }}
          />

          <RejectClaimModal
            isOpen={isRejectModalOpen}
            onClose={() => setRejectModalOpen(false)}
            claimId={claimId}
            insuredName={claim.patientName}
            onConfirm={async () => {
              await updateClaimStatus('REJECTED', 0);
              setRejectModalOpen(false);
            }}
          />

          <RequestMoreInfoModal
            isOpen={isRequestInfoModalOpen}
            onClose={() => setRequestInfoModalOpen(false)}
            claimId={claimId}
            insuredName={claim.patientName}
            onConfirm={async () => {
              await updateClaimStatus('PENDING_MORE_INFO');
              setRequestInfoModalOpen(false);
            }}
          />

          <ManualOverrideModal
            isOpen={isManualOverrideModalOpen}
            onClose={() => setManualOverrideModalOpen(false)}
            claimId={claimId}
            originalAmount={calculation.eligibleAmount - calculation.copayAmount}
            onConfirm={async data => {
              setApprovedAmount(data.overriddenAmount);
              await updateClaimStatus(
                'OVERRIDDEN',
                data.overriddenAmount,
                data.auditNote || data.overrideReason,
              );
              setManualOverrideModalOpen(false);
            }}
          />
        </>
      )}
    </div>
  );
}
