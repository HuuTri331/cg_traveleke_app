'use client';

import Link from 'next/link';
import {
  Building2,
  MapPin,
  Star,
  Users,
  ArrowUpRight,
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
        lux-card-hover group block cursor-pointer overflow-hidden
        rounded-2xl border border-[#1E4752]/15
        bg-white shadow-xs
      "
      aria-label={`Xem chi tiết ${hotel.hotelName}`}
    >
      <div className="relative h-32 w-full overflow-hidden bg-[#1E4752]/5">
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={hotel.roomName}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full items-center justify-center">
            <Building2 className="h-10 w-10 text-[#1E4752]/30" />
          </div>
        )}
        <div className="absolute top-2.5 right-2.5 flex items-center gap-1 rounded-full bg-[#1E4752]/90 backdrop-blur-xs px-2.5 py-1 text-[11px] font-bold text-[#E8A700]">
          <Star className="h-3 w-3 fill-[#E8A700] text-[#E8A700]" />
          <span>{hotel.starRating} sao</span>
        </div>
      </div>

      <div className="space-y-2.5 p-3.5">
        <div>
          <h3 className="text-sm font-bold text-[#1E4752] group-hover:text-[#E8A700] transition-colors line-clamp-1">
            {hotel.hotelName}
          </h3>

          <div className="mt-1 flex items-start gap-1.5 text-xs text-[#1E4752]/65">
            <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[#E8A700]" />
            <span className="line-clamp-1">{hotel.address}</span>
          </div>
        </div>

        <div className="rounded-xl bg-[#1E4752]/[0.03] border border-[#1E4752]/10 p-2.5">
          <p className="text-xs font-bold text-[#1E4752]">
            {hotel.roomName}
          </p>

          <div className="mt-1 flex items-center gap-1.5 text-[11px] font-medium text-[#1E4752]/70">
            <Users className="h-3.5 w-3.5 text-[#E8A700]" />
            <span>
              Tối đa {hotel.maxAdults} người lớn
              {hotel.maxChildren > 0
                ? `, ${hotel.maxChildren} trẻ em`
                : ''}
            </span>
          </div>
        </div>

        <div className="flex items-end justify-between gap-3 pt-1">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-wider text-[#1E4752]/55">
              Giá mỗi đêm
            </p>
            <p className="text-sm font-extrabold text-[#1E4752] tabular-nums">
              {formatPrice(hotel.pricePerNight)} <span className="text-xs font-bold text-[#E8A700]">VND</span>
            </p>
          </div>

          <div className="text-right">
            <span className="inline-flex items-center rounded-full bg-[#E8A700]/15 px-2.5 py-0.5 text-[11px] font-bold text-[#1E4752]">
              Còn {hotel.remainingRooms} phòng
            </span>
          </div>
        </div>

        <div className="border-t border-[#1E4752]/10 pt-2 flex items-center justify-between text-xs font-bold text-[#1E4752]">
          <span>Khám phá & Đặt phòng</span>
          <ArrowUpRight className="h-3.5 w-3.5 text-[#E8A700] transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
        </div>
      </div>
    </Link>
  );
}
