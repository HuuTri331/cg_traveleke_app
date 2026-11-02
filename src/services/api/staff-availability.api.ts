import { apiClient } from './client';

export type AbsenceRequestType =
  | 'LEAVE'
  | 'LATE_ARRIVAL'
  | 'EARLY_LEAVE'
  | 'SHORT_ABSENCE';

export type AbsenceRequestStatus =
  | 'PENDING'
  | 'APPROVED'
  | 'REJECTED'
  | 'WITHDRAWN'
  | 'REVOCATION_REQUESTED'
  | 'REVOKED';

export interface StaffAbsenceRequestItem {
  id: string;
  hotelId: string;
  staffUserId: string;
  staffName?: string;
  staffEmail?: string;
  requestType: AbsenceRequestType;
  startAt: string;
  endAt: string;
  expectedArrivalAt?: string | null;
  reason: string;
  contactInfo?: string | null;
  evidenceRef?: string | null;
  status: AbsenceRequestStatus;
  decidedBy?: string | null;
  decidedAt?: string | null;
  decisionNote?: string | null;
  version: number;
  createdAt: string;
  updatedAt: string;
}

export const staffAvailabilityApi = {
  /**
   * Nhân viên nộp đơn xin nghỉ/đi muộn
   */
  submitRequest: async (data: {
    hotelId: string | number;
    requestType: AbsenceRequestType;
    startAt: string;
    endAt: string;
    expectedArrivalAt?: string;
    reason: string;
    contactInfo?: string;
    evidenceRef?: string;
  }): Promise<{ success: boolean; data: StaffAbsenceRequestItem; message: string }> => {
    const response = await apiClient.post('/staff-availability/requests', {
      ...data,
      hotelId: String(data.hotelId),
    });
    return response.data;
  },

  /**
   * Nhân viên xem danh sách các đơn của mình
   */
  getMyRequests: async (): Promise<{ success: boolean; data: StaffAbsenceRequestItem[] }> => {
    const response = await apiClient.get('/staff-availability/requests/me');
    return response.data;
  },

  /**
   * Quản lý xem danh sách đơn của khách sạn
   */
  getHotelRequests: async (
    hotelId: string | number,
    status?: AbsenceRequestStatus,
  ): Promise<{ success: boolean; data: StaffAbsenceRequestItem[] }> => {
    const response = await apiClient.get(
      `/staff-availability/requests/hotel/${hotelId}`,
      {
        params: status ? { status } : undefined,
      },
    );
    return response.data;
  },

  /**
   * Quản lý xét duyệt đơn (APPROVE / REJECT)
   */
  decideRequest: async (
    id: string | number,
    data: {
      decision: 'APPROVE' | 'REJECT';
      reviewNote?: string;
      expectedVersion?: number;
    },
  ): Promise<{ success: boolean; data: StaffAbsenceRequestItem; message: string }> => {
    const response = await apiClient.post(
      `/staff-availability/requests/${id}/decision`,
      data,
    );
    return response.data;
  },

  /**
   * Nhân viên rút đơn
   */
  withdrawRequest: async (
    id: string | number,
    data?: {
      reason?: string;
      expectedVersion?: number;
    },
  ): Promise<{ success: boolean; data: StaffAbsenceRequestItem; message: string }> => {
    const response = await apiClient.post(
      `/staff-availability/requests/${id}/withdraw`,
      data || {},
    );
    return response.data;
  },

  /**
   * Kiểm tra khả dụng của một nhân viên
   */
  checkAvailability: async (
    hotelId: string | number,
    staffUserId: string | number,
    at?: string,
  ): Promise<{ success: boolean; data: { available: boolean; activeBlock?: any } }> => {
    const response = await apiClient.get(
      `/staff-availability/check/${hotelId}/${staffUserId}`,
      {
        params: at ? { at } : undefined,
      },
    );
    return response.data;
  },

  /**
   * D1-07: Xem danh sách các booking và tác vụ bị ảnh hưởng bởi đơn nghỉ/đi muộn
   */
  getRequestImpact: async (
    requestId: string | number,
  ): Promise<{ success: boolean; data: { affectedBookings: any[]; affectedTasks: any[] } }> => {
    const response = await apiClient.get(`/staff-availability/requests/${requestId}/impact`);
    return response.data;
  },

  /**
   * D1-07: Quản lý xác nhận nhân sự vắng mặt khẩn cấp tạm thời (Emergency Unavailable)
   */
  createEmergencyUnavailable: async (data: {
    hotelId: string | number;
    staffUserId: string | number;
    startAt?: string;
    endAt: string;
    reason: string;
  }): Promise<{
    success: boolean;
    data: { block: any; affectedBookings: any[]; affectedTasks: any[] };
    message: string;
  }> => {
    const response = await apiClient.post('/staff-availability/emergency-unavailable', {
      hotelId: String(data.hotelId),
      staffUserId: String(data.staffUserId),
      startAt: data.startAt,
      endAt: data.endAt,
      reason: data.reason,
    });
    return response.data;
  },

  /**
   * Kết thúc sớm block vắng mặt khi nhân viên đã quay lại quầy
   */
  endBlockEarly: async (
    blockId: string | number,
    note?: string,
  ): Promise<{ success: boolean; data: any; message: string }> => {
    const response = await apiClient.post(`/staff-availability/blocks/${blockId}/end`, {
      note,
    });
    return response.data;
  },

  /**
   * Lấy danh sách các block vắng mặt đang hiệu lực tại khách sạn
   */
  getActiveBlocksForHotel: async (
    hotelId: string | number,
  ): Promise<{ success: boolean; data: any[] }> => {
    const response = await apiClient.get(`/staff-availability/blocks/hotel/${hotelId}`);
    return response.data;
  },
};
