import { apiClient } from './client';

export interface StaffShiftItem {
  id: string;
  hotelId: string;
  hotelName?: string;
  staffUserId: string;
  staffName?: string;
  shiftType: 'MORNING' | 'AFTERNOON' | 'NIGHT' | 'CUSTOM';
  status: 'SCHEDULED' | 'OPEN' | 'HANDOVER_PENDING' | 'CLOSED';
  plannedStartTime: string;
  plannedEndTime: string;
  actualStartTime?: string | null;
  actualEndTime?: string | null;
  openingCashFloat: string;
  closingCashExpected?: string | null;
  closingCashActual?: string | null;
  cashVariance?: string | null;
  notes?: string | null;
  createdAt: string;
}

export interface ShiftHandoverItem {
  id: string;
  shiftId: string;
  giverStaffId: string;
  giverName?: string;
  receiverStaffId: string;
  receiverName?: string;
  status: 'PENDING' | 'ACCEPTED' | 'REJECTED';
  handoverNotes: string;
  pendingItems?: any;
  givenAt: string;
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

  startShift: async (data: {
    hotelId: string | number;
    shiftType: 'MORNING' | 'AFTERNOON' | 'NIGHT' | 'CUSTOM';
    plannedStartTime: string;
    plannedEndTime: string;
    openingCashFloat?: number;
    notes?: string;
  }): Promise<{ message: string; data: StaffShiftItem }> => {
    const response = await apiClient.post('/shifts/start', data);
    return response.data;
  },

  endShift: async (
    shiftId: string | number,
    data: {
      closingCashActual?: number;
      notes?: string;
    }
  ): Promise<{ message: string; data: StaffShiftItem }> => {
    const response = await apiClient.post(`/shifts/${shiftId}/end`, data);
    return response.data;
  },

  handoverShift: async (
    shiftId: string | number,
    data: {
      receiverStaffId: string | number;
      handoverNotes: string;
      pendingItems?: any;
    }
  ): Promise<{ message: string; data: ShiftHandoverItem }> => {
    const response = await apiClient.post(`/shifts/${shiftId}/handover`, data);
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
