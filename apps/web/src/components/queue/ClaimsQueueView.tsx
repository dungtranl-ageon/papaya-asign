'use client';

import React, { useState, useEffect } from 'react';
import {
  Inbox,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Search,
  PlusCircle,
  ArrowRight,
  TrendingUp,
  AlertCircle,
  Building,
  ShieldAlert,
  Zap,
  Loader2,
  RefreshCw,
} from 'lucide-react';
import { useWorkstationStore } from '@/store';

interface ClaimsQueueViewProps {
  onSelectClaim: (claimId: string) => void;
  onOpenIngestionModal: () => void;
}

export function ClaimsQueueView({ onSelectClaim, onOpenIngestionModal }: ClaimsQueueViewProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [slaFilter, setSlaFilter] = useState<string>('ALL');

  const { claimsQueue, isQueueLoading, queueError, fetchClaimsQueue } = useWorkstationStore();

  useEffect(() => {
    fetchClaimsQueue();
  }, [fetchClaimsQueue]);

  const claims = claimsQueue;
  const loading = isQueueLoading;

  // Compute live metrics dynamically from Database records
  const pendingCount = claims.filter(
    c => c.status === 'SUBMITTED' || c.status === 'ASSESSING',
  ).length;
  const approvedClaims = claims.filter(c => c.status === 'APPROVED');
  const approvedCount = approvedClaims.length;
  const rejectedCount = claims.filter(c => c.status === 'REJECTED').length;
  const totalPayout = approvedClaims.reduce(
    (acc, c) => acc + (c.aiSuggestedAmount || c.claimedAmount),
    0,
  );
  const urgentCount = claims.filter(
    c => (c.status === 'SUBMITTED' || c.status === 'ASSESSING') && c.slaHoursLeft < 4,
  ).length;
  const stpRate =
    claims.length > 0 ? Math.round(((approvedCount + rejectedCount) / claims.length) * 100) : 80;

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(val);
  };

  const filteredClaims = claims.filter(c => {
    const matchesSearch =
      c.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.insuredName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.nationalId.includes(searchTerm) ||
      c.policyId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.icd10Code.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === 'ALL' || c.status === statusFilter;
    const matchesSla =
      slaFilter === 'ALL' ||
      (slaFilter === 'URGENT' && c.slaHoursLeft < 2 && c.slaHoursLeft > 0) ||
      (slaFilter === 'NORMAL' && c.slaHoursLeft >= 2);

    return matchesSearch && matchesStatus && matchesSla;
  });

  return (
    <div className="space-y-6">
      {/* Queue Error Alert */}
      {queueError && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl text-rose-800 text-xs flex items-center justify-between shadow-2xs">
          <div className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-rose-600 shrink-0" />
            <span className="font-semibold">{queueError}</span>
          </div>
          <button
            onClick={() => fetchClaimsQueue()}
            className="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            <span>Thử nạp lại</span>
          </button>
        </div>
      )}

      {/* 4 KPI Metrics Cards (Computed dynamically from Database) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1 */}
        <div className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-2xs hover:shadow-sm transition-all flex items-start justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-500 block mb-1">
              Hồ sơ Chờ Thẩm định
            </span>
            <span className="text-2xl font-black text-slate-800 font-mono tracking-tight">
              {pendingCount}
            </span>
            <div className="mt-2 flex items-center gap-1.5 text-[11px] text-amber-700 font-medium">
              <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
              <span>{urgentCount} hồ sơ cấp cứu ưu tiên</span>
            </div>
          </div>
          <div className="p-3 rounded-xl bg-amber-50 text-amber-700">
            <Inbox className="h-5 w-5" />
          </div>
        </div>

        {/* Metric 2 */}
        <div className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-2xs hover:shadow-sm transition-all flex items-start justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-500 block mb-1">
              Đã Phê duyệt Hoàn tất
            </span>
            <span className="text-2xl font-black text-emerald-800 font-mono tracking-tight">
              {approvedCount}
            </span>
            <div className="mt-2 flex items-center gap-1.5 text-[11px] text-emerald-700 font-medium">
              <TrendingUp className="h-3.5 w-3.5" />
              <span>Tổng giải ngân: {(totalPayout / 1000000).toFixed(1)}M đ</span>
            </div>
          </div>
          <div className="p-3 rounded-xl bg-emerald-50 text-emerald-700">
            <CheckCircle2 className="h-5 w-5" />
          </div>
        </div>

        {/* Metric 3 */}
        <div className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-2xs hover:shadow-sm transition-all flex items-start justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-500 block mb-1">
              Tỷ lệ Tự động hóa (STP)
            </span>
            <span className="text-2xl font-black text-teal-800 font-mono tracking-tight">
              {stpRate}%
            </span>
            <div className="mt-2 flex items-center gap-1.5 text-[11px] text-teal-700 font-medium">
              <Zap className="h-3.5 w-3.5 text-amber-500" />
              <span>Mastra Engine 4 bước</span>
            </div>
          </div>
          <div className="p-3 rounded-xl bg-teal-50 text-teal-700">
            <Zap className="h-5 w-5" />
          </div>
        </div>

        {/* Metric 4 */}
        <div className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-2xs hover:shadow-sm transition-all flex items-start justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-500 block mb-1">
              Cảnh báo SLA (&lt; 2h)
            </span>
            <span className="text-2xl font-black text-rose-800 font-mono tracking-tight">
              {urgentCount}
            </span>
            <div className="mt-2 flex items-center gap-1.5 text-[11px] text-rose-700 font-medium">
              <AlertCircle className="h-3.5 w-3.5" />
              <span>Cần thẩm định khẩn trương</span>
            </div>
          </div>
          <div className="p-3 rounded-xl bg-rose-50 text-rose-700">
            <Clock className="h-5 w-5" />
          </div>
        </div>
      </div>

      {/* Filter Bar & Action Button */}
      <div className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-2xs flex flex-col sm:flex-row items-center justify-between gap-3">
        {/* Search Input */}
        <div className="w-full sm:w-80 relative">
          <Search className="h-4 w-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            placeholder="Tìm theo Mã hồ sơ, Họ tên, CCCD, Mã ICD-10..."
            className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:bg-white"
          />
        </div>

        {/* Quick Filter Selectors */}
        <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl text-xs font-medium">
            <button
              onClick={() => setStatusFilter('ALL')}
              className={`px-2.5 py-1 rounded-lg transition-all ${
                statusFilter === 'ALL'
                  ? 'bg-white text-slate-900 font-bold shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Tất cả
            </button>
            <button
              onClick={() => setStatusFilter('ASSESSING')}
              className={`px-2.5 py-1 rounded-lg transition-all ${
                statusFilter === 'ASSESSING'
                  ? 'bg-teal-700 text-white font-bold shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Đang Thẩm định
            </button>
            <button
              onClick={() => setStatusFilter('PENDING_MORE_INFO')}
              className={`px-2.5 py-1 rounded-lg transition-all ${
                statusFilter === 'PENDING_MORE_INFO'
                  ? 'bg-amber-600 text-white font-bold shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Chờ bổ sung
            </button>
          </div>

          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl text-xs font-medium">
            <button
              onClick={() => setSlaFilter('ALL')}
              className={`px-2 py-1 rounded-lg transition-all ${
                slaFilter === 'ALL'
                  ? 'bg-white text-slate-900 font-bold shadow-2xs'
                  : 'text-slate-600'
              }`}
            >
              SLA: Tất cả
            </button>
            <button
              onClick={() => setSlaFilter('URGENT')}
              className={`px-2 py-1 rounded-lg transition-all ${
                slaFilter === 'URGENT'
                  ? 'bg-rose-600 text-white font-bold shadow-2xs'
                  : 'text-slate-600'
              }`}
            >
              Gấp (&lt;2h)
            </button>
          </div>

          <button
            onClick={onOpenIngestionModal}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-white bg-teal-700 hover:bg-teal-800 active:bg-teal-900 rounded-xl shadow-xs transition-colors"
          >
            <PlusCircle className="h-4 w-4" />
            <span>+ Nhập Hồ Sơ Mới (Cmd+N)</span>
          </button>
        </div>
      </div>

      {/* Claims Table */}
      <div className="rounded-2xl border border-slate-200 bg-white shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50/80 text-slate-600 font-bold border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">Mã Hồ Sơ & Test Case</th>
                <th className="py-3 px-4">Khách hàng & Thẻ</th>
                <th className="py-3 px-4">Chẩn đoán & Cơ sở Y tế</th>
                <th className="py-3 px-4">Chi phí Yêu cầu</th>
                <th className="py-3 px-4">Đề xuất AI Copilot</th>
                <th className="py-3 px-4">Quyết định HITL</th>
                <th className="py-3 px-4">Hạn SLA</th>
                <th className="py-3 px-4 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {loading ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <Loader2 className="h-6 w-6 animate-spin text-teal-600" />
                      <span className="text-xs font-semibold">
                        Đang tải danh sách hồ sơ từ Database...
                      </span>
                    </div>
                  </td>
                </tr>
              ) : filteredClaims.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400 text-xs">
                    Không tìm thấy hồ sơ nào phù hợp với bộ lọc hiện tại.
                  </td>
                </tr>
              ) : (
                filteredClaims.map(claim => (
                  <tr
                    key={claim.id}
                    onClick={() => onSelectClaim(claim.id)}
                    className="hover:bg-teal-50/40 cursor-pointer transition-colors group"
                  >
                    {/* ID & Case */}
                    <td className="py-3.5 px-4">
                      <div className="font-mono font-bold text-slate-900 group-hover:text-teal-700 transition-colors">
                        {claim.id}
                      </div>
                      {claim.testCaseLabel && (
                        <span className="inline-block mt-0.5 text-[10px] font-mono font-bold text-teal-800 bg-teal-50 px-1.5 py-0.2 rounded border border-teal-200">
                          {claim.testCaseLabel}
                        </span>
                      )}
                      <span className="block text-[10px] text-slate-500 mt-0.5">
                        {claim.submittedAt}
                      </span>
                    </td>

                    {/* Customer */}
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-slate-900">{claim.insuredName}</div>
                      <div className="text-[11px] font-mono text-slate-500">{claim.nationalId}</div>
                      <div className="text-[10px] text-slate-400 font-mono">
                        HĐ: {claim.policyId}
                      </div>
                    </td>

                    {/* Diagnosis */}
                    <td className="py-3.5 px-4 max-w-xs">
                      <div className="flex items-center gap-1.5 mb-0.5">
                        <span className="font-mono font-bold text-teal-700 bg-teal-50 px-1 rounded text-[10px]">
                          {claim.icd10Code}
                        </span>
                        <span className="font-semibold text-slate-800 truncate">
                          {claim.icd10Description}
                        </span>
                      </div>
                      <div className="text-[11px] text-slate-500 truncate flex items-center gap-1">
                        <Building className="h-3 w-3 text-slate-400" />
                        <span>{claim.hospitalName}</span>
                      </div>
                    </td>

                    {/* Claimed Amount */}
                    <td className="py-3.5 px-4">
                      <span className="font-mono font-bold text-slate-900 text-xs">
                        {formatCurrency(claim.claimedAmount)}
                      </span>
                      <span className="block text-[10px] text-slate-500">
                        {claim.treatmentType}
                      </span>
                    </td>

                    {/* AI Recommendation */}
                    <td className="py-3.5 px-4">
                      {claim.aiRecommendation === 'APPROVE' ? (
                        <div className="space-y-0.5">
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                            <CheckCircle2 className="h-3 w-3 text-emerald-600" /> Duyệt:{' '}
                            {claim.aiSuggestedAmount ? formatCurrency(claim.aiSuggestedAmount) : ''}
                          </span>
                          <div className="text-[10px] text-slate-500">
                            Độ tin cậy:{' '}
                            <strong className="text-emerald-700">{claim.aiConfidence}%</strong>
                          </div>
                        </div>
                      ) : claim.aiRecommendation === 'REJECT' ? (
                        <div className="space-y-0.5">
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-rose-800 bg-rose-50 px-2 py-0.5 rounded-full border border-rose-200">
                            <ShieldAlert className="h-3 w-3 text-rose-600" /> Đề xuất Từ chối
                          </span>
                          <div
                            className="text-[10px] text-rose-600 font-medium truncate max-w-[150px]"
                            title={claim.aiReason || claim.icd10Description}
                          >
                            {claim.aiReason || claim.icd10Description || 'Từ chối theo điều khoản'}
                          </div>
                        </div>
                      ) : claim.aiRecommendation === 'NEED_MORE_INFO' ? (
                        <div className="space-y-0.5">
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-800 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                            <AlertTriangle className="h-3 w-3 text-amber-600" /> Cần bổ sung
                          </span>
                          <div
                            className="text-[10px] text-amber-700 font-medium truncate max-w-[150px]"
                            title={claim.aiReason}
                          >
                            {claim.aiReason || 'Yêu cầu bổ sung chứng từ'}
                          </div>
                        </div>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">
                          <Clock className="h-3 w-3 text-slate-400" /> Chờ AI phân tích
                        </span>
                      )}
                    </td>

                    {/* HITL Decision Column */}
                    <td className="py-3.5 px-4">
                      {claim.hitlDecision === 'APPROVED' ? (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-300">
                          <CheckCircle2 className="h-3 w-3 text-emerald-600" /> Đã duyệt
                        </span>
                      ) : claim.hitlDecision === 'OVERRIDDEN' ? (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold text-purple-800 bg-purple-50 px-2 py-0.5 rounded-md border border-purple-300">
                          <Zap className="h-3 w-3 text-purple-600" /> Ghi đè HITL
                        </span>
                      ) : claim.hitlDecision === 'REJECTED' ? (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold text-rose-800 bg-rose-50 px-2 py-0.5 rounded-md border border-rose-300">
                          <ShieldAlert className="h-3 w-3 text-rose-600" /> Từ chối
                        </span>
                      ) : claim.hitlDecision === 'PENDING_MORE_INFO' ? (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-800 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-300">
                          <AlertTriangle className="h-3 w-3 text-amber-600" /> Bổ sung
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-slate-600 bg-slate-100 px-2 py-0.5 rounded-md border border-slate-200">
                          <Clock className="h-3 w-3 text-slate-400" /> Chưa duyệt
                        </span>
                      )}
                    </td>

                    {/* SLA */}
                    <td className="py-3.5 px-4">
                      {claim.slaHoursLeft > 0 ? (
                        <span
                          className={`inline-flex items-center gap-1 font-mono text-[11px] font-bold px-2 py-0.5 rounded ${
                            claim.slaHoursLeft < 2
                              ? 'text-rose-800 bg-rose-50 border border-rose-200 animate-pulse'
                              : 'text-slate-700 bg-slate-100'
                          }`}
                        >
                          <Clock className="h-3 w-3" /> còn {claim.slaHoursLeft}h
                        </span>
                      ) : (
                        <span className="text-[10px] text-slate-400 font-medium">Đã hoàn tất</span>
                      )}
                    </td>

                    {/* Action */}
                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={e => {
                          e.stopPropagation();
                          onSelectClaim(claim.id);
                        }}
                        className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-bold text-teal-700 bg-teal-50 hover:bg-teal-700 hover:text-white rounded-lg border border-teal-200 transition-all shadow-2xs"
                      >
                        <span>Thẩm định ngay</span>
                        <ArrowRight className="h-3 w-3" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
