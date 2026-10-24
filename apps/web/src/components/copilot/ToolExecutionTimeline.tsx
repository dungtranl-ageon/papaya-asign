'use client';

import React from 'react';
import { Loader2, RefreshCw } from 'lucide-react';
import { StepStatusBadge } from './StepStatusBadge';
import { AssessmentStepResult } from '@papaya/shared';

interface ToolExecutionTimelineProps {
  steps?: AssessmentStepResult[];
  isAssessing?: boolean;
  onReAssess?: () => void;
}

export function ToolExecutionTimeline({
  steps,
  isAssessing,
  onReAssess,
}: ToolExecutionTimelineProps) {
  // If steps exist from live Mastra execution, use them. Otherwise render pipeline in pending state.
  const pipelineTemplate: AssessmentStepResult[] = [
    {
      step: 'VERIFY_DOCUMENT',
      status: isAssessing ? 'PASSED' : 'PENDING',
      score: undefined,
      message: isAssessing ? 'Đang xác thực chứng từ...' : '',
      details: {},
      executedAt: '',
    },
    {
      step: 'LOOKUP_POLICY',
      status: 'PENDING',
      score: undefined,
      message: '',
      details: {},
      executedAt: '',
    },
    {
      step: 'CHECK_MEDICAL_NECESSITY',
      status: 'PENDING',
      score: undefined,
      message: '',
      details: {},
      executedAt: '',
    },
    {
      step: 'CALCULATE_BENEFIT',
      status: 'PENDING',
      score: undefined,
      message: '',
      details: {},
      executedAt: '',
    },
  ];

  const currentSteps = steps && steps.length > 0 ? steps : pipelineTemplate;

  const getStepLabel = (step: string) => {
    switch (step) {
      case 'VERIFY_DOCUMENT':
        return '1. Kiểm tra Chứng từ';
      case 'LOOKUP_POLICY':
        return '2. Quy tắc Hợp đồng';
      case 'CHECK_MEDICAL_NECESSITY':
        return '3. Chỉ định Y khoa';
      case 'CALCULATE_BENEFIT':
        return '4. Chiết tính Quyền lợi';
      default:
        return step;
    }
  };

  return (
    <div className="p-3.5 rounded-xl border border-slate-200 bg-white shadow-2xs">
      <div className="flex items-center justify-between pb-2 mb-2.5 border-b border-slate-100">
        <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
          <span>Tiến trình Thẩm định 4 Bước</span>
          <span className="text-[10px] font-mono text-teal-700 bg-teal-50 px-1.5 py-0.2 rounded border border-teal-200">
            Deterministic Workflow
          </span>
        </span>
        <div className="flex items-center gap-2">
          {isAssessing ? (
            <span className="text-[11px] text-teal-700 flex items-center gap-1 font-semibold animate-pulse">
              <Loader2 className="h-3 w-3 animate-spin" /> Đang điều phối...
            </span>
          ) : onReAssess ? (
            <button
              onClick={onReAssess}
              className="text-[10px] font-semibold text-teal-700 hover:text-teal-800 bg-teal-50 hover:bg-teal-100 border border-teal-200 px-2 py-0.5 rounded flex items-center gap-1 transition-colors cursor-pointer"
              title="Kích hoạt lại quy trình thẩm định 4 bước"
            >
              <RefreshCw className="h-3 w-3" />
              <span>Thẩm định lại</span>
            </button>
          ) : null}
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        {currentSteps.map((step, idx) => {
          const isPending = step.status === 'PENDING' || (!step.status && !isAssessing);
          const isRunning = Boolean(isAssessing && idx === currentSteps.length - 1);
          return (
            <div
              key={step.step}
              className={`p-2.5 rounded-lg border text-xs flex flex-col justify-between transition-all ${
                isPending
                  ? 'bg-slate-50/80 border-slate-200/80 text-slate-400 opacity-60 cursor-not-allowed select-none'
                  : step.status === 'PASSED'
                    ? 'bg-emerald-50/60 border-emerald-200 text-emerald-950'
                    : step.status === 'ACTION_REQUIRED'
                      ? 'bg-amber-50/60 border-amber-200 text-amber-950'
                      : step.status === 'FAILED'
                        ? 'bg-rose-50/60 border-rose-200 text-rose-950'
                        : 'bg-slate-50 border-slate-200 text-slate-400 opacity-60'
              }`}
            >
              <div className="flex items-center justify-between mb-1.5">
                <span
                  className={`font-bold text-[11px] truncate ${
                    isPending ? 'text-slate-400' : 'text-slate-800'
                  }`}
                >
                  {getStepLabel(step.step)}
                </span>
              </div>
              <div className="mt-1 flex items-center justify-between">
                <StepStatusBadge status={step.status} isCurrentRunning={isRunning} />
                <span className="text-[9px] font-mono text-slate-500 truncate ml-1 text-right">
                  {isPending ||
                  (step.step === 'VERIFY_DOCUMENT' && step.status === 'ACTION_REQUIRED')
                    ? ''
                    : step.message || ''}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
