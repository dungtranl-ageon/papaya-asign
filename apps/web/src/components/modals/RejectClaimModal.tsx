'use client';

import React, { useState, useEffect } from 'react';
import { X, AlertOctagon, FileWarning, ShieldAlert, BookOpen, AlertCircle } from 'lucide-react';
import {
  REJECTION_REASONS_CATALOG,
  REJECTION_LEGAL_NOTICE,
} from '../../constants/rejection-templates';

interface RejectClaimModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (data: {
    primaryReason: string;
    clauseReference: string;
    formalLetterContent: string;
    allowAppeal: boolean;
  }) => void;
  claimId?: string;
  insuredName?: string;
}

export function RejectClaimModal({
  isOpen,
  onClose,
  onConfirm,
  claimId = '',
  insuredName = '',
}: RejectClaimModalProps) {
  const [selectedReason, setSelectedReason] = useState('WAITING_PERIOD');
  const [clauseReference, setClauseReference] = useState(
    'Điều 4.2 - Thời gian chờ đối với Bệnh thông thường',
  );
  const [allowAppeal, setAllowAppeal] = useState(true);
  const [formalLetterContent, setFormalLetterContent] = useState('');

  useEffect(() => {
    const initialConfig = REJECTION_REASONS_CATALOG[0]!;
    setClauseReference(initialConfig.clauseReference);
    setFormalLetterContent(initialConfig.generateLetter(insuredName, claimId));
  }, [insuredName, claimId]);

  if (!isOpen) return null;

  const handleReasonChange = (reasonKey: string) => {
    setSelectedReason(reasonKey);
    const config = REJECTION_REASONS_CATALOG.find(r => r.id === reasonKey);
    if (config) {
      setClauseReference(config.clauseReference);
      setFormalLetterContent(config.generateLetter(insuredName, claimId));
    }
  };

  const handleReject = async () => {
    if (claimId) {
      try {
        await fetch(`/api/claims/${claimId}/status`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            status: 'REJECTED',
            actorId: 'ASSESSOR',
            actorRole: 'ASSESSOR',
            reason: `${clauseReference} - ${selectedReason}`,
            rejectionReason: selectedReason,
          }),
        });
      } catch (err) {
        console.error('Failed to update rejection status on server:', err);
      }
    }

    onConfirm({
      primaryReason: selectedReason,
      clauseReference,
      formalLetterContent,
      allowAppeal,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="w-full max-w-xl rounded-2xl bg-white shadow-2xl border border-slate-200 overflow-hidden animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="px-6 py-4 bg-rose-50/90 border-b border-rose-100 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-rose-600 text-white shadow-2xs">
              <AlertOctagon className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">Xác nhận Từ chối Chi trả Hồ sơ</h3>
              <p className="text-[11px] text-rose-800 font-medium">
                Mã hồ sơ: <span className="font-mono font-bold">{claimId}</span> • Khách hàng:{' '}
                {insuredName}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-4 max-h-[75vh] overflow-y-auto text-xs">
          {/* Warning Banner */}
          <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 flex items-start gap-2.5">
            <ShieldAlert className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
            <div className="text-[11px] text-amber-900 leading-relaxed">
              <strong>Lưu ý pháp lý:</strong> {REJECTION_LEGAL_NOTICE}
            </div>
          </div>

          {/* Primary Reason Selector */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
              <FileWarning className="h-4 w-4 text-rose-600" />
              <span>Căn cứ lý do từ chối chính:</span>
            </label>

            <div className="grid grid-cols-1 gap-2">
              {REJECTION_REASONS_CATALOG.map(r => (
                <label
                  key={r.id}
                  className={`p-3 rounded-xl border cursor-pointer flex items-start gap-3 transition-all ${
                    selectedReason === r.id
                      ? 'border-rose-500 bg-rose-50/50 text-rose-950 ring-1 ring-rose-500'
                      : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <input
                    type="radio"
                    name="rejectReason"
                    value={r.id}
                    checked={selectedReason === r.id}
                    onChange={() => handleReasonChange(r.id)}
                    className="mt-0.5 text-rose-600 focus:ring-rose-500"
                  />
                  <div>
                    <span className="font-bold text-xs block">{r.title}</span>
                    <span className="text-[11px] text-slate-500">{r.desc}</span>
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* Policy Reference */}
          <div className="space-y-1 pt-1">
            <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
              <BookOpen className="h-4 w-4 text-teal-600" />
              <span>Điều khoản quy tắc bảo hiểm làm căn cứ:</span>
            </label>
            <input
              type="text"
              value={clauseReference}
              onChange={e => setClauseReference(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-rose-500 focus:bg-white"
            />
          </div>

          {/* Letter Editor */}
          <div className="space-y-1 pt-1">
            <label className="text-xs font-bold text-slate-800 block">
              Nội dung Thư thông báo Từ chối chính thức gửi Khách hàng:
            </label>
            <textarea
              rows={5}
              value={formalLetterContent}
              onChange={e => setFormalLetterContent(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-lg p-3 text-xs leading-relaxed text-slate-800 focus:outline-none focus:ring-2 focus:ring-rose-500 focus:bg-white font-sans"
            />
          </div>

          {/* Appeal Rights */}
          <div className="pt-1">
            <label className="flex items-center gap-2 cursor-pointer text-slate-700 font-medium">
              <input
                type="checkbox"
                checked={allowAppeal}
                onChange={e => setAllowAppeal(e.target.checked)}
                className="rounded text-rose-600 focus:ring-rose-500 h-3.5 w-3.5"
              />
              <span>
                Cho phép khách hàng gửi yêu cầu phúc tra / khiếu nại trực tuyến trong 30 ngày
              </span>
            </label>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-slate-500 text-[11px]">
            <AlertCircle className="h-3.5 w-3.5" />
            <span>
              Phím tắt: <strong>Cmd + Shift + R</strong> để từ chối nhanh
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800 hover:bg-slate-200/60 rounded-xl transition-colors"
            >
              Hủy bỏ (Esc)
            </button>
            <button
              onClick={handleReject}
              className="px-5 py-2 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 active:bg-rose-800 rounded-xl shadow-xs transition-colors flex items-center gap-1.5"
            >
              <AlertOctagon className="h-4 w-4" />
              <span>Xác nhận Từ chối</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
