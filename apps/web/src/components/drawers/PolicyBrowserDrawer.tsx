'use client';

import React, { useState, useEffect } from 'react';
import { X, Search, BookOpen, Bookmark, ShieldCheck } from 'lucide-react';

interface PolicyBrowserDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  initialClauseId?: string;
}

export function PolicyBrowserDrawer({
  isOpen,
  onClose,
  initialClauseId,
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

  const policyChapters = [
    {
      chapterTitle: 'Chương I: Định nghĩa & Quy định Chung',
      clauses: [
        {
          id: 'POLICY-SEC-1.1',
          title: 'Điều 1.1: Định nghĩa Người được Bảo hiểm & Đối tượng tham gia',
          content:
            'Người được bảo hiểm là công dân Việt Nam hoặc người nước ngoài đang cư trú hợp pháp tại Việt Nam từ đủ 15 ngày tuổi đến 65 tuổi tại thời điểm tham gia hợp đồng.',
        },
        {
          id: 'POLICY-SEC-2.1',
          title: 'Điều 2.1: Cơ sở Y tế Hợp pháp',
          content:
            'Cơ sở y tế được công nhận phải là bệnh viện, phòng khám được thành lập và hoạt động hợp pháp theo Luật Khám bệnh, chữa bệnh Việt Nam, có đầy đủ giấy phép hoạt động và mã số cơ sở y tế do Bộ Y tế cấp.',
        },
      ],
    },
    {
      chapterTitle: 'Chương II: Phạm vi Bảo hiểm & Quyền lợi Nội trú',
      clauses: [
        {
          id: 'POLICY-SEC-5.1',
          title: 'Điều 5.1: Chi phí Nằm viện & Phòng chăm sóc đặc biệt (ICU)',
          content:
            'Chi trả tiền phòng và giường bệnh tối đa 3.000.000 đ/ngày đối với Chương trình Bạc (Silver Plan). Trường hợp nằm tại khoa chăm sóc đặc biệt (ICU), mức chi trả tối đa là 6.000.000 đ/ngày, tối đa 30 ngày/năm.',
        },
        {
          id: 'POLICY-SEC-5.2',
          title: 'Điều 5.2: Chi phí Phẫu thuật & Thủ thuật Nội trú',
          content:
            'Chi trả các chi phí phẫu thuật bao gồm tiền công phẫu thuật viên, bác sĩ gây mê, phòng mổ, vật tư tiêu hao y tế thông thường trong danh mục cho phép. Hạn mức chi trả phẫu thuật tối đa 50.000.000 đ/năm.',
        },
        {
          id: 'POLICY-SEC-14.2',
          title: 'Điều 14.2: Tỷ lệ Đồng chi trả (Co-payment) Viện phí',
          content:
            'Mức đồng chi trả tiêu chuẩn 20% áp dụng cho toàn bộ chi phí khám chữa bệnh nội trú tại các bệnh viện tư nhân và quốc tế không thuộc mạng lưới bảo lãnh trực tiếp. Doanh nghiệp bảo hiểm chi trả 80% phần chi phí hợp lệ còn lại sau khi trừ đi các khoản loại trừ.',
        },
      ],
    },
    {
      chapterTitle: 'Chương III: Thời gian chờ (Waiting Period)',
      clauses: [
        {
          id: 'POLICY-SEC-4.2',
          title: 'Điều 4.2: Thời gian chờ Bệnh Thông thường (30 ngày)',
          content:
            'Áp dụng thời gian chờ 30 ngày kể từ ngày hợp đồng có hiệu lực đối với các bệnh lý nội khoa thông thường (viêm loét dạ dày tá tràng, viêm phế quản, cảm cúm). Mọi sự kiện phát sinh trước hoặc trong thời gian 30 ngày này đều không được bảo hiểm.',
        },
        {
          id: 'POLICY-SEC-6.1',
          title: 'Điều 6.1: Miễn áp dụng Thời gian chờ cho Cấp cứu Ngoại khoa',
          content:
            'Các trường hợp cấp cứu y khoa đe dọa trực tiếp đến tính mạng người được bảo hiểm (bao gồm viêm ruột thừa cấp, xoắn ruột, thủng dạ dày, đa chấn thương do tai nạn) được MIỄN HOÀN TOÀN thời gian chờ 30 ngày và được bảo hiểm ngay từ ngày hiệu lực đầu tiên của hợp đồng.',
        },
        {
          id: 'POLICY-SEC-7.1',
          title: 'Điều 7.1: Thời gian chờ Bệnh Đặc biệt & Bệnh có sẵn (365 ngày)',
          content:
            'Thời gian chờ 365 ngày (1 năm) áp dụng cho các bệnh lý đặc biệt như ung thư, tiểu đường, tim mạch, bệnh lý mạch máu não và các bệnh có sẵn đã tồn tại trước ngày tham gia bảo hiểm.',
        },
      ],
    },
    {
      chapterTitle: 'Chương IV: Điểm Loại trừ Trách nhiệm Bảo hiểm',
      clauses: [
        {
          id: 'POLICY-SEC-14.1',
          title: 'Điều 14.1: Các điểm loại trừ trách nhiệm bảo hiểm chung',
          content:
            'Không chi trả cho các hành vi cố ý gây thương tích, sử dụng chất gây nghiện, rượu bia vượt nồng độ cồn quy định khi tham gia giao thông, hoặc tham gia các hoạt động thể thao mạo hiểm có nguy cơ cao.',
        },
        {
          id: 'POLICY-SEC-14.3',
          title: 'Điều 14.3: Loại trừ Thực phẩm chức năng & Dược mỹ phẩm',
          content:
            'Các chế phẩm dinh dưỡng, thực phẩm chức năng bổ gan (Hepa-Care), vitamin bồi bổ cơ thể, khoáng chất tổng hợp, sữa dinh dưỡng y học và mỹ phẩm điều trị da liễu không thuộc danh mục chi trả, bất kể có được bác sĩ chuyên khoa kê trong đơn hay không.',
        },
        {
          id: 'POLICY-SEC-15.1',
          title: 'Điều 15.1: Phẫu thuật Thẩm mỹ & Chữa tật khúc xạ',
          content:
            'Không chi trả cho các can thiệp thẩm mỹ tạo hình, phẫu thuật Lasik, chỉnh nha thẩm mỹ, trừ trường hợp phẫu thuật tái tạo bắt buộc sau tai nạn giao thông được quy định rõ tại Điều 12.',
        },
      ],
    },
  ];

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
                  v2026.1
                </span>
              </h3>
              <p className="text-[11px] text-slate-400">
                Sổ tay quy tắc bảo hiểm sức khỏe cá nhân & gia đình chuẩn hóa
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
                    Quy tắc này được nạp vào vector embeddings của Mastra RAG Tool (
                    <code>lookupPolicy</code>) để tự động đối chiếu mã ICD-10 và hóa đơn bồi thường.
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
