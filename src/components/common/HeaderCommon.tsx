'use client';

import { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Package,
  Shield,
  Gift,
  Ship,
  Compass,
  Tag,
  HelpCircle,
  Headphones,
  User,
  ClipboardList,
  LogOut,
  ChevronDown,
} from 'lucide-react';

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
  { label: 'Đặt chỗ của tôi', href: '/booking-history' },
];

const mainMenu = [
  { label: 'Khách sạn', href: '/hotels_home' },
  { label: 'Bộ sưu tập phòng', href: '/room_home' },
  { label: 'Vé xe khách', href: '#' },
  { label: 'Đưa đón sân bay', href: '#' },
  { label: 'Cho thuê xe', href: '#' },
  { label: 'Trải nghiệm & Tour', href: '#' },
];

const moreMenu = [
  { icon: Package, label: 'Combo nghỉ dưỡng' },
  { icon: Shield, label: 'Bảo hiểm du lịch' },
  { icon: Gift, label: 'Phiếu quà tặng VIP' },
  { icon: Ship, label: 'Du thuyền cao cấp' },
  { icon: Compass, label: 'Cẩm nang du lịch' },
];

const menuItemClass =
  'rounded-lg px-3 py-2 text-sm font-semibold text-[#1E4752] transition-colors hover:text-[#E8A700] hover:bg-[#1E4752]/5';

const dropdownItemClass =
  'flex w-full items-center gap-3 px-4 py-3 text-left text-sm font-medium text-[#1E4752] transition-colors hover:bg-[#1E4752]/5 hover:text-[#E8A700]';

export default function HeaderCommon() {
  const pathname = usePathname();
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
    <header className="relative w-full bg-white border-b border-[#1E4752]/10 transition-colors z-40">
      <div className="mx-auto max-w-screen-xl px-4 py-2.5 sm:py-3">
        {/* ===== TOP HEADER ===== */}
        <div className="flex items-center justify-between gap-4">
          {/* Logo */}
          <Link href="/" className="shrink-0 flex items-center gap-2 group">
            <Image
              src={logo}
              alt="Traveleke Luxury"
              className="h-11 sm:h-12 w-auto object-contain transition-transform duration-200 group-hover:scale-102"
              priority
            />
          </Link>

          {/* Right Menu */}
          <div className="flex items-center gap-1 sm:gap-1.5 text-sm font-semibold text-[#1E4752]">
            {/* Language */}
            <div className="relative hidden md:block">
              <button
                type="button"
                onClick={() => setIsLanguageOpen((prev) => !prev)}
                className="flex items-center gap-2 rounded-lg px-2.5 py-1.5 text-xs font-bold uppercase tracking-wider text-[#1E4752]/80 transition-colors hover:bg-[#1E4752]/5 hover:text-[#1E4752] cursor-pointer"
              >
                <img
                  src="https://cdn-icons-png.flaticon.com/512/197/197473.png"
                  alt="Vietnam"
                  className="h-3.5 w-3.5 rounded-full"
                />
                <span>VI | VND</span>
                <ChevronDown className="h-3.5 w-3.5 text-[#1E4752]/50" />
              </button>

              {isLanguageOpen && (
                <div className="absolute right-0 top-full z-50 mt-2 w-44 overflow-hidden rounded-xl border border-[#1E4752]/15 bg-white shadow-xl">
                  <button type="button" className={dropdownItemClass} onClick={() => setIsLanguageOpen(false)}>
                    Tiếng Việt
                  </button>
                  <button type="button" className={dropdownItemClass} onClick={() => setIsLanguageOpen(false)}>
                    VND (₫)
                  </button>
                </div>
              )}
            </div>

            {/* Promotion */}
            <Link
              href="/hotels_home"
              className="hidden lg:flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-bold uppercase tracking-wider text-[#E8A700] transition-colors hover:bg-[#E8A700]/10"
            >
              <Tag className="h-3.5 w-3.5 text-[#E8A700] shrink-0" />
              <span>Ưu đãi tuyển chọn</span>
            </Link>

            {/* Support */}
            <div className="relative hidden sm:block">
              <button
                type="button"
                onClick={() => setIsSupportOpen((prev) => !prev)}
                className="flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-bold uppercase tracking-wider text-[#1E4752]/80 transition-colors hover:bg-[#1E4752]/5 hover:text-[#1E4752] cursor-pointer"
              >
                <span>Hỗ trợ</span>
                <ChevronDown className="h-3.5 w-3.5 text-[#1E4752]/50" />
              </button>

              {isSupportOpen && (
                <div className="absolute right-0 top-full z-50 mt-2 w-52 overflow-hidden rounded-xl border border-[#1E4752]/15 bg-white shadow-xl">
                  <a href="#" className={dropdownItemClass}>
                    <HelpCircle className="h-4 w-4 text-[#1E4752]/60 shrink-0" />
                    <span>Trung tâm trợ giúp</span>
                  </a>
                  <a href="#" className={dropdownItemClass}>
                    <Headphones className="h-4 w-4 text-[#1E4752]/60 shrink-0" />
                    <span>Dịch vụ hỗ trợ 24/7</span>
                  </a>
                </div>
              )}
            </div>

            {/* Top links */}
            {topMenu.map((item) => (
              <Link
                key={item.label}
                href={item.href}
                className="hidden xl:inline-block rounded-lg px-2.5 py-1.5 text-xs font-bold uppercase tracking-wider text-[#1E4752]/80 hover:bg-[#1E4752]/5 hover:text-[#1E4752] transition-colors"
              >
                {item.label}
              </Link>
            ))}

            {/* Auth Area */}
            {isCustomerLoading ? (
              <div className="h-9 w-24 animate-pulse rounded-lg bg-[#1E4752]/10" />
            ) : isCustomerAuthenticated && customer ? (
              /* ── User Logged In ── */
              <div className="relative ml-2" ref={userMenuRef}>
                <button
                  type="button"
                  onClick={() => setIsUserMenuOpen((prev) => !prev)}
                  className="flex items-center gap-2 rounded-xl px-2.5 py-1.5 transition-colors hover:bg-[#1E4752]/5 cursor-pointer"
                >
                  {/* Avatar with Gold ring */}
                  <div className="relative h-8 w-8 shrink-0 overflow-hidden rounded-full ring-2 ring-[#E8A700]">
                    {avatarUrl ? (
                      <img src={avatarUrl} alt={customer.fullName} className="h-full w-full object-cover" />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center bg-[#1E4752] text-xs font-bold text-[#E8A700] uppercase">
                        {customer.fullName.slice(0, 2)}
                      </div>
                    )}
                    <span className="absolute bottom-0 right-0 h-2 w-2 rounded-full bg-[#E8A700] ring-1 ring-white" />
                  </div>

                  {/* Greeting */}
                  <span className="hidden sm:inline text-xs font-bold text-[#1E4752]">
                    {customer.fullName.split(' ').slice(-1)[0]}
                  </span>
                  <ChevronDown className="h-3.5 w-3.5 text-[#1E4752]/60" />
                </button>

                {/* Dropdown */}
                {isUserMenuOpen && (
                  <div className="absolute right-0 top-full z-50 mt-2 w-60 overflow-hidden rounded-2xl border border-[#1E4752]/15 bg-white shadow-2xl">
                    {/* User info */}
                    <div className="flex items-center gap-3 border-b border-[#1E4752]/10 px-4 py-3 bg-[#1E4752]/3">
                      <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-full ring-1 ring-[#E8A700]">
                        {avatarUrl ? (
                          <img src={avatarUrl} alt={customer.fullName} className="h-full w-full object-cover" />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center bg-[#1E4752] text-sm font-bold text-[#E8A700] uppercase">
                            {customer.fullName.slice(0, 2)}
                          </div>
                        )}
                      </div>
                      <div className="min-w-0">
                        <p className="truncate text-xs font-bold text-[#1E4752]">{customer.fullName}</p>
                        <p className="truncate text-2xs text-[#1E4752]/60">{customer.email}</p>
                      </div>
                    </div>

                    <Link href="/home" className={dropdownItemClass} onClick={() => setIsUserMenuOpen(false)}>
                      <User className="h-4 w-4 text-[#1E4752]/60 shrink-0" />
                      <span>Hồ sơ cá nhân</span>
                    </Link>
                    <Link href="/booking-history" className={dropdownItemClass} onClick={() => setIsUserMenuOpen(false)}>
                      <ClipboardList className="h-4 w-4 text-[#1E4752]/60 shrink-0" />
                      <span>Đặt phòng của tôi</span>
                    </Link>
                    <div className="border-t border-[#1E4752]/10">
                      <button
                        type="button"
                        onClick={async () => {
                          setIsUserMenuOpen(false);
                          await customerLogout();
                        }}
                        className="flex w-full items-center gap-3 px-4 py-3 text-left text-xs font-bold text-red-600 transition-colors hover:bg-red-50 cursor-pointer"
                      >
                        <LogOut className="h-4 w-4 text-red-600 shrink-0" />
                        <span>Đăng xuất</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              /* ── Guest ── */
              <div className="flex items-center gap-2 ml-2">
                <Link
                  href="/customer-login"
                  className="flex items-center gap-1.5 rounded-xl border border-[#1E4752] px-3.5 py-1.5 text-xs font-bold text-[#1E4752] transition-colors hover:bg-[#1E4752]/5"
                >
                  <User className="h-3.5 w-3.5 text-[#1E4752] shrink-0" />
                  <span>Đăng nhập</span>
                </Link>

                <Link
                  href="/register"
                  className="rounded-xl bg-[#E8A700] hover:bg-[#E8A700]/90 px-4 py-1.5 text-xs font-extrabold text-[#1E4752] transition-colors shadow-xs"
                >
                  Đăng ký
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* ===== BOTTOM NAVIGATION MENU ===== */}
        <nav className="mt-2.5 flex flex-wrap items-center gap-1 border-t border-[#1E4752]/10 pt-2 text-xs font-bold text-[#1E4752]">
          {mainMenu.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.label}
                href={item.href}
                className={`relative px-3 py-1.5 rounded-lg transition-colors ${
                  isActive
                    ? 'text-[#E8A700] bg-[#1E4752]/5 font-extrabold'
                    : 'text-[#1E4752]/90 hover:text-[#E8A700] hover:bg-[#1E4752]/5'
                }`}
              >
                {item.label}
                {isActive && (
                  <span className="absolute bottom-0 left-3 right-3 h-0.5 bg-[#E8A700] rounded-full" />
                )}
              </Link>
            );
          })}

          {/* More Services Dropdown */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setIsMoreOpen((prev) => !prev)}
              className="flex items-center gap-1 rounded-lg px-3 py-1.5 text-[#1E4752]/90 transition-colors hover:text-[#E8A700] hover:bg-[#1E4752]/5 cursor-pointer"
            >
              <span>Thêm dịch vụ</span>
              <ChevronDown className="h-3.5 w-3.5 text-[#1E4752]/50" />
            </button>

            {isMoreOpen && (
              <div className="absolute left-0 top-full z-50 mt-2 w-56 overflow-hidden rounded-xl border border-[#1E4752]/15 bg-white shadow-xl">
                {moreMenu.map((item) => {
                  const ItemIcon = item.icon;
                  return (
                    <a
                      key={item.label}
                      href="#"
                      className={dropdownItemClass}
                      onClick={() => setIsMoreOpen(false)}
                    >
                      <ItemIcon className="h-4 w-4 text-[#E8A700] shrink-0" />
                      <span>{item.label}</span>
                    </a>
                  );
                })}
              </div>
            )}
          </div>
        </nav>
      </div>
    </header>
  );
}