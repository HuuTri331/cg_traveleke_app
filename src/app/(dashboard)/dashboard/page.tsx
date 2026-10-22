'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Breadcrumb } from '@/components/dashboard/Breadcrumb';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { hotelsApi } from '@/services/api/hotels.api';
import { roomsApi } from '@/services/api/rooms.api';
import { bookingApi, DashboardStatistics } from '@/services/api/booking.api';
import { Hotel } from '@/types/hotel';
import { getFullImageUrl, formatCurrency } from '@/lib/utils';
import {
  Building2,
  BedDouble,
  CalendarCheck,
  TrendingUp,
  ArrowUpRight,
  Plus,
  Users,
  Compass,
  Star,
  Clock,
  Sparkles,
  Receipt,
  PhoneCall,
  Globe,
  Clock3,
  ShieldCheck,
  CheckCircle2,
} from 'lucide-react';

export default function DashboardPage() {
  const [statistics, setStatistics] = useState<DashboardStatistics | null>(null);
  const [recentHotels, setRecentHotels] = useState<Hotel[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [statsRes, hotelsRes] = await Promise.all([
          bookingApi.getStatistics().catch(() => ({ data: null })),
          hotelsApi.getAll({ perPage: 5 }).catch(() => ({ data: [], meta: { total: 0 } })),
        ]);

        if (statsRes.data) {
          setStatistics(statsRes.data);
        }
        setRecentHotels(hotelsRes.data || []);
      } catch (err) {
        console.error('Dashboard load error:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const stats = [
    {
      title: 'Tổng Khách Sạn',
      value: statistics?.totalHotels ?? 0,
      growth: '+100%',
      desc: 'cơ sở đang hoạt động',
      icon: <Building2 className="h-6 w-6 text-brand-500" />,
      bg: 'bg-brand-50 dark:bg-brand-500/15',
    },
    {
      title: 'Tổng Phòng Quản Lý',
      value: statistics?.totalRooms ?? 0,
      growth: '+100%',
      desc: 'đang mở phục vụ',
      icon: <BedDouble className="h-6 w-6 text-indigo-500" />,
      bg: 'bg-indigo-50 dark:bg-indigo-500/15',
    },
    {
      title: 'Lượt Đặt Phòng (Booking)',
      value: statistics?.totalBookings ?? 0,
      growth: `${statistics?.pendingBookings ?? 0} chờ xử lý`,
      desc: `${statistics?.checkedInBookings ?? 0} đang ở`,
      icon: <CalendarCheck className="h-6 w-6 text-green-500" />,
      bg: 'bg-green-50 dark:bg-green-500/15',
    },
    {
      title: 'Thực Thu (Đã Thanh Toán)',
      value: formatCurrency(statistics?.cashCollected ?? statistics?.totalRevenue ?? 0),
      growth: `${formatCurrency(statistics?.monthlyRevenue ?? 0)}/tháng`,
      desc: 'tiền thực tế sau đối soát',
      icon: <TrendingUp className="h-6 w-6 text-amber-500" />,
      bg: 'bg-amber-50 dark:bg-amber-500/15',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Breadcrumb & Welcome Title */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white tracking-tight">
            Tổng Quan Hệ Thống Traveleke
          </h1>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            Chào mừng trở lại, xem thống kê hoạt động lưu trú, doanh số lễ tân và ca trực
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Link href="/hotels">
            <Button size="sm" leftIcon={<Plus className="h-4 w-4" />}>
              Thêm Khách Sạn
            </Button>
          </Link>
          <Link href="/rooms">
            <Button size="sm" variant="outline" leftIcon={<BedDouble className="h-4 w-4" />}>
              Thêm Phòng
            </Button>
          </Link>
        </div>
      </div>

      {/* 4 Key Stat Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {stats.map((stat, i) => (
          <div
            key={i}
            className="rounded-2xl border border-gray-200 bg-white p-5 shadow-xs transition-all hover:shadow-md dark:border-gray-800 dark:bg-white/[0.03]"
          >
            <div className="flex items-center justify-between">
              <div
                className={`flex h-12 w-12 items-center justify-center rounded-2xl ${stat.bg}`}
              >
                {stat.icon}
              </div>
              <span className="flex items-center text-xs font-bold text-green-600 dark:text-green-400 gap-0.5">
                {stat.growth}
                <ArrowUpRight className="h-3.5 w-3.5" />
              </span>
            </div>

            <div className="mt-4">
              <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">
                {stat.title}
              </p>
              <h3 className="mt-1 text-2xl font-bold text-gray-900 dark:text-white">
                {loading ? '...' : stat.value}
              </h3>
              <p className="mt-1 text-xs-plus text-gray-400 font-medium">{stat.desc}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Sales Attribution & Operational Breakdown (Section 18 & 22) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-xs dark:border-gray-800 dark:bg-white/[0.03]">
          <div className="flex items-center justify-between text-xs font-medium text-gray-500">
            <span>Doanh Số Đã Chốt (Booked)</span>
            <Receipt className="h-4 w-4 text-brand-500" />
          </div>
          <div className="mt-2 text-lg font-bold text-gray-900 dark:text-white">
            {formatCurrency(statistics?.bookedSales ?? 0)}
          </div>
          <p className="text-[11px] text-gray-400 mt-0.5">Đơn xác nhận, đang ở và hoàn tất</p>
        </div>

        <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-xs dark:border-gray-800 dark:bg-white/[0.03]">
          <div className="flex items-center justify-between text-xs font-medium text-gray-500">
            <span>Doanh Thu Thực Hiện</span>
            <CheckCircle2 className="h-4 w-4 text-emerald-500" />
          </div>
          <div className="mt-2 text-lg font-bold text-gray-900 dark:text-white">
            {formatCurrency(statistics?.realizedRevenue ?? 0)}
          </div>
          <p className="text-[11px] text-gray-400 mt-0.5">Khách đã nhận phòng và lưu trú</p>
        </div>

        <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-xs dark:border-gray-800 dark:bg-white/[0.03]">
          <div className="flex items-center justify-between text-xs font-medium text-gray-500">
            <span>Bán Tại Quầy / Điện Thoại</span>
            <PhoneCall className="h-4 w-4 text-blue-500" />
          </div>
          <div className="mt-2 text-lg font-bold text-blue-600 dark:text-blue-400">
            {formatCurrency(statistics?.directFrontDeskSales ?? 0)}
          </div>
          <p className="text-[11px] text-gray-400 mt-0.5">Doanh số do Lễ tân trực tiếp chốt</p>
        </div>

        <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-xs dark:border-gray-800 dark:bg-white/[0.03]">
          <div className="flex items-center justify-between text-xs font-medium text-gray-500">
            <span>Kênh Trực Tuyến (Website)</span>
            <Globe className="h-4 w-4 text-purple-500" />
          </div>
          <div className="mt-2 text-lg font-bold text-purple-600 dark:text-purple-400">
            {formatCurrency(statistics?.websiteSales ?? 0)}
          </div>
          <p className="text-[11px] text-gray-400 mt-0.5">Khách tự đặt trực tuyến</p>
        </div>
      </div>

      {/* Main Grid: Recent Hotels List + Quick Navigation Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Hotels Table (2 Cols) */}
        <div className="lg:col-span-2 rounded-2xl border border-gray-200 bg-white p-5 shadow-xs dark:border-gray-800 dark:bg-white/[0.03]">
          <div className="flex items-center justify-between pb-4 border-b border-gray-100 dark:border-gray-800">
            <div>
              <h3 className="text-base font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <Building2 className="h-5 w-5 text-brand-500" />
                Khách Sạn Mới Cập Nhật
              </h3>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Danh sách các cơ sở lưu trú gần đây nhất
              </p>
            </div>
            <Link href="/hotels">
              <Button variant="ghost" size="sm">
                Xem tất cả
              </Button>
            </Link>
          </div>

          <div className="divide-y divide-gray-100 dark:divide-gray-800">
            {recentHotels.length === 0 ? (
              <div className="py-8 text-center text-xs text-gray-500">
                Chưa có dữ liệu khách sạn. Hãy bấm vào "Thêm Khách Sạn" để bắt đầu.
              </div>
            ) : (
              recentHotels.map((h) => (
                <div
                  key={h.id}
                  className="flex items-center justify-between py-3.5 hover:bg-gray-50/50 dark:hover:bg-gray-800/30 px-2 rounded-xl transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="h-11 w-11 rounded-xl overflow-hidden bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shrink-0">
                      <img
                        src={getFullImageUrl(h.coverImageUrl)}
                        alt={h.name}
                        className="h-full w-full object-cover"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src =
                            'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=150&q=80';
                        }}
                      />
                    </div>
                    <div>
                      <Link
                        href="/hotels"
                        className="text-xs font-bold text-gray-900 dark:text-white hover:text-brand-500 transition-colors"
                      >
                        {h.name}
                      </Link>
                      <p className="text-xs-plus text-gray-400 truncate max-w-xs">
                        {h.address}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="hidden sm:flex items-center gap-1 text-amber-400 text-xs font-bold">
                      <Star className="h-3.5 w-3.5 fill-amber-400" />
                      <span>{h.starRating || 0} sao</span>
                    </div>
                    <Badge variant={h.status === 'ACTIVE' ? 'success' : 'warning'} size="sm">
                      {h.status}
                    </Badge>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Quick Navigation & System Overview (1 Col) */}
        <div className="space-y-4">
          {/* AI Travel Trip Planner Banner */}
          <div className="rounded-2xl bg-gradient-to-br from-brand-600 to-indigo-700 p-5 text-white shadow-lg shadow-brand-500/20">
            <div className="flex items-center gap-2 text-brand-200 text-xs font-semibold uppercase tracking-wider mb-2">
              <Sparkles className="h-4 w-4 text-amber-300" />
              Traveleke Front Desk
            </div>
            <h4 className="text-base font-bold">
              Vận Hành & Điều Phối Lễ Tân
            </h4>
            <p className="mt-1 text-xs text-brand-100 leading-relaxed">
              Quản lý ca trực, bàn giao chênh quỹ, tiếp nhận booking quầy/điện thoại và duyệt hạn mức tài chính.
            </p>
            <div className="mt-4 flex gap-2">
              <Link href="/shifts" className="w-full">
                <button className="w-full rounded-xl bg-white/20 hover:bg-white/30 py-2 text-xs font-bold text-white transition-colors cursor-pointer">
                  Vào Ca Trực
                </button>
              </Link>
            </div>
          </div>

          {/* Quick Links Menu */}
          <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-xs dark:border-gray-800 dark:bg-white/[0.03] space-y-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-3 px-2">
              Lối Tắt Vận Hành Lễ Tân
            </h4>
            <Link
              href="/shifts"
              className="flex items-center justify-between p-2.5 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 text-xs font-medium text-gray-700 dark:text-gray-300 transition-colors"
            >
              <span className="flex items-center gap-2">
                <Clock3 className="h-4 w-4 text-emerald-500" /> Ca trực & Bàn giao ca
              </span>
              <span className="text-gray-400">→</span>
            </Link>
            <Link
              href="/approvals"
              className="flex items-center justify-between p-2.5 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 text-xs font-medium text-gray-700 dark:text-gray-300 transition-colors"
            >
              <span className="flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-amber-500" /> Hàng đợi duyệt hạn mức
              </span>
              <span className="text-gray-400">→</span>
            </Link>
            <Link
              href="/bookings"
              className="flex items-center justify-between p-2.5 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 text-xs font-medium text-gray-700 dark:text-gray-300 transition-colors"
            >
              <span className="flex items-center gap-2">
                <CalendarCheck className="h-4 w-4 text-green-500" /> Quản lý đơn đặt phòng
              </span>
              <span className="text-gray-400">→</span>
            </Link>
            <Link
              href="/staff-skills"
              className="flex items-center justify-between p-2.5 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 text-xs font-medium text-gray-700 dark:text-gray-300 transition-colors"
            >
              <span className="flex items-center gap-2">
                <Users className="h-4 w-4 text-indigo-500" /> Hồ sơ năng lực & Kỹ năng
              </span>
              <span className="text-gray-400">→</span>
            </Link>
            <Link
              href="/hotel-staff"
              className="flex items-center justify-between p-2.5 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 text-xs font-medium text-gray-700 dark:text-gray-300 transition-colors"
            >
              <span className="flex items-center gap-2">
                <Building2 className="h-4 w-4 text-brand-500" /> Nhân sự theo khách sạn
              </span>
              <span className="text-gray-400">→</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
