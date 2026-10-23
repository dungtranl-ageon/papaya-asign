'use client';

import React from 'react';
import { User, CheckCircle2 } from 'lucide-react';
import { Claim } from '@papaya/shared';

interface MemberPolicyCardProps {
  claim: Claim;
}

export function MemberPolicyCard({ claim }: MemberPolicyCardProps) {
  // Mock annual limit calculations based on policy
  const annualLimit = 500000000; // 500M VND
  const usedAmount = 75000000; // 75M VND previously used
  const remainingLimit = annualLimit - usedAmount - claim.totalRequested;
  const usagePercentage = Math.round(((usedAmount + claim.totalRequested) / annualLimit) * 100);

  return (
    <div className="p-4 rounded-xl border border-slate-200 bg-white shadow-2xs">
      <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-lg bg-teal-50 text-teal-700">
            <User className="h-4 w-4" />
          </div>
          <div>
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
              Người được Bảo hiểm
            </span>
            <h3 className="font-bold text-slate-900 text-sm">{claim.patientName}</h3>
          </div>
        </div>
        <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1">
          <CheckCircle2 className="h-3.5 w-3.5" />
          Hợp đồng Hiệu lực
        </span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs mb-3.5">
        <div>
          <span className="text-slate-500 block text-[11px]">Số Hợp đồng:</span>
          <span className="font-semibold text-slate-800 font-mono">{claim.policyNumber}</span>
        </div>
        <div>
          <span className="text-slate-500 block text-[11px]">CCCD / Định danh:</span>
          <span className="font-semibold text-slate-800 font-mono">{claim.nationalId}</span>
        </div>
        <div>
          <span className="text-slate-500 block text-[11px]">Gói quyền lợi:</span>
          <span className="font-semibold text-teal-700">Healthcare Gold Plus</span>
        </div>
        <div>
          <span className="text-slate-500 block text-[11px]">Thời gian chờ:</span>
          <span className="font-semibold text-emerald-600">Đã qua 365 ngày (Đạt)</span>
        </div>
      </div>

      {/* Annual Limit Progress Bar */}
      <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200">
        <div className="flex justify-between items-center text-xs mb-1.5">
          <span className="text-slate-600 font-medium">Hạn mức năm còn lại:</span>
          <span className="font-bold text-teal-800">
            {remainingLimit.toLocaleString()} VND / {annualLimit.toLocaleString()} VND
          </span>
        </div>
        <div className="h-2 w-full bg-slate-200 rounded-full overflow-hidden">
          <div
            className="h-full bg-teal-600 rounded-full transition-all duration-500"
            style={{ width: `${Math.min(usagePercentage, 100)}%` }}
          />
        </div>
        <div className="flex justify-between text-[10px] text-slate-500 mt-1">
          <span>
            Đã sử dụng: {(usedAmount + claim.totalRequested).toLocaleString()} VND (
            {usagePercentage}%)
          </span>
          <span>Dư khả dụng: {remainingLimit.toLocaleString()} VND</span>
        </div>
      </div>
    </div>
  );
}
