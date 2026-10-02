import { apiClient } from './client';

export interface RecentlyViewedHotel {
  hotelId: number | string;
  name: string;
  slug: string;
  address: string;
  starRating?: number;
  coverImageUrl?: string;
  minPricePerNight?: number;
  lastViewedAt?: string;
}

export interface TopHotelOfMonth {
  rank: number;
  hotelId: number | string;
  name: string;
  slug: string;
  address: string;
  starRating?: number;
  coverImageUrl?: string;
  minPricePerNight: number;
  totalInteractions: number;
  uniqueVisitors: number;
  popularPriceRange: string;
  month: number;
  year: number;
}

export interface PriceDistributionItem {
  range: string;
  count: number;
  percentage: number;
  color: string;
}

export interface AdminSearchTrendsResponse {
  month: number;
  year: number;
  summary: {
    totalInteractions: number;
    topHotelName: string;
    mostSearchedPriceRange: string;
  };
  priceDistribution: PriceDistributionItem[];
  topHotels: TopHotelOfMonth[];
}

export const analyticsApi = {
  /**
   * Ghi nhận lượt xem chi tiết khách sạn hoặc tìm kiếm
   */
  trackView: async (
    hotelId: number | string,
    price?: number,
  ): Promise<{ success: boolean }> => {
    try {
      const res = await apiClient.post('/analytics/track', {
        hotelId: Number(hotelId),
        price: price ? Number(price) : undefined,
      });
      return res.data;
    } catch {
      // Background tracking nên không block client nếu lỗi
      return { success: false };
    }
  },

  /**
   * Lấy danh sách khách sạn đã xem gần đây
   */
  getRecentlyViewed: async (limit = 8): Promise<RecentlyViewedHotel[]> => {
    try {
      const res = await apiClient.get<{ success: boolean; data: RecentlyViewedHotel[] }>(
        '/analytics/recently-viewed',
        { params: { limit } }
      );
      return res.data?.data || [];
    } catch (err) {
      console.warn('Could not fetch recently viewed hotels:', err);
      return [];
    }
  },

  /**
   * Lấy Top khách sạn được tìm kiếm và xem nhiều nhất trong tháng (cho Trang chủ)
   */
  getTopHotelsOfMonth: async (
    month?: number,
    year?: number,
    limit = 8,
  ): Promise<TopHotelOfMonth[]> => {
    try {
      const res = await apiClient.get<{ success: boolean; data: TopHotelOfMonth[] }>(
        '/analytics/top-hotels-of-month',
        { params: { month, year, limit } }
      );
      return res.data?.data || [];
    } catch (err) {
      console.warn('Could not fetch top hotels of month:', err);
      return [];
    }
  },

  /**
   * Lấy báo cáo xu hướng tìm kiếm và phân bố khoảng giá cho Admin Dashboard
   */
  getAdminSearchTrends: async (
    month?: number,
    year?: number,
  ): Promise<AdminSearchTrendsResponse | null> => {
    try {
      const res = await apiClient.get<{ success: boolean; data: AdminSearchTrendsResponse }>(
        '/analytics/admin/search-trends',
        { params: { month, year } }
      );
      return res.data?.data || null;
    } catch (err) {
      console.error('Could not fetch admin search trends:', err);
      return null;
    }
  },
};
