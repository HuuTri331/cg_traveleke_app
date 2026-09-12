import { apiClient } from './client';

export const homeHotelsApi = {
  getHotels: async () => {
    const response = await apiClient.get('/HomePage/hotels');

    return response.data;
  },
};