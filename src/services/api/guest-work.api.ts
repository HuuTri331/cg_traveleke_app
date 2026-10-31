import { apiClient } from './client';

export type WorkTaskType =
  | 'PRE_ARRIVAL_CONTACT'
  | 'CHECK_IN'
  | 'CHECK_OUT'
  | 'SERVICE_REQUEST'
  | 'COMPLAINT_HANDLE';

export type WorkTaskStatus =
  | 'CREATED'
  | 'ASSIGNED'
  | 'ACCEPTED'
  | 'IN_PROGRESS'
  | 'COMPLETED'
  | 'VERIFIED'
  | 'CANCELLED'
  | 'FAILED';

export type WorkTaskPriority = 'LOW' | 'NORMAL' | 'HIGH' | 'URGENT';

export interface GuestWorkTaskItem {
  id: string;
  hotelId: string;
  bookingId: string;
  type: WorkTaskType;
  sourceTable?: string | null;
  sourceId?: string | null;
  assignedStaffId?: string | null;
  ownerAtCreate?: string | null;
  status: WorkTaskStatus;
  priority: WorkTaskPriority;
  title?: string | null;
  description?: string | null;
  responseSlaDueAt?: string | null;
  resolutionSlaDueAt?: string | null;
  firstResponseAt?: string | null;
  completedAt?: string | null;
  verifiedAt?: string | null;
  version: number;
  createdAt: string;
  updatedAt: string;
}

export interface GuestWorkEventItem {
  id: string;
  taskId: string;
  bookingId: string;
  hotelId: string;
  actorType: 'USER' | 'SYSTEM';
  actorStaffId?: string | null;
  eventType: string;
  fromStatus?: string | null;
  toStatus: string;
  occurredAt: string;
  evidenceType?: string | null;
  evidenceRef?: string | null;
  metadata?: Record<string, any> | null;
}

export interface CreateWorkTaskPayload {
  hotelId: string;
  bookingId: string;
  type: WorkTaskType;
  assignedStaffId?: string;
  priority?: WorkTaskPriority;
  title?: string;
  description?: string;
  sourceTable?: string;
  sourceId?: string;
}

export interface CompleteTaskPayload {
  evidenceRef?: string;
  evidenceType?: string;
  note?: string;
}

export interface VerifyTaskPayload {
  decision: 'VERIFIED' | 'FAILED';
  note?: string;
  evidenceRef?: string;
}

export const guestWorkApi = {
  /**
   * Lấy danh sách nhiệm vụ được giao cho tôi
   */
  getMyTasks: async (status?: WorkTaskStatus): Promise<GuestWorkTaskItem[]> => {
    const response = await apiClient.get('/guest-work/me', {
      params: status ? { status } : undefined,
    });
    return response.data;
  },

  /**
   * Lấy danh sách nhiệm vụ của đơn đặt phòng
   */
  getTasksForBooking: async (bookingId: string | number): Promise<GuestWorkTaskItem[]> => {
    const response = await apiClient.get(`/guest-work/booking/${bookingId}`);
    return response.data;
  },

  /**
   * Xem dòng thời gian nhật ký của một nhiệm vụ
   */
  getTaskTimeline: async (
    taskId: string | number,
  ): Promise<{ task: GuestWorkTaskItem; events: GuestWorkEventItem[] }> => {
    const response = await apiClient.get(`/guest-work/${taskId}/timeline`);
    return response.data;
  },

  /**
   * Tạo nhiệm vụ phục vụ mới
   */
  createTask: async (payload: CreateWorkTaskPayload): Promise<GuestWorkTaskItem> => {
    const response = await apiClient.post('/guest-work', payload);
    return response.data;
  },

  /**
   * Nhận việc (Accept task)
   */
  acceptTask: async (taskId: string | number): Promise<GuestWorkTaskItem> => {
    const response = await apiClient.post(`/guest-work/${taskId}/accept`);
    return response.data;
  },

  /**
   * Bắt đầu thực hiện (Start task)
   */
  startTask: async (taskId: string | number): Promise<GuestWorkTaskItem> => {
    const response = await apiClient.post(`/guest-work/${taskId}/start`);
    return response.data;
  },

  /**
   * Hoàn tất nhiệm vụ (Complete task kèm minh chứng)
   */
  completeTask: async (
    taskId: string | number,
    payload: CompleteTaskPayload,
  ): Promise<GuestWorkTaskItem> => {
    const response = await apiClient.post(`/guest-work/${taskId}/complete`, payload);
    return response.data;
  },

  /**
   * Nghiệm thu nhiệm vụ (4-Eyes Principle)
   */
  verifyTask: async (
    taskId: string | number,
    payload: VerifyTaskPayload,
  ): Promise<GuestWorkTaskItem> => {
    const response = await apiClient.post(`/guest-work/${taskId}/verify`, payload);
    return response.data;
  },
};

