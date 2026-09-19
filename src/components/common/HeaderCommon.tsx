'use client';

import { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';

import logo from '@/assets/image/logo.png';
import { useCustomerAuth } from '@/features/auth/context/CustomerAuthContext';

const BACKEND_URL = 'http://localhost:3001';

const getAvatarUrl = (url?: string | null) => {
  if (!url) return null;
  if (url.startsWith('http')) return url;
  return `${BACKEND_URL}${url}`;
};

const topMenu = [
  { label: 'Hợp tác với chúng tôi', href: '#' },
  { label: 'Đặt chỗ của tôi', href: '#' },
];

const mainMenu = [
  { label: 'Khách sạn', href: '/hotels_home' },
  { label: 'Phòng khách sạn', href: '/room_home' },
  { label: 'Vé xe khách', href: '#' },
  { label: 'Đưa đón sân bay', href: '#' },
  { label: 'Cho thuê xe', href: '#' },
  { label: 'Hoạt động & Vui chơi', href: '#' },
];

const moreMenu = [
  { icon: '📦', label: 'Combo tiết kiệm' },
  { icon: '🛡️', label: 'Bảo hiểm du lịch' },
  { icon: '🎁', label: 'Phiếu quà tặng' },
  { icon: '🚢', label: 'Du thuyền' },
  { icon: '🔭', label: 'Cẩm nang du lịch' },
];

const menuItemClass =
  'rounded-lg px-3 py-2 transition-colors hover:bg-gray-100 hover:text-blue-500';

const dropdownItemClass =
  'flex w-full items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-gray-100';

export default function HeaderCommon() {
  const [isLanguageOpen, setIsLanguageOpen] = useState(false);
  const [isSupportOpen, setIsSupportOpen] = useState(false);
  const [isMoreOpen, setIsMoreOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

  const { customer, isCustomerAuthenticated, isCustomerLoading, customerLogout } = useCustomerAuth();

  const userMenuRef = useRef<HTMLDivElement>(null);

  // Close user dropdown on outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setIsUserMenuOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const avatarUrl = customer ? getAvatarUrl(customer.avatarUrl) : null;

  return (
    <header className="group relative mx-auto max-w-screen-xl px-4 py-3">
      {/* Background */}
      <div
        className="
          pointer-events-none
          absolute inset-0
          bg-white opacity-0 shadow-md
          transition-opacity duration-300
          group-hover:opacity-100
        "
      />

      <div className="relative z-10">
        {/* ===== TOP HEADER ===== */}
        <div className="flex items-center justify-between gap-6">
          {/* Logo */}
          <Link href="/" className="shrink-0">
            <Image
              src={logo}
              alt="Traveleke Logo"
              className="h-14 w-auto object-contain"
              priority
            />
          </Link>

          {/* Right menu */}
          <div className="flex items-center gap-1 text-sm font-semibold">
            {/* Language */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setIsLanguageOpen((prev) => !prev)}
                className="flex items-center gap-2 rounded-lg px-3 py-2 transition-colors hover:bg-gray-100"
              >
                <img
                  src="https://cdn-icons-png.flaticon.com/512/197/197473.png"
                  alt="Vietnam"
                  className="h-4 w-4"
                />
                <span>VI | VND</span>
                <span className="text-[10px]">▼</span>
              </button>

              {isLanguageOpen && (
                <div className="absolute right-0 top-full z-50 mt-2 w-48 overflow-hidden rounded-xl border border-gray-200 bg-white shadow-lg">
                  <button type="button" className={dropdownItemClass}>
                    Tiếng Việt
                  </button>
                  <button type="button" className={dropdownItemClass}>
                    VND
                  </button>
                </div>
              )}
            </div>

            {/* Promotion */}
            <button
              type="button"
              className="flex items-center gap-2 rounded-lg px-3 py-2 text-green-600 transition-colors hover:bg-gray-100"
            >
              <span>🏷️</span>
              <span>Khuyến mãi</span>
            </button>

            {/* Support */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setIsSupportOpen((prev) => !prev)}
                className="flex items-center gap-1 rounded-lg px-3 py-2 transition-colors hover:bg-gray-100"
              >
                Hỗ trợ
                <span className="text-[10px]">▼</span>
              </button>

              {isSupportOpen && (
                <div className="absolute right-0 top-full z-50 mt-2 w-56 overflow-hidden rounded-xl border border-gray-200 bg-white shadow-lg">
                  <a href="#" className={dropdownItemClass}>
                    <span>❓</span>
                    <span>Trợ giúp</span>
                  </a>
                  <a href="#" className={dropdownItemClass}>
                    <span>🎧</span>
                    <span>Liên hệ chúng tôi</span>
                  </a>
                </div>
              )}
            </div>

            {/* Top links */}
            {topMenu.map((item) => (
              <a key={item.label} href={item.href} className={menuItemClass}>
                {item.label}
              </a>
            ))}

            {/* Auth area */}
            {isCustomerLoading ? (
              <div className="h-9 w-24 animate-pulse rounded-lg bg-gray-100" />
            ) : isCustomerAuthenticated && customer ? (
              /* ── User is logged in ── */
              <div className="relative" ref={userMenuRef}>
                <button
                  type="button"
                  onClick={() => setIsUserMenuOpen((prev) => !prev)}
                  className="flex items-center gap-2 rounded-xl px-3 py-1.5 transition-colors hover:bg-blue-50"
                >
                  {/* Avatar */}
                  <div className="relative h-8 w-8 shrink-0 overflow-hidden rounded-full ring-2 ring-blue-400">
                    {avatarUrl ? (
                      <img src={avatarUrl} alt={customer.fullName} className="h-full w-full object-cover" />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center bg-gradient-to-tr from-blue-500 to-indigo-400 text-xs font-bold text-white uppercase">
                        {customer.fullName.slice(0, 2)}
                      </div>
                    )}
                    <span className="absolute bottom-0 right-0 h-2 w-2 rounded-full bg-green-500 ring-1 ring-white" />
                  </div>

                  {/* Greeting */}
                  <span className="text-sm font-semibold text-gray-700">
                    Xin chào, <span className="text-blue-600">{customer.fullName.split(' ').slice(-1)[0]}</span>
                  </span>
                  <span className="text-[10px] text-gray-400">▼</span>
                </button>

                {/* Dropdown */}
                {isUserMenuOpen && (
                  <div className="absolute right-0 top-full z-50 mt-2 w-56 overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-xl">
                    {/* User info */}
                    <div className="flex items-center gap-3 border-b border-gray-100 px-4 py-3">
                      <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-full">
                        {avatarUrl ? (
                          <img src={avatarUrl} alt={customer.fullName} className="h-full w-full object-cover" />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center bg-gradient-to-tr from-blue-500 to-indigo-400 text-sm font-bold text-white uppercase">
                            {customer.fullName.slice(0, 2)}
                          </div>
                        )}
                      </div>
                      <div className="min-w-0">
                        <p className="truncate text-xs font-bold text-gray-900">{customer.fullName}</p>
                        <p className="truncate text-[11px] text-gray-500">{customer.email}</p>
                      </div>
                    </div>

                    <Link href="/home" className={dropdownItemClass} onClick={() => setIsUserMenuOpen(false)}>
                      <span>👤</span>
                      <span>Profile (Hồ sơ cá nhân)</span>
                    </Link>
                    <Link href="/booking-history" className={dropdownItemClass} onClick={() => setIsUserMenuOpen(false)}>
                      <span>📋</span>
                      <span>Đặt chỗ của tôi</span>
                    </Link>
                    <div className="border-t border-gray-100">
                      <button
                        type="button"
                        onClick={async () => {
                          setIsUserMenuOpen(false);
                          await customerLogout();
                        }}
                        className="flex w-full items-center gap-3 px-4 py-3 text-left text-red-500 transition-colors hover:bg-red-50 font-medium"
                      >
                        <span>🚪</span>
                        <span>Đăng xuất</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              /* ── Guest ── */
              <>
                <Link
                  href="/customer-login"
                  className="
                    flex items-center gap-2
                    rounded-lg border border-blue-500
                    px-3 py-2 text-blue-500
                    transition-colors
                    hover:bg-blue-50
                  "
                >
                  <span>👤</span>
                  <span>Đăng nhập</span>
                </Link>

                <Link
                  href="/register"
                  className="
                    rounded-lg bg-blue-500
                    px-4 py-2 text-white
                    transition-colors
                    hover:bg-blue-600
                  "
                >
                  Đăng ký
                </Link>
              </>
            )}
          </div>
        </div>

        {/* ===== BOTTOM MENU ===== */}
        <nav className="mt-3 flex flex-wrap items-center gap-1 border-t border-gray-100 pt-2 text-sm font-semibold text-gray-600">
          {mainMenu.map((item) => (
            <Link
              key={item.label}
              href={item.href}
              className={menuItemClass}
            >
              {item.label}
            </Link>
          ))}

          {/* More */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setIsMoreOpen((prev) => !prev)}
              className="flex items-center gap-1 rounded-lg px-3 py-2 transition-colors hover:bg-gray-100 hover:text-blue-500"
            >
              More
              <span className="text-[10px]">▼</span>
            </button>

            {isMoreOpen && (
              <div className="absolute left-0 top-full z-50 mt-2 w-56 overflow-hidden rounded-xl border border-gray-200 bg-white shadow-lg">
                {moreMenu.map((item) => (
                  <a
                    key={item.label}
                    href="#"
                    className={dropdownItemClass}
                  >
                    <span>{item.icon}</span>
                    <span>{item.label}</span>
                  </a>
                ))}
              </div>
            )}
          </div>
        </nav>
      </div>
    </header>
  );
}