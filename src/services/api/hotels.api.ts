import { apiClient } from './client';
import { CreateHotelInput, Hotel, HotelImage, QueryHotelParams, UpdateHotelInput } from '@/types/hotel';
import { PaginatedResponse } from '@/types/common';

export const hotelsApi = {
  // Lấy danh sách khách sạn có phân trang và bộ lọc
  getAll: async (params?: QueryHotelParams): Promise<PaginatedResponse<Hotel>> => {
    const res = await apiClient.get<PaginatedResponse<Hotel>>('/hotels', { params });
    return res.data;
  },

  // Lấy chi tiết khách sạn theo ID kèm album ảnh
  getById: async (id: string | number): Promise<Hotel> => {
    const res = await apiClient.get<Hotel>(`/hotels/${id}`);
    return res.data;
  },

  // Tạo khách sạn mới
  create: async (data: CreateHotelInput): Promise<Hotel> => {
    const res = await apiClient.post<Hotel>('/hotels', data);
    return res.data;
  },

  // Cập nhật thông tin khách sạn
  update: async (id: string | number, data: UpdateHotelInput): Promise<Hotel> => {
    const res = await apiClient.patch<Hotel>(`/hotels/${id}`, data);
    return res.data;
  },

  // Lấy album ảnh khách sạn
  getImages: async (hotelId: string | number): Promise<HotelImage[]> => {
    const res = await apiClient.get<HotelImage[]>(`/hotels/${hotelId}/images`);
    return res.data;
  },

  // Upload nhiều file ảnh vào album khách sạn (tối đa 6 ảnh)
  uploadImages: async (
    hotelId: string | number,
    files: File[],
    caption?: string
  ): Promise<HotelImage[]> => {
    const formData = new FormData();
    files.forEach((file) => {
      formData.append('files', file);
    });
    if (caption) {
      formData.append('caption', caption);
    }
    const res = await apiClient.post<HotelImage[]>(
      `/hotels/${hotelId}/images/upload`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );
    return res.data;
  },

  // Đặt 1 ảnh làm ảnh đại diện chính (Primary Cover Image)
  setPrimaryImage: async (hotelId: string | number, imageId: string | number): Promise<Hotel> => {
    const res = await apiClient.patch<Hotel>(`/hotels/${hotelId}/images/${imageId}/primary`);
    return res.data;
  },

  // Xóa 1 ảnh khỏi album
  deleteImage: async (
    hotelId: string | number,
    imageId: string | number
  ): Promise<{ success: boolean; message: string }> => {
    const res = await apiClient.delete<{ success: boolean; message: string }>(
      `/hotels/${hotelId}/images/${imageId}`
    );
    return res.data;
  },
};
