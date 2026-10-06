'use client';

import Link from 'next/link';
import {
  Building2,
  MapPin,
  Star,
  Users,
} from 'lucide-react';

import type { ChatHotelResult } from '@/types/chat';

interface ChatHotelCardProps {
  hotel: ChatHotelResult;
}

const API_ORIGIN =
  process.env.NEXT_PUBLIC_API_BASE_URL?.replace(/\/api\/?$/, '') ||
  'http://localhost:3001';

function getImageUrl(path: string | null): string | null {
  if (!path) {
    return null;
  }

  if (
    path.startsWith('http://') ||
    path.startsWith('https://')
  ) {
    return path;
  }

  return `${API_ORIGIN}${path.startsWith('/') ? path : `/${path}`}`;
}

function formatPrice(value: string): string {
  const price = Number(value);

  if (Number.isNaN(price)) {
    return value;
  }

  return new Intl.NumberFormat('vi-VN').format(price);
}

export default function ChatHotelCard({
  hotel,
}: ChatHotelCardProps) {
  const imageUrl =
    getImageUrl(hotel.roomImage) ??
    getImageUrl(hotel.hotelImage);

  return (
    <Link
      href={`/hotels_home/${hotel.hotelId}`}
      className="
        block cursor-pointer overflow-hidden
        rounded-2xl border border-slate-200
        bg-white shadow-sm
        transition duration-200
        hover:-translate-y-0.5
        hover:border-blue-300
        hover:shadow-md
        active:scale-[0.99]
      "
      aria-label={`Xem chi tiết ${hotel.hotelName}`}
    >
      {imageUrl ? (
        <img
          src={imageUrl}
          alt={hotel.roomName}
          className="h-32 w-full object-cover"
        />
      ) : (
        <div className="flex h-32 items-center justify-center bg-slate-100">
          <Building2 className="h-10 w-10 text-slate-400" />
        </div>
      )}

      <div className="space-y-2 p-3">
        <div>
          <h3 className="text-sm font-semibold text-slate-900">
            {hotel.hotelName}
          </h3>

          <div className="mt-1 flex items-center gap-1 text-xs text-amber-600">
            <Star className="h-3.5 w-3.5 fill-current" />

            <span>{hotel.starRating} sao</span>
          </div>
        </div>

        <div className="flex items-start gap-1.5 text-xs text-slate-500">
          <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0" />

          <span>{hotel.address}</span>
        </div>

        <div className="rounded-xl bg-slate-50 p-2.5">
          <p className="text-sm font-medium text-slate-800">
            {hotel.roomName}
          </p>

          <div className="mt-1 flex items-center gap-1 text-xs text-slate-500">
            <Users className="h-3.5 w-3.5" />

            <span>
              Tối đa {hotel.maxAdults} người lớn
              {hotel.maxChildren > 0
                ? `, ${hotel.maxChildren} trẻ em`
                : ''}
            </span>
          </div>
        </div>

        <div className="flex items-end justify-between gap-3">
          <div>
            <p className="text-xs text-slate-500">
              Giá mỗi đêm
            </p>

            <p className="font-bold text-blue-600">
              {formatPrice(hotel.pricePerNight)} ₫
            </p>
          </div>

          <div className="text-right">
            <p className="text-xs text-slate-500">
              Còn
            </p>

            <p className="text-sm font-semibold text-emerald-600">
              {hotel.remainingRooms} phòng
            </p>
          </div>
        </div>

        <div className="border-t border-slate-100 pt-2 text-right">
          <span className="text-xs font-medium text-blue-600">
            Xem khách sạn →
          </span>
        </div>
      </div>
    </Link>
  );
}