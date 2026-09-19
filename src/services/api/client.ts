import axios from 'axios';

const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3001/api';

export const apiClient = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 15000,
});

// Request interceptor: Tự động đính kèm token xác thực vào Header tương ứng theo ngữ cảnh
apiClient.interceptors.request.use(
  (config) => {
    if (typeof window !== 'undefined') {
      // 1. Nếu caller đã truyền Authorization tường minh (như CustomerAuthContext), giữ nguyên
      if (config.headers?.Authorization) {
        return config;
      }

      const currentPath = window.location.pathname;
      const isCustomerPath =
        currentPath.startsWith('/home') ||
        currentPath.startsWith('/hotels_home') ||
        currentPath.startsWith('/room_home') ||
        currentPath.startsWith('/process-order') ||
        currentPath.startsWith('/booking/') ||
        currentPath === '/booking' ||
        currentPath.startsWith('/booking-history') ||
        currentPath.startsWith('/customer-');

      if (isCustomerPath) {
        const customerToken = localStorage.getItem('traveleke_customer_token');
        if (customerToken && config.headers) {
          config.headers.Authorization = `Bearer ${customerToken}`;
        }
      } else {
        const staffToken = localStorage.getItem('traveleke_token');
        if (staffToken && config.headers) {
          config.headers.Authorization = `Bearer ${staffToken}`;
        }
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor: Xử lý lỗi và tự động chuyển hướng khi hết hạn token (401)
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    let errorMessage = 'Đã có lỗi xảy ra. Vui lòng thử lại sau.';

    if (error.response) {
      if (error.response.status === 401) {
        const isAuthEndpoint =
          error.config?.url?.includes('/auth/login') ||
          error.config?.url?.includes('/auth/register') ||
          error.config?.url?.includes('/auth/verify-email') ||
          error.config?.url?.includes('/auth/resend-verification') ||
          error.config?.url?.includes('/auth/validate-email');

        const isCustomerPath =
          typeof window !== 'undefined' &&
          (window.location.pathname.startsWith('/home') ||
            window.location.pathname.startsWith('/hotels_home') ||
            window.location.pathname.startsWith('/room_home') ||
            window.location.pathname.startsWith('/process-order') ||
            window.location.pathname.startsWith('/booking/') ||
            window.location.pathname === '/booking' ||
            window.location.pathname.startsWith('/booking-history') ||
            window.location.pathname.startsWith('/customer-login') ||
            window.location.pathname.startsWith('/register') ||
            window.location.pathname.startsWith('/verify-email'));

        if (
          !isAuthEndpoint &&
          !isCustomerPath &&
          typeof window !== 'undefined' &&
          !window.location.pathname.startsWith('/login')
        ) {
          localStorage.removeItem('traveleke_token');
          localStorage.removeItem('traveleke_user');
          window.location.href = '/login';
        }
      }

      if (error.response.data) {
        if (Array.isArray(error.response.data.message)) {
          errorMessage = error.response.data.message.join(', ');
        } else if (typeof error.response.data.message === 'string') {
          errorMessage = error.response.data.message;
        } else if (error.response.data.error) {
          errorMessage = error.response.data.error;
        }
      }
    } else if (error.message) {
      errorMessage = error.message;
    }

    const customError = new Error(errorMessage) as any;
    if (error.response?.data) {
      customError.response = error.response;
      customError.requiresVerification = error.response.data.requiresVerification;
      customError.email = error.response.data.email;
      customError.locked = error.response.data.locked;
      customError.tier = error.response.data.tier;
      customError.lockedUntil = error.response.data.lockedUntil;
    }
    return Promise.reject(customError);
  }
);
