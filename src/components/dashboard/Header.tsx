'use client';

import React, { useState } from 'react';
import {
  Menu,
  Bell,
  User,
  LogOut,
  Settings,
  ShieldCheck,
  Building2,
  CheckCircle2,
} from 'lucide-react';
import { ThemeToggle } from './ThemeToggle';
import { Dropdown } from '../ui/Dropdown';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { useRealtime } from '@/features/realtime/RealtimeContext';
import { cn } from '@/lib/utils';

export interface HeaderProps {
  onToggleSidebar: () => void;
}

export function Header({ onToggleSidebar }: HeaderProps) {
  const { user, logout } = useAuth();
  const { isConnected, notifications, unreadCount, markAllAsRead, clearNotifications } =
    useRealtime();
  const [showNotifications, setShowNotifications] = useState(false);

  return (
    <header className="sticky top-0 z-30 flex h-20 w-full items-center justify-between border-b border-gray-200 bg-white px-4 sm:px-6 dark:border-gray-800 dark:bg-gray-900 shadow-xs transition-colors duration-200">
      {/* Left section: Hamburger toggle button */}
      <div className="flex items-center gap-3">
        <button
          onClick={onToggleSidebar}
          aria-label="Mở Menu"
          title="Mở / Đóng Menu Sidebar"
          className="flex h-11 w-11 items-center justify-center rounded-xl border border-gray-200 bg-gray-50/50 text-gray-700 hover:bg-brand-50 hover:text-brand-600 hover:border-brand-300 dark:border-gray-800 dark:bg-gray-800/40 dark:text-gray-200 dark:hover:bg-gray-800 dark:hover:text-white transition-all cursor-pointer shadow-xs"
        >
          <Menu className="h-5 w-5" />
        </button>
      </div>

      {/* Right section: Realtime Status, Theme Toggle, Notifications, User Profile */}
      <div className="flex items-center gap-2.5 sm:gap-3">
        {/* Realtime Socket Status Indicator */}
        <div
          className={cn(
            'hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded-full text-2xs font-semibold border transition-all select-none',
            isConnected
              ? 'bg-emerald-50 border-emerald-200 text-emerald-700 dark:bg-emerald-950/40 dark:border-emerald-800 dark:text-emerald-400'
              : 'bg-amber-50 border-amber-200 text-amber-700 dark:bg-amber-950/40 dark:border-amber-800 dark:text-amber-400',
          )}
          title={
            isConnected
              ? 'Máy chủ WebSocket Socket.IO đang kết nối ổn định'
              : 'Đang kết nối tới máy chủ Realtime...'
          }
        >
          <span
            className={cn(
              'h-2 w-2 rounded-full',
              isConnected
                ? 'bg-emerald-500 animate-pulse'
                : 'bg-amber-400 animate-spin',
            )}
          />
          <span>{isConnected ? 'Realtime Live' : 'Đang kết nối...'}</span>
        </div>

        {/* Theme Toggle */}
        <ThemeToggle />

        {/* Notifications Dropdown */}
        <div className="relative">
          <button
            onClick={() => {
              setShowNotifications(!showNotifications);
              if (!showNotifications && unreadCount > 0) {
                markAllAsRead();
              }
            }}
            aria-label="Thông báo"
            className="relative flex h-11 w-11 items-center justify-center rounded-full border border-gray-200 bg-white text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-800 dark:border-gray-800 dark:bg-gray-900 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-white cursor-pointer shadow-xs"
          >
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-orange-500 px-1 text-3xs font-extrabold text-white shadow-xs">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
            <Bell className="h-5 w-5" />
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-2 w-84 sm:w-96 rounded-2xl border border-gray-200 bg-white p-4 shadow-2xl dark:border-gray-800 dark:bg-gray-900 z-50 animate-in fade-in zoom-in-95">
              <div className="flex items-center justify-between border-b border-gray-100 dark:border-gray-800 pb-3 mb-3">
                <div className="flex items-center gap-2">
                  <h4 className="text-sm font-bold text-gray-900 dark:text-white">
                    Thông báo Realtime
                  </h4>
                  {unreadCount > 0 && (
                    <span className="rounded-full bg-brand-50 px-2 py-0.5 text-2xs font-bold text-brand-600 dark:bg-brand-500/15 dark:text-brand-400">
                      {unreadCount} mới
                    </span>
                  )}
                </div>
                {notifications.length > 0 && (
                  <button
                    onClick={clearNotifications}
                    className="text-2xs text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors cursor-pointer"
                  >
                    Xoá tất cả
                  </button>
                )}
              </div>

              <div className="max-h-80 overflow-y-auto space-y-2 pr-1 custom-scrollbar">
                {notifications.length === 0 ? (
                  <div className="py-8 text-center text-xs text-gray-400 dark:text-gray-500">
                    <CheckCircle2 className="mx-auto h-8 w-8 text-gray-300 dark:text-gray-600 mb-2" />
                    Chưa có thông báo realtime mới.
                  </div>
                ) : (
                  notifications.map((n) => (
                    <div
                      key={n.id}
                      className={cn(
                        'flex items-start gap-3 rounded-xl p-2.5 transition-colors cursor-pointer',
                        n.read
                          ? 'hover:bg-gray-50 dark:hover:bg-gray-800/50'
                          : 'bg-brand-50/40 dark:bg-brand-950/20 hover:bg-brand-50/70',
                      )}
                    >
                      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gray-100 dark:bg-gray-800 shrink-0 mt-0.5">
                        {n.category === 'booking' ? (
                          <Building2 className="h-4 w-4 text-brand-500" />
                        ) : (
                          <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold text-gray-800 dark:text-gray-200 leading-snug">
                          {n.title}
                        </p>
                        <p className="text-xs-plus text-gray-500 dark:text-gray-400 line-clamp-2 mt-0.5">
                          {n.message}
                        </p>
                        <span className="text-3xs text-gray-400 mt-1 block">
                          {new Date(n.timestamp).toLocaleTimeString('vi-VN')}
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* User Profile dropdown */}
        <Dropdown
          trigger={
            <button className="flex items-center gap-3 rounded-xl p-1.5 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors cursor-pointer">
              <div className="relative flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-tr from-brand-600 to-indigo-400 text-white font-bold text-sm shadow-md ring-2 ring-brand-500/20 uppercase">
                {user?.fullName ? user.fullName.slice(0, 2) : 'AD'}
                <span className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full bg-green-500 ring-2 ring-white dark:ring-gray-900" />
              </div>
              <div className="hidden lg:flex flex-col text-left">
                <span className="text-xs font-bold text-gray-800 dark:text-white leading-tight">
                  {user?.fullName || 'Người Dùng'}
                </span>
                <span className="text-2xs text-gray-500 dark:text-gray-400 flex items-center gap-1 font-medium">
                  <ShieldCheck className="h-3 w-3 text-brand-500" />
                  {user?.role === 'ADMIN' ? 'Quản Trị Viên' : 'Nhân Viên'}
                </span>
              </div>
            </button>
          }
          items={[
            {
              label: 'Hồ sơ cá nhân',
              icon: <User className="h-4 w-4" />,
              onClick: () => (window.location.href = '/profile'),
            },
            {
              label: 'Cài đặt hệ thống',
              icon: <Settings className="h-4 w-4" />,
              onClick: () => (window.location.href = '/profile'),
            },
            {
              label: 'Đăng xuất',
              icon: <LogOut className="h-4 w-4" />,
              variant: 'danger',
              onClick: () => logout(),
            },
          ]}
        />
      </div>
    </header>
  );
}
