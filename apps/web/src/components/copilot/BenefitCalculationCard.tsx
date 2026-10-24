'use client';

import React, { useState, useEffect } from 'react';
import {
  Calculator,
  ShieldCheck,
  AlertCircle,
  Edit3,
  ArrowRight,
  Info,
  Check,
  X,
  Loader2,
} from 'lucide-react';
import { PolicyCitationPill } from './PolicyCitationPill';

export interface IneligibleItem {
  description: string;
  amount: number;
  reason: string;
}

export interface BenefitCalculationData {
  totalClaimedAmount: number;
  eligibleAmount: number;
  deductibleApplied: number;
  copayPercentage: number;
  copayAmount: number;
  ineligibleItems: IneligibleItem[];
  finalPayableAmount: number;
  annualLimitRemainingBefore: number;
  annualLimitRemainingAfter: number;
}

interface BenefitCalculationCardProps {
  calculation?: BenefitCalculationData;
  annualLimitTotal?: number;
  onOpenManualOverride?: () => void;
  onOpenPolicyBrowser?: (clauseId: string) => void;
  onUpdateClaimedAmount?: (newAmount: number) => Promise<void>;
  onApplyCopay?: (copayPct: number, finalAmount: number) => Promise<void>;
}

export function BenefitCalculationCard({
  calculation,
  annualLimitTotal: propAnnualLimitTotal,
  onOpenManualOverride,
  onOpenPolicyBrowser,
  onUpdateClaimedAmount,
  onApplyCopay,
}: BenefitCalculationCardProps) {
  const data: BenefitCalculationData = calculation || {
    totalClaimedAmount: 0,
    eligibleAmount: 0,
    deductibleApplied: 0,
    copayPercentage: 0,
    copayAmount: 0,
    ineligibleItems: [],
    finalPayableAmount: 0,
    annualLimitRemainingBefore: 0,
    annualLimitRemainingAfter: 0,
  };

  const isCalculationPending = data.eligibleAmount === 0 && data.finalPayableAmount === 0;

  // Assessor interactive copay override simulator
  const [interactiveCopay, setInteractiveCopay] = useState<number>(data.copayPercentage);
  const [isApplyingCopay, setIsApplyingCopay] = useState(false);

  // Editable claimed amount state
  const [isEditingClaimedAmount, setIsEditingClaimedAmount] = useState(false);
  const [claimedAmountInput, setClaimedAmountInput] = useState<number>(data.totalClaimedAmount);
  const [isSavingClaimedAmount, setIsSavingClaimedAmount] = useState(false);

  useEffect(() => {
    setInteractiveCopay(data.copayPercentage);
  }, [data.copayPercentage]);

  useEffect(() => {
    setClaimedAmountInput(data.totalClaimedAmount);
  }, [data.totalClaimedAmount]);

  const totalIneligible = data.ineligibleItems.reduce((acc, i) => acc + i.amount, 0);

  // Recalculate values dynamically based on interactive copay slider
  const dynamicCopayAmount = isCalculationPending
    ? 0
    : Math.round((data.eligibleAmount * interactiveCopay) / 100);

  // Correct calculation: finalPayable = eligibleAmount - copayAmount (avoids double subtraction of copay)
  const dynamicFinalPayable = isCalculationPending
    ? 0
    : interactiveCopay === data.copayPercentage
      ? data.finalPayableAmount
      : Math.max(0, data.eligibleAmount - dynamicCopayAmount);

  const dynamicLimitAfter = Math.max(0, data.annualLimitRemainingBefore - dynamicFinalPayable);
  const annualLimitTotal = propAnnualLimitTotal || 500000000;
  const usedBeforePercent = Math.min(
    100,
    ((annualLimitTotal - data.annualLimitRemainingBefore) / annualLimitTotal) * 100,
  );
  const usedAfterPercent = Math.min(
    100,
    ((annualLimitTotal - dynamicLimitAfter) / annualLimitTotal) * 100,
  );

  const formatCurrency = (val: number) => {
    const safeVal = Math.abs(val) < 0.001 ? 0 : Math.abs(val);
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(safeVal);
  };

  return (
    <div className="p-4 rounded-xl border border-slate-200 bg-white shadow-2xs space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between pb-2 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-teal-50 text-teal-700">
            <Calculator className="h-4 w-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h4 className="text-xs font-bold text-slate-800">Chiết tính Quyền lợi Bồi thường</h4>
              {isCalculationPending && (
                <span className="text-[10px] font-mono text-slate-500 bg-slate-100 px-1.5 py-0.2 rounded border border-slate-200">
                  Chưa thực hiện chiết tính
                </span>
              )}
            </div>
            <p className="text-[10px] text-slate-500">
              Mô hình tính toán tự động dựa trên quyền lợi Nội trú & Ngoại trú
            </p>
          </div>
        </div>
        {onOpenManualOverride && !isCalculationPending && (
          <button
            onClick={onOpenManualOverride}
            className="flex items-center gap-1.5 px-2.5 py-1 text-[11px] font-semibold text-slate-700 hover:text-teal-700 bg-slate-50 hover:bg-teal-50 border border-slate-200 hover:border-teal-300 rounded-lg transition-all"
            title="Ghi đè số tiền phê duyệt bằng tay"
          >
            <Edit3 className="h-3 w-3" />
            <span>Ghi đè thủ công</span>
          </button>
        )}
      </div>

      {/* Main Breakdown Numbers */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
        <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-100 relative group">
          <div className="flex items-center justify-between mb-0.5">
            <span className="text-[10px] text-slate-500 font-medium">Tổng yêu cầu</span>
            {onUpdateClaimedAmount && !isEditingClaimedAmount && (
              <button
                type="button"
                onClick={() => setIsEditingClaimedAmount(true)}
                className="opacity-70 hover:opacity-100 p-0.5 text-slate-400 hover:text-teal-700 rounded transition-opacity cursor-pointer"
                title="Chỉnh sửa số tiền yêu cầu"
              >
                <Edit3 className="h-3 w-3" />
              </button>
            )}
          </div>
          {isEditingClaimedAmount ? (
            <div className="space-y-1.5 pt-0.5 animate-in fade-in duration-150">
              <input
                type="number"
                step="500000"
                value={claimedAmountInput}
                onChange={e => setClaimedAmountInput(Number(e.target.value))}
                className="w-full bg-white border border-teal-500 rounded px-1.5 py-1 text-xs font-mono font-bold text-slate-800 focus:outline-none focus:ring-1 focus:ring-teal-500 shadow-2xs"
                autoFocus
              />
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  disabled={isSavingClaimedAmount || claimedAmountInput <= 0}
                  onClick={async () => {
                    if (onUpdateClaimedAmount) {
                      setIsSavingClaimedAmount(true);
                      try {
                        await onUpdateClaimedAmount(claimedAmountInput);
                        setIsEditingClaimedAmount(false);
                      } catch (err) {
                        console.error('Failed to update claimed amount:', err);
                      } finally {
                        setIsSavingClaimedAmount(false);
                      }
                    }
                  }}
                  className="px-2 py-0.5 bg-teal-600 hover:bg-teal-700 text-white rounded text-[10px] font-bold flex items-center gap-1 cursor-pointer disabled:opacity-50"
                >
                  {isSavingClaimedAmount ? (
                    <Loader2 className="h-2.5 w-2.5 animate-spin" />
                  ) : (
                    <Check className="h-2.5 w-2.5" />
                  )}
                  <span>Lưu</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setClaimedAmountInput(data.totalClaimedAmount);
                    setIsEditingClaimedAmount(false);
                  }}
                  className="px-1.5 py-0.5 bg-slate-200 hover:bg-slate-300 text-slate-600 rounded text-[10px] cursor-pointer"
                >
                  <X className="h-2.5 w-2.5" />
                </button>
              </div>
            </div>
          ) : (
            <span className="text-xs font-bold text-slate-800 font-mono">
              {formatCurrency(data.totalClaimedAmount)}
            </span>
          )}
        </div>

        <div className="p-2.5 rounded-lg bg-rose-50/60 border border-rose-100">
          <span className="text-[10px] text-rose-600 font-medium block mb-0.5">Khoản loại trừ</span>
          <span className="text-xs font-bold text-rose-700 font-mono">
            {formatCurrency(totalIneligible)}
          </span>
        </div>

        <div className="p-2.5 rounded-lg bg-amber-50/60 border border-amber-100">
          <div className="flex items-center justify-between mb-0.5">
            <span className="text-[10px] text-amber-700 font-medium">
              Đồng chi trả ({interactiveCopay}%)
            </span>
            {interactiveCopay !== data.copayPercentage && (
              <span className="text-[9px] text-amber-700 font-bold bg-amber-100 px-1 rounded">
                Mô phỏng
              </span>
            )}
          </div>
          <span className="text-xs font-bold text-amber-800 font-mono">
            {formatCurrency(dynamicCopayAmount)}
          </span>
        </div>

        <div
          className={`p-2.5 rounded-lg ${
            isCalculationPending
              ? 'bg-slate-50 border border-slate-200 text-slate-500'
              : 'bg-teal-50 border border-teal-200 text-teal-800'
          }`}
        >
          <span
            className={`text-[10px] font-bold block mb-0.5 ${
              isCalculationPending ? 'text-slate-500' : 'text-teal-700'
            }`}
          >
            Phê duyệt chi trả
          </span>
          <span
            className={`text-sm font-extrabold font-mono ${
              isCalculationPending ? 'text-slate-600' : 'text-teal-800'
            }`}
          >
            {formatCurrency(dynamicFinalPayable)}
          </span>
        </div>
      </div>

      {/* Interactive Copay Slider for Assessor simulation */}
      <div
        className={`p-3 rounded-lg border space-y-2 transition-all ${
          isCalculationPending
            ? 'bg-slate-50/60 border-slate-200/60 opacity-60'
            : 'bg-slate-50/80 border-slate-200/80'
        }`}
      >
        <div className="flex items-center justify-between text-xs">
          <label
            htmlFor="copay-slider"
            className={`font-semibold flex items-center gap-1.5 ${
              isCalculationPending
                ? 'text-slate-400 cursor-not-allowed'
                : 'text-slate-700 cursor-pointer'
            }`}
          >
            <Info className="h-3.5 w-3.5 text-slate-400" />
            <span>Mô phỏng tỷ lệ Đồng chi trả (Copay):</span>
            <span className="font-mono text-slate-600 font-bold bg-slate-200/70 px-1.5 py-0.5 rounded text-[11px]">
              {interactiveCopay}%
            </span>
          </label>
          {!isCalculationPending && interactiveCopay !== data.copayPercentage && (
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setInteractiveCopay(data.copayPercentage)}
                className="text-[10px] text-slate-500 hover:text-slate-800 hover:underline font-semibold cursor-pointer"
              >
                Khôi phục ({data.copayPercentage}%)
              </button>
              {onApplyCopay && (
                <button
                  type="button"
                  disabled={isApplyingCopay}
                  onClick={async () => {
                    setIsApplyingCopay(true);
                    try {
                      await onApplyCopay(interactiveCopay, dynamicFinalPayable);
                    } catch (err) {
                      console.error('Failed to apply copay override:', err);
                    } finally {
                      setIsApplyingCopay(false);
                    }
                  }}
                  className="px-2 py-0.5 rounded bg-teal-700 hover:bg-teal-800 text-white text-[10px] font-bold shadow-2xs transition-all cursor-pointer flex items-center gap-1 disabled:opacity-50"
                  title="Lưu mức chi trả theo tỷ lệ Copay này vào hệ thống"
                >
                  {isApplyingCopay ? (
                    <Loader2 className="h-2.5 w-2.5 animate-spin" />
                  ) : (
                    <Check className="h-2.5 w-2.5" />
                  )}
                  <span>Áp dụng Copay {interactiveCopay}%</span>
                </button>
              )}
            </div>
          )}
        </div>
        <div className="flex items-center gap-3">
          <span className="text-[10px] font-mono text-slate-500">0%</span>
          <input
            id="copay-slider"
            type="range"
            min="0"
            max="50"
            step="5"
            disabled={isCalculationPending}
            value={interactiveCopay}
            onChange={e => setInteractiveCopay(Number(e.target.value))}
            className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none disabled:cursor-not-allowed accent-teal-600"
          />
          <span className="text-[10px] font-mono text-slate-500">50%</span>
        </div>
        <p className="text-[10px] text-slate-500">
          {isCalculationPending
            ? 'Chưa thực hiện chiết tính (Chờ hoàn tất thẩm định điều kiện hợp đồng và chứng từ).'
            : 'Kéo thanh trượt để thử nghiệm kịch bản miễn giảm hoặc tăng mức đồng chi trả theo điều khoản bổ sung.'}
        </p>
      </div>

      {/* Ineligible Items List */}
      {data.ineligibleItems.length > 0 && (
        <div className="p-3 rounded-lg bg-rose-50/40 border border-rose-200 space-y-2">
          <span className="text-xs font-bold text-rose-900 flex items-center gap-1.5">
            <AlertCircle className="h-3.5 w-3.5 text-rose-600" />
            <span>Chi tiết các khoản loại trừ / Bị từ chối:</span>
          </span>
          <div className="space-y-1.5">
            {data.ineligibleItems.map((item, idx) => (
              <div
                key={idx}
                className="p-2 rounded bg-white border border-rose-100 flex flex-col sm:flex-row sm:items-center justify-between text-xs gap-1"
              >
                <div className="flex-1">
                  <p className="font-medium text-slate-800">{item.description}</p>
                  <p className="text-[10px] text-rose-600 mt-0.5">{item.reason}</p>
                </div>
                <div className="text-right">
                  <span className="font-mono font-bold text-rose-700">
                    {formatCurrency(item.amount)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Annual Limit Impact Progress Bar */}
      <div className="p-3 rounded-lg bg-white border border-slate-200 space-y-2">
        <div className="flex items-center justify-between text-xs">
          <span className="font-semibold text-slate-700 flex items-center gap-1.5">
            <ShieldCheck className="h-3.5 w-3.5 text-teal-600" />
            <span>Tác động tới Hạn mức Bảo hiểm Năm:</span>
          </span>
          <span className="text-[11px] font-mono text-slate-600">
            Hạn mức tối đa: <strong>{formatCurrency(annualLimitTotal)}</strong>
          </span>
        </div>

        {/* Progress Visualizer */}
        <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden flex">
          {/* Used before this claim */}
          <div
            style={{ width: `${usedBeforePercent}%` }}
            className="bg-slate-400 h-full transition-all duration-300"
            title={`Đã chi trả trước đó: ${formatCurrency(annualLimitTotal - data.annualLimitRemainingBefore)}`}
          />
          {/* Claim impact */}
          <div
            style={{ width: `${Math.max(0, usedAfterPercent - usedBeforePercent)}%` }}
            className="bg-teal-500 h-full transition-all duration-300 animate-pulse"
            title={`Chi trả trong hồ sơ này: ${formatCurrency(dynamicFinalPayable)}`}
          />
        </div>

        <div className="flex items-center justify-between text-[10px] text-slate-600 pt-1 border-t border-slate-100">
          <div>
            <span>Trước thẩm định: </span>
            <strong className="font-mono text-slate-800">
              {formatCurrency(data.annualLimitRemainingBefore)}
            </strong>
          </div>
          <ArrowRight className="h-3 w-3 text-slate-400" />
          <div>
            <span>Sau thẩm định: </span>
            <strong className="font-mono text-teal-700">{formatCurrency(dynamicLimitAfter)}</strong>
          </div>
        </div>
      </div>

      {/* Policy Citations Footer */}
      <div className="pt-2 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2 text-xs">
        <span className="text-[11px] text-slate-700 font-medium">Cơ sở pháp lý chiết tính:</span>
        <div className="flex flex-wrap gap-1.5">
          <PolicyCitationPill
            clauseId="POLICY-SEC-14.2"
            clauseTitle="Quy tắc Đồng chi trả 20% BHYT / Viện phí"
            clauseSnippet="Mức đồng chi trả chuẩn 20% áp dụng cho các cơ sở y tế ngoài công lập không liên kết bảo lãnh trực tiếp."
            confidence={99}
            onOpenInBrowser={onOpenPolicyBrowser}
          />
          <PolicyCitationPill
            clauseId="POLICY-SEC-14.3"
            clauseTitle="Loại trừ Thực phẩm chức năng & Dược mỹ phẩm"
            clauseSnippet="Các sản phẩm bổ gan, vitamin bổ trợ không có chỉ định điều trị thiết yếu từ bác sĩ chuyên khoa bị loại trừ chi trả."
            confidence={98}
            onOpenInBrowser={onOpenPolicyBrowser}
          />
        </div>
      </div>
    </div>
  );
}
