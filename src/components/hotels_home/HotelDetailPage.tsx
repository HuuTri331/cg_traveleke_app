'use client';

import React, { useEffect, useState, useMemo, useRef, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import Header from '@/components/common/HeaderCommon';
import Footer from '@/components/common/FooterCommon';
import { hotelDetailApi, type HotelDetail } from '@/services/api/hotel-detail.api';
import type { Room } from '@/types/room';
import { useCustomerAuth } from '@/features/auth/context/CustomerAuthContext';
import { analyticsApi } from '@/services/api/analytics.api';
import {
  parseBookingQueryParams,
  buildBookingQueryString,
  getDefaultBookingDates,
  BookingQueryParams,
} from '@/components/hotel-shared/BookingContextQuery';

import {
  Star,
  MapPin,
  Clock,
  Maximize2,
  BedDouble,
  Users,
  Check,
  Phone,
  Mail,
  ShieldCheck,
  Calendar,
  X,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  ArrowRight,
  Info,
} from 'lucide-react';

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001';
const PLACEHOLDER_IMAGE = '/images/hotel-placeholder.png';
const ROOM_PLACEHOLDER = '/images/room-placeholder.png';

const getImageUrl = (url?: string | null) => {
  if (!url) return PLACEHOLDER_IMAGE;
  if (url.startsWith('http')) return url;
  return `${BACKEND_URL}${url}`;
};

const getRoomImageUrl = (url?: string | null) => {
  if (!url) return ROOM_PLACEHOLDER;
  if (url.startsWith('http')) return url;
  return `${BACKEND_URL}${url}`;
};

const formatVND = (amount: number | string | null | undefined) => {
  if (!amount) return '0 ₫';
  const num = typeof amount === 'string' ? parseFloat(amount) : amount;
  if (isNaN(num)) return '0 ₫';
  return (
    new Intl.NumberFormat('vi-VN', {
      style: 'decimal',
      maximumFractionDigits: 0,
    }).format(num) + ' ₫'
  );
};

// ============================================================================
// GALLERY LIGHTBOX MODAL
// ============================================================================
interface GalleryModalProps {
  images: string[];
  startIndex: number;
  onClose: () => void;
}

function GalleryModal({ images, startIndex, onClose }: GalleryModalProps) {
  const [current, setCurrent] = useState(startIndex);

  useEffect(() => {
    setCurrent(startIndex);
  }, [startIndex]);

  const nextImage = () => {
    if (images.length <= 1) return;
    setCurrent((c) => (c + 1) % images.length);
  };

  const prevImage = () => {
    if (images.length <= 1) return;
    setCurrent((c) => (c - 1 + images.length) % images.length);
  };

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') prevImage();
      if (e.key === 'ArrowRight') nextImage();
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [images.length, onClose]);

  const currentImg = images[current] || images[0] || PLACEHOLDER_IMAGE;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-[#1E4752]/90 backdrop-blur-md p-4"
      onClick={onClose}
    >
      <div className="relative w-full max-w-5xl mx-auto" onClick={(e) => e.stopPropagation()}>
        <button
          onClick={onClose}
          className="absolute -top-12 right-0 text-white text-sm font-bold hover:text-[#E8A700] flex items-center gap-1.5 cursor-pointer"
        >
          <X className="h-5 w-5" /> Đóng (ESC)
        </button>

        <div className="relative aspect-[16/10] overflow-hidden rounded-2xl bg-black flex items-center justify-center shadow-2xl border border-white/20">
          <img
            src={currentImg}
            alt={`Ảnh ${current + 1}`}
            className="h-full w-full object-contain select-none"
            onError={(e) => {
              (e.target as HTMLImageElement).src = PLACEHOLDER_IMAGE;
            }}
          />

          <div className="absolute bottom-4 right-4 rounded-full bg-[#1E4752]/80 backdrop-blur-xs px-3.5 py-1 text-xs font-bold text-white shadow">
            {current + 1} / {images.length}
          </div>

          {images.length > 1 && (
            <>
              <button
                type="button"
                onClick={prevImage}
                className="absolute left-4 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-white/20 text-white hover:bg-white hover:text-[#1E4752] flex items-center justify-center transition-all cursor-pointer"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>
              <button
                type="button"
                onClick={nextImage}
                className="absolute right-4 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-white/20 text-white hover:bg-white hover:text-[#1E4752] flex items-center justify-center transition-all cursor-pointer"
              >
                <ChevronRight className="w-6 h-6" />
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// ROOM CARD COMPONENT (Zero Fake Data, Date Continuity to Process Order)
// ============================================================================
interface HotelRoomCardProps {
  room: Room;
  hotel: HotelDetail;
  bookingParams: BookingQueryParams;
  isCustomerAuthenticated: boolean;
  onBookRoom: (room: Room) => void;
}

function HotelRoomCard({
  room,
  hotel,
  onBookRoom,
}: HotelRoomCardProps) {
  const [activeImgIdx, setActiveImgIdx] = useState(0);

  const roomImagesList = useMemo(() => {
    const list: string[] = [];
    if (room.coverImageUrl) list.push(getRoomImageUrl(room.coverImageUrl));
    if (Array.isArray(room.images)) {
      room.images.forEach((img) => {
        const url = getRoomImageUrl(img.imageUrl);
        if (!list.includes(url)) list.push(url);
      });
    }
    if (list.length === 0) list.push(ROOM_PLACEHOLDER);
    return list;
  }, [room]);

  const currentImg = roomImagesList[activeImgIdx] || ROOM_PLACEHOLDER;
  const priceNum = parseFloat(room.pricePerNight) || 0;

  return (
    <div className="rounded-3xl border border-[#1E4752]/12 bg-white overflow-hidden shadow-xs hover:shadow-xl hover:border-[#1E4752]/25 transition-all duration-300">
      <div className="flex flex-col lg:flex-row">
        {/* Left Column: Room Gallery & Specs (~35% width) */}
        <div className="lg:w-80 shrink-0 p-5 bg-[#1E4752]/2 border-b lg:border-b-0 lg:border-r border-[#1E4752]/10 flex flex-col justify-between">
          <div>
            {/* Image Slider */}
            <div className="relative h-48 w-full rounded-2xl overflow-hidden bg-[#1E4752]/5 group">
              <img
                src={currentImg}
                alt={room.name}
                className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = ROOM_PLACEHOLDER;
                }}
              />
              {roomImagesList.length > 1 && (
                <div className="absolute bottom-2.5 left-0 right-0 flex justify-center items-center gap-1.5 z-10">
                  {roomImagesList.slice(0, 5).map((_, dotIdx) => (
                    <button
                      key={dotIdx}
                      type="button"
                      onClick={() => setActiveImgIdx(dotIdx)}
                      className={`h-2 rounded-full transition-all cursor-pointer ${
                        dotIdx === activeImgIdx ? 'w-5 bg-[#E8A700]' : 'w-2 bg-white/80 hover:bg-white'
                      }`}
                      title={`Ảnh ${dotIdx + 1}`}
                    />
                  ))}
                </div>
              )}
            </div>

            {/* Room Specs */}
            <div className="mt-4 space-y-2 text-xs text-[#1E4752] font-semibold">
              <div className="flex items-center gap-2">
                <Maximize2 className="h-4 w-4 text-[#E8A700] shrink-0" />
                <span>Diện tích: {room.roomSize ? `${room.roomSize} m²` : 'Tiêu chuẩn'}</span>
              </div>
              <div className="flex items-center gap-2">
                <BedDouble className="h-4 w-4 text-[#E8A700] shrink-0" />
                <span>
                  {room.bedCount} {room.bedType || 'Giường đôi'}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-[#E8A700] shrink-0" />
                <span>
                  Tối đa: {room.maxAdults} người lớn
                  {room.maxChildren ? `, ${room.maxChildren} trẻ em` : ''}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Room Details & Choose Action (~65% width) */}
        <div className="flex-1 p-6 flex flex-col justify-between space-y-5">
          <div className="space-y-3">
            <h3 className="text-xl font-extrabold text-[#1E4752] tracking-tight">
              {room.name}
            </h3>

            {room.description && (
              <p className="text-xs text-[#1E4752]/70 leading-relaxed">
                {room.description}
              </p>
            )}

            {/* Inclusions & Highlights */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2 text-xs font-semibold text-[#1E4752]">
              <div className="flex items-center gap-2">
                <Check className="h-4 w-4 text-emerald-600 shrink-0" />
                <span>Bảo chứng giữ phòng ngay sau thanh toán</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="h-4 w-4 text-emerald-600 shrink-0" />
                <span>Hỗ trợ nhận phòng tại quầy 24/7</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="h-4 w-4 text-emerald-600 shrink-0" />
                <span>Thanh toán online VNPay bảo mật</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="h-4 w-4 text-emerald-600 shrink-0" />
                <span>Hủy phòng theo chính sách khách sạn</span>
              </div>
            </div>
          </div>

          {/* Pricing & Choose Room Action */}
          <div className="pt-4 border-t border-[#1E4752]/10 flex flex-wrap items-center justify-between gap-4">
            <div>
              <span className="block text-2xs uppercase tracking-wider text-[#1E4752]/60 font-semibold">
                Giá phòng mỗi đêm
              </span>
              <div className="flex items-baseline gap-1.5">
                <span className="text-2xl font-black text-[#1E4752]">
                  {formatVND(priceNum)}
                </span>
                <span className="text-xs text-[#1E4752]/60 font-normal">/ đêm (đã gồm thuế, phí)</span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => onBookRoom(room)}
              className="px-6 py-3 rounded-xl bg-[#E8A700] hover:bg-[#E8A700]/90 text-[#1E4752] font-extrabold text-xs uppercase tracking-wider flex items-center gap-2 shadow-md hover:shadow-lg transition-all cursor-pointer"
            >
              <span>Chọn phòng</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// MAIN HOTEL DETAIL PAGE COMPONENT
// ============================================================================
function HotelDetailContent({ hotelId }: { hotelId: string }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const defaults = getDefaultBookingDates();

  const { isCustomerAuthenticated } = useCustomerAuth();

  const [hotel, setHotel] = useState<HotelDetail | null>(null);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Gallery modal
  const [isGalleryOpen, setIsGalleryOpen] = useState(false);
  const [galleryStartIndex, setGalleryStartIndex] = useState(0);

  // Booking Query Context
  const [bookingParams, setBookingParams] = useState<BookingQueryParams>(() => {
    const parsed = parseBookingQueryParams(searchParams);
    return {
      keyword: parsed.keyword,
      checkInAt: parsed.checkInAt || defaults.defaultCheckInIso,
      checkOutAt: parsed.checkOutAt || defaults.defaultCheckOutIso,
      roomCount: parsed.roomCount || 1,
      totalGuests: parsed.totalGuests || 2,
    };
  });

  // Fetch hotel details and rooms
  useEffect(() => {
    let isMounted = true;
    setLoading(true);

    Promise.all([
      hotelDetailApi.getHotelDetail(hotelId).catch(() => null),
      hotelDetailApi.getRoomsOfHotel(hotelId).catch(() => []),
    ])
      .then(([hotelRes, roomsRes]) => {
        if (!isMounted) return;
        if (!hotelRes) {
          setError('Không tìm thấy thông tin khách sạn.');
          return;
        }
        setHotel(hotelRes);
        setRooms(Array.isArray(roomsRes) ? roomsRes : []);

        const minPrice =
          Array.isArray(roomsRes) && roomsRes.length > 0
            ? Math.min(...roomsRes.map((r) => parseFloat(r.pricePerNight) || 0))
            : undefined;

        // Analytics tracking
        analyticsApi.trackView(hotelRes.id, minPrice).catch(() => {});

        // Local storage recently viewed sync
        if (typeof window !== 'undefined') {
          try {
            const currentItem = {
              hotelId: hotelRes.id,
              name: hotelRes.name,
              slug: hotelRes.slug || '',
              address: hotelRes.address,
              starRating: hotelRes.starRating || 5,
              coverImageUrl: hotelRes.coverImageUrl,
              minPricePerNight: minPrice,
              lastViewedAt: new Date().toISOString(),
            };
            const raw = localStorage.getItem('traveleke_recently_viewed');
            let list: any[] = raw ? JSON.parse(raw) : [];
            list = list.filter((item: any) => String(item.hotelId) !== String(hotelRes.id));
            list.unshift(currentItem);
            localStorage.setItem('traveleke_recently_viewed', JSON.stringify(list.slice(0, 10)));
          } catch {}
        }
      })
      .catch((err) => {
        if (isMounted) setError(err.message || 'Lỗi tải dữ liệu khách sạn.');
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [hotelId]);

  // Gallery images array
  const galleryImages = useMemo(() => {
    const list: string[] = [];
    if (hotel?.coverImageUrl) list.push(getImageUrl(hotel.coverImageUrl));
    if (hotel?.images) {
      hotel.images.forEach((img) => {
        const u = getImageUrl(img.imageUrl);
        if (!list.includes(u)) list.push(u);
      });
    }
    rooms.forEach((r) => {
      if (r.coverImageUrl) {
        const u = getRoomImageUrl(r.coverImageUrl);
        if (!list.includes(u)) list.push(u);
      }
    });
    if (list.length === 0) list.push(PLACEHOLDER_IMAGE);
    return list;
  }, [hotel, rooms]);

  // Handle book room -> Section 10 & 45 state propagation
  const handleBookRoom = (room: Room) => {
    if (!hotel) return;

    const priceNum = parseFloat(room.pricePerNight) || 0;

    const pendingOrderData = {
      hotelId: hotel.id,
      hotelName: hotel.name,
      hotelAddress: hotel.address,
      hotelStar: hotel.starRating,
      hotelImage: hotel.images?.[0]?.imageUrl || hotel.coverImageUrl || null,
      roomId: room.id,
      roomName: room.name,
      roomPrice: priceNum,
      bedCount: room.bedCount,
      bedType: room.bedType,
      maxAdults: room.maxAdults,
      availableRooms: room.availableRooms,
      checkInTime: hotel.checkInTime || '14:00:00',
      checkOutTime: hotel.checkOutTime || '12:00:00',
      checkInAt: bookingParams.checkInAt,
      checkOutAt: bookingParams.checkOutAt,
      roomCount: bookingParams.roomCount,
      totalGuests: bookingParams.totalGuests,
      payOption: 'PREPAID',
    };

    if (typeof window !== 'undefined') {
      sessionStorage.setItem('traveleke_pending_order', JSON.stringify(pendingOrderData));
    }

    const queryStr = buildBookingQueryString(
      {
        checkInAt: bookingParams.checkInAt,
        checkOutAt: bookingParams.checkOutAt,
        roomCount: bookingParams.roomCount,
        totalGuests: bookingParams.totalGuests,
      },
      false,
    );

    const targetUrl = `/process-order?roomId=${room.id}&hotelId=${hotel.id}${queryStr.replace('?', '&')}`;

    if (!isCustomerAuthenticated) {
      router.push(`/customer-login?redirect=${encodeURIComponent(targetUrl)}`);
    } else {
      router.push(targetUrl);
    }
  };

  const handleUpdateBookingDates = (newParams: BookingQueryParams) => {
    setBookingParams((prev) => ({
      ...prev,
      ...newParams,
    }));
  };

  if (loading) {
    return (
      <div className="luxury-site flex flex-col min-h-screen bg-white">
        <Header />
        <div className="flex-1 flex flex-col items-center justify-center p-8 space-y-3">
          <div className="w-10 h-10 border-3 border-[#1E4752] border-t-transparent rounded-full animate-spin" />
          <p className="text-xs font-bold text-[#1E4752]/70 uppercase tracking-wider">
            Đang tải thông tin khách sạn...
          </p>
        </div>
        <Footer />
      </div>
    );
  }

  if (error || !hotel) {
    return (
      <div className="luxury-site flex flex-col min-h-screen bg-white">
        <Header />
        <div className="flex-1 max-w-2xl mx-auto px-4 py-20 text-center space-y-4">
          <p className="text-base font-bold text-red-600">{error || 'Không tìm thấy khách sạn.'}</p>
          <Link
            href="/hotels_home"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#1E4752] text-white text-xs font-bold uppercase tracking-wider"
          >
            Quay lại danh sách khách sạn
          </Link>
        </div>
        <Footer />
      </div>
    );
  }

  const stars = hotel.starRating || 5;

  return (
    <div className="luxury-site flex flex-col min-h-screen bg-white">
      {/* Sticky Header */}
      <div className="sticky top-0 z-50 w-full bg-white shadow-xs">
        <Header />
      </div>

      <main className="flex-1 pb-20">
        {/* Top Breadcrumb & Title Header */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-4">
          <div className="flex items-center gap-2 text-xs font-semibold text-[#1E4752]/60 mb-2">
            <Link href="/" className="hover:text-[#E8A700] transition-colors">
              Trang chủ
            </Link>
            <span>/</span>
            <Link href="/hotels_home" className="hover:text-[#E8A700] transition-colors">
              Khách sạn
            </Link>
            <span>/</span>
            <span className="text-[#1E4752] font-bold truncate max-w-md">{hotel.name}</span>
          </div>

          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <div className="flex items-center gap-1.5 mb-1.5">
                {Array.from({ length: stars }).map((_, i) => (
                  <Star key={i} className="w-4 h-4 text-[#E8A700] fill-[#E8A700]" />
                ))}
                <span className="text-xs font-bold text-[#E8A700] uppercase tracking-wider ml-1">
                  Tiêu chuẩn {stars} sao
                </span>
              </div>
              <h1 className="text-2xl sm:text-4xl font-extrabold text-[#1E4752] tracking-tight">
                {hotel.name}
              </h1>
              {hotel.address && (
                <p className="mt-1.5 text-xs sm:text-sm text-[#1E4752]/75 flex items-center gap-1.5 font-normal">
                  <MapPin className="w-4 h-4 text-[#E8A700] shrink-0" />
                  <span>{hotel.address}</span>
                </p>
              )}
            </div>

            <a
              href="#rooms"
              className="px-6 py-3 rounded-xl bg-[#E8A700] hover:bg-[#E8A700]/90 text-[#1E4752] font-extrabold text-xs uppercase tracking-wider shadow-md hover:shadow-lg transition-all self-start md:self-auto cursor-pointer"
            >
              Chọn phòng nghỉ
            </a>
          </div>
        </div>

        {/* ========================================================= */}
        {/* LUXURY 5-PHOTO EDITORIAL GALLERY */}
        {/* ========================================================= */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 h-[380px] sm:h-[460px] rounded-3xl overflow-hidden border border-[#1E4752]/12">
            {/* Main Featured Photo (60% width on desktop) */}
            <div
              className="lg:col-span-7 relative h-full overflow-hidden bg-[#1E4752]/5 cursor-pointer group"
              onClick={() => {
                setGalleryStartIndex(0);
                setIsGalleryOpen(true);
              }}
            >
              <img
                src={galleryImages[0]}
                alt={hotel.name}
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-103"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = PLACEHOLDER_IMAGE;
                }}
              />
            </div>

            {/* 4 Smaller Photos Grid (40% width on desktop) */}
            <div className="hidden lg:grid lg:col-span-5 grid-cols-2 gap-3 h-full">
              {[1, 2, 3, 4].map((idx) => {
                const img = galleryImages[idx] || galleryImages[0];
                const isLast = idx === 4;

                return (
                  <div
                    key={idx}
                    className="relative h-[224px] overflow-hidden bg-[#1E4752]/5 cursor-pointer group"
                    onClick={() => {
                      setGalleryStartIndex(idx);
                      setIsGalleryOpen(true);
                    }}
                  >
                    <img
                      src={img}
                      alt={`${hotel.name} ${idx}`}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = PLACEHOLDER_IMAGE;
                      }}
                    />
                    {isLast && (
                      <div className="absolute inset-0 bg-[#1E4752]/75 hover:bg-[#1E4752]/85 backdrop-blur-[1px] flex flex-col items-center justify-center text-white transition-colors">
                        <Sparkles className="w-5 h-5 text-[#E8A700] mb-1" />
                        <span className="text-xs font-extrabold uppercase tracking-wider text-white">
                          Xem tất cả ảnh
                        </span>
                        <span className="text-2xs text-white/70">({galleryImages.length} bức ảnh)</span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* ========================================================= */}
        {/* STICKY DATE & BOOKING CONFIRMATION STRIP */}
        {/* ========================================================= */}
        <div className="sticky top-16 z-30 bg-white/95 backdrop-blur-md border-y border-[#1E4752]/10 py-3 shadow-xs my-6">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-6 text-xs text-[#1E4752] font-bold">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-[#E8A700]" />
                  <span>
                    Nhận phòng:{' '}
                    <span className="font-extrabold">
                      {bookingParams.checkInAt ? new Date(bookingParams.checkInAt).toLocaleDateString('vi-VN') : 'Ngày mai'}
                    </span>
                  </span>
                </div>
                <span>·</span>
                <div>
                  <span>
                    Trả phòng:{' '}
                    <span className="font-extrabold">
                      {bookingParams.checkOutAt ? new Date(bookingParams.checkOutAt).toLocaleDateString('vi-VN') : 'Hôm sau'}
                    </span>
                  </span>
                </div>
                <span className="hidden sm:inline">·</span>
                <div className="hidden sm:flex items-center gap-1.5">
                  <Users className="w-4 h-4 text-[#E8A700]" />
                  <span>
                    {bookingParams.totalGuests} khách, {bookingParams.roomCount} phòng
                  </span>
                </div>
              </div>

              <a
                href="#rooms"
                className="px-4 py-2 rounded-xl bg-[#1E4752] hover:bg-[#1E4752]/90 text-white font-bold text-xs uppercase tracking-wider transition-colors cursor-pointer"
              >
                Kiểm tra & Chọn phòng
              </a>
            </div>
          </div>
        </div>

        {/* ========================================================= */}
        {/* OVERVIEW & ROOM SELECTION */}
        {/* ========================================================= */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
            {/* Left 70%: Description & Room Cards */}
            <div className="lg:col-span-8 space-y-10">
              {/* Hotel Overview */}
              <div className="space-y-4">
                <h2 className="text-xl font-extrabold text-[#1E4752] tracking-tight">
                  Tổng quan khách sạn
                </h2>
                <p className="text-sm text-[#1E4752]/75 leading-relaxed font-normal whitespace-pre-line">
                  {hotel.description ||
                    `${hotel.name} mang đến không gian nghỉ dưỡng tiện nghi, dịch vụ tận tâm và vị trí đắc địa thuận tiện cho hành trình khám phá.`}
                </p>

                {/* Check-in / Contact Box */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-5 rounded-2xl bg-[#1E4752]/3 border border-[#1E4752]/10 text-xs">
                  <div className="space-y-1.5">
                    <p className="font-bold text-[#1E4752] flex items-center gap-1.5">
                      <Clock className="w-4 h-4 text-[#E8A700]" />
                      <span>Giờ nhận / trả phòng</span>
                    </p>
                    <p className="text-[#1E4752]/70">
                      Nhận phòng từ: <strong>{hotel.checkInTime || '14:00'}</strong>
                    </p>
                    <p className="text-[#1E4752]/70">
                      Trả phòng trước: <strong>{hotel.checkOutTime || '12:00'}</strong>
                    </p>
                  </div>

                  <div className="space-y-1.5">
                    <p className="font-bold text-[#1E4752] flex items-center gap-1.5">
                      <Info className="w-4 h-4 text-[#E8A700]" />
                      <span>Thông tin liên hệ</span>
                    </p>
                    {hotel.phone && (
                      <p className="text-[#1E4752]/70 flex items-center gap-1.5">
                        <Phone className="w-3.5 h-3.5 text-[#E8A700]" />
                        <span>{hotel.phone}</span>
                      </p>
                    )}
                    {hotel.email && (
                      <p className="text-[#1E4752]/70 flex items-center gap-1.5">
                        <Mail className="w-3.5 h-3.5 text-[#E8A700]" />
                        <span>{hotel.email}</span>
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* ROOMS LIST SECTION */}
              <div id="rooms" className="space-y-6 pt-4 scroll-mt-28">
                <div className="flex items-center justify-between pb-3 border-b border-[#1E4752]/10">
                  <h2 className="text-2xl font-extrabold text-[#1E4752] tracking-tight">
                    Danh mục phòng nghỉ ({rooms.length})
                  </h2>
                  <span className="text-xs font-semibold text-[#1E4752]/60">
                    Giá phòng đã bao gồm đầy đủ thuế và phí
                  </span>
                </div>

                {rooms.length === 0 ? (
                  <div className="p-8 rounded-2xl border border-[#1E4752]/12 text-center text-[#1E4752]/60">
                    Hiện chưa có phòng nào khả dụng tại khách sạn này.
                  </div>
                ) : (
                  <div className="space-y-6">
                    {rooms.map((room) => (
                      <HotelRoomCard
                        key={room.id}
                        room={room}
                        hotel={hotel}
                        bookingParams={bookingParams}
                        isCustomerAuthenticated={isCustomerAuthenticated}
                        onBookRoom={handleBookRoom}
                      />
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Right 30%: Luxury Hotel Sticky Card & Policies */}
            <aside className="lg:col-span-4 space-y-6">
              <div className="sticky top-28 space-y-6">
                {/* Assurance Card */}
                <div className="p-6 rounded-3xl bg-white border border-[#1E4752]/15 shadow-md space-y-5">
                  <div className="flex items-center gap-3 pb-4 border-b border-[#1E4752]/10">
                    <div className="w-12 h-12 rounded-2xl bg-[#E8A700]/15 flex items-center justify-center shrink-0">
                      <ShieldCheck className="w-6 h-6 text-[#E8A700]" />
                    </div>
                    <div>
                      <h3 className="text-sm font-extrabold text-[#1E4752]">Cam Kết Dịch Vụ</h3>
                      <p className="text-xs text-[#1E4752]/65">Bảo chứng lưu trú Traveleke</p>
                    </div>
                  </div>

                  <div className="space-y-3 text-xs text-[#1E4752] font-semibold">
                    <div className="flex items-start gap-2.5">
                      <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                      <span>Xác nhận tức thì qua cổng thanh toán VNPay chính thức.</span>
                    </div>
                    <div className="flex items-start gap-2.5">
                      <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                      <span>Phòng được giữ độc quyền theo đúng thời gian bạn chọn.</span>
                    </div>
                    <div className="flex items-start gap-2.5">
                      <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                      <span>Hỗ trợ hủy phòng và hoàn tiền trực tiếp minh bạch.</span>
                    </div>
                  </div>

                  <a
                    href="#rooms"
                    className="w-full py-3 rounded-xl bg-[#1E4752] hover:bg-[#1E4752]/90 text-white font-bold text-xs uppercase tracking-wider transition-colors flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <span>Xem các loại phòng</span>
                    <ArrowRight className="w-4 h-4" />
                  </a>
                </div>

                {/* Policies & Location Card */}
                <div className="p-6 rounded-3xl bg-[#1E4752]/3 border border-[#1E4752]/10 space-y-4 text-xs">
                  <h4 className="font-extrabold text-[#1E4752] uppercase tracking-wider text-2xs">
                    Vị trí & Chỉ đường
                  </h4>
                  <p className="text-[#1E4752]/75 leading-relaxed">
                    {hotel.address || 'Đang cập nhật địa chỉ chính xác.'}
                  </p>
                  {hotel.latitude && hotel.longitude && (
                    <a
                      href={`https://www.google.com/maps/search/?api=1&query=${hotel.latitude},${hotel.longitude}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 font-bold text-[#E8A700] hover:underline"
                    >
                      <MapPin className="w-3.5 h-3.5" />
                      <span>Mở bản đồ Google Maps</span>
                    </a>
                  )}
                </div>
              </div>
            </aside>
          </div>
        </div>
      </main>

      {/* Gallery Lightbox Modal */}
      {isGalleryOpen && (
        <GalleryModal
          images={galleryImages}
          startIndex={galleryStartIndex}
          onClose={() => setIsGalleryOpen(false)}
        />
      )}

      {/* Footer */}
      <Footer />
    </div>
  );
}

export default function HotelDetailPage({
  hotelId: directHotelId,
  params,
}: {
  hotelId?: string;
  params?: Promise<{ id: string }> | { id: string };
}) {
  const [resolvedId, setResolvedId] = useState<string>(directHotelId || '');

  useEffect(() => {
    let active = true;
    if (!directHotelId && params) {
      Promise.resolve(params).then((resolved) => {
        if (active && resolved?.id) {
          setResolvedId(resolved.id);
        }
      });
    }
    return () => {
      active = false;
    };
  }, [directHotelId, params]);

  if (!resolvedId) {
    return <div className="min-h-screen bg-white" />;
  }

  return (
    <Suspense fallback={<div className="min-h-screen bg-white" />}>
      <HotelDetailContent hotelId={resolvedId} />
    </Suspense>
  );
}
