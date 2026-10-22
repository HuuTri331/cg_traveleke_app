'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowRight, CheckCircle2, Star } from 'lucide-react';

export default function LuxuryIntroSection() {
  return (
    <section id="luxury-intro" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16 items-center">
        {/* Left Column: Editorial Image Collage */}
        <div className="lg:col-span-6 relative">
          <div className="relative aspect-[4/3] rounded-3xl overflow-hidden shadow-2xl border border-[#1E4752]/10 bg-[#1E4752]/5">
            <img
              src="https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1200&q=80"
              alt="Traveleke Luxury Resort"
              className="w-full h-full object-cover transition-transform duration-700 hover:scale-103"
              onError={(e) => {
                (e.target as HTMLImageElement).src = '/images/hotel-placeholder.png';
              }}
            />
            {/* Subtle Gradient Accent */}
            <div className="absolute inset-0 bg-gradient-to-t from-[#1E4752]/40 via-transparent to-transparent pointer-events-none" />
          </div>

          {/* Floating Gold Experience Pill */}
          <div className="absolute -bottom-6 -right-4 sm:right-6 bg-white border border-[#E8A700]/30 rounded-2xl p-4 sm:p-5 shadow-xl max-w-xs flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-xl bg-[#E8A700]/15 flex items-center justify-center shrink-0">
              <Star className="w-6 h-6 text-[#E8A700] fill-[#E8A700]" />
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-[#E8A700]">Trải nghiệm</p>
              <p className="text-sm font-extrabold text-[#1E4752]">Tiêu chuẩn 5 sao tuyển chọn</p>
            </div>
          </div>
        </div>

        {/* Right Column: Editorial Text */}
        <div className="lg:col-span-6 space-y-6">
          <div className="space-y-2">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#E8A700]">
              CÂU CHUYỆN TRAVELEKE
            </p>
            <h2 className="text-2xl sm:text-4xl font-extrabold text-[#1E4752] leading-tight tracking-tight">
              Nghỉ dưỡng không chỉ là một nơi để dừng chân.
            </h2>
          </div>

          <p className="text-sm sm:text-base text-[#1E4752]/70 leading-relaxed font-normal">
            Chúng tôi tin rằng mỗi chuyến đi là một chương hồi ký đáng giá. Traveleke kết nối du khách với những khách sạn và khu nghỉ dưỡng mang phong vị độc bản, dịch vụ chuẩn mực và không gian thư giãn đẳng cấp.
          </p>

          {/* 3 Value Pillars */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
            <div className="p-4 rounded-xl bg-[#1E4752]/3 border border-[#1E4752]/8">
              <span className="text-xs font-black text-[#E8A700]">01</span>
              <h3 className="mt-1 text-sm font-bold text-[#1E4752]">Lựa chọn tinh tuyển</h3>
              <p className="mt-1 text-xs text-[#1E4752]/65">Kiểm soát thực tế chất lượng cơ sở lưu trú.</p>
            </div>

            <div className="p-4 rounded-xl bg-[#1E4752]/3 border border-[#1E4752]/8">
              <span className="text-xs font-black text-[#E8A700]">02</span>
              <h3 className="mt-1 text-sm font-bold text-[#1E4752]">Thanh toán an toàn</h3>
              <p className="mt-1 text-xs text-[#1E4752]/65">Bảo chứng bằng cổng VNPay chính thức.</p>
            </div>

            <div className="p-4 rounded-xl bg-[#1E4752]/3 border border-[#1E4752]/8">
              <span className="text-xs font-black text-[#E8A700]">03</span>
              <h3 className="mt-1 text-sm font-bold text-[#1E4752]">Realtime Booking</h3>
              <p className="mt-1 text-xs text-[#1E4752]/65">Khóa phòng và xác nhận giữ chỗ tức thì.</p>
            </div>
          </div>

          <div className="pt-3">
            <Link
              href="/hotels_home"
              className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl bg-[#1E4752] hover:bg-[#1E4752]/90 text-white font-bold text-sm tracking-wide transition-all shadow-md hover:shadow-lg group"
            >
              <span>Xem tất cả khách sạn</span>
              <ArrowRight className="w-4 h-4 text-[#E8A700] group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
