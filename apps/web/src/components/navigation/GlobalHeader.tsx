'use client';

import React from 'react';
import Link from 'next/link';
import { ShieldCheck, BookOpen, History, HelpCircle, Inbox, User } from 'lucide-react';
import { useUiStore } from '@/store';

export function GlobalHeader() {
  const { openPolicyDrawer, openAuditDrawer } = useUiStore();

  const handleOpenShortcutHelp = () => {
    alert(
      'PHÍM TẮT THAO TÁC NHANH (HOTKEYS):\n\n' +
        '• Cmd + Enter: Mở hộp thoại Phê duyệt chi trả\n' +
        '• Cmd + Shift + R: Mở hộp thoại Từ chối bồi thường\n' +
        '• Cmd + Shift + I: Mở hộp thoại Yêu cầu bổ sung chứng từ\n' +
        '• Cmd + N: Mở hộp thoại Tiếp nhận hồ sơ mới\n' +
        '• Esc: Đóng các modal / drawer đang mở',
    );
  };

  return (
    <header className="h-14 border-b border-slate-200 bg-white px-5 flex items-center justify-between shrink-0 shadow-2xs z-30 select-none">
      {/* Left: Brand & Navigation */}
      <div className="flex items-center gap-4">
        {/* Brand Logo & Name */}
        <Link href="/claims" className="flex items-center gap-2.5 group">
          <div className="h-8 w-8 rounded-xl bg-gradient-to-tr from-teal-700 to-teal-500 flex items-center justify-center text-white shadow-2xs group-hover:scale-105 transition-transform">
            <ShieldCheck className="h-5 w-5" />
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-1.5">
              <span className="font-extrabold text-sm tracking-tight text-slate-900 group-hover:text-teal-700 transition-colors">
                PAPAYA
              </span>
              <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-teal-100 text-teal-800 uppercase font-mono">
                Copilot
              </span>
            </div>
            <span className="text-[9px] text-slate-600 font-medium">
              Hệ thống Thẩm định Bồi thường Thông minh
            </span>
          </div>
        </Link>

        <div className="h-5 w-px bg-slate-200" />

        {/* Quick Link to Queue */}
        <Link
          href="/claims"
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-600 hover:text-teal-800 hover:bg-slate-100 transition-colors"
        >
          <Inbox className="h-3.5 w-3.5 text-teal-600" />
          <span>Hàng đợi Bồi thường</span>
        </Link>
      </div>

      {/* Right: Quick Action Modals & Drawers */}
      <div className="flex items-center gap-2">
        {/* Policy Manual Drawer Trigger */}
        <button
          onClick={() => openPolicyDrawer()}
          className="p-2 text-slate-600 hover:text-teal-700 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer relative"
          title="Tra cứu Toàn văn Quy tắc Bảo hiểm (Sổ tay)"
        >
          <BookOpen className="h-4 w-4" />
        </button>

        {/* Audit Trail Drawer Trigger */}
        <button
          onClick={() => openAuditDrawer()}
          className="p-2 text-slate-600 hover:text-teal-700 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer relative"
          title="Nhật ký Kiểm toán Bất biến (Audit Trail)"
        >
          <History className="h-4 w-4" />
        </button>

        {/* Hotkey Guide */}
        <button
          onClick={handleOpenShortcutHelp}
          className="p-2 text-slate-600 hover:text-teal-700 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
          title="Bảng hướng dẫn Phím tắt (Hotkeys)"
        >
          <HelpCircle className="h-4 w-4" />
        </button>

        <div className="h-5 w-px bg-slate-200 hidden sm:block" />

        {/* System Online Badge */}
        <div className="flex items-center gap-1.5 text-[11px] font-medium text-emerald-800 bg-emerald-50 px-2 py-1 rounded-lg border border-emerald-200">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="hidden sm:inline font-mono font-semibold">AI Active</span>
        </div>

        {/* Assessor Profile Avatar */}
        <div className="flex items-center gap-2 pl-2 border-l border-slate-200">
          <div className="h-7 w-7 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-600">
            <User className="h-3.5 w-3.5" />
          </div>
          <div className="hidden lg:block text-left text-xs leading-none">
            <span className="font-bold text-slate-800 block text-[11px]">Chuyên viên</span>
            <span className="text-[9px] text-slate-600">Level 3 Assessor</span>
          </div>
        </div>
      </div>
    </header>
  );
}
