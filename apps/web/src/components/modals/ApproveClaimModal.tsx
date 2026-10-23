'use client';

import React, { useState } from 'react';
import {
  X,
  CheckCircle2,
  Building2,
  CreditCard,
  Mail,
  MessageSquare,
  AlertCircle,
  Calendar,
} from 'lucide-react';

interface ApproveClaimModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (data: {
    approvedAmount: number;
    beneficiaryName: string;
    bankAccount: string;
    bankName: string;
    payoutSchedule: string;
    sendEmail: boolean;
    sendSms: boolean;
    note: string;
  }) => void;
  claimId?: string;
  suggestedAmount?: number;
  insuredName?: string;
}

export function ApproveClaimModal({
  isOpen,
  onClose,
  onConfirm,
  claimId = 'CLM-2026-03891',
  suggestedAmount = 13200000,
  insuredName = 'Nguyễn Văn A',
}: ApproveClaimModalProps) {
  const [beneficiaryName, setBeneficiaryName] = useState(insuredName);
  const [bankAccount, setBankAccount] = useState('0071001234567');
  const [bankName, setBankName] = useState('Vietcombank - CN Tân Bình, TP.HCM');
  const [payoutSchedule, setPayoutSchedule] = useState('BATCH_1600');
  const [sendEmail, setSendEmail] = useState(true);
  const [sendSms, setSendSms] = useState(true);
  const [note, setNote] = useState(
    'Hồ sơ hợp lệ, đủ 3/3 chứng từ, chi trả theo quyền lợi điều trị phẫu thuật cấp cứu.',
  );

  if (!isOpen) return null;

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(val);
  };

  const handleApprove = () => {
    onConfirm({
      approvedAmount: suggestedAmount,
      beneficiaryName,
      bankAccount,
      bankName,
      payoutSchedule,
      sendEmail,
      sendSms,
      note,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="w-full max-w-xl rounded-2xl bg-white shadow-2xl border border-slate-200 overflow-hidden animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="px-6 py-4 bg-emerald-50/80 border-b border-emerald-100 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-emerald-600 text-white shadow-2xs">
              <CheckCircle2 className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                Xác nhận Phê duyệt Chi trả Bồi thường
              </h3>
              <p className="text-[11px] text-emerald-800 font-medium">
                Mã hồ sơ: <span className="font-mono font-bold">{claimId}</span>
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
          {/* Amount Box */}
          <div className="p-4 rounded-xl bg-gradient-to-r from-teal-50 to-emerald-50 border border-teal-200 flex items-center justify-between">
            <div>
              <span className="text-slate-600 text-[11px] block font-medium">
                Số tiền phê duyệt giải ngân
              </span>
              <span className="text-2xl font-black text-teal-800 font-mono tracking-tight">
                {formatCurrency(suggestedAmount)}
              </span>
            </div>
            <div className="text-right">
              <span className="text-[10px] text-emerald-800 font-bold bg-emerald-100 px-2 py-0.5 rounded-full inline-block mb-1">
                AI Khuyến nghị 100%
              </span>
              <p className="text-[10px] text-slate-500">Đã trừ 20% Copay & TPCN</p>
            </div>
          </div>

          {/* Beneficiary Details */}
          <div className="space-y-3 pt-2">
            <h4 className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
              <CreditCard className="h-4 w-4 text-teal-600" />
              <span>Thông tin Tài khoản Thụ hưởng</span>
            </h4>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[11px] text-slate-600 font-medium block mb-1">
                  Tên người thụ hưởng
                </label>
                <input
                  type="text"
                  value={beneficiaryName}
                  onChange={e => setBeneficiaryName(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:bg-white"
                />
              </div>

              <div>
                <label className="text-[11px] text-slate-600 font-medium block mb-1">
                  Số tài khoản
                </label>
                <input
                  type="text"
                  value={bankAccount}
                  onChange={e => setBankAccount(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs font-mono font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:bg-white"
                />
              </div>
            </div>

            <div>
              <label className="text-[11px] text-slate-600 font-medium block mb-1">
                Ngân hàng & Chi nhánh
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={bankName}
                  onChange={e => setBankName(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-8 pr-3 py-2 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:bg-white"
                />
                <Building2 className="h-3.5 w-3.5 text-slate-400 absolute left-2.5 top-2.5" />
              </div>
            </div>
          </div>

          {/* Payout Schedule */}
          <div className="space-y-2 pt-2">
            <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
              <Calendar className="h-4 w-4 text-teal-600" />
              <span>Lịch trình Giải ngân</span>
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setPayoutSchedule('BATCH_1600')}
                className={`p-2.5 rounded-lg border text-left transition-all ${
                  payoutSchedule === 'BATCH_1600'
                    ? 'border-teal-500 bg-teal-50/50 text-teal-900 font-semibold ring-1 ring-teal-500'
                    : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                }`}
              >
                <span className="block text-xs font-bold">Lô 16:00 Hôm nay</span>
                <span className="text-[10px] text-slate-500">
                  Chuyển tiền tự động qua Napas 24/7
                </span>
              </button>

              <button
                type="button"
                onClick={() => setPayoutSchedule('IMMEDIATE')}
                className={`p-2.5 rounded-lg border text-left transition-all ${
                  payoutSchedule === 'IMMEDIATE'
                    ? 'border-teal-500 bg-teal-50/50 text-teal-900 font-semibold ring-1 ring-teal-500'
                    : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                }`}
              >
                <span className="block text-xs font-bold">Lập lệnh Ngay lập tức</span>
                <span className="text-[10px] text-slate-500">Ưu tiên hồ sơ cấp cứu / VIP</span>
              </button>
            </div>
          </div>

          {/* Notifications */}
          <div className="space-y-2 pt-2">
            <span className="text-xs font-bold text-slate-800 block">
              Kênh thông báo kết quả cho khách hàng
            </span>
            <div className="flex items-center gap-4">
              <label className="flex items-center gap-2 cursor-pointer text-slate-700 font-medium">
                <input
                  type="checkbox"
                  checked={sendEmail}
                  onChange={e => setSendEmail(e.target.checked)}
                  className="rounded text-teal-600 focus:ring-teal-500 h-3.5 w-3.5"
                />
                <Mail className="h-3.5 w-3.5 text-slate-500" />
                <span>Gửi Thư thông báo Bồi thường (Email)</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer text-slate-700 font-medium">
                <input
                  type="checkbox"
                  checked={sendSms}
                  onChange={e => setSendSms(e.target.checked)}
                  className="rounded text-teal-600 focus:ring-teal-500 h-3.5 w-3.5"
                />
                <MessageSquare className="h-3.5 w-3.5 text-slate-500" />
                <span>Gửi Tin nhắn SMS / Zalo OA</span>
              </label>
            </div>
          </div>

          {/* Notes */}
          <div className="pt-2">
            <label className="text-xs font-bold text-slate-800 block mb-1">
              Ghi chú của Chuyên viên Thẩm định
            </label>
            <textarea
              rows={2}
              value={note}
              onChange={e => setNote(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:bg-white"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-slate-500 text-[11px]">
            <AlertCircle className="h-3.5 w-3.5" />
            <span>
              Phím tắt: <strong>Cmd + Enter</strong> để phê duyệt nhanh
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
              onClick={handleApprove}
              className="px-5 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 rounded-xl shadow-xs transition-colors flex items-center gap-1.5"
            >
              <CheckCircle2 className="h-4 w-4" />
              <span>Xác nhận Phê duyệt</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
