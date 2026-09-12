import { apiClient } from './client';

import {
  HotelSearchResponse,
  SearchHotelParams,
} from '@/types/hotel-search';

export const hotelSearchApi = {
  async search(
    params: SearchHotelParams = {},
  ): Promise<HotelSearchResponse> {
    const response =
      await apiClient.get<HotelSearchResponse>(
        '/hotels/search',
        {
          params,
        },
      );

    return response.data;
  },
};