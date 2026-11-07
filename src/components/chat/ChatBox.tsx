'use client';

import {
  Bot,
  LoaderCircle,
  Sparkles,
  Send,
  User,
  X,
} from 'lucide-react';
import {
  FormEvent,
  KeyboardEvent,
  useEffect,
  useRef,
  useState,
} from 'react';
import { usePathname } from 'next/navigation';

import { sendChatMessage } from '@/services/api/chat.api';
import type { ChatHotelResult } from '@/types/chat';

import ChatHotelCard from './ChatHotelCard';

interface ChatMessage {
  id: number;
  role: 'user' | 'assistant';
  content: string;
  results?: ChatHotelResult[];
}

const INITIAL_MESSAGE: ChatMessage = {
  id: 1,
  role: 'assistant',
  content:
    'Xin chào quý khách! Tôi là Trợ lý Concierge AI của Traveleke. Quý khách đang tìm kiếm khách sạn tại điểm đến nào hay cần gợi ý phòng nghỉ phù hợp ngân sách?',
};

const QUICK_PROMPTS = [
  'Khách sạn 5 sao tại Đà Nẵng',
  'Phòng cho 2 người dưới 2 triệu',
  'Resort nghỉ dưỡng gần biển',
];

export default function ChatBox() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([
    INITIAL_MESSAGE,
  ]);
  const [isLoading, setIsLoading] = useState(false);

  const messageIdRef = useRef(2);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    messagesEndRef.current?.scrollIntoView({
      behavior: 'smooth',
    });
  }, [messages, isLoading, isOpen]);

  if (pathname?.startsWith('/dashboard') || pathname === '/login') {
    return null;
  }

  const createMessageId = () => {
    const id = messageIdRef.current;
    messageIdRef.current += 1;
    return id;
  };

  const handleSubmit = async (customPrompt?: string) => {
    const message = (customPrompt ?? input).trim();

    if (!message || isLoading) {
      return;
    }

    setMessages((current) => [
      ...current,
      {
        id: createMessageId(),
        role: 'user',
        content: message,
      },
    ]);

    if (!customPrompt) {
      setInput('');
    }
    setIsLoading(true);

    try {
      const response = await sendChatMessage(message);

      setMessages((current) => [
        ...current,
        {
          id: createMessageId(),
          role: 'assistant',
          content: response.reply,
          results: response.results,
        },
      ]);
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : 'Không thể kết nối với trợ lý Concierge. Vui lòng thử lại.';

      setMessages((current) => [
        ...current,
        {
          id: createMessageId(),
          role: 'assistant',
          content: errorMessage,
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFormSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    void handleSubmit();
  };

  const handleKeyDown = (
    event: KeyboardEvent<HTMLTextAreaElement>,
  ) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      void handleSubmit();
    }
  };

  return (
    <>
      {isOpen && (
        <section
          className="
            lux-scale-in fixed bottom-24 right-4 z-[9999]
            flex h-[min(640px,calc(100vh-120px))]
            w-[calc(100vw-32px)] max-w-[400px]
            flex-col overflow-hidden rounded-3xl
            border border-[#1E4752]/18 bg-white
            shadow-[0_24px_60px_rgba(30,71,82,0.24)]
            sm:right-6
          "
        >
          <header className="flex items-center justify-between bg-[#1E4752] px-5 py-4 text-white border-b border-[#E8A700]/30">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#E8A700] text-[#1E4752] shadow-xs">
                <Bot className="h-5 w-5" />
              </div>

              <div>
                <div className="flex items-center gap-1.5">
                  <h2 className="text-sm font-bold tracking-wide text-white">
                    Traveleke Concierge
                  </h2>
                  <span className="h-2 w-2 rounded-full bg-[#E8A700] animate-pulse" />
                </div>

                <p className="text-[11px] text-white/75">
                  Tư vấn khách sạn & kỳ nghỉ bằng AI 24/7
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setIsOpen(false)}
              aria-label="Đóng chat"
              className="lux-press rounded-full p-2 text-white/80 transition hover:bg-white/15 hover:text-white cursor-pointer"
            >
              <X className="h-5 w-5" />
            </button>
          </header>

          <div className="custom-scrollbar flex-1 space-y-4 overflow-y-auto bg-[#1E4752]/[0.02] p-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={
                  message.role === 'user'
                    ? 'flex justify-end'
                    : 'flex justify-start'
                }
              >
                <div
                  className={
                    message.role === 'user'
                      ? 'flex max-w-[85%] flex-row-reverse items-start gap-2.5'
                      : 'flex w-full items-start gap-2.5'
                  }
                >
                  <div
                    className={
                      message.role === 'user'
                        ? 'flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#E8A700]/20 text-[#1E4752] border border-[#E8A700]/50'
                        : 'flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#1E4752] text-[#E8A700] border border-[#E8A700]/40'
                    }
                  >
                    {message.role === 'user' ? (
                      <User className="h-4 w-4" />
                    ) : (
                      <Bot className="h-4 w-4" />
                    )}
                  </div>

                  <div
                    className={
                      message.role === 'user'
                        ? 'max-w-full rounded-2xl rounded-tr-xs bg-[#1E4752] px-4 py-2.5 text-sm text-white shadow-xs'
                        : 'min-w-0 flex-1'
                    }
                  >
                    {message.role === 'assistant' ? (
                      <>
                        <div className="inline-block rounded-2xl rounded-tl-xs border border-[#1E4752]/12 bg-white px-4 py-3 text-sm leading-relaxed text-[#1E4752] shadow-xs">
                          {message.content}
                        </div>

                        {message.results &&
                          message.results.length > 0 && (
                            <div className="mt-3 space-y-3">
                              {message.results.map((hotel) => (
                                <ChatHotelCard
                                  key={`${hotel.hotelId}-${hotel.roomId}`}
                                  hotel={hotel}
                                />
                              ))}
                            </div>
                          )}
                      </>
                    ) : (
                      <p className="whitespace-pre-wrap">
                        {message.content}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            ))}

            {messages.length === 1 && !isLoading && (
              <div className="pt-1 space-y-2">
                <p className="text-[11px] font-bold uppercase tracking-wider text-[#1E4752]/60 px-1">
                  Gợi ý tìm kiếm nhanh
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {QUICK_PROMPTS.map((prompt) => (
                    <button
                      key={prompt}
                      type="button"
                      onClick={() => void handleSubmit(prompt)}
                      className="lux-press rounded-full border border-[#1E4752]/15 bg-white px-3 py-1.5 text-xs font-semibold text-[#1E4752] hover:border-[#E8A700] hover:bg-[#E8A700]/10 transition cursor-pointer"
                    >
                      {prompt}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {isLoading && (
              <div className="flex items-start gap-2.5">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#1E4752] text-[#E8A700]">
                  <Bot className="h-4 w-4" />
                </div>

                <div className="flex items-center gap-2 rounded-2xl rounded-tl-xs border border-[#1E4752]/12 bg-white px-4 py-3 text-xs font-semibold text-[#1E4752]/80 shadow-xs">
                  <LoaderCircle className="h-4 w-4 animate-spin text-[#E8A700]" />
                  <span>Concierge đang tìm kiếm khách sạn...</span>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          <form
            onSubmit={handleFormSubmit}
            className="border-t border-[#1E4752]/10 bg-white p-3.5"
          >
            <div className="flex items-end gap-2 rounded-2xl border border-[#1E4752]/20 bg-[#1E4752]/[0.02] px-3.5 py-2 focus-within:border-[#E8A700] focus-within:bg-white focus-within:ring-2 focus-within:ring-[#E8A700]/20 transition">
              <textarea
                value={input}
                onChange={(event) => setInput(event.target.value)}
                onKeyDown={handleKeyDown}
                disabled={isLoading}
                rows={1}
                maxLength={1000}
                placeholder="VD: Tìm khách sạn tại Đà Nẵng cho 2 người..."
                className="max-h-24 min-h-6 flex-1 resize-none bg-transparent text-sm font-medium text-[#1E4752] outline-none placeholder:text-[#1E4752]/45 disabled:cursor-not-allowed"
              />

              <button
                type="submit"
                disabled={!input.trim() || isLoading}
                aria-label="Gửi tin nhắn"
                className="lux-press flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#E8A700] text-[#1E4752] transition hover:bg-[#E8A700]/90 disabled:cursor-not-allowed disabled:opacity-40 cursor-pointer"
              >
                {isLoading ? (
                  <LoaderCircle className="h-4 w-4 animate-spin" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
              </button>
            </div>

            <p className="mt-1.5 text-center text-[10px] font-medium text-[#1E4752]/55">
              Concierge AI gợi ý trực tiếp từ hệ thống dữ liệu Traveleke
            </p>
          </form>
        </section>
      )}

      <button
        type="button"
        onClick={() => setIsOpen((current) => !current)}
        aria-label={isOpen ? 'Đóng trợ lý' : 'Mở trợ lý'}
        className="
          lux-press group fixed bottom-5 right-4 z-[9999]
          flex items-center gap-2.5
          rounded-full bg-[#1E4752] px-4 py-3 text-white
          border border-[#E8A700]/45
          shadow-[0_14px_34px_rgba(30,71,82,0.28)]
          transition-all duration-300
          hover:-translate-y-0.5 hover:border-[#E8A700]
          sm:right-6 cursor-pointer
        "
      >
        {isOpen ? (
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-white/10 text-white">
            <X className="h-5 w-5" />
          </span>
        ) : (
          <>
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#E8A700] text-[#1E4752] shadow-xs transition-transform duration-300 group-hover:rotate-12">
              <Sparkles className="h-4 w-4" />
            </span>
            <span className="pr-1 text-xs font-extrabold uppercase tracking-wider text-white">
              Concierge AI
            </span>
          </>
        )}
      </button>
    </>
  );
}