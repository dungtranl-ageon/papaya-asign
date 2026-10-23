'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Bot, User, Send, Sparkles, RefreshCw, FileText } from 'lucide-react';
import { PolicyCitationPill } from './PolicyCitationPill';

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: string;
  citations?: Array<{
    clauseId: string;
    clauseTitle: string;
    clauseSnippet: string;
  }>;
}

interface CopilotChatProps {
  claimId?: string;
  onOpenPolicyBrowser?: (clauseId: string) => void;
}

const INITIAL_MESSAGE: ChatMessage = {
  id: 'msg-1',
  role: 'assistant',
  content: `Xin chào! Tôi là Trợ lý Thẩm định AI (Papaya Copilot). Tôi đã hoàn tất phân tích hồ sơ theo quy tắc 4 bước (verifyDocument ➔ lookupPolicy ➔ checkMedicalNecessity ➔ calculateBenefit).
  
Kết quả phát hiện:
- Chẩn đoán **Viêm ruột thừa cấp (K35.8)** điều trị tại BV Pháp Việt là **Cấp cứu hợp lệ** (không áp dụng thời gian chờ).
- Bị loại trừ khoản **2.000.000 đ** do hóa đơn có mục Thực phẩm chức năng bổ gan Hepa-Care không thuộc danh mục bồi thường.
- Số tiền đề xuất phê duyệt: **13.200.000 đ** (sau khi khấu trừ 20% đồng chi trả).

Bạn có thể bấm vào các gợi ý dưới đây hoặc đặt câu hỏi bất kỳ để tôi trích dẫn điều khoản hợp đồng nhé!`,
  timestamp: '14:25',
  citations: [
    {
      clauseId: 'POLICY-SEC-14.3',
      clauseTitle: 'Loại trừ thực phẩm chức năng',
      clauseSnippet:
        'Khoản chi phí cho thuốc bổ, thực phẩm chức năng không thuộc danh mục bồi thường.',
    },
  ],
};

export function CopilotChat({ claimId = 'CLM-2026-03891', onOpenPolicyBrowser }: CopilotChatProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([INITIAL_MESSAGE]);
  const [input, setInput] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isStreaming]);

  const quickPrompts = [
    'Tại sao từ chối khoản thuốc bổ gan 2.000.000đ?',
    'Kiểm tra lại thời hạn hiệu lực hợp đồng & thời gian chờ',
    'Trích dẫn điều khoản đồng chi trả 20%',
    'Khách hàng có lịch sử gian lận trục lợi không?',
  ];

  const handleSendMessage = (textToSend?: string) => {
    const prompt = textToSend || input;
    if (!prompt.trim() || isStreaming) return;

    const userMsg: ChatMessage = {
      id: `usr-${Date.now()}`,
      role: 'user',
      content: prompt,
      timestamp: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsStreaming(true);

    // Realistic response simulator based on questions
    setTimeout(() => {
      let botResponse = '';
      let citations: ChatMessage['citations'] = [];

      if (prompt.includes('thuốc bổ gan') || prompt.includes('2.000.000')) {
        botResponse = `Theo **Quy tắc Bảo hiểm Sức khỏe Tiêu chuẩn (Khoản 14.3 - Danh mục Loại trừ)**:
        
Các chế phẩm dinh dưỡng, thực phẩm bảo vệ sức khỏe, vitamin tổng hợp và dược mỹ phẩm (kể cả do bác sĩ kê đơn nhưng mang tính chất bổ trợ chức năng gan thận) **không nằm trong phạm vi chi trả**.
Hóa đơn số 003891 thể hiện rõ mục "Hepa-Care 500mg - 2.000.000 đ" thuộc nhóm thực phẩm bảo vệ sức khỏe, do đó hệ thống tự động loại trừ khỏi Chi phí hợp lệ.`;
        citations = [
          {
            clauseId: 'POLICY-SEC-14.3',
            clauseTitle: 'Loại trừ chi phí dinh dưỡng & TPCN',
            clauseSnippet:
              'Không chi trả cho thuốc bổ, thực phẩm chức năng, vitamin trừ trường hợp vitamin đặc trị thiếu hụt cấp tính.',
          },
        ];
      } else if (prompt.includes('thời gian chờ') || prompt.includes('hiệu lực')) {
        botResponse = `Hợp đồng bảo hiểm **POL-2024-8891** có hiệu lực từ ngày **01/01/2026**.
        
Chẩn đoán bệnh lý của hồ sơ là **Viêm ruột thừa cấp vỡ mủ (K35.8)** - được xếp vào nhóm **Cấp cứu y khoa khẩn cấp (Emergency Medical Condition)**.
Căn cứ **Điều 6.1**: Thời gian chờ 30 ngày đối với bệnh thông thường được **MIỄN ÁP DỤNG** cho các ca phẫu thuật cấp cứu nguy hiểm tính mạng. Do đó, hồ sơ hoàn toàn đủ điều kiện bảo hiểm!`;
        citations = [
          {
            clauseId: 'POLICY-SEC-6.1',
            clauseTitle: 'Quy định Miễn Thời gian chờ Cấp cứu',
            clauseSnippet:
              'Trường hợp cấp cứu y khoa đe dọa tính mạng được miễn áp dụng thời gian chờ 30 ngày.',
          },
        ];
      } else if (prompt.includes('đồng chi trả') || prompt.includes('20%')) {
        botResponse = `Theo Chương trình Bạc (Silver Plan) ký kết:
        
Mức **Đồng chi trả (Co-payment)** là **20%** áp dụng cho tất cả chi phí điều trị nội trú tại bệnh viện tư nhân và quốc tế (Bệnh viện FV). 
Công thức tính:
- Chi phí yêu cầu: 18.500.000 đ
- Chi phí sau loại trừ: 16.500.000 đ
- Đồng chi trả 20%: 3.300.000 đ
- Doanh nghiệp bảo hiểm chi trả 80%: **13.200.000 đ**.`;
        citations = [
          {
            clauseId: 'POLICY-SEC-14.2',
            clauseTitle: 'Quy tắc Tỷ lệ Đồng chi trả Nội trú',
            clauseSnippet:
              'Áp dụng đồng chi trả 20% đối với các chi phí nội trú tại bệnh viện quốc tế/ngoài công lập.',
          },
        ];
      } else {
        botResponse = `Tôi đã đối chiếu cơ sở dữ liệu quy tắc nghiệp vụ và thông tin hồ sơ ${claimId}:
        
- Hồ sơ đầy đủ 3/3 chứng từ bắt buộc (Giấy ra viện, Bảng kê chi phí, Hóa đơn VAT).
- Không có bất kỳ dấu hiệu gian lận trùng lắp hóa đơn hay trùng khoảng thời gian nằm viện trên toàn hệ thống liên thông.
- Bạn có thể an tâm tiến hành **[Phê duyệt]** hoặc sử dụng phím tắt **Cmd + Enter**.`;
      }

      setMessages(prev => [
        ...prev,
        {
          id: `bot-${Date.now()}`,
          role: 'assistant',
          content: botResponse,
          timestamp: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
          citations,
        },
      ]);
      setIsStreaming(false);
    }, 700);
  };

  return (
    <div className="flex flex-col h-[520px] rounded-xl border border-slate-200 bg-white shadow-2xs overflow-hidden">
      {/* Header */}
      <div className="px-4 py-3 border-b border-slate-100 bg-slate-50/70 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-teal-600 text-white shadow-2xs">
            <Bot className="h-4 w-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h4 className="text-xs font-bold text-slate-800">Trợ lý Thẩm định Copilot</h4>
              <span className="flex items-center gap-1 text-[10px] text-teal-700 bg-teal-50 px-1.5 py-0.2 rounded border border-teal-200 font-semibold">
                <Sparkles className="h-2.5 w-2.5 text-teal-600" /> Grounded RAG
              </span>
            </div>
            <p className="text-[10px] text-slate-600">
              Hỗ trợ trích dẫn điều khoản hợp đồng & giải thích quyết định
            </p>
          </div>
        </div>

        <button
          onClick={() => {
            setMessages([INITIAL_MESSAGE]);
          }}
          className="p-1.5 text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
          title="Làm mới hội thoại"
        >
          <RefreshCw className="h-3.5 w-3.5" />
        </button>
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50/30">
        {messages.map(msg => (
          <div
            key={msg.id}
            className={`flex gap-3 text-xs leading-relaxed ${
              msg.role === 'user' ? 'justify-end' : 'justify-start'
            }`}
          >
            {msg.role === 'assistant' && (
              <div className="shrink-0 w-7 h-7 rounded-full bg-teal-700 text-white flex items-center justify-center font-bold text-[11px] shadow-2xs">
                AI
              </div>
            )}

            <div
              className={`max-w-[85%] rounded-2xl p-3.5 shadow-2xs ${
                msg.role === 'user'
                  ? 'bg-teal-700 text-white rounded-tr-xs'
                  : 'bg-white border border-slate-200/90 text-slate-800 rounded-tl-xs'
              }`}
            >
              <div className="whitespace-pre-line">{msg.content}</div>

              {/* Citations list if attached */}
              {msg.citations && msg.citations.length > 0 && (
                <div className="mt-3 pt-2.5 border-t border-slate-100 flex flex-wrap gap-1.5 items-center">
                  <span className="text-[10px] text-slate-700 font-semibold flex items-center gap-1">
                    <FileText className="h-3 w-3 text-teal-600" /> Căn cứ điều khoản:
                  </span>
                  {msg.citations.map(c => (
                    <PolicyCitationPill
                      key={c.clauseId}
                      clauseId={c.clauseId}
                      clauseTitle={c.clauseTitle}
                      clauseSnippet={c.clauseSnippet}
                      confidence={99}
                      onOpenInBrowser={onOpenPolicyBrowser}
                    />
                  ))}
                </div>
              )}

              <div
                className={`mt-1.5 text-[9px] text-right font-mono ${
                  msg.role === 'user' ? 'text-teal-200' : 'text-slate-600'
                }`}
              >
                {msg.timestamp}
              </div>
            </div>

            {msg.role === 'user' && (
              <div className="shrink-0 w-7 h-7 rounded-full bg-slate-700 text-white flex items-center justify-center font-bold text-[11px] shadow-2xs">
                <User className="h-3.5 w-3.5" />
              </div>
            )}
          </div>
        ))}

        {isStreaming && (
          <div className="flex gap-3 text-xs justify-start">
            <div className="shrink-0 w-7 h-7 rounded-full bg-teal-700 text-white flex items-center justify-center font-bold text-[11px]">
              AI
            </div>
            <div className="bg-white border border-slate-200/90 rounded-2xl p-3.5 rounded-tl-xs flex items-center gap-2 text-slate-600 shadow-2xs">
              <span className="inline-block w-2 h-2 rounded-full bg-teal-600 animate-bounce" />
              <span className="inline-block w-2 h-2 rounded-full bg-teal-600 animate-bounce [animation-delay:0.2s]" />
              <span className="inline-block w-2 h-2 rounded-full bg-teal-600 animate-bounce [animation-delay:0.4s]" />
              <span className="text-[11px] font-medium text-slate-600 ml-1">
                Đang tra cứu quy tắc & đối chiếu...
              </span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Quick Prompts Suggestions */}
      <div className="px-3.5 py-2 border-t border-slate-100 bg-white overflow-x-auto flex gap-1.5 no-scrollbar">
        {quickPrompts.map((prompt, i) => (
          <button
            key={i}
            onClick={() => handleSendMessage(prompt)}
            disabled={isStreaming}
            className="shrink-0 text-[11px] font-medium text-slate-700 hover:text-teal-700 bg-slate-50 hover:bg-teal-50 border border-slate-200 hover:border-teal-300 rounded-full px-3 py-1 transition-all disabled:opacity-50 cursor-pointer"
          >
            {prompt}
          </button>
        ))}
      </div>

      {/* Input Bar */}
      <div className="p-3 border-t border-slate-200 bg-white">
        <form
          onSubmit={e => {
            e.preventDefault();
            handleSendMessage();
          }}
          className="flex items-center gap-2"
        >
          <input
            type="text"
            value={input}
            onChange={e => setInput(e.target.value)}
            placeholder="Hỏi AI về quy tắc bồi thường, điều khoản loại trừ hoặc tra cứu y khoa..."
            className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:bg-white transition-all"
            disabled={isStreaming}
          />
          <button
            type="submit"
            disabled={!input.trim() || isStreaming}
            className="p-2 rounded-xl bg-teal-600 text-white hover:bg-teal-700 disabled:opacity-40 disabled:hover:bg-teal-600 transition-colors shadow-2xs cursor-pointer"
            title="Gửi câu hỏi (Enter)"
          >
            <Send className="h-4 w-4" />
          </button>
        </form>
      </div>
    </div>
  );
}
