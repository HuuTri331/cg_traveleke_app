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
        const pStatus = data.payment?.status;

        if (pStatus === 'PAID') {
          setPaymentStatus('PAID');
        } else if (pStatus === 'FAILED') {
          setPaymentStatus('FAILED');
          setErrorMessage('Giao dịch thanh toán không thành công hoặc đã bị hủy.');
        } else if (pStatus === 'EXPIRED') {
          setPaymentStatus('EXPIRED');
          setErrorMessage('Phiên giao dịch thanh toán đã quá thời hạn 15 phút.');
        } else {
          // Vẫn đang PENDING: tiếp tục poll ngắn chờ IPN
          if (attempts < maxAttempts) {
            attempts++;
            setTimeout(verifyStatus, 2000);
          } else {
            // Hết lượt poll mà vẫn PENDING
            if (vnpResponseCode === '00') {
              setPaymentStatus('PAID');
            } else {
              setPaymentStatus('PENDING');
            }
          }
        }
      } catch (err: any) {
        if (!isMounted) return;
        if (attempts < maxAttempts) {
          attempts++;
          setTimeout(verifyStatus, 2000);
        } else {
          setPaymentStatus(vnpResponseCode === '00' ? 'PAID' : 'FAILED');
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
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans antialiased text-gray-800">
      <HeaderCommon />

      <main className="flex-1 max-w-3xl w-full mx-auto px-4 py-12 flex flex-col justify-center">
        {paymentStatus === 'CHECKING' && (
          <div className="bg-white rounded-3xl p-10 shadow-sm border border-slate-100 text-center flex flex-col items-center gap-4">
            <div className="w-14 h-14 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
            <h2 className="text-xl font-bold text-slate-800">Đang xác thực kết quả thanh toán...</h2>
            <p className="text-sm text-slate-500 max-w-md">
              Hệ thống đang đối soát trạng thái giao dịch với cổng VNPay. Quá trình này có thể mất vài giây.
            </p>
          </div>
        )}

        {paymentStatus === 'PAID' && (
          <div className="bg-white rounded-3xl p-8 sm:p-10 shadow-sm border border-emerald-100 text-center flex flex-col items-center">
            <div className="w-20 h-20 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mb-5 ring-8 ring-emerald-50/50">
              <CheckCircle2 className="w-11 h-11" />
            </div>

            <span className="px-3.5 py-1 bg-emerald-100/80 text-emerald-800 text-xs font-semibold rounded-full uppercase tracking-wider mb-2">
              Giao dịch thành công
            </span>

            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Thanh Toán Đặt Phòng Hoàn Tất!
            </h1>
            <p className="text-sm text-slate-500 mt-2 max-w-md">
              Cảm ơn quý khách. Đơn đặt phòng của bạn đã được thanh toán thành công và chuyển tới khách sạn để xác nhận tiếp nhận.
            </p>

            {/* Thông tin biên lai thanh toán */}
            <div className="w-full bg-slate-50 rounded-2xl p-6 my-8 text-left border border-slate-100 divide-y divide-slate-200/60">
              <div className="pb-3 flex justify-between items-center text-sm">
                <span className="text-slate-500">Mã đơn đặt phòng:</span>
                <span className="font-bold text-slate-900 font-mono text-base">
                  {bookingDetails?.bookingCode || txnRef?.split('-')[0] || '---'}
                </span>
              </div>

              <div className="py-3 flex justify-between items-center text-sm">
                <span className="text-slate-500">Mã giao dịch VNPay:</span>
                <span className="font-semibold text-slate-800 font-mono">
                  {bookingDetails?.payment?.vnpTransactionNo || vnpTransactionNo || '---'}
                </span>
              </div>

              <div className="py-3 flex justify-between items-center text-sm">
                <span className="text-slate-500">Phương thức:</span>
                <span className="font-medium text-slate-800 flex items-center gap-1.5">
                  <CreditCard className="w-4 h-4 text-blue-600" />
                  Cổng VNPay Sandbox
                </span>
              </div>

              <div className="pt-3 flex justify-between items-center text-sm">
                <span className="text-slate-500 font-medium">Tổng tiền thanh toán:</span>
                <span className="font-extrabold text-blue-600 text-lg">
                  {amountDisplay} ₫
                </span>
              </div>
            </div>

            {/* Trạng thái nghiệp vụ */}
            <div className="w-full mb-8 bg-blue-50/60 border border-blue-100 rounded-xl p-4 flex items-start gap-3 text-left">
              <Clock className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-semibold text-blue-900">
                  Trạng thái: Đã thanh toán - Đang chờ khách sạn xác nhận
                </p>
                <p className="text-xs text-blue-700/80 mt-0.5">
                  Lễ tân khách sạn sẽ kiểm tra thông tin và gửi thông báo xác nhận phòng qua Email và ứng dụng cho bạn.
                </p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
              <Link
                href="/booking-history"
                className="px-6 py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl transition flex items-center justify-center gap-2 shadow-sm shadow-blue-500/20"
              >
                Xem Lịch Sử Đặt Phòng
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                href="/"
                className="px-6 py-3.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl transition flex items-center justify-center"
              >
                Về Trang Chủ
              </Link>
            </div>
          </div>
        )}

        {(paymentStatus === 'FAILED' || paymentStatus === 'EXPIRED') && (
          <div className="bg-white rounded-3xl p-8 sm:p-10 shadow-sm border border-rose-100 text-center flex flex-col items-center">
            <div className="w-20 h-20 bg-rose-50 text-rose-600 rounded-full flex items-center justify-center mb-5 ring-8 ring-rose-50/50">
              <XCircle className="w-11 h-11" />
            </div>

            <span className="px-3.5 py-1 bg-rose-100/80 text-rose-800 text-xs font-semibold rounded-full uppercase tracking-wider mb-2">
              {paymentStatus === 'EXPIRED' ? 'Hết hạn thanh toán' : 'Giao dịch thất bại'}
            </span>

            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              {paymentStatus === 'EXPIRED' ? 'Phiên Thanh Toán Đã Hết Hạn' : 'Thanh Toán Không Thành Công'}
            </h1>
            <p className="text-sm text-slate-500 mt-2 max-w-md">
              {errorMessage || 'Rất tiếc, giao dịch chưa được xác nhận bởi cổng thanh toán VNPay hoặc bạn đã hủy giao dịch.'}
            </p>

            <div className="w-full bg-slate-50 rounded-2xl p-6 my-8 text-left border border-slate-100 text-sm space-y-2">
              <div className="flex justify-between">
                <span className="text-slate-500">Mã tham chiếu:</span>
                <span className="font-mono font-medium text-slate-800">{txnRef || '---'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Mã phản hồi VNPay:</span>
                <span className="font-mono font-medium text-slate-800">{vnpResponseCode || '---'}</span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
              <button
                onClick={handleRetryPayment}
                disabled={isRetrying}
                className="px-6 py-3.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-semibold rounded-xl transition flex items-center justify-center gap-2 shadow-sm shadow-blue-500/20"
              >
                <RotateCcw className={`w-4 h-4 ${isRetrying ? 'animate-spin' : ''}`} />
                {isRetrying ? 'Đang tạo phiên mới...' : 'Thanh Toán Lại'}
              </button>
              <Link
                href="/booking-history"
                className="px-6 py-3.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl transition flex items-center justify-center"
              >
                Về Lịch Sử Đặt Phòng
              </Link>
            </div>
          </div>
        )}

        {paymentStatus === 'PENDING' && (
          <div className="bg-white rounded-3xl p-8 sm:p-10 shadow-sm border border-amber-100 text-center flex flex-col items-center">
            <div className="w-20 h-20 bg-amber-50 text-amber-600 rounded-full flex items-center justify-center mb-5 ring-8 ring-amber-50/50">
              <AlertTriangle className="w-11 h-11" />
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Giao Dịch Đang Được Xử Lý
            </h1>
            <p className="text-sm text-slate-500 mt-2 max-w-md">
              Hệ thống đang chờ thông báo chính thức từ ngân hàng. Trạng thái sẽ được tự động đồng bộ trong ít phút.
            </p>

            <div className="flex gap-3 mt-8">
              <Link
                href="/booking-history"
                className="px-6 py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl transition"
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
        <div className="min-h-screen bg-slate-50 flex items-center justify-center">
          <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <PaymentResultContent />
    </Suspense>
  );
}
