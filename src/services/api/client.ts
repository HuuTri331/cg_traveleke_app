import axios from 'axios';

const BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ||
  'http://localhost:3001/api';

export const apiClient = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 15000,
});

// Request interceptor:
// Tự động đính kèm token xác thực vào Header
apiClient.interceptors.request.use(
  (config) => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('traveleke_token');

      if (token && config.headers) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }

    return config;
  },
  (error) => Promise.reject(error),
);

// Response interceptor:
// Xử lý lỗi và tự động chuyển hướng khi token hết hạn / không hợp lệ
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    let errorMessage =
      'Đã có lỗi xảy ra. Vui lòng thử lại sau.';

    if (error.response) {
      // Nếu token hết hạn hoặc không hợp lệ
      if (error.response.status === 401) {
        if (
          typeof window !== 'undefined' &&
          !window.location.pathname.startsWith('/login')
        ) {
          localStorage.removeItem('traveleke_token');
          localStorage.removeItem('traveleke_user');

          window.location.href = '/login';
        }
      }

      // Lấy message lỗi từ backend
      if (error.response.data) {
        if (Array.isArray(error.response.data.message)) {
          errorMessage =
            error.response.data.message.join(', ');
        } else if (
          typeof error.response.data.message === 'string'
        ) {
          errorMessage =
            error.response.data.message;
        } else if (error.response.data.error) {
          errorMessage =
            error.response.data.error;
        }
      }
    } else if (error.message) {
      errorMessage = error.message;
    }

    return Promise.reject(
      new Error(errorMessage),
    );
  },
);