import { apiClient } from './client';

export type ApprovalRequestType =
  | 'REFUND'
  | 'DISCOUNT'
  | 'RATE_OVERRIDE'
  | 'SERVICE_RECOVERY'
  | 'COMPLIMENTARY';

export type ApprovalStatus =
  | 'PENDING'
  | 'APPROVED'
  | 'REJECTED'
  | 'CANCELLED'
  | 'EXECUTED';

export interface ApprovalRequestItem {
  id: string;
  hotelId: string;
  hotelName?: string;
  bookingId?: string | null;
  bookingCode?: string | null;
  serviceRequestId?: string | null;
  requestType: ApprovalRequestType;
  requestedAmount?: string | null;
  reason: string;
  status: ApprovalStatus;
  requesterStaffId: string;
  requesterName?: string;
  approverStaffId?: string | null;
  approverName?: string | null;
  approverDecisionNote?: string | null;
  decidedAt?: string | null;
  createdAt: string;
}

export const approvalsApi = {
  create: async (data: {
    hotelId: string | number;
    bookingId?: string | number;
    serviceRequestId?: string | number;
    requestType: ApprovalRequestType;
    requestedAmount?: number;
    reason: string;
    evidenceNotes?: string;
  }): Promise<{ message: string; data: ApprovalRequestItem }> => {
    const response = await apiClient.post('/approvals', data);
    return response.data;
  },

  getAll: async (params?: {
    hotelId?: string | number;
    status?: ApprovalStatus;
    requestType?: ApprovalRequestType;
  }): Promise<{ data: ApprovalRequestItem[] }> => {
    const response = await apiClient.get('/approvals', { params });
    return response.data;
  },

  getOne: async (id: string | number): Promise<{ data: ApprovalRequestItem }> => {
    const response = await apiClient.get(`/approvals/${id}`);
    return response.data;
  },

  decide: async (
    id: string | number,
    data: {
      decision: 'APPROVED' | 'REJECTED';
      decisionNote?: string;
    }
  ): Promise<{ message: string; data: ApprovalRequestItem }> => {
    const response = await apiClient.patch(`/approvals/${id}/decide`, data);
    return response.data;
  },
};
