import { apiClient } from './client';

export interface RoomUnitDto {
  id: string;
  hotelId: string;
  roomTypeId: string;
  roomNumber: string;
  floor: string | null;
  building: string | null;
  bedConfig: string | null;
  isAccessible: boolean;
  isSmoking: boolean;
  verificationStatus?: 'UNVERIFIED' | 'VERIFIED' | string;
  operationalStatus: 'ACTIVE' | 'OUT_OF_ORDER' | 'OUT_OF_SERVICE' | 'INACTIVE';
  housekeepingState: 'READY' | 'CLEAN' | 'DIRTY' | 'INSPECTION_PENDING' | 'DO_NOT_DISTURB';
  version: number;
}

export interface RoomUnitAllocationDto {
  id: string;
  bookingId: string;
  roomTypeId: string;
  roomUnitId: string;
  status: 'ASSIGNED' | 'CHECKED_IN' | 'MOVED_OUT' | 'CHECKED_OUT' | 'RELEASED';
  checkInDate: string;
  checkOutDate: string;
  commandId: string;
}

export interface AllocateUnitsPayload {
  unitIds: string[];
  commandId: string;
  expectedBookingVersion: number;
}

export interface AllocationReceipt {
  bookingId: string;
  allocatedUnitIds: string[];
  allocationVersion?: number;
}

export const roomUnitsApi = {
  allocate: async (
    bookingId: string,
    body: AllocateUnitsPayload,
  ): Promise<AllocationReceipt> => {
    const response = await apiClient.post<AllocationReceipt>(
      `/bookings/${encodeURIComponent(bookingId)}/room-unit-allocations`,
      body,
    );
    return response.data;
  },

  async listHotelRoomUnits(
    hotelId: string | number,
    params?: {
      roomTypeId?: string;
      operationalStatus?: string;
      housekeepingState?: string;
    },
  ): Promise<RoomUnitDto[]> {
    const res = await apiClient.get(`/hotels/${hotelId}/room-units`, { params });
    return res.data;
  },

  async createRoomUnit(
    hotelId: string | number,
    payload: {
      roomTypeId: string;
      roomNumber: string;
      floor?: string;
      building?: string;
      bedConfig?: string;
    },
  ): Promise<RoomUnitDto> {
    const res = await apiClient.post(`/hotels/${hotelId}/room-units`, payload);
    return res.data;
  },

  async verifyRoomUnit(
    unitId: string | number,
    note?: string,
  ): Promise<RoomUnitDto> {
    const res = await apiClient.post(`/room-units/${unitId}/verify`, {
      note: note || 'Quản lý khách sạn xác minh phòng vật lý',
    });
    return res.data;
  },

  async getBookingCandidates(bookingId: string | number): Promise<RoomUnitDto[]> {
    const res = await apiClient.get(`/bookings/${bookingId}/room-unit-candidates`);
    return res.data;
  },

  async getBookingAllocations(bookingId: string | number): Promise<RoomUnitAllocationDto[]> {
    const res = await apiClient.get(`/bookings/${bookingId}/room-unit-allocations`);
    return res.data;
  },

  async allocateRoomUnits(
    bookingId: string | number,
    payload: {
      unitIds: string[];
      commandId: string;
      expectedVersion?: number;
    },
  ): Promise<RoomUnitAllocationDto[]> {
    const res = await apiClient.post(`/bookings/${bookingId}/room-unit-allocations`, payload);
    return res.data;
  },

  async previewRoomMove(
    bookingId: string | number,
    payload: {
      fromUnitId: string;
      toUnitId: string;
      reason: string;
    },
  ) {
    const res = await apiClient.post(`/bookings/${bookingId}/room-moves/preview`, payload);
    return res.data;
  },

  async commitRoomMove(
    bookingId: string | number,
    payload: {
      fromUnitId: string;
      toUnitId: string;
      reason: string;
      moveType?: 'SAME_ROOM_TYPE' | 'COMPLIMENTARY_UPGRADE' | 'PAID_UPGRADE';
      approvedByManagerId?: string;
      commandId: string;
    },
  ) {
    const res = await apiClient.post(`/bookings/${bookingId}/room-moves/commit`, payload);
    return res.data;
  },
};
