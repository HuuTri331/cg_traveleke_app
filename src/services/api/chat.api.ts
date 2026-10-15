import { apiClient } from './client';

import type {
  ChatRequest,
  ChatResponse,
} from '@/types/chat';

export async function sendChatMessage(
  message: string,
): Promise<ChatResponse> {
  const payload: ChatRequest = {
    message,
  };

  const response = await apiClient.post<ChatResponse>(
    '/chat',
    payload,
    {
      // Ollama chạy local có thể cần nhiều thời gian hơn API thông thường.
      timeout: 120000,
    },
  );

  return response.data;
}