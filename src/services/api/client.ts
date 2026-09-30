import axios from 'axios';

const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3001/api';

export const apiClient = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 15000,
  withCredentials: true, // Cho phép trình duyệt tự gửi HttpOnly Cookie cross-subdomain
});

// Mutex & Request Queue để giải quyết triệt để Refresh Race Condition (Thundering Herd)
let isRefreshing = false;
let failedQueue: Array<{
  resolve: (token: string) => void;
  reject: (err: any) => void;
}> = [];

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token!);
    }
  });
  failedQueue = [];
};

// Request interceptor: Tự động đính kèm token xác thực vào Header tương ứng theo ngữ cảnh
apiClient.interceptors.request.use(
  (config) => {
    if (typeof window !== 'undefined') {
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

// Response interceptor: Tự động xoay vòng Token (Refresh Token Rotation) khi gặp 401
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    let errorMessage = 'Đã có lỗi xảy ra. Vui lòng thử lại sau.';

    if (error.response) {
      const isAuthEndpoint =
        originalRequest?.url?.includes('/auth/login') ||
        originalRequest?.url?.includes('/auth/register') ||
        originalRequest?.url?.includes('/auth/refresh') ||
        originalRequest?.url?.includes('/auth/verify-email') ||
        originalRequest?.url?.includes('/auth/resend-verification') ||
        originalRequest?.url?.includes('/auth/validate-email');

      // 401 Unauthorized và chưa thử refresh lần nào
      if (error.response.status === 401 && !isAuthEndpoint && !originalRequest?._retry) {
        const currentPath = typeof window !== 'undefined' ? window.location.pathname : '';
        const isCustomerPath =
          currentPath.startsWith('/home') ||
          currentPath.startsWith('/hotels_home') ||
          currentPath.startsWith('/room_home') ||
          currentPath.startsWith('/process-order') ||
          currentPath.startsWith('/booking/') ||
          currentPath === '/booking' ||
          currentPath.startsWith('/booking-history') ||
          currentPath.startsWith('/customer-login') ||
          currentPath.startsWith('/register') ||
          currentPath.startsWith('/verify-email');

        // Nếu đã có một request khác đang refresh, xếp hàng đợi vào failedQueue (Mutex Pattern)
        if (isRefreshing) {
          return new Promise<string>((resolve, reject) => {
            failedQueue.push({ resolve, reject });
          })
            .then((token) => {
              if (originalRequest.headers) {
                originalRequest.headers.Authorization = `Bearer ${token}`;
              }
              return apiClient(originalRequest);
            })
            .catch((err) => Promise.reject(err));
        }

        if (originalRequest) {
          originalRequest._retry = true;
        }
        isRefreshing = true;

        const storedRefreshToken =
          typeof window !== 'undefined'
            ? localStorage.getItem('traveleke_refresh_token') ||
              localStorage.getItem('traveleke_customer_refresh_token')
            : null;

        try {
          // Gọi API refresh token (HttpOnly Cookie được tự động gửi kèm nhờ withCredentials: true)
          const refreshRes = await axios.post(
            `${BASE_URL}/auth/refresh`,
            { refreshToken: storedRefreshToken || undefined },
            { withCredentials: true, timeout: 10000 }
          );

          const newTokenData = refreshRes.data?.data;
          const newAccessToken = newTokenData?.access_token;
          const newRefreshToken = newTokenData?.refresh_token;

          if (newAccessToken && typeof window !== 'undefined') {
            if (isCustomerPath) {
              localStorage.setItem('traveleke_customer_token', newAccessToken);
              if (newRefreshToken) {
                localStorage.setItem('traveleke_customer_refresh_token', newRefreshToken);
              }
            } else {
              localStorage.setItem('traveleke_token', newAccessToken);
              if (newRefreshToken) {
                localStorage.setItem('traveleke_refresh_token', newRefreshToken);
              }
            }

            apiClient.defaults.headers.common.Authorization = `Bearer ${newAccessToken}`;
            if (originalRequest?.headers) {
              originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
            }

            processQueue(null, newAccessToken);
            return apiClient(originalRequest);
          }
        } catch (refreshError: any) {
          processQueue(refreshError, null);

          // Refresh thất bại: Xóa session và chuyển hướng về trang đăng nhập
          if (typeof window !== 'undefined') {
            if (isCustomerPath) {
              localStorage.removeItem('traveleke_customer_token');
              localStorage.removeItem('traveleke_customer_refresh_token');
              localStorage.removeItem('traveleke_customer_user');
              if (
                currentPath.startsWith('/booking-history') ||
                currentPath.startsWith('/process-order')
              ) {
                const redirect = encodeURIComponent(window.location.pathname + window.location.search);
                window.location.replace(`/customer-login?redirect=${redirect}`);
              }
            } else if (!currentPath.startsWith('/login')) {
              localStorage.removeItem('traveleke_token');
              localStorage.removeItem('traveleke_refresh_token');
              localStorage.removeItem('traveleke_user');
              window.location.replace('/login');
            }
          }
          return Promise.reject(refreshError);
        } finally {
          isRefreshing = false;
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
