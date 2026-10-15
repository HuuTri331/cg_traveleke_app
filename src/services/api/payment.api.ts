import { apiClient } from './client';

export interface CheckoutSessionData {
  roomId: string;
  hotelId?: string;
  checkInAt: string;
  checkOutAt: string;
  roomCount: number;
  totalGuests: number;
  contactName: string;
  contactEmail: string;
  contactPhone: string;
  specialRequest?: string;
  idempotencyKey?: string;
}

export interface CheckoutSessionResponse {
  bookingId: string;
  bookingCode: string;
  paymentId: string;
  txnRef: string;
  paymentUrl: string;
  paymentExpiresAt: string;
  holdExpiresAt: string;
  amount: number;
  isIdempotentReplay?: boolean;
}

export interface PaymentStatusResponse {
  bookingId: string;
  bookingCode: string;
  txnRef: string;
  amount: number;
  paymentStatus: string;
  bookingStatus: string;
  holdStatus: string | null;
  vnpTransactionNo?: string | null;
  bankCode?: string | null;
  paidAt?: string | null;
}

export const paymentApi = {
  /**
   * Khởi tạo checkout session và lấy URL thanh toán VNPay
   */
  createCheckoutSession: async (
    data: CheckoutSessionData,
  ): Promise<CheckoutSessionResponse> => {
    const response = await apiClient.post('/payments/checkout-sessions', data);
    return response.data;
  },

  /**
   * Lấy trạng thái thanh toán theo bookingId (Khách hàng)
   */
  getPaymentStatus: async (bookingId: string) => {
    const response = await apiClient.get(`/payments/status/${bookingId}`);
    return response.data;
  },

  /**
   * Lấy trạng thái thanh toán theo txnRef (Return URL verification)
   * Yêu cầu JWT xác thực theo Section 8
   */
  getPaymentStatusByTxnRef: async (
    txnRef: string,
  ): Promise<PaymentStatusResponse> => {
    const response = await apiClient.get(`/payments/status-by-ref/${txnRef}`);
    return response.data;
  },

  /**
   * Thử lại thanh toán cho đơn chưa thanh toán hoặc đã hết hạn
   */
  retryPayment: async (bookingId: string) => {
    const response = await apiClient.post(`/payments/${bookingId}/attempts`);
    return response.data;
  },
};
