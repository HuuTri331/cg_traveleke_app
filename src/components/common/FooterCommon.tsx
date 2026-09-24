import Image from 'next/image';
import { FaFacebookF, FaInstagram, FaTiktok, FaYoutube, FaTelegramPlane } from 'react-icons/fa';

import iata from '@/assets/image/all.png';
import logo from '@/assets/image/logo.png';
import bsi from '@/assets/image/bsi.png';
import check from '@/assets/image/check.png';
import google from '@/assets/image/google.png';
import appstort from '@/assets/image/AppSrore.png';

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
    <footer className="bg-gray-900 p-8 text-white">
      <div className="container mx-auto">
        {/* Footer top */}
        <div className="flex flex-wrap items-start justify-between gap-8">
          {/* Logo + chứng nhận */}
          <div className="mb-4 w-full md:mb-0 md:w-1/4">
            <Image
              src={logo}
              alt="Traveloke Logo"
              className="mb-6 h-20 w-auto object-contain"
            />

            <div className="mb-4 flex items-center gap-6">
              <Image
                src={iata}
                alt="IATA"
                className="h-6 w-auto object-contain"
              />

              <Image
                src={bsi}
                alt="BSI"
                className="h-6 w-auto object-contain"
              />

              <Image
                src={check}
                alt="Đã đăng ký"
                className="h-6 w-auto object-contain"
              />
            </div>

            <button
              type="button"
              className="flex items-center rounded bg-gray-800 px-4 py-2 text-sm hover:bg-gray-700"
            >
              Hợp tác với Traveloka
            </button>
          </div>

          {/* Đối tác thanh toán */}
          <div className="mb-4 w-full md:mb-0 md:w-1/4">
            <h2 className="mb-4 font-bold">Đối tác thanh toán</h2>

            <div className="grid grid-cols-4 gap-2">
              {paymentPartners.map((src, index) => (
                <div
                  key={index}
                  className="flex items-center justify-center rounded bg-white p-2"
                >
                  <Image
                    src={src}
                    alt={`Payment partner ${index + 1}`}
                    className="h-8 w-auto object-contain"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Social */}
          <div className="w-full md:w-1/4">
            <h2 className="mb-4 font-bold">Theo dõi chúng tôi trên</h2>

            <div className="flex flex-col gap-3">
              <a
                href="#"
                className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
              >
                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-blue-600/20 text-blue-400 text-xs">
                  <FaFacebookF className="h-3.5 w-3.5" />
                </span>
                <span>Facebook</span>
              </a>

              <a
                href="#"
                className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
              >
                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-pink-600/20 text-pink-400 text-xs">
                  <FaInstagram className="h-3.5 w-3.5" />
                </span>
                <span>Instagram</span>
              </a>

              <a
                href="#"
                className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
              >
                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-gray-800 text-gray-300 text-xs">
                  <FaTiktok className="h-3.5 w-3.5" />
                </span>
                <span>TikTok</span>
              </a>

              <a
                href="#"
                className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
              >
                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-red-600/20 text-red-400 text-xs">
                  <FaYoutube className="h-3.5 w-3.5" />
                </span>
                <span>YouTube</span>
              </a>

              <a
                href="#"
                className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
              >
                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-sky-600/20 text-sky-400 text-xs">
                  <FaTelegramPlane className="h-3.5 w-3.5" />
                </span>
                <span>Telegram</span>
              </a>
            </div>
          </div>
        </div>

        {/* Footer links */}
        <div className="mt-10 grid grid-cols-1 gap-8 text-sm md:grid-cols-2 lg:grid-cols-4">
          {/* Về Traveloka */}
          <div>
            <h2 className="mb-4 font-bold">Về Traveloka</h2>

            <ul className="space-y-2">
              <li>
                <a
                  href="#"
                  className="text-gray-400 hover:text-white hover:underline"
                >
                  Cách đặt chỗ
                </a>
              </li>

              <li>
                <a
                  href="#"
                  className="text-gray-400 hover:text-white hover:underline"
                >
                  Liên hệ chúng tôi
                </a>
              </li>

              <li>
                <a
                  href="#"
                  className="text-gray-400 hover:text-white hover:underline"
                >
                  Trợ giúp
                </a>
              </li>

              <li>
                <a
                  href="#"
                  className="text-gray-400 hover:text-white hover:underline"
                >
                  Tuyển dụng
                </a>
              </li>

              <li>
                <a
                  href="#"
                  className="text-gray-400 hover:text-white hover:underline"
                >
                  Về chúng tôi
                </a>
              </li>
            </ul>
          </div>

          {/* Sản phẩm */}
          <div>
            <h2 className="mb-4 font-bold">Sản phẩm</h2>

            <ul className="space-y-2">
              <li>
                <a
                  href="#"
                  className="text-gray-400 hover:text-white hover:underline"
                >
                  Khách sạn
                </a>
              </li>

              <li>
                <a
                  href="#"
                  className="text-gray-400 hover:text-white hover:underline"
                >
                  Vé máy bay
                </a>
              </li>

              <li>
                <a
                  href="#"
                  className="text-gray-400 hover:text-white hover:underline"
                >
                  Vé xe khách
                </a>
              </li>

              <li>
                <a
                  href="#"
                  className="text-gray-400 hover:text-white hover:underline"
                >
                  Đưa đón sân bay
                </a>
              </li>

              <li>
                <a
                  href="#"
                  className="text-gray-400 hover:text-white hover:underline"
                >
                  Cho thuê xe
                </a>
              </li>

              <li>
                <a
                  href="#"
                  className="text-gray-400 hover:text-white hover:underline"
                >
                  Xperience
                </a>
              </li>

              <li>
                <a
                  href="#"
                  className="text-gray-400 hover:text-white hover:underline"
                >
                  Du thuyền
                </a>
              </li>

              <li>
                <a
                  href="#"
                  className="text-gray-400 hover:text-white hover:underline"
                >
                  Biệt thự
                </a>
              </li>

              <li>
                <a
                  href="#"
                  className="text-gray-400 hover:text-white hover:underline"
                >
                  Căn hộ
                </a>
              </li>
            </ul>
          </div>

          {/* Khác */}
          <div>
            <h2 className="mb-4 font-bold">Khác</h2>

            <ul className="space-y-2">
              <li>
                <a
                  href="#"
                  className="text-gray-400 hover:text-white hover:underline"
                >
                  Traveloke liên kết
                </a>
              </li>

              <li>
                <a
                  href="#"
                  className="text-gray-400 hover:text-white hover:underline"
                >
                  Traveloke Blog
                </a>
              </li>

              <li>
                <a
                  href="#"
                  className="text-gray-400 hover:text-white hover:underline"
                >
                  Chính sách quyền riêng tư
                </a>
              </li>

              <li>
                <a
                  href="#"
                  className="text-gray-400 hover:text-white hover:underline"
                >
                  Điều khoản & Điều kiện
                </a>
              </li>

              <li>
                <a
                  href="#"
                  className="text-gray-400 hover:text-white hover:underline"
                >
                  Quy chế hoạt động
                </a>
              </li>

              <li>
                <a
                  href="#"
                  className="text-gray-400 hover:text-white hover:underline"
                >
                  Đăng ký nơi nghỉ của bạn
                </a>
              </li>

              <li>
                <a
                  href="#"
                  className="text-gray-400 hover:text-white hover:underline"
                >
                  Đăng ký doanh nghiệp hoạt động du lịch của bạn
                </a>
              </li>

              <li>
                <a
                  href="#"
                  className="text-gray-400 hover:text-white hover:underline"
                >
                  Khu vực báo chí
                </a>
              </li>

              <li>
                <a
                  href="#"
                  className="text-gray-400 hover:text-white hover:underline"
                >
                  Chương trình tiết lộ lỗ hổng
                </a>
              </li>
            </ul>
          </div>

          {/* App */}
          <div>
            <h2 className="mb-4 font-bold">Tải ứng dụng Traveloka</h2>

            <div className="flex flex-col gap-3">
              <Image
                src={google}
                alt="Google Play"
                className="h-10 w-auto object-contain object-left"
              />

              <Image
                src={appstort}
                alt="App Store"
                className="h-10 w-auto object-contain object-left"
              />
            </div>
          </div>
        </div>

        {/* Copyright */}
        <div className="mt-10 border-t border-gray-700 pt-6">
          <p className="text-center text-xs leading-6 text-gray-400">
            Công ty TNHH Traveloka Việt Nam. Mã số ĐK: 0313581779.
            Tòa nhà An Phú, 117-119 Lý Chính Thắng, P. 7, Q. 3, TPHCM
          </p>

          <p className="mt-2 text-center text-sm font-bold text-gray-300">
            Copyright © 2024 Traveloka. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}