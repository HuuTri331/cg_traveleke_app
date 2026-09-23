'use client';

import React, { Suspense, useEffect, useState, useMemo } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import {
  User,
  Mail,
  CheckCircle2,
  FileText,
  Clock,
  Users,
  BedDouble,
  UtensilsCrossed,
  CalendarCheck,
  RotateCcw,
  Info,
  Tag,
  ChevronUp,
  ChevronDown,
  MapPin,
  Star,
  ShieldCheck,
  Building2,
} from 'lucide-react';

import HeaderCommon from '@/components/common/HeaderCommon';
import FooterCommon from '@/components/common/FooterCommon';
import { useCustomerAuth } from '@/features/auth/context/CustomerAuthContext';
import { hotelDetailApi, type HotelDetail } from '@/services/api/hotel-detail.api';

interface PendingBookingData {
  hotelId?: string | number | null;
  hotelName?: string;
  hotelAddress?: string;
  hotelStar?: number | null;
  hotelImage?: string | null;
  roomId?: string | number;
  roomName?: string;
  roomPrice?: number | string;
  bedCount?: number;
  bedType?: string;
  maxAdults?: number;
  availableRooms?: number;
  checkInTime?: string;
  checkOutTime?: string;
}

function ProcessOrderContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { customer, isCustomerAuthenticated, isCustomerLoading } = useCustomerAuth();

  const roomIdParam = searchParams.get('roomId');
  const hotelIdParam = searchParams.get('hotelId');

  // Booking data state
  const [bookingData, setBookingData] = useState<PendingBookingData | null>(null);
  const [loadingDetails, setLoadingDetails] = useState(false);

  // Guest details form state
  const [surname, setSurname] = useState('');
  const [givenName, setGivenName] = useState('');
  const [email, setEmail] = useState('');
  const [countryCode, setCountryCode] = useState('+84');
  const [mobileNumber, setMobileNumber] = useState('');

  // Special requests
  const [nonSmoking, setNonSmoking] = useState(false);
  const [connectingRooms, setConnectingRooms] = useState(false);
  const [highFloor, setHighFloor] = useState(false);

  // Countdown timer for price guarantee (15 minutes countdown)
  const [secondsLeft, setSecondsLeft] = useState(899);

  // UI accordion state
  const [isPriceOpen, setIsPriceOpen] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  // Countdown clock effect
  useEffect(() => {
    const interval = setInterval(() => {
      setSecondsLeft((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const timerDisplay = useMemo(() => {
    const mins = Math.floor(secondsLeft / 60);
    const secs = secondsLeft % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  }, [secondsLeft]);

  // 1. Authentication check
  useEffect(() => {
    if (!isCustomerLoading && !isCustomerAuthenticated) {
      const redirectUrl = `/process-order?roomId=${roomIdParam || ''}&hotelId=${hotelIdParam || ''}`;
      router.push(`/customer-login?redirect=${encodeURIComponent(redirectUrl)}`);
    }
  }, [isCustomerLoading, isCustomerAuthenticated, roomIdParam, hotelIdParam, router]);

  // 2. Pre-fill customer details once authenticated
  useEffect(() => {
    if (customer) {
      if (customer.email && !email) {
        setEmail(customer.email);
      }
      if (customer.phone && !mobileNumber) {
        const cleanPhone = customer.phone.replace(/^\+84/, '').replace(/^0/, '');
        setMobileNumber(cleanPhone);
      }
      if (customer.fullName && !surname && !givenName) {
        const parts = customer.fullName.trim().split(' ');
        if (parts.length > 1) {
          setSurname(parts[0]);
          setGivenName(parts.slice(1).join(' '));
        } else {
          setSurname(customer.fullName.trim());
          setGivenName(customer.fullName.trim());
        }
      }
    }
  }, [customer, email, mobileNumber, surname, givenName]);

  // 3. Retrieve Pending Booking Data from Session or fetch from API
  useEffect(() => {
    let loadedFromSession = false;
    if (typeof window !== 'undefined') {
      try {
        const cachedStr = sessionStorage.getItem('traveleke_pending_order');
        if (cachedStr) {
          const parsed = JSON.parse(cachedStr);
          if (parsed && (!roomIdParam || String(parsed.roomId) === String(roomIdParam))) {
            setBookingData(parsed);
            loadedFromSession = true;
          }
        }
      } catch (err) {
        console.error('Lỗi đọc session pending order:', err);
      }
    }

    if (!loadedFromSession && hotelIdParam) {
      setLoadingDetails(true);
      Promise.all([
        hotelDetailApi.getHotelDetail(hotelIdParam).catch(() => null),
        hotelDetailApi.getRoomsOfHotel(hotelIdParam).catch(() => []),
      ])
        .then(([hotelDetail, roomsList]) => {
          const selectedRoom = Array.isArray(roomsList)
            ? roomsList.find((r) => String(r.id) === String(roomIdParam)) || roomsList[0]
            : null;

          const h = hotelDetail as HotelDetail | null;
          const fallbackData: PendingBookingData = {
            hotelId: h?.id || hotelIdParam,
            hotelName: h?.name || 'Khách sạn liên kết',
            hotelAddress: h?.address || 'Việt Nam',
            hotelStar: h?.starRating || 5,
            hotelImage: h?.images?.[0]?.imageUrl || h?.coverImageUrl || null,
            roomId: selectedRoom?.id || roomIdParam || '1',
            roomName: selectedRoom?.name || 'Phòng nghỉ cao cấp',
            roomPrice: selectedRoom?.pricePerNight || 392990,
            bedCount: selectedRoom?.bedCount || 1,
            bedType: selectedRoom?.bedType || 'Giường Đôi',
            maxAdults: selectedRoom?.maxAdults || 2,
            availableRooms: selectedRoom?.availableRooms || 1,
            checkInTime: h?.checkInTime || '14:00:00',
            checkOutTime: h?.checkOutTime || '12:00:00',
          };
          setBookingData(fallbackData);
        })
        .finally(() => {
          setLoadingDetails(false);
        });
    }
  }, [hotelIdParam, roomIdParam]);

  // Price calculations: parse strictly as clean numbers to avoid string concatenation bugs!
  const roomPrice = Math.round(parseFloat(String(bookingData?.roomPrice || '0')) || 392990);
  // Giá phòng đã bao gồm đầy đủ thuế và phí
  const taxesAndFees = 0;
  const totalPrice = roomPrice;

  const formattedRoomPrice = useMemo(() => {
    return Number(roomPrice).toLocaleString('vi-VN');
  }, [roomPrice]);

  const formattedTotal = useMemo(() => {
    return Number(totalPrice).toLocaleString('vi-VN');
  }, [totalPrice]);

  // Dates formatting
  const checkInDateStr = 'Thứ Ba, 29/09';
  const checkOutDateStr = 'Thứ Tư, 30/09';

  // Validation & Continue handler
  const handleContinue = (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: { [key: string]: string } = {};

    if (!surname.trim()) {
      newErrors.surname = 'Vui lòng nhập họ của khách lưu trú';
    }
    if (!givenName.trim()) {
      newErrors.givenName = 'Vui lòng nhập tên đệm và tên của khách';
    }
    if (!email.trim()) {
      newErrors.email = 'Vui lòng nhập địa chỉ email nhận xác nhận';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      newErrors.email = 'Địa chỉ email không hợp lệ';
    }
    if (!mobileNumber.trim()) {
      newErrors.mobileNumber = 'Vui lòng nhập số điện thoại liên hệ';
    } else if (!/^[0-9]{8,12}$/.test(mobileNumber.trim().replace(/\s+/g, ''))) {
      newErrors.mobileNumber = 'Số điện thoại phải từ 8 - 12 chữ số';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      window.scrollTo({ top: 100, behavior: 'smooth' });
      return;
    }

    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      setShowSuccessModal(true);
    }, 600);
  };

  if (isCustomerLoading || loadingDetails) {
    return (
      <div className="min-h-screen bg-[#f2f4f7] flex flex-col items-center justify-center gap-3">
        <div className="w-11 h-11 border-4 border-[#0194f3] border-t-transparent rounded-full animate-spin" />
        <p className="text-sm font-semibold text-gray-500">Đang tải thông tin đặt phòng...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f2f4f7] font-sans antialiased text-gray-800 selection:bg-blue-100">
      {/* Navigation Header */}
      <HeaderCommon />

      {/* Main Process Order Container */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-6 lg:py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start">
          {/* ========================================================= */}
          {/* LEFT COLUMN: Guest & Contact Forms, Requests & Policies */}
          {/* ========================================================= */}
          <div className="lg:col-span-7 space-y-6">
            {/* 1. Guest Detail Card */}
            <div className="bg-white rounded-2xl p-5 sm:p-6 shadow-xs border border-gray-200/70">
              <div className="flex items-center gap-3 mb-1">
                <User className="w-5 h-5 text-[#0194f3] stroke-[2.2]" />
                <h2 className="text-base sm:text-lg font-bold text-gray-900">
                  Thông Tin Khách Lưu Trú
                </h2>
              </div>
              <p className="text-xs text-gray-500 ml-8 mb-4">
                Điền chính xác thông tin như trên CCCD/Hộ chiếu để lễ tân đối soát khi nhận phòng
              </p>

              {/* Tinted blue form box */}
              <div className="bg-[#f2f8fd] border border-[#e5f0fa] rounded-2xl p-4 sm:p-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Surname / Last Name */}
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1.5">
                      Họ của khách (vd: NGUYEN)<span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={surname}
                      onChange={(e) => {
                        setSurname(e.target.value);
                        if (errors.surname) setErrors((prev) => ({ ...prev, surname: '' }));
                      }}
                      className={`w-full px-3.5 py-2.5 bg-white border ${
                        errors.surname ? 'border-red-500 ring-1 ring-red-400' : 'border-gray-300 focus:border-[#0194f3]'
                      } rounded-xl text-sm font-medium text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-[#0194f3] transition-all`}
                      placeholder="NGUYEN"
                    />
                    <span className="block text-xs-plus text-gray-400 mt-1">
                      (Không bao gồm danh xưng và dấu câu)
                    </span>
                    {errors.surname && (
                      <span className="text-xs-plus text-red-500 font-medium mt-0.5 block">
                        {errors.surname}
                      </span>
                    )}
                  </div>

                  {/* Given / Middle & First Name */}
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1.5">
                      Tên đệm & Tên (vd: VAN ANH)<span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={givenName}
                      onChange={(e) => {
                        setGivenName(e.target.value);
                        if (errors.givenName) setErrors((prev) => ({ ...prev, givenName: '' }));
                      }}
                      className={`w-full px-3.5 py-2.5 bg-white border ${
                        errors.givenName ? 'border-red-500 ring-1 ring-red-400' : 'border-gray-300 focus:border-[#0194f3]'
                      } rounded-xl text-sm font-medium text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-[#0194f3] transition-all`}
                      placeholder="VAN ANH"
                    />
                    <span className="block text-xs-plus text-gray-400 mt-1">
                      (Như trên Căn cước công dân hoặc Hộ chiếu)
                    </span>
                    {errors.givenName && (
                      <span className="text-xs-plus text-red-500 font-medium mt-0.5 block">
                        {errors.givenName}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* 2. Booking Contact Card */}
            <div className="bg-white rounded-2xl p-5 sm:p-6 shadow-xs border border-gray-200/70">
              <div className="flex items-center gap-3 mb-1">
                <Mail className="w-5 h-5 text-[#0194f3] stroke-[2.2]" />
                <h2 className="text-base sm:text-lg font-bold text-gray-900">
                  Thông Tin Người Liên Hệ Đặt Chỗ
                </h2>
              </div>
              <p className="text-xs text-gray-500 ml-8 mb-4">
                Thông tin này sẽ được dùng để gửi phiếu xác nhận đặt phòng (Voucher) và vé điện tử
              </p>

              {/* Tinted blue form box with no overflow */}
              <div className="bg-[#f2f8fd] border border-[#e5f0fa] rounded-2xl p-4 sm:p-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full">
                  {/* Email */}
                  <div className="min-w-0">
                    <label className="block text-xs font-bold text-gray-700 mb-1.5">
                      Email nhận xác nhận<span className="text-red-500">*</span>
                    </label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => {
                        setEmail(e.target.value);
                        if (errors.email) setErrors((prev) => ({ ...prev, email: '' }));
                      }}
                      placeholder="you@gmail.com"
                      className={`w-full px-3.5 py-2.5 bg-white border ${
                        errors.email ? 'border-red-500 ring-1 ring-red-400' : 'border-gray-300 focus:border-[#0194f3]'
                      } rounded-xl text-sm font-medium text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-[#0194f3] transition-all`}
                    />
                    <span className="block text-xs-plus text-gray-400 mt-1">
                      Ví dụ: you@gmail.com
                    </span>
                    {errors.email && (
                      <span className="text-xs-plus text-red-500 font-medium mt-0.5 block">
                        {errors.email}
                      </span>
                    )}
                  </div>

                  {/* Mobile Number - Fixed with min-w-0 to prevent overflowing */}
                  <div className="min-w-0">
                    <label className="block text-xs font-bold text-gray-700 mb-1.5">
                      Số điện thoại liên hệ<span className="text-red-500">*</span>
                    </label>
                    <div className="flex items-center gap-2 min-w-0 w-full">
                      <div className="relative w-24 shrink-0">
                        <select
                          value={countryCode}
                          onChange={(e) => setCountryCode(e.target.value)}
                          className="w-full appearance-none px-3 py-2.5 bg-white border border-gray-300 rounded-xl text-sm font-semibold text-gray-800 focus:outline-none focus:border-[#0194f3] focus:ring-1 focus:ring-[#0194f3] cursor-pointer"
                        >
                          <option value="+84">+84 (VN)</option>
                          <option value="+1">+1 (US)</option>
                          <option value="+65">+65 (SG)</option>
                          <option value="+66">+66 (TH)</option>
                          <option value="+81">+81 (JP)</option>
                          <option value="+82">+82 (KR)</option>
                        </select>
                        <ChevronDown className="w-4 h-4 text-gray-500 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                      </div>
                      <input
                        type="tel"
                        value={mobileNumber}
                        onChange={(e) => {
                          setMobileNumber(e.target.value);
                          if (errors.mobileNumber) setErrors((prev) => ({ ...prev, mobileNumber: '' }));
                        }}
                        placeholder="0989 479 840"
                        className={`min-w-0 flex-1 px-3.5 py-2.5 bg-white border ${
                          errors.mobileNumber ? 'border-red-500 ring-1 ring-red-400' : 'border-gray-300 focus:border-[#0194f3]'
                        } rounded-xl text-sm font-medium text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-[#0194f3] transition-all`}
                      />
                    </div>
                    <span className="block text-xs-plus text-gray-400 mt-1">
                      Số điện thoại để lễ tân khách sạn liên hệ khi cần thiết
                    </span>
                    {errors.mobileNumber && (
                      <span className="text-xs-plus text-red-500 font-medium mt-0.5 block">
                        {errors.mobileNumber}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* 3. Special Request Card */}
            <div className="bg-white rounded-2xl p-5 sm:p-6 shadow-xs border border-gray-200/70">
              <div className="flex items-center gap-3 mb-1">
                <CheckCircle2 className="w-5 h-5 text-[#0194f3] stroke-[2.2]" />
                <h2 className="text-base sm:text-lg font-bold text-gray-900">Yêu Cầu Đặc Biệt</h2>
              </div>
              <p className="text-xs text-gray-500 ml-8 leading-relaxed mb-5">
                Mọi yêu cầu đặc biệt tùy thuộc vào tình trạng phòng sẵn có của khách sạn tại thời điểm nhận phòng và không thể đảm bảo trước. Nhận phòng sớm hoặc đưa đón sân bay có thể phát sinh phụ phí. Vui lòng liên hệ trực tiếp với nhân viên khách sạn để được phục vụ tốt nhất.
              </p>

              {/* Checkboxes */}
              <div className="flex flex-wrap items-center gap-4 sm:gap-6 ml-1">
                <label className="flex items-center gap-2.5 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={nonSmoking}
                    onChange={(e) => setNonSmoking(e.target.checked)}
                    className="w-5 h-5 rounded-md border-2 border-[#0194f3] text-[#0194f3] focus:ring-[#0194f3] cursor-pointer"
                  />
                  <span className="text-xs font-semibold text-gray-800">Phòng không hút thuốc</span>
                </label>

                <label className="flex items-center gap-2.5 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={connectingRooms}
                    onChange={(e) => setConnectingRooms(e.target.checked)}
                    className="w-5 h-5 rounded-md border-2 border-[#0194f3] text-[#0194f3] focus:ring-[#0194f3] cursor-pointer"
                  />
                  <span className="text-xs font-semibold text-gray-800">Phòng thông nhau</span>
                </label>

                <label className="flex items-center gap-2.5 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={highFloor}
                    onChange={(e) => setHighFloor(e.target.checked)}
                    className="w-5 h-5 rounded-md border-2 border-[#0194f3] text-[#0194f3] focus:ring-[#0194f3] cursor-pointer"
                  />
                  <span className="text-xs font-semibold text-gray-800">Phòng tầng cao</span>
                </label>
              </div>

              <div className="mt-4">
                <button
                  type="button"
                  onClick={() => alert('Chi tiết yêu cầu đặc biệt: Khách sạn sẽ cố gắng đáp ứng tùy theo khả năng và tình trạng phòng thực tế khi nhận phòng.')}
                  className="text-xs font-bold text-[#0194f3] hover:underline cursor-pointer"
                >
                  Xem chi tiết chính sách
                </button>
              </div>
            </div>

            {/* 4. Accommodation Policies Card */}
            <div className="bg-white rounded-2xl p-5 sm:p-6 shadow-xs border border-gray-200/70">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-3">
                  <FileText className="w-5 h-5 text-[#0194f3] stroke-[2.2]" />
                  <h2 className="text-base sm:text-lg font-bold text-gray-900">
                    Quy Định & Chính Sách Lưu Trú
                  </h2>
                </div>
                <button
                  type="button"
                  onClick={() => alert('Chính sách lưu trú: Bắt buộc mang CCCD/Hộ chiếu gốc hoặc VNeID mức 2. Khách dưới 18 tuổi cần có người lớn đi kèm.')}
                  className="text-xs font-bold text-[#0194f3] hover:underline cursor-pointer"
                >
                  Xem toàn bộ
                </button>
              </div>

              {/* Blue Alert Callout Box */}
              <div className="bg-[#eaf5fc] border border-[#d6ebf8] rounded-xl p-4 mt-3">
                <div className="flex items-center gap-2 text-[#0194f3] font-bold text-xs mb-1.5">
                  <Info className="w-4 h-4 shrink-0 fill-[#0194f3] text-white" />
                  <span>Lưu ý quan trọng</span>
                </div>
                <p className="text-xs text-gray-700 leading-relaxed font-normal">
                  <strong>Chính sách giấy tờ tùy thân:</strong> Khi làm thủ tục nhận phòng, quý khách bắt buộc phải xuất trình Căn cước công dân (CCCD) hoặc Hộ chiếu còn hạn sử dụng (chấp nhận bản gốc hoặc tài khoản định danh điện tử VNeID).
                  <br className="mb-1" />
                  <strong>Độ tuổi nhận phòng tối thiểu:</strong> Khách đứng tên làm thủ tục nhận phòng phải từ đủ 18 tuổi trở lên. Khách dưới 18 tuổi bắt buộc phải có người lớn đi kèm bảo hộ.
                </p>
              </div>

              {/* Required Documents Section */}
              <div className="mt-4 flex items-start gap-2.5">
                <FileText className="w-4 h-4 text-gray-600 shrink-0 mt-0.5" />
                <div>
                  <h3 className="text-xs font-bold text-gray-900 mb-0.5">Giấy tờ cần xuất trình</h3>
                  <p className="text-xs text-gray-600 leading-relaxed">
                    Khi nhận phòng tại quầy lễ tân, quý khách vui lòng xuất trình CCCD/Hộ chiếu trùng khớp với họ tên người lưu trú trên đơn đặt phòng.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* ========================================================= */}
          {/* RIGHT COLUMN: Room & Hotel Info, Price Details, Continue */}
          {/* ========================================================= */}
          <div className="lg:col-span-5 space-y-4 lg:sticky lg:top-6">
            {/* Room & Hotel Summary Card */}
            <div className="bg-white rounded-2xl p-5 shadow-xs border border-gray-200/70">
              {/* Urgency Pill with Animated Real-time Countdown Timer Clock */}
              <div className="bg-amber-50 border border-amber-200/80 rounded-2xl p-3.5 flex items-center justify-between shadow-xs mb-4">
                <div className="flex items-center gap-2.5">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-100 text-amber-600 animate-pulse shrink-0">
                    <Clock className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-gray-900 block">
                      Thời gian giữ giá ưu đãi
                    </span>
                    <span className="text-xs-plus text-amber-700 font-medium block">
                      Chỉ còn {bookingData?.availableRooms || 1} phòng giá tốt!
                    </span>
                  </div>
                </div>
                <div className="font-mono text-base font-extrabold text-amber-700 bg-white px-3 py-1.5 rounded-xl border border-amber-200 shadow-inner">
                  {timerDisplay}
                </div>
              </div>

              {/* Room Title */}
              <h3 className="text-base sm:text-lg font-bold text-gray-900 leading-snug">
                (1x) {bookingData?.roomName || 'Phòng nghỉ cao cấp'}
              </h3>
              <p className="text-xs font-bold text-rose-500 mt-1 mb-4">
                Chỉ còn {bookingData?.availableRooms || 1} phòng trống với mức giá này!
              </p>

              {/* Date Box */}
              <div className="bg-[#f8fafc] border border-gray-200/70 rounded-xl p-3.5 flex items-center justify-between text-center mb-4">
                <div className="text-left">
                  <span className="text-xs-plus text-gray-400 font-medium block">Nhận phòng</span>
                  <span className="text-xs sm:text-sm font-bold text-gray-900 block mt-0.5">
                    {checkInDateStr}
                  </span>
                  <span className="text-xs-plus text-gray-400 block mt-0.5">
                    Từ {bookingData?.checkInTime ? bookingData.checkInTime.slice(0, 5) : '14:00'}
                  </span>
                </div>

                <div className="flex flex-col items-center px-2">
                  <span className="text-xs text-gray-500 font-semibold mb-0.5">1 đêm</span>
                  <span className="text-gray-400 text-sm">➔</span>
                </div>

                <div className="text-right">
                  <span className="text-xs-plus text-gray-400 font-medium block">Trả phòng</span>
                  <span className="text-xs sm:text-sm font-bold text-gray-900 block mt-0.5">
                    {checkOutDateStr}
                  </span>
                  <span className="text-xs-plus text-gray-400 block mt-0.5">
                    Trước {bookingData?.checkOutTime ? bookingData.checkOutTime.slice(0, 5) : '12:00'}
                  </span>
                </div>
              </div>

              {/* Room Specs */}
              <div className="space-y-2.5 text-xs text-gray-700 pb-4 border-b border-gray-100">
                <div className="flex items-center gap-2.5 text-gray-700">
                  <Users className="w-4 h-4 text-gray-500 shrink-0" />
                  <span>{bookingData?.maxAdults || 2} người lớn</span>
                </div>
                <div className="flex items-center gap-2.5 text-gray-700">
                  <BedDouble className="w-4 h-4 text-gray-500 shrink-0" />
                  <span>{bookingData?.bedCount || 1} giường ({bookingData?.bedType || 'Giường Đôi'})</span>
                </div>
                <div className="flex items-center gap-2.5 text-gray-700">
                  <UtensilsCrossed className="w-4 h-4 text-gray-500 shrink-0" />
                  <span>Chưa bao gồm bữa sáng</span>
                </div>
                <div className="flex items-center gap-2.5 text-emerald-600 font-medium">
                  <CalendarCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Miễn phí hủy phòng trước ngày nhận phòng</span>
                </div>
                <div className="flex items-center gap-2.5 text-emerald-600 font-medium">
                  <RotateCcw className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Hỗ trợ đổi lịch trình linh hoạt</span>
                </div>
              </div>

              {/* Hotel Information Section (User requirement: thông tin khách sạn đặt ở cuối cùng của phần phòng) */}
              <div className="pt-4">
                <p className="text-xs-plus font-bold uppercase tracking-wider text-gray-400 mb-2">
                  Thông tin khách sạn
                </p>
                <div className="flex items-center gap-3">
                  <div className="w-14 h-14 rounded-xl overflow-hidden bg-gray-100 border border-gray-200 shrink-0">
                    {bookingData?.hotelImage ? (
                      <img
                        src={
                          bookingData.hotelImage.startsWith('http')
                            ? bookingData.hotelImage
                            : `http://localhost:3001${bookingData.hotelImage}`
                        }
                        alt={bookingData.hotelName || 'Khách sạn'}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          (e.target as HTMLElement).style.display = 'none';
                        }}
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-400 bg-blue-50">
                        <Building2 className="w-6 h-6 text-[#0194f3]" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-bold text-gray-900 truncate">
                      {bookingData?.hotelName || 'Khách sạn liên kết'}
                    </h4>
                    <div className="flex items-center gap-1 my-0.5">
                      {Array.from({ length: bookingData?.hotelStar || 5 }).map((_, idx) => (
                        <Star key={idx} className="w-3 h-3 text-amber-400 fill-amber-400" />
                      ))}
                    </div>
                    <p className="text-xs-plus text-gray-500 truncate flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-gray-400 shrink-0" />
                      {bookingData?.hotelAddress || 'Việt Nam'}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Price Details Card */}
            <div className="bg-white rounded-2xl p-5 shadow-xs border border-gray-200/70">
              {/* Notice text box */}
              <div className="bg-blue-50/60 border border-blue-100/60 rounded-xl p-3 flex items-start gap-2.5 mb-4 text-xs text-gray-600 leading-relaxed">
                <Info className="w-4 h-4 text-[#0194f3] shrink-0 mt-0.5" />
                <span>
                  Giá phòng đã bao gồm toàn bộ thuế VAT và phí dịch vụ. Quý khách không phải trả thêm bất kỳ phụ phí ẩn nào tại khách sạn.
                </span>
              </div>

              {/* Price Details Header */}
              <div
                onClick={() => setIsPriceOpen(!isPriceOpen)}
                className="flex items-center justify-between cursor-pointer py-1 select-none"
              >
                <div className="flex items-center gap-2.5">
                  <Tag className="w-5 h-5 text-gray-800 stroke-[2.2]" />
                  <h3 className="text-base font-bold text-gray-900">Chi tiết giá</h3>
                </div>
                {isPriceOpen ? (
                  <ChevronUp className="w-4 h-4 text-gray-500" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-gray-500" />
                )}
              </div>

              {/* Breakdown */}
              {isPriceOpen && (
                <div className="mt-4 space-y-3 pt-2">
                  <div className="flex items-start justify-between text-xs">
                    <div>
                      <span className="font-semibold text-gray-700 block">Tiền phòng</span>
                      <span className="text-xs-plus text-gray-400 mt-0.5 block">
                        (1x) {bookingData?.roomName || 'Phòng nghỉ cao cấp'} (1 Đêm)
                      </span>
                    </div>
                    <span className="font-semibold text-gray-800 shrink-0">
                      {formattedRoomPrice} VND
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-gray-700">Thuế và phí dịch vụ</span>
                    <span className="font-semibold text-emerald-600">Đã bao gồm</span>
                  </div>

                  <div className="border-t border-gray-200 pt-3 flex items-center justify-between">
                    <div>
                      <span className="text-sm font-bold text-gray-900 block">Tổng thanh toán</span>
                      <span className="text-xs-plus text-gray-400 block mt-0.5">1 phòng, 1 đêm</span>
                    </div>
                    <span className="text-xl font-extrabold text-[#f97316]">
                      {formattedTotal} VND
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Big Blue Continue Button */}
            <div>
              <button
                type="button"
                onClick={handleContinue}
                disabled={isSubmitting}
                className="w-full bg-[#0194f3] hover:bg-[#0082d6] active:bg-[#0073be] disabled:opacity-60 text-white font-bold py-3.5 px-6 rounded-2xl text-base shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                {isSubmitting ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Đang xử lý đặt phòng...</span>
                  </>
                ) : (
                  'Tiến Hành Thanh Toán'
                )}
              </button>

              {/* Disclaimer */}
              <p className="text-xs-plus text-gray-500 text-center mt-3 px-3 leading-relaxed">
                Bằng việc tiếp tục thanh toán, bạn đồng ý với{' '}
                <a href="#" className="underline hover:text-gray-800 font-semibold">
                  Điều khoản & Điều kiện
                </a>
                ,{' '}
                <a href="#" className="underline hover:text-gray-800 font-semibold">
                  Chính sách quyền riêng tư
                </a>
                {' '}và{' '}
                <a href="#" className="underline hover:text-gray-800 font-semibold">
                  Chính sách hoàn hủy phòng
                </a>{' '}
                của Traveleke.
              </p>
            </div>
          </div>
        </div>
      </main>

      {/* Confirmation / Ready to Pay Modal */}
      {showSuccessModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-gray-100 text-center">
            <div className="w-14 h-14 rounded-2xl bg-blue-50 text-[#0194f3] flex items-center justify-center mx-auto mb-4 text-2xl">
              <ShieldCheck className="w-8 h-8 text-[#0194f3]" />
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-2">
              Xác thực thông tin đặt phòng thành công!
            </h3>
            <p className="text-xs text-gray-600 leading-relaxed mb-4">
              Khách lưu trú: <strong>{surname} {givenName}</strong> ({email} - {countryCode}{mobileNumber}) cho phòng <strong>{bookingData?.roomName}</strong> tại <strong>{bookingData?.hotelName}</strong>.
            </p>
            <div className="bg-amber-50 rounded-xl p-3 text-xs text-amber-800 font-medium mb-6">
              Tổng tiền thanh toán: <strong className="text-base text-[#f97316]">{formattedTotal} VND</strong>
              <div className="text-xs-plus text-amber-700 mt-0.5">
                (Thông tin hợp lệ — sẵn sàng chuyển sang bước thanh toán an toàn)
              </div>
            </div>
            <button
              type="button"
              onClick={() => setShowSuccessModal(false)}
              className="w-full bg-[#0194f3] hover:bg-[#0082d6] text-white font-bold py-3 rounded-xl text-sm transition cursor-pointer"
            >
              Đóng & Hoàn tất kiểm tra
            </button>
          </div>
        </div>
      )}

      {/* Footer */}
      <FooterCommon />
    </div>
  );
}

export default function ProcessOrderPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#f7f9fa] flex items-center justify-center">
          <div className="w-10 h-10 border-4 border-[#0194f3] border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <ProcessOrderContent />
    </Suspense>
  );
}
