'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import logo from '@/assets/image/logo.png';
import { useCustomerAuth } from '@/features/auth/context/CustomerAuthContext';

export default function CustomerLoginPage() {
  const { customerLogin, isCustomerLoading } = useCustomerAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email.trim() || !password.trim()) {
      setError('Vui lòng nhập đầy đủ email và mật khẩu.');
      return;
    }

    try {
      await customerLogin({ email: email.trim(), password });
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Đăng nhập thất bại. Vui lòng thử lại.');
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
          <div className="mb-8 inline-flex h-20 w-20 items-center justify-center rounded-3xl bg-white/20 backdrop-blur-sm">
            <span className="text-4xl">✈️</span>
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
              { icon: '🏨', label: 'Ngàn khách sạn' },
              { icon: '💰', label: 'Giá tốt nhất' },
              { icon: '⚡', label: 'Đặt nhanh 1 click' },
              { icon: '🛡️', label: 'Bảo đảm hoàn tiền' },
            ].map((f) => (
              <div key={f.label} className="flex items-center gap-3 rounded-2xl bg-white/10 backdrop-blur-sm px-4 py-3">
                <span className="text-2xl">{f.icon}</span>
                <span className="text-white text-sm font-semibold">{f.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right panel – form */}
      <div className="flex flex-1 items-center justify-center px-6 py-12">
        <div className="w-full max-w-md">
          {/* Logo */}
          <div className="mb-8 flex flex-col items-center">
            <Link href="/home">
              <Image src={logo} alt="Traveleke" className="h-14 w-auto object-contain mb-4" priority />
            </Link>
            <h2 className="text-2xl font-extrabold text-gray-900">Đăng nhập tài khoản</h2>
            <p className="mt-1 text-sm text-gray-500">Nhập thông tin để tiếp tục</p>
          </div>

          {/* Error */}
          {error && (
            <div className="mb-5 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              <span className="text-base shrink-0">⚠️</span>
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                Email <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 text-base">📧</span>
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
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 text-base">🔒</span>
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
                  {showPassword ? '🙈' : '👁️'}
                </button>
              </div>
            </div>

            {/* Forgot */}
            <div className="flex justify-end">
              <a href="#" className="text-sm text-blue-500 hover:text-blue-700 font-semibold">
                Quên mật khẩu?
              </a>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={isCustomerLoading}
              className="w-full rounded-xl bg-gradient-to-r from-blue-500 to-indigo-600 px-6 py-3.5 text-sm font-bold text-white shadow-lg shadow-blue-500/30 transition-all hover:from-blue-600 hover:to-indigo-700 hover:shadow-blue-600/40 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isCustomerLoading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="h-4 w-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
                  Đang đăng nhập...
                </span>
              ) : 'Đăng nhập'}
            </button>
          </form>

          {/* Divider */}
          <div className="my-6 flex items-center gap-4">
            <div className="flex-1 h-px bg-gray-200" />
            <span className="text-xs text-gray-400 font-semibold">HOẶC</span>
            <div className="flex-1 h-px bg-gray-200" />
          </div>

          {/* Google (placeholder) */}
          <button
            type="button"
            className="w-full flex items-center justify-center gap-3 rounded-xl border border-gray-200 bg-white px-6 py-3 text-sm font-semibold text-gray-700 shadow-sm transition hover:bg-gray-50"
          >
            <img src="https://cdn-icons-png.flaticon.com/512/281/281764.png" alt="Google" className="h-5 w-5" />
            Tiếp tục với Google
          </button>

          {/* Register link */}
          <p className="mt-6 text-center text-sm text-gray-500">
            Chưa có tài khoản?{' '}
            <Link href="/register" className="font-bold text-blue-500 hover:text-blue-700">
              Đăng ký ngay →
            </Link>
          </p>

          <p className="mt-2 text-center text-xs text-gray-400">
            Là nhân viên?{' '}
            <Link href="/login" className="font-semibold text-gray-600 hover:text-gray-900">
              Đăng nhập trang quản trị
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
