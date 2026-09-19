const BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3001/api';

export const homeApi = {
  getHomeData: async () => {
    try {
      const response = await fetch(`${BASE_URL}/home`);

      if (!response.ok) {
        return { success: true, message: 'Default Home' };
      }

      return response.json();
    } catch {
      return { success: true, message: 'Default Home' };
    }
  },
};