'use client';

import React, { Suspense, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import {
  CheckCircle2,
  XCircle,
  Clock,
  ArrowRight,
  RotateCcw,
  Building2,
  Calendar,
  CreditCard,
  AlertTriangle,
} from 'lucide-react';
import HeaderCommon from '@/components/common/HeaderCommon';
import FooterCommon from '@/components/common/FooterCommon';
import { apiClient } from '@/services/api/client';
import { bookingApi } from '@/services/api/booking.api';

function PaymentResultContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const txnRef = searchParams.get('vnp_TxnRef');
  const vnpResponseCode = searchParams.get('vnp_ResponseCode');
  const vnpTransactionNo = searchParams.get('vnp_TransactionNo');
  const vnpAmount = searchParams.get('vnp_Amount');

  const [paymentStatus, setPaymentStatus] = useState<
    'CHECKING' | 'PAID' | 'PENDING' | 'FAILED' | 'EXPIRED'
  >('CHECKING');
  const [bookingDetails, setBookingDetails] = useState<{
    bookingId?: string;
    bookingCode?: string;
    bookingStatus?: string;
    estimatedTotal?: string | number;
    payment?: any;
  } | null>(null);
  const [errorMessage, setErrorMessage] = useState('');
  const [isRetrying, setIsRetrying] = useState(false);

  useEffect(() => {
    if (!txnRef) {
      setPaymentStatus('FAILED');
      setErrorMessage('Không tìm thấy thông tin mã giao dịch VNPay.');
      return;
    }

    let isMounted = true;
    let attempts = 0;
    const maxAttempts = 6;

    const verifyStatus = async () => {
      try {
        const response = await apiClient.get(`/payments/status-by-ref/${txnRef}`);
        const data = response.data;
        if (!isMounted) return;

        setBookingDetails(data);
        const pStatus = data.paymentStatus || data.payment?.status;

        if (pStatus === 'PAID') {
          setPaymentStatus('PAID');
        } else if (pStatus === 'FAILED') {
          setPaymentStatus('FAILED');
          setErrorMessage('Giao dịch thanh toán không thành công hoặc đã bị hủy.');
        } else if (pStatus === 'EXPIRED') {
          setPaymentStatus('EXPIRED');
          setErrorMessage('Phiên giao dịch thanh toán đã quá thời hạn.');
        } else {
          // Vẫn đang PENDING: tiếp tục poll ngắn chờ IPN xử lý
          if (attempts < maxAttempts) {
            attempts++;
            setTimeout(verifyStatus, 2500);
          } else {
            // Section 7: Tuyệt đối không tự suy diễn PAID từ vnp_ResponseCode!
            setPaymentStatus('PENDING');
          }
        }
      } catch (err: any) {
        if (!isMounted) return;
        if (attempts < maxAttempts) {
          attempts++;
          setTimeout(verifyStatus, 2500);
        } else {
          // Lỗi backend hoặc timeout -> Chưa thể xác nhận
          setPaymentStatus('PENDING');
          setErrorMessage('Chưa thể nhận diện trạng thái cuối cùng. Vui lòng kiểm tra tại Lịch sử đặt phòng.');
        }
      }
    };

    verifyStatus();

    return () => {
      isMounted = false;
    };
  }, [txnRef, vnpResponseCode]);

  const handleRetryPayment = async () => {
    if (!bookingDetails?.bookingId) {
      router.push('/booking-history');
      return;
    }

    setIsRetrying(true);
    try {
      const res = await bookingApi.retryPayment(bookingDetails.bookingId);
      const newPaymentUrl = res.paymentUrl || res.data?.paymentUrl;
      if (newPaymentUrl) {
        window.location.assign(newPaymentUrl);
      } else {
        router.push('/booking-history');
      }
    } catch (err: any) {
      setIsRetrying(false);
      const msg = err.response?.data?.message || err.message;
      alert(msg || 'Không thể tạo phiên thanh toán mới.');
      router.push('/booking-history');
    }
  };

  const amountDisplay = bookingDetails?.estimatedTotal
    ? Number(bookingDetails.estimatedTotal).toLocaleString('vi-VN')
    : vnpAmount
    ? (Number(vnpAmount) / 100).toLocaleString('vi-VN')
    : '0';

  return (
    <div className="luxury-site min-h-screen bg-white flex flex-col font-sans antialiased text-[#1E4752]">
      <HeaderCommon />

      <main className="flex-1 max-w-3xl w-full mx-auto px-4 py-12 flex flex-col justify-center lux-fade-up">
        {paymentStatus === 'CHECKING' && (
          <div className="bg-white rounded-3xl p-10 shadow-xs border border-[#1E4752]/15 text-center flex flex-col items-center gap-4">
            <div className="w-14 h-14 border-4 border-[#E8A700] border-t-transparent rounded-full animate-spin" />
            <h2 className="font-display text-xl font-bold text-[#1E4752]">Đang xác thực kết quả thanh toán...</h2>
            <p className="text-sm text-[#1E4752]/75 max-w-md">
              Hệ thống đang đối soát trạng thái giao dịch với cổng VNPay. Quá trình này có thể mất vài giây.
            </p>
          </div>
        )}

        {paymentStatus === 'PAID' && (
          <div className="bg-white rounded-3xl p-8 sm:p-10 shadow-xs border border-[#1E4752]/15 text-center flex flex-col items-center lux-scale-in">
            <div className="w-20 h-20 bg-[#E8A700]/15 text-[#1E4752] rounded-full flex items-center justify-center mb-5 ring-8 ring-[#E8A700]/10">
              <CheckCircle2 className="w-11 h-11 text-[#E8A700]" />
            </div>

            <span className="px-3.5 py-1 bg-[#1E4752] text-[#E8A700] text-xs font-extrabold rounded-full uppercase tracking-wider mb-2">
              Giao dịch thành công
            </span>

            <h1 className="font-display text-2xl sm:text-3xl font-extrabold text-[#1E4752] tracking-tight">
              Thanh Toán Đặt Phòng Hoàn Tất!
            </h1>
            <p className="text-sm text-[#1E4752]/75 mt-2 max-w-md">
              Cảm ơn quý khách. Đơn đặt phòng của bạn đã được thanh toán thành công và chuyển tới khách sạn để xác nhận tiếp nhận.
            </p>

            {/* Thông tin biên lai thanh toán */}
            <div className="w-full bg-[#1E4752]/4 rounded-2xl p-6 my-8 text-left border border-[#1E4752]/15 divide-y divide-[#1E4752]/10">
              <div className="pb-3 flex justify-between items-center text-sm">
                <span className="text-[#1E4752]/70">Mã đơn đặt phòng:</span>
                <span className="font-bold text-[#1E4752] font-mono text-base tabular-nums">
                  {bookingDetails?.bookingCode || txnRef?.split('-')[0] || '---'}
                </span>
              </div>

              <div className="py-3 flex justify-between items-center text-sm">
                <span className="text-[#1E4752]/70">Mã giao dịch VNPay:</span>
                <span className="font-semibold text-[#1E4752] font-mono tabular-nums">
                  {bookingDetails?.payment?.vnpTransactionNo || vnpTransactionNo || '---'}
                </span>
              </div>

              <div className="py-3 flex justify-between items-center text-sm">
                <span className="text-[#1E4752]/70">Phương thức:</span>
                <span className="font-semibold text-[#1E4752] flex items-center gap-1.5">
                  <CreditCard className="w-4 h-4 text-[#E8A700]" />
                  Cổng VNPay Sandbox
                </span>
              </div>

              <div className="pt-3 flex justify-between items-center text-sm">
                <span className="text-[#1E4752] font-semibold">Tổng tiền thanh toán:</span>
                <span className="font-extrabold text-[#1E4752] text-lg tabular-nums">
                  {amountDisplay} <span className="text-[#E8A700]">₫</span>
                </span>
              </div>
            </div>

            {/* Trạng thái nghiệp vụ */}
            <div className="w-full mb-8 bg-[#E8A700]/12 border border-[#E8A700]/35 rounded-xl p-4 flex items-start gap-3 text-left">
              <Clock className="w-5 h-5 text-[#1E4752] shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-bold text-[#1E4752]">
                  Trạng thái: Đã thanh toán - Đang chờ khách sạn xác nhận
                </p>
                <p className="text-xs text-[#1E4752]/80 mt-0.5">
                  Lễ tân khách sạn sẽ kiểm tra thông tin và gửi thông báo xác nhận phòng qua Email và ứng dụng cho bạn.
                </p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
              <Link
                href="/booking-history"
                className="lux-press px-6 py-3.5 bg-[#E8A700] hover:bg-[#E8A700]/90 text-[#1E4752] font-extrabold rounded-xl transition flex items-center justify-center gap-2 shadow-xs"
              >
                Xem Lịch Sử Đặt Phòng
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                href="/"
                className="lux-press px-6 py-3.5 bg-white hover:bg-[#1E4752]/5 border border-[#1E4752]/20 text-[#1E4752] font-bold rounded-xl transition flex items-center justify-center"
              >
                Về Trang Chủ
              </Link>
            </div>
          </div>
        )}

        {(paymentStatus === 'FAILED' || paymentStatus === 'EXPIRED') && (
          <div className="bg-white rounded-3xl p-8 sm:p-10 shadow-xs border border-[#1E4752]/20 text-center flex flex-col items-center lux-scale-in">
            <div className="w-20 h-20 bg-[#1E4752]/8 text-[#1E4752] rounded-full flex items-center justify-center mb-5 ring-8 ring-[#1E4752]/5">
              <XCircle className="w-11 h-11 text-[#1E4752]" />
            </div>

            <span className="px-3.5 py-1 bg-[#E8A700]/20 text-[#1E4752] text-xs font-extrabold rounded-full uppercase tracking-wider mb-2">
              {paymentStatus === 'EXPIRED' ? 'Hết hạn thanh toán' : 'Giao dịch thất bại'}
            </span>

            <h1 className="font-display text-2xl sm:text-3xl font-extrabold text-[#1E4752] tracking-tight">
              {paymentStatus === 'EXPIRED' ? 'Phiên Thanh Toán Đã Hết Hạn' : 'Thanh Toán Không Thành Công'}
            </h1>
            <p className="text-sm text-[#1E4752]/75 mt-2 max-w-md">
              {errorMessage || 'Rất tiếc, giao dịch chưa được xác nhận bởi cổng thanh toán VNPay hoặc bạn đã hủy giao dịch.'}
            </p>

            <div className="w-full bg-[#1E4752]/4 rounded-2xl p-6 my-8 text-left border border-[#1E4752]/15 text-sm space-y-2">
              <div className="flex justify-between">
                <span className="text-[#1E4752]/70">Mã tham chiếu:</span>
                <span className="font-mono font-bold text-[#1E4752] tabular-nums">{txnRef || '---'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#1E4752]/70">Mã phản hồi VNPay:</span>
                <span className="font-mono font-bold text-[#1E4752] tabular-nums">{vnpResponseCode || '---'}</span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
              <button
                onClick={handleRetryPayment}
                disabled={isRetrying}
                className="lux-press px-6 py-3.5 bg-[#E8A700] hover:bg-[#E8A700]/90 disabled:opacity-50 text-[#1E4752] font-extrabold rounded-xl transition flex items-center justify-center gap-2 shadow-xs cursor-pointer"
              >
                <RotateCcw className={`w-4 h-4 ${isRetrying ? 'animate-spin' : ''}`} />
                {isRetrying ? 'Đang tạo phiên mới...' : 'Thanh Toán Lại'}
              </button>
              <Link
                href="/booking-history"
                className="lux-press px-6 py-3.5 bg-white hover:bg-[#1E4752]/5 border border-[#1E4752]/20 text-[#1E4752] font-bold rounded-xl transition flex items-center justify-center"
              >
                Về Lịch Sử Đặt Phòng
              </Link>
            </div>
          </div>
        )}

        {paymentStatus === 'PENDING' && (
          <div className="bg-white rounded-3xl p-8 sm:p-10 shadow-xs border border-[#E8A700]/40 text-center flex flex-col items-center lux-scale-in">
            <div className="w-20 h-20 bg-[#E8A700]/15 text-[#1E4752] rounded-full flex items-center justify-center mb-5 ring-8 ring-[#E8A700]/10">
              <AlertTriangle className="w-11 h-11 text-[#E8A700]" />
            </div>

            <h1 className="font-display text-2xl sm:text-3xl font-extrabold text-[#1E4752] tracking-tight">
              Giao Dịch Đang Được Xử Lý
            </h1>
            <p className="text-sm text-[#1E4752]/75 mt-2 max-w-md">
              Hệ thống đang chờ thông báo chính thức từ ngân hàng. Trạng thái sẽ được tự động đồng bộ trong ít phút.
            </p>

            <div className="flex gap-3 mt-8">
              <Link
                href="/booking-history"
                className="lux-press px-6 py-3.5 bg-[#E8A700] hover:bg-[#E8A700]/90 text-[#1E4752] font-extrabold rounded-xl transition"
              >
                Kiểm Tra Tại Lịch Sử Đặt Phòng
              </Link>
            </div>
          </div>
        )}
      </main>

      <FooterCommon />
    </div>
  );
}

export default function PaymentResultPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-white flex items-center justify-center">
          <div className="w-10 h-10 border-4 border-[#E8A700] border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <PaymentResultContent />
    </Suspense>
  );
}
