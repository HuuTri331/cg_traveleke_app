import type { Metadata } from 'next';
import './globals.css';

import { ToastProvider } from '@/components/ui/Toast';
import { AuthProvider } from '@/features/auth/context/AuthContext';

export const metadata: Metadata = {
  title: 'Traveleke Admin - Bảng Điều Khiển Quản Trị Khách Sạn & Tour',
  description:
    'Hệ thống quản lý khách sạn, phòng nghỉ, tour du lịch và phân công nhân viên.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="vi" suppressHydrationWarning>
      <body className="min-h-screen bg-gray-50 text-gray-900 antialiased dark:bg-gray-950 dark:text-gray-100">
        <AuthProvider>
          <ToastProvider>{children}</ToastProvider>
        </AuthProvider>
      </body>
    </html>
  );
}