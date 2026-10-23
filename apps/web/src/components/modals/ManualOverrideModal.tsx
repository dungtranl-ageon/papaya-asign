'use client';

import React, { useState } from 'react';
import { X, Edit3, ShieldAlert, Check, DollarSign } from 'lucide-react';

interface ManualOverrideModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (data: {
    originalAmount: number;
    overriddenAmount: number;
    overrideReason: string;
    auditNote: string;
  }) => void;
  claimId?: string;
  originalAmount?: number;
}

export function ManualOverrideModal({
  isOpen,
  onClose,
  onConfirm,
  claimId = 'CLM-2026-03891',
  originalAmount = 13200000,
}: ManualOverrideModalProps) {
  const [overriddenAmount, setOverriddenAmount] = useState<number>(originalAmount);
  const [overrideReason, setOverrideReason] = useState('MANAGEMENT_GOODWILL');
  const [auditNote, setAuditNote] = useState('');

  if (!isOpen) return null;

  const delta = overriddenAmount - originalAmount;

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(val);
  };

  const handleSubmit = () => {
    if (!auditNote.trim()) {
      alert('Vui lòng nhập lý do giải trình kiểm toán bắt buộc khi thực hiện ghi đè số tiền!');
      return;
    }
    onConfirm({
      originalAmount,
      overriddenAmount,
      overrideReason,
      auditNote,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="w-full max-w-lg rounded-2xl bg-white shadow-2xl border border-slate-200 overflow-hidden animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-teal-500/20 text-teal-400 border border-teal-500/30">
              <Edit3 className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">Ghi đè Đề xuất Thẩm định AI</h3>
              <p className="text-[11px] text-slate-400">
                Mã hồ sơ: <span className="font-mono text-teal-400 font-bold">{claimId}</span>
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-4 max-h-[75vh] overflow-y-auto text-xs">
          {/* Audit Warning */}
          <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 flex items-start gap-2.5">
            <ShieldAlert className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
            <div className="text-[11px] text-amber-900 leading-relaxed">
              <strong>Cảnh báo Kiểm toán (Audit Trail):</strong> Hành động ghi đè kết quả tự động sẽ
              được lưu vết vĩnh viễn vào nhật ký hệ thống kèm chữ ký số và định danh chuyên viên
              thẩm định.
            </div>
          </div>

          {/* Amount Comparison */}
          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 grid grid-cols-2 gap-3 items-center">
            <div>
              <span className="text-[11px] text-slate-500 block mb-0.5">AI Đề xuất ban đầu</span>
              <span className="text-sm font-bold text-slate-700 font-mono">
                {formatCurrency(originalAmount)}
              </span>
            </div>

            <div className="border-l border-slate-200 pl-3">
              <span className="text-[11px] text-teal-700 font-bold block mb-0.5">
                Chênh lệch điều chỉnh
              </span>
              <span
                className={`text-sm font-bold font-mono ${
                  delta > 0 ? 'text-emerald-700' : delta < 0 ? 'text-rose-700' : 'text-slate-600'
                }`}
              >
                {delta > 0
                  ? `+${formatCurrency(delta)}`
                  : delta < 0
                    ? formatCurrency(delta)
                    : '0 đ'}
              </span>
            </div>
          </div>

          {/* Input Adjusted Amount */}
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
              <DollarSign className="h-3.5 w-3.5 text-teal-600" />
              <span>Số tiền phê duyệt điều chỉnh (VNĐ):</span>
            </label>
            <input
              type="number"
              step="100000"
              value={overriddenAmount}
              onChange={e => setOverriddenAmount(Number(e.target.value))}
              className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm font-mono font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:bg-white"
            />
          </div>

          {/* Reason Selector */}
          <div className="space-y-1 pt-1">
            <label className="text-xs font-bold text-slate-800 block">Lý do ghi đè chính:</label>
            <select
              value={overrideReason}
              onChange={e => setOverrideReason(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:bg-white"
            >
              <option value="MANAGEMENT_GOODWILL">
                Phê duyệt ngoại lệ quản lý đặc biệt (Special Goodwill Approval)
              </option>
              <option value="POLICY_EXCEPTION">
                Ngoại lệ hợp đồng theo thỏa thuận bổ sung với doanh nghiệp
              </option>
              <option value="OCR_CORRECTION">
                Đính chính sai sót OCR phân loại tiền thuốc / vật tư
              </option>
              <option value="COURT_RULING">
                Quyết định giải quyết tranh chấp pháp lý / Trọng tài
              </option>
              <option value="OTHER">Lý do khác</option>
            </select>
          </div>

          {/* Audit Note (Mandatory) */}
          <div className="space-y-1 pt-1">
            <label className="text-xs font-bold text-slate-800 flex items-center justify-between">
              <span>Giải trình chi tiết cho Kiểm toán viên (Bắt buộc):</span>
              <span className="text-[10px] text-rose-500 font-bold">* Không được để trống</span>
            </label>
            <textarea
              rows={3}
              value={auditNote}
              onChange={e => setAuditNote(e.target.value)}
              placeholder="Ghi rõ cơ sở phê duyệt ngoại lệ, tên người ủy quyền hoặc số văn bản quyết định nội bộ..."
              className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:bg-white"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex items-center justify-end gap-2">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800 hover:bg-slate-200/60 rounded-xl transition-colors cursor-pointer"
          >
            Hủy bỏ (Esc)
          </button>
          <button
            onClick={handleSubmit}
            disabled={!auditNote.trim()}
            className="px-5 py-2 text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 disabled:opacity-40 rounded-xl shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <Check className="h-4 w-4 text-teal-400" />
            <span>Lưu Quyết định Ghi đè</span>
          </button>
        </div>
      </div>
    </div>
  );
}
