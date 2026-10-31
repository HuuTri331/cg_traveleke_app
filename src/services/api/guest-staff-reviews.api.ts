import { apiClient } from './client';

export type ReviewStage = 'PRE_ARRIVAL' | 'CHECK_IN' | 'IN_STAY' | 'CHECK_OUT';

export interface EligibleReviewTarget {
  staffUserId: string;
  stage: ReviewStage;
  alreadyReviewed: boolean;
}

export interface GuestStaffReviewItem {
  id: string;
  bookingId: string;
  hotelId: string;
  reviewerUserId: string;
  staffUserId: string;
  stage: ReviewStage;
  stars: number;
  comment?: string | null;
  status: string;
  submittedAt: string;
}

export interface SubmitStaffReviewPayload {
  bookingId: string;
  staffUserId: string;
  stage: ReviewStage;
  stars: number;
  comment?: string;
}

export interface UpdateStaffReviewPayload {
  stars: number;
  comment?: string;
  reason: string;
}

export const guestStaffReviewsApi = {
  /**
   * Lấy danh sách nhân viên đủ điều kiện đánh giá theo từng giai đoạn
   */
  getEligibleTargets: async (bookingId: string | number): Promise<EligibleReviewTarget[]> => {
    const response = await apiClient.get(`/staff-reviews/booking/${bookingId}/eligible`);
    return response.data;
  },

  /**
   * Gửi đánh giá nhân viên (1 - 5 sao)
   */
  submitReview: async (payload: SubmitStaffReviewPayload): Promise<GuestStaffReviewItem> => {
    const response = await apiClient.post('/staff-reviews', payload);
    return response.data;
  },

  /**
   * Cập nhật đánh giá đã gửi (lưu revision audit)
   */
  updateReview: async (
    reviewId: string | number,
    payload: UpdateStaffReviewPayload,
  ): Promise<GuestStaffReviewItem> => {
    const response = await apiClient.patch(`/staff-reviews/${reviewId}`, payload);
    return response.data;
  },
};

