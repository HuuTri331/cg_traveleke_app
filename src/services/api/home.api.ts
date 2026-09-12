const API_URL =
  process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export const homeApi = {
  getHomeData: async () => {
    const response = await fetch(`${API_URL}/home`);

    if (!response.ok) {
      throw new Error('Không thể tải dữ liệu trang chủ');
    }

    return response.json();
  },
};