'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Star, MapPin, ChevronLeft, ChevronRight, ArrowRight, Trophy } from 'lucide-react';
import { analyticsApi, type TopHotelOfMonth } from '@/services/api/analytics.api';
import LuxurySectionHeader from '@/components/hotel-shared/LuxurySectionHeader';

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
    }).format(amount) + ' ₫'
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

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
      <LuxurySectionHeader
        eyebrow={`BẢNG XẾP HẠNG THÁNG ${currentMonth}/${currentYear}`}
        title="Top Khách Sạn Được Yêu Thích Nhất"
        subtitle="Những điểm đến ghi nhận lượt quan tâm và lựa chọn nghỉ dưỡng hàng đầu từ cộng đồng du khách."
        align="left"
        action={
          <div className="flex items-center gap-2">
            <button
              type="button"
              disabled={!canPrev}
              onClick={handlePrev}
              className="w-10 h-10 rounded-xl border border-[#1E4752]/20 text-[#1E4752] hover:bg-[#1E4752]/5 disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center transition-colors cursor-pointer"
              title="Trước"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              type="button"
              disabled={!canNext}
              onClick={handleNext}
              className="w-10 h-10 rounded-xl border border-[#1E4752]/20 text-[#1E4752] hover:bg-[#1E4752]/5 disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center transition-colors cursor-pointer"
              title="Sau"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        }
      />

      {loading && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 py-4">
          {[...Array(4)].map((_, i) => (
            <div
              key={i}
              className="rounded-2xl border border-[#1E4752]/10 p-4 space-y-3 animate-pulse bg-white"
            >
              <div className="h-48 bg-[#1E4752]/10 rounded-xl" />
              <div className="h-4 bg-[#1E4752]/10 rounded-md w-3/4" />
              <div className="h-3 bg-[#1E4752]/10 rounded-md w-1/2" />
            </div>
          ))}
        </div>
      )}

      {!loading && hotels.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {hotels.slice(startIndex, startIndex + itemsPerPage).map((hotel, idx) => {
            const rank = startIndex + idx + 1;
            const stars = hotel.starRating || 5;

            return (
              <Link
                key={hotel.hotelId}
                href={`/hotels_home/${hotel.hotelId}`}
                className="group flex flex-col h-full rounded-2xl bg-white border border-[#1E4752]/12 overflow-hidden shadow-xs hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
              >
                {/* Image with Rank Badge */}
                <div className="relative h-52 w-full overflow-hidden bg-[#1E4752]/5">
                  <img
                    src={getImageUrl(hotel.coverImageUrl)}
                    alt={hotel.name}
                    className="h-full w-full object-cover transition duration-700 group-hover:scale-105"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = PLACEHOLDER_IMAGE;
                    }}
                  />

                  {/* Rank Badge in Gold */}
                  <div className="absolute top-3 left-3 w-8 h-8 rounded-lg bg-[#E8A700] text-[#1E4752] flex items-center justify-center font-black text-xs shadow-md">
                    #{rank}
                  </div>

                  {/* Star Rating */}
                  <div className="absolute top-3 right-3 flex items-center gap-0.5 rounded-full bg-white/95 backdrop-blur-xs px-2.5 py-1 text-2xs font-extrabold text-[#1E4752] shadow-sm">
                    <Star className="w-3 h-3 text-[#E8A700] fill-[#E8A700]" />
                    <span>{stars} sao</span>
                  </div>
                </div>

                {/* Card Content */}
                <div className="flex flex-1 flex-col p-5 justify-between space-y-4">
                  <div className="space-y-1.5">
                    <h3 className="font-extrabold text-[#1E4752] text-base line-clamp-1 group-hover:text-[#E8A700] transition-colors">
                      {hotel.name}
                    </h3>

                    {hotel.address && (
                      <p className="line-clamp-1 text-xs text-[#1E4752]/65 flex items-center gap-1.5 font-normal">
                        <MapPin className="h-3.5 w-3.5 text-[#E8A700] shrink-0" />
                        <span>{hotel.address}</span>
                      </p>
                    )}
                  </div>

                  {/* Bottom Bar */}
                  <div className="pt-3 border-t border-[#1E4752]/10 flex items-center justify-between">
                    <div>
                      <span className="block text-2xs uppercase tracking-wider text-[#1E4752]/60 font-semibold">
                        Từ
                      </span>
                      <span className="text-sm font-black text-[#1E4752]">
                        {formatVND(hotel.minPricePerNight)}
                      </span>
                      {hotel.minPricePerNight && (
                        <span className="text-2xs text-[#1E4752]/60"> / đêm</span>
                      )}
                    </div>

                    <span className="inline-flex items-center gap-1 text-xs font-extrabold text-[#E8A700] group-hover:translate-x-0.5 transition-transform">
                      <span>Chi tiết</span>
                      <ArrowRight className="w-3.5 h-3.5 text-[#E8A700]" />
                    </span>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </section>
  );
}
