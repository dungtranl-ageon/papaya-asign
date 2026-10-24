'use client';

import React, { useState, useEffect } from 'react';
import {
  FileText,
  FileCheck,
  Receipt,
  FileSpreadsheet,
  Activity,
  ZoomIn,
  ZoomOut,
  RotateCw,
  RefreshCw,
  Eye,
  EyeOff,
  AlertTriangle,
  Stamp,
  X,
  ChevronRight,
  ShieldCheck,
  Calendar,
  Upload,
} from 'lucide-react';
import { Claim, ClaimDocument, maskNationalId } from '@papaya/shared';
import { UploadDocumentModal } from '@/components/modals/UploadDocumentModal';

interface DocumentInspectorProps {
  claim: Claim;
  missingTypes?: string[];
}

export function DocumentInspector({ claim, missingTypes = [] }: DocumentInspectorProps) {
  const [isPreviewOpen, setIsPreviewOpen] = useState<boolean>(false);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState<boolean>(false);
  const [activeDocIndex, setActiveDocIndex] = useState<number>(0);
  const [zoomLevel, setZoomLevel] = useState<number>(100);
  const [rotation, setRotation] = useState<number>(0);
  const [showOcrLayer, setShowOcrLayer] = useState<boolean>(true);

  const documents = claim.documents || [];
  const currentDoc: ClaimDocument | undefined = documents[activeDocIndex] || documents[0];

  const handleZoomIn = () => setZoomLevel(prev => Math.min(prev + 15, 160));
  const handleZoomOut = () => setZoomLevel(prev => Math.max(prev - 15, 70));
  const handleRotate = () => setRotation(prev => (prev + 90) % 360);
  const handleReset = () => {
    setZoomLevel(100);
    setRotation(0);
  };

  const handleOpenPreview = (index: number) => {
    setActiveDocIndex(index);
    handleReset();
    setIsPreviewOpen(true);
  };

  const handleClosePreview = () => {
    setIsPreviewOpen(false);
  };

  // Close on Escape key press
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isPreviewOpen) {
        handleClosePreview();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isPreviewOpen]);

  const getDocTypeLabel = (type: string) => {
    switch (type) {
      case 'HOSPITAL_DISCHARGE':
        return 'Giấy ra viện & Tóm tắt bệnh án';
      case 'DETAILED_INVOICE':
        return 'Bảng kê chi tiết chi phí';
      case 'VAT_INVOICE':
        return 'Hóa đơn giá trị gia tăng (VAT)';
      case 'MEDICAL_RECORD':
        return 'Hồ sơ bệnh án';
      case 'PRESCRIPTION':
        return 'Đơn thuốc điều trị';
      case 'LAB_RESULT':
        return 'Kết quả xét nghiệm / CĐHA';
      case 'SURGICAL_REPORT':
        return 'Biên bản phẫu thuật';
      case 'CLAIM_FORM':
        return 'Giấy yêu cầu bồi thường';
      default:
        return 'Chứng từ y tế';
    }
  };

  const getDocIcon = (type: string) => {
    switch (type) {
      case 'HOSPITAL_DISCHARGE':
        return <FileCheck className="h-4 w-4 text-emerald-600" />;
      case 'VAT_INVOICE':
      case 'DETAILED_INVOICE':
        return <Receipt className="h-4 w-4 text-teal-600" />;
      case 'LAB_RESULT':
        return <Activity className="h-4 w-4 text-cyan-600" />;
      default:
        return <FileText className="h-4 w-4 text-slate-600" />;
    }
  };

  const isInvalidDoc = currentDoc?.status === 'INVALID';

  return (
    <>
      {/* ================= COMPACT DOSSIER FILE LIST (IN-PAGE) ================= */}
      <div className="flex flex-col rounded-xl border border-slate-200 bg-white overflow-hidden shadow-2xs">
        {/* Header */}
        <div className="bg-slate-50/90 px-4 py-3 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-teal-50 text-teal-700 border border-teal-200/60">
              <FileSpreadsheet className="h-4 w-4" />
            </div>
            <div>
              <h3 className="text-xs font-bold text-slate-800">Danh mục chứng từ đính kèm</h3>
              <p className="text-[10px] text-slate-500">
                Nhấp vào từng chứng từ để mở bản xem trước và lớp đối soát OCR
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[11px] font-semibold text-slate-600 bg-slate-200/70 px-2 py-0.5 rounded-full">
              {documents.length} tập tin
            </span>
            <button
              type="button"
              onClick={() => setIsUploadModalOpen(true)}
              className="flex items-center gap-1 px-2.5 py-1 text-xs font-bold text-teal-800 bg-teal-50 hover:bg-teal-100 border border-teal-200/80 rounded-lg transition-all cursor-pointer shadow-2xs"
              title="Tải lên chứng từ bổ sung"
            >
              <Upload className="h-3.5 w-3.5 text-teal-700" />
              <span>Bổ sung chứng từ</span>
            </button>
          </div>
        </div>

        {/* File List Items */}
        <div className="p-3 divide-y divide-slate-100">
          {documents.map((doc, idx) => {
            const isInvalid = doc.status === 'INVALID';
            return (
              <div
                key={doc.docId || idx}
                onClick={() => handleOpenPreview(idx)}
                className="group py-2.5 px-3 flex items-center justify-between rounded-lg hover:bg-teal-50/40 hover:border-teal-200 border border-transparent transition-all cursor-pointer"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="p-2 rounded-lg bg-slate-100 group-hover:bg-white group-hover:shadow-2xs transition-all shrink-0">
                    {getDocIcon(doc.docType)}
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-semibold text-slate-800 group-hover:text-teal-900 truncate">
                        {doc.fileName}
                      </span>
                      <span className="font-mono text-[10px] text-slate-400">({doc.docId})</span>
                    </div>
                    <div className="flex items-center gap-2 text-[11px] text-slate-500 mt-0.5">
                      <span>{getDocTypeLabel(doc.docType)}</span>
                      <span>•</span>
                      <span className="flex items-center gap-1 text-[10px]">
                        <Calendar className="h-3 w-3 text-slate-400" />
                        {new Date(doc.uploadedAt).toLocaleDateString('vi-VN')}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3 shrink-0 ml-3">
                  {/* Status Badge */}
                  {isInvalid ? (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-800 border border-amber-200">
                      <AlertTriangle className="h-3 w-3 text-amber-600" />
                      Cần kiểm tra (Mờ)
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
                      <ShieldCheck className="h-3 w-3 text-emerald-600" />
                      Hợp lệ (OCR 99%)
                    </span>
                  )}

                  {/* Action Button */}
                  <button
                    type="button"
                    onClick={e => {
                      e.stopPropagation();
                      handleOpenPreview(idx);
                    }}
                    className="flex items-center gap-1 px-2.5 py-1 text-xs font-semibold rounded-lg bg-white group-hover:bg-teal-700 text-slate-700 group-hover:text-white border border-slate-200 group-hover:border-teal-700 shadow-2xs transition-all cursor-pointer"
                  >
                    <Eye className="h-3.5 w-3.5" />
                    <span className="hidden sm:inline">Xem trước</span>
                    <ChevronRight className="h-3.5 w-3.5 opacity-60" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Missing Types Recommendation Alert - Directly UNDERNEATH document list */}
        {missingTypes && missingTypes.length > 0 && (
          <div className="m-3 p-3 rounded-xl bg-amber-50 border border-amber-200/90 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs shadow-2xs">
            <div className="flex items-start gap-2.5 text-amber-900">
              <AlertTriangle className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold text-amber-950">
                  Bước 1: Hồ sơ thiếu chứng từ bắt buộc (Yêu cầu bổ sung)
                </p>
                <p className="text-[11px] text-amber-800 mt-0.5">
                  Cần bổ sung:{' '}
                  <strong className="font-semibold text-amber-950 font-mono">
                    {missingTypes
                      .map(t =>
                        t === 'HOSPITAL_DISCHARGE'
                          ? 'Giấy ra viện (HOSPITAL_DISCHARGE)'
                          : t === 'VAT_INVOICE'
                            ? 'Hóa đơn VAT (VAT_INVOICE)'
                            : t === 'DETAILED_INVOICE'
                              ? 'Bảng kê chi tiết (DETAILED_INVOICE)'
                              : t,
                      )
                      .join(', ')}
                  </strong>
                  . Vui lòng nộp chứng từ hợp lệ để hoàn tất Bước 1 và tiếp tục quy trình thẩm định.
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setIsUploadModalOpen(true)}
              className="px-3 py-1.5 text-xs font-bold text-white bg-amber-600 hover:bg-amber-700 active:bg-amber-800 rounded-lg shadow-2xs transition-colors shrink-0 cursor-pointer flex items-center gap-1.5 self-end sm:self-auto"
            >
              <Upload className="h-3.5 w-3.5" />
              <span>Bổ sung chứng từ ngay</span>
            </button>
          </div>
        )}
      </div>

      {/* ================= MODAL PREVIEW HIGH-FI INSPECTOR ================= */}
      {isPreviewOpen && currentDoc && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-900/70 backdrop-blur-xs animate-in fade-in duration-200">
          <div
            className="relative w-full max-w-4xl max-h-[92vh] flex flex-col rounded-2xl bg-white shadow-2xl border border-slate-200 overflow-hidden animate-in zoom-in-95 duration-200"
            onClick={e => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="px-5 py-3.5 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800">
              <div className="flex items-center gap-3 min-w-0">
                <div className="p-2 rounded-xl bg-teal-600 text-white shadow-2xs shrink-0">
                  <FileText className="h-4 w-4" />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-bold text-white truncate">{currentDoc.fileName}</h3>
                    <span className="font-mono text-xs text-teal-300">({currentDoc.docId})</span>
                  </div>
                  <p className="text-[11px] text-slate-300">
                    {getDocTypeLabel(currentDoc.docType)} • Ngày tải lên:{' '}
                    {new Date(currentDoc.uploadedAt).toLocaleDateString('vi-VN')}
                  </p>
                </div>
              </div>

              {/* Close Button */}
              <button
                onClick={handleClosePreview}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer shrink-0"
                title="Đóng bản xem trước (Esc)"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Document Tabs in Modal (for easy switching between files) */}
            <div className="bg-slate-100 px-4 pt-2 border-b border-slate-200 flex items-center justify-between overflow-x-auto no-scrollbar">
              <div className="flex items-center gap-1.5">
                {documents.map((doc, idx) => (
                  <button
                    key={doc.docId || idx}
                    onClick={() => {
                      setActiveDocIndex(idx);
                      handleReset();
                    }}
                    className={`px-3 py-1.5 rounded-t-lg text-xs font-semibold flex items-center gap-2 border-t border-x transition-all cursor-pointer ${
                      activeDocIndex === idx
                        ? 'bg-white text-teal-800 border-slate-200 shadow-2xs'
                        : 'bg-transparent text-slate-500 hover:text-slate-800 border-transparent hover:bg-slate-200/60'
                    }`}
                  >
                    {getDocIcon(doc.docType)}
                    <span className="truncate max-w-[140px]">{doc.fileName}</span>
                    {doc.status === 'VALID' ? (
                      <span className="h-2 w-2 rounded-full bg-emerald-500" title="Hợp lệ" />
                    ) : (
                      <span className="h-2 w-2 rounded-full bg-amber-500" title="Cần kiểm tra" />
                    )}
                  </button>
                ))}
              </div>

              <span className="text-[11px] font-medium text-slate-500 pb-1.5 px-2 shrink-0">
                {activeDocIndex + 1} / {documents.length} tài liệu
              </span>
            </div>

            {/* Interactive Toolbar */}
            <div className="px-4 py-2 bg-slate-50 border-b border-slate-200 flex items-center justify-between text-xs">
              <div className="flex items-center gap-1.5">
                <button
                  onClick={handleZoomIn}
                  className="p-1.5 rounded bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 transition-colors cursor-pointer"
                  title="Phóng to (+15%)"
                >
                  <ZoomIn className="h-3.5 w-3.5" />
                </button>
                <button
                  onClick={handleZoomOut}
                  className="p-1.5 rounded bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 transition-colors cursor-pointer"
                  title="Thu nhỏ (-15%)"
                >
                  <ZoomOut className="h-3.5 w-3.5" />
                </button>
                <span className="text-[11px] font-mono font-medium text-slate-600 px-1">
                  {zoomLevel}%
                </span>
                <button
                  onClick={handleRotate}
                  className="p-1.5 rounded bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 transition-colors cursor-pointer ml-1"
                  title="Xoay 90 độ"
                >
                  <RotateCw className="h-3.5 w-3.5" />
                </button>
                <button
                  onClick={handleReset}
                  className="p-1.5 rounded bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 transition-colors cursor-pointer"
                  title="Đặt lại khung nhìn"
                >
                  <RefreshCw className="h-3.5 w-3.5" />
                </button>
              </div>

              {/* Toggle OCR Highlight Layer */}
              <button
                onClick={() => setShowOcrLayer(prev => !prev)}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold flex items-center gap-1.5 border transition-all cursor-pointer ${
                  showOcrLayer
                    ? 'bg-teal-50 border-teal-200 text-teal-800'
                    : 'bg-white border-slate-200 text-slate-500 hover:text-slate-700'
                }`}
                title="Bật/tắt lớp khung nhận diện quang học (OCR Bounding Boxes)"
              >
                {showOcrLayer ? (
                  <Eye className="h-3.5 w-3.5 text-teal-600" />
                ) : (
                  <EyeOff className="h-3.5 w-3.5" />
                )}
                <span>Lớp nhận diện OCR</span>
              </button>
            </div>

            {/* Modal Canvas Preview Area */}
            <div className="relative flex-1 bg-slate-100/90 overflow-auto p-6 flex items-center justify-center select-none min-h-[360px] max-h-[58vh]">
              <div
                className={`bg-white rounded-lg shadow-md border border-slate-200 p-6 max-w-lg w-full transition-transform duration-200 relative ${
                  isInvalidDoc ? 'blur-[1.5px]' : ''
                }`}
                style={{
                  transform: `scale(${zoomLevel / 100}) rotate(${rotation}deg)`,
                  transformOrigin: 'center center',
                }}
              >
                {/* Header of Medical Document */}
                <div className="border-b-2 border-slate-800 pb-3 mb-4 flex justify-between items-start">
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                      HỒ SƠ KHÁM CHỮA BỆNH CHÍNH THỨC
                    </p>
                    <h4 className="font-extrabold text-slate-900 text-sm">{claim.hospitalName}</h4>
                    <p className="text-[10px] text-slate-500">
                      Loại chứng từ: {currentDoc?.docType || 'HỒ SƠ Y TẾ'}
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] font-mono text-slate-400 block">Số chứng từ:</span>
                    <span className="font-mono font-bold text-xs text-slate-800">
                      {currentDoc?.docId || claim.claimId}
                    </span>
                  </div>
                </div>

                {/* Document Content based on Active Tab */}
                <div className="space-y-3 text-xs leading-relaxed">
                  <div className="text-center py-1">
                    <h3 className="font-black text-slate-900 text-sm uppercase tracking-wide">
                      {currentDoc?.docType === 'HOSPITAL_DISCHARGE'
                        ? 'GIẤY RA VIỆN & TÓM TẮT BỆNH ÁN'
                        : currentDoc?.docType === 'VAT_INVOICE'
                          ? 'HÓA ĐƠN GIÁ TRỊ GIA TĂNG (ĐIỆN TỬ)'
                          : 'BẢNG KÊ CHI TIẾT CHI PHÍ ĐIỀU TRỊ'}
                    </h3>
                    <p className="text-[10px] text-slate-500">
                      Ngày phát hành: {new Date(claim.dischargeDate).toLocaleDateString('vi-VN')}
                    </p>
                  </div>

                  {/* Patient Details */}
                  <div className="grid grid-cols-2 gap-2 text-[11px] bg-slate-50 p-2.5 rounded border border-slate-100">
                    <div>
                      <span className="text-slate-500">Họ và tên:</span>{' '}
                      <strong
                        className={`relative ${showOcrLayer ? 'bg-emerald-100/70 px-1 rounded text-emerald-950 font-bold' : ''}`}
                      >
                        {claim.patientName}
                      </strong>
                    </div>
                    <div>
                      <span className="text-slate-500">Số CCCD:</span>{' '}
                      <strong
                        className={`font-mono relative ${showOcrLayer ? 'bg-emerald-100/70 px-1 rounded text-emerald-950' : ''}`}
                      >
                        {maskNationalId(claim.nationalId)}
                      </strong>
                    </div>
                    <div className="col-span-2">
                      <span className="text-slate-500">Chẩn đoán:</span>{' '}
                      <strong
                        className={`relative ${showOcrLayer ? 'bg-teal-100/80 px-1 rounded text-teal-950' : ''}`}
                      >
                        [{claim.diagnosisIcd10}] {claim.diagnosisDescription}
                      </strong>
                    </div>
                  </div>

                  {/* Itemized Table if Detailed Invoice */}
                  <div className="border border-slate-200 rounded overflow-hidden">
                    <table className="w-full text-left text-[11px]">
                      <thead className="bg-slate-100 font-semibold text-slate-700">
                        <tr>
                          <th className="p-1.5">Nội dung</th>
                          <th className="p-1.5 text-right">Số tiền (VND)</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {claim.items.map(item => (
                          <tr key={item.itemId}>
                            <td className="p-1.5">{item.description}</td>
                            <td className="p-1.5 text-right font-mono">
                              {item.amountRequested.toLocaleString()}
                            </td>
                          </tr>
                        ))}
                        <tr className="bg-slate-50 font-bold text-slate-900">
                          <td className="p-1.5">TỔNG CỘNG THANH TOÁN:</td>
                          <td
                            className={`p-1.5 text-right font-mono relative ${
                              showOcrLayer
                                ? 'bg-emerald-100 px-1 rounded text-emerald-900 border border-emerald-300'
                                : ''
                            }`}
                          >
                            {claim.totalRequested.toLocaleString()} VND
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>

                  {/* Official Hospital Seal & Doctor Stamp */}
                  <div className="pt-3 flex justify-between items-end">
                    <div className="text-[10px] text-slate-400">
                      Mã tra cứu HĐ: {currentDoc?.docId || 'DOC-001'}
                    </div>

                    <div className="text-center relative">
                      <span className="text-[10px] text-slate-500 block mb-1">
                        TRƯỞNG KHOA / ĐẠI DIỆN BỆNH VIỆN
                      </span>
                      <span className="font-serif italic font-bold text-xs text-slate-800 block">
                        BS. CKI Nguyễn Văn Hoàng
                      </span>

                      {/* Simulated Hospital Red Stamp */}
                      <div
                        className={`mt-1 inline-flex items-center gap-1 border-2 border-rose-600 text-rose-600 rounded-full px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wider rotate-[-6deg] opacity-90 ${
                          showOcrLayer ? 'ring-2 ring-emerald-500 ring-offset-1' : ''
                        }`}
                      >
                        <Stamp className="h-3 w-3" />
                        <span>DẤU MỘC TRÒN BỆNH VIỆN FV - HỢP LỆ</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Invalid Document Warning Overlay */}
                {isInvalidDoc && (
                  <div className="absolute inset-0 bg-amber-500/10 backdrop-blur-[1px] flex flex-col items-center justify-center p-4 rounded-lg pointer-events-none">
                    <div className="bg-white/95 border-2 border-amber-500 p-3 rounded-xl shadow-lg flex items-center gap-2.5 text-amber-900 max-w-xs text-center">
                      <AlertTriangle className="h-6 w-6 text-amber-600 shrink-0" />
                      <div className="text-left">
                        <p className="font-bold text-xs">CẢNH BÁO TÀI LIỆU KHÔNG HỢP LỆ</p>
                        <p className="text-[11px] text-slate-600">
                          Bản chụp bị mờ nhòe, không đọc rõ số tiền và mộc đỏ. Yêu cầu nộp lại.
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Modal Footer */}
            <div className="px-5 py-3 bg-slate-50 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-600">
              <div className="flex items-center gap-4">
                <span>
                  Độ tin cậy OCR:{' '}
                  <strong className="text-emerald-700 font-semibold">
                    {isInvalidDoc ? '⚠️ 68.4% (FAILED)' : '✓ 99.2% (PASSED)'}
                  </strong>
                </span>
                <span>
                  Con dấu bệnh viện:{' '}
                  <strong className="text-slate-800 font-semibold">
                    {isInvalidDoc ? 'Không rõ nét' : 'Mộc đỏ chuẩn hợp lệ'}
                  </strong>
                </span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleClosePreview}
                  className="px-4 py-1.5 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-slate-900 text-white shadow-2xs transition-all cursor-pointer"
                >
                  Đóng bản xem trước
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Upload Document Modal */}
      <UploadDocumentModal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        claimId={claim.claimId}
        missingTypes={missingTypes}
      />
    </>
  );
}
