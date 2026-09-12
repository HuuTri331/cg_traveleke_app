import { apiClient } from './client';

export interface CreateBookingData {
  roomId: string;
  userId: string;

  checkInAt: string;
  checkOutAt: string;

  totalGuests: number;
  roomCount: number;

  contactName: string;
  contactEmail: string;
  contactPhone: string;

  specialRequest?: string;
}

export interface BookingHistory {
  id: string;
  bookingCode: string;

  userId: string;
  hotelId: string;

  contactName: string;
  contactEmail: string;
  contactPhone: string;

  checkInAt: string;
  checkOutAt: string;

  totalGuests: number;
  requestedRoomCount: number;

  estimatedTotal: string;

  status: string;

  specialRequest?: string | null;

  createdAt: string;

  roomId: string;
  roomName?: string;

  roomImage?: string | null;

  hotelName?: string;
  hotelAddress?: string;

  quantity: number;
  pricePerNight: string;

  nights: number;

  subtotal: string;
}

export const bookingApi = {
  // ===============================
  // TẠO BOOKING
  // ===============================
  create: async (
    data: CreateBookingData,
  ) => {
    const response =
      await apiClient.post(
        '/bookings',
        data,
      );

    return response.data;
  },

  // ===============================
  // LỊCH SỬ BOOKING
  // ===============================
  getHistory: async (
    userId: string,
  ): Promise<BookingHistory[]> => {
    const response =
      await apiClient.get(
        `/bookings/user/${userId}`,
      );

    return response.data.data;
  },
};