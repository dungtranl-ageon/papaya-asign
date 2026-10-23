'use client';

import React, { useState, useEffect } from 'react';
import { CheckCircle2, AlertOctagon, HelpCircle, ArrowLeft, Zap } from 'lucide-react';
import { Claim, ClaimStatus } from '@papaya/shared';

// Modular Component Imports
import { GlobalHeader } from './navigation/GlobalHeader';
import { MemberPolicyCard } from './dossier/MemberPolicyCard';
import { DiagnosisCard } from './dossier/DiagnosisCard';
import { DocumentInspector } from './dossier/DocumentInspector';
import { ToolExecutionTimeline } from './copilot/ToolExecutionTimeline';
import { BenefitCalculationCard, BenefitCalculationData } from './copilot/BenefitCalculationCard';
import { CopilotChat } from './copilot/CopilotChat';
import { ClaimsQueueView } from './queue/ClaimsQueueView';

// Action Modals
import { ApproveClaimModal } from './modals/ApproveClaimModal';
import { RejectClaimModal } from './modals/RejectClaimModal';
import { RequestMoreInfoModal } from './modals/RequestMoreInfoModal';
import { ManualOverrideModal } from './modals/ManualOverrideModal';
import { ClaimIngestionModal } from './modals/ClaimIngestionModal';

// Slide-Over Drawers
import { PolicyBrowserDrawer } from './drawers/PolicyBrowserDrawer';
import { AuditTrailDrawer } from './drawers/AuditTrailDrawer';

export function WorkstationLayout() {
  // Navigation View State ('queue' | 'workstation')
  const [currentView, setCurrentView] = useState<'queue' | 'workstation'>('workstation');
  const [activeClaimId, setActiveClaimId] = useState<string>('CLM-2026-03891');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Claim Status & Financial State
  const [claimStatus, setClaimStatus] = useState<ClaimStatus>('ASSESSING');
  const [approvedAmount, setApprovedAmount] = useState<number>(13200000);

  // Modals Visibility
  const [isApproveOpen, setIsApproveOpen] = useState(false);
  const [isRejectOpen, setIsRejectOpen] = useState(false);
  const [isRequestInfoOpen, setIsRequestInfoOpen] = useState(false);
  const [isManualOverrideOpen, setIsManualOverrideOpen] = useState(false);
  const [isIngestionOpen, setIsIngestionOpen] = useState(false);

  // Drawers Visibility
  const [isPolicyBrowserOpen, setIsPolicyBrowserOpen] = useState(false);
  const [isAuditTrailOpen, setIsAuditTrailOpen] = useState(false);
  const [targetClauseId, setTargetClauseId] = useState<string>('POLICY-SEC-14.3');

  // Active Claim Mock Data (Reflects TC-01, TC-02, TC-03 conforming to Claim schema)
  const isTC02 = activeClaimId === 'CLM-2026-04102';
  const isTC03 = activeClaimId === 'CLM-2026-05230';

  const currentClaim: Claim = {
    claimId: activeClaimId,
    policyNumber: isTC02 ? 'POL-2026-1029' : isTC03 ? 'POL-2025-4421' : 'POL-2024-8891',
    patientName: isTC02 ? 'Trần Thị B' : isTC03 ? 'Lê Văn C' : 'Nguyễn Văn A',
    nationalId: isTC02 ? '079185009988' : isTC03 ? '079080001122' : '079090012345',
    hospitalName: isTC02
      ? 'Bệnh viện Chợ Rẫy TP.HCM'
      : isTC03
        ? 'Bệnh viện Đa khoa Quốc tế Vinmec'
        : 'Bệnh viện FV (Pháp Việt)',
    admissionDate: isTC02
      ? '2026-01-20T08:00:00Z'
      : isTC03
        ? '2026-03-01T09:00:00Z'
        : '2026-03-10T08:30:00Z',
    dischargeDate: isTC02
      ? '2026-01-24T12:00:00Z'
      : isTC03
        ? '2026-03-02T16:00:00Z'
        : '2026-03-13T14:00:00Z',
    diagnosisIcd10: isTC02 ? 'K29.7' : isTC03 ? 'S82.1' : 'K35.8',
    diagnosisDescription: isTC02
      ? 'Viêm dạ dày mạn tính không đặc hiệu'
      : isTC03
        ? 'Gãy đầu trên xương chày do tai nạn sinh hoạt'
        : 'Viêm ruột thừa cấp vỡ mủ có viêm phúc mạc cục bộ',
    status: claimStatus,
    totalRequested: isTC02 ? 12000000 : isTC03 ? 25000000 : 18500000,
    items: [
      {
        itemId: 'ITM-01',
        description: isTC02
          ? 'Nội soi dạ dày & điều trị kháng viêm'
          : isTC03
            ? 'Phẫu thuật kết hợp xương chày'
            : 'Phẫu thuật nội soi cắt ruột thừa cấp',
        category: 'SURGERY',
        amountRequested: isTC02 ? 10000000 : isTC03 ? 20000000 : 12000000,
      },
      {
        itemId: 'ITM-02',
        description: 'Tiền phòng nằm viện tiêu chuẩn',
        category: 'INPATIENT',
        amountRequested: isTC02 ? 2000000 : isTC03 ? 5000000 : 4500000,
      },
      {
        itemId: 'ITM-03',
        description: 'Thực phẩm chức năng tăng cường men gan Hepa-Care',
        category: 'MEDICATION',
        amountRequested: 2000000,
      },
    ],
    documents: [
      {
        docId: 'DOC-01',
        docType: 'HOSPITAL_DISCHARGE',
        fileName: isTC02
          ? 'giay_ra_vien_cho_ray.pdf'
          : isTC03
            ? 'giay_ra_vien_vinmec.pdf'
            : 'giay_ra_vien_nguyen_van_a.pdf',
        uploadedAt: '2026-03-13T09:00:00Z',
        status: 'VALID',
      },
      {
        docId: 'DOC-02',
        docType: 'DETAILED_INVOICE',
        fileName: isTC02
          ? 'bang_ke_cho_ray.pdf'
          : isTC03
            ? 'bang_ke_vinmec_bi_mo.pdf'
            : 'bang_ke_chi_phi_fv.pdf',
        uploadedAt: '2026-03-13T09:00:00Z',
        status: isTC03 ? 'INVALID' : 'VALID',
      },
      {
        docId: 'DOC-03',
        docType: 'VAT_INVOICE',
        fileName: isTC02
          ? 'hoa_don_vat_cho_ray.pdf'
          : isTC03
            ? 'chua_nop_hoa_don.pdf'
            : 'hoa_don_vat_003891.pdf',
        uploadedAt: '2026-03-13T09:00:00Z',
        status: isTC03 ? 'REQUIRES_REVIEW' : 'VALID',
      },
    ],
    createdAt: '2026-03-13T10:00:00Z',
    updatedAt: '2026-03-13T10:00:00Z',
  };

  const currentCalculation: BenefitCalculationData = {
    totalClaimedAmount: isTC02 ? 12000000 : isTC03 ? 25000000 : 18500000,
    eligibleAmount: isTC02 ? 0 : isTC03 ? 20000000 : 16500000,
    deductibleApplied: 0,
    copayPercentage: isTC02 ? 0 : 20,
    copayAmount: isTC02 ? 0 : isTC03 ? 4000000 : 3300000,
    ineligibleItems: isTC02
      ? [
          {
            description: 'Toàn bộ chi phí điều trị trong thời gian chờ 30 ngày',
            amount: 12000000,
            reason: 'Bệnh thông thường phát sinh trong 30 ngày đầu theo Điều 4.2',
          },
        ]
      : isTC03
        ? [
            {
              description: 'Khoản chi phí chưa có chứng từ hóa đơn VAT đối soát',
              amount: 5000000,
              reason: 'Thiếu hóa đơn gốc theo Điều 16.1',
            },
          ]
        : [
            {
              description: 'Thực phẩm chức năng tăng cường men gan Hepa-Care',
              amount: 2000000,
              reason: 'Loại trừ theo Quy tắc Điều 14.3',
            },
          ],
    finalPayableAmount: isTC02 ? 0 : isTC03 ? 0 : approvedAmount,
    annualLimitRemainingBefore: isTC02 ? 100000000 : isTC03 ? 85000000 : 80000000,
    annualLimitRemainingAfter: isTC02 ? 100000000 : isTC03 ? 85000000 : 80000000 - approvedAmount,
  };

  // Global Keyboard Shortcuts Engine
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const isCmdOrCtrl = e.metaKey || e.ctrlKey;

      // Close all modals / drawers on Escape
      if (e.key === 'Escape') {
        setIsApproveOpen(false);
        setIsRejectOpen(false);
        setIsRequestInfoOpen(false);
        setIsManualOverrideOpen(false);
        setIsIngestionOpen(false);
        setIsPolicyBrowserOpen(false);
        setIsAuditTrailOpen(false);
        return;
      }

      // Cmd + N: Open New Claim Modal
      if (isCmdOrCtrl && e.key.toLowerCase() === 'n') {
        e.preventDefault();
        setIsIngestionOpen(true);
        return;
      }

      // When in Workstation view:
      if (currentView === 'workstation') {
        // Cmd + Shift + R: Reject Modal
        if (isCmdOrCtrl && e.shiftKey && e.key.toLowerCase() === 'r') {
          e.preventDefault();
          setIsRejectOpen(true);
          return;
        }

        // Cmd + Shift + I: Request Info Modal
        if (isCmdOrCtrl && e.shiftKey && e.key.toLowerCase() === 'i') {
          e.preventDefault();
          setIsRequestInfoOpen(true);
          return;
        }

        // Cmd + Enter: Approve Modal
        if (isCmdOrCtrl && e.key === 'Enter') {
          e.preventDefault();
          setIsApproveOpen(true);
          return;
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentView]);

  const handleSelectClaim = (claimId: string) => {
    setActiveClaimId(claimId);
    setClaimStatus('ASSESSING');
    setCurrentView('workstation');
  };

  const handleOpenPolicyClause = (clauseId: string) => {
    setTargetClauseId(clauseId);
    setIsPolicyBrowserOpen(true);
  };

  return (
    <div className="min-h-screen bg-slate-100/70 text-slate-800 flex flex-col font-sans">
      {/* Top Global Navigation Bar */}
      <GlobalHeader
        currentView={currentView}
        onViewChange={view => setCurrentView(view)}
        activeClaimId={activeClaimId}
        onOpenNewClaimModal={() => setIsIngestionOpen(true)}
        onOpenPolicyDrawer={() => setIsPolicyBrowserOpen(true)}
        onOpenAuditDrawer={() => setIsAuditTrailOpen(true)}
        onOpenShortcutHelp={() =>
          alert(
            'Phím tắt: Cmd+Enter (Duyệt), Cmd+Shift+R (Từ chối), Cmd+Shift+I (Bổ sung), Cmd+N (Hồ sơ mới), Esc (Đóng modal)',
          )
        }
        onSearchClick={() => {}}
        searchQuery={searchQuery}
        onSearchChange={q => setSearchQuery(q)}
      />

      {/* Main Body Area */}
      <main className="flex-1 max-w-[1720px] w-full mx-auto p-4 sm:p-6">
        {currentView === 'queue' ? (
          /* SCREEN 1: Claims Queue View */
          <ClaimsQueueView
            onSelectClaim={handleSelectClaim}
            onOpenIngestionModal={() => setIsIngestionOpen(true)}
          />
        ) : (
          /* SCREEN 2: Dual-Pane Workstation Copilot */
          <div className="space-y-4">
            {/* Context Sub-Header & Breadcrumb Bar */}
            <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-3.5 rounded-2xl border border-slate-200 shadow-2xs">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setCurrentView('queue')}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 bg-slate-50 hover:bg-slate-100 rounded-xl border border-slate-200 transition-colors"
                >
                  <ArrowLeft className="h-3.5 w-3.5" />
                  <span>Quay lại Hàng đợi</span>
                </button>

                <div className="h-4 w-px bg-slate-200" />

                <div className="flex items-center gap-2 text-xs">
                  <span className="font-mono font-bold text-slate-900 text-sm">
                    {activeClaimId}
                  </span>
                  <span className="text-slate-400">•</span>
                  <span className="font-semibold text-slate-700">{currentClaim.patientName}</span>
                  <span className="text-slate-400">•</span>
                  <span className="font-mono text-slate-500">{currentClaim.policyNumber}</span>
                </div>
              </div>

              {/* Fast Case Switcher */}
              <div className="flex items-center gap-2">
                <span className="text-[11px] text-slate-500 font-medium">Chuyển nhanh ca mẫu:</span>
                <button
                  onClick={() => handleSelectClaim('CLM-2026-03891')}
                  className={`px-2.5 py-1 text-[10px] font-bold rounded-lg border transition-all ${
                    activeClaimId === 'CLM-2026-03891'
                      ? 'bg-teal-700 text-white border-teal-700 shadow-2xs'
                      : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  TC-01 (Ruột thừa)
                </button>
                <button
                  onClick={() => handleSelectClaim('CLM-2026-04102')}
                  className={`px-2.5 py-1 text-[10px] font-bold rounded-lg border transition-all ${
                    activeClaimId === 'CLM-2026-04102'
                      ? 'bg-rose-700 text-white border-rose-700 shadow-2xs'
                      : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  TC-02 (Thời gian chờ)
                </button>
                <button
                  onClick={() => handleSelectClaim('CLM-2026-05230')}
                  className={`px-2.5 py-1 text-[10px] font-bold rounded-lg border transition-all ${
                    activeClaimId === 'CLM-2026-05230'
                      ? 'bg-amber-700 text-white border-amber-700 shadow-2xs'
                      : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  TC-03 (Thiếu/Mờ CT)
                </button>
              </div>
            </div>

            {/* DUAL-PANE WORKSTATION GRID */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
              {/* LEFT PANE: Dossier & Document Inspection (55% width -> 7 cols) */}
              <div className="lg:col-span-7 space-y-4">
                {/* 1. Member Policy Card */}
                <MemberPolicyCard claim={currentClaim} />

                {/* 2. Medical Event & Diagnosis Card */}
                <DiagnosisCard claim={currentClaim} />

                {/* 3. Interactive Document Inspector with High-Fi Canvas */}
                <DocumentInspector claim={currentClaim} />
              </div>

              {/* RIGHT PANE: Copilot Workspace & Financial Engine (45% width -> 5 cols) */}
              <div className="lg:col-span-5 space-y-4">
                {/* 1. Deterministic Mastra Workflow 4-Step Timeline */}
                <ToolExecutionTimeline />

                {/* 2. Benefit Calculation Card with Real-time Copay Slider */}
                <BenefitCalculationCard
                  calculation={currentCalculation}
                  onOpenManualOverride={() => setIsManualOverrideOpen(true)}
                  onOpenPolicyBrowser={handleOpenPolicyClause}
                />

                {/* 3. Copilot AI Interactive Grounded RAG Chat */}
                <CopilotChat claimId={activeClaimId} onOpenPolicyBrowser={handleOpenPolicyClause} />

                {/* 4. Sticky Action Bar for Assessor Final Decision */}
                <div className="sticky bottom-4 z-20 p-4 rounded-2xl bg-white/95 backdrop-blur-md border border-slate-200/90 shadow-xl flex flex-wrap items-center justify-between gap-3">
                  <div className="text-xs">
                    <span className="text-slate-500 block text-[10px]">Quyết định thẩm định</span>
                    <span className="font-bold text-slate-800">
                      {claimStatus === 'APPROVED' ? (
                        <span className="text-emerald-700 flex items-center gap-1 font-extrabold">
                          <CheckCircle2 className="h-4 w-4" /> Đã Phê duyệt Chi trả
                        </span>
                      ) : claimStatus === 'REJECTED' ? (
                        <span className="text-rose-700 flex items-center gap-1 font-extrabold">
                          <AlertOctagon className="h-4 w-4" /> Đã Từ chối Bồi thường
                        </span>
                      ) : claimStatus === 'PENDING_MORE_INFO' ? (
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
                      onClick={() => setIsRejectOpen(true)}
                      className="px-3 py-2 text-xs font-bold text-rose-700 bg-rose-50 hover:bg-rose-100 active:bg-rose-200 border border-rose-200 rounded-xl transition-all"
                      title="Phím tắt: Cmd + Shift + R"
                    >
                      Từ chối
                    </button>

                    <button
                      onClick={() => setIsRequestInfoOpen(true)}
                      className="px-3 py-2 text-xs font-bold text-amber-700 bg-amber-50 hover:bg-amber-100 active:bg-amber-200 border border-amber-200 rounded-xl transition-all"
                      title="Phím tắt: Cmd + Shift + I"
                    >
                      Yêu cầu Bổ sung
                    </button>

                    <button
                      onClick={() => setIsApproveOpen(true)}
                      className="px-4 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 rounded-xl shadow-xs transition-all flex items-center gap-1.5"
                      title="Phím tắt: Cmd + Enter"
                    >
                      <CheckCircle2 className="h-4 w-4" />
                      <span>Phê duyệt (Cmd+Enter)</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* MODAL A: Approve Claim */}
      <ApproveClaimModal
        isOpen={isApproveOpen}
        onClose={() => setIsApproveOpen(false)}
        claimId={activeClaimId}
        suggestedAmount={approvedAmount}
        insuredName={currentClaim.patientName}
        onConfirm={data => {
          setClaimStatus('APPROVED');
          alert(
            `Đã phê duyệt thành công hồ sơ ${activeClaimId} với số tiền ${new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(data.approvedAmount)}!`,
          );
        }}
      />

      {/* MODAL B: Reject Claim */}
      <RejectClaimModal
        isOpen={isRejectOpen}
        onClose={() => setIsRejectOpen(false)}
        claimId={activeClaimId}
        insuredName={currentClaim.patientName}
        onConfirm={data => {
          setClaimStatus('REJECTED');
          alert(
            `Đã từ chối hồ sơ ${activeClaimId}. Lý do: ${data.primaryReason}. Thư thông báo đã được gửi đến khách hàng.`,
          );
        }}
      />

      {/* MODAL C: Request More Info */}
      <RequestMoreInfoModal
        isOpen={isRequestInfoOpen}
        onClose={() => setIsRequestInfoOpen(false)}
        claimId={activeClaimId}
        insuredName={currentClaim.patientName}
        onConfirm={data => {
          setClaimStatus('PENDING_MORE_INFO');
          alert(
            `Đã gửi yêu cầu bổ sung ${data.requestedDocuments.length} chứng từ tới khách hàng kèm Magic Link (thời hạn ${data.deadlineDays} ngày).`,
          );
        }}
      />

      {/* MODAL D: Manual Override */}
      <ManualOverrideModal
        isOpen={isManualOverrideOpen}
        onClose={() => setIsManualOverrideOpen(false)}
        claimId={activeClaimId}
        originalAmount={13200000}
        onConfirm={data => {
          setApprovedAmount(data.overriddenAmount);
          alert(
            `Đã ghi đè số tiền phê duyệt thành ${new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(data.overriddenAmount)} và lưu vào Audit Trail.`,
          );
        }}
      />

      {/* MODAL E: Ingestion New Claim */}
      <ClaimIngestionModal
        isOpen={isIngestionOpen}
        onClose={() => setIsIngestionOpen(false)}
        onSubmit={newClaim => {
          setActiveClaimId(newClaim.id);
          setClaimStatus('ASSESSING');
          setCurrentView('workstation');
          alert(`Đã tiếp nhận hồ sơ mới ${newClaim.id} và kích hoạt tự động thẩm định AI!`);
        }}
      />

      {/* SLIDE-OVER DRAWER 1: Policy Browser */}
      <PolicyBrowserDrawer
        isOpen={isPolicyBrowserOpen}
        onClose={() => setIsPolicyBrowserOpen(false)}
        initialClauseId={targetClauseId}
      />

      {/* SLIDE-OVER DRAWER 2: Audit Trail */}
      <AuditTrailDrawer
        isOpen={isAuditTrailOpen}
        onClose={() => setIsAuditTrailOpen(false)}
        claimId={activeClaimId}
      />
    </div>
  );
}
