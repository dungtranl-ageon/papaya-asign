'use client';

import React, { useState, useEffect } from 'react';
import {
  X,
  HelpCircle,
  FileCheck,
  Calendar,
  Link,
  Send,
  AlertCircle,
  Sparkles,
} from 'lucide-react';
import {
  STANDARD_REQUEST_DOC_LIST,
  DEFAULT_REQUEST_INFO_GUIDANCE,
} from '../../constants/request-info-templates';

interface RequestMoreInfoModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (data: {
    requestedDocuments: string[];
    deadlineDays: number;
    guidanceNote: string;
    sendMagicLink: boolean;
  }) => void;
  claimId?: string;
  insuredName?: string;
  initialMissingDocs?: string[];
}

export function RequestMoreInfoModal({
  isOpen,
  onClose,
  onConfirm,
  claimId = '',
  insuredName = '',
  initialMissingDocs,
}: RequestMoreInfoModalProps) {
  const [selectedDocs, setSelectedDocs] = useState<string[]>([]);
  const [deadlineDays, setDeadlineDays] = useState(30);
  const [sendMagicLink, setSendMagicLink] = useState(true);
  const [guidanceNote, setGuidanceNote] = useState(DEFAULT_REQUEST_INFO_GUIDANCE);

  useEffect(() => {
    if (initialMissingDocs && initialMissingDocs.length > 0) {
      setSelectedDocs(initialMissingDocs);
    } else {
      setSelectedDocs([STANDARD_REQUEST_DOC_LIST[0]!, STANDARD_REQUEST_DOC_LIST[1]!]);
    }
  }, [initialMissingDocs]);

  if (!isOpen) return null;

  const standardDocList = STANDARD_REQUEST_DOC_LIST;

  const toggleDoc = (doc: string) => {
    setSelectedDocs(prev => (prev.includes(doc) ? prev.filter(d => d !== doc) : [...prev, doc]));
  };

  const handleSubmit = async () => {
    if (claimId) {
      try {
        await fetch(`/api/claims/${claimId}/status`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            status: 'PENDING_MORE_INFO',
            actorId: 'ASSESSOR',
            actorRole: 'ASSESSOR',
            missingDocuments: selectedDocs,
            reason: `Yêu cầu bổ sung ${selectedDocs.length} loại chứng từ: ${guidanceNote}`,
          }),
        });
      } catch (err) {
        console.error('Failed to update request info status on server:', err);
      }
    }

    onConfirm({
      requestedDocuments: selectedDocs,
      deadlineDays,
      guidanceNote,
      sendMagicLink,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="w-full max-w-xl rounded-2xl bg-white shadow-2xl border border-slate-200 overflow-hidden animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="px-6 py-4 bg-amber-50/90 border-b border-amber-100 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-amber-600 text-white shadow-2xs">
              <HelpCircle className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                Yêu cầu Bổ sung Thông tin & Chứng từ
              </h3>
              <p className="text-[11px] text-amber-800 font-medium">
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
          {/* AI Recommendation Banner */}
          <div className="p-3 rounded-xl bg-teal-50 border border-teal-200 flex items-start gap-2.5">
            <Sparkles className="h-4 w-4 text-teal-600 shrink-0 mt-0.5" />
            <div className="text-[11px] text-teal-900 leading-relaxed">
              <strong>Phát hiện từ OCR:</strong> Hình ảnh Bảng kê chi phí hiện tại bị nhòe mờ tại
              dòng tổng tiền, và mã tra cứu hóa đơn điện tử không truy xuất được trên Tổng cục Thuế.
              Cần yêu cầu khách hàng chụp lại bản chất lượng cao.
            </div>
          </div>

          {/* Checklist Documents */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-800 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <FileCheck className="h-4 w-4 text-amber-600" />
                <span>Danh mục tài liệu cần khách hàng cung cấp bổ sung:</span>
              </span>
              <span className="text-[11px] text-amber-700 font-mono font-bold">
                Đã chọn ({selectedDocs.length})
              </span>
            </label>

            <div className="space-y-1.5">
              {standardDocList.map((doc, idx) => {
                const isChecked = selectedDocs.includes(doc);
                return (
                  <label
                    key={idx}
                    className={`p-2.5 rounded-lg border flex items-center gap-2.5 cursor-pointer transition-all ${
                      isChecked
                        ? 'border-amber-400 bg-amber-50/40 text-slate-900 font-medium'
                        : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={() => toggleDoc(doc)}
                      className="rounded text-amber-600 focus:ring-amber-500 h-3.5 w-3.5"
                    />
                    <span className="text-xs">{doc}</span>
                  </label>
                );
              })}
            </div>
          </div>

          {/* Deadline & Upload Magic Link */}
          <div className="grid grid-cols-2 gap-3 pt-1">
            <div>
              <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5 mb-1">
                <Calendar className="h-3.5 w-3.5 text-teal-600" />
                <span>Thời hạn bổ sung (ngày):</span>
              </label>
              <select
                value={deadlineDays}
                onChange={e => setDeadlineDays(Number(e.target.value))}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:bg-white"
              >
                <option value={15}>15 ngày làm việc</option>
                <option value={30}>30 ngày làm việc (Chuẩn quy định)</option>
                <option value={45}>45 ngày làm việc (Gia hạn đặc biệt)</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5 mb-1">
                <Link className="h-3.5 w-3.5 text-teal-600" />
                <span>Cổng tiếp nhận tài liệu:</span>
              </label>
              <div className="p-2 bg-slate-50 border border-slate-200 rounded-lg text-[11px] text-slate-700 font-mono truncate">
                papaya.claims/upload/{claimId.toLowerCase()}
              </div>
            </div>
          </div>

          {/* Guidance Note */}
          <div className="space-y-1 pt-1">
            <label className="text-xs font-bold text-slate-800 block">
              Ghi chú & Hướng dẫn gửi trực tiếp tới khách hàng:
            </label>
            <textarea
              rows={3}
              value={guidanceNote}
              onChange={e => setGuidanceNote(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:bg-white"
            />
          </div>

          {/* Delivery Options */}
          <div className="pt-1">
            <label className="flex items-center gap-2 cursor-pointer text-slate-700 font-medium">
              <input
                type="checkbox"
                checked={sendMagicLink}
                onChange={e => setSendMagicLink(e.target.checked)}
                className="rounded text-amber-600 focus:ring-amber-500 h-3.5 w-3.5"
              />
              <span>
                Tự động gửi Magic Link qua Zalo OA & SMS để khách hàng upload ngay trên điện thoại
              </span>
            </label>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-slate-500 text-[11px]">
            <AlertCircle className="h-3.5 w-3.5" />
            <span>
              Phím tắt: <strong>Cmd + Shift + I</strong> để gửi yêu cầu
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
              onClick={handleSubmit}
              disabled={selectedDocs.length === 0}
              className="px-5 py-2 text-xs font-bold text-white bg-amber-600 hover:bg-amber-700 active:bg-amber-800 disabled:opacity-50 rounded-xl shadow-xs transition-colors flex items-center gap-1.5"
            >
              <Send className="h-4 w-4" />
              <span>Gửi Yêu cầu Bổ sung</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
