'use client';

import {
  Bot,
  LoaderCircle,
  MessageCircle,
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
    'Xin chào! Tôi là trợ lý tìm khách sạn của Traveleke. Bạn muốn tìm khách sạn ở đâu?',
};

export default function ChatBox() {
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

  const createMessageId = () => {
    const id = messageIdRef.current;
    messageIdRef.current += 1;
    return id;
  };

  const handleSubmit = async () => {
    const message = input.trim();

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

    setInput('');
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
          : 'Không thể kết nối với trợ lý. Vui lòng thử lại.';

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
            fixed bottom-24 right-4 z-[9999]
            flex h-[min(650px,calc(100vh-120px))]
            w-[calc(100vw-32px)] max-w-[400px]
            flex-col overflow-hidden rounded-3xl
            border border-slate-200 bg-white
            shadow-2xl
            sm:right-6
          "
        >
          <header className="flex items-center justify-between bg-blue-600 px-4 py-3 text-white">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/20">
                <Bot className="h-5 w-5" />
              </div>

              <div>
                <h2 className="text-sm font-semibold">
                  Traveleke Assistant
                </h2>

                <p className="text-xs text-blue-100">
                  Trợ lý tìm khách sạn
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setIsOpen(false)}
              aria-label="Đóng chat"
              className="rounded-full p-2 transition hover:bg-white/15"
            >
              <X className="h-5 w-5" />
            </button>
          </header>

          <div className="custom-scrollbar flex-1 space-y-4 overflow-y-auto bg-slate-50 p-4">
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
                      ? 'flex max-w-[85%] flex-row-reverse items-start gap-2'
                      : 'flex w-full items-start gap-2'
                  }
                >
                  <div
                    className={
                      message.role === 'user'
                        ? 'flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-blue-600 text-white'
                        : 'flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-slate-200 text-blue-600'
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
                        ? 'max-w-full rounded-2xl rounded-tr-sm bg-blue-600 px-3.5 py-2.5 text-sm text-white'
                        : 'min-w-0 flex-1'
                    }
                  >
                    {message.role === 'assistant' ? (
                      <>
                        <div className="inline-block rounded-2xl rounded-tl-sm border border-slate-200 bg-white px-3.5 py-2.5 text-sm leading-6 text-slate-700 shadow-sm">
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

            {isLoading && (
              <div className="flex items-start gap-2">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-slate-200 text-blue-600">
                  <Bot className="h-4 w-4" />
                </div>

                <div className="flex items-center gap-2 rounded-2xl rounded-tl-sm border border-slate-200 bg-white px-4 py-3 text-sm text-slate-500 shadow-sm">
                  <LoaderCircle className="h-4 w-4 animate-spin" />
                  <span>Đang tìm kiếm...</span>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          <form
            onSubmit={handleFormSubmit}
            className="border-t border-slate-200 bg-white p-3"
          >
            <div className="flex items-end gap-2 rounded-2xl border border-slate-300 bg-slate-50 px-3 py-2 focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-100">
              <textarea
                value={input}
                onChange={(event) => setInput(event.target.value)}
                onKeyDown={handleKeyDown}
                disabled={isLoading}
                rows={1}
                maxLength={1000}
                placeholder="Nhập yêu cầu tìm khách sạn..."
                className="max-h-24 min-h-6 flex-1 resize-none bg-transparent text-sm text-slate-800 outline-none placeholder:text-slate-400 disabled:cursor-not-allowed"
              />

              <button
                type="submit"
                disabled={!input.trim() || isLoading}
                aria-label="Gửi tin nhắn"
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-blue-600 text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-slate-300"
              >
                {isLoading ? (
                  <LoaderCircle className="h-4 w-4 animate-spin" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
              </button>
            </div>

            <p className="mt-1.5 text-center text-[10px] text-slate-400">
              AI hỗ trợ tìm kiếm dựa trên dữ liệu của Traveleke
            </p>
          </form>
        </section>
      )}

      <button
        type="button"
        onClick={() => setIsOpen((current) => !current)}
        aria-label={isOpen ? 'Đóng trợ lý' : 'Mở trợ lý'}
        className="
          fixed bottom-5 right-4 z-[9999]
          flex h-14 w-14 items-center justify-center
          rounded-full bg-blue-600 text-white
          shadow-lg transition
          hover:scale-105 hover:bg-blue-700
          sm:right-6
        "
      >
        {isOpen ? (
          <X className="h-6 w-6" />
        ) : (
          <MessageCircle className="h-6 w-6" />
        )}
      </button>
    </>
  );
}