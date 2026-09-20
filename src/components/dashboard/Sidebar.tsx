'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Building2,
  BedDouble,
  Layers,
  PlaneTakeoff,
  X,
  Sparkles,
  Users,
  ShieldCheck,
  CalendarCheck,
  Compass,
  CalendarDays,
  UserCheck,
  Brain,
} from 'lucide-react';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { cn } from '@/lib/utils';

export interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export function Sidebar({ isOpen, onClose }: SidebarProps) {
  const pathname = usePathname();
  const { user, isAdmin } = useAuth();

  const menuSections = [
    {
      title: 'Quản Lý Lưu Trú & Vận Hành',
      items: [
        {
          label: 'Tổng Quan',
          href: '/dashboard',
          icon: <LayoutDashboard className="h-5 w-5" />,
        },
        {
          label: 'Đơn Đặt Khách Sạn',
          href: '/bookings',
          icon: <CalendarCheck className="h-5 w-5" />,
          badge: 'Mới',
        },
        {
          label: 'Khách Hàng',
          href: '/customers',
          icon: <UserCheck className="h-5 w-5" />,
        },
        {
          label: 'Khách Sạn',
          href: '/hotels',
          icon: <Building2 className="h-5 w-5" />,
        },
        {
          label: 'Phòng Khách Sạn',
          href: '/rooms',
          icon: <BedDouble className="h-5 w-5" />,
        },
        {
          label: 'Loại Phòng',
          href: '/room-types',
          icon: <Layers className="h-5 w-5" />,
        },
        {
          label: 'Dịch Vụ Phòng',
          href: '/services',
          icon: <Sparkles className="h-5 w-5" />,
          badge: 'Mới',
        },
      ],
    },
    {
      title: 'Dịch Vụ Du Lịch',
      items: [
        {
          label: 'Tour Du Lịch',
          href: '/tours',
          icon: <Compass className="h-5 w-5" />,
        },
        {
          label: 'Lịch Trình Di Chuyển',
          href: '/schedules',
          icon: <CalendarDays className="h-5 w-5" />,
        },
      ],
    },
    // Chỉ hiển thị mục Quản Lý Hệ Thống nếu là ADMIN
    ...(isAdmin
      ? [
          {
            title: 'Quản Lý Hệ Thống',
            items: [
              {
                label: 'Quản Lý Nhân Viên',
                href: '/staff',
                icon: <Users className="h-5 w-5" />,
              },
              {
                label: 'Phân Công Khách Sạn',
                href: '/hotel-staff',
                icon: <UserCheck className="h-5 w-5" />,
              },
              {
                label: 'Năng Lực Nhân Sự',
                href: '/staff-skills',
                icon: <Brain className="h-5 w-5" />,
                badge: 'Mới',
              },
            ],
          },
        ]
      : []),
  ];

  return (
    <>
      {/* Mobile overlay backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-xs xl:hidden transition-opacity duration-300 animate-in fade-in"
          onClick={onClose}
        />
      )}

      {/* Sidebar Container with smooth slide in/out on both desktop and mobile */}
      <aside
        className={cn(
          'fixed top-0 bottom-0 left-0 z-50 flex w-[280px] flex-col justify-between border-r border-gray-200 bg-white px-4 py-5 transition-transform duration-300 ease-in-out dark:border-gray-800 dark:bg-gray-900 shadow-xl xl:shadow-none',
          isOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        {/* Top Header / Logo */}
        <div className="flex items-center justify-between pb-5 border-b border-gray-100 dark:border-gray-800">
          <Link href="/hotels" className="flex items-center gap-3 group">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-500 text-white shadow-md shadow-brand-500/30 group-hover:scale-105 transition-transform">
              <PlaneTakeoff className="h-5 w-5" />
            </div>
            <div>
              <span className="text-base font-black tracking-tight text-gray-900 dark:text-white flex items-center gap-1.5">
                Traveleke
                <span
                  className={cn(
                    'text-[10px] px-1.5 py-0.5 rounded-md font-bold uppercase',
                    isAdmin
                      ? 'bg-amber-50 text-amber-600 dark:bg-amber-500/20 dark:text-amber-400'
                      : 'bg-indigo-50 text-indigo-600 dark:bg-indigo-500/20 dark:text-indigo-400'
                  )}
                >
                  {isAdmin ? 'Admin' : 'Nhân Viên'}
                </span>
              </span>
              <p className="text-[10px] text-gray-400 font-medium">Hệ thống quản lý khách sạn</p>
            </div>
          </Link>

          <button
            onClick={onClose}
            aria-label="Đóng menu"
            className="flex h-8 w-8 items-center justify-center rounded-lg text-gray-400 hover:bg-gray-100 hover:text-gray-700 xl:hidden dark:hover:bg-gray-800 cursor-pointer transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Navigation Menu */}
        <div className="flex-1 overflow-y-auto py-4 custom-scrollbar space-y-4">
          {menuSections.map((section, idx) => (
            <div key={idx}>
              <h3 className="mb-2 px-3 text-[11px] font-bold uppercase tracking-wider text-gray-400 dark:text-gray-500">
                {section.title}
              </h3>
              <ul className="space-y-1">
                {section.items.map((item) => {
                  const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
                  return (
                    <li key={item.href}>
                      <Link
                        href={item.href}
                        onClick={() => {
                          if (window.innerWidth < 1280) onClose();
                        }}
                        className={cn(
                          'group flex items-center justify-between rounded-xl px-3.5 py-2.5 text-xs font-semibold transition-all duration-200',
                          isActive
                            ? 'bg-brand-50 text-brand-600 dark:bg-brand-500/15 dark:text-brand-400 shadow-xs font-bold'
                            : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-800/60 dark:hover:text-white'
                        )}
                      >
                        <div className="flex items-center gap-3">
                          <span
                            className={cn(
                              'transition-colors',
                              isActive
                                ? 'text-brand-500 dark:text-brand-400'
                                : 'text-gray-400 group-hover:text-gray-600 dark:text-gray-500 dark:group-hover:text-gray-300'
                            )}
                          >
                            {item.icon}
                          </span>
                          <span>{item.label}</span>
                        </div>

                        {item.badge && (
                          <span
                            className={cn(
                              'rounded-full px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider',
                              item.badge === 'Admin'
                                ? 'bg-amber-500 text-white'
                                : 'bg-brand-500 text-white'
                            )}
                          >
                            {item.badge}
                          </span>
                        )}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom User Info / Banner */}
        <div className="pt-3 border-t border-gray-100 dark:border-gray-800">
          <div className="rounded-xl bg-gradient-to-br from-brand-50 to-indigo-50/50 p-3.5 dark:from-white/3 dark:to-white/5 border border-brand-100/50 dark:border-gray-800 flex items-center gap-3">
            <div className="h-8 w-8 rounded-lg bg-brand-500 text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-xs uppercase">
              {user?.fullName ? user.fullName.slice(0, 2) : 'TK'}
            </div>
            <div className="min-w-0 flex-1">
              <h4 className="text-xs font-bold text-gray-900 dark:text-white truncate">
                {user?.fullName || 'Người Dùng'}
              </h4>
              <p className="text-[10px] text-gray-500 dark:text-gray-400 flex items-center gap-1 font-medium truncate">
                <ShieldCheck className="h-3 w-3 text-brand-500 shrink-0" />
                {isAdmin ? 'Quản Trị Viên' : 'Nhân Viên Vận Hành'}
              </p>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
