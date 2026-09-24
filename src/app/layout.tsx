import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

import { ToastProvider } from '@/components/ui/Toast';
import { AuthProvider } from '@/features/auth/context/AuthContext';
import { CustomerAuthProvider } from '@/features/auth/context/CustomerAuthContext';
import { RealtimeProvider } from '@/features/realtime/RealtimeContext';

const inter = Inter({
  subsets: ['latin', 'vietnamese'],
  display: 'swap',
  variable: '--font-inter',
});

export const metadata: Metadata = {
  title: 'Traveleke - Đặt Phòng Khách Sạn & Tour Du Lịch',
  description:
    'Nền tảng đặt phòng khách sạn, tour du lịch và lập kế hoạch du lịch cá nhân ứng dụng AI.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="vi" className={inter.variable} suppressHydrationWarning>
      <body className={`${inter.className} min-h-screen bg-gray-50 text-gray-900 antialiased dark:bg-gray-950 dark:text-gray-100`}>
        <AuthProvider>
          <CustomerAuthProvider>
            <ToastProvider>
              <RealtimeProvider>{children}</RealtimeProvider>
            </ToastProvider>
          </CustomerAuthProvider>
        </AuthProvider>
      </body>
    </html>
  );
}