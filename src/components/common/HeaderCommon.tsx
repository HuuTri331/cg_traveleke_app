'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';

import logo from '@/assets/image/logo.png';

const topMenu = [
  { label: 'Hợp tác với chúng tôi', href: '#' },
  { label: 'Đặt chỗ của tôi', href: '#' },
];

const mainMenu = [
  { label: 'Khách sạn', href: '/hotels_home' },
  { label: 'Phòng khách sạn', href: '/room_home'},
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
              alt="Traveloke Logo"
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

            {/* Login */}
            <Link
              href="/login"
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

            {/* Register */}
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