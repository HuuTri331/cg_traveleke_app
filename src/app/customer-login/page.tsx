'use client';

import React, { Suspense, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useSearchParams } from 'next/navigation';
import logo from '@/assets/image/logo.png';
import { useCustomerAuth } from '@/features/auth/context/CustomerAuthContext';
import {
  Building2,
  Tag,
  Zap,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Mail,
  Lock,
  Eye,
  EyeOff,
  Plane,
} from 'lucide-react';

function CustomerLoginForm() {
  const { customerLogin, isCustomerLoading } = useCustomerAuth();
  const searchParams = useSearchParams();
  const isVerifiedParam = searchParams.get('verified') === 'true';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [needsVerification, setNeedsVerification] = useState(false);
  const [unverifiedEmail, setUnverifiedEmail] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setNeedsVerification(false);

    if (!email.trim() || !password.trim()) {
      setError('Vui lòng nhập đầy đủ email và mật khẩu.');
      return;
    }

    const redirectParam = searchParams.get('redirect') || '';

    try {
      await customerLogin({ email: email.trim(), password }, redirectParam || undefined);
    } catch (err: any) {
      const errorData = err?.response?.data;
      const isUnverified =
        err?.requiresVerification ||
        errorData?.requiresVerification ||
        (typeof errorData?.message === 'string' && errorData.message.includes('xác thực')) ||
        (err instanceof Error && err.message.includes('xác thực'));

      if (isUnverified) {
        setNeedsVerification(true);
        setUnverifiedEmail(errorData?.email || email.trim());
      }
      setError(
        errorData?.message ||
          (err instanceof Error ? err.message : 'Đăng nhập thất bại. Vui lòng thử lại.')
      );
    }
  };

  return (
    <div className="min-h-screen flex bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      {/* Left panel – illustration */}
      <div className="hidden lg:flex lg:w-1/2 flex-col items-center justify-center relative overflow-hidden bg-gradient-to-br from-blue-600 to-indigo-700 p-12">
        {/* Decorative circles */}
        <div className="absolute -top-24 -left-24 h-80 w-80 rounded-full bg-white/10" />
        <div className="absolute -bottom-16 -right-16 h-64 w-64 rounded-full bg-white/10" />
        <div className="absolute top-1/2 left-1/4 h-32 w-32 rounded-full bg-white/5" />

        <div className="relative z-10 text-center">
          <div className="mb-8 inline-flex h-20 w-20 items-center justify-center rounded-3xl bg-white/20 backdrop-blur-sm text-white">
            <Plane className="h-10 w-10 text-white" />
          </div>
          <h1 className="text-4xl font-extrabold text-white leading-tight mb-4">
            Chào mừng trở lại
            <br />
            <span className="text-blue-200">Traveleke!</span>
          </h1>
          <p className="text-blue-100 text-lg max-w-md mx-auto leading-relaxed">
            Đăng nhập để khám phá hàng ngàn khách sạn tuyệt vời và lên kế hoạch chuyến đi của bạn.
          </p>

          {/* Features */}
          <div className="mt-12 grid grid-cols-2 gap-4 text-left">
            {[
              { icon: Building2, label: 'Ngàn khách sạn' },
              { icon: Tag, label: 'Giá tốt nhất' },
              { icon: Zap, label: 'Đặt nhanh 1 click' },
              { icon: ShieldCheck, label: 'Bảo mật tuyệt đối' },
            ].map((f) => {
              const FIcon = f.icon;
              return (
                <div
                  key={f.label}
                  className="flex items-center gap-3 rounded-2xl bg-white/10 backdrop-blur-sm px-4 py-3 text-white"
                >
                  <FIcon className="h-5 w-5 text-blue-200 shrink-0" />
                  <span className="text-sm font-semibold">{f.label}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Right panel – login form */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-12 lg:px-16">
        <div className="w-full max-w-md">
          {/* Logo */}
          <div className="mb-8">
            <Link href="/home" className="inline-block">
              <Image src={logo} alt="Traveleke Logo" className="h-12 w-auto object-contain" priority />
            </Link>
          </div>

          <div className="mb-6">
            <h2 className="text-2xl font-extrabold text-gray-900">Đăng nhập tài khoản</h2>
            <p className="mt-1 text-sm text-gray-500">Nhập thông tin để tiếp tục trải nghiệm</p>
          </div>

          {/* Success banner from verification */}
          {isVerifiedParam && (
            <div className="mb-5 flex items-start gap-3 rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-800">
              <CheckCircle2 className="h-5 w-5 text-green-600 shrink-0 mt-0.5" />
              <span>Xác thực email thành công! Vui lòng đăng nhập vào tài khoản của bạn.</span>
            </div>
          )}

          {/* Error banner */}
          {error && (
            <div className="mb-5 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
              <div className="flex items-start gap-3">
                <AlertCircle className="h-5 w-5 text-red-600 shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p>{error}</p>
                  {needsVerification && (
                    <div className="mt-3">
                      <Link
                        href={`/verify-email?email=${encodeURIComponent(unverifiedEmail)}`}
                        className="inline-flex items-center gap-1.5 rounded-lg bg-red-600 px-3 py-1.5 text-xs font-semibold text-white shadow-sm hover:bg-red-700 transition"
                      >
                        <Mail className="h-3.5 w-3.5" />
                        <span>Đến trang xác thực & gửi lại link</span>
                      </Link>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                Email <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="w-full rounded-xl border border-gray-200 bg-gray-50 pl-10 pr-4 py-3 text-sm text-gray-900 placeholder-gray-400 outline-none transition focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-100"
                  required
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                Mật khẩu <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full rounded-xl border border-gray-200 bg-gray-50 pl-10 pr-12 py-3 text-sm text-gray-900 placeholder-gray-400 outline-none transition focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-100"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((p) => !p)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={isCustomerLoading}
              className="w-full flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 py-3.5 text-sm font-semibold text-white shadow-lg shadow-blue-500/25 transition hover:from-blue-700 hover:to-indigo-700 active:scale-[0.99] disabled:opacity-60"
            >
              {isCustomerLoading ? (
                <>
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  <span>Đang đăng nhập...</span>
                </>
              ) : (
                'Đăng nhập'
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="my-6 flex items-center gap-4">
            <div className="h-px flex-1 bg-gray-200" />
            <span className="text-xs text-gray-400">hoặc</span>
            <div className="h-px flex-1 bg-gray-200" />
          </div>

          {/* Register Link */}
          <p className="text-center text-sm text-gray-600">
            Chưa có tài khoản?{' '}
            <Link href="/register" className="font-semibold text-blue-600 hover:underline">
              Đăng ký ngay
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default function CustomerLoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
        </div>
      }
    >
      <CustomerLoginForm />
    </Suspense>
  );
}
