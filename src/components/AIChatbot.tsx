import React, { useState, useRef, useEffect } from 'react';
import {
  Send, Bot, User, Search, BookOpen, ShieldCheck,
  Sparkles, Star, HelpCircle, ChevronRight, Check
} from 'lucide-react';
import { KNOWLEDGE_BASE } from '../data/initialData';
import { sound } from '../utils/soundEffects';

interface Message {
  id: string;
  sender: 'bot' | 'user';
  text: string;
  source?: string;
  hints?: string[];
}

export const AIChatbot: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      sender: 'bot',
      text: 'Chào bạn nhỏ đáng yêu của lớp 3A5! ⭐ Tớ là Bạn Sao Thông Thái – bạn đồng hành học tập của cậu đây. Cậu đang gặp bài toán khó, muốn luyện từ ngữ hay muốn tra cứu điều gì cùng Cô Kiều Thị Vân nào?',
      hints: [
        'Hỏi cách tính chu vi hình chữ nhật',
        'Mẹo phân biệt phụ âm L và N',
        'Bảng nhân 8 và 9 có mẹo nhớ nhanh không?',
        '5 nguyên tắc vàng khi dùng máy tính và AI',
      ],
    },
  ]);

  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [searchDocQuery, setSearchDocQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'chat' | 'docs'>('chat');

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  // Search Knowledge Docs
  const filteredDocs = KNOWLEDGE_BASE.filter(
    (doc) =>
      doc.title.toLowerCase().includes(searchDocQuery.toLowerCase()) ||
      doc.content.toLowerCase().includes(searchDocQuery.toLowerCase()) ||
      doc.subject.toLowerCase().includes(searchDocQuery.toLowerCase()) ||
      doc.tags.some((tag) => tag.toLowerCase().includes(searchDocQuery.toLowerCase()))
  );

  const handleSendMessage = async (textToSend?: string) => {
    const text = textToSend || inputMessage;
    if (!text.trim() || isLoading) return;

    const userMsg: Message = {
      id: `usr_${Date.now()}`,
      sender: 'user',
      text,
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputMessage('');
    setIsLoading(true);
    sound.playWheelTick();

    // Check knowledge base first for grounding
    const lower = text.toLowerCase();
    const matchedDoc = KNOWLEDGE_BASE.find(
      (doc) =>
        lower.includes(doc.subject.toLowerCase()) ||
        doc.tags.some((tag) => lower.includes(tag.toLowerCase())) ||
        doc.title.toLowerCase().split(' ').some((w) => w.length > 3 && lower.includes(w))
    );

    try {
      const response = await fetch('/api/gemini/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: text,
          history: messages.slice(-4),
        }),
      });

      const data = await response.json();

      if (data && data.reply) {
        setMessages((prev) => [
          ...prev,
          {
            id: `bot_${Date.now()}`,
            sender: 'bot',
            text: data.reply,
            source: matchedDoc ? matchedDoc.source : undefined,
          },
        ]);
        sound.playStarReward();
      } else {
        replyWithLocalGrounding(text, matchedDoc);
      }
    } catch {
      replyWithLocalGrounding(text, matchedDoc);
    } finally {
      setIsLoading(false);
    }
  };

  const replyWithLocalGrounding = (userText: string, doc?: typeof KNOWLEDGE_BASE[0]) => {
    if (doc) {
      setMessages((prev) => [
        ...prev,
        {
          id: `bot_${Date.now()}`,
          sender: 'bot',
          text: `Bạn Sao Thông Thái đã tra cứu tài liệu lớp 3 cho bạn này:\n\n${doc.content}\n\n🌟 Hãy thử tự làm một ví dụ nhỏ rồi khoe với cô Vân hoặc bố mẹ xem sao nhé!`,
          source: doc.source,
          hints: ['Cảm ơn Bạn Sao Thông Thái!', 'Cho tớ một câu đố nhỏ về phần này'],
        },
      ]);
    } else {
      setMessages((prev) => [
        ...prev,
        {
          id: `bot_${Date.now()}`,
          sender: 'bot',
          text: `Câu hỏi của bạn thật thú vị! ⭐ Bạn Sao Thông Thái gợi ý bạn hãy mở vở ghi chép lớp 3A5 của Cô Vân ra xem lại quy tắc, hoặc giơ tay trao đổi cùng cô giáo trên lớp nhé. Cậu có muốn thử một câu đố vui toán học không?`,
          hints: ['Đố tớ bảng nhân đi!', 'Kể cho tớ nghe về trường Ngô Thì Nhậm'],
        },
      ]);
    }
    sound.playStarReward();
  };

  return (
    <div className="space-y-6">
      {/* Intro Header */}
      <div className="bg-gradient-to-r from-rose-900 via-rose-800 to-amber-700 text-white rounded-3xl p-6 shadow-md border-2 border-amber-300">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-14 h-14 rounded-2xl bg-amber-400 text-rose-950 flex items-center justify-center font-bold text-3xl shadow-lg border border-white animate-bounce">
              ⭐
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-black text-amber-200 tracking-wide uppercase">
                BẠN SAO THÔNG THÁI 3A5
              </h2>
              <p className="text-xs sm:text-sm text-rose-100">
                “Người bạn AI thân thiện • Gợi mở từng bước • Tra cứu kho học liệu chuẩn xác”
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1 bg-black/20 p-1 rounded-2xl border border-white/20">
            <button
              onClick={() => setActiveTab('chat')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                activeTab === 'chat'
                  ? 'bg-amber-400 text-rose-950 shadow'
                  : 'text-white hover:text-amber-200'
              }`}
            >
              Trò Chuyện Cùng Bé Sao
            </button>
            <button
              onClick={() => setActiveTab('docs')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1 ${
                activeTab === 'docs'
                  ? 'bg-amber-400 text-rose-950 shadow'
                  : 'text-white hover:text-amber-200'
              }`}
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>Kho Tài Liệu Lớp 3</span>
            </button>
          </div>
        </div>
      </div>

      {activeTab === 'chat' ? (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden flex flex-col h-[550px]">
          {/* Safety Reminder Banner */}
          <div className="bg-emerald-50 border-b border-emerald-200 px-4 py-2 text-xs text-emerald-900 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-600 flex-shrink-0" />
              <span>
                <strong>Học tập an toàn cùng AI:</strong> Bạn Sao Thông Thái chỉ gợi mở cách làm, bạn nhỏ tự mình suy nghĩ và làm bài nhé!
              </span>
            </div>
            <span className="text-[10px] font-bold text-emerald-700 hidden sm:inline">
              Lớp 3A5 – Cô Vân
            </span>
          </div>

          {/* Chat Messages Log */}
          <div className="flex-1 p-4 sm:p-6 overflow-y-auto space-y-4">
            {messages.map((msg) => {
              const isBot = msg.sender === 'bot';

              return (
                <div
                  key={msg.id}
                  className={`flex items-start gap-3 ${isBot ? '' : 'flex-row-reverse'}`}
                >
                  <div
                    className={`w-9 h-9 rounded-2xl flex items-center justify-center font-bold text-sm shadow-sm flex-shrink-0 ${
                      isBot
                        ? 'bg-amber-400 text-rose-950 border border-amber-300'
                        : 'bg-rose-900 text-white'
                    }`}
                  >
                    {isBot ? '⭐' : '🧒'}
                  </div>

                  <div
                    className={`max-w-[85%] sm:max-w-[75%] rounded-3xl p-4 text-xs sm:text-sm leading-relaxed ${
                      isBot
                        ? 'bg-slate-50 border border-slate-200 text-slate-800'
                        : 'bg-rose-900 text-white shadow-sm'
                    }`}
                  >
                    <div className="whitespace-pre-line">{msg.text}</div>

                    {/* Source Citation */}
                    {msg.source && (
                      <div className="mt-3 pt-2 border-t border-slate-200/60 text-[11px] text-slate-500 italic flex items-center gap-1">
                        <BookOpen className="w-3.5 h-3.5 text-amber-600 flex-shrink-0" />
                        <span>Nguồn trích dẫn: {msg.source}</span>
                      </div>
                    )}

                    {/* Suggested Quick Prompt Chips */}
                    {msg.hints && msg.hints.length > 0 && (
                      <div className="mt-3 pt-2 border-t border-slate-200/60 flex flex-wrap gap-1.5">
                        {msg.hints.map((hint, hIdx) => (
                          <button
                            key={hIdx}
                            onClick={() => handleSendMessage(hint)}
                            className="text-[11px] bg-white hover:bg-amber-100 text-rose-900 font-bold px-2.5 py-1 rounded-xl border border-amber-300 transition"
                          >
                            💡 {hint}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}

            {isLoading && (
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-2xl bg-amber-400 text-rose-950 flex items-center justify-center font-bold text-sm">
                  ⭐
                </div>
                <div className="bg-slate-50 border border-slate-200 p-4 rounded-3xl text-xs text-slate-500 italic flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping"></span>
                  <span>Bạn Sao Thông Thái đang suy nghĩ gợi ý cho bạn...</span>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Chat Input Bar */}
          <div className="p-3 sm:p-4 bg-slate-50 border-t border-slate-200">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSendMessage();
              }}
              className="flex items-center gap-2"
            >
              <input
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                placeholder="Nhập câu hỏi của bạn (Ví dụ: Chu vi hình chữ nhật tính thế nào?)..."
                className="flex-1 px-4 py-2.5 rounded-2xl bg-white border border-slate-300 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-rose-800"
              />
              <button
                type="submit"
                disabled={!inputMessage.trim() || isLoading}
                className="px-5 py-2.5 bg-rose-900 hover:bg-rose-950 text-amber-300 rounded-2xl text-xs font-bold transition flex items-center gap-1.5 shadow disabled:opacity-50"
              >
                <Send className="w-4 h-4" />
                <span className="hidden sm:inline">Gửi Bạn Sao</span>
              </button>
            </form>
          </div>
        </div>
      ) : (
        /* KNOWLEDGE BASE REPOSITORY VIEW */
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 space-y-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
            <div>
              <h3 className="font-extrabold text-base text-slate-800">
                Kho Tài Liệu & Quy Tắc Học Tập Lớp 3
              </h3>
              <p className="text-xs text-slate-500">
                Tài liệu đã được Cô Kiều Thị Vân kiểm duyệt và biên soạn chuẩn xác
              </p>
            </div>

            <div className="relative w-full sm:w-72">
              <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
              <input
                type="text"
                value={searchDocQuery}
                onChange={(e) => setSearchDocQuery(e.target.value)}
                placeholder="Tìm bài học, công thức, quy tắc..."
                className="w-full pl-10 pr-4 py-2 rounded-2xl bg-slate-50 border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-rose-800"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredDocs.map((doc) => (
              <div
                key={doc.id}
                className="p-5 rounded-3xl border-2 border-slate-100 bg-slate-50/50 hover:bg-white hover:border-amber-300 transition-all shadow-sm space-y-2 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[11px] font-bold text-rose-800 bg-rose-50 px-2.5 py-0.5 rounded-full border border-rose-200">
                      {doc.subject}
                    </span>
                  </div>
                  <h4 className="font-extrabold text-sm text-slate-800 mb-2">{doc.title}</h4>
                  <p className="text-xs text-slate-600 whitespace-pre-line leading-relaxed">
                    {doc.content}
                  </p>
                </div>

                <div className="pt-3 border-t border-slate-200/60 flex items-center justify-between text-[11px] text-slate-500 italic">
                  <span className="truncate max-w-[220px]">📖 {doc.source}</span>
                  <button
                    onClick={() => {
                      setActiveTab('chat');
                      handleSendMessage(`Bạn Sao Thông Thái hãy giải thích kỹ hơn bài: ${doc.title}`);
                    }}
                    className="text-rose-900 font-bold hover:underline not-italic"
                  >
                    Hỏi Bạn Sao →
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
