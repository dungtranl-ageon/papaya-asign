'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useUiStore, useWorkstationStore } from '@/store';
import { PolicyBrowserDrawer } from '@/components/drawers/PolicyBrowserDrawer';
import { AuditTrailDrawer } from '@/components/drawers/AuditTrailDrawer';
import { ClaimIngestionModal } from '@/components/modals/ClaimIngestionModal';

export function GlobalOverlays() {
  const router = useRouter();

  const {
    isPolicyDrawerOpen,
    closePolicyDrawer,
    targetClauseId,
    isAuditDrawerOpen,
    closeAuditDrawer,
    isIngestionModalOpen,
    setIngestionModalOpen,
    setApproveModalOpen,
    setRejectModalOpen,
    setRequestInfoModalOpen,
    closeAllOverlays,
  } = useUiStore();

  const { activeClaimId, claim, fetchClaimDetails } = useWorkstationStore();

  // Global Keyboard Shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const isCmdOrCtrl = e.metaKey || e.ctrlKey;

      if (e.key === 'Escape') {
        closeAllOverlays();
        return;
      }

      // Cmd + N: Ingest New Claim
      if (isCmdOrCtrl && e.key.toLowerCase() === 'n') {
        e.preventDefault();
        setIngestionModalOpen(true);
        return;
      }

      // Workstation shortcuts (only when viewing a claim)
      if (activeClaimId) {
        if (isCmdOrCtrl && e.key === 'Enter') {
          e.preventDefault();
          setApproveModalOpen(true);
          return;
        }

        if (isCmdOrCtrl && e.shiftKey && e.key.toLowerCase() === 'r') {
          e.preventDefault();
          setRejectModalOpen(true);
          return;
        }

        if (isCmdOrCtrl && e.shiftKey && e.key.toLowerCase() === 'i') {
          e.preventDefault();
          setRequestInfoModalOpen(true);
          return;
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [
    activeClaimId,
    closeAllOverlays,
    setIngestionModalOpen,
    setApproveModalOpen,
    setRejectModalOpen,
    setRequestInfoModalOpen,
  ]);

  return (
    <>
      {/* Sổ tay quy tắc bảo hiểm */}
      <PolicyBrowserDrawer
        isOpen={isPolicyDrawerOpen}
        onClose={closePolicyDrawer}
        initialClauseId={targetClauseId}
        policyNumber={claim?.policyNumber}
      />

      {/* Nhật ký kiểm toán bất biến */}
      <AuditTrailDrawer
        isOpen={isAuditDrawerOpen}
        onClose={closeAuditDrawer}
        claimId={activeClaimId || ''}
      />

      {/* Tiếp nhận hồ sơ mới */}
      <ClaimIngestionModal
        isOpen={isIngestionModalOpen}
        onClose={() => setIngestionModalOpen(false)}
        onSubmit={async newClaim => {
          await fetchClaimDetails(newClaim.id);
          router.push(`/claims/${newClaim.id}`);
        }}
      />
    </>
  );
}
