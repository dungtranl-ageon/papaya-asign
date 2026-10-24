'use client';

import React, { useState, useEffect } from 'react';
import { X, Search, BookOpen, Bookmark, ShieldCheck } from 'lucide-react';
import { POLICY_CHAPTERS_DATA } from '../../constants/policy-chapters';

interface PolicyBrowserDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  initialClauseId?: string;
  policyNumber?: string;
}

export function PolicyBrowserDrawer({
  isOpen,
  onClose,
  initialClauseId,
  policyNumber = 'POL-GOLD-99882',
}: PolicyBrowserDrawerProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedClauseId, setSelectedClauseId] = useState<string>(
    initialClauseId || 'POLICY-SEC-14.3',
  );

  useEffect(() => {
    if (initialClauseId) {
      setSelectedClauseId(initialClauseId);
    }
  }, [initialClauseId]);

  if (!isOpen) return null;

  const policyChapters = POLICY_CHAPTERS_DATA;

  // Filter clauses by search query
  const filteredChapters = policyChapters
    .map(chap => {
      const matched = chap.clauses.filter(
        c =>
          c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          c.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
          c.id.toLowerCase().includes(searchQuery.toLowerCase()),
      );
      return { ...chap, clauses: matched };
    })
    .filter(chap => chap.clauses.length > 0);

  const currentClause = policyChapters
    .flatMap(ch => ch.clauses)
    .find(c => c.id === selectedClauseId);

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-slate-900/40 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="w-full max-w-2xl bg-white h-full shadow-2xl border-l border-slate-200 flex flex-col animate-in slide-in-from-right duration-300">
        {/* Header */}
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-teal-500/20 text-teal-400 border border-teal-500/30">
              <BookOpen className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <span>Tra Cứu Quy Tắc Bảo Hiểm Toàn Văn</span>
                <span className="text-[10px] font-mono text-teal-300 bg-teal-900/60 px-1.5 py-0.5 rounded border border-teal-700">
                  {policyNumber}
                </span>
              </h3>
              <p className="text-[11px] text-slate-400">
                Quy tắc và điều khoản chi trả bảo hiểm y tế chuẩn hóa
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Search Bar */}
        <div className="p-4 bg-slate-50 border-b border-slate-200 shrink-0">
          <div className="relative">
            <Search className="h-4 w-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Tìm kiếm theo từ khóa: thời gian chờ, ruột thừa, đồng chi trả, loại trừ..."
              className="w-full bg-white border border-slate-200 rounded-xl pl-9 pr-4 py-2 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
            />
          </div>
        </div>

        {/* Main Content Layout (Sidebar tree & Clause Preview) */}
        <div className="flex-1 flex overflow-hidden">
          {/* Chapter & Clause List */}
          <div className="w-1/2 border-r border-slate-200 overflow-y-auto p-4 space-y-4 text-xs bg-slate-50/40">
            {filteredChapters.map((chap, idx) => (
              <div key={idx} className="space-y-1.5">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                  {chap.chapterTitle}
                </span>
                <div className="space-y-1">
                  {chap.clauses.map(clause => {
                    const isSelected = clause.id === selectedClauseId;
                    return (
                      <button
                        key={clause.id}
                        onClick={() => setSelectedClauseId(clause.id)}
                        className={`w-full text-left p-2.5 rounded-xl border transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-teal-50 border-teal-300 text-teal-950 font-bold shadow-2xs ring-1 ring-teal-500'
                            : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-100 hover:text-slate-900'
                        }`}
                      >
                        <div className="flex items-center justify-between text-[10px] text-slate-500 font-mono mb-0.5">
                          <span>{clause.id}</span>
                          {isSelected && <ShieldCheck className="h-3 w-3 text-teal-600" />}
                        </div>
                        <div className="text-[11px] leading-snug line-clamp-2">{clause.title}</div>
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>

          {/* Clause Reader Details View */}
          <div className="w-1/2 overflow-y-auto p-5 text-xs bg-white space-y-4">
            {currentClause ? (
              <div className="space-y-4">
                <div className="pb-3 border-b border-slate-100">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-mono text-[10px] font-bold text-teal-700 bg-teal-50 px-2 py-0.5 rounded border border-teal-200">
                      {currentClause.id}
                    </span>
                    <span className="text-[10px] text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded font-semibold">
                      Đang có hiệu lực
                    </span>
                  </div>
                  <h4 className="text-sm font-bold text-slate-900">{currentClause.title}</h4>
                </div>

                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-slate-700 leading-relaxed text-xs">
                  {currentClause.content}
                </div>

                <div className="p-3 rounded-xl bg-teal-50/60 border border-teal-200 text-[11px] text-teal-900 space-y-1">
                  <span className="font-bold flex items-center gap-1">
                    <Bookmark className="h-3.5 w-3.5 text-teal-700" />
                    <span>Ứng dụng trong Thẩm định AI:</span>
                  </span>
                  <p>
                    Quy tắc này được nạp trực tiếp vào ngữ cảnh thẩm định của công cụ (
                    <code>lookupPolicy</code>) để tự động đối chiếu mã ICD-10 và kiểm tra quy tắc
                    loại trừ bồi thường.
                  </p>
                </div>
              </div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-slate-400 text-center">
                <BookOpen className="h-8 w-8 mb-2 opacity-50" />
                <p>Chọn một điều khoản bên trái để xem nội dung chi tiết</p>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-[11px] text-slate-500 shrink-0">
          <span>Bản quyền Quy tắc Nghiệp vụ © 2026 Papaya Insurance</span>
          <button
            onClick={onClose}
            className="px-3 py-1.5 font-bold text-slate-700 bg-white border border-slate-300 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
          >
            Đóng lại (Esc)
          </button>
        </div>
      </div>
    </div>
  );
}
