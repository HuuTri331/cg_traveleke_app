'use client';

import React, { Suspense, useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter, useSearchParams } from 'next/navigation';
import logo from '@/assets/image/logo.png';
import { useCustomerAuth } from '@/features/auth/context/CustomerAuthContext';
import { apiClient } from '@/services/api/client';

function VerifyEmailContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { customer, isCustomerAuthenticated, isCustomerLoading } = useCustomerAuth();

  const tokenParam = searchParams.get('token') || '';
  const emailParam = searchParams.get('email') || '';
  const verifiedParam = searchParams.get('verified') === 'true';
  const initialError = searchParams.get('error') || '';

  const [inputEmail, setInputEmail] = useState(emailParam);
  const [status, setStatus] = useState<'IDLE' | 'VERIFYING' | 'SUCCESS' | 'ERROR'>(
    tokenParam ? 'VERIFYING' : verifiedParam ? 'SUCCESS' : 'IDLE'
  );
  const [message, setMessage] = useState(
    verifiedParam ? 'Tài khoản của bạn đã được xác thực thành công!' : initialError
  );
  const [isResending, setIsResending] = useState(false);
  const [resendSuccessMsg, setResendSuccessMsg] = useState('');
  const [countdown, setCountdown] = useState(0);

  // 1. Chặn khách hàng đã xác thực truy cập lại trang này
  useEffect(() => {
    if (!isCustomerLoading && isCustomerAuthenticated && customer?.isEmailVerified) {
      router.replace('/home');
    }
  }, [customer, isCustomerAuthenticated, isCustomerLoading, router]);

  // Bộ đếm ngược 60s cho nút gửi lại
  useEffect(() => {
    if (countdown <= 0) return;
    const timer = setInterval(() => {
      setCountdown((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, [countdown]);

  // 2. Tự động xác thực nếu có token trên URL
  const verifyToken = useCallback(async (token: string) => {
    setStatus('VERIFYING');
    setMessage('');
    try {
      const res = await apiClient.post<{ success: boolean; message: string; email?: string }>(
        '/auth/verify-email',
        { token }
      );
      setStatus('SUCCESS');
      setMessage(res.data.message || 'Xác thực tài khoản thành công!');
    } catch (err: any) {
      setStatus('ERROR');
      const errorMsg =
        err?.response?.data?.message ||
        (err instanceof Error ? err.message : 'Liên kết xác thực không hợp lệ hoặc đã hết hạn.');
      setMessage(errorMsg);
    }
  }, []);

  useEffect(() => {
    if (tokenParam && status === 'VERIFYING') {
      verifyToken(tokenParam);
    }
  }, [tokenParam, status, verifyToken]);

  // 3. Gửi lại link xác thực
  const handleResend = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const targetEmail = (inputEmail || emailParam).trim();

    if (!targetEmail) {
      setMessage('Vui lòng nhập địa chỉ email của bạn để nhận lại liên kết xác thực.');
      return;
    }

    setIsResending(true);
    setResendSuccessMsg('');
    try {
      const res = await apiClient.post<{ success: boolean; message: string }>(
        '/auth/resend-verification',
        { email: targetEmail }
      );
      setResendSuccessMsg(res.data.message || 'Liên kết xác thực mới đã được gửi vào hộp thư!');
      setCountdown(60); // Đếm ngược 60 giây
    } catch (err: any) {
      const errorMsg =
        err?.response?.data?.message ||
        (err instanceof Error ? err.message : 'Không thể gửi lại email. Vui lòng thử lại sau.');
      setMessage(errorMsg);
    } finally {
      setIsResending(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-blue-50 via-indigo-50/40 to-white px-4 py-12">
      {/* Header Logo */}
      <div className="mb-8 text-center">
        <Link href="/home" className="inline-block transition-transform hover:scale-105">
          <Image src={logo} alt="Traveleke Logo" className="h-14 w-auto object-contain mx-auto" priority />
        </Link>
      </div>

      {/* Main Card */}
      <div className="w-full max-w-lg rounded-3xl border border-gray-100 bg-white p-8 sm:p-10 shadow-xl shadow-blue-500/5 transition-all">
        {/* TRẠNG THÁI: ĐANG XÁC THỰC (Khi click từ link email) */}
        {status === 'VERIFYING' && (
          <div className="text-center py-6">
            <div className="relative mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-blue-50">
              <div className="h-10 w-10 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Đang xác thực tài khoản</h2>
            <p className="text-sm text-gray-500">
              Hệ thống đang kiểm tra mã xác thực của bạn, vui lòng đợi trong giây lát...
            </p>
          </div>
        )}

        {/* TRẠNG THÁI: XÁC THỰC THÀNH CÔNG */}
        {status === 'SUCCESS' && (
          <div className="text-center py-4">
            <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-green-50 text-green-500 ring-8 ring-green-50/50">
              <svg className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-2xl font-extrabold text-gray-900 mb-2">Xác Thực Thành Công! 🎉</h2>
            <p className="text-sm text-gray-600 mb-6 leading-relaxed">
              {message || 'Tài khoản của bạn đã được kích hoạt thành công. Giờ đây bạn đã có thể đăng nhập và trải nghiệm dịch vụ của Traveleke.'}
            </p>

            <div className="space-y-3">
              <Link
                href="/customer-login?verified=true"
                className="w-full inline-flex items-center justify-center rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-3.5 text-sm font-semibold text-white shadow-lg shadow-blue-500/30 transition hover:from-blue-700 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                Đăng Nhập Ngay
              </Link>
              <Link
                href="/home"
                className="w-full inline-flex items-center justify-center rounded-xl border border-gray-200 px-6 py-3 text-sm font-medium text-gray-600 transition hover:bg-gray-50"
              >
                Về Trang Chủ
              </Link>
            </div>
          </div>
        )}

        {/* TRẠNG THÁI: CHỜ XÁC THỰC HOẶC LỖI TOKEN (Cần hiển thị nút Gửi Lại) */}
        {(status === 'IDLE' || status === 'ERROR') && (
          <div>
            <div className="text-center mb-6">
              <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-blue-50 text-blue-600 ring-8 ring-blue-50/60">
                <span className="text-4xl">✉️</span>
              </div>
              <h2 className="text-2xl font-extrabold text-gray-900 mb-2">Xác Thực Tài Khoản Email</h2>
              <p className="text-sm text-gray-500 leading-relaxed">
                Chúng tôi đã gửi một liên kết kích hoạt tài khoản tới địa chỉ Gmail của bạn.
              </p>
            </div>

            {/* Thông báo lỗi nếu có */}
            {status === 'ERROR' && message && (
              <div className="mb-5 rounded-2xl border border-red-200 bg-red-50/90 p-4 text-sm text-red-700 flex items-start gap-3">
                <span className="text-base shrink-0">⚠️</span>
                <span>{message}</span>
              </div>
            )}

            {/* Thông báo gửi lại thành công */}
            {resendSuccessMsg && (
              <div className="mb-5 rounded-2xl border border-green-200 bg-green-50/90 p-4 text-sm text-green-700 flex items-start gap-3 animate-fade-in">
                <span className="text-base shrink-0">✅</span>
                <span>{resendSuccessMsg}</span>
              </div>
            )}

            {/* Thông tin Email người nhận */}
            <div className="mb-6 rounded-2xl border border-blue-100 bg-blue-50/60 p-4">
              <div className="text-xs font-semibold text-blue-600 uppercase tracking-wider mb-1">
                Địa chỉ nhận email
              </div>
              <div className="flex items-center justify-between gap-2">
                <span className="text-sm font-bold text-gray-900 truncate">
                  {inputEmail || emailParam || 'Chưa cung cấp email'}
                </span>
                <span className="text-xs px-2.5 py-1 rounded-full font-semibold bg-amber-100 text-amber-800">
                  Chưa kích hoạt
                </span>
              </div>
            </div>

            {/* Hướng dẫn người dùng */}
            <div className="mb-6 text-xs text-gray-500 space-y-2 bg-gray-50 rounded-xl p-4 border border-gray-100">
              <p className="font-semibold text-gray-700">📌 Hướng dẫn kích hoạt:</p>
              <ol className="list-decimal list-inside space-y-1 pl-1">
                <li>Mở ứng dụng Gmail hoặc hộp thư cá nhân của bạn.</li>
                <li>Tìm thư từ <strong>Traveleke Support</strong> (kiểm tra thêm thư mục Spam/Rác).</li>
                <li>Nhấn nút <strong>&quot;Xác Thực Tài Khoản Ngay&quot;</strong> trong email để hoàn tất.</li>
              </ol>
            </div>

            {/* Nút gửi lại link xác thực */}
            <div className="space-y-3">
              <button
                type="button"
                onClick={() => handleResend()}
                disabled={isResending || countdown > 0}
                className={`w-full inline-flex items-center justify-center gap-2 rounded-xl px-6 py-3.5 text-sm font-semibold transition ${
                  countdown > 0
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed border border-gray-200'
                    : 'bg-blue-600 text-white shadow-lg shadow-blue-500/25 hover:bg-blue-700 active:scale-[0.99]'
                }`}
              >
                {isResending ? (
                  <>
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    <span>Đang gửi lại email...</span>
                  </>
                ) : countdown > 0 ? (
                  <>
                    <span>⏳</span>
                    <span>Gửi lại sau ({countdown}s)</span>
                  </>
                ) : (
                  <>
                    <span>🔄</span>
                    <span>Gửi Lại Link Xác Thực</span>
                  </>
                )}
              </button>

              <div className="flex items-center justify-between text-xs text-gray-500 pt-3 border-t border-gray-100">
                <Link
                  href="/customer-login"
                  className="font-medium text-blue-600 hover:text-blue-700 hover:underline"
                >
                  ← Đã có tài khoản? Đăng nhập
                </Link>
                <Link
                  href="/register"
                  className="font-medium text-gray-600 hover:text-gray-900 hover:underline"
                >
                  Đổi tài khoản khác
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Footer Support */}
      <div className="mt-8 text-center text-xs text-gray-400">
        Bạn gặp sự cố khi nhận thư? Liên hệ hỗ trợ:{' '}
        <a href="mailto:dangquangminhdn76@gmail.com" className="text-blue-500 hover:underline">
          dangquangminhdn76@gmail.com
        </a>
      </div>
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
        </div>
      }
    >
      <VerifyEmailContent />
    </Suspense>
  );
}
