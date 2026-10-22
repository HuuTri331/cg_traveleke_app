'use client';

import React, { useState, useEffect, useCallback, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import {
  MapPin,
  Star,
  ArrowRight,
  SlidersHorizontal,
  ChevronLeft,
  ChevronRight,
  Clock,
  Sparkles,
  Building,
} from 'lucide-react';

import Header from '@/components/common/HeaderCommon';
import Footer from '@/components/common/FooterCommon';
import LuxuryHotelSearch from '@/components/hotel-shared/LuxuryHotelSearch';
import {
  parseBookingQueryParams,
  buildBookingQueryString,
  BookingQueryParams,
} from '@/components/hotel-shared/BookingContextQuery';

import { hotelSearchApi } from '@/services/api/hotel-search.api';
import type { HotelSearchItem, HotelSearchMeta } from '@/types/hotel-search';

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

function HotelsListContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Booking Query Context
  const bookingParams = parseBookingQueryParams(searchParams);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedStar, setSelectedStar] = useState<number | undefined>(undefined);

  const [hotels, setHotels] = useState<HotelSearchItem[]>([]);
  const [meta, setMeta] = useState<HotelSearchMeta | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Fetch hotels for specific page
  const fetchHotelsPage = useCallback(
    async (pageToLoad: number, starFilter = selectedStar) => {
      try {
        setLoading(true);
        setError('');

        const res = await hotelSearchApi.search({
          keyword: bookingParams.keyword?.trim() || undefined,
          starRating: starFilter,
          status: 'ACTIVE',
          page: pageToLoad,
          perPage: 8,
        });

        if (res) {
          setHotels(res.data || []);
          setMeta(res.meta || null);
          setCurrentPage(pageToLoad);
        }
      } catch {
        setError('Không thể tải danh sách khách sạn. Vui lòng thử lại sau.');
      } finally {
        setLoading(false);
      }
    },
    [bookingParams.keyword, selectedStar],
  );

  useEffect(() => {
    let isMounted = true;
    const loadInitial = async () => {
      try {
        setLoading(true);
        setError('');

        const res = await hotelSearchApi.search({
          keyword: bookingParams.keyword?.trim() || undefined,
          starRating: selectedStar,
          status: 'ACTIVE',
          page: 1,
          perPage: 8,
        });

        if (isMounted && res) {
          setHotels(res.data || []);
          setMeta(res.meta || null);
          setCurrentPage(1);
        }
      } catch {
        if (isMounted) setError('Không thể tải danh sách khách sạn. Vui lòng thử lại sau.');
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    loadInitial();
    return () => {
      isMounted = false;
    };
  }, [bookingParams.keyword, selectedStar]);

  const handleSearchUpdate = (newParams: BookingQueryParams) => {
    const qStr = buildBookingQueryString(newParams);
    router.push(`/hotels_home${qStr}`);
  };

  const handleStarChange = (star: number | undefined) => {
    setSelectedStar(star);
  };

  return (
    <div className="luxury-site flex flex-col min-h-screen bg-white">
      {/* Sticky Header */}
      <div className="sticky top-0 z-50 w-full bg-white shadow-xs">
        <Header />
      </div>

      <main className="flex-1 pb-16">
        {/* Compact Search Header Banner */}
        <div className="bg-[#1E4752]/4 border-b border-[#1E4752]/10 py-6">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <LuxuryHotelSearch
              mode="compact"
              initialKeyword={bookingParams.keyword}
              initialCheckIn={bookingParams.checkInAt}
              initialCheckOut={bookingParams.checkOutAt}
              initialRoomCount={bookingParams.roomCount}
              initialGuests={bookingParams.totalGuests}
              onSearch={handleSearchUpdate}
            />
          </div>
        </div>

        {/* Breadcrumb & Results Meta Header */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 text-xs font-semibold text-[#1E4752]/60 mb-1">
                <Link href="/" className="hover:text-[#E8A700] transition-colors">
                  Trang chủ
                </Link>
                <span>/</span>
                <span className="text-[#1E4752] font-bold">Danh sách khách sạn</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-[#1E4752] tracking-tight">
                {bookingParams.keyword ? `Khách sạn tại "${bookingParams.keyword}"` : 'Bộ Sưu Tập Khách Sạn'}
              </h1>
            </div>

            {meta && !loading && (
              <p className="text-xs sm:text-sm font-semibold text-[#1E4752]/70">
                Tìm thấy <span className="font-extrabold text-[#1E4752]">{meta.total}</span> cơ sở lưu trú phù hợp
              </p>
            )}
          </div>
        </div>

        {/* Main Content Layout: Filters + Hotel List */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* ========================================================= */}
            {/* LEFT SIDEBAR: FILTERS */}
            {/* ========================================================= */}
            <aside className="lg:col-span-3 space-y-6">
              <div className="p-5 sm:p-6 rounded-2xl bg-white border border-[#1E4752]/12 shadow-xs space-y-6">
                <div className="flex items-center justify-between pb-3 border-b border-[#1E4752]/10">
                  <h3 className="text-sm font-extrabold text-[#1E4752] uppercase tracking-wider flex items-center gap-2">
                    <SlidersHorizontal className="w-4 h-4 text-[#E8A700]" />
                    <span>Bộ lọc tìm kiếm</span>
                  </h3>
                  {selectedStar !== undefined && (
                    <button
                      type="button"
                      onClick={() => handleStarChange(undefined)}
                      className="text-xs font-bold text-[#E8A700] hover:underline cursor-pointer"
                    >
                      Đặt lại
                    </button>
                  )}
                </div>

                {/* Filter: Star Rating */}
                <div className="space-y-3">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-[#1E4752]/80">
                    Hạng sao khách sạn
                  </h4>
                  <div className="space-y-2">
                    <button
                      type="button"
                      onClick={() => handleStarChange(undefined)}
                      className={`w-full px-3 py-2 rounded-xl text-xs font-bold text-left transition-colors flex items-center justify-between cursor-pointer ${
                        selectedStar === undefined
                          ? 'bg-[#1E4752] text-white'
                          : 'bg-[#1E4752]/5 text-[#1E4752] hover:bg-[#1E4752]/10'
                      }`}
                    >
                      <span>Tất cả hạng sao</span>
                    </button>

                    {[5, 4, 3].map((stars) => (
                      <button
                        key={stars}
                        type="button"
                        onClick={() => handleStarChange(stars)}
                        className={`w-full px-3 py-2 rounded-xl text-xs font-bold text-left transition-colors flex items-center justify-between cursor-pointer ${
                          selectedStar === stars
                            ? 'bg-[#1E4752] text-white'
                            : 'bg-[#1E4752]/5 text-[#1E4752] hover:bg-[#1E4752]/10'
                        }`}
                      >
                        <div className="flex items-center gap-1 text-[#E8A700]">
                          {Array.from({ length: stars }).map((_, i) => (
                            <Star key={i} className="w-3.5 h-3.5 fill-[#E8A700]" />
                          ))}
                        </div>
                        <span className="text-2xs font-semibold opacity-90">{stars} sao</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Platform Trust Highlight */}
                <div className="pt-4 border-t border-[#1E4752]/10 space-y-2 text-xs text-[#1E4752]/70">
                  <div className="flex items-center gap-2 text-[#1E4752] font-bold">
                    <Sparkles className="w-4 h-4 text-[#E8A700]" />
                    <span>Cam kết Traveleke</span>
                  </div>
                  <p className="text-2xs leading-relaxed">
                    Mọi khách sạn trong hệ thống đều cam kết phòng sạch chuẩn, đối soát giữ phòng tức thì qua VNPay.
                  </p>
                </div>
              </div>
            </aside>

            {/* ========================================================= */}
            {/* RIGHT COLUMN: HOTEL CARDS LIST */}
            {/* ========================================================= */}
            <div className="lg:col-span-9 space-y-6">
              {/* Loading Skeletons */}
              {loading && (
                <div className="space-y-4">
                  {[...Array(4)].map((_, i) => (
                    <div
                      key={i}
                      className="p-5 rounded-2xl border border-[#1E4752]/10 bg-white flex flex-col md:flex-row gap-6 animate-pulse"
                    >
                      <div className="w-full md:w-64 h-48 bg-[#1E4752]/10 rounded-xl shrink-0" />
                      <div className="flex-1 space-y-3 py-2">
                        <div className="h-5 bg-[#1E4752]/10 rounded-md w-3/4" />
                        <div className="h-4 bg-[#1E4752]/10 rounded-md w-1/2" />
                        <div className="h-12 bg-[#1E4752]/5 rounded-md w-full" />
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Error Message */}
              {!loading && error && (
                <div className="p-8 rounded-2xl border border-red-200 bg-red-50 text-center text-red-700 space-y-3">
                  <p className="text-sm font-bold">{error}</p>
                  <button
                    type="button"
                    onClick={() => fetchHotelsPage(1)}
                    className="px-4 py-2 bg-red-600 text-white rounded-xl text-xs font-bold hover:bg-red-700 cursor-pointer"
                  >
                    Thử lại
                  </button>
                </div>
              )}

              {/* Empty Results */}
              {!loading && !error && hotels.length === 0 && (
                <div className="p-12 rounded-2xl border border-[#1E4752]/12 bg-white text-center space-y-4">
                  <div className="w-16 h-16 rounded-full bg-[#1E4752]/5 text-[#1E4752] flex items-center justify-center mx-auto">
                    <Building className="w-8 h-8 opacity-40" />
                  </div>
                  <div className="space-y-1">
                    <h3 className="text-base font-extrabold text-[#1E4752]">
                      Không tìm thấy khách sạn phù hợp
                    </h3>
                    <p className="text-xs text-[#1E4752]/65 max-w-sm mx-auto">
                      Hãy thử thay đổi từ khóa tìm kiếm hoặc bỏ chọn bộ lọc hạng sao để có thêm kết quả.
                    </p>
                  </div>
                  {selectedStar !== undefined && (
                    <button
                      type="button"
                      onClick={() => handleStarChange(undefined)}
                      className="px-5 py-2.5 rounded-xl bg-[#1E4752] text-white text-xs font-bold hover:bg-[#1E4752]/90 cursor-pointer"
                    >
                      Bỏ chọn bộ lọc
                    </button>
                  )}
                </div>
              )}

              {/* Hotel Cards List (Horizontal Luxury Cards) */}
              {!loading && !error && hotels.length > 0 && (
                <div className="space-y-5">
                  {hotels.map((hotel) => {
                    const stars = hotel.starRating || 5;
                    const minPrice = hotel.minPricePerNight;

                    // Preserve booking context query params in detail link URL!
                    const detailHref = `/hotels_home/${hotel.id}${buildBookingQueryString(bookingParams, false)}`;

                    return (
                      <div
                        key={hotel.id}
                        className="group flex flex-col md:flex-row rounded-2xl bg-white border border-[#1E4752]/12 overflow-hidden shadow-xs hover:shadow-xl hover:border-[#1E4752]/30 transition-all duration-300"
                      >
                        {/* Hotel Image (~35-40% width on desktop) */}
                        <div className="relative md:w-72 lg:w-80 h-56 md:h-auto shrink-0 overflow-hidden bg-[#1E4752]/5">
                          <img
                            src={getImageUrl(hotel.coverImageUrl)}
                            alt={hotel.name}
                            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = PLACEHOLDER_IMAGE;
                            }}
                          />
                          <div className="absolute top-3 left-3 flex items-center gap-0.5 rounded-full bg-white/95 backdrop-blur-xs px-2.5 py-1 text-2xs font-extrabold text-[#1E4752] shadow-xs">
                            <Star className="w-3 h-3 text-[#E8A700] fill-[#E8A700]" />
                            <span>{stars} sao</span>
                          </div>
                        </div>

                        {/* Hotel Details (~60-65% width) */}
                        <div className="flex flex-1 flex-col justify-between p-5 sm:p-6 space-y-4">
                          <div className="space-y-2">
                            {/* Stars */}
                            <div className="flex items-center gap-1">
                              {Array.from({ length: stars }).map((_, i) => (
                                <Star key={i} className="w-3.5 h-3.5 text-[#E8A700] fill-[#E8A700]" />
                              ))}
                            </div>

                            {/* Name */}
                            <h2 className="text-lg sm:text-xl font-extrabold text-[#1E4752] tracking-tight group-hover:text-[#E8A700] transition-colors leading-snug">
                              <Link href={detailHref}>{hotel.name}</Link>
                            </h2>

                            {/* Address */}
                            {hotel.address && (
                              <p className="text-xs text-[#1E4752]/70 flex items-center gap-1.5 font-normal">
                                <MapPin className="w-3.5 h-3.5 text-[#E8A700] shrink-0" />
                                <span>{hotel.address}</span>
                              </p>
                            )}

                            {/* Description */}
                            {hotel.description && (
                              <p className="line-clamp-2 text-xs text-[#1E4752]/65 leading-relaxed pt-1">
                                {hotel.description}
                              </p>
                            )}

                            {/* Check-in / Check-out Schedule */}
                            <div className="pt-2 flex items-center gap-4 text-2xs text-[#1E4752]/60 font-semibold">
                              <span className="flex items-center gap-1">
                                <Clock className="w-3 h-3 text-[#1E4752]/50" />
                                <span>Nhận phòng: {hotel.checkInTime || '14:00'}</span>
                              </span>
                              <span>·</span>
                              <span>Trả phòng: {hotel.checkOutTime || '12:00'}</span>
                            </div>
                          </div>

                          {/* Price & CTA Action Bar */}
                          <div className="pt-4 border-t border-[#1E4752]/10 flex flex-wrap items-center justify-between gap-3">
                            <div>
                              {minPrice ? (
                                <div>
                                  <span className="text-2xs uppercase tracking-wider text-[#1E4752]/60 font-semibold block">
                                    Giá phòng từ
                                  </span>
                                  <span className="text-lg font-black text-[#1E4752]">
                                    {formatVND(minPrice)}
                                  </span>
                                  <span className="text-2xs text-[#1E4752]/60"> / đêm</span>
                                </div>
                              ) : (
                                <span className="text-xs font-bold text-[#1E4752]/60">
                                  Giá theo loại phòng
                                </span>
                              )}
                            </div>

                            <Link
                              href={detailHref}
                              className="px-5 py-2.5 rounded-xl bg-[#E8A700] hover:bg-[#E8A700]/90 text-[#1E4752] font-extrabold text-xs uppercase tracking-wider flex items-center gap-1.5 shadow-sm transition-all group/btn cursor-pointer"
                            >
                              <span>Xem phòng</span>
                              <ArrowRight className="w-3.5 h-3.5 group-hover/btn:translate-x-0.5 transition-transform" />
                            </Link>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Luxury Pagination */}
              {meta && meta.totalPages > 1 && (
                <div className="pt-8 flex items-center justify-center gap-2">
                  <button
                    type="button"
                    disabled={currentPage <= 1}
                    onClick={() => fetchHotelsPage(currentPage - 1)}
                    className="w-10 h-10 rounded-xl border border-[#1E4752]/15 text-[#1E4752] hover:bg-[#1E4752]/5 disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center transition-colors cursor-pointer"
                    title="Trang trước"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>

                  {Array.from({ length: meta.totalPages }).map((_, i) => {
                    const p = i + 1;
                    const isActive = p === currentPage;
                    return (
                      <button
                        key={p}
                        type="button"
                        onClick={() => fetchHotelsPage(p)}
                        className={`w-10 h-10 rounded-xl text-xs font-extrabold transition-colors cursor-pointer ${
                          isActive
                            ? 'bg-[#1E4752] text-white shadow-xs'
                            : 'border border-[#1E4752]/15 text-[#1E4752] hover:bg-[#1E4752]/5'
                        }`}
                      >
                        {p}
                      </button>
                    );
                  })}

                  <button
                    type="button"
                    disabled={currentPage >= meta.totalPages}
                    onClick={() => fetchHotelsPage(currentPage + 1)}
                    className="w-10 h-10 rounded-xl border border-[#1E4752]/15 text-[#1E4752] hover:bg-[#1E4752]/5 disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center transition-colors cursor-pointer"
                    title="Trang tiếp"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
}

export default function HotelsHomePage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-white" />}>
      <HotelsListContent />
    </Suspense>
  );
}