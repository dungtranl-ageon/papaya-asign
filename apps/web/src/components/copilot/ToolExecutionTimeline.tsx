'use client';

import React from 'react';
import { CheckCircle2, AlertTriangle, AlertCircle, Loader2, Clock } from 'lucide-react';
import { AssessmentStepResult } from '@papaya/shared';

interface ToolExecutionTimelineProps {
  steps?: AssessmentStepResult[];
  isAssessing?: boolean;
}

export function ToolExecutionTimeline({ steps, isAssessing }: ToolExecutionTimelineProps) {
  // If steps exist from live Mastra execution, use them. Otherwise render pipeline in pending state.
  const pipelineTemplate: AssessmentStepResult[] = [
    {
      step: 'VERIFY_DOCUMENT',
      status: isAssessing ? 'PASSED' : 'ACTION_REQUIRED',
      score: undefined,
      message: isAssessing ? 'Đang xác thực chứng từ...' : 'Chờ thẩm định OCR & tính toàn vẹn',
      details: {},
      executedAt: '',
    },
    {
      step: 'LOOKUP_POLICY',
      status: 'ACTION_REQUIRED',
      score: undefined,
      message: 'Chờ tra cứu hiệu lực & thời gian chờ',
      details: {},
      executedAt: '',
    },
    {
      step: 'CHECK_MEDICAL_NECESSITY',
      status: 'ACTION_REQUIRED',
      score: undefined,
      message: 'Chờ đối soát phác đồ Bộ Y Tế',
      details: {},
      executedAt: '',
    },
    {
      step: 'CALCULATE_BENEFIT',
      status: 'ACTION_REQUIRED',
      score: undefined,
      message: 'Chờ chiết tính khấu trừ & đồng chi trả',
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

  const getStatusBadge = (status: string, isCurrentRunning: boolean) => {
    if (isCurrentRunning) {
      return (
        <span className="flex items-center gap-1 text-teal-700 bg-teal-50 px-2 py-0.5 rounded text-[10px] font-bold animate-pulse">
          <Loader2 className="h-3 w-3 animate-spin" /> Đang chạy...
        </span>
      );
    }
    switch (status) {
      case 'PASSED':
        return (
          <span className="flex items-center gap-1 text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded text-[10px] font-bold">
            <CheckCircle2 className="h-3 w-3 text-emerald-600" /> Hoàn tất
          </span>
        );
      case 'ACTION_REQUIRED':
        return (
          <span className="flex items-center gap-1 text-amber-700 bg-amber-50 px-2 py-0.5 rounded text-[10px] font-bold">
            <AlertTriangle className="h-3 w-3 text-amber-600" /> Bổ sung
          </span>
        );
      case 'FAILED':
        return (
          <span className="flex items-center gap-1 text-rose-700 bg-rose-50 px-2 py-0.5 rounded text-[10px] font-bold">
            <AlertCircle className="h-3 w-3 text-rose-600" /> Từ chối
          </span>
        );
      default:
        return (
          <span className="flex items-center gap-1 text-slate-500 bg-slate-100 px-2 py-0.5 rounded text-[10px] font-medium">
            <Clock className="h-3 w-3 text-slate-400" /> Chờ chạy
          </span>
        );
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
        {isAssessing && (
          <span className="text-[11px] text-teal-700 flex items-center gap-1 font-semibold animate-pulse">
            <Loader2 className="h-3 w-3 animate-spin" /> Đang điều phối...
          </span>
        )}
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        {currentSteps.map((step, idx) => {
          const isRunning = Boolean(isAssessing && idx === currentSteps.length - 1);
          return (
            <div
              key={step.step}
              className={`p-2.5 rounded-lg border text-xs flex flex-col justify-between transition-all ${
                step.status === 'PASSED'
                  ? 'bg-emerald-50/60 border-emerald-200 text-emerald-950'
                  : step.status === 'ACTION_REQUIRED'
                    ? 'bg-amber-50/60 border-amber-200 text-amber-950'
                    : step.status === 'FAILED'
                      ? 'bg-rose-50/60 border-rose-200 text-rose-950'
                      : 'bg-slate-50 border-slate-200 text-slate-600'
              }`}
            >
              <div className="flex items-center justify-between mb-1.5">
                <span className="font-bold text-[11px] truncate">{getStepLabel(step.step)}</span>
              </div>
              <div className="mt-1 flex items-center justify-between">
                {getStatusBadge(step.status, isRunning)}
                <span className="text-[9px] font-mono text-slate-500">
                  {step.message ? step.message : `${(idx + 1) * 35}ms`}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
