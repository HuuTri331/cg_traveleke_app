import Image from 'next/image';
import Link from 'next/link';
import { FaFacebookF, FaInstagram, FaTiktok, FaYoutube, FaTelegramPlane } from 'react-icons/fa';
import { ShieldCheck, Headphones, CreditCard, Sparkles } from 'lucide-react';

import logo from '@/assets/image/logo.png';
import visa from '@/assets/image/visa.png';
import visa1 from '@/assets/image/visa1.png';
import visa2 from '@/assets/image/visa2.png';
import visa3 from '@/assets/image/visa3.png';
import visa4 from '@/assets/image/visa4.png';
import visa5 from '@/assets/image/visa5.png';
import visa6 from '@/assets/image/visa6.png';
import visa7 from '@/assets/image/visa7.png';

export default function FooterCommon() {
  const paymentPartners = [
    visa,
    visa1,
    visa2,
    visa3,
    visa4,
    visa5,
    visa6,
    visa7,
  ];

  return (
    <footer className="w-full bg-[#1E4752] text-white pt-16 pb-12 border-t border-[#1E4752]/40">
      <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Top Assurance Bar */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 pb-12 mb-12 border-b border-white/10">
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-xl bg-white/10 flex items-center justify-center shrink-0 border border-white/10">
              <ShieldCheck className="w-5 h-5 text-[#E8A700]" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-white">Thanh Toán An Toàn</h4>
              <p className="text-xs text-white/65">Cổng VNPay mã hóa bảo mật cao</p>
            </div>
          </div>

          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-xl bg-white/10 flex items-center justify-center shrink-0 border border-white/10">
              <Sparkles className="w-5 h-5 text-[#E8A700]" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-white">Chất Lượng Tinh Tuyển</h4>
              <p className="text-xs text-white/65">Khách sạn & resort kiểm duyệt</p>
            </div>
          </div>

          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-xl bg-white/10 flex items-center justify-center shrink-0 border border-white/10">
              <Headphones className="w-5 h-5 text-[#E8A700]" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-white">Hỗ Trợ 24/7</h4>
              <p className="text-xs text-white/65">Chăm sóc khách hàng tận tâm</p>
            </div>
          </div>

          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-xl bg-white/10 flex items-center justify-center shrink-0 border border-white/10">
              <CreditCard className="w-5 h-5 text-[#E8A700]" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-white">Xác Nhận Realtime</h4>
              <p className="text-xs text-white/65">Giữ phòng và xử lý tức thì</p>
            </div>
          </div>
        </div>

        {/* Main Footer Links */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-8 lg:gap-12 pb-12">
          {/* Brand Col */}
          <div className="lg:col-span-4 space-y-4">
            <Link href="/" className="inline-block">
              <Image
                src={logo}
                alt="Traveleke Hospitality"
                className="h-12 w-auto object-contain brightness-0 invert opacity-95"
              />
            </Link>
            <p className="text-xs text-white/70 leading-relaxed max-w-sm">
              Traveleke — Nền tảng đặt phòng khách sạn và dịch vụ lưu trú cao cấp hàng đầu. Chúng tôi đồng hành cùng kỳ nghỉ trọn vẹn và xứng tầm của bạn.
            </p>
            <div className="pt-2 flex items-center gap-3">
              <a
                href="#"
                aria-label="Facebook"
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-[#E8A700] hover:text-[#1E4752] flex items-center justify-center text-white text-xs transition-colors"
              >
                <FaFacebookF />
              </a>
              <a
                href="#"
                aria-label="Instagram"
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-[#E8A700] hover:text-[#1E4752] flex items-center justify-center text-white text-xs transition-colors"
              >
                <FaInstagram />
              </a>
              <a
                href="#"
                aria-label="Youtube"
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-[#E8A700] hover:text-[#1E4752] flex items-center justify-center text-white text-xs transition-colors"
              >
                <FaYoutube />
              </a>
              <a
                href="#"
                aria-label="TikTok"
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-[#E8A700] hover:text-[#1E4752] flex items-center justify-center text-white text-xs transition-colors"
              >
                <FaTiktok />
              </a>
            </div>
          </div>

          {/* Col 2: About */}
          <div className="lg:col-span-2 space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-widest text-[#E8A700]">Về Traveleke</h3>
            <ul className="space-y-2 text-xs text-white/70">
              <li>
                <Link href="/" className="hover:text-[#E8A700] transition-colors">Về chúng tôi</Link>
              </li>
              <li>
                <Link href="/hotels_home" className="hover:text-[#E8A700] transition-colors">Hệ thống khách sạn</Link>
              </li>
              <li>
                <a href="#" className="hover:text-[#E8A700] transition-colors">Quy chế hoạt động</a>
              </li>
              <li>
                <a href="#" className="hover:text-[#E8A700] transition-colors">Tuyển dụng</a>
              </li>
            </ul>
          </div>

          {/* Col 3: Support & Policy */}
          <div className="lg:col-span-3 space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-widest text-[#E8A700]">Chính Sách & Hỗ Trợ</h3>
            <ul className="space-y-2 text-xs text-white/70">
              <li>
                <a href="#" className="hover:text-[#E8A700] transition-colors">Chính sách bảo mật</a>
              </li>
              <li>
                <a href="#" className="hover:text-[#E8A700] transition-colors">Điều khoản dịch vụ</a>
              </li>
              <li>
                <a href="#" className="hover:text-[#E8A700] transition-colors">Chính sách hủy & hoàn tiền</a>
              </li>
              <li>
                <a href="#" className="hover:text-[#E8A700] transition-colors">Hướng dẫn thanh toán VNPay</a>
              </li>
            </ul>
          </div>

          {/* Col 4: Payment Partners */}
          <div className="lg:col-span-3 space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-widest text-[#E8A700]">Cổng Thanh Toán</h3>
            <p className="text-xs text-white/70">
              Hỗ trợ thẻ ATM nội địa, Visa, Mastercard, JCB và QR Pay:
            </p>
            <div className="grid grid-cols-4 gap-2 pt-1">
              {paymentPartners.map((src, index) => (
                <div
                  key={index}
                  className="flex items-center justify-center rounded-lg bg-white p-1.5 shadow-xs"
                >
                  <Image
                    src={src}
                    alt={`Đối tác thanh toán ${index + 1}`}
                    className="h-6 w-auto object-contain"
                  />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom Copyright */}
        <div className="pt-8 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-white/50">
          <p>© 2026 Traveleke Hospitality Platform. Bảo lưu mọi quyền.</p>
          <div className="flex items-center gap-6">
            <span className="hover:text-white cursor-pointer">Bảo mật thông tin</span>
            <span className="hover:text-white cursor-pointer">Điều khoản sử dụng</span>
            <span className="hover:text-white cursor-pointer">Trợ giúp</span>
          </div>
        </div>
      </div>
    </footer>
  );
}