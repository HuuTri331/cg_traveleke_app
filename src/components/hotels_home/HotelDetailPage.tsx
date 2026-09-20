'use client';

import { useEffect, useState, useCallback, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Header from '@/components/common/HeaderCommon';
import Footer from '@/components/common/FooterCommon';
import { hotelDetailApi, type HotelDetail } from '@/services/api/hotel-detail.api';
import type { Room } from '@/types/room';
import { useCustomerAuth } from '@/features/auth/context/CustomerAuthContext';

const BACKEND_URL = 'http://localhost:3001';

const getImageUrl = (url?: string | null) => {
  if (!url) return '/images/hotel-placeholder.png';
  if (url.startsWith('http')) return url;
  return `${BACKEND_URL}${url}`;
};

const getRoomImageUrl = (url?: string | null) => {
  if (!url) return '/images/room-placeholder.png';
  if (url.startsWith('http')) return url;
  return `${BACKEND_URL}${url}`;
};

const formatPrice = (price: string | number | null | undefined) => {
  if (!price) return '—';
  const num = typeof price === 'string' ? parseFloat(price) : price;
  if (isNaN(num)) return '—';
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(num);
};

const FACILITIES = [
  { icon: '❄️', label: 'AC' },
  { icon: '📶', label: 'WiFi' },
  { icon: '🍽️', label: 'Nhà hàng' },
  { icon: '🕐', label: 'Lễ tân 24h' },
  { icon: '🛗', label: 'Thang máy' },
  { icon: '🏊', label: 'Hồ bơi' },
  { icon: '🅿️', label: 'Bãi đỗ xe' },
  { icon: '🏋️', label: 'Phòng gym' },
];

const NEARBY_PLACES = [
  { icon: '📍', name: 'Bãi biển gần nhất', dist: '0.5 km' },
  { icon: '📍', name: 'Trung tâm thành phố', dist: '2.0 km' },
  { icon: '📍', name: 'Sân bay quốc tế', dist: '15.0 km' },
  { icon: '📍', name: 'Trung tâm thương mại', dist: '3.2 km' },
];

interface GalleryModalProps {
  images: string[];
  startIndex: number;
  onClose: () => void;
}

function GalleryModal({ images, startIndex, onClose }: GalleryModalProps) {
  const safeInitial = Math.max(0, Math.min(startIndex, Math.max(0, images.length - 1)));
  const [current, setCurrent] = useState(safeInitial);

  // Sync index when opening or when startIndex changes
  useEffect(() => {
    const valid = Math.max(0, Math.min(startIndex, Math.max(0, images.length - 1)));
    setCurrent(valid);
  }, [startIndex, images.length]);

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

  const currentImg = images[current] || images[0] || '/images/hotel-placeholder.png';

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm p-4"
      onClick={onClose}
    >
      <div className="relative w-full max-w-4xl mx-auto" onClick={(e) => e.stopPropagation()}>
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute -top-10 right-0 text-white text-sm font-semibold hover:text-gray-300 flex items-center gap-1.5 cursor-pointer"
        >
          <span>✕</span> Đóng (ESC)
        </button>

        {/* Main image container */}
        <div className="relative aspect-[16/10] overflow-hidden rounded-2xl bg-gray-950 flex items-center justify-center shadow-2xl border border-white/10">
          <img
            src={currentImg}
            alt={`Ảnh ${current + 1}`}
            className="h-full w-full object-contain select-none"
            onError={(e) => {
              (e.target as HTMLImageElement).src = '/images/hotel-placeholder.png';
            }}
          />

          {/* Counter pill */}
          <div className="absolute bottom-4 right-4 rounded-full bg-black/70 backdrop-blur-sm px-3.5 py-1 text-xs font-bold text-white shadow">
            {current + 1} / {images.length}
          </div>

          {/* Prev Button (Loops to last image if at beginning) */}
          {images.length > 1 && (
            <button
              type="button"
              onClick={prevImage}
              className="absolute left-4 top-1/2 -translate-y-1/2 flex h-12 w-12 items-center justify-center rounded-full bg-black/60 text-white hover:bg-black/85 hover:scale-105 transition-all text-2xl cursor-pointer select-none"
              title="Ảnh trước (vòng lặp)"
            >
              ‹
            </button>
          )}

          {/* Next Button (Loops to first image if at end) */}
          {images.length > 1 && (
            <button
              type="button"
              onClick={nextImage}
              className="absolute right-4 top-1/2 -translate-y-1/2 flex h-12 w-12 items-center justify-center rounded-full bg-black/60 text-white hover:bg-black/85 hover:scale-105 transition-all text-2xl cursor-pointer select-none"
              title="Ảnh tiếp theo (vòng lặp)"
            >
              ›
            </button>
          )}
        </div>

        {/* Thumbnails strip */}
        {images.length > 1 && (
          <div className="mt-3.5 flex gap-2 overflow-x-auto pb-1 scrollbar-none justify-center">
            {images.map((img, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => setCurrent(idx)}
                className={`shrink-0 h-14 w-20 sm:h-16 sm:w-24 overflow-hidden rounded-xl transition-all cursor-pointer ${
                  idx === current
                    ? 'ring-2 ring-blue-500 scale-105 opacity-100'
                    : 'opacity-50 hover:opacity-100 hover:scale-100'
                }`}
              >
                <img
                  src={img}
                  alt={`thumb-${idx}`}
                  className="h-full w-full object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = '/images/hotel-placeholder.png';
                  }}
                />
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

interface RoomCardProps {
  room: Room;
  hotel: HotelDetail;
}

function RoomCard({ room, hotel }: RoomCardProps) {
  const router = useRouter();
  const { isCustomerAuthenticated } = useCustomerAuth();
  const [imgError, setImgError] = useState(false);
  const [activeImgIdx, setActiveImgIdx] = useState(0);

  // Build room images list for slider dots
  const roomImagesList = useMemo(() => {
    const list: string[] = [];
    if (room.coverImageUrl) list.push(getRoomImageUrl(room.coverImageUrl));
    if (room.images && Array.isArray(room.images)) {
      room.images.forEach(img => {
        const u = getRoomImageUrl(img.imageUrl);
        if (u && !list.includes(u)) list.push(u);
      });
    }
    if (list.length === 0) list.push('/images/room-placeholder.png');
    return list;
  }, [room]);

  const currentImg = !imgError && roomImagesList[activeImgIdx]
    ? roomImagesList[activeImgIdx]
    : '/images/room-placeholder.png';

  const priceNum = parseFloat(room.pricePerNight) || 350000;
  const originalPrice = Math.round(priceNum * 1.35);

  const formatVND = (num: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'decimal',
      maximumFractionDigits: 0,
    }).format(num) + ' VND';
  };

  const handleBookRoom = (isPayAtHotel = false) => {
    const finalPrice = isPayAtHotel ? Math.round(priceNum * 1.05) : priceNum;
    const bookingData = {
      hotelId: hotel.id,
      hotelName: hotel.name,
      hotelAddress: hotel.address,
      hotelStar: hotel.starRating,
      hotelImage: hotel.images?.[0]?.imageUrl || null,
      roomId: room.id,
      roomName: room.name,
      roomPrice: finalPrice,
      bedCount: room.bedCount,
      bedType: room.bedType,
      maxAdults: room.maxAdults,
      availableRooms: room.availableRooms,
      checkInTime: hotel.checkInTime || '14:00:00',
      checkOutTime: hotel.checkOutTime || '12:00:00',
      payOption: isPayAtHotel ? 'PAY_AT_HOTEL' : 'PREPAID',
    };

    if (typeof window !== 'undefined') {
      sessionStorage.setItem('traveleke_pending_order', JSON.stringify(bookingData));
    }

    const targetUrl = `/process-order?roomId=${room.id}&hotelId=${hotel.id}`;
    if (!isCustomerAuthenticated) {
      router.push(`/customer-login?redirect=${encodeURIComponent(targetUrl)}`);
    } else {
      router.push(targetUrl);
    }
  };

  return (
    <div className="rounded-2xl border border-gray-200 bg-white shadow-xs overflow-hidden mb-6 transition-all hover:border-blue-200">
      {/* Top Banner Header */}
      <div className="bg-[#f2f8fc] px-5 py-3 border-b border-blue-50 flex items-center justify-between">
        <h3 className="text-base font-bold text-gray-900 tracking-tight">
          {room.name}
        </h3>
        {room.availableRooms <= 5 && room.availableRooms > 0 && (
          <span className="text-xs font-bold text-red-500 bg-red-50 px-2.5 py-0.5 rounded-full border border-red-100">
            {room.availableRooms} room(s) left!
          </span>
        )}
      </div>

      {/* 2-Column Body */}
      <div className="flex flex-col lg:flex-row">
        {/* Left Column: Image Slider + Specs + Amenities (~28-30% width) */}
        <div className="lg:w-80 shrink-0 p-4 border-b lg:border-b-0 lg:border-r border-gray-100 flex flex-col justify-between bg-white">
          <div>
            {/* Room Image Carousel with Dots */}
            <div className="relative h-44 w-full rounded-xl overflow-hidden bg-gray-100 group">
              <img
                src={currentImg}
                alt={room.name}
                className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                onError={() => setImgError(true)}
              />

              {/* Slider Dots */}
              {roomImagesList.length > 1 && (
                <div className="absolute bottom-2 left-0 right-0 flex justify-center items-center gap-1.5 z-10">
                  {roomImagesList.slice(0, 5).map((_, dotIdx) => (
                    <button
                      key={dotIdx}
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setActiveImgIdx(dotIdx);
                      }}
                      className={`h-2 rounded-full transition-all cursor-pointer ${
                        dotIdx === activeImgIdx
                          ? 'w-4 bg-white shadow-sm'
                          : 'w-2 bg-white/60 hover:bg-white/90'
                      }`}
                      title={`Ảnh ${dotIdx + 1}`}
                    />
                  ))}
                </div>
              )}
            </div>

            {/* Room Specs */}
            <div className="mt-3.5 space-y-1.5 text-xs text-gray-700 font-semibold">
              <div className="flex items-center gap-2">
                <span className="text-sm">📐</span>
                <span>{room.roomSize ? `${room.roomSize} m²` : '18.0 m²'}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm">🛏️</span>
                <span>{room.bedCount} {room.bedType || 'double bed'}</span>
              </div>
            </div>

            {/* Amenities Grid */}
            <div className="mt-3.5 grid grid-cols-2 gap-y-2 gap-x-1 border-t border-gray-100 pt-3 text-xs text-gray-600">
              <div className="flex items-center gap-1.5">
                <span>🚿</span>
                <span>Shower</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span>🧊</span>
                <span>Refrigerator</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span>♨️</span>
                <span>Hot water</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span>❄️</span>
                <span>Air conditioning</span>
              </div>
              <div className="flex items-center gap-1.5 col-span-2">
                <span>📶</span>
                <span>Free WiFi</span>
              </div>
            </div>
          </div>

          {/* Link at bottom: See Room Details */}
          <Link
            href={`/booking/${room.id}`}
            className="mt-4 pt-3 border-t border-gray-100 flex items-center gap-1.5 text-xs font-bold text-[#0194f3] hover:underline"
          >
            <span>🪟</span>
            <span>See Room Details</span>
          </Link>
        </div>

        {/* Right Column: Table Layout (~70-72% width) */}
        <div className="flex-1 overflow-x-auto">
          {/* Table Header */}
          <div className="min-w-[620px] grid grid-cols-[1fr_80px_150px_60px_120px] gap-2 px-5 py-2.5 bg-gray-50/90 border-b border-gray-100 text-xs font-bold text-gray-700">
            <span>Room Option(s)</span>
            <span className="text-center">Guest(s)</span>
            <span className="text-center">Price/room/night</span>
            <span className="text-center">Room</span>
            <span></span>
          </div>

          {/* Option Row 1: Without Breakfast (Free cancellation) */}
          <div className="min-w-[620px] grid grid-cols-[1fr_80px_150px_60px_120px] gap-2 px-5 py-4 items-center border-b border-gray-100 hover:bg-blue-50/20 transition-colors">
            {/* Col 1: Room Option */}
            <div>
              <p className="text-sm font-bold text-gray-900">Without Breakfast</p>
              <p className="mt-1 flex items-center gap-1.5 text-xs text-gray-500">
                <span>🛏️</span>
                <span>{room.bedCount} {room.bedType || 'double bed'}</span>
              </p>
              <p className="mt-1.5 flex items-center gap-1 text-xs font-semibold text-emerald-600">
                <span>✓</span>
                <span>Free Cancellation until 17 Oct 23:59</span>
                <span className="text-gray-400 text-[10px]">ⓘ</span>
              </p>
            </div>

            {/* Col 2: Guests */}
            <div className="flex justify-center items-center gap-0.5 text-gray-600">
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
              </svg>
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
              </svg>
            </div>

            {/* Col 3: Price */}
            <div className="text-center">
              <span className="inline-block rounded-full bg-[#fff1eb] px-2.5 py-0.5 text-[11px] font-bold text-[#ff5e1f] mb-1">
                Special for you!
              </span>
              <p className="text-xs text-gray-400 line-through">
                {formatVND(originalPrice)}
              </p>
              <p className="text-lg font-black text-[#ff5e1f]">
                {formatVND(priceNum)}
              </p>
              <p className="text-[10px] text-gray-400">
                Exclude taxes & fees
              </p>
            </div>

            {/* Col 4: Room Count */}
            <div className="text-center text-xs font-medium text-gray-600">
              x1
            </div>

            {/* Col 5: Action */}
            <div className="flex flex-col items-center justify-center">
              <button
                type="button"
                onClick={() => handleBookRoom(false)}
                className="w-24 rounded-lg bg-[#0194f3] hover:bg-[#0080d4] text-white font-bold text-sm py-2 shadow-xs transition-colors cursor-pointer text-center"
              >
                Choose
              </button>
              {room.availableRooms <= 5 && room.availableRooms > 0 && (
                <span className="mt-1 text-[11px] font-bold text-red-500 text-center leading-tight whitespace-nowrap">
                  {room.availableRooms} room(s) left!
                </span>
              )}
            </div>
          </div>

          {/* Option Row 2: Without Breakfast (Pay at Hotel) */}
          <div className="min-w-[620px] grid grid-cols-[1fr_80px_150px_60px_120px] gap-2 px-5 py-4 items-center hover:bg-blue-50/20 transition-colors">
            {/* Col 1: Room Option */}
            <div>
              <p className="text-sm font-bold text-gray-900">Without Breakfast</p>
              <p className="mt-1 flex items-center gap-1.5 text-xs text-gray-500">
                <span>🛏️</span>
                <span>{room.bedCount} {room.bedType || 'double bed'}</span>
              </p>
              <p className="mt-1.5 flex items-center gap-1 text-xs font-semibold text-[#0194f3]">
                <span>✓</span>
                <span>Pay at Hotel</span>
                <span className="text-gray-400 text-[10px]">ⓘ</span>
              </p>
              <p className="text-[11px] text-gray-500 pl-3">
                Pay when you check-in at the property
              </p>
              <p className="mt-0.5 flex items-center gap-1 text-xs text-gray-500">
                <span>✓</span>
                <span>Cancellation Policy Applies</span>
                <span className="text-gray-400 text-[10px]">ⓘ</span>
              </p>
            </div>

            {/* Col 2: Guests */}
            <div className="flex justify-center items-center gap-0.5 text-gray-600">
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
              </svg>
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
              </svg>
            </div>

            {/* Col 3: Price */}
            <div className="text-center">
              <span className="inline-block rounded-full bg-[#fff1eb] px-2.5 py-0.5 text-[11px] font-bold text-[#ff5e1f] mb-1">
                Special for you!
              </span>
              <p className="text-xs text-gray-400 line-through">
                {formatVND(Math.round(originalPrice * 1.05))}
              </p>
              <p className="text-lg font-black text-[#ff5e1f]">
                {formatVND(Math.round(priceNum * 1.05))}
              </p>
              <p className="text-[10px] text-gray-400">
                Exclude taxes & fees
              </p>
            </div>

            {/* Col 4: Room Count */}
            <div className="text-center text-xs font-medium text-gray-600">
              x1
            </div>

            {/* Col 5: Action */}
            <div className="flex flex-col items-center justify-center">
              <button
                type="button"
                onClick={() => handleBookRoom(true)}
                className="w-24 rounded-lg bg-[#0194f3] hover:bg-[#0080d4] text-white font-bold text-sm py-2 shadow-xs transition-colors cursor-pointer text-center"
              >
                Choose
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

interface HotelDetailPageProps {
  hotelId: string;
}

export default function HotelDetailPage({ hotelId }: HotelDetailPageProps) {
  const [hotel, setHotel] = useState<HotelDetail | null>(null);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [galleryOpen, setGalleryOpen] = useState(false);
  const [galleryStartIndex, setGalleryStartIndex] = useState(0);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const [hotelData, roomsData] = await Promise.all([
        hotelDetailApi.getHotelDetail(hotelId),
        hotelDetailApi.getRoomsOfHotel(hotelId),
      ]);
      setHotel(hotelData);
      setRooms(roomsData);
    } catch (err) {
      setError('Không thể tải thông tin khách sạn. Vui lòng thử lại.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [hotelId]);

  useEffect(() => { fetchData(); }, [fetchData]);

  // Build gallery images: Combine hotel's own images + images from all of its rooms
  const galleryImages = useMemo(() => {
    const list: string[] = [];

    const addUrl = (rawUrl?: string | null) => {
      if (!rawUrl) return;
      const url = getImageUrl(rawUrl);
      if (url && !list.includes(url)) {
        list.push(url);
      }
    };

    // 1. Hotel cover image
    addUrl(hotel?.coverImageUrl);

    // 2. Hotel album images
    if (hotel?.images && Array.isArray(hotel.images)) {
      [...hotel.images]
        .sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0))
        .forEach((img) => addUrl(img.imageUrl));
    }

    // 3. Room images from each room belonging to this hotel
    if (rooms && Array.isArray(rooms)) {
      rooms.forEach((room) => {
        addUrl(room.coverImageUrl);
        if (room.images && Array.isArray(room.images)) {
          [...room.images]
            .sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0))
            .forEach((img) => addUrl(img.imageUrl));
        }
      });
    }

    if (list.length === 0) {
      list.push('/images/hotel-placeholder.png');
    }
    return list;
  }, [hotel, rooms]);

  // Ensure at least 5 photos for the Traveloka 5-photo grid display
  const displayPhotos = useMemo(() => {
    const photos = [...galleryImages];
    const fallbacks = [
      'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1582719508461-905c673771fd?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1578683010236-d716f9a3f461?auto=format&fit=crop&w=800&q=80',
    ];
    let i = 0;
    while (photos.length < 5) {
      photos.push(fallbacks[i % fallbacks.length]);
      i++;
    }
    return photos;
  }, [galleryImages]);

  const openGallery = (index: number) => {
    const validIdx = Math.max(0, Math.min(index, galleryImages.length - 1));
    setGalleryStartIndex(validIdx);
    setGalleryOpen(true);
  };

  // Min price from rooms
  const minPrice = rooms.length > 0
    ? Math.min(...rooms.map(r => parseFloat(r.pricePerNight) || 0))
    : 352276;

  const locationName = hotel?.address ? hotel.address.split(',')[0].trim() : 'Ward 4';

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="flex flex-col items-center justify-center py-40 gap-4">
          <div className="h-12 w-12 rounded-full border-4 border-[#0194f3] border-t-transparent animate-spin" />
          <p className="text-gray-500 font-medium">Đang tải thông tin khách sạn...</p>
        </div>
        <Footer />
      </div>
    );
  }

  if (error || !hotel) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="flex flex-col items-center justify-center py-40 gap-4">
          <span className="text-5xl">😕</span>
          <p className="text-lg font-bold text-gray-700">{error || 'Không tìm thấy khách sạn'}</p>
          <Link href="/hotels_home" className="rounded-xl bg-[#0194f3] px-6 py-2.5 text-sm font-bold text-white hover:bg-[#0080d4]">
            ← Quay lại danh sách
          </Link>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      {/* ===== PHOTO GALLERY SECTION (TRAVELOKA STYLE) ===== */}
      <div className="max-w-7xl mx-auto px-4 pt-4 sm:pt-6">
        {/* Breadcrumb Trail */}
        <div className="flex flex-wrap items-center justify-between text-xs sm:text-sm text-gray-500 mb-3">
          <div className="flex items-center gap-1.5 flex-wrap">
            <Link href="/hotels_home" className="text-[#0194f3] hover:underline">Hotel</Link>
            <span>/</span>
            <span className="text-[#0194f3]">Hotels in Vietnam</span>
            <span>/</span>
            <span className="text-[#0194f3]">Hotels in Ho Chi Minh City</span>
            <span>/</span>
            <span className="text-[#0194f3]">Hotels in {locationName}</span>
            <span>/</span>
            <span className="text-gray-700 font-medium truncate max-w-[200px]">Hotel in {hotel.name}</span>
          </div>

          <Link
            href="/hotels_home"
            className="text-[#0194f3] hover:underline font-medium hidden md:inline-block"
          >
            See Other Accommodations in {locationName}
          </Link>
        </div>

        {/* 5-Photo Grid Layout */}
        <div className="grid grid-cols-4 grid-rows-2 gap-2 sm:gap-2.5 rounded-2xl overflow-hidden h-[380px] sm:h-[440px] md:h-[480px]">
          {/* Main Large Photo on Left (50% width) */}
          <div
            className="col-span-2 row-span-2 relative cursor-pointer group overflow-hidden bg-gray-100"
            onClick={() => openGallery(0)}
          >
            <img
              src={displayPhotos[0]}
              alt={hotel.name}
              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
              onError={(e) => {
                (e.target as HTMLImageElement).src = '/images/hotel-placeholder.png';
              }}
            />
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
          </div>

          {/* Sub Photo 1 (Top-mid) */}
          <div
            className="col-span-1 row-span-1 relative cursor-pointer group overflow-hidden bg-gray-100"
            onClick={() => openGallery(1)}
          >
            <img
              src={displayPhotos[1]}
              alt={`${hotel.name} - 2`}
              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
              onError={(e) => {
                (e.target as HTMLImageElement).src = '/images/hotel-placeholder.png';
              }}
            />
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
          </div>

          {/* Sub Photo 2 (Top-right) */}
          <div
            className="col-span-1 row-span-1 relative cursor-pointer group overflow-hidden bg-gray-100"
            onClick={() => openGallery(2)}
          >
            <img
              src={displayPhotos[2]}
              alt={`${hotel.name} - 3`}
              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
              onError={(e) => {
                (e.target as HTMLImageElement).src = '/images/hotel-placeholder.png';
              }}
            />
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
          </div>

          {/* Sub Photo 3 (Bottom-mid) */}
          <div
            className="col-span-1 row-span-1 relative cursor-pointer group overflow-hidden bg-gray-100"
            onClick={() => openGallery(3)}
          >
            <img
              src={displayPhotos[3]}
              alt={`${hotel.name} - 4`}
              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
              onError={(e) => {
                (e.target as HTMLImageElement).src = '/images/hotel-placeholder.png';
              }}
            />
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
          </div>

          {/* Sub Photo 4 (Bottom-right) with "See All Photos" button */}
          <div
            className="col-span-1 row-span-1 relative cursor-pointer group overflow-hidden bg-gray-100"
            onClick={() => openGallery(4)}
          >
            <img
              src={displayPhotos[4]}
              alt={`${hotel.name} - 5`}
              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
              onError={(e) => {
                (e.target as HTMLImageElement).src = '/images/hotel-placeholder.png';
              }}
            />
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />

            {/* See All Photos Button Overlay (with grid icon on left) */}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                openGallery(4);
              }}
              className="absolute bottom-3 right-3 sm:bottom-4 sm:right-4 flex items-center gap-2 bg-black/65 hover:bg-black/85 backdrop-blur-xs text-white text-xs sm:text-sm font-semibold px-3.5 py-2 rounded-lg border border-white/20 shadow-md cursor-pointer transition-all hover:scale-105 z-10"
            >
              <svg className="w-4 h-4 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="3" width="7" height="7"></rect>
                <rect x="14" y="3" width="7" height="7"></rect>
                <rect x="14" y="14" width="7" height="7"></rect>
                <rect x="3" y="14" width="7" height="7"></rect>
              </svg>
              <span>See All Photos</span>
            </button>
          </div>
        </div>

        {/* ===== SUMMARY CARD (BELOW PHOTO GRID) ===== */}
        <div className="rounded-2xl bg-white shadow-sm border border-gray-100 p-5 sm:p-6 mt-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          {/* Left: Name, Hotels Badge, Stars, Address */}
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight">
              {hotel.name}
            </h1>

            <div className="mt-2.5 flex items-center gap-2.5 flex-wrap">
              <span className="rounded-md bg-[#eaf4ff] px-2.5 py-0.5 text-xs font-bold text-[#0194f3]">
                Hotels
              </span>
              <div className="flex items-center text-yellow-400 text-sm">
                {Array.from({ length: hotel.starRating ?? 3 }).map((_, i) => (
                  <span key={i}>★</span>
                ))}
              </div>
              {hotel.address && (
                <span className="text-xs text-gray-500">
                  📍 {hotel.address}
                </span>
              )}
            </div>
          </div>

          {/* Right: Starts from price + View Rooms button */}
          <div className="flex flex-col sm:items-end gap-1.5 w-full sm:w-auto pt-3 sm:pt-0 border-t sm:border-t-0 border-gray-100">
            <div className="text-left sm:text-right">
              <p className="text-xs text-gray-400 font-medium">Price/room/night starts from</p>
              <p className="text-2xl sm:text-3xl font-black text-[#ff5e1f]">
                {formatPrice(minPrice)}
              </p>
            </div>
            <a
              href="#available-rooms"
              className="flex items-center justify-center rounded-xl bg-[#0194f3] hover:bg-[#0080d4] px-7 py-2.5 text-sm font-bold text-white shadow-md transition-all cursor-pointer w-full sm:w-auto text-center"
            >
              View Rooms
            </a>
          </div>
        </div>
      </div>

      {/* ===== URGENT BANNER ===== */}
      {rooms.length > 0 && rooms.some(r => r.availableRooms <= 5 && r.availableRooms > 0) && (
        <div className="max-w-screen-xl mx-auto px-4 mt-4">
          <div className="rounded-xl bg-blue-50 border border-blue-100 px-5 py-3.5 flex items-center gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-yellow-400 text-yellow-900 font-bold text-sm">
              ⏱
            </div>
            <p className="text-sm font-semibold text-blue-800">
              Đừng bỏ lỡ! Chỉ còn{' '}
              <span className="text-blue-600 font-extrabold">
                {Math.min(...rooms.filter(r => r.availableRooms > 0).map(r => r.availableRooms))} phòng
              </span>{' '}
              với mức giá thấp nhất.
            </p>
          </div>
        </div>
      )}

      {/* ===== 3-COLUMN SECTION ===== */}
      <div className="max-w-screen-xl mx-auto px-4 mt-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Col 1: Reviews (empty – no module yet) */}
          <div className="rounded-2xl bg-white shadow-sm border border-gray-100 p-6">
            <div className="flex items-end gap-2 mb-1">
              <span className="text-4xl font-extrabold text-gray-900">—</span>
              <span className="text-lg text-gray-500 mb-1">/10</span>
            </div>
            <p className="text-sm font-bold text-gray-500">Chưa có đánh giá</p>
            <p className="mt-4 text-sm font-bold text-gray-700">Ý kiến của khách hàng</p>
            <div className="mt-4 rounded-xl bg-gray-50 border border-gray-100 px-4 py-8 text-center">
              <span className="text-3xl mb-2 block">💬</span>
              <p className="text-sm text-gray-400 font-medium">
                Chưa có đánh giá nào.<br />Hãy là người đầu tiên nhận xét!
              </p>
            </div>
          </div>

          {/* Col 2: Location info */}
          <div className="rounded-2xl bg-white shadow-sm border border-gray-100 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-gray-900">Khu vực lân cận</h3>
              <button className="text-xs font-bold text-blue-500 hover:text-blue-700">Xem bản đồ →</button>
            </div>

            <div className="flex items-start gap-2 mb-4">
              <span className="shrink-0 mt-0.5">📍</span>
              <p className="text-sm text-gray-600 leading-relaxed">{hotel.address}</p>
            </div>

            {hotel.phone && (
              <div className="flex items-center gap-2 mb-3 text-sm text-gray-600">
                <span>📞</span>
                <span>{hotel.phone}</span>
              </div>
            )}
            {hotel.email && (
              <div className="flex items-center gap-2 mb-3 text-sm text-gray-600">
                <span>✉️</span>
                <span>{hotel.email}</span>
              </div>
            )}
            {hotel.checkInTime && (
              <div className="flex items-center gap-2 mb-3 text-sm text-gray-600">
                <span>🕑</span>
                <span>Check-in: {hotel.checkInTime.slice(0, 5)} | Check-out: {hotel.checkOutTime.slice(0, 5)}</span>
              </div>
            )}

            <div className="mt-4 space-y-2.5">
              {NEARBY_PLACES.map((place) => (
                <div key={place.name} className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2 text-gray-600">
                    <span>{place.icon}</span>
                    <span>{place.name}</span>
                  </div>
                  <span className="text-gray-400 font-semibold">{place.dist}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Col 3: Main facilities */}
          <div className="rounded-2xl bg-white shadow-sm border border-gray-100 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-gray-900">Tiện ích chính</h3>
              <button className="text-xs font-bold text-blue-500 hover:text-blue-700">Xem thêm →</button>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {FACILITIES.map((fac) => (
                <div key={fac.label} className="flex items-center gap-2.5 rounded-xl bg-gray-50 px-3 py-2.5">
                  <span className="text-lg">{fac.icon}</span>
                  <span className="text-sm font-medium text-gray-700">{fac.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ===== DESCRIPTION ===== */}
      {hotel.description && (
        <div className="max-w-screen-xl mx-auto px-4 mt-6">
          <div className="rounded-2xl bg-white shadow-sm border border-gray-100 p-6">
            <p className="text-sm text-gray-600 leading-relaxed">{hotel.description}</p>
            <button className="mt-3 text-sm font-bold text-blue-500 hover:text-blue-700">
              Đọc thêm →
            </button>
          </div>
        </div>
      )}

      {/* ===== AVAILABLE ROOMS ===== */}
      <div id="available-rooms" className="max-w-screen-xl mx-auto px-4 mt-8 pb-12">
        <div className="mb-6">
          <h2 className="text-xl font-extrabold text-gray-900">
            Các loại phòng tại {hotel.name}
          </h2>
        </div>

        {/* Filter chips */}
        <div className="mb-6 flex items-center gap-3 flex-wrap">
          {['Miễn phí huỷ phòng', 'Giường lớn', 'Bữa sáng miễn phí'].map(tag => (
            <button
              key={tag}
              className="rounded-full border border-blue-200 bg-blue-50 px-4 py-1.5 text-xs font-semibold text-blue-600 hover:bg-blue-100 transition-colors"
            >
              {tag}
            </button>
          ))}
        </div>

        {rooms.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-gray-200 bg-white py-16 text-center">
            <span className="text-5xl mb-4 block">🛏️</span>
            <p className="text-lg font-bold text-gray-500">Chưa có phòng trống</p>
            <p className="text-sm text-gray-400 mt-2">Vui lòng thử lại sau hoặc chọn khách sạn khác.</p>
          </div>
        ) : (
          <div className="space-y-5">
            {rooms.map(room => (
              <RoomCard key={room.id} room={room} hotel={hotel} />
            ))}
          </div>
        )}
      </div>

      {/* Gallery Modal */}
      {galleryOpen && (
        <GalleryModal
          images={galleryImages}
          startIndex={galleryStartIndex}
          onClose={() => setGalleryOpen(false)}
        />
      )}

      <Footer />
    </div>
  );
}
