'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { ChevronLeft, ChevronRight, Star, MapPin, Eye, ArrowRight } from 'lucide-react';
import { analyticsApi, type RecentlyViewedHotel } from '@/services/api/analytics.api';
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

export default function RecentlyViewedHotels() {
  const [hotels, setHotels] = useState<RecentlyViewedHotel[]>([]);
  const [loading, setLoading] = useState(true);
  const [startIndex, setStartIndex] = useState(0);

  useEffect(() => {
    const loadRecentlyViewed = async () => {
      try {
        setLoading(true);
        const apiHotels = await analyticsApi.getRecentlyViewed(10);

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
    return null;
  }

  const itemsPerPage = 4;
  const canNext = startIndex + itemsPerPage < hotels.length;
  const canPrev = startIndex > 0;

  const handleNext = () => {
    if (canNext) setStartIndex((prev) => prev + 1);
  };

  const handlePrev = () => {
    if (canPrev) setStartIndex((prev) => prev - 1);
  };

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <LuxurySectionHeader
        eyebrow="LỊCH SỬ DU KHÁCH"
        title="Khách Sạn Bạn Đã Xem Gần Đây"
        subtitle="Tiếp tục khám phá và hoàn tất kế hoạch lưu trú cho điểm đến yêu thích của bạn."
        align="left"
        action={
          hotels.length > itemsPerPage && (
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
          )
        }
      />

      {loading && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <div
              key={i}
              className="rounded-2xl border border-[#1E4752]/10 p-4 space-y-3 animate-pulse bg-white"
            >
              <div className="h-44 bg-[#1E4752]/10 rounded-xl" />
              <div className="h-4 bg-[#1E4752]/10 rounded-md w-3/4" />
            </div>
          ))}
        </div>
      )}

      {!loading && hotels.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {hotels.slice(startIndex, startIndex + itemsPerPage).map((hotel) => {
            const stars = hotel.starRating || 5;

            return (
              <Link
                key={hotel.hotelId}
                href={`/hotels_home/${hotel.hotelId}`}
                className="group flex flex-col h-full rounded-2xl bg-white border border-[#1E4752]/12 overflow-hidden shadow-xs hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
              >
                <div className="relative h-44 w-full overflow-hidden bg-[#1E4752]/5">
                  <img
                    src={getImageUrl(hotel.coverImageUrl)}
                    alt={hotel.name}
                    className="h-full w-full object-cover transition duration-700 group-hover:scale-105"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = PLACEHOLDER_IMAGE;
                    }}
                  />
                  <div className="absolute top-3 left-3 flex items-center gap-1 rounded-full bg-white/95 backdrop-blur-xs px-2.5 py-0.5 text-2xs font-bold text-[#1E4752] border border-[#1E4752]/10 shadow-xs">
                    <Eye className="w-3 h-3 text-[#E8A700]" />
                    <span>Đã xem</span>
                  </div>
                </div>

                <div className="flex flex-1 flex-col p-4 justify-between space-y-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-0.5">
                      {Array.from({ length: stars }).map((_, i) => (
                        <Star key={i} className="w-3 h-3 text-[#E8A700] fill-[#E8A700]" />
                      ))}
                    </div>
                    <h3 className="font-extrabold text-[#1E4752] text-sm line-clamp-1 group-hover:text-[#E8A700] transition-colors">
                      {hotel.name}
                    </h3>
                    {hotel.address && (
                      <p className="line-clamp-1 text-2xs text-[#1E4752]/65 flex items-center gap-1">
                        <MapPin className="h-3 w-3 text-[#E8A700] shrink-0" />
                        <span>{hotel.address}</span>
                      </p>
                    )}
                  </div>

                  <div className="pt-2 border-t border-[#1E4752]/10 flex items-center justify-between text-xs font-extrabold text-[#1E4752]">
                    <span>{formatVND(hotel.minPricePerNight)}</span>
                    <span className="text-[#E8A700] text-2xs flex items-center gap-0.5 group-hover:translate-x-0.5 transition-transform">
                      <span>Xem lại</span>
                      <ArrowRight className="w-3 h-3" />
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
