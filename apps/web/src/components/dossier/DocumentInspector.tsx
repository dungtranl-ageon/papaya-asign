'use client';

import React, { useState } from 'react';
import {
  FileText,
  ZoomIn,
  ZoomOut,
  RotateCw,
  RefreshCw,
  Eye,
  EyeOff,
  AlertTriangle,
  Stamp,
} from 'lucide-react';
import { Claim } from '@papaya/shared';

interface DocumentInspectorProps {
  claim: Claim;
}

export function DocumentInspector({ claim }: DocumentInspectorProps) {
  const [activeDocIndex, setActiveDocIndex] = useState<number>(0);
  const [zoomLevel, setZoomLevel] = useState<number>(100);
  const [rotation, setRotation] = useState<number>(0);
  const [showOcrLayer, setShowOcrLayer] = useState<boolean>(true);

  const documents = claim.documents;
  const currentDoc = documents[activeDocIndex] || documents[0];

  const handleZoomIn = () => setZoomLevel(prev => Math.min(prev + 15, 160));
  const handleZoomOut = () => setZoomLevel(prev => Math.max(prev - 15, 70));
  const handleRotate = () => setRotation(prev => (prev + 90) % 360);
  const handleReset = () => {
    setZoomLevel(100);
    setRotation(0);
  };

  const isInvalidDoc = currentDoc?.status === 'INVALID';

  return (
    <div className="flex flex-col rounded-xl border border-slate-200 bg-white overflow-hidden shadow-2xs">
      {/* Top Header: Tabs for attached files */}
      <div className="bg-slate-100/80 px-3 pt-2.5 border-b border-slate-200 flex items-center justify-between overflow-x-auto no-scrollbar">
        <div className="flex items-center gap-1.5">
          {documents.map((doc, idx) => (
            <button
              key={doc.docId}
              onClick={() => {
                setActiveDocIndex(idx);
                handleReset();
              }}
              className={`px-3 py-1.5 rounded-t-lg text-xs font-semibold flex items-center gap-2 border-t border-x transition-all cursor-pointer ${
                activeDocIndex === idx
                  ? 'bg-white text-teal-800 border-slate-200 shadow-2xs'
                  : 'bg-transparent text-slate-500 hover:text-slate-800 border-transparent hover:bg-slate-200/50'
              }`}
            >
              <FileText className="h-3.5 w-3.5" />
              <span className="truncate max-w-[130px]">{doc.fileName}</span>
              {doc.status === 'VALID' ? (
                <span className="h-2 w-2 rounded-full bg-emerald-500" title="Hợp lệ" />
              ) : (
                <span className="h-2 w-2 rounded-full bg-amber-500" title="Cần kiểm tra" />
              )}
            </button>
          ))}
        </div>

        {/* Total Documents count badge */}
        <span className="text-[11px] font-semibold text-slate-500 pb-1.5 px-2">
          {documents.length} tài liệu
        </span>
      </div>

      {/* Interactive Controls Toolbar */}
      <div className="px-3.5 py-2 bg-slate-50 border-b border-slate-200 flex items-center justify-between text-xs">
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

      {/* Document Canvas Preview Area */}
      <div className="relative h-80 bg-slate-100 overflow-auto p-4 flex items-center justify-center select-none">
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
                SỞ Y TẾ TP. HỒ CHÍ MINH
              </p>
              <h4 className="font-extrabold text-slate-900 text-sm">{claim.hospitalName}</h4>
              <p className="text-[10px] text-slate-500">Mẫu chứng từ: 01/BV-BH2026</p>
            </div>
            <div className="text-right">
              <span className="text-[10px] font-mono text-slate-400 block">Số hồ sơ:</span>
              <span className="font-mono font-bold text-xs text-slate-800">{claim.claimId}</span>
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
                  {claim.nationalId}
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

      {/* Bottom OCR Extracted Summary Bar */}
      <div className="px-4 py-2 bg-slate-50 border-t border-slate-200 flex flex-wrap items-center justify-between text-xs text-slate-600">
        <div className="flex items-center gap-3">
          <span>
            OCR Status:{' '}
            <strong className="text-emerald-700 font-semibold">
              {isInvalidDoc ? '⚠️ Độ mờ 68% (FAILED)' : '✓ Hoàn tất (99.2%)'}
            </strong>
          </span>
          <span>
            Dấu mộc:{' '}
            <strong className="text-slate-800 font-semibold">
              {isInvalidDoc ? 'Không rõ nét' : 'Tròn đỏ hợp chuẩn'}
            </strong>
          </span>
        </div>
        <div className="text-slate-500 text-[11px]">
          Tập tin: <strong>{currentDoc?.fileName}</strong> ({currentDoc?.docType})
        </div>
      </div>
    </div>
  );
}
