import { apiClient } from './client';
import { CreateRoomInput, QueryRoomParams, Room, RoomImage, UpdateRoomInput } from '@/types/room';
import { PaginatedResponse } from '@/types/common';

export const roomsApi = {
  // Lấy danh sách phòng có phân trang và bộ lọc
  getAll: async (params?: QueryRoomParams): Promise<PaginatedResponse<Room>> => {
    const res = await apiClient.get<PaginatedResponse<Room>>('/rooms', { params });
    return res.data;
  },

  // Lấy chi tiết phòng theo ID kèm album ảnh
  getById: async (id: string | number): Promise<Room> => {
    const res = await apiClient.get<Room>(`/rooms/${id}`);
    return res.data;
  },

  // Tạo phòng mới
  create: async (data: CreateRoomInput): Promise<Room> => {
    const res = await apiClient.post<Room>('/rooms', data);
    return res.data;
  },

  // Cập nhật thông tin phòng
  update: async (id: string | number, data: UpdateRoomInput): Promise<Room> => {
    const res = await apiClient.patch<Room>(`/rooms/${id}`, data);
    return res.data;
  },

  // Xóa phòng
  remove: async (id: string | number): Promise<{ success: boolean; message: string }> => {
    const res = await apiClient.delete<{ success: boolean; message: string }>(`/rooms/${id}`);
    return res.data;
  },

  // Lấy album ảnh phòng
  getImages: async (roomId: string | number): Promise<RoomImage[]> => {
    const res = await apiClient.get<RoomImage[]>(`/rooms/${roomId}/images`);
    return res.data;
  },

  // Upload nhiều ảnh vào album phòng (tối đa 5 ảnh)
  uploadImages: async (
    roomId: string | number,
    files: File[],
    caption?: string
  ): Promise<RoomImage[]> => {
    const formData = new FormData();
    files.forEach((file) => {
      formData.append('files', file);
    });
    if (caption) {
      formData.append('caption', caption);
    }
    const res = await apiClient.post<RoomImage[]>(
      `/rooms/${roomId}/images/upload`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );
    return res.data;
  },

  // Đặt 1 ảnh phòng làm ảnh đại diện chính
  setPrimaryImage: async (roomId: string | number, imageId: string | number): Promise<Room> => {
    const res = await apiClient.patch<Room>(`/rooms/${roomId}/images/${imageId}/primary`);
    return res.data;
  },

  // Xóa 1 ảnh khỏi album phòng
  deleteImage: async (
    roomId: string | number,
    imageId: string | number
  ): Promise<{ success: boolean; message: string }> => {
    const res = await apiClient.delete<{ success: boolean; message: string }>(
      `/rooms/${roomId}/images/${imageId}`
    );
    return res.data;
  },
};
