'use client';

import React, { useState } from 'react';
import { BookOpen, X, ExternalLink, ShieldCheck } from 'lucide-react';

export interface PolicyCitationPillProps {
  clauseId: string;
  title?: string;
  clauseTitle?: string;
  content?: string;
  clauseSnippet?: string;
  confidence?: number;
  onOpenPolicyBrowser?: (clauseId: string) => void;
  onOpenInBrowser?: (clauseId: string) => void;
}

const POLICY_CLAUSE_DICTIONARY: Record<
  string,
  { title: string; content: string; chapter: string }
> = {
  'CLAUSE-GEN-POL-GOLD-99882-01': {
    chapter: 'Chương I - Quy tắc Chung',
    title: 'Hiệu lực Hợp đồng & Hạn mức Năm',
    content:
      'Hợp đồng số POL-GOLD-99882 cấp cho Nguyen Van A (CCCD: 001099012345). Hiệu lực từ 2026-01-01T00:00:00Z đến 2026-12-31T23:59:59Z. Hạn mức năm tối đa: 500,000,000 VND.',
  },
  'CLAUSE-BEN-POL-GOLD-99882-SURGERY': {
    chapter: 'Chương II - Quyền lợi Bảo hiểm',
    title: 'Quyền lợi Phẫu thuật (Surgery)',
    content:
      'Hạn mức tối đa mỗi lượt: 50,000,000 VND. Hạn mức năm: 150,000,000 VND. Tỷ lệ đồng chi trả (Copay): 20% áp dụng cho tất cả các chi phí phòng mổ, phẫu thuật viên và gây mê hồi sức.',
  },
  'CLAUSE-BEN-POL-GOLD-99882-INPATIENT': {
    chapter: 'Chương II - Quyền lợi Bảo hiểm',
    title: 'Quyền lợi Điều trị Nội trú (Inpatient Room & Board)',
    content:
      'Hạn mức tối đa mỗi lượt: 60,000,000 VND. Hạn mức năm: 200,000,000 VND. Tỷ lệ đồng chi trả (Copay): 10%. Giới hạn chi trả tiền ngày giường phòng: tối đa 3,000,000 VND/ngày.',
  },
  'POLICY-SEC-14.2': {
    chapter: 'Chương II - Quyền lợi Bảo hiểm',
    title: 'Quy tắc Tỷ lệ Đồng chi trả Nội trú 20%',
    content:
      'Áp dụng đồng chi trả 20% đối với các chi phí nội trú tại bệnh viện quốc tế/ngoài công lập không thuộc mạng lưới bảo lãnh trực tiếp.',
  },
  'POLICY-SEC-14.3': {
    chapter: 'Chương IV - Điểm Loại trừ Trách nhiệm Bảo hiểm',
    title: 'Loại trừ Thực phẩm chức năng & Dược mỹ phẩm',
    content:
      'Không chi trả cho thuốc bổ, thực phẩm chức năng tăng cường men gan, vitamin bồi bổ trừ trường hợp đặc trị cấp tính theo phác đồ Bộ Y Tế.',
  },
  'POLICY-SEC-6.1': {
    chapter: 'Chương III - Thời gian chờ & Miễn trừ',
    title: 'Quy định Miễn Thời gian chờ Cấp cứu',
    content:
      'Trường hợp cấp cứu y khoa đe dọa tính mạng (viêm ruột thừa cấp vỡ mủ) được miễn áp dụng thời gian chờ 30 ngày.',
  },
};

export function PolicyCitationPill({
  clauseId,
  title,
  clauseTitle,
  content,
  clauseSnippet,
  confidence,
  onOpenPolicyBrowser,
  onOpenInBrowser,
}: PolicyCitationPillProps) {
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);

  const matchedDict = POLICY_CLAUSE_DICTIONARY[clauseId];
  const displayTitle = title || clauseTitle || matchedDict?.title || clauseId;
  const displayContent =
    content ||
    clauseSnippet ||
    matchedDict?.content ||
    'Điều khoản tra cứu từ cơ sở dữ liệu quy tắc bảo hiểm.';
  const chapterName = matchedDict?.chapter || 'Quy tắc Nghiệp vụ Bảo hiểm';

  const handleOpenDrawer = () => {
    setIsPopoverOpen(false);
    if (onOpenPolicyBrowser) onOpenPolicyBrowser(clauseId);
    if (onOpenInBrowser) onOpenInBrowser(clauseId);
  };

  return (
    <div className="relative inline-block text-left">
      <button
        onClick={() => setIsPopoverOpen(prev => !prev)}
        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-teal-50 hover:bg-teal-100 text-teal-800 border border-teal-200 hover:border-teal-300 transition-all cursor-pointer shadow-2xs group"
        title="Nhấn để xem căn cứ điều khoản hợp đồng"
      >
        <BookOpen className="h-3.5 w-3.5 text-teal-600 group-hover:scale-105 transition-transform" />
        <span className="font-mono text-[11px] font-bold">{clauseId}</span>
        {confidence && (
          <span className="text-[10px] text-teal-600 font-mono bg-teal-100/60 px-1 rounded">
            {confidence}%
          </span>
        )}
      </button>

      {isPopoverOpen && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setIsPopoverOpen(false)} />

          <div className="absolute left-0 mt-1.5 w-80 sm:w-96 rounded-xl bg-white border border-slate-200 shadow-xl p-4 z-50 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-start justify-between pb-2 mb-2 border-b border-slate-100">
              <div className="flex items-center gap-1.5 text-teal-700">
                <ShieldCheck className="h-4 w-4" />
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 font-mono">
                  {chapterName}
                </span>
              </div>
              <button
                onClick={() => setIsPopoverOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-md transition-colors"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>

            <div className="space-y-2 text-xs">
              <h4 className="font-bold text-slate-900 text-[13px] leading-snug">{displayTitle}</h4>
              <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-100 text-slate-700 leading-relaxed text-[11px] italic">
                &ldquo;{displayContent}&rdquo;
              </div>
            </div>

            <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between">
              <span className="text-[10px] text-slate-600">Được trích dẫn bởi RAG Agent</span>
              <button
                onClick={handleOpenDrawer}
                className="inline-flex items-center gap-1 text-[11px] font-bold text-teal-700 hover:text-teal-800 hover:underline cursor-pointer"
              >
                <span>Xem toàn văn quy tắc</span>
                <ExternalLink className="h-3 w-3" />
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
