import { apiClient } from './client';

export interface CancellationRequestItem {
  id: string;
  bookingId: string;
  bookingCode?: string;
  hotelId?: string;
  hotelName?: string;
  requestedBy: string;
  requesterType: 'CUSTOMER' | 'STAFF' | 'ADMIN';
  reason: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'CANCELLED';
  reviewedBy?: string | null;
  reviewedAt?: string | null;
  reviewNote?: string | null;
  refundAmount: string | number;
  createdAt: string;
  updatedAt: string;
}

export const cancellationApi = {
  /**
   * Khách hàng / nhân viên gửi yêu cầu hủy đơn
   */
  requestCancellation: async (data: {
    bookingId: string;
    reason: string;
  }): Promise<{ message: string; data: CancellationRequestItem }> => {
    const response = await apiClient.post('/cancellations/request', data);
    return response.data;
  },

  /**
   * Quản lý khách sạn / Admin xét duyệt yêu cầu hủy
   */
  reviewCancellation: async (
    requestId: string,
    data: { action: 'APPROVE' | 'REJECT'; reviewNote?: string },
  ): Promise<{ message: string; data: any }> => {
    const response = await apiClient.patch(`/cancellations/${requestId}/review`, data);
    return response.data;
  },

  /**
   * Lấy danh sách yêu cầu hủy
   */
  getAll: async (): Promise<CancellationRequestItem[]> => {
    const response = await apiClient.get('/cancellations');
    return response.data;
  },

  /**
   * Chi tiết yêu cầu hủy
   */
  getOne: async (requestId: string): Promise<CancellationRequestItem> => {
    const response = await apiClient.get(`/cancellations/${requestId}`);
    return response.data;
  },
};
