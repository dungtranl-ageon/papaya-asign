'use client';

import React, { useState } from 'react';
import { User, CheckCircle2, AlertTriangle, XCircle, Eye, EyeOff } from 'lucide-react';
import { Claim, Policy, maskNationalId, maskPatientName } from '@papaya/shared';

interface MemberPolicyCardProps {
  claim: Claim;
  policy?: Policy | null;
}

export function MemberPolicyCard({ claim, policy }: MemberPolicyCardProps) {
  const annualLimit = policy?.annualTotalLimit || 500000000;
  const usedAmount = policy?.annualUsedAmount || 0;
  const remainingLimit = Math.max(0, annualLimit - usedAmount - claim.totalRequested);
  const usagePercentage = Math.min(
    100,
    Math.round(((usedAmount + claim.totalRequested) / annualLimit) * 100),
  );

  const isPolicyActive = policy ? policy.status === 'ACTIVE' : true;
  const [showFullDetails, setShowFullDetails] = useState(false);

  return (
    <div className="p-4 rounded-xl border border-slate-200 bg-white shadow-2xs">
      <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-lg bg-teal-50 text-teal-700">
            <User className="h-4 w-4" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
                Người được Bảo hiểm
              </span>
              <button
                type="button"
                onClick={() => setShowFullDetails(!showFullDetails)}
                className="text-slate-400 hover:text-slate-700 transition-colors p-0.5 rounded cursor-pointer"
                title={
                  showFullDetails ? 'Che giấu PII (Nghị định 13)' : 'Mở xem thông tin PII đầy đủ'
                }
              >
                {showFullDetails ? (
                  <EyeOff className="h-3 w-3 text-slate-500" />
                ) : (
                  <Eye className="h-3 w-3 text-slate-500" />
                )}
              </button>
            </div>
            <div className="flex items-center gap-1.5">
              <h3 className="font-bold text-slate-900 text-sm">
                {showFullDetails ? claim.patientName : maskPatientName(claim.patientName)}
              </h3>
              {!showFullDetails && (
                <span className="text-[9px] text-teal-700 bg-teal-50 px-1.5 py-0.2 rounded border border-teal-200 font-medium">
                  PII Safe
                </span>
              )}
            </div>
          </div>
        </div>
        {isPolicyActive ? (
          <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1">
            <CheckCircle2 className="h-3.5 w-3.5" />
            Hợp đồng Hiệu lực
          </span>
        ) : policy?.status === 'LAPSED' ? (
          <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200 flex items-center gap-1">
            <AlertTriangle className="h-3.5 w-3.5" />
            Hết hiệu lực
          </span>
        ) : (
          <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-rose-50 text-rose-700 border border-rose-200 flex items-center gap-1">
            <XCircle className="h-3.5 w-3.5" />
            Chấm dứt hiệu lực
          </span>
        )}
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs mb-3.5">
        <div>
          <span className="text-slate-500 block text-[11px]">Số Hợp đồng:</span>
          <span className="font-semibold text-slate-800 font-mono">{claim.policyNumber}</span>
        </div>
        <div>
          <span className="text-slate-500 block text-[11px]">CCCD / Định danh:</span>
          <span className="font-semibold text-slate-800 font-mono flex items-center gap-1">
            {showFullDetails ? claim.nationalId : maskNationalId(claim.nationalId)}
            {!showFullDetails && (
              <span
                className="text-[10px] text-teal-600 font-sans font-medium"
                title="Bảo vệ dữ liệu cá nhân theo NĐ 13/2023"
              >
                [PII]
              </span>
            )}
          </span>
        </div>
        <div>
          <span className="text-slate-500 block text-[11px]">Chương trình:</span>
          <span className="font-semibold text-teal-700">
            {policy?.planName || 'Chăm sóc Sức khỏe'}
          </span>
        </div>
        <div>
          <span className="text-slate-500 block text-[11px]">Hạn mức Năm:</span>
          <span className="font-semibold text-slate-900">
            {annualLimit.toLocaleString('vi-VN')} đ
          </span>
        </div>
      </div>

      {/* Annual Usage Progress Bar */}
      <div className="space-y-1.5 pt-1 border-t border-slate-100">
        <div className="flex justify-between items-center text-[11px]">
          <span className="text-slate-500">
            Đã sử dụng lũy kế:{' '}
            <strong className="text-slate-800">{usedAmount.toLocaleString('vi-VN')} đ</strong>
          </span>
          <span className="font-semibold text-teal-700">
            Còn lại: {remainingLimit.toLocaleString('vi-VN')} đ ({100 - usagePercentage}%)
          </span>
        </div>
        <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
          <div
            className={`h-full transition-all duration-300 rounded-full ${
              usagePercentage > 85 ? 'bg-amber-500' : 'bg-teal-600'
            }`}
            style={{ width: `${usagePercentage}%` }}
          />
        </div>
      </div>
    </div>
  );
}
