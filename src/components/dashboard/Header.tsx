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

export interface HeaderProps {
  onToggleSidebar: () => void;
}

export function Header({ onToggleSidebar }: HeaderProps) {
  const { user, logout } = useAuth();
  const [showNotifications, setShowNotifications] = useState(false);

  const notifications = [
    {
      id: 1,
      title: 'Khách sạn mới được tạo',
      desc: 'Khách sạn Rex Saigon vừa được thêm vào hệ thống.',
      time: '10 phút trước',
      icon: <Building2 className="h-4 w-4 text-brand-500" />,
    },
    {
      id: 2,
      title: 'Cập nhật phòng thành công',
      desc: 'Phòng Deluxe Ocean View đã được đổi giá.',
      time: '1 giờ trước',
      icon: <CheckCircle2 className="h-4 w-4 text-green-500" />,
    },
  ];

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

      {/* Right section: Theme Toggle, Notifications, User Profile */}
      <div className="flex items-center gap-2.5 sm:gap-3">
        {/* Theme Toggle */}
        <ThemeToggle />

        {/* Notifications Dropdown */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            aria-label="Thông báo"
            className="relative flex h-11 w-11 items-center justify-center rounded-full border border-gray-200 bg-white text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-800 dark:border-gray-800 dark:bg-gray-900 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-white cursor-pointer shadow-xs"
          >
            {/* Ping orange badge */}
            <span className="absolute top-2 right-2 flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-orange-500"></span>
            </span>
            <Bell className="h-5 w-5" />
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 rounded-2xl border border-gray-200 bg-white p-4 shadow-2xl dark:border-gray-800 dark:bg-gray-900 z-50 animate-in fade-in zoom-in-95">
              <div className="flex items-center justify-between border-b border-gray-100 dark:border-gray-800 pb-3 mb-3">
                <h4 className="text-sm font-bold text-gray-900 dark:text-white">
                  Thông báo hệ thống
                </h4>
                <span className="rounded-full bg-brand-50 px-2 py-0.5 text-[10px] font-bold text-brand-600 dark:bg-brand-500/15 dark:text-brand-400">
                  2 mới
                </span>
              </div>
              <div className="space-y-2.5">
                {notifications.map((n) => (
                  <div
                    key={n.id}
                    className="flex items-start gap-3 rounded-xl p-2 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors cursor-pointer"
                  >
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gray-100 dark:bg-gray-800 shrink-0">
                      {n.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-gray-800 dark:text-gray-200">
                        {n.title}
                      </p>
                      <p className="text-[11px] text-gray-500 dark:text-gray-400 truncate">
                        {n.desc}
                      </p>
                      <span className="text-[10px] text-gray-400 mt-0.5 block">
                        {n.time}
                      </span>
                    </div>
                  </div>
                ))}
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
                <span className="text-[10px] text-gray-500 dark:text-gray-400 flex items-center gap-1 font-medium">
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
