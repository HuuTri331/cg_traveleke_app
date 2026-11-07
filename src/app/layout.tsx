import type { Metadata } from 'next';
import { Inter, Playfair_Display } from 'next/font/google';
import './globals.css';

import { ToastProvider } from '@/components/ui/Toast';
import { AuthProvider } from '@/features/auth/context/AuthContext';
import { CustomerAuthProvider } from '@/features/auth/context/CustomerAuthContext';
import { RealtimeProvider } from '@/features/realtime/RealtimeContext';
import ChatBox from '@/components/chat/ChatBox';

const inter = Inter({
  subsets: ['latin', 'vietnamese'],
  display: 'swap',
  variable: '--font-inter',
});

const playfair = Playfair_Display({
  subsets: ['latin', 'vietnamese'],
  display: 'swap',
  weight: ['500', '600', '700'],
  variable: '--font-display',
});

export const metadata: Metadata = {
  title: 'Traveleke — Bộ Sưu Tập Khách Sạn & Nghỉ Dưỡng Tuyển Chọn',
  description:
    'Nền tảng đặt phòng khách sạn, khu nghỉ dưỡng cao cấp và trợ lý du lịch cá nhân hóa ứng dụng AI.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="vi" className={`${inter.variable} ${playfair.variable}`} suppressHydrationWarning>
      <head>
        {/* Critical Rendering Path Preconnect & DNS-Prefetch Optimization */}
        <link rel="preconnect" href="http://localhost:3001" />
        <link rel="dns-prefetch" href="http://localhost:3001" />
        <link rel="preconnect" href="https://images.unsplash.com" />
        <link rel="dns-prefetch" href="https://images.unsplash.com" />
      </head>
      <body className={`${inter.className} min-h-screen bg-gray-50 text-gray-900 antialiased dark:bg-gray-950 dark:text-gray-100`}>
        <AuthProvider>
          <CustomerAuthProvider>
            <ToastProvider>
              <RealtimeProvider>
                {children}
                <ChatBox />
              </RealtimeProvider>
            </ToastProvider>
          </CustomerAuthProvider>
        </AuthProvider>
      </body>
    </html>
  );
}