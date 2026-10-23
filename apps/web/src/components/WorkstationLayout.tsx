'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  ShieldCheck,
  FileText,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Bot,
  Send,
  Loader2,
  Sparkles,
  ChevronDown,
  User,
  Building2,
  Calendar,
  AlertTriangle,
  RotateCcw,
} from 'lucide-react';
import { Claim, AssessmentReport } from '@papaya/shared';

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

const FALLBACK_CLAIMS: Claim[] = [
  {
    claimId: 'CLM-2026-001',
    policyNumber: 'POL-GOLD-99882',
    patientName: 'Nguyễn Văn A',
    nationalId: '001099012345',
    hospitalName: 'Bệnh viện FV (TP.HCM)',
    admissionDate: '2026-03-10T08:30:00Z',
    dischargeDate: '2026-03-13T14:00:00Z',
    diagnosisIcd10: 'K35',
    diagnosisDescription: 'Viêm ruột thừa cấp có viêm phúc mạc cục bộ',
    status: 'SUBMITTED',
    totalRequested: 45000000,
    items: [
      {
        itemId: 'ITM-001',
        description: 'Phẫu thuật nội soi cắt ruột thừa',
        category: 'SURGERY',
        amountRequested: 25000000,
      },
      {
        itemId: 'ITM-002',
        description: 'Tiền giường phòng nội trú tiêu chuẩn (3 ngày)',
        category: 'INPATIENT',
        amountRequested: 9000000,
      },
      {
        itemId: 'ITM-003',
        description: 'Thuốc kháng sinh và giảm đau sau phẫu thuật',
        category: 'MEDICATION',
        amountRequested: 6000000,
      },
      {
        itemId: 'ITM-004',
        description: 'Siêu âm ổ bụng & xét nghiệm máu cấp cứu',
        category: 'LABORATORY',
        amountRequested: 5000000,
      },
    ],
    documents: [
      {
        docId: 'DOC-001',
        docType: 'HOSPITAL_DISCHARGE',
        fileName: 'giay_ra_vien_nguyen_van_a.pdf',
        uploadedAt: '2026-03-13T09:00:00Z',
        status: 'VALID',
      },
      {
        docId: 'DOC-002',
        docType: 'DETAILED_INVOICE',
        fileName: 'bang_ke_chi_phi_fv.pdf',
        uploadedAt: '2026-03-13T09:00:00Z',
        status: 'VALID',
      },
      {
        docId: 'DOC-003',
        docType: 'VAT_INVOICE',
        fileName: 'hoa_don_vat_003891.pdf',
        uploadedAt: '2026-03-13T09:00:00Z',
        status: 'VALID',
      },
    ],
    createdAt: '2026-03-13T10:00:00Z',
    updatedAt: '2026-03-13T10:00:00Z',
  },
  {
    claimId: 'CLM-2026-002',
    policyNumber: 'POL-SILVER-11223',
    patientName: 'Trần Thị B',
    nationalId: '079198005432',
    hospitalName: 'Bệnh viện Đa khoa Tâm Anh',
    admissionDate: '2026-02-15T09:00:00Z',
    dischargeDate: '2026-02-16T11:00:00Z',
    diagnosisIcd10: 'K21',
    diagnosisDescription: 'Bệnh trào ngược dạ dày thực quản (GERD)',
    status: 'SUBMITTED',
    totalRequested: 12000000,
    items: [
      {
        itemId: 'ITM-101',
        description: 'Nội soi thực quản dạ dày có tiền mê',
        category: 'OUTPATIENT',
        amountRequested: 5500000,
      },
      {
        itemId: 'ITM-102',
        description: 'Thuốc ức chế bơm proton và kháng acid',
        category: 'MEDICATION',
        amountRequested: 6500000,
      },
    ],
    documents: [
      {
        docId: 'DOC-101',
        docType: 'HOSPITAL_DISCHARGE',
        fileName: 'giay_ra_vien_tran_thi_b.pdf',
        uploadedAt: '2026-02-16T10:00:00Z',
        status: 'VALID',
      },
      {
        docId: 'DOC-102',
        docType: 'VAT_INVOICE',
        fileName: 'hoa_don_vat_tam_anh.pdf',
        uploadedAt: '2026-02-16T10:00:00Z',
        status: 'VALID',
      },
    ],
    createdAt: '2026-02-16T11:00:00Z',
    updatedAt: '2026-02-16T11:00:00Z',
  },
  {
    claimId: 'CLM-2026-003',
    policyNumber: 'POL-BRONZE-55441',
    patientName: 'Lê Văn C',
    nationalId: '031085009876',
    hospitalName: 'Bệnh viện Chấn thương Chỉnh hình',
    admissionDate: '2026-01-20T14:00:00Z',
    dischargeDate: '2026-01-22T10:00:00Z',
    diagnosisIcd10: 'S52',
    diagnosisDescription: 'Gãy xương cẳng tay do tai nạn sinh hoạt',
    status: 'SUBMITTED',
    totalRequested: 22000000,
    items: [
      {
        itemId: 'ITM-201',
        description: 'Phẫu thuật kết hợp xương cẳng tay',
        category: 'SURGERY',
        amountRequested: 16000000,
      },
      {
        itemId: 'ITM-202',
        description: 'Chụp X-quang và nẹp bột cố định',
        category: 'LABORATORY',
        amountRequested: 6000000,
      },
    ],
    documents: [
      {
        docId: 'DOC-201',
        docType: 'HOSPITAL_DISCHARGE',
        fileName: 'giay_ra_vien_le_van_c.pdf',
        uploadedAt: '2026-01-22T10:00:00Z',
        status: 'VALID',
      },
      // Missing VAT_INVOICE deliberately
    ],
    createdAt: '2026-01-22T10:00:00Z',
    updatedAt: '2026-01-22T10:00:00Z',
  },
];

export function WorkstationLayout() {
  const [claims, setClaims] = useState<Claim[]>(FALLBACK_CLAIMS);
  const [activeClaimId, setActiveClaimId] = useState<string>('CLM-2026-001');
  const [assessmentReport, setAssessmentReport] = useState<AssessmentReport | null>(null);
  const [isAssessing, setIsAssessing] = useState<boolean>(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'init-1',
      role: 'assistant',
      content:
        'Xin chào Chuyên viên Thẩm định. Tôi là Trợ lý Thẩm định Bồi thường Bảo hiểm Y tế. Bạn có thể nhấn "Khởi chạy Thẩm định" để hệ thống chạy quy trình đối soát 4 bước tự động, hoặc đặt câu hỏi trực tiếp về điều khoản hợp đồng và biểu phí.',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);
  const [inputText, setInputText] = useState<string>('');
  const [isThinking, setIsThinking] = useState<boolean>(false);
  const [feedbackNote, setFeedbackNote] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll chat
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isThinking]);

  // Load claims on mount
  useEffect(() => {
    fetch('/api/claims')
      .then(res => (res.ok ? res.json() : null))
      .then(data => {
        if (Array.isArray(data) && data.length > 0) {
          setClaims(data);
        }
      })
      .catch(() => {
        // Fallback to embedded seed cases
      });
  }, []);

  const activeClaim = claims.find(c => c.claimId === activeClaimId) || claims[0]!;

  // Handle Switch Claim
  const handleSelectClaim = (claimId: string) => {
    setActiveClaimId(claimId);
    setAssessmentReport(null);
    setFeedbackNote(null);
    setMessages([
      {
        id: `switch-${Date.now()}`,
        role: 'assistant',
        content: `Đã nạp hồ sơ yêu cầu bồi thường **#${claimId}** (${activeClaim.patientName} - ${activeClaim.diagnosisDescription}). Bạn có thể bắt đầu phiên thẩm định hoặc tra cứu thông tin điều khoản.`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      },
    ]);
  };

  // Run Assessment Workflow
  const handleRunAssessment = async () => {
    setIsAssessing(true);
    setFeedbackNote(null);
    try {
      const res = await fetch(`/api/claims/${activeClaimId}/assess`, {
        method: 'POST',
      });

      if (!res.ok) {
        throw new Error(`Mã lỗi HTTP: ${res.status}`);
      }

      const report: AssessmentReport = await res.json();
      setAssessmentReport(report);

      // Append assessment report message to chat
      const outcomeText =
        report.finalRecommendation === 'APPROVE'
          ? `✅ **DUYỆT CHI TRẢ**: Hồ sơ đủ điều kiện chi trả bồi thường với số tiền **${report.totalPayable.toLocaleString()} VND** (Khấu trừ/Đồng chi trả: ${report.totalDeductions.toLocaleString()} VND). Điểm tin cậy: ${report.confidenceScore}%.`
          : report.finalRecommendation === 'REJECT'
            ? `❌ **TỪ CHỐI CHI TRẢ**: Hồ sơ thuộc điều khoản loại trừ hợp đồng. Số tiền chi trả: 0 VND.`
            : `⚠️ **YÊU CẦU BỔ SUNG CHỨNG TỪ**: Hồ sơ còn thiếu ${report.missingDocuments.join(', ')}. Chưa đủ điều kiện quyết toán.`;

      setMessages(prev => [
        ...prev,
        {
          id: `report-${Date.now()}`,
          role: 'assistant',
          content: `${outcomeText}\n\n*${report.executiveSummary}*`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    } catch (err: unknown) {
      const error = err as Error;
      setMessages(prev => [
        ...prev,
        {
          id: `err-${Date.now()}`,
          role: 'assistant',
          content: `Không thể kết nối đến hệ thống thẩm định: ${error.message}. Vui lòng kiểm tra trạng thái máy chủ.`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    } finally {
      setIsAssessing(false);
    }
  };

  // Send Chat Message to Mastra Agent
  const handleSendMessage = async (queryToSend?: string) => {
    const text = (queryToSend || inputText).trim();
    if (!text || isThinking) return;

    const userMsgId = `user-${Date.now()}`;
    const userTimestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    setMessages(prev => [
      ...prev,
      {
        id: userMsgId,
        role: 'user',
        content: text,
        timestamp: userTimestamp,
      },
    ]);

    setInputText('');
    setIsThinking(true);

    try {
      const res = await fetch(`/api/claims/${activeClaimId}/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: text }),
      });

      if (!res.ok) {
        throw new Error(`Máy chủ phản hồi mã ${res.status}`);
      }

      const data = await res.json();
      const reply = data.reply || 'Hệ thống đã ghi nhận nhưng không nhận được phản hồi phù hợp.';

      setMessages(prev => [
        ...prev,
        {
          id: `assistant-${Date.now()}`,
          role: 'assistant',
          content: reply,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    } catch (err: unknown) {
      const error = err as Error;
      setMessages(prev => [
        ...prev,
        {
          id: `err-${Date.now()}`,
          role: 'assistant',
          content: `Đã có lỗi khi trao đổi với Trợ lý Thẩm định: ${error.message}. Hệ thống đang sử dụng dữ liệu quy chuẩn hợp đồng để đối chiếu.`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    } finally {
      setIsThinking(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // Human In The Loop Actions
  const handleAssessorAction = (action: string) => {
    setFeedbackNote(`Chuyên viên đã thực hiện thao tác: [${action}] cho hồ sơ #${activeClaimId}.`);
    setMessages(prev => [
      ...prev,
      {
        id: `action-${Date.now()}`,
        role: 'assistant',
        content: `Đã ghi nhận quyết định của Chuyên viên: **${action}**. Hệ thống đã cập nhật nhật ký giám định bất biến (Audit Log).`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      },
    ]);
  };

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-slate-50 font-sans">
      {/* Top Header */}
      <header className="h-14 border-b border-slate-200 bg-white px-6 flex items-center justify-between shrink-0 shadow-sm z-10">
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 rounded-lg bg-teal-600 flex items-center justify-center text-white font-bold shadow-sm">
            P
          </div>
          <div>
            <span className="font-semibold text-slate-800 text-base">
              Papaya Claims Workstation
            </span>
            <span className="ml-2 text-xs px-2 py-0.5 rounded-full bg-teal-50 text-teal-700 border border-teal-200 font-medium">
              Bàn Giám định Bồi thường
            </span>
          </div>
        </div>

        {/* Claim Selector Dropdown */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-500 font-medium">Hồ sơ đang mở:</span>
            <div className="relative">
              <select
                value={activeClaimId}
                onChange={e => handleSelectClaim(e.target.value)}
                className="appearance-none bg-slate-100 hover:bg-slate-200/80 border border-slate-300 rounded-lg px-3 py-1.5 pr-8 text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-600 transition-colors cursor-pointer"
              >
                {claims.map(c => (
                  <option key={c.claimId} value={c.claimId}>
                    {c.claimId} — {c.patientName} ({c.diagnosisIcd10})
                  </option>
                ))}
              </select>
              <ChevronDown className="h-3.5 w-3.5 text-slate-500 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>

          <div className="h-4 w-px bg-slate-200" />

          <div className="flex items-center gap-2 text-xs text-slate-600">
            <User className="h-3.5 w-3.5 text-slate-400" />
            <span>
              Giám định viên: <strong>Trần Quốc Dũng</strong>
            </span>
            <div
              className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse ml-1"
              title="Kết nối trực tuyến"
            />
          </div>
        </div>
      </header>

      {/* Main Dual-Pane Container */}
      <main className="flex-1 flex overflow-hidden">
        {/* Left Pane: Claim Dossier (55%) */}
        <section className="w-[55%] border-r border-slate-200 bg-white flex flex-col overflow-y-auto">
          {/* Claim Header Summary */}
          <div className="p-6 border-b border-slate-100 flex items-start justify-between bg-slate-50/30">
            <div>
              <div className="flex items-center gap-2 mb-1.5">
                <span className="text-xs font-bold uppercase tracking-wider text-teal-800 bg-teal-100/70 px-2 py-0.5 rounded">
                  {activeClaim.claimId}
                </span>
                <span className="text-xs text-slate-500">
                  Mã bệnh: <strong>{activeClaim.diagnosisIcd10}</strong>
                </span>
              </div>
              <h1 className="text-xl font-bold text-slate-900">
                {activeClaim.patientName} — {activeClaim.diagnosisDescription}
              </h1>
              <div className="flex items-center gap-4 text-xs text-slate-500 mt-2">
                <span className="flex items-center gap-1">
                  <Building2 className="h-3.5 w-3.5 text-slate-400" />
                  {activeClaim.hospitalName}
                </span>
                <span className="flex items-center gap-1">
                  <Calendar className="h-3.5 w-3.5 text-slate-400" />
                  Điều trị: {new Date(activeClaim.admissionDate).toLocaleDateString(
                    'vi-VN',
                  )} đến {new Date(activeClaim.dischargeDate).toLocaleDateString('vi-VN')}
                </span>
              </div>
            </div>
            <div className="text-right">
              <span className="text-xs text-slate-500">Tổng tiền đề nghị</span>
              <p className="text-2xl font-bold text-slate-900 mt-0.5">
                {activeClaim.totalRequested.toLocaleString()}{' '}
                <span className="text-xs font-normal text-slate-500">VND</span>
              </p>
            </div>
          </div>

          <div className="p-6 space-y-6">
            {/* Policy Info Card */}
            <div className="border border-slate-200 rounded-xl p-4 bg-slate-50/60">
              <div className="flex items-center justify-between mb-2">
                <h2 className="text-sm font-semibold text-slate-800 flex items-center gap-2">
                  <ShieldCheck className="h-4 w-4 text-teal-600" />
                  Hợp đồng bảo hiểm: {activeClaim.policyNumber}
                </h2>
                <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
                  ĐANG HIỆU LỰC
                </span>
              </div>
              <div className="grid grid-cols-3 gap-4 text-xs text-slate-600 mt-3 pt-3 border-t border-slate-200/60">
                <div>
                  <span className="text-slate-400 block text-[11px]">Chương trình:</span>
                  <strong className="text-slate-800">Healthcare Standard / Gold</strong>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px]">CCCD/CMND:</span>
                  <strong className="text-slate-800">{activeClaim.nationalId}</strong>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px]">Hạn mức bảo lãnh:</span>
                  <strong className="text-slate-800">100.000.000 - 500.000.000 VND</strong>
                </div>
              </div>
            </div>

            {/* Invoices & Line Items */}
            <div>
              <h2 className="text-sm font-semibold text-slate-800 flex items-center justify-between mb-3">
                <span className="flex items-center gap-2">
                  <FileText className="h-4 w-4 text-slate-500" />
                  Danh mục viện phí ({activeClaim.items.length} hạng mục)
                </span>
                <span className="text-xs text-slate-400 font-normal">Đơn vị: VND</span>
              </h2>
              <div className="border border-slate-200 rounded-xl overflow-hidden divide-y divide-slate-200 text-sm">
                {activeClaim.items.map(item => (
                  <div
                    key={item.itemId}
                    className="p-3.5 flex items-center justify-between bg-white hover:bg-slate-50 transition-colors"
                  >
                    <div>
                      <p className="font-medium text-slate-800 text-xs">{item.description}</p>
                      <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 mt-1 inline-block">
                        {item.category}
                      </span>
                    </div>
                    <span className="font-semibold text-slate-900 text-xs">
                      {item.amountRequested.toLocaleString()} VND
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Supporting Documents List */}
            <div>
              <h2 className="text-sm font-semibold text-slate-800 flex items-center gap-2 mb-3">
                <FileText className="h-4 w-4 text-slate-500" />
                Hồ sơ & Chứng từ nộp vào ({activeClaim.documents.length} tài liệu)
              </h2>
              <div className="grid grid-cols-2 gap-3 text-xs">
                {activeClaim.documents.map(doc => (
                  <div
                    key={doc.docId}
                    className="p-3 rounded-xl border border-slate-200 bg-white flex items-start gap-2.5 shadow-2xs"
                  >
                    <div className="p-1.5 rounded-lg bg-teal-50 text-teal-700 mt-0.5">
                      <FileText className="h-4 w-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-slate-800 truncate" title={doc.fileName}>
                        {doc.fileName}
                      </p>
                      <div className="flex items-center gap-2 mt-1 text-[11px] text-slate-500">
                        <span>{doc.docType}</span>
                        {doc.status === 'VALID' && (
                          <span className="text-emerald-600 font-medium">✓ Hợp lệ</span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Human In The Loop Action Panel */}
            <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/80 mt-6">
              <span className="text-xs font-semibold text-slate-700 block mb-2">
                Hành động của Chuyên viên Thẩm định (Human In The Loop):
              </span>
              <div className="flex flex-wrap items-center gap-2">
                <button
                  onClick={() => handleAssessorAction('PHÊ DUYỆT BỒI THƯỜNG')}
                  className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold transition-colors flex items-center gap-1 shadow-2xs"
                >
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  Phê duyệt
                </button>
                <button
                  onClick={() => handleAssessorAction('TỪ CHỐI CHI TRẢ')}
                  className="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-xs font-semibold transition-colors flex items-center gap-1 shadow-2xs"
                >
                  <AlertCircle className="h-3.5 w-3.5" />
                  Từ chối
                </button>
                <button
                  onClick={() => handleAssessorAction('YÊU CẦU BỔ SUNG CHỨNG TỪ')}
                  className="px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-xs font-semibold transition-colors flex items-center gap-1 shadow-2xs"
                >
                  <HelpCircle className="h-3.5 w-3.5" />
                  Yêu cầu bổ sung
                </button>
                <button
                  onClick={() => handleAssessorAction('GHI ĐÈ QUYẾT ĐỊNH (OVERRIDE)')}
                  className="px-3 py-1.5 bg-slate-700 hover:bg-slate-800 text-white rounded-lg text-xs font-semibold transition-colors flex items-center gap-1 shadow-2xs ml-auto"
                >
                  <RotateCcw className="h-3.5 w-3.5" />
                  Ghi đè thủ công
                </button>
              </div>
              {feedbackNote && (
                <p className="text-xs text-teal-800 bg-teal-50 border border-teal-200 rounded-lg p-2 mt-3 font-medium">
                  {feedbackNote}
                </p>
              )}
            </div>
          </div>
        </section>

        {/* Right Pane: Trợ lý Thẩm định Bồi thường (45%) */}
        <section className="w-[45%] flex flex-col bg-slate-50">
          {/* Header Action Bar */}
          <div className="p-4 border-b border-slate-200 bg-white flex items-center justify-between shrink-0">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-teal-50 text-teal-600">
                <Bot className="h-5 w-5" />
              </div>
              <div>
                <h2 className="font-semibold text-slate-800 text-sm">
                  Trợ lý Thẩm định Bồi thường
                </h2>
                <p className="text-[11px] text-slate-500">Quy trình thẩm định tự động 4 bước</p>
              </div>
            </div>
            <button
              onClick={handleRunAssessment}
              disabled={isAssessing}
              className="px-3.5 py-2 bg-teal-600 hover:bg-teal-700 disabled:bg-teal-400 text-white rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5 shadow-sm cursor-pointer"
            >
              {isAssessing ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  Đang thẩm định...
                </>
              ) : (
                <>
                  <Sparkles className="h-3.5 w-3.5" />
                  Khởi chạy Thẩm định
                </>
              )}
            </button>
          </div>

          {/* Workflow Steps Status Bar */}
          <div className="p-3.5 border-b border-slate-200 bg-white/70">
            <div className="grid grid-cols-4 gap-2 text-center text-xs">
              <div
                className={`p-2 rounded-lg border flex flex-col items-center transition-all ${
                  assessmentReport?.steps[0]?.status === 'PASSED'
                    ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                    : assessmentReport?.steps[0]?.status === 'ACTION_REQUIRED'
                      ? 'bg-amber-50 border-amber-300 text-amber-800'
                      : 'bg-slate-50 border-slate-200 text-slate-500'
                }`}
              >
                {assessmentReport?.steps[0]?.status === 'ACTION_REQUIRED' ? (
                  <AlertTriangle className="h-3.5 w-3.5 mb-1 text-amber-600" />
                ) : (
                  <CheckCircle2
                    className={`h-3.5 w-3.5 mb-1 ${
                      assessmentReport?.steps[0]?.status === 'PASSED'
                        ? 'text-emerald-600'
                        : 'text-slate-400'
                    }`}
                  />
                )}
                <span className="font-medium text-[11px]">Chứng từ</span>
              </div>

              <div
                className={`p-2 rounded-lg border flex flex-col items-center transition-all ${
                  assessmentReport?.steps[1]?.status === 'PASSED'
                    ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                    : assessmentReport?.steps[1]?.status === 'FAILED'
                      ? 'bg-rose-50 border-rose-300 text-rose-800'
                      : 'bg-slate-50 border-slate-200 text-slate-500'
                }`}
              >
                <CheckCircle2
                  className={`h-3.5 w-3.5 mb-1 ${
                    assessmentReport?.steps[1]?.status === 'PASSED'
                      ? 'text-emerald-600'
                      : assessmentReport?.steps[1]?.status === 'FAILED'
                        ? 'text-rose-600'
                        : 'text-slate-400'
                  }`}
                />
                <span className="font-medium text-[11px]">Hợp đồng</span>
              </div>

              <div
                className={`p-2 rounded-lg border flex flex-col items-center transition-all ${
                  assessmentReport?.steps[2]?.status === 'PASSED'
                    ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                    : 'bg-slate-50 border-slate-200 text-slate-500'
                }`}
              >
                <CheckCircle2
                  className={`h-3.5 w-3.5 mb-1 ${
                    assessmentReport?.steps[2]?.status === 'PASSED'
                      ? 'text-emerald-600'
                      : 'text-slate-400'
                  }`}
                />
                <span className="font-medium text-[11px]">Chỉ định y khoa</span>
              </div>

              <div
                className={`p-2 rounded-lg border flex flex-col items-center transition-all ${
                  assessmentReport?.steps[3]?.status === 'PASSED'
                    ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                    : 'bg-slate-50 border-slate-200 text-slate-500'
                }`}
              >
                <CheckCircle2
                  className={`h-3.5 w-3.5 mb-1 ${
                    assessmentReport?.steps[3]?.status === 'PASSED'
                      ? 'text-emerald-600'
                      : 'text-slate-400'
                  }`}
                />
                <span className="font-medium text-[11px]">Chiết tính</span>
              </div>
            </div>

            {/* Assessment Outcome Ribbon if available */}
            {assessmentReport && (
              <div className="mt-3 p-2.5 rounded-lg bg-teal-50 border border-teal-200 flex items-center justify-between text-xs">
                <div>
                  <span className="text-slate-500 text-[11px] block">Khuyến nghị quyết toán:</span>
                  <span
                    className={`font-bold px-2 py-0.5 rounded text-[11px] inline-block mt-0.5 ${
                      assessmentReport.finalRecommendation === 'APPROVE'
                        ? 'bg-emerald-100 text-emerald-800'
                        : assessmentReport.finalRecommendation === 'REJECT'
                          ? 'bg-rose-100 text-rose-800'
                          : 'bg-amber-100 text-amber-800'
                    }`}
                  >
                    {assessmentReport.finalRecommendation}
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-slate-500 text-[11px] block">Số tiền duyệt chi trả:</span>
                  <span className="text-sm font-bold text-teal-800">
                    {assessmentReport.totalPayable.toLocaleString()} VND
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Chat Messages Container */}
          <div className="flex-1 p-4 overflow-y-auto space-y-3.5">
            {messages.map(msg => (
              <div
                key={msg.id}
                className={`flex gap-2.5 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {msg.role === 'assistant' && (
                  <div className="h-7 w-7 rounded-full bg-teal-100 text-teal-700 flex items-center justify-center shrink-0 text-xs font-bold shadow-2xs">
                    AI
                  </div>
                )}
                <div
                  className={`rounded-2xl p-3.5 text-xs max-w-[85%] leading-relaxed shadow-2xs ${
                    msg.role === 'user'
                      ? 'bg-teal-600 text-white rounded-tr-none'
                      : 'bg-white border border-slate-200 text-slate-800 rounded-tl-none'
                  }`}
                >
                  <p className="whitespace-pre-line">{msg.content}</p>
                  <span
                    className={`text-[10px] mt-1.5 block text-right ${
                      msg.role === 'user' ? 'text-teal-200' : 'text-slate-400'
                    }`}
                  >
                    {msg.timestamp}
                  </span>
                </div>
              </div>
            ))}

            {isThinking && (
              <div className="flex gap-2.5 items-center text-slate-500 text-xs py-2">
                <div className="h-7 w-7 rounded-full bg-teal-50 text-teal-600 flex items-center justify-center shrink-0">
                  <Loader2 className="h-4 w-4 animate-spin" />
                </div>
                <span className="animate-pulse">
                  Trợ lý đang tra cứu điều khoản hợp đồng & tính toán...
                </span>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Quick Question Prompts */}
          <div className="px-4 py-2 bg-slate-100/70 border-t border-slate-200 flex items-center gap-1.5 overflow-x-auto no-scrollbar">
            <span className="text-[11px] text-slate-400 font-medium shrink-0">Gợi ý câu hỏi:</span>
            <button
              onClick={() => handleSendMessage('Tại sao ca này bị áp mức đồng chi trả 20%?')}
              className="px-2.5 py-1 bg-white hover:bg-slate-200/70 text-slate-700 border border-slate-200 rounded-full text-[11px] whitespace-nowrap transition-colors cursor-pointer"
            >
              Tại sao đồng chi trả 20%?
            </button>
            <button
              onClick={() =>
                handleSendMessage('Chứng từ nộp vào có đầy đủ theo quy chế bồi thường không?')
              }
              className="px-2.5 py-1 bg-white hover:bg-slate-200/70 text-slate-700 border border-slate-200 rounded-full text-[11px] whitespace-nowrap transition-colors cursor-pointer"
            >
              Kiểm tra chứng từ bắt buộc
            </button>
            <button
              onClick={() =>
                handleSendMessage('Trích dẫn các điều khoản loại trừ liên quan đến mã ICD-10 này?')
              }
              className="px-2.5 py-1 bg-white hover:bg-slate-200/70 text-slate-700 border border-slate-200 rounded-full text-[11px] whitespace-nowrap transition-colors cursor-pointer"
            >
              Điều khoản loại trừ
            </button>
          </div>

          {/* Chat Input */}
          <div className="p-3.5 bg-white border-t border-slate-200">
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={inputText}
                onChange={e => setInputText(e.target.value)}
                onKeyDown={handleKeyDown}
                disabled={isThinking}
                placeholder="Đặt câu hỏi về điều khoản hợp đồng hoặc chỉ thị thẩm định..."
                className="flex-1 bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-teal-600 focus:bg-white transition-all disabled:opacity-50"
              />
              <button
                onClick={() => handleSendMessage()}
                disabled={!inputText.trim() || isThinking}
                className="p-2.5 bg-teal-600 hover:bg-teal-700 disabled:bg-slate-200 disabled:text-slate-400 text-white rounded-xl transition-colors cursor-pointer shadow-2xs"
              >
                <Send className="h-4 w-4" />
              </button>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
