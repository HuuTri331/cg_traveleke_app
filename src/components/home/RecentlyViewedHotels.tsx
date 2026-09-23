'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { ChevronLeft, ChevronRight, Clock, Star, MapPin, Eye } from 'lucide-react';
import { analyticsApi, type RecentlyViewedHotel } from '@/services/api/analytics.api';

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001';
const PLACEHOLDER_IMAGE = '/images/hotel-placeholder.png';

const getImageUrl = (url?: string | null) => {
  if (!url) return PLACEHOLDER_IMAGE;
  if (url.startsWith('http')) return url;
  return `${BACKEND_URL}${url}`;
};

const formatVND = (amount?: number | null) => {
  if (!amount) return 'Liên hệ';
  return (
    new Intl.NumberFormat('vi-VN', {
      style: 'decimal',
      maximumFractionDigits: 0,
    }).format(amount) + ' VND'
  );
};

export default function RecentlyViewedHotels() {
  const [hotels, setHotels] = useState<RecentlyViewedHotel[]>([]);
  const [loading, setLoading] = useState(true);
  const [startIndex, setStartIndex] = useState(0);

  useEffect(() => {
    const loadRecentlyViewed = async () => {
      try {
        setLoading(true);
        // 1. Thử lấy từ Backend API (theo IP / User)
        const apiHotels = await analyticsApi.getRecentlyViewed(10);

        // 2. Lấy thêm từ LocalStorage (đồng bộ tức thì phía client)
        let localHotels: RecentlyViewedHotel[] = [];
        if (typeof window !== 'undefined') {
          const raw = localStorage.getItem('traveleke_recently_viewed');
          if (raw) {
            try {
              localHotels = JSON.parse(raw);
            } catch {
              localHotels = [];
            }
          }
        }

        // Hợp nhất dữ liệu không trùng lặp
        const mergedMap = new Map<string, RecentlyViewedHotel>();
        localHotels.forEach((h) => mergedMap.set(String(h.hotelId), h));
        apiHotels.forEach((h) => mergedMap.set(String(h.hotelId), h));

        const mergedList = Array.from(mergedMap.values());
        setHotels(mergedList);
      } catch (err) {
        console.warn('Lỗi tải khách sạn đã xem:', err);
      } finally {
        setLoading(false);
      }
    };

    loadRecentlyViewed();
  }, []);

  if (!loading && hotels.length === 0) {
    return null; // Ẩn nếu người dùng mới tinh chưa xem khách sạn nào
  }

  const itemsPerPage = 4;
  const canNext = startIndex + itemsPerPage < hotels.length;
  const canPrev = startIndex > 0;

  const handleNext = () => {
    if (canNext) {
      setStartIndex((prev) => prev + 1);
    } else {
      setStartIndex(0);
    }
  };

  const handlePrev = () => {
    if (canPrev) {
      setStartIndex((prev) => prev - 1);
    }
  };

  const visibleHotels = hotels.slice(startIndex, startIndex + itemsPerPage);

  return (
    <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Tiêu đề mục */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-sky-100 text-sky-600 dark:bg-sky-900/40 dark:text-sky-400">
              <Clock className="h-5 w-5" />
            </span>
            <h2 className="text-xl sm:text-2xl font-black text-gray-900 dark:text-white">
              Khách Sạn Bạn Đã Xem Gần Đây
            </h2>
          </div>
          <p className="mt-1 text-xs sm:text-sm text-gray-500 dark:text-gray-400">
            Dễ dàng so sánh giá phòng và tiếp tục kế hoạch đặt phòng của bạn
          </p>
        </div>

        {/* Nút điều hướng Carousel */}
        {hotels.length > itemsPerPage && (
          <div className="flex items-center gap-2 self-end sm:self-center">
            <button
              onClick={handlePrev}
              disabled={!canPrev}
              aria-label="Previous"
              className={`flex h-9 w-9 items-center justify-center rounded-full border border-gray-200 bg-white shadow-xs transition-all hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:hover:bg-gray-700 ${
                !canPrev ? 'opacity-40 cursor-not-allowed' : 'hover:scale-105 active:scale-95'
              }`}
            >
              <ChevronLeft className="h-5 w-5 text-gray-700 dark:text-gray-200" />
            </button>
            <button
              onClick={handleNext}
              disabled={!canNext}
              aria-label="Next"
              className={`flex h-9 w-9 items-center justify-center rounded-full border border-gray-200 bg-white shadow-xs transition-all hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:hover:bg-gray-700 ${
                !canNext ? 'opacity-40 cursor-not-allowed' : 'hover:scale-105 active:scale-95'
              }`}
            >
              <ChevronRight className="h-5 w-5 text-gray-700 dark:text-gray-200" />
            </button>
          </div>
        )}
      </div>

      {/* Danh sách thẻ Khách sạn */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="h-72 rounded-2xl bg-gray-100 dark:bg-gray-800 animate-pulse"
            />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
          {visibleHotels.map((hotel) => (
            <Link
              key={hotel.hotelId}
              href={`/hotels_home/${hotel.hotelId}`}
              className="group flex flex-col overflow-hidden rounded-2xl border border-gray-200/80 bg-white shadow-xs transition-all duration-300 hover:-translate-y-1 hover:shadow-xl dark:border-gray-800 dark:bg-gray-900"
            >
              {/* Ảnh bìa */}
              <div className="relative h-44 w-full overflow-hidden bg-gray-100 dark:bg-gray-800">
                <img
                  src={getImageUrl(hotel.coverImageUrl)}
                  alt={hotel.name}
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = PLACEHOLDER_IMAGE;
                  }}
                />
                <div className="absolute top-2.5 left-2.5 flex items-center gap-1 rounded-full bg-black/60 px-2.5 py-1 text-[11px] font-semibold text-white backdrop-blur-xs">
                  <Eye className="h-3 w-3 text-sky-400" />
                  <span>Đã xem</span>
                </div>

                {hotel.starRating && (
                  <div className="absolute top-2.5 right-2.5 flex items-center gap-1 rounded-full bg-amber-500/90 px-2 py-0.5 text-[11px] font-bold text-white shadow-xs">
                    <Star className="h-3 w-3 fill-current" />
                    <span>{hotel.starRating} sao</span>
                  </div>
                )}
              </div>

              {/* Thông tin */}
              <div className="flex flex-1 flex-col p-4">
                <h3 className="line-clamp-1 text-base font-bold text-gray-900 group-hover:text-brand-500 dark:text-white transition-colors">
                  {hotel.name}
                </h3>

                <p className="mt-1 line-clamp-1 flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
                  <MapPin className="h-3.5 w-3.5 shrink-0 text-gray-400" />
                  <span>{hotel.address || 'Việt Nam'}</span>
                </p>

                <div className="mt-auto pt-3 border-t border-gray-100 dark:border-gray-800 flex items-end justify-between">
                  <div>
                    <span className="block text-[10px] text-gray-400">Giá mỗi đêm từ</span>
                    <span className="text-sm font-black text-brand-500">
                      {formatVND(hotel.minPricePerNight)}
                    </span>
                  </div>

                  <span className="rounded-lg bg-sky-50 px-2.5 py-1 text-xs font-semibold text-sky-600 group-hover:bg-brand-500 group-hover:text-white transition-all dark:bg-sky-950/60 dark:text-sky-300">
                    Xem lại
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </section>
  );
}
