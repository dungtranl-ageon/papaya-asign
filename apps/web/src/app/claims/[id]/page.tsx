'use client';

import React, { useEffect, use } from 'react';
import Link from 'next/link';
import {
  ArrowLeft,
  Zap,
  Loader2,
  AlertOctagon,
  RefreshCw,
  CheckCircle2,
  HelpCircle,
} from 'lucide-react';
import { useWorkstationStore, useUiStore } from '@/store';

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

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function ClaimWorkstationPage({ params }: PageProps) {
  const resolvedParams = use(params);
  const claimId = resolvedParams.id;

  const {
    claim,
    policy,
    assessment,
    isLoading,
    isAssessing,
    error,
    approvedAmount,
    fetchClaimDetails,
    runMastraAssessment,
    setApprovedAmount,
    updateClaimStatus,
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
              {claim?.patientName || 'Đang nạp hồ sơ...'}
            </span>
            <span className="text-slate-400">•</span>
            <span className="font-mono text-slate-500">
              {claim?.policyNumber || 'Đang nạp hợp đồng...'}
            </span>
          </div>
        </div>

        {/* Fast Case Switcher & Trigger AI Assessment */}
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => runMastraAssessment(claimId)}
            disabled={isAssessing || !claim}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-teal-800 bg-teal-50 hover:bg-teal-100 active:bg-teal-200 border border-teal-200 rounded-xl transition-all disabled:opacity-50 cursor-pointer"
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

          <span className="text-[11px] text-slate-500 font-medium hidden sm:inline">
            Chuyển nhanh ca mẫu:
          </span>
          <Link
            href="/claims/CLM-2026-001"
            className={`px-2.5 py-1 text-[10px] font-bold rounded-lg border transition-all ${
              claimId === 'CLM-2026-001'
                ? 'bg-teal-700 text-white border-teal-700 shadow-2xs'
                : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
            }`}
          >
            TC-01 (Ruột thừa)
          </Link>
          <Link
            href="/claims/CLM-2026-002"
            className={`px-2.5 py-1 text-[10px] font-bold rounded-lg border transition-all ${
              claimId === 'CLM-2026-002'
                ? 'bg-rose-700 text-white border-rose-700 shadow-2xs'
                : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
            }`}
          >
            TC-02 (Thời gian chờ)
          </Link>
          <Link
            href="/claims/CLM-2026-003"
            className={`px-2.5 py-1 text-[10px] font-bold rounded-lg border transition-all ${
              claimId === 'CLM-2026-003'
                ? 'bg-amber-700 text-white border-amber-700 shadow-2xs'
                : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
            }`}
          >
            TC-03 (Thiếu/Mờ CT)
          </Link>
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
        <div className="flex items-center justify-between p-4 bg-rose-50 border border-rose-200 rounded-2xl text-rose-800 text-xs">
          <div className="flex items-center gap-2">
            <AlertOctagon className="h-4 w-4 text-rose-600" />
            <span className="font-semibold">{error}</span>
          </div>
          <button
            onClick={() => fetchClaimDetails(claimId)}
            className="px-3 py-1.5 bg-rose-600 text-white rounded-lg font-bold hover:bg-rose-700 transition-colors flex items-center gap-1 cursor-pointer"
          >
            <RefreshCw className="h-3 w-3" />
            <span>Thử lại</span>
          </button>
        </div>
      ) : claim ? (
        /* DUAL-PANE WORKSTATION GRID */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
          {/* LEFT PANE: Dossier & Document Inspection (55% width -> 7 cols) */}
          <div className="lg:col-span-7 space-y-4">
            {/* 1. Member Policy Card */}
            <MemberPolicyCard claim={claim} policy={policy} />

            {/* 2. Medical Event & Diagnosis Card */}
            <DiagnosisCard
              claim={claim}
              policyExclusions={policy?.exclusions}
              medicalNecessityScore={assessment?.confidenceScore}
            />

            {/* 3. Interactive Document Inspector with High-Fi Canvas */}
            <DocumentInspector claim={claim} />
          </div>

          {/* RIGHT PANE: Copilot Workspace & Financial Engine (45% width -> 5 cols) */}
          <div className="lg:col-span-5 space-y-4">
            {/* 1. Deterministic Mastra Workflow 4-Step Timeline */}
            <ToolExecutionTimeline steps={assessment?.steps} isAssessing={isAssessing} />

            {/* 2. Benefit Calculation Card with Real-time Copay Slider */}
            <BenefitCalculationCard
              calculation={calculation}
              onOpenManualOverride={() => setManualOverrideModalOpen(true)}
              onOpenPolicyBrowser={clauseId => openPolicyDrawer(clauseId)}
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
                    <span className="text-teal-700 flex items-center gap-1 font-extrabold">
                      <Zap className="h-4 w-4" /> Đang Thẩm định AI
                    </span>
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
              await updateClaimStatus('OVERRIDDEN', data.overriddenAmount);
              setManualOverrideModalOpen(false);
            }}
          />
        </>
      )}
    </div>
  );
}
