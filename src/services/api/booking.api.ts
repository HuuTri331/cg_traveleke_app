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

export interface AdminBookingItem {
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
  status: 'PENDING' | 'CONFIRMED' | 'CHECKED_IN' | 'COMPLETED' | 'REJECTED' | 'CANCELLED';
  specialRequest?: string | null;
  handledBy?: string | null;
  assignmentType?: 'AUTO' | 'MANUAL';
  assignmentNote?: string | null;
  handledByName?: string | null;
  handledByEmail?: string | null;
  handledByRole?: string | null;
  canReassign?: boolean;
  reassignedAt?: string | null;
  reassignedBy?: string | null;
  confirmedAt?: string | null;
  rejectedAt?: string | null;
  cancelledAt?: string | null;
  createdAt: string;
  hotelName?: string;
  hotelAddress?: string;
  customerName?: string;
  customerEmail?: string;
}

export interface BookingStatusLogItem {
  id: string;
  bookingId?: string;
  oldStatus: string | null;
  newStatus: string;
  note: string | null;
  changedAt: string;
  changedByName?: string;
}

export interface AdminBookingDetail extends AdminBookingItem {
  roomId?: string;
  roomName?: string;
  roomImage?: string;
  hotelImage?: string;
  pricePerNight?: string;
  nights?: number;
  quantity?: number;
  subtotal?: string;
  customerPhone?: string;
  statusLogs?: BookingStatusLogItem[];
}

export interface QueryBookingParams {
  page?: number;
  perPage?: number;
  status?: string;
  hotelId?: string;
  search?: string;
}

export interface DashboardStatistics {
  totalHotels: number;
  totalRooms: number;
  totalCustomers: number;
  totalBookings: number;
  pendingBookings: number;
  confirmedBookings: number;
  checkedInBookings: number;
  completedBookings: number;
  rejectedBookings: number;
  cancelledBookings: number;
  totalRevenue: number;
  monthlyBookings: number;
  monthlyRevenue: number;
}

export interface ActivityLogItem {
  id: string;
  bookingId: string;
  bookingCode: string;
  customerName: string;
  hotelName: string;
  oldStatus: string | null;
  newStatus: string;
  note: string | null;
  changedAt: string;
  operatorName: string | null;
  operatorEmail: string | null;
  operatorRole: string | null;
}

export const bookingApi = {
  // ===============================
  // TẠO BOOKING (Khách hàng)
  // ===============================
  create: async (data: CreateBookingData) => {
    const response = await apiClient.post('/bookings', data);
    return response.data;
  },

  // ===============================
  // LỊCH SỬ BOOKING (Khách hàng)
  // ===============================
  getHistory: async (userId: string): Promise<BookingHistory[]> => {
    const response = await apiClient.get(`/bookings/user/${userId}`);
    return response.data.data;
  },

  // ===============================
  // DANH SÁCH BOOKINGS (Admin/Staff)
  // ===============================
  getAll: async (params?: QueryBookingParams): Promise<{
    data: AdminBookingItem[];
    meta: {
      page: number;
      perPage: number;
      total: number;
      totalPages: number;
    };
  }> => {
    const response = await apiClient.get('/bookings', { params });
    return response.data;
  },

  // ===============================
  // CHI TIẾT BOOKING (Admin/Staff)
  // ===============================
  getOne: async (id: string): Promise<{ data: AdminBookingDetail }> => {
    const response = await apiClient.get(`/bookings/${id}`);
    return response.data;
  },

  // ===============================
  // CẬP NHẬT TRẠNG THÁI (Admin/Staff)
  // ===============================
  updateStatus: async (
    id: string,
    data: { status: string; note?: string }
  ): Promise<{ success: boolean; message: string; data: any }> => {
    const response = await apiClient.patch(`/bookings/${id}/status`, data);
    return response.data;
  },

  // ===============================
  // THỐNG KÊ DASHBOARD (Admin/Staff)
  // ===============================
  getStatistics: async (): Promise<{ data: DashboardStatistics }> => {
    const response = await apiClient.get('/bookings/statistics');
    return response.data;
  },

  // ===============================
  // NHẬT KÝ VẬN HÀNH (Activity Logs)
  // ===============================
  getActivityLogs: async (limit = 50): Promise<{ message: string; data: ActivityLogItem[] }> => {
    const response = await apiClient.get('/bookings/activity-logs', {
      params: { limit },
    });
    return response.data;
  },

  // ===============================
  // DANH SÁCH NHÂN VIÊN KHẢ DỤNG ĐỂ PHÂN CÔNG
  // ===============================
  getAvailableStaff: async (bookingId: string): Promise<any> => {
    const response = await apiClient.get(`/bookings/${bookingId}/available-staff`);
    return response.data;
  },

  // ===============================
  // PHÂN CÔNG LẠI NHÂN VIÊN PHỤ TRÁCH
  // ===============================
  reassignStaff: async (
    bookingId: string,
    data: { staffUserId: string; note?: string }
  ): Promise<{ success: boolean; message: string; data?: any }> => {
    const response = await apiClient.patch(`/bookings/${bookingId}/reassign`, data);
    return response.data;
  },
};