'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowRight, Sparkles } from 'lucide-react';
import backgroundImage from '@/assets/image/background.png';

interface LuxuryHeroProps {
  onExploreClick?: () => void;
  bannerTitle?: string;
  bannerSubtitle?: string;
}

export default function LuxuryHero({
  onExploreClick,
  bannerTitle,
  bannerSubtitle,
}: LuxuryHeroProps) {
  return (
    <div className="relative min-h-[580px] lg:min-h-[640px] flex items-center justify-center overflow-hidden">
      {/* Background Image with Deep Teal Tint Gradient */}
      <div
        className="absolute inset-0 bg-cover bg-center transition-transform duration-1000 scale-102"
        style={{
          backgroundImage: `url(${backgroundImage.src})`,
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-b from-[#1E4752]/85 via-[#1E4752]/75 to-[#1E4752]/95 backdrop-blur-[1px]" />
      </div>

      {/* Decorative Subtle Overlay Grid */}
      <div
        className="absolute inset-0 opacity-5 pointer-events-none"
        style={{
          backgroundImage:
            'radial-gradient(circle at 1px 1px, #ffffff 1px, transparent 0)',
          backgroundSize: '32px 32px',
        }}
      />

      {/* Hero Content */}
      <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 text-center text-white pb-24 pt-16">
        {/* Eyebrow */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-[#E8A700]/40 text-[#E8A700] text-xs font-extrabold uppercase tracking-[0.22em] mb-6 shadow-sm">
          <Sparkles className="w-3.5 h-3.5 text-[#E8A700]" />
          <span>{bannerTitle ? 'TRAVELEKE COLLECTION' : 'TRAVELEKE LUXURY COLLECTION'}</span>
        </div>

        {/* Headline */}
        <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight leading-[1.15] text-white">
          {bannerTitle || 'Kỳ nghỉ xứng tầm,\ntrải nghiệm đáng nhớ.'}
        </h1>

        {/* Subtitle */}
        <p className="mt-5 text-base sm:text-lg lg:text-xl text-white/80 max-w-2xl mx-auto font-normal leading-relaxed">
          {bannerSubtitle ||
            'Khám phá những không gian nghỉ dưỡng và khách sạn tinh tuyển, được bảo chứng dịch vụ cho chuyến đi trọn vẹn của bạn.'}
        </p>

        {/* CTA Buttons */}
        <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
          <Link
            href="/hotels_home"
            className="px-6 py-3.5 rounded-xl bg-[#E8A700] hover:bg-[#E8A700]/90 text-[#1E4752] font-extrabold text-sm uppercase tracking-wider shadow-lg hover:shadow-xl transition-all duration-200 flex items-center gap-2 group cursor-pointer"
          >
            <span>Khám phá bộ sưu tập</span>
            <ArrowRight className="w-4 h-4 text-[#1E4752] group-hover:translate-x-1 transition-transform" />
          </Link>
          <a
            href="#luxury-intro"
            className="px-6 py-3.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-sm border border-white/20 backdrop-blur-sm transition-all duration-200 cursor-pointer"
          >
            Tìm hiểu Traveleke
          </a>
        </div>
      </div>
    </div>
  );
}
