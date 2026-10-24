'use client';

import React from 'react';
import { CheckCircle2, AlertTriangle, AlertCircle, Loader2, Clock } from 'lucide-react';

export interface StepStatusBadgeProps {
  status: string;
  isCurrentRunning?: boolean;
}

export function StepStatusBadge({ status, isCurrentRunning = false }: StepStatusBadgeProps) {
  return (
    <>
      {isCurrentRunning && (
        <span className="flex items-center gap-1 text-teal-700 bg-teal-50 px-2 py-0.5 rounded text-[10px] font-bold animate-pulse">
          <Loader2 className="h-3 w-3 animate-spin" /> Đang chạy...
        </span>
      )}

      {!isCurrentRunning && status === 'PASSED' && (
        <span className="flex items-center gap-1 text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded text-[10px] font-bold">
          <CheckCircle2 className="h-3 w-3 text-emerald-600" /> Hoàn tất
        </span>
      )}

      {!isCurrentRunning && status === 'ACTION_REQUIRED' && (
        <span className="flex items-center gap-1 text-amber-700 bg-amber-50 px-2 py-0.5 rounded text-[10px] font-bold">
          <AlertTriangle className="h-3 w-3 text-amber-600" /> Cần bổ sung
        </span>
      )}

      {!isCurrentRunning && status === 'FAILED' && (
        <span className="flex items-center gap-1 text-rose-700 bg-rose-50 px-2 py-0.5 rounded text-[10px] font-bold">
          <AlertCircle className="h-3 w-3 text-rose-600" /> Từ chối
        </span>
      )}

      {!isCurrentRunning &&
        status !== 'PASSED' &&
        status !== 'ACTION_REQUIRED' &&
        status !== 'FAILED' && (
          <span className="flex items-center gap-1 text-slate-400 bg-slate-100 px-2 py-0.5 rounded text-[10px] font-medium border border-slate-200/60">
            <Clock className="h-3 w-3 text-slate-400" /> Chưa thực hiện
          </span>
        )}
    </>
  );
}
