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
  Check,
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
  roomPrice?: number;
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

  // UI accordion state
  const [isPriceOpen, setIsPriceOpen] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

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
        // Strip out country code if included
        const cleanPhone = customer.phone.replace(/^\+84/, '').replace(/^0/, '');
        setMobileNumber(cleanPhone);
      }
      if (customer.fullName && !surname && !givenName) {
        const parts = customer.fullName.trim().split(' ');
        if (parts.length > 1) {
          setSurname(parts[0]);
          setGivenName(parts.slice(1).join(' '));
        } else {
          setSurname(parts[0]);
          setGivenName(parts[0]);
        }
      }
    }
  }, [customer]);

  // 3. Hydrate booking details from sessionStorage or fallback API
  useEffect(() => {
    let loadedData: PendingBookingData | null = null;
    if (typeof window !== 'undefined') {
      const stored = sessionStorage.getItem('traveleke_pending_order');
      if (stored) {
        try {
          loadedData = JSON.parse(stored);
          setBookingData(loadedData);
        } catch {
          // ignore error
        }
      }
    }

    // Fallback if accessed directly with params and no session
    if (!loadedData && (hotelIdParam || roomIdParam)) {
      setLoadingDetails(true);
      if (hotelIdParam) {
        hotelDetailApi
          .getHotelDetail(hotelIdParam)
          .then((hotel) => {
            setBookingData((prev) => ({
              ...prev,
              hotelId: hotel.id,
              hotelName: hotel.name,
              hotelAddress: hotel.address,
              hotelStar: hotel.starRating,
              hotelImage: hotel.images?.[0]?.imageUrl || null,
              checkInTime: hotel.checkInTime || '14:00:00',
              checkOutTime: hotel.checkOutTime || '12:00:00',
              roomId: roomIdParam || 1,
              roomName: prev?.roomName || 'Standard Twin Room No Window',
              roomPrice: prev?.roomPrice || 392990,
              bedCount: 2,
              bedType: 'Twin',
              maxAdults: 2,
              availableRooms: 1,
            }));
          })
          .catch(() => {
            // Default mock data matching image
            setBookingData({
              hotelName: 'Khách sạn liên kết Traveleke',
              hotelAddress: 'Việt Nam',
              hotelStar: 5,
              roomName: 'Standard Twin Room No Window',
              roomPrice: 392990,
              bedCount: 2,
              bedType: 'Twin',
              maxAdults: 2,
              availableRooms: 1,
              checkInTime: '14:00:00',
              checkOutTime: '12:00:00',
            });
          })
          .finally(() => setLoadingDetails(false));
      } else {
        setBookingData({
          hotelName: 'Khách sạn liên kết Traveleke',
          hotelAddress: 'Việt Nam',
          hotelStar: 5,
          roomName: 'Standard Twin Room No Window',
          roomPrice: 392990,
          bedCount: 2,
          bedType: 'Twin',
          maxAdults: 2,
          availableRooms: 1,
          checkInTime: '14:00:00',
          checkOutTime: '12:00:00',
        });
        setLoadingDetails(false);
      }
    } else if (!loadedData) {
      // Default sample fallback to match mockup
      setBookingData({
        hotelName: 'Traveleke Luxury Hotel & Spa',
        hotelAddress: 'Hồ Chí Minh, Việt Nam',
        hotelStar: 5,
        roomName: 'Standard Twin Room No Window',
        roomPrice: 392990,
        bedCount: 2,
        bedType: 'Twin',
        maxAdults: 2,
        availableRooms: 1,
        checkInTime: '14:00:00',
        checkOutTime: '12:00:00',
      });
    }
  }, [hotelIdParam, roomIdParam]);

  // Price calculations
  const roomPrice = bookingData?.roomPrice || 392990;
  // Standard hotel taxes & recovery fees (~13.58% matching exact 53.373 on 392.990)
  const taxesAndFees = Math.round(roomPrice * 0.1358126);
  const totalPrice = roomPrice + taxesAndFees;

  const formattedRoomPrice = useMemo(() => {
    return Number(roomPrice).toLocaleString('vi-VN');
  }, [roomPrice]);

  const formattedTaxes = useMemo(() => {
    return Number(taxesAndFees).toLocaleString('vi-VN');
  }, [taxesAndFees]);

  const formattedTotal = useMemo(() => {
    return Number(totalPrice).toLocaleString('vi-VN');
  }, [totalPrice]);

  // Dates formatting (defaults to upcoming dates: Tue 29 Sep -> Wed 30 Sep or dynamically next week)
  const checkInDateStr = 'Tue, 29 Sep';
  const checkOutDateStr = 'Wed, 30 Sep';

  // Validation & Continue handler
  const handleContinue = (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: { [key: string]: string } = {};

    if (!surname.trim()) {
      newErrors.surname = 'Vui lòng nhập họ (Surname/Last Name)';
    }
    if (!givenName.trim()) {
      newErrors.givenName = 'Vui lòng nhập tên (Given/Middle & First Name)';
    }
    if (!email.trim()) {
      newErrors.email = 'Vui lòng nhập địa chỉ email';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      newErrors.email = 'Địa chỉ email không hợp lệ';
    }
    if (!mobileNumber.trim()) {
      newErrors.mobileNumber = 'Vui lòng nhập số điện thoại';
    } else if (mobileNumber.replace(/\D/g, '').length < 8) {
      newErrors.mobileNumber = 'Số điện thoại không hợp lệ';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      window.scrollTo({ top: 120, behavior: 'smooth' });
      return;
    }

    setErrors({});
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      setShowSuccessModal(true);
    }, 600);
  };

  if (isCustomerLoading || loadingDetails) {
    return (
      <div className="min-h-screen bg-[#f7f9fa] flex items-center justify-center">
        <div className="text-center p-8">
          <div className="w-12 h-12 border-4 border-[#0194f3] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600 font-medium text-sm">Đang nạp thông tin đơn đặt phòng...</p>
        </div>
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
            {/* Top Yellow Notification Banner */}
            <div className="bg-[#fffde7] border border-[#fef08a] rounded-2xl p-4 sm:px-5 sm:py-3.5 flex items-center justify-between shadow-xs">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 shrink-0 flex items-center justify-center rounded-xl bg-amber-100/70 text-2xl">
                  🎁
                </div>
                <div>
                  <p className="text-xs sm:text-sm font-semibold text-gray-800">
                    Log in now for easier access to your bookings
                  </p>
                  {customer && (
                    <p className="text-[11px] text-gray-500 font-medium mt-0.5">
                      Đã đăng nhập: <span className="font-semibold text-gray-700">{customer.fullName || customer.email}</span>
                    </p>
                  )}
                </div>
              </div>
              <div className="shrink-0 pl-2">
                {customer ? (
                  <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                    <Check className="w-3.5 h-3.5" /> Đã xác thực
                  </span>
                ) : (
                  <Link
                    href={`/customer-login?redirect=${encodeURIComponent('/process-order')}`}
                    className="text-xs sm:text-sm font-bold text-[#0194f3] hover:underline hover:text-blue-700"
                  >
                    Log in / Register
                  </Link>
                )}
              </div>
            </div>

            {/* 1. Guest Detail Card */}
            <div className="bg-white rounded-2xl p-5 sm:p-6 shadow-xs border border-gray-200/70">
              <div className="flex items-center gap-3 mb-1">
                <User className="w-5 h-5 text-gray-800 stroke-[2.2]" />
                <h2 className="text-base sm:text-lg font-bold text-gray-900">Guest Detail</h2>
              </div>
              <p className="text-xs text-gray-500 ml-8 mb-4">
                Fill in all columns correctly to receive order confirmation
              </p>

              {/* Tinted blue form box */}
              <div className="bg-[#f2f8fd] border border-[#e5f0fa] rounded-2xl p-4 sm:p-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Surname / Last Name */}
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1.5">
                      Surname/Last Name (ex: NGUYEN)<span className="text-red-500">*</span>
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
                      placeholder=""
                    />
                    <span className="block text-[11px] text-gray-400 mt-1">
                      (without title and punctuation)
                    </span>
                    {errors.surname && (
                      <span className="text-[11px] text-red-500 font-medium mt-0.5 block">
                        {errors.surname}
                      </span>
                    )}
                  </div>

                  {/* Given / Middle & First Name */}
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1.5">
                      Given/Middle & First Name (ex: VAN ANH)<span className="text-red-500">*</span>
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
                      placeholder=""
                    />
                    <span className="block text-[11px] text-gray-400 mt-1">
                      (without title and punctuation)
                    </span>
                    {errors.givenName && (
                      <span className="text-[11px] text-red-500 font-medium mt-0.5 block">
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
                <Mail className="w-5 h-5 text-gray-800 stroke-[2.2]" />
                <h2 className="text-base sm:text-lg font-bold text-gray-900">Booking Contact</h2>
              </div>
              <p className="text-xs text-gray-500 ml-8 mb-4">
                Please fill in all fields correctly to receive your booking confirmation.
              </p>

              {/* Tinted blue form box */}
              <div className="bg-[#f2f8fd] border border-[#e5f0fa] rounded-2xl p-4 sm:p-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Email */}
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1.5">
                      Email<span className="text-red-500">*</span>
                    </label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => {
                        setEmail(e.target.value);
                        if (errors.email) setErrors((prev) => ({ ...prev, email: '' }));
                      }}
                      placeholder="your_email@mail.com"
                      className={`w-full px-3.5 py-2.5 bg-white border ${
                        errors.email ? 'border-red-500 ring-1 ring-red-400' : 'border-gray-300 focus:border-[#0194f3]'
                      } rounded-xl text-sm font-medium text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-[#0194f3] transition-all`}
                    />
                    <span className="block text-[11px] text-gray-400 mt-1">
                      e.g. email@example.com
                    </span>
                    {errors.email && (
                      <span className="text-[11px] text-red-500 font-medium mt-0.5 block">
                        {errors.email}
                      </span>
                    )}
                  </div>

                  {/* Mobile Number */}
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1.5">
                      Mobile Number<span className="text-red-500">*</span>
                    </label>
                    <div className="flex items-center gap-2">
                      <div className="relative w-24 shrink-0">
                        <select
                          value={countryCode}
                          onChange={(e) => setCountryCode(e.target.value)}
                          className="w-full appearance-none px-3 py-2.5 bg-white border border-gray-300 rounded-xl text-sm font-semibold text-gray-800 focus:outline-none focus:border-[#0194f3] focus:ring-1 focus:ring-[#0194f3] cursor-pointer"
                        >
                          <option value="+84">+84</option>
                          <option value="+1">+1</option>
                          <option value="+65">+65</option>
                          <option value="+66">+66</option>
                          <option value="+81">+81</option>
                          <option value="+82">+82</option>
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
                        placeholder=""
                        className={`flex-1 px-3.5 py-2.5 bg-white border ${
                          errors.mobileNumber ? 'border-red-500 ring-1 ring-red-400' : 'border-gray-300 focus:border-[#0194f3]'
                        } rounded-xl text-sm font-medium text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-[#0194f3] transition-all`}
                      />
                    </div>
                    <span className="block text-[11px] text-gray-400 mt-1">
                      Input phone number without the selected country/region code
                    </span>
                    {errors.mobileNumber && (
                      <span className="text-[11px] text-red-500 font-medium mt-0.5 block">
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
                <CheckCircle2 className="w-5 h-5 text-gray-800 stroke-[2.2]" />
                <h2 className="text-base sm:text-lg font-bold text-gray-900">Special Request</h2>
              </div>
              <p className="text-xs text-gray-500 ml-8 leading-relaxed mb-5">
                All special requests are subject to availability and thus are not guaranteed. Early check-in or Airport Transfer may incur additional charges. Please contact hotel staff directly for further information.
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
                  <span className="text-xs font-semibold text-gray-800">Non-smoking Room</span>
                </label>

                <label className="flex items-center gap-2.5 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={connectingRooms}
                    onChange={(e) => setConnectingRooms(e.target.checked)}
                    className="w-5 h-5 rounded-md border-2 border-[#0194f3] text-[#0194f3] focus:ring-[#0194f3] cursor-pointer"
                  />
                  <span className="text-xs font-semibold text-gray-800">Connecting Rooms</span>
                </label>

                <label className="flex items-center gap-2.5 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={highFloor}
                    onChange={(e) => setHighFloor(e.target.checked)}
                    className="w-5 h-5 rounded-md border-2 border-[#0194f3] text-[#0194f3] focus:ring-[#0194f3] cursor-pointer"
                  />
                  <span className="text-xs font-semibold text-gray-800">High Floor</span>
                </label>
              </div>

              <div className="mt-4">
                <button
                  type="button"
                  onClick={() => alert('Chi tiết yêu cầu đặc biệt: Khách sạn sẽ cố gắng hỗ trợ tuỳ theo tình trạng phòng thực tế.')}
                  className="text-xs font-bold text-[#0194f3] hover:underline cursor-pointer"
                >
                  Read All
                </button>
              </div>
            </div>

            {/* 4. Accommodation Policies Card */}
            <div className="bg-white rounded-2xl p-5 sm:p-6 shadow-xs border border-gray-200/70">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-3">
                  <FileText className="w-5 h-5 text-gray-800 stroke-[2.2]" />
                  <h2 className="text-base sm:text-lg font-bold text-gray-900">Accommodation Policies</h2>
                </div>
                <button
                  type="button"
                  onClick={() => alert('Chính sách lưu trú đầy đủ: Yêu cầu CMND/CCCD hoặc Hộ chiếu khi nhận phòng. Khách dưới 18 tuổi cần có người lớn đi kèm.')}
                  className="text-xs font-bold text-[#0194f3] hover:underline cursor-pointer"
                >
                  Read All
                </button>
              </div>

              {/* Blue Alert Callout Box */}
              <div className="bg-[#eaf5fc] border border-[#d6ebf8] rounded-xl p-4 mt-3">
                <div className="flex items-center gap-2 text-[#0194f3] font-bold text-xs mb-1.5">
                  <Info className="w-4 h-4 shrink-0 fill-[#0194f3] text-white" />
                  <span>Important Note</span>
                </div>
                <p className="text-xs text-gray-700 leading-relaxed font-normal">
                  Document Policy Upon check-in, you are required to bring ID Card. The required documents can be in the form of soft copy.
                  <br className="mb-1" />
                  Minimum Age for Check-in Policy Minimum age to check-in is 18. Minor guests must be accompanied by adults upon check-in.
                </p>
              </div>

              {/* Required Documents Section */}
              <div className="mt-4 flex items-start gap-2.5">
                <FileText className="w-4 h-4 text-gray-600 shrink-0 mt-0.5" />
                <div>
                  <h3 className="text-xs font-bold text-gray-900 mb-0.5">Required Documents</h3>
                  <p className="text-xs text-gray-600 leading-relaxed">
                    Upon check-in, you are required to bring ID Card. The required documents can be in the form of soft copy.
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
              {/* Urgency Pill Alert */}
              <div className="bg-[#e8f4fd] border border-blue-100/70 text-[#0194f3] rounded-xl px-3.5 py-2.5 text-xs font-medium flex items-center gap-2 mb-3.5">
                <span className="text-sm">⏰</span>
                <span>
                  Don&apos;t miss out! Only <strong className="font-bold text-[#0194f3]">1 room(s) left</strong> for the lowest price.
                </span>
              </div>

              {/* Room Title */}
              <h3 className="text-base sm:text-lg font-bold text-gray-900 leading-snug">
                (1x) {bookingData?.roomName || 'Standard Twin Room No Window'}
              </h3>
              <p className="text-xs font-bold text-rose-500 mt-1 mb-4">
                {bookingData?.availableRooms || 1} room(s) left!
              </p>

              {/* Date Box */}
              <div className="bg-[#f8fafc] border border-gray-200/70 rounded-xl p-3.5 flex items-center justify-between text-center mb-4">
                <div className="text-left">
                  <span className="text-[11px] text-gray-400 font-medium block">Check-In</span>
                  <span className="text-xs sm:text-sm font-bold text-gray-900 block mt-0.5">
                    {checkInDateStr}
                  </span>
                  <span className="text-[11px] text-gray-400 block mt-0.5">
                    From {bookingData?.checkInTime ? bookingData.checkInTime.slice(0, 5) : '14:00'}
                  </span>
                </div>

                <div className="flex flex-col items-center px-2">
                  <span className="text-xs text-gray-500 font-semibold mb-0.5">1 night(s)</span>
                  <span className="text-gray-400 text-sm">➔</span>
                </div>

                <div className="text-right">
                  <span className="text-[11px] text-gray-400 font-medium block">Check-Out</span>
                  <span className="text-xs sm:text-sm font-bold text-gray-900 block mt-0.5">
                    {checkOutDateStr}
                  </span>
                  <span className="text-[11px] text-gray-400 block mt-0.5">
                    Before {bookingData?.checkOutTime ? bookingData.checkOutTime.slice(0, 5) : '12:00'}
                  </span>
                </div>
              </div>

              {/* Room Specs */}
              <div className="space-y-2.5 text-xs text-gray-700 pb-4 border-b border-gray-100">
                <div className="flex items-center gap-2.5 text-gray-700">
                  <Users className="w-4 h-4 text-gray-500 shrink-0" />
                  <span>{bookingData?.maxAdults || 2} adults</span>
                </div>
                <div className="flex items-center gap-2.5 text-gray-700">
                  <BedDouble className="w-4 h-4 text-gray-500 shrink-0" />
                  <span>{bookingData?.bedCount || 2} bed ({bookingData?.bedType || 'Twin'})</span>
                </div>
                <div className="flex items-center gap-2.5 text-gray-700">
                  <UtensilsCrossed className="w-4 h-4 text-gray-500 shrink-0" />
                  <span>Breakfast not Included</span>
                </div>
                <div className="flex items-center gap-2.5 text-emerald-600 font-medium">
                  <CalendarCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Free Cancellation before 26 Sep 2026</span>
                  <Info className="w-3.5 h-3.5 text-gray-400 cursor-pointer" />
                </div>
                <div className="flex items-center gap-2.5 text-emerald-600 font-medium">
                  <RotateCcw className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Reschedulable</span>
                  <Info className="w-3.5 h-3.5 text-gray-400 cursor-pointer" />
                </div>
              </div>

              {/* Hotel Information Section (User requirement: thông tin khách sạn đặt ở cuối cùng của phần phòng) */}
              <div className="pt-4">
                <p className="text-[11px] font-bold uppercase tracking-wider text-gray-400 mb-2">
                  Thông tin khách sạn
                </p>
                <div className="flex items-center gap-3">
                  <div className="w-14 h-14 rounded-xl overflow-hidden bg-gray-100 border border-gray-200 shrink-0">
                    {bookingData?.hotelImage ? (
                      <img
                        src={bookingData.hotelImage}
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
                    <p className="text-[11px] text-gray-500 truncate flex items-center gap-1">
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
                  Taxes and fees are recovery charges which Traveloka pays to the property. If you have any questions regarding tax and invoice, please refer to Traveloka Terms and Condition
                </span>
              </div>

              {/* Price Details Header */}
              <div
                onClick={() => setIsPriceOpen(!isPriceOpen)}
                className="flex items-center justify-between cursor-pointer py-1 select-none"
              >
                <div className="flex items-center gap-2.5">
                  <Tag className="w-5 h-5 text-gray-800 stroke-[2.2]" />
                  <h3 className="text-base font-bold text-gray-900">Price details</h3>
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
                      <span className="font-semibold text-gray-700 block">Room Price</span>
                      <span className="text-[11px] text-gray-400 mt-0.5 block">
                        (1x) {bookingData?.roomName || 'Standard Twin Room No Window'} (1 Night)
                      </span>
                    </div>
                    <span className="font-semibold text-gray-800 shrink-0">
                      {formattedRoomPrice} VND
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-gray-700">Taxes and Fees</span>
                    <span className="font-semibold text-gray-800">{formattedTaxes} VND</span>
                  </div>

                  <div className="border-t border-gray-200 pt-3 flex items-center justify-between">
                    <div>
                      <span className="text-sm font-bold text-gray-900 block">Total</span>
                      <span className="text-[11px] text-gray-400 block mt-0.5">1 room, 1 night</span>
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
                    <span>Đang xử lý...</span>
                  </>
                ) : (
                  'Continue'
                )}
              </button>

              {/* Disclaimer */}
              <p className="text-[11px] text-gray-500 text-center mt-3 px-3 leading-relaxed">
                By continuing to payment, you have agreed to Traveloka&apos;s{' '}
                <a href="#" className="underline hover:text-gray-800">
                  Terms & Conditions
                </a>
                ,{' '}
                <a href="#" className="underline hover:text-gray-800">
                  Privacy Policy
                </a>
                , and{' '}
                <a href="#" className="underline hover:text-gray-800">
                  Accommodation Refund Procedure
                </a>
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
              Thông tin khách hàng: <strong>{surname} {givenName}</strong> ({email} - {countryCode}{mobileNumber}) cho phòng <strong>{bookingData?.roomName}</strong> tại <strong>{bookingData?.hotelName}</strong>.
            </p>
            <div className="bg-amber-50 rounded-xl p-3 text-xs text-amber-800 font-medium mb-6">
              Tổng tiền thanh toán: <strong className="text-base text-[#f97316]">{formattedTotal} VND</strong>
              <div className="text-[11px] text-amber-700 mt-0.5">
                (Giai đoạn kiểm tra hoàn tất — sẵn sàng kết nối cổng thanh toán)
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
