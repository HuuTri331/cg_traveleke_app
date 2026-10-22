'use client';

import React from 'react';
import Link from 'next/link';
import { MapPin, ArrowRight } from 'lucide-react';
import LuxurySectionHeader from '@/components/hotel-shared/LuxurySectionHeader';

interface DestinationItem {
  name: string;
  keyword: string;
  tagline: string;
  imgUrl: string;
  featured?: boolean;
}

const LUXURY_DESTINATIONS: DestinationItem[] = [
  {
    name: 'Đà Nẵng & Hội An',
    keyword: 'Đà Nẵng',
    tagline: 'Bãi biển Mỹ Khê & phố cổ di sản',
    imgUrl: 'https://images.unsplash.com/photo-1559592413-7cec4d0cae2b?auto=format&fit=crop&w=1200&q=80',
    featured: true,
  },
  {
    name: 'Phú Quốc',
    keyword: 'Phú Quốc',
    tagline: 'Thiên đường đảo ngọc & hoàng hôn nhiệt đới',
    imgUrl: 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=800&q=80',
  },
  {
    name: 'Nha Trang',
    keyword: 'Nha Trang',
    tagline: 'Vịnh biển xanh ngọc & các khu resort đảo',
    imgUrl: 'https://images.unsplash.com/photo-1596422846543-75c6fc197f07?auto=format&fit=crop&w=800&q=80',
  },
  {
    name: 'Đà Lạt',
    keyword: 'Đà Lạt',
    tagline: 'Khí hậu cao nguyên & sương mờ thông reo',
    imgUrl: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=800&q=80',
  },
  {
    name: 'Hà Nội & Miền Bắc',
    keyword: 'Hà Nội',
    tagline: 'Nét thanh lịch thủ đô nghìn năm văn hiến',
    imgUrl: 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?auto=format&fit=crop&w=800&q=80',
  },
];

export default function TravelDestinations() {
  const featured = LUXURY_DESTINATIONS[0];
  const secondary = LUXURY_DESTINATIONS.slice(1);

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
      <LuxurySectionHeader
        eyebrow="ĐIỂM ĐẾN NGHỈ DƯỠNG"
        title="Khám Phá Những Miền Nghỉ Dưỡng Hàng Đầu"
        subtitle="Hòa mình vào thiên nhiên và những vùng biển ngoạn mục cùng danh mục khách sạn đối tác cao cấp."
        align="left"
        action={
          <Link
            href="/hotels_home"
            className="inline-flex items-center gap-1.5 text-xs font-extrabold uppercase tracking-wider text-[#1E4752] hover:text-[#E8A700] transition-colors"
          >
            <span>Tất cả điểm đến</span>
            <ArrowRight className="w-4 h-4 text-[#E8A700]" />
          </Link>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* 1. Large Featured Card (5 cols) */}
        <div className="lg:col-span-5">
          <Link
            href={`/hotels_home?keyword=${encodeURIComponent(featured.keyword)}`}
            className="group relative flex flex-col justify-end h-80 sm:h-96 lg:h-full rounded-3xl overflow-hidden border border-[#1E4752]/10 shadow-md hover:shadow-xl transition-all duration-300"
          >
            <img
              src={featured.imgUrl}
              alt={featured.name}
              className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#1E4752]/90 via-[#1E4752]/40 to-transparent" />

            <div className="relative p-6 sm:p-8 space-y-2 text-white z-10">
              <span className="inline-block px-3 py-1 rounded-full bg-[#E8A700] text-[#1E4752] text-2xs font-black uppercase tracking-wider">
                Điểm đến nổi bật
              </span>
              <h3 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                {featured.name}
              </h3>
              <p className="text-xs sm:text-sm text-white/80 max-w-sm">
                {featured.tagline}
              </p>
              <div className="pt-2 flex items-center gap-1.5 text-xs font-bold text-[#E8A700] group-hover:translate-x-1 transition-transform">
                <span>Khám phá khách sạn</span>
                <ArrowRight className="w-3.5 h-3.5 text-[#E8A700]" />
              </div>
            </div>
          </Link>
        </div>

        {/* 2. 4 Secondary Cards Grid (7 cols) */}
        <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-6">
          {secondary.map((dest) => (
            <Link
              key={dest.name}
              href={`/hotels_home?keyword=${encodeURIComponent(dest.keyword)}`}
              className="group relative flex flex-col justify-end h-56 sm:h-64 rounded-3xl overflow-hidden border border-[#1E4752]/10 shadow-xs hover:shadow-lg transition-all duration-300"
            >
              <img
                src={dest.imgUrl}
                alt={dest.name}
                className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#1E4752]/90 via-[#1E4752]/35 to-transparent" />

              <div className="relative p-5 text-white space-y-1 z-10">
                <div className="flex items-center gap-1.5 text-2xs text-[#E8A700] font-extrabold uppercase tracking-wider">
                  <MapPin className="w-3 h-3 text-[#E8A700]" />
                  <span>Việt Nam</span>
                </div>
                <h4 className="text-lg font-extrabold tracking-tight">
                  {dest.name}
                </h4>
                <p className="text-xs text-white/75 line-clamp-1">
                  {dest.tagline}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}