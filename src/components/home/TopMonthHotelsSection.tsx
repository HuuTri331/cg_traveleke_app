'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Flame, Star, MapPin, ChevronLeft, ChevronRight, Tag, ArrowRight } from 'lucide-react';
import { analyticsApi, type TopHotelOfMonth } from '@/services/api/analytics.api';

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

export default function TopMonthHotelsSection() {
  const [hotels, setHotels] = useState<TopHotelOfMonth[]>([]);
  const [loading, setLoading] = useState(true);
  const [startIndex, setStartIndex] = useState(0);

  const currentMonth = new Date().getMonth() + 1;
  const currentYear = new Date().getFullYear();

  useEffect(() => {
    const fetchTopHotels = async () => {
      try {
        setLoading(true);
        const data = await analyticsApi.getTopHotelsOfMonth(currentMonth, currentYear, 8);
        setHotels(data);
      } catch (err) {
        console.error('Lỗi lấy top khách sạn trong tháng:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchTopHotels();
  }, [currentMonth, currentYear]);

  if (!loading && hotels.length === 0) {
    return null;
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
    <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      {/* Tiêu đề mục */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-orange-100 text-orange-600 dark:bg-orange-950/50 dark:text-orange-400">
              <Flame className="h-5 w-5 fill-current animate-pulse" />
            </span>
            <h2 className="text-xl sm:text-2xl font-black text-gray-900 dark:text-white">
              Khách Sạn Được Tìm Kiếm Nhiều Nhất Tháng {currentMonth}/{currentYear}
            </h2>
          </div>
          <p className="mt-1 text-xs sm:text-sm text-gray-500 dark:text-gray-400">
            Dựa trên số lượt quan tâm, tìm kiếm và xem phòng thực tế của du khách trong tháng
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

      {/* Grid danh sách */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="h-80 rounded-2xl bg-gray-100 dark:bg-gray-800 animate-pulse"
            />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
          {visibleHotels.map((hotel) => (
            <Link
              key={hotel.hotelId}
              href={`/hotels_home/${hotel.hotelId}`}
              className="group relative flex flex-col overflow-hidden rounded-2xl border border-gray-200/80 bg-white shadow-xs transition-all duration-300 hover:-translate-y-1.5 hover:shadow-xl dark:border-gray-800 dark:bg-gray-900"
            >
              {/* Badge Xếp hạng Top */}
              <div className="absolute top-2.5 left-2.5 z-10 flex items-center gap-1.5 rounded-full bg-gradient-to-r from-orange-500 to-amber-500 px-3 py-1 text-xs font-black text-white shadow-md">
                <Flame className="h-3.5 w-3.5 fill-current" />
                <span>Top #{hotel.rank}</span>
              </div>

              {/* Lượt quan tâm badge */}
              <div className="absolute top-2.5 right-2.5 z-10 rounded-full bg-black/60 px-2.5 py-1 text-xs-plus font-semibold text-white backdrop-blur-xs">
                {hotel.totalInteractions} lượt xem
              </div>

              {/* Ảnh bìa */}
              <div className="relative h-48 w-full overflow-hidden bg-gray-100 dark:bg-gray-800">
                <img
                  src={getImageUrl(hotel.coverImageUrl)}
                  alt={hotel.name}
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = PLACEHOLDER_IMAGE;
                  }}
                />
              </div>

              {/* Thông tin */}
              <div className="flex flex-1 flex-col p-4">
                {/* Hạng sao & Khoảng giá phổ biến */}
                <div className="flex items-center justify-between gap-2 mb-1.5">
                  <div className="flex items-center gap-1 text-amber-500 text-xs font-bold">
                    <Star className="h-3.5 w-3.5 fill-current" />
                    <span>{hotel.starRating || 5} sao</span>
                  </div>

                  <span className="flex items-center gap-1 rounded-md bg-sky-50 px-2 py-0.5 text-xs-plus font-semibold text-sky-700 dark:bg-sky-950/60 dark:text-sky-300">
                    <Tag className="h-3 w-3 shrink-0" />
                    <span className="truncate max-w-[120px]">{hotel.popularPriceRange}</span>
                  </span>
                </div>

                <h3 className="line-clamp-1 text-base font-bold text-gray-900 group-hover:text-brand-500 dark:text-white transition-colors">
                  {hotel.name}
                </h3>

                <p className="mt-1 line-clamp-1 flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
                  <MapPin className="h-3.5 w-3.5 shrink-0 text-gray-400" />
                  <span>{hotel.address || 'Việt Nam'}</span>
                </p>

                {/* Chân thẻ */}
                <div className="mt-auto pt-3 border-t border-gray-100 dark:border-gray-800 flex items-end justify-between">
                  <div>
                    <span className="block text-2xs text-gray-400">Giá phòng từ</span>
                    <span className="text-base font-black text-brand-500">
                      {formatVND(hotel.minPricePerNight)}
                    </span>
                  </div>

                  <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-gray-100 text-gray-700 group-hover:bg-brand-500 group-hover:text-white transition-all dark:bg-gray-800 dark:text-gray-300">
                    <ArrowRight className="h-4 w-4" />
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
