import { apiClient } from './client';

export interface GuestMessageItem {
  id: string;
  conversationId: string;
  senderUserId: string;
  senderRole: 'CUSTOMER' | 'EMPLOYEE' | 'SYSTEM';
  body: string;
  clientMsgId?: string | null;
  sentAt: string;
}

export interface SendGuestMessagePayload {
  body: string;
  clientMsgId?: string;
}

export const guestConversationsApi = {
  /**
   * Lấy danh sách tin nhắn trao đổi của đơn đặt phòng
   */
  getMessages: async (bookingId: string | number): Promise<GuestMessageItem[]> => {
    const response = await apiClient.get(`/guest-conversations/booking/${bookingId}/messages`);
    return response.data;
  },

  /**
   * Gửi tin nhắn trao đổi cho đơn đặt phòng (idempotent với clientMsgId)
   */
  sendMessage: async (
    bookingId: string | number,
    payload: SendGuestMessagePayload,
  ): Promise<GuestMessageItem> => {
    const response = await apiClient.post(
      `/guest-conversations/booking/${bookingId}/messages`,
      payload,
    );
    return response.data;
  },
};

