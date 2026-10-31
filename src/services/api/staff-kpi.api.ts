import { apiClient } from './client';

export interface StaffKpiMetricScoreItem {
  id: string;
  metricCode: string;
  weight: number;
  eligible: boolean;
  numerator: number;
  denominator: number;
  rawValue: number;
  score: number;
  evidenceCount: number;
  noDataReason?: string | null;
}

export interface StaffKpiPeriodScoreItem {
  id: string;
  hotelId: string;
  staffUserId: string;
  periodKey: string;
  policyVersion: string;
  calculationVersion: number;
  totalScore: number;
  coverageRatio: number;
  sampleCount: number;
  status: 'DRAFT' | 'APPROVED' | 'LOCKED';
  calculatedAt: string;
  approvedAt?: string | null;
  approvedBy?: string | null;
  reviewNote?: string | null;
  metrics?: StaffKpiMetricScoreItem[];
}

export interface RequestKpiAdjustmentPayload {
  staffUserId: string;
  periodKey: string;
  metricCode: string;
  delta: number;
  reason: string;
  evidenceRef?: string;
}

export const staffKpiApi = {
  /**
   * Xem điểm KPI của tôi trong kỳ (period format: YYYY-MM)
   */
  getMyKpi: async (
    hotelId: string | number,
    period?: string,
  ): Promise<StaffKpiPeriodScoreItem> => {
    const response = await apiClient.get('/staff-kpi/me', {
      params: { hotelId, period },
    });
    return response.data;
  },

  /**
   * Lấy bảng điểm KPI toàn bộ nhân viên theo khách sạn trong kỳ
   */
  getHotelKpis: async (
    hotelId: string | number,
    period?: string,
  ): Promise<StaffKpiPeriodScoreItem[]> => {
    const response = await apiClient.get(`/staff-kpi/hotels/${hotelId}`, {
      params: { period },
    });
    return response.data;
  },

  /**
   * Xem chi tiết điểm KPI của một nhân viên
   */
  getStaffKpi: async (
    hotelId: string | number,
    staffId: string | number,
    period?: string,
  ): Promise<StaffKpiPeriodScoreItem> => {
    const response = await apiClient.get(`/staff-kpi/hotels/${hotelId}/staff/${staffId}`, {
      params: { period },
    });
    return response.data;
  },

  /**
   * Tính toán lại KPI
   */
  recalculateKpi: async (
    hotelId: string | number,
    period: string,
    staffUserId?: string,
  ): Promise<StaffKpiPeriodScoreItem | { message: string }> => {
    const response = await apiClient.post(
      `/staff-kpi/periods/${period}/recalculate`,
      { staffUserId },
      { params: { hotelId } },
    );
    return response.data;
  },

  /**
   * Quản lý phê duyệt kỳ KPI
   */
  approvePeriod: async (
    hotelId: string | number,
    period: string,
    reviewNote?: string,
  ): Promise<{ message: string }> => {
    const response = await apiClient.post(
      `/staff-kpi/periods/${period}/approve`,
      { reviewNote },
      { params: { hotelId } },
    );
    return response.data;
  },

  /**
   * Đề xuất hoặc duyệt điều chỉnh điểm KPI
   */
  requestAdjustment: async (
    hotelId: string | number,
    payload: RequestKpiAdjustmentPayload,
  ): Promise<any> => {
    const response = await apiClient.post('/staff-kpi/adjustments', payload, {
      params: { hotelId },
    });
    return response.data;
  },
};

