import { apiClient } from './client';

export type AssignmentType =
  | 'AUTO'
  | 'AUTO_DISPATCH'
  | 'MANAGER_FALLBACK'
  | 'MANUAL_OVERRIDE'
  | 'FRONT_DESK'
  | 'LEGACY_IMPORT'
  | string;

export type FreshnessBucket =
  | 'FRESH'
  | 'FRESH_120'
  | 'SOFT_RECENT'
  | 'SOFT_RECENT_40_120'
  | 'HARD_COOLDOWN'
  | 'OVERRIDE'
  | string;

export interface BookingAssignmentItem {
  id: string;
  bookingId: string;
  hotelId: string;
  staffUserId?: string | null;
  staffName?: string | null;
  staffEmail?: string | null;
  staffRole?: string | null;
  assignmentVersion: number;
  assignmentType?: AssignmentType;
  type?: string;
  competencyLevel?: string | null;
  skillTier?: string | null;
  freshnessBucket?: FreshnessBucket | null;
  reason?: string | null;
  assignedAt: string;
  endedAt?: string | null;
  policyVersion?: string;
}

export type BookingAssignmentHistoryItem = BookingAssignmentItem;

export const bookingAssignmentApi = {
  /**
   * Lấy lịch sử và lý do phân công của một đơn đặt phòng
   */
  getHistory: async (
    bookingId: string | number,
  ): Promise<{ success: boolean; data: BookingAssignmentItem[] }> => {
    const response = await apiClient.get(
      `/booking-assignments/${bookingId}/history`,
    );
    return response.data;
  },

  /**
   * Kích hoạt phân công thủ công cho một booking
   */
  triggerAssignment: async (
    bookingId: string | number,
  ): Promise<{ success: boolean; data: any; message: string }> => {
    const response = await apiClient.post(
      `/booking-assignments/${bookingId}/assign`,
    );
    return response.data;
  },

  /**
   * Chạy job rà soát và phân công bù cho các booking chưa có người nhận
   */
  repairUnassigned: async (): Promise<{
    success: boolean;
    data: { repairedCount: number };
    message: string;
  }> => {
    const response = await apiClient.post('/booking-assignments/repair');
    return response.data;
  },
};
