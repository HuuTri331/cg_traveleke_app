import axios from 'axios';
import type { HotelSearchItem } from '@/types/hotel-search';
import type { Room } from '@/types/room';

const BACKEND_URL = 'http://localhost:3001/api';

// Public client — không cần token
const publicClient = axios.create({
  baseURL: BACKEND_URL,
  timeout: 15000,
});

export interface HotelDetail extends HotelSearchItem {
  images?: { id: string; imageUrl: string; caption: string | null; isPrimary: number; sortOrder: number }[];
}

export interface HotelDetailResponse {
  data: HotelDetail;
}

export interface HotelRoomsResponse {
  data: Room[];
  meta: { page: number; limit: number; total: number; totalPages: number };
}

export const hotelDetailApi = {
  /** Lấy chi tiết khách sạn (public — không cần đăng nhập) */
  getHotelDetail: async (id: string): Promise<HotelDetail> => {
    const res = await publicClient.get<HotelDetail>(`/HomePage/hotels/${id}`);
    return res.data;
  },

  /** Lấy ảnh gallery của khách sạn */
  getHotelImages: async (id: string): Promise<{ data: HotelDetail['images'] }> => {
    const res = await publicClient.get(`/hotels/${id}/images`);
    return res.data;
  },

  /** Lấy danh sách phòng theo khách sạn (public endpoint) */
  getRoomsOfHotel: async (hotelId: string): Promise<Room[]> => {
    const res = await publicClient.get<{ data: Room[]; meta: any }>('/HomePage/room', {
      params: { hotelId },
    });
    return Array.isArray(res.data?.data) ? res.data.data : [];
  },
};
