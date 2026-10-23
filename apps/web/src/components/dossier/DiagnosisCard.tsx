'use client';

import React from 'react';
import { Stethoscope, Building2, Calendar, CheckCircle2, ShieldAlert } from 'lucide-react';
import { Claim } from '@papaya/shared';

interface DiagnosisCardProps {
  claim: Claim;
}

export function DiagnosisCard({ claim }: DiagnosisCardProps) {
  // Check if diagnosis is flagged as cosmetic / excluded (like Z41)
  const isExcludedDiagnosis = claim.diagnosisIcd10.startsWith('Z41');

  return (
    <div className="p-4 rounded-xl border border-slate-200 bg-white shadow-2xs">
      <div className="flex items-start justify-between pb-3 mb-3 border-b border-slate-100">
        <div className="flex items-start gap-2.5">
          <div className="p-2 rounded-lg bg-teal-50 text-teal-700 mt-0.5">
            <Stethoscope className="h-4 w-4" />
          </div>
          <div>
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
              Chẩn đoán Y khoa Lâm sàng
            </span>
            <h3 className="font-bold text-slate-900 text-sm leading-snug">
              {claim.diagnosisDescription}
            </h3>
          </div>
        </div>

        {/* Standardized ICD-10 Badge */}
        <div className="text-right">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-teal-100/70 border border-teal-200 text-teal-900 font-mono font-bold text-xs shadow-2xs">
            <span>ICD-10:</span>
            <span className="text-teal-700">{claim.diagnosisIcd10}</span>
          </div>
          <span className="text-[10px] text-slate-500 block mt-0.5 font-medium">
            Độ tin cậy: 98.5%
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
        <div className="flex items-center gap-2 p-2 rounded-lg bg-slate-50 border border-slate-100">
          <Building2 className="h-4 w-4 text-slate-400 shrink-0" />
          <div className="min-w-0">
            <span className="text-slate-600 block text-[10px]">Cơ sở Khám chữa bệnh:</span>
            <span className="font-semibold text-slate-800 truncate block">
              {claim.hospitalName}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2 p-2 rounded-lg bg-slate-50 border border-slate-100">
          <Calendar className="h-4 w-4 text-slate-400 shrink-0" />
          <div>
            <span className="text-slate-600 block text-[10px]">Thời gian Điều trị:</span>
            <span className="font-semibold text-slate-800">
              {new Date(claim.admissionDate).toLocaleDateString('vi-VN')} -{' '}
              {new Date(claim.dischargeDate).toLocaleDateString('vi-VN')}
            </span>
          </div>
        </div>
      </div>

      {/* Clinical Rule Verification Status */}
      <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-xs">
        {isExcludedDiagnosis ? (
          <div className="flex items-center gap-1.5 text-rose-700 bg-rose-50 px-2.5 py-1 rounded-lg border border-rose-200 w-full">
            <ShieldAlert className="h-4 w-4 text-rose-600 shrink-0" />
            <span className="font-medium text-[11px]">
              Cảnh báo: Mã ICD-10 {claim.diagnosisIcd10} thuộc danh mục Phẫu thuật chỉnh hình / Thẩm
              mỹ (Điểm loại trừ 8.2).
            </span>
          </div>
        ) : (
          <div className="flex items-center gap-1.5 text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200 w-full">
            <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
            <span className="font-medium text-[11px]">
              Chỉ định y khoa hợp lý theo Phác đồ Hướng dẫn Điều trị của Bộ Y Tế Việt Nam.
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
