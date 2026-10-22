'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { MapPin, Star, ArrowRight, ChevronLeft, ChevronRight } from 'lucide-react';
import { hotelSearchApi } from '@/services/api/hotel-search.api';
import type { HotelSearchItem } from '@/types/hotel-search';
import LuxurySectionHeader from '@/components/hotel-shared/LuxurySectionHeader';

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001';
const PLACEHOLDER_IMAGE = '/images/hotel-placeholder.png';

const getImageUrl = (url?: string | null) => {
  if (!url) return PLACEHOLDER_IMAGE;
  if (url.startsWith('http')) return url;
  return `${BACKEND_URL}${url}`;
};

const formatVND = (amount: number) => {
  return (
    new Intl.NumberFormat('vi-VN', {
      style: 'decimal',
      maximumFractionDigits: 0,
    }).format(amount) + ' ₫'
  );
};

const getCityFromAddress = (address?: string | null): string => {
  if (!address) return 'Việt Nam';
  const lower = address.toLowerCase();
  if (lower.includes('hà nội') || lower.includes('ha noi')) return 'Hà Nội';
  if (lower.includes('đà nẵng') || lower.includes('da nang')) return 'Đà Nẵng';
  if (
    lower.includes('hồ chí minh') ||
    lower.includes('tp. hcm') ||
    lower.includes('sài gòn') ||
    lower.includes('quận 1')
  )
    return 'TP. Hồ Chí Minh';
  if (lower.includes('vũng tàu')) return 'Vũng Tàu';
  if (lower.includes('nha trang')) return 'Nha Trang';
  if (lower.includes('đà lạt')) return 'Đà Lạt';
  if (lower.includes('phú quốc')) return 'Phú Quốc';
  const parts = address.split(',').map((p) => p.trim());
  return parts[parts.length - 1] || parts[0];
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
        console.error('Lỗi tải danh sách khách sạn ưu đãi:', err);
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

  const itemsPerPage = 4;
  const canNext = scrollIndex + itemsPerPage < filteredHotels.length;
  const canPrev = scrollIndex > 0;

  const handleNext = () => {
    if (canNext) {
      setScrollIndex((prev) => prev + 1);
    } else {
      setScrollIndex(0);
    }
  };

  const handlePrev = () => {
    if (canPrev) {
      setScrollIndex((prev) => prev - 1);
    }
  };

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
      {/* Editorial Section Header */}
      <LuxurySectionHeader
        eyebrow="BỘ SƯU TẬP NỔI BẬT"
        title="Khách Sạn & Khu Nghỉ Dưỡng Tinh Tuyển"
        subtitle="Những điểm dừng chân với dịch vụ chỉn chu và tiện nghi xứng tầm được cộng đồng du khách tin chọn."
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

      {/* Dynamic City Filter Tabs */}
      {tabs.length > 1 && (
        <div className="flex items-center gap-2 overflow-x-auto pb-3 mb-8 no-scrollbar">
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
                className={`shrink-0 rounded-full px-4 py-1.5 text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
                  isActive
                    ? 'bg-[#1E4752] text-white shadow-xs'
                    : 'bg-[#1E4752]/5 text-[#1E4752]/75 hover:bg-[#1E4752]/10 hover:text-[#1E4752]'
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

      {/* Empty state */}
      {!loading && filteredHotels.length === 0 && (
        <div className="rounded-2xl border border-[#1E4752]/10 bg-white p-12 text-center text-[#1E4752]/60">
          Chưa có khách sạn nào tại điểm đến này.
        </div>
      )}

      {/* Real Hotels Cards Grid */}
      {!loading && filteredHotels.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {filteredHotels
            .slice(scrollIndex, scrollIndex + itemsPerPage)
            .map((hotel) => {
              const stars = hotel.starRating || 5;
              const minPrice = (hotel as any).minPricePerNight;

              return (
                <Link
                  key={hotel.id}
                  href={`/hotels_home/${hotel.id}`}
                  className="group flex flex-col h-full rounded-2xl bg-white border border-[#1E4752]/12 overflow-hidden shadow-xs hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
                >
                  {/* Hotel Image with Subtle Overlay */}
                  <div className="relative h-52 w-full overflow-hidden bg-[#1E4752]/5">
                    <img
                      src={getImageUrl(hotel.coverImageUrl)}
                      alt={hotel.name}
                      className="h-full w-full object-cover transition duration-700 group-hover:scale-105"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = PLACEHOLDER_IMAGE;
                      }}
                    />

                    {/* Star Rating Badge (Top Right) */}
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

                      {hotel.description && (
                        <p className="line-clamp-2 text-xs text-[#1E4752]/60 pt-1 leading-relaxed">
                          {hotel.description}
                        </p>
                      )}
                    </div>

                    {/* Bottom Price & CTA Bar */}
                    <div className="pt-3 border-t border-[#1E4752]/10 flex items-center justify-between">
                      {minPrice ? (
                        <div>
                          <span className="block text-2xs uppercase tracking-wider text-[#1E4752]/60 font-semibold">
                            Từ
                          </span>
                          <span className="text-sm font-black text-[#1E4752]">
                            {formatVND(minPrice)}
                          </span>
                          <span className="text-2xs text-[#1E4752]/60"> / đêm</span>
                        </div>
                      ) : (
                        <span className="text-xs font-semibold text-[#1E4752]/60">
                          Giá linh hoạt
                        </span>
                      )}

                      <span className="inline-flex items-center gap-1 text-xs font-extrabold text-[#E8A700] group-hover:translate-x-0.5 transition-transform">
                        <span>Xem phòng</span>
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
