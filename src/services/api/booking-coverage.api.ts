import { apiClient } from './client';

export type CoverageGrantStatus = 'ACTIVE' | 'EXPIRED' | 'REVOKED';

export type CoverageTaskType =
  | 'CHECK_IN'
  | 'CHECK_OUT'
  | 'PRE_ARRIVAL_CONTACT'
  | 'SERVICE_RESPONSE'
  | 'COMPLAINT_HANDLE'
  | 'ALL_SERVICE_TASKS';

export interface BookingCoverageGrantItem {
  id: string;
  bookingId: string;
  hotelId: string;
  principalStaffId: string;
  delegateStaffId: string;
  mode: 'TEMPORARY' | 'PERMANENT';
  startAt: string;
  endAt: string;
  status: CoverageGrantStatus;
  allowedTaskTypes?: string[] | null;
  createdBy: string;
  reason?: string | null;
  commandKey?: string | null;
  version: number;
  createdAt: string;
}

export interface BookingCoverageEventItem {
  id: string;
  grantId?: string | null;
  bookingId: string;
  eventType: string;
  actorId: string;
  oldValue?: Record<string, any> | null;
  newValue?: Record<string, any> | null;
  note?: string | null;
  occurredAt: string;
}

export interface CreateTemporaryCoveragePayload {
  delegateStaffUserId: string;
  startAt: string;
  endAt: string;
  allowedTaskTypes?: CoverageTaskType[];
  reason?: string;
  expectedAssignmentVersion?: number;
  commandId?: string;
}

export interface ExtendCoveragePayload {
  newEndAt: string;
  reason: string;
  expectedVersion: number;
}

export interface PermanentTransferPayload {
  toStaffUserId: string;
  reasonCode: string;
  reason: string;
  expectedAssignmentVersion?: number;
  commandId?: string;
}

export const bookingCoverageApi = {
  /**
   * Thiết lập ủy quyền hỗ trợ tạm thời (15m - 24h)
   */
  createTemporary: async (
    bookingId: string | number,
    payload: CreateTemporaryCoveragePayload,
  ): Promise<BookingCoverageGrantItem> => {
    const response = await apiClient.post(`/booking-coverage/${bookingId}/temporary`, payload);
    return response.data;
  },

  /**
   * Gia hạn quyền hỗ trợ tạm thời
   */
  extend: async (
    bookingId: string | number,
    grantId: string | number,
    payload: ExtendCoveragePayload,
  ): Promise<BookingCoverageGrantItem> => {
    const response = await apiClient.post(
      `/booking-coverage/${bookingId}/temporary/${grantId}/extend`,
      payload,
    );
    return response.data;
  },

  /**
   * Thu hồi quyền hỗ trợ tạm thời
   */
  revoke: async (
    bookingId: string | number,
    grantId: string | number,
    reason?: string,
  ): Promise<BookingCoverageGrantItem> => {
    const response = await apiClient.post(
      `/booking-coverage/${bookingId}/temporary/${grantId}/revoke`,
      { reason },
    );
    return response.data;
  },

  /**
   * Bàn giao trách nhiệm chính vĩnh viễn (Permanent Transfer)
   */
  permanentTransfer: async (
    bookingId: string | number,
    payload: PermanentTransferPayload,
  ): Promise<{ message: string; booking: any; staffId: string }> => {
    const response = await apiClient.post(
      `/booking-coverage/${bookingId}/permanent-transfer`,
      payload,
    );
    return response.data;
  },

  /**
   * Lấy dòng thời gian ủy quyền và lịch sử chuyển giao
   */
  getTimeline: async (
    bookingId: string | number,
  ): Promise<{
    grants: BookingCoverageGrantItem[];
    events: BookingCoverageEventItem[];
  }> => {
    const response = await apiClient.get(`/booking-coverage/${bookingId}/timeline`);
    return response.data;
  },

  /**
   * Lấy danh sách ủy quyền đang có hiệu lực theo khách sạn
   */
  getActiveGrants: async (hotelId: string | number): Promise<BookingCoverageGrantItem[]> => {
    const response = await apiClient.get(`/booking-coverage/hotel/${hotelId}/active`);
    return response.data;
  },
};

