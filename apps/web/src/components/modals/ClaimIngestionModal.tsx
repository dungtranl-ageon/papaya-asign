'use client';

import React, { useState } from 'react';
import {
  X,
  PlusCircle,
  FileText,
  UploadCloud,
  CheckCircle2,
  AlertTriangle,
  Sparkles,
  Zap,
  Building,
  User,
  Trash2,
} from 'lucide-react';
import { ClaimStatus } from '@papaya/shared';

export interface IngestedClaimData {
  id: string;
  policyId: string;
  insuredName: string;
  nationalId: string;
  phone: string;
  email: string;
  hospitalName: string;
  hospitalType: string;
  admissionDate: string;
  dischargeDate: string;
  icd10Code: string;
  icd10Description: string;
  treatmentType: 'INPATIENT' | 'OUTPATIENT' | 'DENTAL';
  claimedAmount: number;
  documents: Array<{
    id: string;
    docType: string;
    fileName: string;
    status: 'VALID' | 'INVALID' | 'PENDING';
    note: string;
  }>;
  status: ClaimStatus;
  createdAt: string;
}

interface ClaimIngestionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (claimData: IngestedClaimData) => void;
}

export function ClaimIngestionModal({ isOpen, onClose, onSubmit }: ClaimIngestionModalProps) {
  // Preset selector
  const [selectedPreset, setSelectedPreset] = useState<'TC01' | 'TC02' | 'TC03' | 'CUSTOM'>('TC01');

  // Form Fields
  const [policyId, setPolicyId] = useState('POL-2024-8891');
  const [insuredName, setInsuredName] = useState('Nguyễn Văn A');
  const [nationalId, setNationalId] = useState('079090012345');
  const [phone, setPhone] = useState('0908123456');
  const [email, setEmail] = useState('nguyenvana@gmail.com');

  const [hospitalName, setHospitalName] = useState('Bệnh viện FV (Pháp Việt)');
  const [hospitalType] = useState('Tư nhân / Quốc tế');
  const [admissionDate, setAdmissionDate] = useState('2026-03-10');
  const [dischargeDate, setDischargeDate] = useState('2026-03-13');
  const [icd10Code, setIcd10Code] = useState('K35.8');
  const [icd10Description, setIcd10Description] = useState(
    'Viêm ruột thừa cấp khác và không xác định',
  );
  const [treatmentType, setTreatmentType] = useState<'INPATIENT' | 'OUTPATIENT' | 'DENTAL'>(
    'INPATIENT',
  );

  const [claimedAmount, setClaimedAmount] = useState<number>(18500000);

  // Documents attached
  const [documents, setDocuments] = useState<
    Array<{
      id: string;
      docType: string;
      fileName: string;
      status: 'VALID' | 'INVALID' | 'PENDING';
      note: string;
    }>
  >([
    {
      id: 'doc-1',
      docType: 'Giấy ra viện (Bản gốc)',
      fileName: 'giay_ra_vien_nguyen_van_a.pdf',
      status: 'VALID',
      note: 'Đầy đủ chữ ký BS & Mộc đỏ BV',
    },
    {
      id: 'doc-2',
      docType: 'Bảng kê viện phí mẫu 01/BV',
      fileName: 'bang_ke_chi_phi_fv.pdf',
      status: 'VALID',
      note: 'Khớp 18.500.000 đ',
    },
    {
      id: 'doc-3',
      docType: 'Hóa đơn VAT điện tử',
      fileName: 'hoa_don_vat_003891.pdf',
      status: 'VALID',
      note: 'Mã tra cứu hóa đơn hợp lệ trên TCT',
    },
  ]);

  if (!isOpen) return null;

  const loadPreset = (preset: 'TC01' | 'TC02' | 'TC03') => {
    setSelectedPreset(preset);
    if (preset === 'TC01') {
      setPolicyId('POL-2024-8891');
      setInsuredName('Nguyễn Văn A');
      setNationalId('079090012345');
      setPhone('0908123456');
      setEmail('nguyenvana@gmail.com');
      setHospitalName('Bệnh viện FV (Pháp Việt)');
      setAdmissionDate('2026-03-10');
      setDischargeDate('2026-03-13');
      setIcd10Code('K35.8');
      setIcd10Description('Viêm ruột thừa cấp khác và không xác định');
      setTreatmentType('INPATIENT');
      setClaimedAmount(18500000);
      setDocuments([
        {
          id: 'doc-1',
          docType: 'Giấy ra viện (Bản gốc)',
          fileName: 'giay_ra_vien_nguyen_van_a.pdf',
          status: 'VALID',
          note: 'Đầy đủ chữ ký BS & Mộc đỏ BV',
        },
        {
          id: 'doc-2',
          docType: 'Bảng kê viện phí mẫu 01/BV',
          fileName: 'bang_ke_chi_phi_fv.pdf',
          status: 'VALID',
          note: 'Khớp 18.500.000 đ',
        },
        {
          id: 'doc-3',
          docType: 'Hóa đơn VAT điện tử',
          fileName: 'hoa_don_vat_003891.pdf',
          status: 'VALID',
          note: 'Mã tra cứu hóa đơn hợp lệ trên TCT',
        },
      ]);
    } else if (preset === 'TC02') {
      setPolicyId('POL-2026-1029');
      setInsuredName('Trần Thị B');
      setNationalId('079185009988');
      setPhone('0912334455');
      setEmail('tranthib@gmail.com');
      setHospitalName('Bệnh viện Chợ Rẫy TP.HCM');
      setAdmissionDate('2026-01-20');
      setDischargeDate('2026-01-24');
      setIcd10Code('K29.7');
      setIcd10Description('Viêm dạ dày mạn tính không đặc hiệu');
      setTreatmentType('INPATIENT');
      setClaimedAmount(12000000);
      setDocuments([
        {
          id: 'doc-1',
          docType: 'Giấy ra viện (Bản gốc)',
          fileName: 'giay_ra_vien_cho_ray_b.pdf',
          status: 'VALID',
          note: 'Điều trị nội trú 4 ngày',
        },
        {
          id: 'doc-2',
          docType: 'Bảng kê viện phí mẫu 01/BV',
          fileName: 'bang_ke_vien_phi_cho_ray.pdf',
          status: 'VALID',
          note: 'Tổng chi phí 12.000.000 đ',
        },
        {
          id: 'doc-3',
          docType: 'Hóa đơn VAT điện tử',
          fileName: 'hoa_don_dien_tu_cho_ray.pdf',
          status: 'VALID',
          note: 'Khớp mã tra cứu',
        },
      ]);
    } else if (preset === 'TC03') {
      setPolicyId('POL-2025-4421');
      setInsuredName('Lê Văn C');
      setNationalId('079080001122');
      setPhone('0987654321');
      setEmail('levanc@gmail.com');
      setHospitalName('Bệnh viện Đa khoa Quốc tế Vinmec');
      setAdmissionDate('2026-03-01');
      setDischargeDate('2026-03-02');
      setIcd10Code('S82.1');
      setIcd10Description('Gãy đầu trên xương chày do tai nạn');
      setTreatmentType('INPATIENT');
      setClaimedAmount(25000000);
      setDocuments([
        {
          id: 'doc-1',
          docType: 'Giấy ra viện (Bản scan)',
          fileName: 'giay_ra_vien_vinmec.pdf',
          status: 'VALID',
          note: 'Chữ ký bác sĩ đầy đủ',
        },
        {
          id: 'doc-2',
          docType: 'Bảng kê viện phí mẫu 01/BV',
          fileName: 'bang_ke_vinmec_bi_mo.pdf',
          status: 'INVALID',
          note: 'Bản scan nhòe số tiền, không đọc được OCR',
        },
        {
          id: 'doc-3',
          docType: 'Hóa đơn VAT điện tử',
          fileName: 'chua_nop_hoa_don_vat.pdf',
          status: 'PENDING',
          note: 'Khách hàng chưa nộp hóa đơn VAT gốc',
        },
      ]);
    }
  };

  const handleCreate = () => {
    const newClaim = {
      id: `CLM-${new Date().getFullYear()}-${Math.floor(10000 + Math.random() * 90000)}`,
      policyId,
      insuredName,
      nationalId,
      phone,
      email,
      hospitalName,
      hospitalType,
      admissionDate,
      dischargeDate,
      icd10Code,
      icd10Description,
      treatmentType,
      claimedAmount,
      documents,
      status: 'ASSESSING' as ClaimStatus,
      createdAt: new Date().toISOString(),
    };
    onSubmit(newClaim);
    onClose();
  };

  const addCustomDoc = () => {
    const newDoc = {
      id: `doc-${Date.now()}`,
      docType: 'Chứng từ bổ sung mới',
      fileName: 'tai_lieu_dinh_kem_moi.pdf',
      status: 'VALID' as const,
      note: 'Vừa upload thành công',
    };
    setDocuments(prev => [...prev, newDoc]);
  };

  const removeDoc = (id: string) => {
    setDocuments(prev => prev.filter(d => d.id !== id));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="w-full max-w-3xl rounded-2xl bg-white shadow-2xl border border-slate-200 overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 bg-teal-50/80 border-b border-teal-100 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-teal-700 text-white shadow-2xs">
              <PlusCircle className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                Tiếp Nhận & Khởi Tạo Hồ Sơ Yêu Cầu Bồi Thường Mới
              </h3>
              <p className="text-[11px] text-teal-800">
                Nhập dữ liệu đầu vào hoặc chọn nhanh kịch bản kiểm thử (TC-01, TC-02, TC-03)
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

        {/* Quick Presets Bar */}
        <div className="px-6 py-2.5 bg-slate-50 border-b border-slate-200 flex items-center justify-between gap-2 shrink-0">
          <span className="text-[11px] font-bold text-slate-700 flex items-center gap-1">
            <Zap className="h-3.5 w-3.5 text-amber-500" /> Chọn kịch bản mẫu nhanh:
          </span>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => loadPreset('TC01')}
              className={`px-2.5 py-1 text-[11px] font-bold rounded-lg transition-all cursor-pointer ${
                selectedPreset === 'TC01'
                  ? 'bg-teal-700 text-white shadow-xs'
                  : 'bg-white text-slate-700 border border-slate-200 hover:bg-teal-50 hover:text-teal-800'
              }`}
            >
              TC-01: Ruột thừa cấp (Hợp lệ)
            </button>

            <button
              type="button"
              onClick={() => loadPreset('TC02')}
              className={`px-2.5 py-1 text-[11px] font-bold rounded-lg transition-all cursor-pointer ${
                selectedPreset === 'TC02'
                  ? 'bg-rose-700 text-white shadow-xs'
                  : 'bg-white text-slate-700 border border-slate-200 hover:bg-rose-50 hover:text-rose-800'
              }`}
            >
              TC-02: Dạ dày (Thời gian chờ)
            </button>

            <button
              type="button"
              onClick={() => loadPreset('TC03')}
              className={`px-2.5 py-1 text-[11px] font-bold rounded-lg transition-all cursor-pointer ${
                selectedPreset === 'TC03'
                  ? 'bg-amber-700 text-white shadow-xs'
                  : 'bg-white text-slate-700 border border-slate-200 hover:bg-amber-50 hover:text-amber-800'
              }`}
            >
              TC-03: Thiếu chứng từ (Cần bổ sung)
            </button>
          </div>
        </div>

        {/* Body Scrollable */}
        <div className="p-6 space-y-6 overflow-y-auto flex-1 text-xs">
          {/* Section 1: Member & Policy */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5 pb-1 border-b border-slate-100">
              <User className="h-3.5 w-3.5 text-teal-600" />
              <span>1. Thông tin Người được Bảo hiểm & Hợp đồng</span>
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="text-[11px] text-slate-600 font-medium block mb-1">
                  Số Hợp đồng / Thẻ
                </label>
                <input
                  type="text"
                  value={policyId}
                  onChange={e => setPolicyId(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs font-mono font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:bg-white"
                />
              </div>

              <div>
                <label className="text-[11px] text-slate-600 font-medium block mb-1">
                  Họ và tên khách hàng
                </label>
                <input
                  type="text"
                  value={insuredName}
                  onChange={e => setInsuredName(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:bg-white"
                />
              </div>

              <div>
                <label className="text-[11px] text-slate-600 font-medium block mb-1">
                  Số CCCD / CMND
                </label>
                <input
                  type="text"
                  value={nationalId}
                  onChange={e => setNationalId(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs font-mono text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:bg-white"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-[11px] text-slate-600 font-medium block mb-1">
                  Số điện thoại
                </label>
                <input
                  type="text"
                  value={phone}
                  onChange={e => setPhone(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:bg-white"
                />
              </div>

              <div>
                <label className="text-[11px] text-slate-600 font-medium block mb-1">
                  Email nhận thông báo
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:bg-white"
                />
              </div>
            </div>
          </div>

          {/* Section 2: Medical Event & Diagnosis */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5 pb-1 border-b border-slate-100">
              <Building className="h-3.5 w-3.5 text-teal-600" />
              <span>2. Thông tin Sự kiện Y tế & Chẩn đoán Bệnh</span>
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-[11px] text-slate-600 font-medium block mb-1">
                  Cơ sở Y tế Khám chữa bệnh
                </label>
                <input
                  type="text"
                  value={hospitalName}
                  onChange={e => setHospitalName(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:bg-white"
                />
              </div>

              <div>
                <label className="text-[11px] text-slate-600 font-medium block mb-1">
                  Phân loại Điều trị
                </label>
                <select
                  value={treatmentType}
                  onChange={e =>
                    setTreatmentType(e.target.value as 'INPATIENT' | 'OUTPATIENT' | 'DENTAL')
                  }
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:bg-white"
                >
                  <option value="INPATIENT">Điều trị Nội trú (Phẫu thuật / Nằm viện)</option>
                  <option value="OUTPATIENT">Điều trị Ngoại trú (Khám bệnh trong ngày)</option>
                  <option value="DENTAL">Chăm sóc Nha khoa</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
              <div>
                <label className="text-[11px] text-slate-600 font-medium block mb-1">
                  Mã bệnh ICD-10
                </label>
                <input
                  type="text"
                  value={icd10Code}
                  onChange={e => setIcd10Code(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs font-mono font-bold text-teal-700 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:bg-white"
                />
              </div>

              <div className="sm:col-span-3">
                <label className="text-[11px] text-slate-600 font-medium block mb-1">
                  Tên chẩn đoán y khoa
                </label>
                <input
                  type="text"
                  value={icd10Description}
                  onChange={e => setIcd10Description(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:bg-white"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="text-[11px] text-slate-600 font-medium block mb-1">
                  Ngày nhập viện
                </label>
                <input
                  type="date"
                  value={admissionDate}
                  onChange={e => setAdmissionDate(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs font-mono text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:bg-white"
                />
              </div>

              <div>
                <label className="text-[11px] text-slate-600 font-medium block mb-1">
                  Ngày xuất viện
                </label>
                <input
                  type="date"
                  value={dischargeDate}
                  onChange={e => setDischargeDate(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs font-mono text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:bg-white"
                />
              </div>

              <div>
                <label className="text-[11px] text-slate-600 font-medium block mb-1">
                  Tổng chi phí yêu cầu (VNĐ)
                </label>
                <input
                  type="number"
                  step="500000"
                  value={claimedAmount}
                  onChange={e => setClaimedAmount(Number(e.target.value))}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs font-mono font-bold text-teal-800 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:bg-white"
                />
              </div>
            </div>
          </div>

          {/* Section 3: Document Attachments & OCR Simulation */}
          <div className="space-y-3">
            <div className="flex items-center justify-between pb-1 border-b border-slate-100">
              <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                <FileText className="h-3.5 w-3.5 text-teal-600" />
                <span>3. Bộ Chứng từ & Hồ sơ Y tế Đính kèm ({documents.length})</span>
              </h4>
              <button
                type="button"
                onClick={addCustomDoc}
                className="text-[11px] font-semibold text-teal-700 hover:text-teal-800 flex items-center gap-1 cursor-pointer"
              >
                + Thêm chứng từ
              </button>
            </div>

            {/* Document Drag and Drop Zone */}
            <div className="p-4 border-2 border-dashed border-teal-200 hover:border-teal-400 bg-teal-50/30 hover:bg-teal-50/50 rounded-xl text-center cursor-pointer transition-colors">
              <UploadCloud className="h-6 w-6 text-teal-600 mx-auto mb-1" />
              <p className="text-xs font-semibold text-slate-700">
                Kéo thả file PDF, JPG, PNG vào đây hoặc{' '}
                <span className="text-teal-700 underline">chọn từ máy tính</span>
              </p>
              <p className="text-[10px] text-slate-500 mt-0.5">
                Hệ thống tự động thực thi module OCR trích xuất thông tin bệnh viện, chữ ký mộc đỏ
                và mã số thuế
              </p>
            </div>

            {/* Table of Attached Docs */}
            <div className="border border-slate-200 rounded-xl overflow-hidden">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
                  <tr>
                    <th className="py-2 px-3">Loại chứng từ</th>
                    <th className="py-2 px-3">Tên tập tin</th>
                    <th className="py-2 px-3">Trạng thái OCR</th>
                    <th className="py-2 px-3">Ghi chú giám định</th>
                    <th className="py-2 px-2 text-right"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {documents.map(doc => (
                    <tr key={doc.id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="py-2.5 px-3 font-semibold text-slate-800">{doc.docType}</td>
                      <td className="py-2.5 px-3 font-mono text-[11px] text-teal-700">
                        {doc.fileName}
                      </td>
                      <td className="py-2.5 px-3">
                        {doc.status === 'VALID' ? (
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                            <CheckCircle2 className="h-3 w-3 text-emerald-600" /> Hợp lệ
                          </span>
                        ) : doc.status === 'INVALID' ? (
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-rose-700 bg-rose-50 px-2 py-0.5 rounded border border-rose-200">
                            <AlertTriangle className="h-3 w-3 text-rose-600" /> Nhòe mờ
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                            Chờ nộp
                          </span>
                        )}
                      </td>
                      <td className="py-2.5 px-3 text-[11px] text-slate-500">{doc.note}</td>
                      <td className="py-2.5 px-2 text-right">
                        <button
                          type="button"
                          onClick={() => removeDoc(doc.id)}
                          className="p-1 text-slate-400 hover:text-rose-600 rounded cursor-pointer"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-1.5 text-slate-500 text-[11px]">
            <Sparkles className="h-3.5 w-3.5 text-teal-600" />
            <span>Mastra Engine tự động kích hoạt workflow 4 bước ngay sau khi bấm tạo</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800 hover:bg-slate-200/60 rounded-xl transition-colors cursor-pointer"
            >
              Hủy bỏ (Esc)
            </button>
            <button
              onClick={handleCreate}
              className="px-5 py-2 text-xs font-bold text-white bg-teal-700 hover:bg-teal-800 active:bg-teal-900 rounded-xl shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <Zap className="h-4 w-4 text-amber-400" />
              <span>Khởi tạo & Kích hoạt Thẩm định AI (Cmd + Enter)</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
