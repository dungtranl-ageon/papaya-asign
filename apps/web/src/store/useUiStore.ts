import { create } from 'zustand';

interface UiState {
  // Drawers
  isPolicyDrawerOpen: boolean;
  isAuditDrawerOpen: boolean;
  targetClauseId: string;

  // Modals
  isApproveModalOpen: boolean;
  isRejectModalOpen: boolean;
  isRequestInfoModalOpen: boolean;
  isManualOverrideModalOpen: boolean;
  isIngestionModalOpen: boolean;

  // Actions
  openPolicyDrawer: (clauseId?: string) => void;
  closePolicyDrawer: () => void;

  openAuditDrawer: () => void;
  closeAuditDrawer: () => void;

  setApproveModalOpen: (open: boolean) => void;
  setRejectModalOpen: (open: boolean) => void;
  setRequestInfoModalOpen: (open: boolean) => void;
  setManualOverrideModalOpen: (open: boolean) => void;
  setIngestionModalOpen: (open: boolean) => void;

  closeAllOverlays: () => void;
}

export const useUiStore = create<UiState>(set => ({
  // Drawers initial
  isPolicyDrawerOpen: false,
  isAuditDrawerOpen: false,
  targetClauseId: 'POLICY-SEC-14.3',

  // Modals initial
  isApproveModalOpen: false,
  isRejectModalOpen: false,
  isRequestInfoModalOpen: false,
  isManualOverrideModalOpen: false,
  isIngestionModalOpen: false,

  // Actions
  openPolicyDrawer: (clauseId?: string) => {
    set({
      isPolicyDrawerOpen: true,
      targetClauseId: clauseId || 'POLICY-SEC-14.3',
    });
  },
  closePolicyDrawer: () => set({ isPolicyDrawerOpen: false }),

  openAuditDrawer: () => set({ isAuditDrawerOpen: true }),
  closeAuditDrawer: () => set({ isAuditDrawerOpen: false }),

  setApproveModalOpen: (open: boolean) => set({ isApproveModalOpen: open }),
  setRejectModalOpen: (open: boolean) => set({ isRejectModalOpen: open }),
  setRequestInfoModalOpen: (open: boolean) => set({ isRequestInfoModalOpen: open }),
  setManualOverrideModalOpen: (open: boolean) => set({ isManualOverrideModalOpen: open }),
  setIngestionModalOpen: (open: boolean) => set({ isIngestionModalOpen: open }),

  closeAllOverlays: () =>
    set({
      isPolicyDrawerOpen: false,
      isAuditDrawerOpen: false,
      isApproveModalOpen: false,
      isRejectModalOpen: false,
      isRequestInfoModalOpen: false,
      isManualOverrideModalOpen: false,
      isIngestionModalOpen: false,
    }),
}));
