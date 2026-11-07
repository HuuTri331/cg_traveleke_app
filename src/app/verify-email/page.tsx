'use client';

import React, { Suspense, useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter, useSearchParams } from 'next/navigation';
import logo from '@/assets/image/logo.png';
import { useCustomerAuth } from '@/features/auth/context/CustomerAuthContext';
import { apiClient } from '@/services/api/client';
import { Mail, AlertCircle, CheckCircle2, Clock, RefreshCw, Info } from 'lucide-react';

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
    <div className="luxury-site min-h-screen flex flex-col items-center justify-center bg-white px-4 py-12">
      {/* Header Logo */}
      <div className="mb-8 text-center">
        <Link href="/home" className="inline-block transition-transform hover:scale-105">
          <Image src={logo} alt="Traveleke Logo" className="h-14 w-auto object-contain mx-auto" priority />
        </Link>
      </div>

      {/* Main Card */}
      <div className="lux-fade-up w-full max-w-lg rounded-3xl border border-[#1E4752]/15 bg-white p-8 sm:p-10 shadow-[0_24px_56px_-16px_rgba(30,71,82,0.14)] transition-all">
        {/* TRẠNG THÁI: ĐANG XÁC THỰC (Khi click từ link email) */}
        {status === 'VERIFYING' && (
          <div className="text-center py-6">
            <div className="relative mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-[#1E4752]/5">
              <div className="h-10 w-10 animate-spin rounded-full border-4 border-[#1E4752]/20 border-t-[#E8A700]" />
            </div>
            <h2 className="font-display text-2xl font-bold text-[#1E4752] mb-2">Đang xác thực tài khoản</h2>
            <p className="text-sm text-[#1E4752]/70">
              Hệ thống đang kiểm tra mã xác thực của bạn, vui lòng đợi trong giây lát...
            </p>
          </div>
        )}

        {/* TRẠNG THÁI: XÁC THỰC THÀNH CÔNG */}
        {status === 'SUCCESS' && (
          <div className="text-center py-4">
            <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-[#E8A700]/15 text-[#1E4752] ring-8 ring-[#E8A700]/10">
              <svg className="h-10 w-10 text-[#E8A700]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="font-display text-2xl font-bold text-[#1E4752] mb-2">Xác Thực Thành Công!</h2>
            <p className="text-sm text-[#1E4752]/75 mb-6 leading-relaxed">
              {message || 'Tài khoản của bạn đã được kích hoạt thành công. Giờ đây bạn đã có thể đăng nhập và trải nghiệm dịch vụ của Traveleke.'}
            </p>

            <div className="space-y-3">
              <Link
                href="/customer-login?verified=true"
                className="lux-press w-full inline-flex items-center justify-center rounded-xl bg-[#1E4752] hover:bg-[#E8A700] hover:text-[#1E4752] px-6 py-3.5 text-sm font-bold text-white shadow-[0_10px_24px_-8px_rgba(30,71,82,0.4)] transition"
              >
                Đăng Nhập Ngay
              </Link>
              <Link
                href="/home"
                className="w-full inline-flex items-center justify-center rounded-xl border border-[#1E4752]/20 px-6 py-3 text-sm font-semibold text-[#1E4752] transition hover:bg-[#1E4752]/5"
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
              <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-[#1E4752] text-[#E8A700] ring-8 ring-[#E8A700]/15">
                <Mail className="h-10 w-10 text-[#E8A700]" />
              </div>
              <h2 className="font-display text-2xl font-bold text-[#1E4752] mb-2">Xác Thực Tài Khoản Email</h2>
              <p className="text-sm text-[#1E4752]/70 leading-relaxed">
                Chúng tôi đã gửi một liên kết kích hoạt tài khoản tới địa chỉ Gmail của bạn.
              </p>
            </div>

            {/* Thông báo lỗi nếu có */}
            {status === 'ERROR' && message && (
              <div className="mb-5 rounded-2xl border border-red-200 bg-red-50/90 p-4 text-sm text-red-700 flex items-start gap-3">
                <AlertCircle className="h-5 w-5 text-red-600 shrink-0 mt-0.5" />
                <span>{message}</span>
              </div>
            )}

            {/* Thông báo gửi lại thành công */}
            {resendSuccessMsg && (
              <div className="mb-5 rounded-2xl border border-[#E8A700]/40 bg-[#E8A700]/12 p-4 text-sm text-[#1E4752] flex items-start gap-3">
                <CheckCircle2 className="h-5 w-5 text-[#E8A700] shrink-0 mt-0.5" />
                <span>{resendSuccessMsg}</span>
              </div>
            )}

            {/* Thông tin Email người nhận */}
            <div className="mb-6 rounded-2xl border border-[#1E4752]/15 bg-[#1E4752]/4 p-4">
              <div className="text-xs font-semibold text-[#1E4752]/70 uppercase tracking-wider mb-1">
                Địa chỉ nhận email
              </div>
              <div className="flex items-center justify-between gap-2">
                <span className="text-sm font-bold text-[#1E4752] truncate">
                  {inputEmail || emailParam || 'Chưa cung cấp email'}
                </span>
                <span className="text-xs px-2.5 py-1 rounded-full font-semibold bg-[#E8A700]/20 text-[#1E4752] border border-[#E8A700]/40">
                  Chưa kích hoạt
                </span>
              </div>
            </div>

            {/* Hướng dẫn người dùng */}
            <div className="mb-6 text-xs text-[#1E4752]/75 space-y-2 bg-[#1E4752]/3 rounded-xl p-4 border border-[#1E4752]/15">
              <p className="font-semibold text-[#1E4752] flex items-center gap-1.5">
                <Info className="h-4 w-4 text-[#E8A700] shrink-0" />
                <span>Hướng dẫn kích hoạt:</span>
              </p>
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
                className={`lux-press w-full inline-flex items-center justify-center gap-2 rounded-xl px-6 py-3.5 text-sm font-bold transition ${
                  countdown > 0
                    ? 'bg-[#1E4752]/8 text-[#1E4752]/45 cursor-not-allowed border border-[#1E4752]/15'
                    : 'bg-[#1E4752] text-white shadow-[0_10px_24px_-8px_rgba(30,71,82,0.4)] hover:bg-[#E8A700] hover:text-[#1E4752]'
                }`}
              >
                {isResending ? (
                  <>
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    <span>Đang gửi lại email...</span>
                  </>
                ) : countdown > 0 ? (
                  <>
                    <Clock className="h-4 w-4" />
                    <span>Gửi lại sau ({countdown}s)</span>
                  </>
                ) : (
                  <>
                    <RefreshCw className="h-4 w-4" />
                    <span>Gửi Lại Link Xác Thực</span>
                  </>
                )}
              </button>

              <div className="flex items-center justify-between text-xs text-[#1E4752]/70 pt-3 border-t border-[#1E4752]/15">
                <Link
                  href="/customer-login"
                  className="font-semibold text-[#1E4752] hover:text-[#E8A700] transition-colors"
                >
                  ← Đã có tài khoản? Đăng nhập
                </Link>
                <Link
                  href="/register"
                  className="font-semibold text-[#1E4752]/70 hover:text-[#1E4752] transition-colors"
                >
                  Đổi tài khoản khác
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Footer Support */}
      <div className="mt-8 text-center text-xs text-[#1E4752]/65">
        Bạn gặp sự cố khi nhận thư? Liên hệ hỗ trợ:{' '}
        <a href="mailto:dangquangminhdn76@gmail.com" className="text-[#1E4752] font-semibold hover:text-[#E8A700]">
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
        <div className="luxury-site min-h-screen flex items-center justify-center bg-white">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-[#1E4752]/20 border-t-[#E8A700]" />
        </div>
      }
    >
      <VerifyEmailContent />
    </Suspense>
  );
}
