'use client';

import React, { useState } from 'react';
import { X, Shield, Clock, Filter, Bot, User, Download, Key } from 'lucide-react';

export interface AuditEvent {
  id: string;
  timestamp: string;
  actor: string;
  actorType: 'AI_WORKFLOW' | 'ASSESSOR' | 'SYSTEM' | 'CUSTOMER';
  action: string;
  details: string;
  status: 'SUCCESS' | 'WARNING' | 'CRITICAL';
  hash: string;
}

interface AuditTrailDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  claimId?: string;
}

export function AuditTrailDrawer({
  isOpen,
  onClose,
  claimId = 'CLM-2026-03891',
}: AuditTrailDrawerProps) {
  const [filterType, setFilterType] = useState<'ALL' | 'AI' | 'HUMAN'>('ALL');

  if (!isOpen) return null;

  const mockEvents: AuditEvent[] = [
    {
      id: 'aud-001',
      timestamp: '2026-03-14 14:20:00',
      actor: 'Customer Portal (nguyenvana@gmail.com)',
      actorType: 'CUSTOMER',
      action: 'CLAIM_SUBMISSION',
      details: 'Khách hàng khởi tạo hồ sơ yêu cầu bồi thường trực tuyến, tải lên 3 tập tin PDF.',
      status: 'SUCCESS',
      hash: 'sha256:8f2a1b94c3d...e718',
    },
    {
      id: 'aud-002',
      timestamp: '2026-03-14 14:20:02',
      actor: 'Mastra Engine (verifyDocument)',
      actorType: 'AI_WORKFLOW',
      action: 'STEP_1_VERIFY_DOCUMENT',
      details:
        'OCR nhận diện 3/3 tài liệu hợp lệ. Bệnh viện Pháp Việt, hóa đơn VAT #003891 khớp dữ liệu TCT.',
      status: 'SUCCESS',
      hash: 'sha256:7c3b9911e2f...a109',
    },
    {
      id: 'aud-003',
      timestamp: '2026-03-14 14:20:04',
      actor: 'Mastra Engine (lookupPolicy)',
      actorType: 'AI_WORKFLOW',
      action: 'STEP_2_LOOKUP_POLICY',
      details:
        'Tra cứu HĐ POL-2024-8891: Có hiệu lực. Áp dụng quy tắc Điều 6.1 miễn thời gian chờ cấp cứu.',
      status: 'SUCCESS',
      hash: 'sha256:4d8e77aa22b...3c88',
    },
    {
      id: 'aud-004',
      timestamp: '2026-03-14 14:20:06',
      actor: 'Mastra Engine (checkMedicalNecessity)',
      actorType: 'AI_WORKFLOW',
      action: 'STEP_3_CHECK_MEDICAL_NECESSITY',
      details:
        'Chỉ định phẫu thuật nội soi ruột thừa khớp phác đồ điều trị Bộ Y Tế. Mức độ cần thiết: 98.5%.',
      status: 'SUCCESS',
      hash: 'sha256:9a0b12cd34e...5f67',
    },
    {
      id: 'aud-005',
      timestamp: '2026-03-14 14:20:08',
      actor: 'Mastra Engine (calculateBenefit)',
      actorType: 'AI_WORKFLOW',
      action: 'STEP_4_CALCULATE_BENEFIT',
      details:
        'Loại trừ 2.000.000đ thuốc bổ gan (Điều 14.3). Khấu trừ 20% Copay = 3.300.000đ. Phê duyệt ròng: 13.200.000đ.',
      status: 'WARNING',
      hash: 'sha256:11aa22bb33c...99dd',
    },
    {
      id: 'aud-006',
      timestamp: '2026-03-14 14:25:30',
      actor: 'Assessor (tran.quoc.dung)',
      actorType: 'ASSESSOR',
      action: 'ASSESSOR_WORKSPACE_OPEN',
      details:
        'Chuyên viên mở hồ sơ kiểm tra chi tiết bảng kê và kiểm tra dòng thuốc bổ gan trên Document Inspector.',
      status: 'SUCCESS',
      hash: 'sha256:55ef66ab77c...88ee',
    },
  ];

  const filteredEvents = mockEvents.filter(ev => {
    if (filterType === 'AI') return ev.actorType === 'AI_WORKFLOW';
    if (filterType === 'HUMAN') return ev.actorType === 'ASSESSOR' || ev.actorType === 'CUSTOMER';
    return true;
  });

  const exportAuditLog = () => {
    const dataStr =
      'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(mockEvents, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `audit_trail_${claimId}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  return (
    <div className="fixed inset-0 z-50 flex flex-col justify-end bg-slate-900/40 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="w-full bg-white h-[480px] shadow-2xl border-t border-slate-200 flex flex-col animate-in slide-in-from-bottom duration-300">
        {/* Header */}
        <div className="px-6 py-3.5 bg-slate-900 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-teal-500/20 text-teal-400 border border-teal-500/30">
              <Shield className="h-4 w-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-white">
                  Nhật Ký Kiểm Toán Bất Biến (Audit Trail)
                </h3>
                <span className="flex items-center gap-1 text-[10px] font-mono text-teal-300 bg-teal-900/60 px-2 py-0.5 rounded border border-teal-700">
                  <Key className="h-3 w-3" /> SHA-256 Ledger
                </span>
              </div>
              <p className="text-[11px] text-slate-400">
                Lưu vết toàn bộ tiến trình điều phối tự động của AI và thao tác của chuyên viên cho
                hồ sơ {claimId}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={exportAuditLog}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg transition-colors cursor-pointer"
            >
              <Download className="h-3.5 w-3.5" />
              <span>Xuất JSON</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Filter Controls Bar */}
        <div className="px-6 py-2.5 bg-slate-50 border-b border-slate-200 flex items-center justify-between text-xs shrink-0">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-600 flex items-center gap-1">
              <Filter className="h-3.5 w-3.5 text-slate-400" /> Lọc sự kiện:
            </span>
            <div className="flex items-center gap-1 bg-white p-1 rounded-lg border border-slate-200">
              <button
                onClick={() => setFilterType('ALL')}
                className={`px-2.5 py-1 text-[11px] font-bold rounded cursor-pointer ${
                  filterType === 'ALL'
                    ? 'bg-teal-700 text-white'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Tất cả ({mockEvents.length})
              </button>
              <button
                onClick={() => setFilterType('AI')}
                className={`px-2.5 py-1 text-[11px] font-bold rounded cursor-pointer ${
                  filterType === 'AI'
                    ? 'bg-teal-700 text-white'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Chỉ AI Workflow
              </button>
              <button
                onClick={() => setFilterType('HUMAN')}
                className={`px-2.5 py-1 text-[11px] font-bold rounded cursor-pointer ${
                  filterType === 'HUMAN'
                    ? 'bg-teal-700 text-white'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Chuyên viên / Khách hàng
              </button>
            </div>
          </div>

          <div className="text-[11px] font-mono text-slate-500">
            Tổng cộng: <strong>{filteredEvents.length}</strong> sự kiện được xác thực tính toàn vẹn
          </div>
        </div>

        {/* Event List Area */}
        <div className="flex-1 overflow-y-auto p-6 space-y-3 bg-slate-50/30 text-xs">
          {filteredEvents.map(event => (
            <div
              key={event.id}
              className="p-3 rounded-xl bg-white border border-slate-200 shadow-2xs flex items-start justify-between gap-4 hover:border-teal-300 transition-colors"
            >
              <div className="flex items-start gap-3">
                <div
                  className={`p-2 rounded-xl shrink-0 mt-0.5 ${
                    event.actorType === 'AI_WORKFLOW'
                      ? 'bg-teal-50 text-teal-700'
                      : event.actorType === 'ASSESSOR'
                        ? 'bg-blue-50 text-blue-700'
                        : 'bg-slate-100 text-slate-700'
                  }`}
                >
                  {event.actorType === 'AI_WORKFLOW' ? (
                    <Bot className="h-4 w-4" />
                  ) : (
                    <User className="h-4 w-4" />
                  )}
                </div>

                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-800 text-xs">{event.action}</span>
                    <span className="text-[10px] text-slate-500 font-mono">by {event.actor}</span>
                    {event.status === 'SUCCESS' ? (
                      <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.2 rounded border border-emerald-200">
                        SUCCESS
                      </span>
                    ) : (
                      <span className="text-[10px] font-bold text-amber-700 bg-amber-50 px-1.5 py-0.2 rounded border border-amber-200">
                        ACTION REQUIRED
                      </span>
                    )}
                  </div>
                  <p className="text-slate-600 text-xs leading-relaxed">{event.details}</p>
                </div>
              </div>

              <div className="text-right shrink-0 space-y-1">
                <span className="text-[11px] font-mono text-slate-500 flex items-center justify-end gap-1">
                  <Clock className="h-3 w-3" /> {event.timestamp}
                </span>
                <span
                  className="text-[9px] font-mono text-slate-400 block truncate max-w-[120px]"
                  title={event.hash}
                >
                  {event.hash}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
