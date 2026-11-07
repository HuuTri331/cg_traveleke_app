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
  ArrowRight,
} from 'lucide-react';

import HeaderCommon from '@/components/common/HeaderCommon';
import FooterCommon from '@/components/common/FooterCommon';
import { useCustomerAuth } from '@/features/auth/context/CustomerAuthContext';
import { hotelDetailApi, type HotelDetail } from '@/services/api/hotel-detail.api';
import { bookingApi, type CreateBookingData } from '@/services/api/booking.api';
import { promotionsApi } from '@/services/api/promotions.api';

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
  checkInAt?: string;
  checkOutAt?: string;
  roomCount?: number;
  totalGuests?: number;
}

function ProcessOrderContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { customer, isCustomerAuthenticated, isCustomerLoading } = useCustomerAuth();

  const roomIdParam = searchParams.get('roomId');
  const hotelIdParam = searchParams.get('hotelId');
  const checkInParam = searchParams.get('checkInAt');
  const checkOutParam = searchParams.get('checkOutAt');
  const roomCountParam = searchParams.get('roomCount');
  const totalGuestsParam = searchParams.get('totalGuests');

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

  // Countdown timer: Chỉ kích hoạt countdown khi đã có phiên giữ chỗ backend
  const [secondsLeft, setSecondsLeft] = useState<number | null>(null);

  // UI accordion state
  const [isPriceOpen, setIsPriceOpen] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  // Countdown clock effect: Đọc thời điểm hết hạn từ backend response trong session
  useEffect(() => {
    let targetTime: number | null = null;
    if (typeof window !== 'undefined') {
      try {
        const stored = sessionStorage.getItem('traveleke_order_cutoff');
        if (stored && Number(stored) > Date.now()) {
          targetTime = Number(stored);
        }
      } catch {}
    }

    if (!targetTime) return;

    const updateTimer = () => {
      const remaining = Math.max(0, Math.floor((targetTime! - Date.now()) / 1000));
      setSecondsLeft(remaining);
      if (remaining <= 0) {
        clearInterval(timer);
        alert('Đã hết thời hạn giữ phòng tạm thời. Vui lòng chọn lại phòng.');
        router.push('/hotels_home');
      }
    };

    updateTimer();
    const timer = setInterval(updateTimer, 1000);
    return () => clearInterval(timer);
  }, [router]);

  const timerDisplay = useMemo(() => {
    if (secondsLeft === null) return '15:00';
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
            roomPrice: selectedRoom?.pricePerNight || 0,
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

  // Price calculations: use server nightly quote as single source of truth (INV-P01 / INV-P02 / PP-P1-17)
  const [serverQuote, setServerQuote] = useState<any | null>(null);
  const [quoteLoading, setQuoteLoading] = useState(false);
  const [quoteError, setQuoteError] = useState<string | null>(null);
  const roomPricePerNight = Math.round(parseFloat(String(bookingData?.roomPrice || '0')) || 0);
  const taxesAndFees = 0;

  // Section 02.9 & 07.2: Mặc định nhận phòng HÔM NAY, trả phòng NGÀY MAI
  const checkInDateObj = useMemo(() => {
    if (bookingData?.checkInAt) return new Date(bookingData.checkInAt);
    if (checkInParam) return new Date(checkInParam);
    const d = new Date();
    d.setHours(14, 0, 0, 0);
    return d;
  }, [bookingData?.checkInAt, checkInParam]);

  const checkOutDateObj = useMemo(() => {
    if (bookingData?.checkOutAt) return new Date(bookingData.checkOutAt);
    if (checkOutParam) return new Date(checkOutParam);
    const d = new Date(checkInDateObj);
    d.setDate(d.getDate() + 1);
    d.setHours(12, 0, 0, 0);
    return d;
  }, [bookingData?.checkOutAt, checkOutParam, checkInDateObj]);

  useEffect(() => {
    const rid = bookingData?.roomId || roomIdParam;
    if (!rid) return;
    let isCancelled = false;
    const qty = bookingData?.roomCount || Number(roomCountParam) || 1;
    const guests = bookingData?.totalGuests || Number(totalGuestsParam) || 2;
    setQuoteLoading(true);
    setQuoteError(null);
    promotionsApi
      .calculateQuote({
        roomId: String(rid),
        checkInAt: checkInDateObj.toISOString(),
        checkOutAt: checkOutDateObj.toISOString(),
        roomCount: qty,
        totalGuests: guests,
      })
      .then((q) => {
        if (!isCancelled) {
          setServerQuote(q);
          setQuoteError(null);
        }
      })
      .catch((err: any) => {
        if (!isCancelled) {
          setServerQuote(null);
          setQuoteError(err?.response?.data?.message || 'Không thể lấy báo giá từ máy chủ');
        }
      })
      .finally(() => {
        if (!isCancelled) setQuoteLoading(false);
      });
    return () => {
      isCancelled = true;
    };
  }, [bookingData?.roomId, roomIdParam, checkInDateObj, checkOutDateObj, bookingData?.roomCount, roomCountParam, bookingData?.totalGuests, totalGuestsParam]);

  const fallbackNights = Math.max(
    1,
    Math.round((checkOutDateObj.getTime() - checkInDateObj.getTime()) / 86400000),
  );
  const effectiveQty = bookingData?.roomCount || Number(roomCountParam) || 1;
  const effectiveNights = serverQuote
    ? Math.max(1, Number(serverQuote.nightsCount || fallbackNights))
    : fallbackNights;
  const roomPrice = serverQuote
    ? Math.round(Number(serverQuote.baseTotal))
    : roomPricePerNight * effectiveNights * effectiveQty;
  const discountTotal = serverQuote ? Math.round(Number(serverQuote.discountTotal || 0)) : 0;
  const monetaryDiscountTotal = serverQuote
    ? Math.round(Number(serverQuote.monetaryDiscountTotal ?? Math.max(0, Number(serverQuote.baseTotal) - Number(serverQuote.payableTotal))))
    : 0;
  const noncashBenefitValue = serverQuote
    ? Math.round(Number(serverQuote.noncashBenefitValue ?? Math.max(0, discountTotal - monetaryDiscountTotal)))
    : 0;
  const totalPrice = serverQuote ? Math.round(Number(serverQuote.payableTotal)) : roomPrice;

  const formattedRoomPrice = useMemo(() => {
    return Number(roomPrice).toLocaleString('vi-VN');
  }, [roomPrice]);

  const formattedTotal = useMemo(() => {
    return Number(totalPrice).toLocaleString('vi-VN');
  }, [totalPrice]);

  const checkInDateStr = useMemo(() => {
    return checkInDateObj.toLocaleDateString('vi-VN', {
      weekday: 'long',
      day: '2-digit',
      month: '2-digit',
    });
  }, [checkInDateObj]);

  const checkOutDateStr = useMemo(() => {
    return checkOutDateObj.toLocaleDateString('vi-VN', {
      weekday: 'long',
      day: '2-digit',
      month: '2-digit',
    });
  }, [checkOutDateObj]);

  // Validation & Continue handler
  const handleContinue = (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: { [key: string]: string } = {};

    if (quoteLoading) {
      alert('Hệ thống đang tải báo giá từng đêm từ máy chủ, vui lòng đợi trong giây lát.');
      return;
    }

    if (quoteError || !serverQuote || roomPrice <= 0) {
      alert(
        quoteError ||
          'Chưa thể xác nhận báo giá từ máy chủ (Server Quote). Vui lòng tải lại báo giá trước khi thanh toán.',
      );
      return;
    }

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

    const effectiveCheckIn = bookingData?.checkInAt || checkInParam || checkInDateObj.toISOString();
    const effectiveCheckOut = bookingData?.checkOutAt || checkOutParam || checkOutDateObj.toISOString();
    const effectiveGuests = bookingData?.totalGuests || Number(totalGuestsParam) || bookingData?.maxAdults || 2;
    const effectiveRoomCount = bookingData?.roomCount || Number(roomCountParam) || 1;

    const specialReqs = [
      nonSmoking ? 'Phòng không hút thuốc' : null,
      connectingRooms ? 'Phòng thông nhau' : null,
      highFloor ? 'Phòng tầng cao' : null,
    ]
      .filter(Boolean)
      .join(', ');

    const effectiveRoomId = String(bookingData?.roomId || roomIdParam || '1');
    const quoteHashPart = serverQuote?.priceHash || 'noquote';
    const idempotencyContext = `${effectiveRoomId}_${effectiveCheckIn}_${effectiveCheckOut}_${effectiveRoomCount}_${quoteHashPart}`;
    let stableIdempotencyKey = '';
    if (typeof window !== 'undefined') {
      try {
        const storedKey = sessionStorage.getItem('traveleke_checkout_idempotency_key');
        const storedContext = sessionStorage.getItem('traveleke_checkout_idempotency_context');
        if (storedKey && storedContext === idempotencyContext) {
          stableIdempotencyKey = storedKey;
        } else {
          stableIdempotencyKey =
            typeof crypto !== 'undefined' && crypto.randomUUID
              ? crypto.randomUUID()
              : `idemp-${Date.now()}-${Math.random()}`;
          sessionStorage.setItem('traveleke_checkout_idempotency_key', stableIdempotencyKey);
          sessionStorage.setItem('traveleke_checkout_idempotency_context', idempotencyContext);
        }
      } catch {
        stableIdempotencyKey =
          typeof crypto !== 'undefined' && crypto.randomUUID
            ? crypto.randomUUID()
            : `idemp-${Date.now()}-${Math.random()}`;
      }
    }

    const payload: CreateBookingData = {
      roomId: effectiveRoomId,
      checkInAt: effectiveCheckIn,
      checkOutAt: effectiveCheckOut,
      totalGuests: effectiveGuests,
      roomCount: effectiveRoomCount,
      contactName: `${surname.trim()} ${givenName.trim()}`,
      contactEmail: email.trim(),
      contactPhone: `${countryCode}${mobileNumber.trim()}`,
      specialRequest: specialReqs || undefined,
      idempotencyKey: stableIdempotencyKey,
      quoteId: serverQuote?.id ? String(serverQuote.id) : serverQuote?.quoteCode ? String(serverQuote.quoteCode) : undefined,
      quoteVersion: serverQuote?.version ? Number(serverQuote.version) : undefined,
      priceHash: serverQuote?.priceHash ? String(serverQuote.priceHash) : undefined,
    };

    bookingApi
      .create(payload)
      .then((res: any) => {
        const paymentUrl = res.data?.paymentUrl || res.paymentUrl;
        const holdExpiresAtRes = res.data?.holdExpiresAt || res.holdExpiresAt;
        if (paymentUrl) {
          if (typeof window !== 'undefined') {
            sessionStorage.removeItem('traveleke_pending_order');
            sessionStorage.removeItem('traveleke_checkout_idempotency_key');
            sessionStorage.removeItem('traveleke_checkout_idempotency_context');
            if (holdExpiresAtRes) {
              sessionStorage.setItem(
                'traveleke_order_cutoff',
                String(new Date(holdExpiresAtRes).getTime()),
              );
            }
            window.location.assign(paymentUrl);
          }
        } else {
          throw new Error('Không nhận được liên kết thanh toán từ cổng VNPay.');
        }
      })
      .catch((err: any) => {
        setIsSubmitting(false);
        const status = err.response?.status;
        const msg = String(err.response?.data?.message || err.message || '');

        // PP-P1-18: Distinguish quote/promotion 409 conflicts from inventory exhaustion
        const isQuoteOrPriceConflict =
          msg.includes('PRICE_QUOTE_EXPIRED') ||
          msg.includes('PRICE_CHANGED') ||
          msg.includes('PROMO_BUDGET_EXHAUSTED') ||
          msg.includes('PRICE_QUOTE_PARAMETER_MISMATCH') ||
          msg.includes('QUOTE_OWNER_MISMATCH');

        if (status === 409 && isQuoteOrPriceConflict) {
          if (typeof window !== 'undefined') {
            sessionStorage.removeItem('traveleke_checkout_idempotency_key');
            sessionStorage.removeItem('traveleke_checkout_idempotency_context');
          }
          promotionsApi
            .calculateQuote({
              roomId: effectiveRoomId,
              checkInAt: checkInDateObj.toISOString(),
              checkOutAt: checkOutDateObj.toISOString(),
              roomCount: effectiveRoomCount,
              totalGuests: effectiveGuests,
            })
            .then((freshQuote) => setServerQuote(freshQuote))
            .catch(() => {});
          alert(
            msg ||
              'Báo giá hoặc chương trình khuyến mãi vừa thay đổi. Hệ thống đã cập nhật lại báo giá mới nhất, vui lòng kiểm tra và bấm xác nhận lại.',
          );
          return;
        }

        if (status === 409) {
          alert(
            'Loại phòng này vừa hết trong thời gian bạn chọn. Hệ thống sẽ đưa bạn quay lại trang thông tin khách sạn.',
          );
          if (typeof window !== 'undefined') {
            sessionStorage.removeItem('traveleke_pending_order');
            sessionStorage.removeItem('traveleke_order_cutoff');
          }
          if (hotelIdParam || bookingData?.hotelId) {
            router.push(`/hotels_home/${hotelIdParam || bookingData?.hotelId}`);
          } else {
            router.push('/hotels_home');
          }
        } else {
          alert(msg || 'Có lỗi xảy ra trong quá trình khởi tạo thanh toán VNPay.');
        }
      });
  };

  if (isCustomerLoading || loadingDetails) {
    return (
      <div className="luxury-site min-h-screen bg-white flex flex-col items-center justify-center gap-3">
        <div className="w-11 h-11 border-4 border-[#1E4752]/20 border-t-[#E8A700] rounded-full animate-spin" />
        <p className="text-sm font-semibold text-[#1E4752]/75">Đang tải thông tin đặt phòng...</p>
      </div>
    );
  }

  return (
    <div className="luxury-site min-h-screen bg-white font-sans antialiased text-[#1E4752] selection:bg-[#E8A700]/25">
      {/* Navigation Header */}
      <HeaderCommon />

      {/* Main Process Order Container */}
      <main className="lux-fade-up max-w-6xl mx-auto px-4 sm:px-6 py-6 lg:py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start">
          {/* ========================================================= */}
          {/* LEFT COLUMN: Guest & Contact Forms, Requests & Policies */}
          {/* ========================================================= */}
          <div className="lg:col-span-7 space-y-6">
            {/* 1. Guest Detail Card */}
            <div className="bg-white rounded-3xl p-5 sm:p-6 shadow-[0_12px_32px_-12px_rgba(30,71,82,0.08)] border border-[#1E4752]/15">
              <div className="flex items-center gap-3 mb-1">
                <User className="w-5 h-5 text-[#E8A700] stroke-[2.2]" />
                <h2 className="font-display text-base sm:text-lg font-bold text-[#1E4752]">
                  Thông Tin Khách Lưu Trú
                </h2>
              </div>
              <p className="text-xs text-[#1E4752]/70 ml-8 mb-4">
                Điền chính xác thông tin như trên CCCD/Hộ chiếu để lễ tân đối soát khi nhận phòng
              </p>

              {/* Tinted luxury form box */}
              <div className="bg-[#1E4752]/4 border border-[#1E4752]/15 rounded-2xl p-4 sm:p-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Surname / Last Name */}
                  <div>
                    <label className="block text-xs font-bold text-[#1E4752] mb-1.5">
                      Họ của khách (vd: NGUYEN)<span className="text-[#E8A700]">*</span>
                    </label>
                    <input
                      type="text"
                      value={surname}
                      onChange={(e) => {
                        setSurname(e.target.value);
                        if (errors.surname) setErrors((prev) => ({ ...prev, surname: '' }));
                      }}
                      className={`w-full px-3.5 py-2.5 bg-white border ${
                        errors.surname ? 'border-[#E8A700] ring-2 ring-[#E8A700]/40' : 'border-[#1E4752]/20 focus:border-[#1E4752]'
                      } rounded-xl text-sm font-medium text-[#1E4752] placeholder-[#1E4752]/40 focus:outline-none focus:ring-2 focus:ring-[#E8A700]/45 transition-all`}
                      placeholder="NGUYEN"
                    />
                    <span className="block text-xs-plus text-[#1E4752]/60 mt-1">
                      (Không bao gồm danh xưng và dấu câu)
                    </span>
                    {errors.surname && (
                      <span className="text-xs-plus text-[#1E4752] font-bold mt-0.5 block">
                        ⚠ {errors.surname}
                      </span>
                    )}
                  </div>

                  {/* Given / Middle & First Name */}
                  <div>
                    <label className="block text-xs font-bold text-[#1E4752] mb-1.5">
                      Tên đệm & Tên (vd: VAN ANH)<span className="text-[#E8A700]">*</span>
                    </label>
                    <input
                      type="text"
                      value={givenName}
                      onChange={(e) => {
                        setGivenName(e.target.value);
                        if (errors.givenName) setErrors((prev) => ({ ...prev, givenName: '' }));
                      }}
                      className={`w-full px-3.5 py-2.5 bg-white border ${
                        errors.givenName ? 'border-[#E8A700] ring-2 ring-[#E8A700]/40' : 'border-[#1E4752]/20 focus:border-[#1E4752]'
                      } rounded-xl text-sm font-medium text-[#1E4752] placeholder-[#1E4752]/40 focus:outline-none focus:ring-2 focus:ring-[#E8A700]/45 transition-all`}
                      placeholder="VAN ANH"
                    />
                    <span className="block text-xs-plus text-[#1E4752]/60 mt-1">
                      (Như trên Căn cước công dân hoặc Hộ chiếu)
                    </span>
                    {errors.givenName && (
                      <span className="text-xs-plus text-[#1E4752] font-bold mt-0.5 block">
                        ⚠ {errors.givenName}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* 2. Booking Contact Card */}
            <div className="bg-white rounded-3xl p-5 sm:p-6 shadow-[0_12px_32px_-12px_rgba(30,71,82,0.08)] border border-[#1E4752]/15">
              <div className="flex items-center gap-3 mb-1">
                <Mail className="w-5 h-5 text-[#E8A700] stroke-[2.2]" />
                <h2 className="font-display text-base sm:text-lg font-bold text-[#1E4752]">
                  Thông Tin Người Liên Hệ Đặt Chỗ
                </h2>
              </div>
              <p className="text-xs text-[#1E4752]/70 ml-8 mb-4">
                Thông tin này sẽ được dùng để gửi phiếu xác nhận đặt phòng (Voucher) và vé điện tử
              </p>

              {/* Tinted luxury form box with no overflow */}
              <div className="bg-[#1E4752]/4 border border-[#1E4752]/15 rounded-2xl p-4 sm:p-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full">
                  {/* Email */}
                  <div className="min-w-0">
                    <label className="block text-xs font-bold text-[#1E4752] mb-1.5">
                      Email nhận xác nhận<span className="text-[#E8A700]">*</span>
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
                        errors.email ? 'border-[#E8A700] ring-2 ring-[#E8A700]/40' : 'border-[#1E4752]/20 focus:border-[#1E4752]'
                      } rounded-xl text-sm font-medium text-[#1E4752] placeholder-[#1E4752]/40 focus:outline-none focus:ring-2 focus:ring-[#E8A700]/45 transition-all`}
                    />
                    <span className="block text-xs-plus text-[#1E4752]/60 mt-1">
                      Ví dụ: you@gmail.com
                    </span>
                    {errors.email && (
                      <span className="text-xs-plus text-[#1E4752] font-bold mt-0.5 block">
                        ⚠ {errors.email}
                      </span>
                    )}
                  </div>

                  {/* Mobile Number - Fixed with min-w-0 to prevent overflowing */}
                  <div className="min-w-0">
                    <label className="block text-xs font-bold text-[#1E4752] mb-1.5">
                      Số điện thoại liên hệ<span className="text-[#E8A700]">*</span>
                    </label>
                    <div className="flex items-center gap-2 min-w-0 w-full">
                      <div className="relative w-24 shrink-0">
                        <select
                          value={countryCode}
                          onChange={(e) => setCountryCode(e.target.value)}
                          className="w-full appearance-none px-3 py-2.5 bg-white border border-[#1E4752]/20 rounded-xl text-sm font-semibold text-[#1E4752] focus:outline-none focus:border-[#1E4752] focus:ring-2 focus:ring-[#E8A700]/45 cursor-pointer"
                        >
                          <option value="+84">+84 (VN)</option>
                          <option value="+1">+1 (US)</option>
                          <option value="+65">+65 (SG)</option>
                          <option value="+66">+66 (TH)</option>
                          <option value="+81">+81 (JP)</option>
                          <option value="+82">+82 (KR)</option>
                        </select>
                        <ChevronDown className="w-4 h-4 text-[#1E4752]/65 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
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
                          errors.mobileNumber ? 'border-[#E8A700] ring-2 ring-[#E8A700]/40' : 'border-[#1E4752]/20 focus:border-[#1E4752]'
                        } rounded-xl text-sm font-medium text-[#1E4752] placeholder-[#1E4752]/40 focus:outline-none focus:ring-2 focus:ring-[#E8A700]/45 transition-all`}
                      />
                    </div>
                    <span className="block text-xs-plus text-[#1E4752]/60 mt-1">
                      Số điện thoại để lễ tân khách sạn liên hệ khi cần thiết
                    </span>
                    {errors.mobileNumber && (
                      <span className="text-xs-plus text-[#1E4752] font-bold mt-0.5 block">
                        ⚠ {errors.mobileNumber}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* 3. Special Request Card */}
            <div className="bg-white rounded-3xl p-5 sm:p-6 shadow-[0_12px_32px_-12px_rgba(30,71,82,0.08)] border border-[#1E4752]/15">
              <div className="flex items-center gap-3 mb-1">
                <CheckCircle2 className="w-5 h-5 text-[#E8A700] stroke-[2.2]" />
                <h2 className="font-display text-base sm:text-lg font-bold text-[#1E4752]">Yêu Cầu Đặc Biệt</h2>
              </div>
              <p className="text-xs text-[#1E4752]/70 ml-8 leading-relaxed mb-5">
                Mọi yêu cầu đặc biệt tùy thuộc vào tình trạng phòng sẵn có của khách sạn tại thời điểm nhận phòng và không thể đảm bảo trước. Nhận phòng sớm hoặc đưa đón sân bay có thể phát sinh phụ phí. Vui lòng liên hệ trực tiếp với nhân viên khách sạn để được phục vụ tốt nhất.
              </p>

              {/* Checkboxes */}
              <div className="flex flex-wrap items-center gap-4 sm:gap-6 ml-1">
                <label className="flex items-center gap-2.5 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={nonSmoking}
                    onChange={(e) => setNonSmoking(e.target.checked)}
                    className="w-5 h-5 rounded-md border-2 border-[#1E4752] text-[#1E4752] focus:ring-[#E8A700] cursor-pointer"
                  />
                  <span className="text-xs font-semibold text-[#1E4752]">Phòng không hút thuốc</span>
                </label>

                <label className="flex items-center gap-2.5 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={connectingRooms}
                    onChange={(e) => setConnectingRooms(e.target.checked)}
                    className="w-5 h-5 rounded-md border-2 border-[#1E4752] text-[#1E4752] focus:ring-[#E8A700] cursor-pointer"
                  />
                  <span className="text-xs font-semibold text-[#1E4752]">Phòng thông nhau</span>
                </label>

                <label className="flex items-center gap-2.5 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={highFloor}
                    onChange={(e) => setHighFloor(e.target.checked)}
                    className="w-5 h-5 rounded-md border-2 border-[#1E4752] text-[#1E4752] focus:ring-[#E8A700] cursor-pointer"
                  />
                  <span className="text-xs font-semibold text-[#1E4752]">Phòng tầng cao</span>
                </label>
              </div>

              <div className="mt-4">
                <button
                  type="button"
                  onClick={() => alert('Chi tiết yêu cầu đặc biệt: Khách sạn sẽ cố gắng đáp ứng tùy theo khả năng và tình trạng phòng thực tế khi nhận phòng.')}
                  className="text-xs font-bold text-[#1E4752] hover:text-[#E8A700] hover:underline cursor-pointer"
                >
                  Xem chi tiết chính sách
                </button>
              </div>
            </div>

            {/* 4. Accommodation Policies Card */}
            <div className="bg-white rounded-3xl p-5 sm:p-6 shadow-[0_12px_32px_-12px_rgba(30,71,82,0.08)] border border-[#1E4752]/15">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-3">
                  <FileText className="w-5 h-5 text-[#E8A700] stroke-[2.2]" />
                  <h2 className="font-display text-base sm:text-lg font-bold text-[#1E4752]">
                    Quy Định & Chính Sách Lưu Trú
                  </h2>
                </div>
                <button
                  type="button"
                  onClick={() => alert('Chính sách lưu trú: Bắt buộc mang CCCD/Hộ chiếu gốc hoặc VNeID mức 2. Khách dưới 18 tuổi cần có người lớn đi kèm.')}
                  className="text-xs font-bold text-[#1E4752] hover:text-[#E8A700] hover:underline cursor-pointer"
                >
                  Xem toàn bộ
                </button>
              </div>

              {/* Luxury Alert Callout Box */}
              <div className="bg-[#E8A700]/12 border border-[#E8A700]/35 rounded-2xl p-4 mt-3">
                <div className="flex items-center gap-2 text-[#1E4752] font-bold text-xs mb-1.5">
                  <Info className="w-4 h-4 shrink-0 fill-[#1E4752] text-white" />
                  <span>Lưu ý quan trọng</span>
                </div>
                <p className="text-xs text-[#1E4752]/85 leading-relaxed font-normal">
                  <strong>Chính sách giấy tờ tùy thân:</strong> Khi làm thủ tục nhận phòng, quý khách bắt buộc phải xuất trình Căn cước công dân (CCCD) hoặc Hộ chiếu còn hạn sử dụng (chấp nhận bản gốc hoặc tài khoản định danh điện tử VNeID).
                  <br className="mb-1" />
                  <strong>Độ tuổi nhận phòng tối thiểu:</strong> Khách đứng tên làm thủ tục nhận phòng phải từ đủ 18 tuổi trở lên. Khách dưới 18 tuổi bắt buộc phải có người lớn đi kèm bảo hộ.
                </p>
              </div>

              {/* Required Documents Section */}
              <div className="mt-4 flex items-start gap-2.5">
                <FileText className="w-4 h-4 text-[#1E4752]/70 shrink-0 mt-0.5" />
                <div>
                  <h3 className="text-xs font-bold text-[#1E4752] mb-0.5">Giấy tờ cần xuất trình</h3>
                  <p className="text-xs text-[#1E4752]/75 leading-relaxed">
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
            <div className="bg-white rounded-3xl p-5 shadow-[0_12px_32px_-12px_rgba(30,71,82,0.08)] border border-[#1E4752]/15">
              {/* Urgency Pill with Animated Real-time Countdown Timer Clock */}
              <div className="bg-[#E8A700]/12 border border-[#E8A700]/35 rounded-2xl p-3.5 flex items-center justify-between shadow-xs mb-4">
                <div className="flex items-center gap-2.5">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#E8A700]/20 text-[#1E4752] animate-pulse shrink-0">
                    <Clock className="w-5 h-5 text-[#1E4752]" />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-[#1E4752] block">
                      Thời gian giữ giá ưu đãi
                    </span>
                    <span className="text-xs-plus text-[#1E4752]/80 font-medium block">
                      Chỉ còn {bookingData?.availableRooms || 1} phòng giá tốt!
                    </span>
                  </div>
                </div>
                <div className="font-mono tabular-nums text-base font-extrabold text-[#1E4752] bg-white px-3 py-1.5 rounded-xl border border-[#E8A700]/40 shadow-inner">
                  {timerDisplay}
                </div>
              </div>

              {/* Room Title */}
              <h3 className="font-display text-base sm:text-lg font-bold text-[#1E4752] leading-snug">
                ({effectiveQty}x) {bookingData?.roomName || 'Phòng nghỉ cao cấp'}
              </h3>
              <p className="text-xs font-bold text-[#E8A700] mt-1 mb-4">
                Chỉ còn {bookingData?.availableRooms || 1} phòng trống với mức giá này!
              </p>

              {/* Date Box */}
              <div className="bg-[#1E4752]/4 border border-[#1E4752]/15 rounded-2xl p-3.5 flex items-center justify-between text-center mb-4">
                <div className="text-left">
                  <span className="text-xs-plus text-[#1E4752]/65 font-medium block">Nhận phòng</span>
                  <span className="text-xs sm:text-sm font-bold text-[#1E4752] block mt-0.5">
                    {checkInDateStr}
                  </span>
                  <span className="text-xs-plus text-[#1E4752]/65 block mt-0.5">
                    Từ {bookingData?.checkInTime ? bookingData.checkInTime.slice(0, 5) : '14:00'}
                  </span>
                </div>

                <div className="flex flex-col items-center px-2">
                  <span className="text-xs text-[#E8A700] font-bold mb-0.5">{effectiveNights} đêm</span>
                  <ArrowRight className="h-4 w-4 text-[#1E4752]/60" />
                </div>

                <div className="text-right">
                  <span className="text-xs-plus text-[#1E4752]/65 font-medium block">Trả phòng</span>
                  <span className="text-xs sm:text-sm font-bold text-[#1E4752] block mt-0.5">
                    {checkOutDateStr}
                  </span>
                  <span className="text-xs-plus text-[#1E4752]/65 block mt-0.5">
                    Trước {bookingData?.checkOutTime ? bookingData.checkOutTime.slice(0, 5) : '12:00'}
                  </span>
                </div>
              </div>

              {/* Room Specs */}
              <div className="space-y-2.5 text-xs text-[#1E4752] pb-4 border-b border-[#1E4752]/15">
                <div className="flex items-center gap-2.5 text-[#1E4752]">
                  <Users className="w-4 h-4 text-[#E8A700] shrink-0" />
                  <span>{bookingData?.maxAdults || 2} người lớn</span>
                </div>
                <div className="flex items-center gap-2.5 text-[#1E4752]">
                  <BedDouble className="w-4 h-4 text-[#E8A700] shrink-0" />
                  <span>{bookingData?.bedCount || 1} giường ({bookingData?.bedType || 'Giường Đôi'})</span>
                </div>
                <div className="flex items-center gap-2.5 text-[#1E4752]">
                  <UtensilsCrossed className="w-4 h-4 text-[#E8A700] shrink-0" />
                  <span>Chưa bao gồm bữa sáng</span>
                </div>
                <div className="flex items-center gap-2.5 text-[#1E4752] font-semibold">
                  <CalendarCheck className="w-4 h-4 text-[#E8A700] shrink-0" />
                  <span>Miễn phí hủy phòng trước ngày nhận phòng</span>
                </div>
                <div className="flex items-center gap-2.5 text-[#1E4752] font-semibold">
                  <RotateCcw className="w-4 h-4 text-[#E8A700] shrink-0" />
                  <span>Hỗ trợ đổi lịch trình linh hoạt</span>
                </div>
              </div>

              {/* Hotel Information Section (User requirement: thông tin khách sạn đặt ở cuối cùng của phần phòng) */}
              <div className="pt-4">
                <p className="text-xs-plus font-bold uppercase tracking-wider text-[#1E4752]/60 mb-2">
                  Thông tin khách sạn
                </p>
                <div className="flex items-center gap-3">
                  <div className="w-14 h-14 rounded-2xl overflow-hidden bg-[#1E4752]/5 border border-[#1E4752]/15 shrink-0">
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
                      <div className="w-full h-full flex items-center justify-center text-[#1E4752] bg-[#1E4752]/5">
                        <Building2 className="w-6 h-6 text-[#1E4752]" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-display text-sm font-bold text-[#1E4752] truncate">
                      {bookingData?.hotelName || 'Khách sạn liên kết'}
                    </h4>
                    <div className="flex items-center gap-1 my-0.5">
                      {Array.from({ length: bookingData?.hotelStar || 5 }).map((_, idx) => (
                        <Star key={idx} className="w-3 h-3 text-[#E8A700] fill-[#E8A700]" />
                      ))}
                    </div>
                    <p className="text-xs-plus text-[#1E4752]/70 truncate flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-[#E8A700] shrink-0" />
                      {bookingData?.hotelAddress || 'Việt Nam'}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Price Details Card */}
            <div className="bg-white rounded-3xl p-5 shadow-[0_12px_32px_-12px_rgba(30,71,82,0.08)] border border-[#1E4752]/15">
              {/* Notice text box */}
              <div className="bg-[#1E4752]/4 border border-[#1E4752]/15 rounded-2xl p-3 flex items-start gap-2.5 mb-4 text-xs text-[#1E4752]/80 leading-relaxed">
                <Info className="w-4 h-4 text-[#E8A700] shrink-0 mt-0.5" />
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
                  <Tag className="w-5 h-5 text-[#E8A700] stroke-[2.2]" />
                  <h3 className="font-display text-base font-bold text-[#1E4752]">Chi tiết giá</h3>
                </div>
                {isPriceOpen ? (
                  <ChevronUp className="w-4 h-4 text-[#1E4752]/70" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-[#1E4752]/70" />
                )}
              </div>

              {/* Breakdown */}
              {isPriceOpen && (
                <div className="mt-4 space-y-3 pt-2">
                  <div className="flex items-start justify-between text-xs">
                    <div>
                      <span className="font-semibold text-[#1E4752] block">Tiền phòng gốc</span>
                      <span className="text-xs-plus text-[#1E4752]/65 mt-0.5 block">
                        ({effectiveQty}x) {bookingData?.roomName || 'Phòng nghỉ cao cấp'} ({effectiveNights} Đêm)
                      </span>
                    </div>
                    <span className="font-semibold text-[#1E4752] tabular-nums shrink-0">
                      {formattedRoomPrice} VND
                    </span>
                  </div>

                  {monetaryDiscountTotal > 0 && (
                    <div className="flex items-start justify-between text-xs text-[#1E4752] bg-[#E8A700]/12 p-2.5 rounded-xl border border-[#E8A700]/35">
                      <div>
                        <span className="font-bold block">Ưu đãi giảm giá phòng theo đêm</span>
                        <span className="text-[11px] text-[#1E4752]/80 block">
                          {serverQuote?.nightlyLines
                            ?.filter((l: any) => Number(l.payableSubtotal) < Number(l.baseSubtotal))
                            .map(
                              (l: any) =>
                                `${l.nightDate} (-${Math.max(0, Number(l.baseSubtotal) - Number(l.payableSubtotal)).toLocaleString('vi-VN')}đ)`,
                            )
                            .join(', ')}
                        </span>
                      </div>
                      <span className="font-bold text-[#1E4752] tabular-nums shrink-0">
                        -{monetaryDiscountTotal.toLocaleString('vi-VN')} VND
                      </span>
                    </div>
                  )}

                  {noncashBenefitValue > 0 && (
                    <div className="flex items-center justify-between text-xs text-[#1E4752] bg-[#1E4752]/5 p-2.5 rounded-xl border border-[#1E4752]/20">
                      <span className="font-semibold">Tặng tín dụng dịch vụ nội bộ (Cấp sau thanh toán)</span>
                      <span className="font-bold text-[#E8A700] tabular-nums">+{noncashBenefitValue.toLocaleString('vi-VN')} VND</span>
                    </div>
                  )}

                  {Array.isArray(serverQuote?.nightlyLines) && serverQuote.nightlyLines.length > 1 && (
                    <div className="bg-[#1E4752]/4 rounded-xl p-2.5 border border-[#1E4752]/15 space-y-1 max-h-36 overflow-y-auto text-[11px]">
                      <div className="font-semibold text-[#1E4752] mb-1">Phân rã giá từng đêm [checkIn, checkOut):</div>
                      {serverQuote.nightlyLines.map((line: any) => {
                        const isMonetaryReduced = Number(line.payableSubtotal) < Number(line.baseSubtotal);
                        const isNoncashCreditNight = !isMonetaryReduced && Number(line.discountAmount) > 0;
                        return (
                          <div key={line.nightDate} className="flex items-center justify-between text-[#1E4752]/80">
                            <span className="font-mono">{line.nightDate}</span>
                            <span className="tabular-nums">
                              {isMonetaryReduced ? (
                                <>
                                  <span className="line-through text-[#1E4752]/45 mr-1.5">
                                    {Number(line.baseSubtotal).toLocaleString('vi-VN')}đ
                                  </span>
                                  <strong className="text-[#1E4752]">
                                    {Number(line.payableSubtotal).toLocaleString('vi-VN')}đ
                                  </strong>
                                </>
                              ) : (
                                <>
                                  <span>{Number(line.payableSubtotal).toLocaleString('vi-VN')}đ</span>
                                  {isNoncashCreditNight && (
                                    <span className="ml-1.5 text-[#E8A700] font-semibold">
                                      (+Voucher DV {Number(line.discountAmount).toLocaleString('vi-VN')}đ)
                                    </span>
                                  )}
                                </>
                              )}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  )}

                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-[#1E4752]">Thuế và phí dịch vụ</span>
                    <span className="font-semibold text-[#E8A700]">Đã bao gồm</span>
                  </div>

                  <div className="border-t border-[#1E4752]/15 pt-3 flex items-center justify-between">
                    <div>
                      <span className="text-sm font-bold text-[#1E4752] block">Tổng thanh toán</span>
                      <span className="text-xs-plus text-[#1E4752]/65 block mt-0.5">
                        {effectiveQty} phòng, {effectiveNights} đêm
                      </span>
                    </div>
                    <span className="font-display text-xl font-extrabold text-[#1E4752] tabular-nums">
                      {formattedTotal} <span className="text-[#E8A700] text-sm">VND</span>
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Luxury Continue Button */}
            <div>
              <button
                type="button"
                onClick={handleContinue}
                disabled={isSubmitting}
                className="lux-press w-full bg-[#1E4752] hover:bg-[#E8A700] hover:text-[#1E4752] disabled:opacity-60 text-white font-bold py-3.5 px-6 rounded-2xl text-base shadow-[0_10px_24px_-8px_rgba(30,71,82,0.4)] transition-all flex items-center justify-center gap-2 cursor-pointer"
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
              <p className="text-xs-plus text-[#1E4752]/70 text-center mt-3 px-3 leading-relaxed">
                Bằng việc tiếp tục thanh toán, bạn đồng ý với{' '}
                <a href="#" className="underline hover:text-[#1E4752] font-semibold">
                  Điều khoản & Điều kiện
                </a>
                ,{' '}
                <a href="#" className="underline hover:text-[#1E4752] font-semibold">
                  Chính sách quyền riêng tư
                </a>
                {' '}và{' '}
                <a href="#" className="underline hover:text-[#1E4752] font-semibold">
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#1E4752]/65 backdrop-blur-xs p-4 animate-in fade-in duration-200">
          <div className="lux-scale-in bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-[#1E4752]/15 text-center">
            <div className="w-14 h-14 rounded-2xl bg-[#E8A700]/15 text-[#1E4752] flex items-center justify-center mx-auto mb-4 text-2xl">
              <ShieldCheck className="w-8 h-8 text-[#1E4752]" />
            </div>
            <h3 className="font-display text-lg font-bold text-[#1E4752] mb-2">
              Xác thực thông tin đặt phòng thành công!
            </h3>
            <p className="text-xs text-[#1E4752]/80 leading-relaxed mb-4">
              Khách lưu trú: <strong>{surname} {givenName}</strong> ({email} - {countryCode}{mobileNumber}) cho phòng <strong>{bookingData?.roomName}</strong> tại <strong>{bookingData?.hotelName}</strong>.
            </p>
            <div className="bg-[#E8A700]/12 border border-[#E8A700]/35 rounded-2xl p-3 text-xs text-[#1E4752] font-medium mb-6">
              Tổng tiền thanh toán: <strong className="font-display text-base text-[#1E4752] tabular-nums">{formattedTotal} VND</strong>
              <div className="text-xs-plus text-[#1E4752]/75 mt-0.5">
                (Thông tin hợp lệ — sẵn sàng chuyển sang bước thanh toán an toàn)
              </div>
            </div>
            <button
              type="button"
              onClick={() => setShowSuccessModal(false)}
              className="lux-press w-full bg-[#1E4752] hover:bg-[#E8A700] hover:text-[#1E4752] text-white font-bold py-3 rounded-xl text-sm transition cursor-pointer"
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
        <div className="luxury-site min-h-screen bg-white flex items-center justify-center">
          <div className="w-10 h-10 border-4 border-[#1E4752]/20 border-t-[#E8A700] rounded-full animate-spin" />
        </div>
      }
    >
      <ProcessOrderContent />
    </Suspense>
  );
}
