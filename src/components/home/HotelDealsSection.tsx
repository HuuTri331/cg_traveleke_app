'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { MapPin, Star } from 'lucide-react';
import { hotelSearchApi } from '@/services/api/hotel-search.api';
import type { HotelSearchItem } from '@/types/hotel-search';

const BACKEND_URL = 'http://localhost:3001';
const PLACEHOLDER_IMAGE = '/images/hotel-placeholder.png';

const getImageUrl = (url?: string | null) => {
  if (!url) return PLACEHOLDER_IMAGE;
  if (url.startsWith('http')) return url;
  return `${BACKEND_URL}${url}`;
};

const formatVND = (amount: number) => {
  return new Intl.NumberFormat('vi-VN', {
    style: 'decimal',
    maximumFractionDigits: 0,
  }).format(amount) + ' VND';
};

const getCityFromAddress = (address?: string | null): string => {
  if (!address) return 'Việt Nam';
  const lower = address.toLowerCase();
  if (lower.includes('hà nội') || lower.includes('ha noi')) return 'Hà Nội';
  if (lower.includes('đà nẵng') || lower.includes('da nang')) return 'Đà Nẵng';
  if (lower.includes('hồ chí minh') || lower.includes('tp. hcm') || lower.includes('sài gòn') || lower.includes('quận 1')) return 'TP. Hồ Chí Minh';
  if (lower.includes('vũng tàu')) return 'Vũng Tàu';
  if (lower.includes('nha trang')) return 'Nha Trang';
  if (lower.includes('đà lạt')) return 'Đà Lạt';
  if (lower.includes('phú quốc')) return 'Phú Quốc';
  const parts = address.split(',').map((p) => p.trim());
  return parts[parts.length - 1] || parts[0];
};

const getDistrictFromAddress = (address?: string | null): string => {
  if (!address) return 'Trung tâm';
  const parts = address.split(',').map((p) => p.trim());
  if (parts.length >= 2) {
    return parts[parts.length - 2] || parts[0];
  }
  return parts[0];
};

export default function HotelDealsSection() {
  const [activeTab, setActiveTab] = useState('Tất cả');
  const [apiHotels, setApiHotels] = useState<HotelSearchItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [scrollIndex, setScrollIndex] = useState(0);

  useEffect(() => {
    const fetchHotels = async () => {
      try {
        setLoading(true);
        const res = await hotelSearchApi.search({
          status: 'ACTIVE',
          page: 1,
          perPage: 20,
        });
        if (res?.data && res.data.length > 0) {
          setApiHotels(res.data);
        }
      } catch (err) {
        console.error('Error fetching deals hotels:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchHotels();
  }, []);

  // Dynamically extract tabs from real hotels in database
  const tabs = useMemo(() => {
    const citySet = new Set<string>();
    apiHotels.forEach((h) => {
      const city = getCityFromAddress(h.address);
      if (city) citySet.add(city);
    });
    return ['Tất cả', ...Array.from(citySet)];
  }, [apiHotels]);

  // Filter hotels by selected tab
  const filteredHotels = useMemo(() => {
    if (activeTab === 'Tất cả') return apiHotels;
    return apiHotels.filter((h) => getCityFromAddress(h.address) === activeTab);
  }, [apiHotels, activeTab]);

  const handleNext = () => {
    if (scrollIndex + 4 < filteredHotels.length) {
      setScrollIndex((prev) => prev + 1);
    } else {
      setScrollIndex(0);
    }
  };

  const handlePrev = () => {
    if (scrollIndex > 0) {
      setScrollIndex((prev) => prev - 1);
    } else {
      setScrollIndex(Math.max(0, filteredHotels.length - 4));
    }
  };

  return (
    <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Top Header: Title + Arrow */}
      <div className="flex items-center justify-between mb-4">
        <Link
          href="/hotels_home"
          className="group flex items-center gap-2 text-2xl font-extrabold text-gray-900 hover:text-[#0194f3] transition-colors"
        >
          <span>Top Deal Khách Sạn Nổi Bật</span>
          <span className="text-gray-400 group-hover:text-[#0194f3] group-hover:translate-x-1 transition-all text-xl font-bold">
            ›
          </span>
        </Link>
      </div>

      {/* Dynamic Pill Filter Tabs based strictly on database hotel locations */}
      {tabs.length > 1 && (
        <div className="flex items-center gap-2 overflow-x-auto pb-3 scrollbar-none mb-6">
          {tabs.map((tab) => {
            const isActive = tab === activeTab;
            return (
              <button
                key={tab}
                type="button"
                onClick={() => {
                  setActiveTab(tab);
                  setScrollIndex(0);
                }}
                className={`shrink-0 rounded-full px-4 py-1.5 text-sm font-semibold transition-all cursor-pointer ${
                  isActive
                    ? 'bg-[#0194f3] text-white shadow-xs'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {tab}
              </button>
            );
          })}
        </div>
      )}

      {/* Loading state */}
      {loading && (
        <div className="py-12 text-center text-gray-400 font-medium">
          Đang tải danh sách khách sạn ưu đãi...
        </div>
      )}

      {/* Empty state */}
      {!loading && filteredHotels.length === 0 && (
        <div className="rounded-2xl border border-gray-100 bg-white p-8 text-center text-gray-500">
          Chưa có khách sạn nào tại khu vực này.
        </div>
      )}

      {/* Hotel Cards Carousel / Grid */}
      {!loading && filteredHotels.length > 0 && (
        <div className="relative">
          {/* Left Arrow if scrolled */}
          {scrollIndex > 0 && (
            <button
              type="button"
              onClick={handlePrev}
              className="absolute -left-4 top-1/2 -translate-y-1/2 z-20 hidden lg:flex h-10 w-10 items-center justify-center rounded-full bg-white text-gray-700 shadow-xl border border-gray-100 hover:bg-gray-50 hover:text-[#0194f3] transition-all cursor-pointer"
              title="Khách sạn trước"
            >
              <span className="text-xl font-bold">‹</span>
            </button>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
            {filteredHotels.slice(scrollIndex, scrollIndex + 4).map((hotel, idx) => {
              const discountRate = [15, 25, 34, 10, 39, 45][(scrollIndex + idx) % 6];
              const basePrice = 320000 + ((scrollIndex + idx) * 85000);
              const origPrice = Math.round(basePrice / (1 - discountRate / 100));
              const score = (8.2 + ((scrollIndex + idx) % 12) * 0.1).toFixed(1);
              const reviewCount = 85 + (scrollIndex + idx) * 32;
              const locationPill = getDistrictFromAddress(hotel.address);

              return (
                <Link
                  key={hotel.id}
                  href={`/hotels_home/${hotel.id}`}
                  className="group flex h-full flex-col overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm transition-all duration-300 hover:shadow-xl hover:-translate-y-1 cursor-pointer"
                >
                  {/* Image Container */}
                  <div className="relative h-48 sm:h-52 w-full overflow-hidden bg-gray-100">
                    <img
                      src={getImageUrl(hotel.coverImageUrl)}
                      alt={hotel.name}
                      className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-500"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = PLACEHOLDER_IMAGE;
                      }}
                    />

                    {/* Top-left location pill */}
                    <div className="absolute top-2.5 left-2.5 flex items-center gap-1 rounded-md bg-[#1a4b75]/85 backdrop-blur-xs px-2.5 py-1 text-xs font-semibold text-white shadow-sm">
                      <MapPin className="h-3.5 w-3.5 text-white shrink-0" />
                      <span className="truncate max-w-[130px]">{locationPill}</span>
                    </div>

                    {/* Bottom-right discount tag */}
                    <div className="absolute bottom-0 right-0 rounded-tl-lg bg-[#ff5e1f] px-2.5 py-1 text-xs font-bold text-white shadow-md">
                      Save {discountRate}%
                    </div>
                  </div>

                  {/* Card Body */}
                  <div className="p-4 flex flex-1 flex-col justify-between">
                    <div>
                      {/* Hotel Name */}
                      <h3 className="font-bold text-gray-900 text-base line-clamp-1 group-hover:text-[#0194f3] transition-colors">
                        {hotel.name}
                      </h3>

                      {/* Star rating */}
                      <div className="mt-1 flex items-center gap-0.5 text-xs text-yellow-400">
                        {Array.from({ length: hotel.starRating ?? 4 }).map((_, i) => (
                          <Star key={i} className="h-3 w-3 fill-amber-400 text-amber-400" />
                        ))}
                      </div>

                      {/* Review rating score */}
                      <div className="mt-1.5 flex items-center gap-1.5 text-xs">
                        <span className="font-bold text-[#0194f3]">{score}/10</span>
                        <span className="text-gray-400">·</span>
                        <span className="text-gray-500">{reviewCount} đánh giá</span>
                      </div>

                      {/* Address */}
                      {hotel.address && (
                        <p className="mt-2 line-clamp-1 text-xs text-gray-500 flex items-center gap-1">
                          <MapPin className="h-3 w-3 text-gray-400 shrink-0" />
                          <span>{hotel.address}</span>
                        </p>
                      )}
                    </div>

                    {/* Prices */}
                    <div className="mt-3 pt-2 border-t border-gray-50 flex items-end justify-between gap-2">
                      <div>
                        <p className="text-xs text-gray-400 line-through">
                          {formatVND(origPrice)}
                        </p>
                        <p className="text-lg font-bold text-[#ff5e1f]">
                          {formatVND(basePrice)}
                        </p>
                      </div>

                      <span className="rounded-xl bg-[#0194f3] group-hover:bg-[#0080d4] text-white font-bold px-3 py-1.5 text-xs transition-colors shadow-xs">
                        Xem phòng
                      </span>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>

          {/* Right Floating Next Carousel Arrow */}
          {filteredHotels.length > 4 && (
            <button
              type="button"
              onClick={handleNext}
              className="absolute -right-4 top-1/2 -translate-y-1/2 z-20 hidden lg:flex h-10 w-10 items-center justify-center rounded-full bg-white text-gray-700 shadow-xl border border-gray-100 hover:bg-gray-50 hover:text-[#0194f3] transition-all cursor-pointer"
              title="Khách sạn tiếp theo"
            >
              <span className="text-xl font-bold">›</span>
            </button>
          )}
        </div>
      )}
    </section>
  );
}
