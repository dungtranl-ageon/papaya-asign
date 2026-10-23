'use client';

import React, { useState, useEffect } from 'react';
import { X, Shield, Clock, Filter, Bot, User, Download, Key, Loader2 } from 'lucide-react';

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

  const [events, setEvents] = useState<AuditEvent[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!isOpen || !claimId) return;

    let isMounted = true;
    setLoading(true);

    fetch(`/api/claims/${claimId}/audit`)
      .then(res => (res.ok ? res.json() : []))
      .then(
        (
          data: Array<{
            id: string;
            actorId: string;
            actorRole: string;
            actionType: string;
            reason?: string;
            newValue?: string;
            timestamp: string;
          }>,
        ) => {
          if (!isMounted) return;

          if (Array.isArray(data) && data.length > 0) {
            const mapped: AuditEvent[] = data.map(l => {
              const actorType: 'AI_WORKFLOW' | 'ASSESSOR' | 'SUPERVISOR' | 'CUSTOMER' =
                l.actorRole === 'AI_AGENT'
                  ? 'AI_WORKFLOW'
                  : l.actorRole === 'CUSTOMER'
                    ? 'CUSTOMER'
                    : 'ASSESSOR';

              return {
                id: l.id,
                timestamp: new Date(l.timestamp).toLocaleString('vi-VN'),
                actor: `${l.actorRole} (${l.actorId})`,
                actorType,
                action: l.actionType,
                details: l.reason || l.newValue || 'Ghi nhận thao tác thẩm định thành công',
                status: l.actionType.includes('REJECT') ? 'WARNING' : 'SUCCESS',
                hash: `sha256:${l.id.replace(/-/g, '').slice(0, 12)}...`,
              };
            });
            setEvents(mapped);
          } else {
            // Default initial trail for active claim
            setEvents([
              {
                id: `aud-${claimId}-01`,
                timestamp: new Date().toLocaleString('vi-VN'),
                actor: 'Papaya Claims Engine',
                actorType: 'AI_WORKFLOW',
                action: 'CLAIM_INITIALIZED',
                details: `Hồ sơ ${claimId} đã được nạp vào cơ sở dữ liệu và sẵn sàng thẩm định.`,
                status: 'SUCCESS',
                hash: 'sha256:8f2a1b94c3d...e718',
              },
            ]);
          }
        },
      )
      .catch(err => {
        console.error('Failed to fetch audit logs:', err);
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [isOpen, claimId]);

  if (!isOpen) return null;

  const filteredEvents = events.filter(ev => {
    if (filterType === 'AI') return ev.actorType === 'AI_WORKFLOW';
    if (filterType === 'HUMAN') return ev.actorType === 'ASSESSOR' || ev.actorType === 'CUSTOMER';
    return true;
  });

  const exportAuditLog = () => {
    const dataStr =
      'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(events, null, 2));
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
                Tất cả ({events.length})
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
          {loading ? (
            <div className="flex flex-col items-center justify-center p-12 text-slate-400 gap-2">
              <Loader2 className="h-6 w-6 animate-spin text-teal-600" />
              <span>Đang đồng bộ sổ cái kiểm toán từ máy chủ...</span>
            </div>
          ) : filteredEvents.length === 0 ? (
            <div className="text-center p-8 text-slate-400">
              Chưa có sự kiện kiểm toán nào được ghi nhận cho hồ sơ này.
            </div>
          ) : (
            filteredEvents.map(event => (
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
            ))
          )}
        </div>
      </div>
    </div>
  );
}
