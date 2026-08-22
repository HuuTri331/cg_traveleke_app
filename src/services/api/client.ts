import axios from 'axios';

const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3001/api';

export const apiClient = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 15000,
});

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    let errorMessage = 'Đã có lỗi xảy ra. Vui lòng thử lại sau.';
    if (error.response?.data) {
      if (Array.isArray(error.response.data.message)) {
        errorMessage = error.response.data.message.join(', ');
      } else if (typeof error.response.data.message === 'string') {
        errorMessage = error.response.data.message;
      } else if (error.response.data.error) {
        errorMessage = error.response.data.error;
      }
    } else if (error.message) {
      errorMessage = error.message;
    }
    return Promise.reject(new Error(errorMessage));
  }
);
