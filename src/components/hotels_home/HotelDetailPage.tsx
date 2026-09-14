'use client';

import { useEffect, useState, useCallback } from 'react';
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
  const [current, setCurrent] = useState(startIndex);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') setCurrent(c => Math.max(0, c - 1));
      if (e.key === 'ArrowRight') setCurrent(c => Math.min(images.length - 1, c + 1));
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [images.length, onClose]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm"
      onClick={onClose}
    >
      <div className="relative w-full max-w-4xl mx-4" onClick={e => e.stopPropagation()}>
        {/* Close */}
        <button
          onClick={onClose}
          className="absolute -top-12 right-0 text-white text-sm font-semibold hover:text-gray-300 flex items-center gap-2"
        >
          <span>✕</span> Đóng (ESC)
        </button>

        {/* Main image */}
        <div className="relative aspect-[16/10] overflow-hidden rounded-2xl bg-gray-900">
          <img
            src={images[current]}
            alt={`Ảnh ${current + 1}`}
            className="h-full w-full object-contain"
            onError={e => { (e.target as HTMLImageElement).src = '/images/hotel-placeholder.png'; }}
          />

          {/* Counter */}
          <div className="absolute bottom-4 right-4 rounded-full bg-black/60 px-3 py-1 text-sm font-semibold text-white">
            {current + 1} / {images.length}
          </div>

          {/* Prev */}
          {current > 0 && (
            <button
              onClick={() => setCurrent(c => c - 1)}
              className="absolute left-4 top-1/2 -translate-y-1/2 flex h-12 w-12 items-center justify-center rounded-full bg-black/50 text-white hover:bg-black/70 transition-colors text-xl"
            >
              ‹
            </button>
          )}

          {/* Next */}
          {current < images.length - 1 && (
            <button
              onClick={() => setCurrent(c => c + 1)}
              className="absolute right-4 top-1/2 -translate-y-1/2 flex h-12 w-12 items-center justify-center rounded-full bg-black/50 text-white hover:bg-black/70 transition-colors text-xl"
            >
              ›
            </button>
          )}
        </div>

        {/* Thumbnails */}
        <div className="mt-4 flex gap-2 overflow-x-auto pb-2">
          {images.map((img, idx) => (
            <button
              key={idx}
              onClick={() => setCurrent(idx)}
              className={`shrink-0 h-16 w-24 overflow-hidden rounded-xl transition-all ${
                idx === current ? 'ring-2 ring-blue-500 opacity-100' : 'opacity-60 hover:opacity-100'
              }`}
            >
              <img
                src={img}
                alt={`thumb-${idx}`}
                className="h-full w-full object-cover"
                onError={e => { (e.target as HTMLImageElement).src = '/images/hotel-placeholder.png'; }}
              />
            </button>
          ))}
        </div>
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
  const imageUrl = !imgError ? getRoomImageUrl(room.coverImageUrl) : '/images/room-placeholder.png';
  const priceNum = parseFloat(room.pricePerNight);
  const originalPrice = priceNum * 1.2;

  const handleBookRoom = () => {
    const bookingData = {
      hotelId: hotel.id,
      hotelName: hotel.name,
      hotelAddress: hotel.address,
      hotelStar: hotel.starRating,
      hotelImage: hotel.images?.[0]?.imageUrl || null,
      roomId: room.id,
      roomName: room.name,
      roomPrice: room.pricePerNight,
      bedCount: room.bedCount,
      bedType: room.bedType,
      maxAdults: room.maxAdults,
      availableRooms: room.availableRooms,
      checkInTime: hotel.checkInTime || '14:00:00',
      checkOutTime: hotel.checkOutTime || '12:00:00',
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
    <div className="rounded-2xl border border-gray-200 bg-white shadow-sm overflow-hidden hover:shadow-md transition-shadow">
      {/* Room images + info layout */}
      <div className="flex flex-col lg:flex-row">
        {/* Left: Image + quick specs */}
        <div className="lg:w-64 shrink-0">
          <div className="relative h-48 lg:h-full overflow-hidden">
            <img
              src={imageUrl}
              alt={room.name}
              onError={() => setImgError(true)}
              className="h-full w-full object-cover"
            />
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/40 to-transparent p-3">
              <p className="text-[11px] text-white font-semibold">✓ Miễn phí huỷ phòng</p>
            </div>
          </div>

          {/* Quick specs below image */}
          <div className="p-3 bg-blue-50/50 border-t border-gray-100">
            <div className="flex items-center gap-1.5 text-xs text-gray-600 mb-1.5">
              <span>📐</span>
              <span>{room.roomSize ? `${room.roomSize} m²` : 'N/A'}</span>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-gray-600 mb-2">
              <span>🛏️</span>
              <span>{room.bedCount} {room.bedType || 'giường'}</span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {['Vòi hoa sen', 'Nước nóng', 'Điều hoà', 'WiFi miễn phí'].map(a => (
                <span key={a} className="inline-flex items-center gap-1 rounded-full bg-white border border-gray-100 px-2 py-0.5 text-[10px] text-gray-500 font-medium">
                  {a}
                </span>
              ))}
            </div>
            <Link
              href={`/booking/${room.id}`}
              className="mt-3 block text-center text-xs font-bold text-blue-500 hover:text-blue-700 hover:underline"
            >
              Xem chi tiết phòng →
            </Link>
          </div>
        </div>

        {/* Right: Room info table */}
        <div className="flex-1 flex flex-col">
          {/* Room name */}
          <div className="px-5 pt-4 pb-3 border-b border-gray-100">
            <h3 className="text-base font-bold text-gray-900">{room.name}</h3>
            {room.description && (
              <p className="mt-1 text-xs text-gray-500 line-clamp-2">{room.description}</p>
            )}
          </div>

          {/* Room option row */}
          <div className="flex-1">
            {/* Table header */}
            <div className="hidden sm:grid grid-cols-4 gap-4 px-5 py-2.5 bg-gray-50 text-[11px] font-bold text-gray-500 uppercase tracking-wider">
              <span>Tùy chọn phòng</span>
              <span className="text-center">Khách</span>
              <span className="text-center">Giá/đêm</span>
              <span className="text-center">Phòng</span>
            </div>

            {/* Row */}
            <div className="sm:grid sm:grid-cols-4 sm:gap-4 px-5 py-4 items-center border-t border-gray-50">
              {/* Option */}
              <div>
                <p className="text-sm font-bold text-gray-900">Không bao gồm bữa sáng</p>
                <div className="mt-1.5 flex items-center gap-1.5 text-xs text-gray-500">
                  <span>🛏️</span>
                  <span>{room.bedCount} {room.bedType}</span>
                </div>
                <p className="mt-1 text-xs font-semibold text-blue-500">✓ Miễn phí huỷ trước ngày nhận phòng</p>
              </div>

              {/* Guests */}
              <div className="sm:text-center mt-3 sm:mt-0">
                <div className="flex sm:justify-center items-center gap-1 text-gray-600">
                  {Array.from({ length: Math.min(room.maxAdults, 4) }).map((_, i) => (
                    <span key={i} className="text-base">👤</span>
                  ))}
                  {room.maxAdults > 4 && <span className="text-xs text-gray-500">+{room.maxAdults - 4}</span>}
                </div>
              </div>

              {/* Price */}
              <div className="sm:text-center mt-3 sm:mt-0">
                <p className="text-xs text-blue-400 font-semibold">Giá đặc biệt!</p>
                <p className="text-sm text-gray-400 line-through">{formatPrice(originalPrice)}</p>
                <p className="text-lg font-extrabold text-blue-600">{formatPrice(room.pricePerNight)}</p>
                <p className="text-[10px] text-gray-400">Chưa bao gồm thuế & phí</p>
              </div>

              {/* Book */}
              <div className="sm:text-center mt-4 sm:mt-0">
                <button
                  type="button"
                  onClick={handleBookRoom}
                  className="inline-flex items-center justify-center w-full sm:w-auto rounded-xl bg-blue-500 px-6 py-2.5 text-sm font-bold text-white shadow-md shadow-blue-500/30 hover:bg-blue-600 transition-colors cursor-pointer"
                >
                  Đặt ngay
                </button>
                {room.availableRooms <= 5 && room.availableRooms > 0 && (
                  <p className="mt-1.5 text-[11px] font-bold text-red-500">
                    Còn {room.availableRooms} phòng!
                  </p>
                )}
              </div>
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

  // Build gallery images
  const galleryImages: string[] = [];
  if (hotel?.coverImageUrl) galleryImages.push(getImageUrl(hotel.coverImageUrl));
  if (hotel?.images && Array.isArray(hotel.images)) {
    hotel.images
      .sort((a, b) => a.sortOrder - b.sortOrder)
      .forEach(img => {
        const url = getImageUrl(img.imageUrl);
        if (!galleryImages.includes(url)) galleryImages.push(url);
      });
  }
  if (galleryImages.length === 0) galleryImages.push('/images/hotel-placeholder.png');

  const openGallery = (index: number) => {
    setGalleryStartIndex(index);
    setGalleryOpen(true);
  };

  // Min price from rooms
  const minPrice = rooms.length > 0
    ? Math.min(...rooms.map(r => parseFloat(r.pricePerNight) || 0))
    : null;

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="flex flex-col items-center justify-center py-40 gap-4">
          <div className="h-12 w-12 rounded-full border-4 border-blue-500 border-t-transparent animate-spin" />
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
          <Link href="/hotels_home" className="rounded-xl bg-blue-500 px-6 py-2.5 text-sm font-bold text-white hover:bg-blue-600">
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

      {/* ===== PHOTO GALLERY GRID ===== */}
      <div className="max-w-screen-xl mx-auto px-4 pt-6">
        {/* Breadcrumb */}
        <nav className="mb-4 flex items-center gap-2 text-sm text-gray-500">
          <Link href="/home" className="hover:text-blue-500">Trang chủ</Link>
          <span>›</span>
          <Link href="/hotels_home" className="hover:text-blue-500">Khách sạn</Link>
          <span>›</span>
          <span className="text-gray-900 font-semibold truncate max-w-xs">{hotel.name}</span>
        </nav>

        {/* Gallery grid */}
        <div className="grid grid-cols-4 grid-rows-2 gap-2 rounded-2xl overflow-hidden h-[420px] sm:h-[520px]">
          {/* Main large photo */}
          <div
            className="col-span-2 row-span-2 relative cursor-pointer group"
            onClick={() => openGallery(0)}
          >
            <img
              src={galleryImages[0]}
              alt={hotel.name}
              className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
              onError={e => { (e.target as HTMLImageElement).src = '/images/hotel-placeholder.png'; }}
            />
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
          </div>

          {/* Secondary photos */}
          {[1, 2, 3].map((idx) => (
            <div
              key={idx}
              className="relative cursor-pointer group overflow-hidden"
              onClick={() => openGallery(idx)}
            >
              <img
                src={galleryImages[idx] || galleryImages[0]}
                alt={`${hotel.name} - ${idx + 1}`}
                className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                onError={e => { (e.target as HTMLImageElement).src = '/images/hotel-placeholder.png'; }}
              />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
            </div>
          ))}

          {/* Last photo with "See All Photos" overlay */}
          <div
            className="relative cursor-pointer group overflow-hidden"
            onClick={() => openGallery(4)}
          >
            <img
              src={galleryImages[4] || galleryImages[0]}
              alt={`${hotel.name} - more`}
              className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
              onError={e => { (e.target as HTMLImageElement).src = '/images/hotel-placeholder.png'; }}
            />
            <div className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center gap-1 group-hover:bg-black/60 transition-colors">
              <span className="text-2xl">🖼️</span>
              <span className="text-white text-xs font-bold text-center leading-tight">
                Xem tất cả<br />{galleryImages.length} ảnh
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* ===== HOTEL NAME + PRICE HEADER ===== */}
      <div className="max-w-screen-xl mx-auto px-4 mt-6">
        <div className="rounded-2xl bg-white shadow-sm border border-gray-100 px-6 py-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          {/* Left: Name + stars */}
          <div>
            <div className="flex items-center gap-3 flex-wrap">
              <h1 className="text-2xl font-extrabold text-gray-900">{hotel.name}</h1>
              <span className="rounded-full bg-blue-50 border border-blue-100 px-3 py-0.5 text-xs font-bold text-blue-600">
                Khách sạn
              </span>
            </div>
            {hotel.starRating && (
              <div className="mt-1.5 flex items-center gap-1">
                {Array.from({ length: hotel.starRating }).map((_, i) => (
                  <span key={i} className="text-yellow-400 text-lg">★</span>
                ))}
              </div>
            )}
            {hotel.address && (
              <p className="mt-2 flex items-center gap-1.5 text-sm text-gray-500">
                <span>📍</span>
                <span>{hotel.address}</span>
              </p>
            )}
          </div>

          {/* Right: Starting price + CTA */}
          <div className="flex flex-col items-end gap-2 shrink-0">
            {minPrice && (
              <div className="text-right">
                <p className="text-xs text-gray-400 font-medium">Giá phòng/đêm từ</p>
                <p className="text-2xl font-extrabold text-blue-600">{formatPrice(minPrice)}</p>
              </div>
            )}
            <a
              href="#available-rooms"
              className="flex items-center gap-2 rounded-xl bg-blue-500 px-6 py-2.5 text-sm font-bold text-white shadow-lg shadow-blue-500/30 hover:bg-blue-600 transition-colors"
            >
              Xem Phòng
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
