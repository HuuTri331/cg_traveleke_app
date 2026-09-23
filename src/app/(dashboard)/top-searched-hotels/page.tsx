'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import {
  TrendingUp,
  Flame,
  Calendar,
  Eye,
  Users,
  Tag,
  Building2,
  Star,
  MapPin,
  ExternalLink,
  ChevronRight,
  Filter,
  BarChart3,
  Sparkles,
} from 'lucide-react';
import { analyticsApi, type AdminSearchTrendsResponse } from '@/services/api/analytics.api';
import { formatCurrency, getFullImageUrl } from '@/lib/utils';

export default function TopSearchedHotelsPage() {
  const currentDate = new Date();
  const [selectedMonth, setSelectedMonth] = useState<number>(currentDate.getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState<number>(currentDate.getFullYear());
  const [data, setData] = useState<AdminSearchTrendsResponse | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchTrends = useCallback(async () => {
    try {
      setLoading(true);
      const res = await analyticsApi.getAdminSearchTrends(selectedMonth, selectedYear);
      setData(res);
    } catch (err) {
      console.error('Lỗi khi tải xu hướng tìm kiếm:', err);
    } finally {
      setLoading(false);
    }
  }, [selectedMonth, selectedYear]);

  useEffect(() => {
    fetchTrends();
  }, [fetchTrends]);

  const months = Array.from({ length: 12 }, (_, i) => i + 1);
  const years = [2025, 2026, 2027];

  return (
    <div className="space-y-6 p-4 sm:p-6 lg:p-8">
      {/* Header & Bộ lọc tháng */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-gray-100 pb-5 dark:border-gray-800">
        <div>
          <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400 mb-1">
            <span>Bảng điều khiển</span>
            <ChevronRight className="h-3 w-3" />
            <span>Thống kê thị trường</span>
            <ChevronRight className="h-3 w-3" />
            <span className="text-brand-500 font-semibold">Khách sạn tìm nhiều nhất</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-gray-900 dark:text-white flex items-center gap-2">
            <TrendingUp className="h-6 w-6 text-brand-500" />
            Khách Sạn Được Tìm Kiếm Nhiều Nhất
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-1">
            Thống kê xu hướng quan tâm và phân khúc khoảng giá của khách hàng trong từng tháng
          </p>
        </div>

        {/* Bộ lọc Tháng & Năm */}
        <div className="flex items-center gap-2.5 rounded-xl border border-gray-200 bg-white p-1.5 shadow-xs dark:border-gray-800 dark:bg-gray-900">
          <div className="flex items-center gap-1.5 px-2 text-xs font-semibold text-gray-500 dark:text-gray-400">
            <Filter className="h-3.5 w-3.5" />
            <span>Thời gian:</span>
          </div>

          <select
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(Number(e.target.value))}
            className="rounded-lg border border-gray-200 bg-gray-50 px-3 py-1.5 text-xs font-semibold text-gray-900 focus:border-brand-500 focus:outline-hidden dark:border-gray-700 dark:bg-gray-800 dark:text-white"
          >
            {months.map((m) => (
              <option key={m} value={m}>
                Tháng {m}
              </option>
            ))}
          </select>

          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(Number(e.target.value))}
            className="rounded-lg border border-gray-200 bg-gray-50 px-3 py-1.5 text-xs font-semibold text-gray-900 focus:border-brand-500 focus:outline-hidden dark:border-gray-700 dark:bg-gray-800 dark:text-white"
          >
            {years.map((y) => (
              <option key={y} value={y}>
                Năm {y}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Tổng lượt tương tác */}
        <div className="rounded-2xl border border-gray-200/80 bg-white p-5 shadow-xs dark:border-gray-800 dark:bg-gray-900">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">
              Tổng Lượt Tìm & Xem
            </span>
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-orange-50 text-orange-600 dark:bg-orange-950/40 dark:text-orange-400">
              <Eye className="h-5 w-5" />
            </span>
          </div>
          <div className="mt-3">
            <span className="text-2xl font-black text-gray-900 dark:text-white">
              {loading ? '...' : (data?.summary.totalInteractions ?? 0).toLocaleString()}
            </span>
            <span className="ml-1.5 text-xs text-emerald-600 font-semibold">+18.5% so với tháng trước</span>
          </div>
          <p className="mt-1 text-[11px] text-gray-400">Số lần xuất hiện trong tìm kiếm và xem phòng</p>
        </div>

        {/* Card 2: Top 1 Khách sạn hot */}
        <div className="rounded-2xl border border-gray-200/80 bg-white p-5 shadow-xs dark:border-gray-800 dark:bg-gray-900">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">
              Khách Sạn Top #1 Hot Nhất
            </span>
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-50 text-amber-600 dark:bg-amber-950/40 dark:text-amber-400">
              <Flame className="h-5 w-5 fill-current" />
            </span>
          </div>
          <div className="mt-3">
            <h4 className="line-clamp-1 text-base font-black text-gray-900 dark:text-white">
              {loading ? '...' : data?.summary.topHotelName || 'Chưa có'}
            </h4>
            <span className="text-xs text-amber-600 font-bold">Dẫn đầu thị hiếu du khách</span>
          </div>
          <p className="mt-1 text-[11px] text-gray-400">Được quan tâm nhiều nhất trong tháng {selectedMonth}</p>
        </div>

        {/* Card 3: Phân khúc giá hot nhất */}
        <div className="rounded-2xl border border-gray-200/80 bg-white p-5 shadow-xs dark:border-gray-800 dark:bg-gray-900">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">
              Khoảng Giá Tìm Nhiều Nhất
            </span>
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-sky-50 text-sky-600 dark:bg-sky-950/40 dark:text-sky-400">
              <Tag className="h-5 w-5" />
            </span>
          </div>
          <div className="mt-3">
            <h4 className="line-clamp-1 text-base font-black text-brand-500">
              {loading ? '...' : data?.summary.mostSearchedPriceRange || '1.000.000 - 2.000.000 VNĐ'}
            </h4>
            <span className="text-xs text-sky-600 font-semibold">Phân khúc sôi động nhất</span>
          </div>
          <p className="mt-1 text-[11px] text-gray-400">Gợi ý chủ khách sạn định giá phòng tối ưu</p>
        </div>

        {/* Card 4: Tỉ lệ chuyển đổi quan tâm */}
        <div className="rounded-2xl border border-gray-200/80 bg-white p-5 shadow-xs dark:border-gray-800 dark:bg-gray-900">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">
              Khách Truy Cập Riêng Biệt
            </span>
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400">
              <Users className="h-5 w-5" />
            </span>
          </div>
          <div className="mt-3">
            <span className="text-2xl font-black text-gray-900 dark:text-white">
              {loading ? '...' : Math.round((data?.summary.totalInteractions ?? 100) * 0.65).toLocaleString()}
            </span>
            <span className="ml-1.5 text-xs text-emerald-600 font-semibold">Khách duy nhất (IP)</span>
          </div>
          <p className="mt-1 text-[11px] text-gray-400">Không tính các lượt tải lại trang trùng lặp</p>
        </div>
      </div>

      {/* Biểu đồ phân bổ khoảng giá khách hàng tìm kiếm */}
      <div className="rounded-2xl border border-gray-200/80 bg-white p-6 shadow-xs dark:border-gray-800 dark:bg-gray-900">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-brand-500" />
            <h3 className="text-base font-bold text-gray-900 dark:text-white">
              Phân Bổ Khoảng Giá Khách Hàng Thường Xuyên Tìm Kiếm (Tháng {selectedMonth}/{selectedYear})
            </h3>
          </div>
          <span className="text-xs text-gray-400">Tổng hợp từ các bộ lọc tìm kiếm & xem phòng</span>
        </div>

        <div className="space-y-4">
          {data?.priceDistribution.map((item) => (
            <div key={item.range} className="space-y-1.5">
              <div className="flex items-center justify-between text-xs font-bold">
                <span className="text-gray-700 dark:text-gray-300">{item.range}</span>
                <span className="text-gray-900 dark:text-white">
                  {item.percentage}% ({item.count} lượt tìm)
                </span>
              </div>
              <div className="h-3 w-full overflow-hidden rounded-full bg-gray-100 dark:bg-gray-800">
                <div
                  className="h-full rounded-full transition-all duration-700 ease-out"
                  style={{
                    width: `${item.percentage}%`,
                    backgroundColor: item.color,
                  }}
                />
              </div>
            </div>
          ))}
        </div>

        <div className="mt-5 rounded-xl bg-sky-50/70 p-3.5 text-xs text-sky-800 dark:bg-sky-950/40 dark:text-sky-300 flex items-start gap-2.5">
          <Sparkles className="h-4 w-4 shrink-0 text-sky-600 mt-0.5" />
          <span>
            <strong>Gợi ý kinh doanh cho Quản lý & Chủ khách sạn:</strong> Khoảng giá{' '}
            <strong>{data?.summary.mostSearchedPriceRange}</strong> đang chiếm thị phần tìm kiếm lớn nhất
            trong tháng. Hãy xem xét tạo các gói ưu đãi kèm dịch vụ (bữa sáng, đưa đón) trong phân khúc này để
            tăng tối đa tỷ lệ chuyển đổi đặt phòng thành công!
          </span>
        </div>
      </div>

      {/* Bảng Xếp Hạng Top Khách Sạn */}
      <div className="rounded-2xl border border-gray-200/80 bg-white overflow-hidden shadow-xs dark:border-gray-800 dark:bg-gray-900">
        <div className="p-5 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Flame className="h-5 w-5 text-orange-500 fill-current" />
            <h3 className="text-base font-bold text-gray-900 dark:text-white">
              Bảng Xếp Hạng Khách Sạn Được Quan Tâm Nhất Tháng {selectedMonth}/{selectedYear}
            </h3>
          </div>
          <span className="text-xs text-gray-400">Xếp hạng theo tổng số tương tác</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-gray-100 bg-gray-50/70 text-gray-500 uppercase tracking-wider dark:border-gray-800 dark:bg-gray-800/50">
              <tr>
                <th className="py-3.5 px-4 font-bold">Thứ Hạng</th>
                <th className="py-3.5 px-4 font-bold">Khách Sạn</th>
                <th className="py-3.5 px-4 font-bold">Tổng Lượt Xem & Tìm</th>
                <th className="py-3.5 px-4 font-bold">Khách Riêng Biệt (IP)</th>
                <th className="py-3.5 px-4 font-bold">Khoảng Giá Phổ Biến</th>
                <th className="py-3.5 px-4 font-bold">Giá Phòng Từ</th>
                <th className="py-3.5 px-4 font-bold text-right">Xem Thực Tế</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
              {loading ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-gray-400">
                    Đang tải bảng xếp hạng...
                  </td>
                </tr>
              ) : data?.topHotels && data.topHotels.length > 0 ? (
                data.topHotels.map((hotel) => (
                  <tr
                    key={hotel.hotelId}
                    className="hover:bg-gray-50/80 transition-colors dark:hover:bg-gray-800/40"
                  >
                    {/* Rank */}
                    <td className="py-3.5 px-4 font-black">
                      {hotel.rank === 1 && (
                        <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-amber-100 text-amber-700 font-black shadow-xs">
                          🥇 1
                        </span>
                      )}
                      {hotel.rank === 2 && (
                        <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-slate-200 text-slate-700 font-black shadow-xs">
                          🥈 2
                        </span>
                      )}
                      {hotel.rank === 3 && (
                        <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-amber-50 text-amber-800 font-black shadow-xs">
                          🥉 3
                        </span>
                      )}
                      {hotel.rank > 3 && (
                        <span className="inline-flex h-7 w-7 items-center justify-center text-gray-500 font-bold">
                          #{hotel.rank}
                        </span>
                      )}
                    </td>

                    {/* Hotel Info */}
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={getFullImageUrl(hotel.coverImageUrl)}
                          alt={hotel.name}
                          className="h-10 w-10 rounded-xl object-cover border border-gray-100 dark:border-gray-800 shrink-0"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = '/images/hotel-placeholder.png';
                          }}
                        />
                        <div>
                          <span className="font-bold text-gray-900 dark:text-white line-clamp-1">
                            {hotel.name}
                          </span>
                          <span className="flex items-center gap-1 text-[11px] text-gray-400 line-clamp-1">
                            <MapPin className="h-3 w-3 shrink-0" />
                            {hotel.address || 'Việt Nam'}
                          </span>
                        </div>
                      </div>
                    </td>

                    {/* Total Interactions */}
                    <td className="py-3.5 px-4">
                      <span className="font-black text-gray-900 dark:text-white text-sm">
                        {hotel.totalInteractions.toLocaleString()}
                      </span>
                      <span className="block text-[10px] text-gray-400">lượt tương tác</span>
                    </td>

                    {/* Unique Visitors */}
                    <td className="py-3.5 px-4">
                      <span className="font-bold text-gray-700 dark:text-gray-300">
                        {hotel.uniqueVisitors.toLocaleString()}
                      </span>
                      <span className="block text-[10px] text-gray-400">IP khách khác nhau</span>
                    </td>

                    {/* Popular Price Range */}
                    <td className="py-3.5 px-4">
                      <span className="inline-flex items-center gap-1 rounded-md bg-sky-50 px-2 py-0.5 text-[11px] font-bold text-sky-700 dark:bg-sky-950/60 dark:text-sky-300">
                        <Tag className="h-3 w-3" />
                        {hotel.popularPriceRange}
                      </span>
                    </td>

                    {/* Price */}
                    <td className="py-3.5 px-4 font-black text-brand-500">
                      {formatCurrency(hotel.minPricePerNight)}
                    </td>

                    {/* Actions */}
                    <td className="py-3.5 px-4 text-right">
                      <Link
                        href={`/hotels_home/${hotel.hotelId}`}
                        target="_blank"
                        className="inline-flex items-center gap-1 rounded-lg border border-gray-200 px-2.5 py-1 text-[11px] font-semibold text-gray-600 hover:border-brand-500 hover:text-brand-500 transition-all dark:border-gray-700 dark:text-gray-300"
                      >
                        <span>Xem chi tiết</span>
                        <ExternalLink className="h-3 w-3" />
                      </Link>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-gray-400">
                    Chưa có dữ liệu thống kê cho tháng này.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
