'use client';

import React, { useState } from 'react';
import { X, AlertOctagon, FileWarning, ShieldAlert, BookOpen, AlertCircle } from 'lucide-react';

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
  claimId = 'CLM-2026-04102',
  insuredName = 'Trần Thị B',
}: RejectClaimModalProps) {
  const [selectedReason, setSelectedReason] = useState('WAITING_PERIOD');
  const [clauseReference, setClauseReference] = useState(
    'Điều 4.2 - Thời gian chờ đối với Bệnh thông thường',
  );
  const [allowAppeal, setAllowAppeal] = useState(true);
  const [formalLetterContent, setFormalLetterContent] = useState(
    `Kính gửi Quý khách hàng ${insuredName},

Công ty Bảo hiểm xin chân thành cảm ơn Quý khách đã tin tưởng và tham gia bảo hiểm.

Về yêu cầu giải quyết quyền lợi bảo hiểm mã hồ sơ ${claimId}, sau khi đối chiếu hồ sơ y tế với Quy tắc Bảo hiểm đã thỏa thuận, chúng tôi rất tiếc phải thông báo hồ sơ của Quý khách không thuộc phạm vi chi trả bảo hiểm vì lý do sau:
- Sự kiện bảo hiểm phát sinh trong Thời gian chờ 30 ngày kể từ ngày hợp đồng có hiệu lực (Quy định tại Điều 4.2).

Nếu Quý khách có thêm chứng từ y khoa làm rõ hoặc có thắc mắc, Quý khách có quyền gửi đơn khiếu nại trong vòng 30 ngày làm việc kể từ ngày nhận được thông báo này.

Trân trọng kính thư!`,
  );

  if (!isOpen) return null;

  const handleReasonChange = (reasonKey: string) => {
    setSelectedReason(reasonKey);
    if (reasonKey === 'WAITING_PERIOD') {
      setClauseReference('Điều 4.2 - Thời gian chờ đối với Bệnh thông thường (30 ngày)');
      setFormalLetterContent(
        `Kính gửi Quý khách hàng ${insuredName},\n\nVề yêu cầu bảo hiểm mã hồ sơ ${claimId}, sau khi xem xét hồ sơ y tế, chúng tôi rất tiếc thông báo hồ sơ không thuộc phạm vi chi trả do sự kiện điều trị phát sinh trong Thời gian chờ 30 ngày theo quy định tại Điều 4.2.\n\nQuý khách có quyền khiếu nại trong vòng 30 ngày kể từ ngày nhận thông báo này.`,
      );
    } else if (reasonKey === 'POLICY_EXCLUSION') {
      setClauseReference('Điều 14.1 - Các điểm loại trừ trách nhiệm bảo hiểm chung');
      setFormalLetterContent(
        `Kính gửi Quý khách hàng ${insuredName},\n\nVề yêu cầu bảo hiểm mã hồ sơ ${claimId}, khoản chi phí điều trị yêu cầu thuộc trường hợp Điểm loại trừ trách nhiệm bảo hiểm theo quy định tại Điều 14.1 của Hợp đồng bảo hiểm.\n\nQuý khách có quyền khiếu nại trong vòng 30 ngày kể từ ngày nhận thông báo này.`,
      );
    } else if (reasonKey === 'FRAUD_SUSPICION') {
      setClauseReference('Điều 18.3 - Tính trung thực tuyệt đối & Hành vi gian lận hồ sơ');
      setFormalLetterContent(
        `Kính gửi Quý khách hàng ${insuredName},\n\nVề yêu cầu bảo hiểm mã hồ sơ ${claimId}, qua quá trình giám định pháp y và đối chiếu dữ liệu hóa đơn, chứng từ cung cấp có dấu hiệu chỉnh sửa hoặc không trùng khớp với dữ liệu gốc của cơ sở y tế. Do đó hồ sơ bị từ chối theo Điều 18.3.`,
      );
    } else if (reasonKey === 'LIMIT_EXCEEDED') {
      setClauseReference('Điều 8.4 - Hạn mức chi trả tối đa trong năm hợp đồng');
      setFormalLetterContent(
        `Kính gửi Quý khách hàng ${insuredName},\n\nVề yêu cầu bảo hiểm mã hồ sơ ${claimId}, hạn mức quyền lợi năm của Quý khách đã được chi trả tối đa (100.000.000 đ) trước đó, do đó không thể giải quyết thêm chi phí phát sinh.`,
      );
    }
  };

  const handleReject = () => {
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
              <strong>Lưu ý pháp lý:</strong> Quyết định từ chối bồi thường là văn bản có giá trị
              pháp lý ràng buộc. Khách hàng có quyền khiếu nại hoặc khởi kiện trong vòng 30 ngày làm
              việc.
            </div>
          </div>

          {/* Primary Reason Selector */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
              <FileWarning className="h-4 w-4 text-rose-600" />
              <span>Căn cứ lý do từ chối chính:</span>
            </label>

            <div className="grid grid-cols-1 gap-2">
              {[
                {
                  id: 'WAITING_PERIOD',
                  title: 'Phát sinh trong Thời gian chờ (Waiting Period)',
                  desc: 'Hồ sơ khám/điều trị trong 30 ngày đầu của hợp đồng (TC-02)',
                },
                {
                  id: 'POLICY_EXCLUSION',
                  title: 'Thuộc danh mục Điều khoản Loại trừ Hợp đồng',
                  desc: 'Thực phẩm chức năng, phẫu thuật thẩm mỹ, bệnh bẩm sinh...',
                },
                {
                  id: 'FRAUD_SUSPICION',
                  title: 'Nghi vấn gian lận chứng từ y tế / Không trung thực',
                  desc: 'Chứng từ có dấu hiệu tẩy xóa, trùng hóa đơn với bảo hiểm khác',
                },
                {
                  id: 'LIMIT_EXCEEDED',
                  title: 'Vượt quá hạn mức bồi thường tối đa trong năm',
                  desc: 'Hạn mức bảo hiểm năm đã chạm ngưỡng 100%',
                },
              ].map(r => (
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
