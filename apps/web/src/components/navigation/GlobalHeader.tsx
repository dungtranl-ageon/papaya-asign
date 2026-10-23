'use client';

import React from 'react';
import {
  ShieldCheck,
  Search,
  PlusCircle,
  BookOpen,
  History,
  HelpCircle,
  Sparkles,
  Layers,
} from 'lucide-react';

interface GlobalHeaderProps {
  currentView: 'queue' | 'workstation';
  onViewChange: (view: 'queue' | 'workstation') => void;
  activeClaimId?: string;
  onOpenNewClaimModal: () => void;
  onOpenPolicyDrawer: () => void;
  onOpenAuditDrawer: () => void;
  onOpenShortcutHelp: () => void;
  onSearchClick: () => void;
  searchQuery: string;
  onSearchChange: (q: string) => void;
}

export function GlobalHeader({
  currentView,
  onViewChange,
  activeClaimId,
  onOpenNewClaimModal,
  onOpenPolicyDrawer,
  onOpenAuditDrawer,
  onOpenShortcutHelp,
  onSearchClick,
  searchQuery,
  onSearchChange,
}: GlobalHeaderProps) {
  return (
    <header className="h-14 border-b border-slate-200 bg-white px-5 flex items-center justify-between shrink-0 shadow-2xs z-30 select-none">
      {/* Left: Brand & Navigation */}
      <div className="flex items-center gap-4">
        {/* Brand Logo & Name */}
        <div className="flex items-center gap-2.5">
          <div className="h-8 w-8 rounded-xl bg-gradient-to-tr from-teal-700 to-teal-500 flex items-center justify-center text-white shadow-2xs">
            <ShieldCheck className="h-5 w-5" />
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-1.5">
              <span className="font-extrabold text-sm tracking-tight text-slate-900">PAPAYA</span>
              <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-teal-100 text-teal-800 uppercase font-mono">
                Copilot
              </span>
            </div>
            <span className="text-[9px] text-slate-600 font-medium">
              Hệ thống Thẩm định Bồi thường Thông minh
            </span>
          </div>
        </div>

        <div className="h-5 w-px bg-slate-200" />

        {/* View Switcher (Queue <-> Workstation) */}
        <div className="flex items-center bg-slate-100 p-1 rounded-xl text-xs font-semibold">
          <button
            onClick={() => onViewChange('queue')}
            className={`px-3 py-1 rounded-lg transition-all flex items-center gap-1.5 cursor-pointer ${
              currentView === 'queue'
                ? 'bg-white text-teal-900 shadow-2xs font-bold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Layers className="h-3.5 w-3.5" />
            <span>Hàng đợi Hồ sơ</span>
          </button>
          <button
            onClick={() => onViewChange('workstation')}
            className={`px-3 py-1 rounded-lg transition-all flex items-center gap-1.5 cursor-pointer ${
              currentView === 'workstation'
                ? 'bg-white text-teal-900 shadow-2xs font-bold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Sparkles className="h-3.5 w-3.5 text-teal-600" />
            <span>Bàn Thẩm định (Dual-Pane)</span>
            {activeClaimId && (
              <span className="ml-1 text-[10px] font-mono font-normal text-slate-600">
                ({activeClaimId})
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Center: Quick Search Command Bar */}
      <div className="hidden md:flex items-center w-72 lg:w-96">
        <div className="relative w-full">
          <Search className="h-3.5 w-3.5 text-slate-600 absolute left-3 top-2.5 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => onSearchChange(e.target.value)}
            onClick={onSearchClick}
            placeholder="Tìm theo Mã hồ sơ, CCCD, Tên khách hàng... (Cmd+K)"
            className="w-full bg-slate-100/80 hover:bg-slate-100 focus:bg-white border border-slate-200 rounded-xl pl-8 pr-12 py-1.5 text-xs text-slate-800 placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-all font-sans"
          />
          <div className="absolute right-2.5 top-2 flex items-center gap-0.5 text-[10px] font-mono text-slate-600 bg-white border border-slate-200 px-1.5 py-0.2 rounded shadow-3xs">
            <span>⌘K</span>
          </div>
        </div>
      </div>

      {/* Right: Quick Action Modals & Drawers */}
      <div className="flex items-center gap-2">
        {/* + Nhập Hồ Sơ Mới Button */}
        <button
          onClick={onOpenNewClaimModal}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-white bg-teal-700 hover:bg-teal-800 active:bg-teal-900 rounded-xl shadow-xs transition-colors cursor-pointer"
          title="Nhập hồ sơ mới từ nguồn ngoài hoặc kịch bản mẫu (Cmd+N)"
        >
          <PlusCircle className="h-4 w-4" />
          <span>+ Nhập Hồ Sơ Mới</span>
        </button>

        <div className="h-4 w-px bg-slate-200 hidden sm:block" />

        {/* Drawer triggers */}
        <button
          onClick={onOpenPolicyDrawer}
          className="p-2 text-slate-600 hover:text-teal-700 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer relative"
          title="Tra cứu Toàn văn Quy tắc Bảo hiểm (Sổ tay)"
        >
          <BookOpen className="h-4 w-4" />
        </button>

        <button
          onClick={onOpenAuditDrawer}
          className="p-2 text-slate-600 hover:text-teal-700 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer relative"
          title="Nhật ký Kiểm toán Bất biến (Audit Trail)"
        >
          <History className="h-4 w-4" />
        </button>

        <button
          onClick={onOpenShortcutHelp}
          className="p-2 text-slate-600 hover:text-teal-700 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
          title="Bảng hướng dẫn Phím tắt (Hotkeys)"
        >
          <HelpCircle className="h-4 w-4" />
        </button>

        {/* System Online Badge */}
        <div className="ml-1 flex items-center gap-1.5 text-[11px] font-medium text-emerald-800 bg-emerald-50 px-2 py-1 rounded-lg border border-emerald-200">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="hidden lg:inline">AI Engine Active</span>
        </div>
      </div>
    </header>
  );
}
