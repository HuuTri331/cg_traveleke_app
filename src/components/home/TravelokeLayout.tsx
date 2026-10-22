'use client';

import React from 'react';
import {
  CalendarCheck,
  ShieldCheck,
  Radio,
  RefreshCw,
  Building2,
  Clock,
} from 'lucide-react';
import LuxurySectionHeader from '@/components/hotel-shared/LuxurySectionHeader';

const PLATFORM_SERVICES = [
  {
    num: '01',
    title: 'Đặt Phòng Trực Tuyến',
    desc: 'Hệ thống đối soát phòng trống chính xác theo khoảng ngày lưu trú thực tế.',
    icon: CalendarCheck,
  },
  {
    num: '02',
    title: 'Thanh Toán VNPay Bảo Mật',
    desc: 'Tích hợp cổng thanh toán VNPay chuẩn mã hóa HMAC-SHA512 an toàn tuyệt đối.',
    icon: ShieldCheck,
  },
  {
    num: '03',
    title: 'Theo Dõi Trạng Thái Realtime',
    desc: 'Cập nhật trạng thái thanh toán, xác nhận đơn hàng qua kết nối realtime.',
    icon: Radio,
  },
  {
    num: '04',
    title: 'Hỗ Trợ Hủy & Hoàn Tiền',
    desc: 'Quy trình hủy phòng minh bạch, kiểm duyệt hoàn phí trực tiếp về tài khoản.',
    icon: RefreshCw,
  },
  {
    num: '05',
    title: 'Danh Mục Khách Sạn Đa Dạng',
    desc: 'Mạng lưới từ khách sạn đô thị boutique đến khu nghỉ dưỡng 5 sao ven biển.',
    icon: Building2,
  },
  {
    num: '06',
    title: 'Quản Lý Lịch Sử Đặt Chỗ',
    desc: 'Lưu trữ thông tin đặt phòng, xuất vé điện tử và theo dõi dịch vụ cá nhân.',
    icon: Clock,
  },
];

export default function TravelokeLayout() {
  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
      <LuxurySectionHeader
        eyebrow="TIÊU CHUẨN NỀN TẢNG"
        title="Dịch Vụ Đẳng Cấp Traveleke"
        subtitle="Hệ thống công nghệ và dịch vụ đồng bộ mang lại sự an tâm tuyệt đối trên mỗi hành trình."
        align="center"
      />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
        {PLATFORM_SERVICES.map((srv) => {
          const Icon = srv.icon;
          return (
            <div
              key={srv.num}
              className="relative p-6 sm:p-7 rounded-3xl bg-white border border-[#1E4752]/12 shadow-xs hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group"
            >
              {/* Header: Number & Icon */}
              <div className="flex items-center justify-between mb-5">
                <span className="text-2xl font-black text-[#E8A700] tracking-tight">
                  {srv.num}
                </span>
                <div className="w-12 h-12 rounded-2xl bg-[#1E4752]/5 text-[#1E4752] group-hover:bg-[#E8A700] group-hover:text-[#1E4752] flex items-center justify-center transition-colors duration-300">
                  <Icon className="w-6 h-6" />
                </div>
              </div>

              {/* Title & Desc */}
              <h3 className="text-base font-extrabold text-[#1E4752] mb-2 group-hover:text-[#1E4752]">
                {srv.title}
              </h3>
              <p className="text-xs sm:text-sm text-[#1E4752]/65 leading-relaxed font-normal">
                {srv.desc}
              </p>
            </div>
          );
        })}
      </div>
    </section>
  );
}