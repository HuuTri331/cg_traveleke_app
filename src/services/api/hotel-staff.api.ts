import { apiClient } from './client';

export interface HotelStaffItem {
  id: string;
  hotelId: string;
  staffUserId: string;
  staffRole: string;
  assignedAt: string;
  status: string;
  hotelName?: string;
  hotelAddress?: string;
  staffName?: string;
  staffEmail?: string;
  staffPhone?: string;
  staffAvatar?: string;
}

export interface AssignStaffData {
  hotelId: string;
  staffUserId: string;
  staffRole?: string;
}

export const hotelStaffApi = {
  // Lấy tất cả phân công (Admin/Employee)
  getAll: async (): Promise<{ data: HotelStaffItem[] }> => {
    const response = await apiClient.get('/hotel-staff');
    return response.data;
  },

  // Lấy danh sách nhân viên theo khách sạn
  getByHotel: async (hotelId: string): Promise<{ data: HotelStaffItem[] }> => {
    const response = await apiClient.get(`/hotel-staff/hotel/${hotelId}`);
    return response.data;
  },

  // Phân công nhân viên vào khách sạn (Admin only)
  assign: async (data: AssignStaffData): Promise<{ message: string; data: any }> => {
    const response = await apiClient.post('/hotel-staff', data);
    return response.data;
  },

  // Gỡ phân công (Admin only)
  remove: async (id: string): Promise<{ message: string }> => {
    const response = await apiClient.delete(`/hotel-staff/${id}`);
    return response.data;
  },
};
