import { apiClient } from './client';
import { ApiResponse } from '@/types/common';
import {
  AssignRoleDto,
  CreateStaffDto,
  UpdateStaffDto,
  UpdateStatusDto,
  UserProfile,
} from '@/types/auth';

export const usersApi = {
  /**
   * Lấy danh sách tất cả nhân viên (Chỉ Admin)
   */
  getAllStaff: async (): Promise<UserProfile[]> => {
    const res = await apiClient.get<ApiResponse<UserProfile[]>>('/users');
    return res.data.data;
  },

  /**
   * Lấy thông tin chi tiết một nhân viên (Chỉ Admin)
   */
  getStaff: async (id: string): Promise<UserProfile> => {
    const res = await apiClient.get<ApiResponse<UserProfile>>(`/users/${id}`);
    return res.data.data;
  },

  /**
   * Tạo tài khoản nhân viên mới (Chỉ Admin)
   */
  createStaff: async (dto: CreateStaffDto): Promise<UserProfile> => {
    const res = await apiClient.post<ApiResponse<UserProfile>>('/users', dto);
    return res.data.data;
  },

  /**
   * Cập nhật thông tin nhân viên (Chỉ Admin)
   */
  updateStaff: async (id: string, dto: UpdateStaffDto): Promise<UserProfile> => {
    const res = await apiClient.patch<ApiResponse<UserProfile>>(`/users/${id}`, dto);
    return res.data.data;
  },

  /**
   * Phân quyền vai trò cho nhân viên (Chỉ Admin)
   */
  assignRole: async (id: string, dto: AssignRoleDto): Promise<UserProfile> => {
    const res = await apiClient.patch<ApiResponse<UserProfile>>(`/users/${id}/role`, dto);
    return res.data.data;
  },

  /**
   * Khoá / Mở khoá tài khoản nhân viên (Chỉ Admin)
   */
  updateStatus: async (id: string, dto: UpdateStatusDto): Promise<UserProfile> => {
    const res = await apiClient.patch<ApiResponse<UserProfile>>(`/users/${id}/status`, dto);
    return res.data.data;
  },

  /**
   * Xóa mềm tài khoản nhân viên (Chỉ Admin)
   */
  deleteStaff: async (id: string): Promise<void> => {
    await apiClient.delete(`/users/${id}`);
  },
};