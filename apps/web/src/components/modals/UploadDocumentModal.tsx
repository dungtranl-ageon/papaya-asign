'use client';

import React, { useState } from 'react';
import { Upload, X, AlertTriangle, Zap, CheckCircle2, Loader2 } from 'lucide-react';
import { useWorkstationStore } from '@/store';
import { ClaimDocument } from '@papaya/shared';

interface UploadDocumentModalProps {
  isOpen: boolean;
  onClose: () => void;
  claimId: string;
  missingTypes?: string[];
}

export function UploadDocumentModal({
  isOpen,
  onClose,
  claimId,
  missingTypes = [],
}: UploadDocumentModalProps) {
  const { addClaimDocument } = useWorkstationStore();

  const [docType, setDocType] = useState<string>(missingTypes[0] || 'HOSPITAL_DISCHARGE');
  const [fileName, setFileName] = useState<string>('giay_ra_vien_bo_sung_co_dau_moc.pdf');
  const [notes, setNotes] = useState<string>('Khách hàng bổ sung bản gốc có mộc tròn đỏ xác nhận.');
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSelectPreset = (type: string) => {
    setDocType(type);
    if (type === 'HOSPITAL_DISCHARGE') {
      setFileName('giay_ra_vien_bo_sung_co_dau_moc.pdf');
      setNotes('Bổ sung Giấy ra viện có mộc đỏ hợp lệ và chữ ký Giám đốc bệnh viện');
    } else if (type === 'DETAILED_INVOICE') {
      setFileName('bang_ke_chi_tiet_vien_phi_ro_net.pdf');
      setNotes('Bổ sung Bảng kê viện phí Mẫu 01/BV rõ nét, đầy đủ tiền phòng và thuốc');
    } else if (type === 'VAT_INVOICE') {
      setFileName('hoa_don_vat_dien_tu_co_ma_tra_cuu.pdf');
      setNotes('Bổ sung Hóa đơn điện tử có mã tra cứu cơ quan thuế');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fileName.trim()) {
      setError('Vui lòng nhập tên tập tin hoặc chọn tài liệu bổ sung');
      return;
    }

    setIsUploading(true);
    setError(null);

    try {
      await addClaimDocument(claimId, {
        docType: docType as ClaimDocument['docType'],
        fileName: fileName.trim(),
        status: 'VALID',
        notes: notes.trim(),
      });
      onClose();
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Lỗi khi tải lên chứng từ bổ sung';
      setError(msg);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="w-full max-w-lg rounded-2xl bg-white shadow-2xl border border-slate-200 overflow-hidden animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="px-5 py-4 bg-teal-50/80 border-b border-teal-100 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-teal-700 text-white shadow-2xs">
              <Upload className="h-4 w-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">Nạp Bổ Sung Chứng Từ Y Tế</h3>
              <p className="text-[11px] text-teal-800">
                Hồ sơ: <strong className="font-mono">{claimId}</strong> • Mastra AI sẽ tự động thẩm
                định lại
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {/* Missing items alert / recommendation */}
          {missingTypes.length > 0 && (
            <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl space-y-2">
              <div className="flex items-center gap-1.5 text-xs font-bold text-amber-900">
                <AlertTriangle className="h-3.5 w-3.5 text-amber-600" />
                <span>AI phát hiện thiếu hoặc cần thay thế các chứng từ sau:</span>
              </div>
              <div className="flex flex-wrap gap-1.5 pt-1">
                {missingTypes.map(type => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => handleSelectPreset(type)}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-bold border transition-all flex items-center gap-1 cursor-pointer ${
                      docType === type
                        ? 'bg-amber-600 text-white border-amber-600 shadow-2xs'
                        : 'bg-white text-amber-800 border-amber-200 hover:bg-amber-100'
                    }`}
                  >
                    <Zap className="h-3 w-3" />
                    <span>Chọn nhanh: {type}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Doc Type Selector */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              Loại chứng từ nộp bổ sung:
            </label>
            <select
              value={docType}
              onChange={e => handleSelectPreset(e.target.value)}
              className="w-full text-xs font-medium bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 cursor-pointer transition-all"
            >
              <option value="HOSPITAL_DISCHARGE">
                Giấy ra viện & Tóm tắt bệnh án (HOSPITAL_DISCHARGE)
              </option>
              <option value="DETAILED_INVOICE">
                Bảng kê chi tiết chi phí viện phí Mẫu 01/BV (DETAILED_INVOICE)
              </option>
              <option value="VAT_INVOICE">
                Hóa đơn giá trị gia tăng / Hóa đơn điện tử (VAT_INVOICE)
              </option>
              <option value="SURGICAL_REPORT">
                Biên bản phẫu thuật / Thủ thuật (SURGICAL_REPORT)
              </option>
              <option value="LAB_RESULT">Kết quả cận lâm sàng / Xét nghiệm (LAB_RESULT)</option>
              <option value="PRESCRIPTION">Toa thuốc xuất viện (PRESCRIPTION)</option>
              <option value="OTHER">Chứng từ y tế khác (OTHER)</option>
            </select>
          </div>

          {/* File Name */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              Tên tệp đính kèm:
            </label>
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={fileName}
                onChange={e => setFileName(e.target.value)}
                placeholder="VD: giay_ra_vien_bo_sung.pdf"
                className="w-full text-xs font-mono bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all"
              />
            </div>
            <p className="text-[10px] text-slate-400 mt-1">
              Định dạng hỗ trợ: PDF, JPEG, PNG (Tự động kích hoạt đối soát mộc đỏ và OCR).
            </p>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              Ghi chú kiểm định:
            </label>
            <textarea
              value={notes}
              onChange={e => setNotes(e.target.value)}
              rows={2}
              placeholder="Nhập ghi chú hoặc lý do bổ sung..."
              className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all resize-none"
            />
          </div>

          {/* Error Message */}
          {error && (
            <div className="p-2.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-rose-600 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Footer Actions */}
          <div className="pt-2 flex items-center justify-between border-t border-slate-100">
            <span className="text-[11px] text-slate-500 flex items-center gap-1">
              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
              <span>Trạng thái: Hợp lệ (VALID)</span>
            </span>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                disabled={isUploading}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer disabled:opacity-50"
              >
                Hủy
              </button>
              <button
                type="submit"
                disabled={isUploading}
                className="px-4 py-2 text-xs font-bold text-white bg-teal-700 hover:bg-teal-800 active:bg-teal-900 rounded-xl shadow-xs transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                {isUploading ? (
                  <>
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    <span>Đang nạp & Thẩm định lại...</span>
                  </>
                ) : (
                  <>
                    <Zap className="h-3.5 w-3.5 text-amber-400" />
                    <span>Nạp & Thẩm định lại ngay</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
