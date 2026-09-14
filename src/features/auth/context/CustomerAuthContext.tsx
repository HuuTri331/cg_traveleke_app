'use client';

import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { apiClient } from '@/services/api/client';
import type { UserProfile, LoginDto } from '@/types/auth';

interface CustomerAuthContextType {
  customer: UserProfile | null;
  customerToken: string | null;
  isCustomerLoading: boolean;
  isCustomerAuthenticated: boolean;
  customerLogin: (dto: LoginDto) => Promise<void>;
  customerLogout: () => Promise<void>;
  refreshCustomerProfile: () => Promise<void>;
}

const CustomerAuthContext = createContext<CustomerAuthContextType | undefined>(undefined);

const TOKEN_KEY = 'traveleke_customer_token';
const USER_KEY = 'traveleke_customer_user';

async function fetchCustomerProfile(token: string): Promise<UserProfile> {
  const res = await apiClient.get<{ data: UserProfile }>('/auth/me', {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data.data;
}

export function CustomerAuthProvider({ children }: { children: React.ReactNode }) {
  const [customer, setCustomer] = useState<UserProfile | null>(null);
  const [customerToken, setCustomerToken] = useState<string | null>(null);
  const [isCustomerLoading, setIsCustomerLoading] = useState(true);

  const router = useRouter();

  const initCustomerAuth = useCallback(async () => {
    try {
      if (typeof window === 'undefined') return;
      const storedToken = localStorage.getItem(TOKEN_KEY);
      const storedUser = localStorage.getItem(USER_KEY);

      if (storedToken) {
        setCustomerToken(storedToken);
        if (storedUser) {
          try { setCustomer(JSON.parse(storedUser)); } catch { /* ignore */ }
        }
        try {
          const profile = await fetchCustomerProfile(storedToken);
          // Only allow CUSTOMER role
          if (profile.role !== 'CUSTOMER') {
            localStorage.removeItem(TOKEN_KEY);
            localStorage.removeItem(USER_KEY);
            setCustomerToken(null);
            setCustomer(null);
            return;
          }
          setCustomer(profile);
          localStorage.setItem(USER_KEY, JSON.stringify(profile));
        } catch {
          localStorage.removeItem(TOKEN_KEY);
          localStorage.removeItem(USER_KEY);
          setCustomerToken(null);
          setCustomer(null);
        }
      }
    } finally {
      setIsCustomerLoading(false);
    }
  }, []);

  useEffect(() => { initCustomerAuth(); }, [initCustomerAuth]);

  const customerLogin = async (dto: LoginDto) => {
    setIsCustomerLoading(true);
    try {
      const res = await apiClient.post<{ data: { access_token: string; user: UserProfile } }>('/auth/login', dto);
      const { access_token, user } = res.data.data;

      // Block staff/admin from logging into customer portal
      if (user.role === 'ADMIN' || user.role === 'EMPLOYEE') {
        throw new Error('Tài khoản nhân viên / admin không thể đăng nhập tại đây. Vui lòng sử dụng trang quản trị.');
      }

      localStorage.setItem(TOKEN_KEY, access_token);
      localStorage.setItem(USER_KEY, JSON.stringify(user));
      setCustomerToken(access_token);
      setCustomer(user);
      router.push('/home');
    } finally {
      setIsCustomerLoading(false);
    }
  };

  const customerLogout = async () => {
    try {
      if (customerToken) {
        await apiClient.post('/auth/logout', {}, {
          headers: { Authorization: `Bearer ${customerToken}` },
        });
      }
    } catch {
      // Bỏ qua lỗi backend khi logout, luôn xoá phiên ở client
    } finally {
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(USER_KEY);
      setCustomerToken(null);
      setCustomer(null);
      router.push('/customer-login');
    }
  };

  const refreshCustomerProfile = async () => {
    if (!customerToken) return;
    try {
      const profile = await fetchCustomerProfile(customerToken);
      setCustomer(profile);
      localStorage.setItem(USER_KEY, JSON.stringify(profile));
    } catch { /* ignore */ }
  };

  const isCustomerAuthenticated = !!customerToken && !!customer;

  return (
    <CustomerAuthContext.Provider value={{
      customer,
      customerToken,
      isCustomerLoading,
      isCustomerAuthenticated,
      customerLogin,
      customerLogout,
      refreshCustomerProfile,
    }}>
      {children}
    </CustomerAuthContext.Provider>
  );
}

export function useCustomerAuth() {
  const ctx = useContext(CustomerAuthContext);
  if (!ctx) throw new Error('useCustomerAuth must be used within CustomerAuthProvider');
  return ctx;
}
