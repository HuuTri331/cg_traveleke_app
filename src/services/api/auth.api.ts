import { apiClient } from './client';
import { ApiResponse } from '@/types/common';
import { LoginDto, LoginResponseData, UserProfile } from '@/types/auth';

export const authApi = {
  /**
   * Đăng nhập hệ thống
   */
  login: async (dto: LoginDto): Promise<LoginResponseData> => {
    const res = await apiClient.post<ApiResponse<LoginResponseData>>('/auth/login', dto);
    return res.data.data;
  },

  /**
   * Lấy thông tin tài khoản hiện tại kèm danh sách permissions
   */
  getMe: async (): Promise<UserProfile> => {
    const res = await apiClient.get<ApiResponse<UserProfile>>('/auth/me');
    return res.data.data;
  },

  /**
   * Đăng xuất
   */
  logout: async (): Promise<void> => {
    try {
      await apiClient.post('/auth/logout');
    } catch {
      // Bỏ qua lỗi mạng nếu có khi logout
    }
  },
};
