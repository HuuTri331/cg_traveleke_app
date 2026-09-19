'use client';

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { authApi } from '@/services/api/auth.api';
import { LoginDto, UserProfile } from '@/types/auth';

interface AuthContextType {
  user: UserProfile | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  isAdmin: boolean;
  isEmployee: boolean;
  login: (dto: LoginDto) => Promise<void>;
  logout: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const STAFF_PROTECTED_ROUTES = [
  '/dashboard',
  '/hotels',
  '/rooms',
  '/room-types',
  '/bookings',
  '/staff',
  '/schedules',
  '/tours',
  '/customers',
  '/hotel-staff',
  '/profile',
];

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const router = useRouter();
  const pathname = usePathname();

  // Khởi tạo trạng thái xác thực khi mở web (khôi phục session tức thì, xác thực ngầm)
  const initAuth = useCallback(async () => {
    try {
      const storedToken = localStorage.getItem('traveleke_token');
      const storedUser = localStorage.getItem('traveleke_user');

      if (storedToken) {
        setToken(storedToken);
        if (storedUser) {
          try {
            const parsedUser = JSON.parse(storedUser);
            setUser(parsedUser);
            // Có session lưu sẵn: mở khoá UI ngay lập tức không bắt người dùng đợi
            setIsLoading(false);
          } catch {
            // bỏ qua parse error
          }
        }

        // Fetch fresh profile từ server ở chế độ nền
        try {
          const profile = await authApi.getMe();
          if (profile.role === 'CUSTOMER') {
            localStorage.removeItem('traveleke_token');
            localStorage.removeItem('traveleke_user');
            setToken(null);
            setUser(null);
            return;
          }
          setUser(profile);
          localStorage.setItem('traveleke_user', JSON.stringify(profile));
        } catch {
          // Token hết hạn hoặc không hợp lệ
          localStorage.removeItem('traveleke_token');
          localStorage.removeItem('traveleke_user');
          setToken(null);
          setUser(null);
        }
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    initAuth();
  }, [initAuth]);

  // Kiểm tra route bảo vệ: chỉ chặn các route của Admin/Nhân viên
  useEffect(() => {
    if (!isLoading) {
      const isStaffProtected = STAFF_PROTECTED_ROUTES.some(
        (r) => pathname === r || pathname.startsWith(r + '/'),
      );
      const isLoginPage = pathname === '/login';
      const hasToken = !!token;

      if (isStaffProtected) {
        const customerToken = typeof window !== 'undefined' ? localStorage.getItem('traveleke_customer_token') : null;
        const isCustomer = user?.role === 'CUSTOMER' || !!customerToken;

        // Nếu là khách hàng hoặc chưa có token nhân viên, cấm truy cập
        if (!hasToken || user?.role === 'CUSTOMER') {
          // Khách hàng đã đăng nhập cố tình vô trang admin -> đá về trang chủ khách hàng (/home)
          // Chưa đăng nhập gì cả cố tình vào -> đá về trang đăng nhập admin (/login)
          router.replace(isCustomer ? '/home' : '/login');
        }
      } else if (hasToken && isLoginPage) {
        router.replace('/dashboard');
      }
    }
  }, [isLoading, token, user, pathname, router]);

  const login = async (dto: LoginDto) => {
    setIsLoading(true);
    try {
      const data = await authApi.login(dto);

      if (data.user.role === 'CUSTOMER') {
        throw new Error('Tài khoản khách hàng không có quyền truy cập bảng quản trị. Vui lòng đăng nhập tại trang người dùng.');
      }

      localStorage.setItem('traveleke_token', data.access_token);
      localStorage.setItem('traveleke_user', JSON.stringify(data.user));
      setToken(data.access_token);
      setUser(data.user);
      router.push('/dashboard');
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    setIsLoading(true);
    try {
      await authApi.logout();
    } finally {
      localStorage.removeItem('traveleke_token');
      localStorage.removeItem('traveleke_user');
      setToken(null);
      setUser(null);
      setIsLoading(false);
      router.push('/login');
    }
  };

  const refreshProfile = async () => {
    try {
      const profile = await authApi.getMe();
      setUser(profile);
      localStorage.setItem('traveleke_user', JSON.stringify(profile));
    } catch {
      // Ignored
    }
  };

  const isAuthenticated = !!token && !!user;
  const isAdmin = user?.role === 'ADMIN';
  const isEmployee = user?.role === 'EMPLOYEE' || user?.role === 'ADMIN';

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoading,
        isAuthenticated,
        isAdmin,
        isEmployee,
        login,
        logout,
        refreshProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
