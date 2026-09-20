'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { PlaneTakeoff } from 'lucide-react';

import { Sidebar } from '@/components/dashboard/Sidebar';
import { Header } from '@/components/dashboard/Header';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { cn } from '@/lib/utils';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const { isLoading, isAuthenticated, user } = useAuth();

  useEffect(() => {
    // Kiểm tra tức thì trên Client: Nếu không có token nhân viên/admin, chuyển hướng ngay lập tức
    if (typeof window !== 'undefined') {
      const staffToken = localStorage.getItem('traveleke_token');
      if (!staffToken) {
        const customerToken = localStorage.getItem('traveleke_customer_token');
        router.replace(customerToken ? '/home' : '/login');
        return;
      }
    }

    if (!isLoading) {
      if (!isAuthenticated || user?.role === 'CUSTOMER') {
        const customerToken = typeof window !== 'undefined' ? localStorage.getItem('traveleke_customer_token') : null;
        if (customerToken || user?.role === 'CUSTOMER') {
          router.replace('/home');
        } else {
          router.replace('/login');
        }
      }
    }
  }, [isLoading, isAuthenticated, user, router]);

  // Fallback an toàn: Không bao giờ để màn hình xác thực treo quá 1s nếu phiên không hợp lệ
  useEffect(() => {
    if (isLoading) {
      const timer = setTimeout(() => {
        if (typeof window !== 'undefined' && !localStorage.getItem('traveleke_token')) {
          router.replace('/login');
        }
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [isLoading, router]);

  if (isLoading) {
    // Nếu trong localStorage không có token nhân viên, không hiển thị màn hình loading gây giật
    if (typeof window !== 'undefined' && !localStorage.getItem('traveleke_token')) {
      return null;
    }

    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4">
        <div className="relative flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-500 text-white shadow-xl shadow-brand-500/30 animate-pulse">
          <PlaneTakeoff className="h-7 w-7" />
        </div>
        <div className="mt-4 flex items-center gap-2 text-slate-400 text-xs font-semibold">
          <div className="h-3 w-3 rounded-full border-2 border-brand-500 border-t-transparent animate-spin" />
          <span>Đang xác thực phiên làm việc...</span>
        </div>
      </div>
    );
  }

  if (!isAuthenticated || user?.role === 'CUSTOMER') {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50/70 dark:bg-gray-950 flex flex-col font-sans transition-colors duration-200">
      {/* Sidebar */}
      <Sidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      {/* Main Content Area */}
      <div
        className={cn(
          'flex-1 flex flex-col transition-all duration-300 ease-in-out',
          sidebarOpen ? 'xl:ml-[280px]' : 'xl:ml-0',
        )}
      >
        {/* Sticky Header */}
        <Header
          onToggleSidebar={() =>
            setSidebarOpen((prev) => !prev)
          }
        />

        {/* Page Content */}
        <main className="flex-1 p-4 sm:p-5 md:p-6 w-full animate-in fade-in duration-200">
          {children}
        </main>
      </div>
    </div>
  );
}