'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { ClaimsQueueView } from '@/components/queue/ClaimsQueueView';
import { useUiStore } from '@/store';

export default function ClaimsQueuePage() {
  const router = useRouter();
  const { setIngestionModalOpen } = useUiStore();

  const handleSelectClaim = (claimId: string) => {
    router.push(`/claims/${claimId}`);
  };

  return (
    <ClaimsQueueView
      onSelectClaim={handleSelectClaim}
      onOpenIngestionModal={() => setIngestionModalOpen(true)}
    />
  );
}
