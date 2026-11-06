import { apiClient } from './client';

export interface StaffShiftItem {
  id: string;
  hotelId: string;
  hotelName?: string;
  staffUserId: string;
  staffName?: string;
  staffEmail?: string;
  staffRole?: string;
  shiftName?: string;
  shiftDate?: string;
  shiftType?: 'MORNING' | 'AFTERNOON' | 'NIGHT' | 'CUSTOM';
  status: 'SCHEDULED' | 'ACTIVE' | 'COMPLETED' | 'CANCELLED' | 'OPEN' | 'HANDOVER_PENDING' | 'CLOSED';
  plannedStartAt?: string | null;
  plannedEndAt?: string | null;
  hotelTimezone?: string;
  plannedStartTime?: string;
  plannedEndTime?: string;
  startTime?: string | null;
  endTime?: string | null;
  actualClockInAt?: string | null;
  actualClockOutAt?: string | null;
  actualStartTime?: string | null;
  actualEndTime?: string | null;
  openingCashFloat: string;
  closingCashCounted?: string | null;
  closingCashExpected?: string | null;
  closingCashActual?: string | null;
  cashVariance?: string | null;
  handoverNote?: string | null;
  notes?: string | null;
  createdAt?: string;
}

export interface ShiftHandoverItem {
  id: string;
  shiftId: string;
  hotelId?: string;
  fromStaffId?: string;
  toStaffId?: string;
  giverStaffId?: string;
  giverName?: string;
  receiverStaffId?: string;
  receiverName?: string;
  status: 'PENDING' | 'ACCEPTED' | 'REJECTED';
  pendingTasks?: string | null;
  cashAmount?: string;
  specialNotes?: string | null;
  handoverNotes?: string;
  pendingItems?: any;
  givenAt?: string;
  createdAt?: string;
  acceptedAt?: string | null;
  receiverNotes?: string | null;
}

export const shiftsApi = {
  getMyShifts: async (): Promise<{ data: StaffShiftItem[] }> => {
    const response = await apiClient.get('/shifts/my-shifts');
    return response.data;
  },

  getActiveShift: async (): Promise<{ data: StaffShiftItem | null }> => {
    const response = await apiClient.get('/shifts/active');
    return response.data;
  },

  createShift: async (data: {
    hotelId: string | number;
    staffUserId: string | number;
    shiftName: string;
    shiftDate: string;
    plannedStartAt?: string;
    plannedEndAt?: string;
    hotelTimezone?: string;
    openingCashFloat?: number;
  }): Promise<{ message: string; data: StaffShiftItem }> => {
    const response = await apiClient.post('/shifts', {
      ...data,
      hotelId: String(data.hotelId),
      staffUserId: String(data.staffUserId),
    });
    return response.data;
  },

  startShift: async (
    shiftIdOrData:
      | string
      | number
      | {
          shiftId?: string | number;
          hotelId?: string | number;
          shiftType?: 'MORNING' | 'AFTERNOON' | 'NIGHT' | 'CUSTOM';
          plannedStartTime?: string;
          plannedEndTime?: string;
          openingCashFloat?: number;
          notes?: string;
          commandId?: string;
        },
    payload?: {
      openingCashFloat?: number;
      commandId?: string;
    },
  ): Promise<{ message: string; data: StaffShiftItem }> => {
    if (typeof shiftIdOrData === 'string' || typeof shiftIdOrData === 'number') {
      const response = await apiClient.post(`/shifts/${shiftIdOrData}/start`, payload || {});
      return response.data;
    }
    if (shiftIdOrData.shiftId) {
      const response = await apiClient.post(`/shifts/${shiftIdOrData.shiftId}/start`, {
        openingCashFloat: shiftIdOrData.openingCashFloat,
        commandId: shiftIdOrData.commandId,
      });
      return response.data;
    }
    throw new Error('Vui lòng chọn ca đã xếp lịch (shiftId) để bắt đầu ca trực.');
  },

  endShift: async (
    shiftId: string | number,
    data: {
      closingCashCounted?: number;
      closingCashActual?: number;
      handoverNote?: string;
      notes?: string;
      commandId?: string;
    }
  ): Promise<{ message: string; data: StaffShiftItem }> => {
    const response = await apiClient.post(`/shifts/${shiftId}/end`, {
      closingCashCounted: data.closingCashCounted ?? data.closingCashActual,
      closingCashActual: data.closingCashActual ?? data.closingCashCounted,
      handoverNote: data.handoverNote ?? data.notes,
      notes: data.notes,
      commandId: data.commandId,
    });
    return response.data;
  },

  handoverShift: async (
    shiftId: string | number,
    data: {
      toStaffId?: string | number;
      receiverStaffId?: string | number;
      specialNotes?: string;
      handoverNotes?: string;
      pendingTasks?: any;
      pendingItems?: any;
      cashAmount?: number;
      acknowledgedFinancialAccountIds?: string[];
    }
  ): Promise<{ message: string; data: ShiftHandoverItem }> => {
    const targetToStaffId = String(data.toStaffId ?? data.receiverStaffId ?? '').trim();
    const response = await apiClient.post(`/shifts/${shiftId}/handover`, {
      toStaffId: targetToStaffId,
      receiverStaffId: targetToStaffId,
      specialNotes: data.specialNotes ?? data.handoverNotes,
      handoverNotes: data.handoverNotes ?? data.specialNotes,
      pendingTasks: data.pendingTasks ?? data.pendingItems,
      pendingItems: data.pendingItems,
      cashAmount: data.cashAmount,
      acknowledgedFinancialAccountIds: data.acknowledgedFinancialAccountIds,
    });
    return response.data;
  },

  acceptHandover: async (
    handoverId: string | number,
    data?: { notes?: string }
  ): Promise<{ message: string; data: ShiftHandoverItem }> => {
    const response = await apiClient.post(`/shifts/handovers/${handoverId}/accept`, data || {});
    return response.data;
  },

  getHotelShifts: async (hotelId: string | number): Promise<{ data: StaffShiftItem[] }> => {
    const response = await apiClient.get(`/shifts/hotels/${hotelId}`);
    return response.data;
  },

  getHotelHandovers: async (hotelId: string | number): Promise<{ data: ShiftHandoverItem[] }> => {
    const response = await apiClient.get(`/shifts/hotels/${hotelId}/handovers`);
    return response.data;
  },
};

