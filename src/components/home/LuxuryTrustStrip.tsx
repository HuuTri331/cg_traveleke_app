'use client';

import React from 'react';
import { ShieldCheck, Award, Headphones, RefreshCw } from 'lucide-react';

const TRUST_ITEMS = [
  {
    icon: ShieldCheck,
    title: 'Thanh Toán VNPay An Toàn',
    desc: 'Bảo mật tiêu chuẩn ngân hàng, xác thực đa lớp và mã hóa dữ liệu.',
  },
  {
    icon: Award,
    title: 'Khách Sạn Được Kiểm Duyệt',
    desc: 'Tuyển chọn chất lượng dịch vụ, phòng ốc và tiêu chuẩn nghỉ dưỡng.',
  },
  {
    icon: Headphones,
    title: 'Hỗ Trợ Đặt Phòng 24/7',
    desc: 'Đội ngũ chuyên nghiệp luôn đồng hành suốt quá trình lưu trú.',
  },
  {
    icon: RefreshCw,
    title: 'Hủy & Hoàn Theo Chính Sách',
    desc: 'Quy trình xét duyệt nhanh chóng và minh bạch qua hệ thống.',
  },
];

export default function LuxuryTrustStrip() {
  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {TRUST_ITEMS.map((item, idx) => {
          const Icon = item.icon;
          return (
            <div
              key={idx}
              className="p-5 sm:p-6 rounded-2xl bg-white border border-[#1E4752]/10 shadow-xs hover:shadow-md transition-shadow duration-300 flex items-start gap-4"
            >
              <div className="w-12 h-12 rounded-xl bg-[#E8A700]/10 border border-[#E8A700]/25 flex items-center justify-center shrink-0">
                <Icon className="w-6 h-6 text-[#E8A700]" />
              </div>
              <div className="space-y-1">
                <h3 className="text-sm font-extrabold text-[#1E4752] leading-snug">
                  {item.title}
                </h3>
                <p className="text-xs text-[#1E4752]/65 leading-relaxed font-normal">
                  {item.desc}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
