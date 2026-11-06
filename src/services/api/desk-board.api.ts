import { apiClient } from './client';

export interface TodayBoardCardDto {
  bookingId: string;
  hotelId: string;
  status: string;
  checkInDate: string;
  checkOutDate: string;
  currentEffectiveExecutorId: string | null;
  assignedRoomNumbers: string[];
  roomReadiness: 'READY' | 'NOT_READY' | 'UNASSIGNED';
  hasOpenIncident: boolean;
  exceptionReason?: string;
  allowedActions: {
    canAssignRoom: boolean;
    canCheckIn: boolean;
    canCheckOut: boolean;
    canOpenIncident: boolean;
  };
}

export interface TodayDeskBoardResponse {
  hotelId: string;
  businessDate: string;
  ianaTimezone: string;
  arrivals: TodayBoardCardDto[];
  inHouse: TodayBoardCardDto[];
  departures: TodayBoardCardDto[];
  exceptions: TodayBoardCardDto[];
}

export const deskBoardApi = {
  async getTodayBoard(
    hotelId: string | number,
    businessDate?: string,
  ): Promise<TodayDeskBoardResponse> {
    const res = await apiClient.get(`/hotels/${hotelId}/desk/today`, {
      params: businessDate ? { businessDate } : undefined,
    });
    return res.data;
  },

  async listHousekeepingTasks(hotelId: string | number, status?: string) {
    const res = await apiClient.get(`/hotels/${hotelId}/housekeeping/tasks`, {
      params: status ? { status } : undefined,
    });
    return res.data;
  },

  async startHousekeepingTask(taskId: string | number, commandId: string) {
    const res = await apiClient.post(`/housekeeping/tasks/${taskId}/start`, { commandId });
    return res.data;
  },

  async completeHousekeepingTask(
    taskId: string | number,
    commandId: string,
    checklistJson?: Record<string, any>,
  ) {
    const res = await apiClient.post(`/housekeeping/tasks/${taskId}/complete`, {
      commandId,
      checklistJson,
    });
    return res.data;
  },

  async inspectHousekeepingTask(
    taskId: string | number,
    payload: { approved: boolean; note?: string; commandId: string },
  ) {
    const res = await apiClient.post(`/housekeeping/tasks/${taskId}/inspect`, payload);
    return res.data;
  },

  async openRoomIncident(payload: {
    bookingId: string;
    roomTypeId: string;
    affectedUnitId?: string;
    notes?: string;
  }) {
    const res = await apiClient.post('/room-incidents', payload);
    return res.data;
  },
};
