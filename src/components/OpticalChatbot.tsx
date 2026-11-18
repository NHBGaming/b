import { FormEvent, useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { MessageSquare, RotateCcw, Send, X } from 'lucide-react';
import { EDITORIAL_EASE } from './MotionPrimitives';

interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
}

interface OpticalChatbotProps {
  currentProductName?: string;
}

const STARTER_PROMPTS = [
  'Mặt tròn nên chọn mẫu kính nào?',
  'So sánh gọng Titanium và Acetate',
  'Tư vấn tròng chống ánh sáng xanh',
  'Cách thử kính AR & VR trên trang',
];

const INITIAL_MESSAGE: ChatMessage = {
  id: 'welcome-1',
  role: 'model',
  text: 'Xin chào, tôi là chuyên viên tư vấn của Solis Optique. Bạn cần gợi ý mẫu kính theo dáng mặt, tư vấn tròng kính hay hỗ trợ đặt lịch đo mắt?',
};

export function OpticalChatbot({ currentProductName }: OpticalChatbotProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([INITIAL_MESSAGE]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorText, setErrorText] = useState<string | null>(null);
  const listEndRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (isOpen) {
      listEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen, isLoading]);

  const sendMessage = async (textToSend: string) => {
    const trimmed = textToSend.trim();
    if (!trimmed || isLoading) return;

    const userMsg: ChatMessage = {
      id: `u-${Date.now()}`,
      role: 'user',
      text: trimmed,
    };

    const nextMessages = [...messages, userMsg];
    setMessages(nextMessages);
    setInput('');
    setErrorText(null);
    setIsLoading(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: nextMessages.map((m) => ({ role: m.role, text: m.text })),
          currentProduct: currentProductName,
        }),
      });

      const data = (await response.json()) as { reply?: string; error?: string };
      if (!response.ok || !data.reply) {
        throw new Error(data.error || 'Không thể nhận phản hồi từ trợ lý AI.');
      }

      const botMsg: ChatMessage = {
        id: `m-${Date.now()}`,
        role: 'model',
        text: data.reply,
      };
      setMessages((prev) => [...prev, botMsg]);
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : 'Đã xảy ra lỗi kết nối, vui lòng thử lại.';
      setErrorText(message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    void sendMessage(input);
  };

  return (
    <div className="fixed bottom-5 right-5 z-40 flex flex-col items-end gap-3">
      <AnimatePresence>
        {isOpen && (
          <motion.section
            initial={{ opacity: 0, y: 14, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 12, scale: 0.97 }}
            transition={{ duration: 0.2, ease: EDITORIAL_EASE }}
            role="dialog"
            aria-label="Trợ lý tư vấn mắt kính Solis Optique"
            className="w-[min(390px,calc(100vw-24px))] h-[520px] max-h-[78vh] bg-[#F7F6F2] rounded-2xl border border-[#141413]/15 shadow-2xl flex flex-col overflow-hidden origin-bottom-right"
          >
          {/* Header */}
          <div className="px-5 py-3.5 bg-[#141413] text-[#F7F6F2] flex items-center justify-between gap-3">
            <div>
              <h2 className="font-serif text-base font-medium">Chuyên viên Tư vấn AI</h2>
              <p className="text-[11px] text-[#F7F6F2]/70">
                Solis Optique · Tư vấn dáng mặt &amp; tròng kính
              </p>
            </div>
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => {
                  setMessages([INITIAL_MESSAGE]);
                  setErrorText(null);
                }}
                title="Bắt đầu hội thoại mới"
                aria-label="Làm mới hội thoại"
                className="w-8 h-8 rounded-lg flex items-center justify-center text-[#F7F6F2]/80 hover:bg-[#F7F6F2]/10 cursor-pointer"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                aria-label="Đóng hộp thoại tư vấn"
                className="w-8 h-8 rounded-lg flex items-center justify-center text-[#F7F6F2]/80 hover:bg-[#F7F6F2]/10 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {messages.map((msg) => {
              const isUser = msg.role === 'user';
              return (
                <div
                  key={msg.id}
                  className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[85%] px-3.5 py-2.5 rounded-xl text-xs leading-relaxed whitespace-pre-line ${
                      isUser
                        ? 'bg-[#2C3E35] text-[#F7F6F2]'
                        : 'bg-[#FFFFFF] text-[#141413] border border-[#141413]/10'
                    }`}
                  >
                    {msg.text}
                  </div>
                </div>
              );
            })}

            {isLoading && (
              <div className="flex justify-start">
                <div className="px-3.5 py-2.5 rounded-xl text-xs bg-[#FFFFFF] text-[#5C5B57] border border-[#141413]/10">
                  Đang tra cứu thông số gọng kính...
                </div>
              </div>
            )}

            {errorText && (
              <div
                role="alert"
                className="p-3 rounded-xl bg-[#FEF2F2] border border-[#991B1B]/20 text-xs text-[#991B1B]"
              >
                {errorText}
              </div>
            )}

            {messages.length <= 1 && !isLoading && (
              <div className="pt-2 space-y-1.5">
                <div className="text-[11px] font-medium text-[#5C5B57]">Gợi ý câu hỏi nhanh</div>
                <div className="flex flex-wrap gap-1.5">
                  {STARTER_PROMPTS.map((prompt) => (
                    <button
                      key={prompt}
                      type="button"
                      onClick={() => void sendMessage(prompt)}
                      className="text-left px-2.5 py-1.5 text-[11px] font-medium bg-[#FFFFFF] text-[#141413] border border-[#141413]/15 rounded-lg hover:bg-[#EFECE6] transition-colors cursor-pointer"
                    >
                      {prompt}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div ref={listEndRef} />
          </div>

          {/* Input Form */}
          <form
            onSubmit={handleSubmit}
            className="p-3 border-t border-[#141413]/10 bg-[#FFFFFF] flex items-center gap-2"
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Hỏi về dáng kính, giá, tròng cận..."
              aria-label="Nhập câu hỏi tư vấn mắt kính"
              className="flex-1 px-3 py-2 min-h-[40px] text-xs bg-[#F7F6F2] border border-[#141413]/15 rounded-lg text-[#141413] focus-visible:outline-2 focus-visible:outline-[#2C3E35]"
            />
            <button
              type="submit"
              disabled={isLoading || !input.trim()}
              aria-label="Gửi tin nhắn"
              className="w-10 h-10 rounded-lg bg-[#141413] text-[#F7F6F2] flex items-center justify-center hover:bg-[#2C3E35] disabled:opacity-45 transition-colors cursor-pointer shrink-0"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
          </motion.section>
        )}
      </AnimatePresence>

      {/* Floating Toggle Button */}
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        aria-expanded={isOpen}
        aria-label={isOpen ? 'Thu gọn trợ lý AI' : 'Mở trợ lý tư vấn AI'}
        className="inline-flex items-center gap-2 px-4 py-3 min-h-[44px] text-xs font-medium bg-[#141413] text-[#F7F6F2] rounded-full shadow-lg hover:bg-[#2C3E35] transition-colors cursor-pointer border border-[#F7F6F2]/15"
      >
        {isOpen ? (
          <>
            <X className="w-4 h-4" aria-hidden="true" />
            <span>Đóng tư vấn</span>
          </>
        ) : (
          <>
            <MessageSquare className="w-4 h-4" aria-hidden="true" />
            <span>Tư vấn AI</span>
          </>
        )}
      </button>
    </div>
  );
}
