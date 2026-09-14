import { apiClient } from './client';

import {
  Room,
  RoomSearchParams,
  RoomSearchResponse,
} from '@/types/room';

export const homeRoomApi = {
  getRooms: async (): Promise<Room[]> => {
    const response = await apiClient.get('/HomePage/room');

    return Array.isArray(response.data?.data)
      ? response.data.data
      : [];
  },

  getRoomsByHotel: async (
    hotelId: string,
  ): Promise<Room[]> => {
    const response = await apiClient.get('/HomePage/room', {
      params: {
        hotelId,
      },
    });

    return Array.isArray(response.data?.data)
      ? response.data.data
      : [];
  },

  searchRooms: async (
    params: RoomSearchParams = {},
  ): Promise<RoomSearchResponse> => {
    const response = await apiClient.get<RoomSearchResponse>(
      '/rooms/search',
      {
        params,
      },
    );

    return response.data;
  },
};