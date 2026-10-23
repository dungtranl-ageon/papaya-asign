'use client';

import React from 'react';
import { ShieldCheck, FileText, CheckCircle2, Bot, Send } from 'lucide-react';

export function WorkstationLayout() {
  return (
    <div className="flex flex-col h-screen overflow-hidden bg-slate-50">
      {/* Top Header */}
      <header className="h-14 border-b border-slate-200 bg-white px-6 flex items-center justify-between shrink-0 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 rounded-lg bg-teal-600 flex items-center justify-center text-white font-bold">
            P
          </div>
          <span className="font-semibold text-slate-800 text-lg">Papaya Claims Copilot</span>
          <span className="text-xs px-2 py-0.5 rounded-full bg-teal-50 text-teal-700 border border-teal-200 font-medium">
            Assessor Workstation
          </span>
        </div>
        <div className="flex items-center gap-4 text-sm text-slate-600">
          <span>
            Assessor: <strong>Tran Quoc Dung</strong>
          </span>
          <div
            className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"
            title="System Online"
          />
        </div>
      </header>

      {/* Main Dual-Pane Container */}
      <main className="flex-1 flex overflow-hidden">
        {/* Left Pane: Claim Dossier (55%) */}
        <section className="w-[55%] border-r border-slate-200 bg-white flex flex-col overflow-y-auto">
          <div className="p-6 border-b border-slate-100 flex items-center justify-between">
            <div>
              <span className="text-xs font-semibold uppercase tracking-wider text-teal-700 bg-teal-50 px-2 py-1 rounded">
                Dossier #CLM-2026-001
              </span>
              <h1 className="text-xl font-bold text-slate-900 mt-2">
                Nguyen Van A — Acute Appendicitis
              </h1>
              <p className="text-sm text-slate-500">
                Hospital: FV Hospital | Admission: 2026-03-10 to 2026-03-13
              </p>
            </div>
            <div className="text-right">
              <span className="text-xs text-slate-500">Requested Amount</span>
              <p className="text-xl font-bold text-slate-900">45,000,000 VND</p>
            </div>
          </div>

          <div className="p-6 space-y-6">
            {/* Policy Info Card */}
            <div className="border border-slate-200 rounded-xl p-4 bg-slate-50/50">
              <h2 className="text-sm font-semibold text-slate-700 flex items-center gap-2 mb-2">
                <ShieldCheck className="h-4 w-4 text-teal-600" />
                Insurance Policy: POL-GOLD-99882
              </h2>
              <div className="grid grid-cols-3 gap-4 text-xs text-slate-600">
                <div>
                  Plan: <strong>Healthcare Gold</strong>
                </div>
                <div>
                  Status: <span className="text-emerald-600 font-semibold">ACTIVE</span>
                </div>
                <div>
                  Annual Limit: <strong>500,000,000 VND</strong>
                </div>
              </div>
            </div>

            {/* Invoices and Items */}
            <div>
              <h2 className="text-sm font-semibold text-slate-800 flex items-center gap-2 mb-3">
                <FileText className="h-4 w-4 text-slate-500" />
                Claimed Items (4 items)
              </h2>
              <div className="border border-slate-200 rounded-xl overflow-hidden divide-y divide-slate-200 text-sm">
                <div className="p-3 flex justify-between bg-white hover:bg-slate-50">
                  <div>
                    <p className="font-medium text-slate-800">Laparoscopic Appendectomy</p>
                    <span className="text-xs text-slate-400">SURGERY</span>
                  </div>
                  <span className="font-semibold text-slate-800">25,000,000 VND</span>
                </div>
                <div className="p-3 flex justify-between bg-white hover:bg-slate-50">
                  <div>
                    <p className="font-medium text-slate-800">Hospital Room & Board (3 days)</p>
                    <span className="text-xs text-slate-400">INPATIENT</span>
                  </div>
                  <span className="font-semibold text-slate-800">9,000,000 VND</span>
                </div>
                <div className="p-3 flex justify-between bg-white hover:bg-slate-50">
                  <div>
                    <p className="font-medium text-slate-800">Antibiotics & Pain Medication</p>
                    <span className="text-xs text-slate-400">MEDICATION</span>
                  </div>
                  <span className="font-semibold text-slate-800">6,000,000 VND</span>
                </div>
                <div className="p-3 flex justify-between bg-white hover:bg-slate-50">
                  <div>
                    <p className="font-medium text-slate-800">Pre-op Ultrasound & Blood Tests</p>
                    <span className="text-xs text-slate-400">LABORATORY</span>
                  </div>
                  <span className="font-semibold text-slate-800">5,000,000 VND</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Right Pane: AI Copilot & Assessment Workflow (45%) */}
        {/* Right Pane: Trợ lý Thẩm định Bồi thường (45%) */}
        <section className="w-[45%] flex flex-col bg-slate-50">
          <div className="p-4 border-b border-slate-200 bg-white flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Bot className="h-5 w-5 text-teal-600" />
              <h2 className="font-semibold text-slate-800 text-sm">Trợ lý Thẩm định Bồi thường</h2>
            </div>
            <button className="px-3 py-1.5 bg-teal-600 hover:bg-teal-700 text-white rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5 shadow-sm">
              Khởi chạy Thẩm định
            </button>
          </div>

          {/* Workflow Steps Preview */}
          <div className="p-4 border-b border-slate-200 bg-white/60">
            <div className="grid grid-cols-4 gap-2 text-center text-xs">
              <div className="p-2 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 flex flex-col items-center">
                <CheckCircle2 className="h-3.5 w-3.5 mb-1 text-emerald-600" />
                <span>Chứng từ</span>
              </div>
              <div className="p-2 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 flex flex-col items-center">
                <CheckCircle2 className="h-3.5 w-3.5 mb-1 text-emerald-600" />
                <span>Hợp đồng</span>
              </div>
              <div className="p-2 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 flex flex-col items-center">
                <CheckCircle2 className="h-3.5 w-3.5 mb-1 text-emerald-600" />
                <span>Chỉ định y khoa</span>
              </div>
              <div className="p-2 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 flex flex-col items-center">
                <CheckCircle2 className="h-3.5 w-3.5 mb-1 text-emerald-600" />
                <span>Chiết tính</span>
              </div>
            </div>
          </div>

          {/* Chat Messages Container */}
          <div className="flex-1 p-4 overflow-y-auto space-y-4">
            <div className="flex gap-3">
              <div className="h-7 w-7 rounded-full bg-teal-100 text-teal-700 flex items-center justify-center shrink-0 text-xs font-bold">
                AI
              </div>
              <div className="bg-white border border-slate-200 rounded-2xl rounded-tl-none p-3.5 text-xs text-slate-700 max-w-[85%] shadow-sm">
                <p className="font-semibold text-slate-900 mb-1">Báo cáo Thẩm định Sẵn sàng</p>
                <p>
                  Hồ sơ #CLM-2026-001 đã vượt qua 4 bước kiểm tra tự động. Phẫu thuật nội soi viêm
                  ruột thừa được xác nhận phù hợp chỉ định y khoa. Theo quy tắc hợp đồng{' '}
                  <strong>POL-GOLD-99882</strong> (đồng chi trả 20% phẫu thuật), số tiền bảo hiểm
                  chi trả hợp lệ là <strong>36.000.000 VND</strong>.
                </p>
              </div>
            </div>
          </div>

          {/* Chat Input */}
          <div className="p-4 bg-white border-t border-slate-200">
            <div className="flex items-center gap-2">
              <input
                type="text"
                placeholder="Đặt câu hỏi về điều khoản hợp đồng hoặc yêu cầu điều chỉnh..."
                className="flex-1 bg-slate-100 border border-slate-300 rounded-lg px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-teal-600"
              />
              <button className="p-2 bg-teal-600 hover:bg-teal-700 text-white rounded-lg transition-colors">
                <Send className="h-4 w-4" />
              </button>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
