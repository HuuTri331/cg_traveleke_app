import { apiClient } from './client';

export type PresenceEventType =
  | 'ARRIVAL_CONFIRMED'
  | 'NO_SHOW_MARKED'
  | 'LATE_CHECK_IN_RECOVERED'
  | 'DEPARTURE_CONFIRMED'
  | 'NO_SHOW_CLOSED'
  | 'LATE_ARRIVAL_NOTICED';

export interface BookingPresenceEventItem {
  id: string;
  bookingId: string;
  hotelId: string;
  fromStatus: string;
  toStatus: string;
  actorType: 'USER' | 'SYSTEM';
  actorId?: string | null;
  actorName?: string | null;
  eventType: PresenceEventType;
  lateMinutes?: number | null;
  reason?: string | null;
  occurredAt: string;
  createdAt: string;
}

export interface ConfirmArrivalPayload {
  note?: string;
  commandId?: string;
  expectedPresenceVersion?: number;
}

export interface ConfirmDeparturePayload {
  note?: string;
  commandId?: string;
}

export interface LateArrivalNoticePayload {
  expectedArrivalAt: string;
  note?: string;
}

export const bookingPresenceApi = {
  /**
   * Xác nhận khách nhận phòng tại quầy (Check-in hoặc Late Check-In Recovery)
   */
  confirmArrival: async (
    bookingId: string | number,
    payload?: ConfirmArrivalPayload,
  ): Promise<{
    booking: any;
    presenceEvent?: any;
    isFromNoShow: boolean;
    lateMinutes: number;
    alreadyCheckedIn: boolean;
    message: string;
  }> => {
    const response = await apiClient.post(
      `/booking-presence/${bookingId}/check-in`,
      payload || {},
    );
    return response.data;
  },

  /**
   * Xác nhận khách hoàn tất trả phòng (Check-out)
   */
  confirmDeparture: async (
    bookingId: string | number,
    payload?: ConfirmDeparturePayload,
  ): Promise<{
    booking: any;
    presenceEvent?: any;
    alreadyCompleted: boolean;
    message: string;
  }> => {
    const response = await apiClient.post(
      `/booking-presence/${bookingId}/check-out`,
      payload || {},
    );
    return response.data;
  },

  /**
   * Khách hàng gửi thông báo "Tôi dự kiến đến muộn"
   */
  recordLateArrivalNotice: async (
    bookingId: string | number,
    payload: LateArrivalNoticePayload,
  ): Promise<{
    success: boolean;
    data: any;
    message: string;
  }> => {
    const response = await apiClient.post(
      `/booking-presence/${bookingId}/late-arrival-notice`,
      payload,
    );
    return response.data;
  },

  /**
   * Lấy nhật ký dòng thời gian hiện diện của booking
   */
  getTimeline: async (
    bookingId: string | number,
  ): Promise<{
    success: boolean;
    data: BookingPresenceEventItem[];
  }> => {
    const response = await apiClient.get(
      `/booking-presence/${bookingId}/timeline`,
    );
    return response.data;
  },

  /**
   * Thống kê lượt đến, No-show, in-house theo khách sạn
   */
  getArrivalsSummary: async (
    hotelId: string | number,
  ): Promise<{
    success: boolean;
    data: {
      todayArrivals: any[];
      activeNoShows: any[];
      counts: {
        todayArrivalsCount: number;
        activeNoShowsCount: number;
        inHouseCount: number;
      };
    };
  }> => {
    const response = await apiClient.get(
      `/booking-presence/hotel/${hotelId}/arrivals`,
    );
    return response.data;
  },

  /**
   * Quản lý đánh dấu No-show thủ công
   */
  markNoShowManual: async (
    bookingId: string | number,
  ): Promise<{
    success: boolean;
    data: any;
    message: string;
  }> => {
    const response = await apiClient.post(
      `/booking-presence/${bookingId}/mark-no-show`,
    );
    return response.data;
  },
};
