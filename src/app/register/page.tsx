'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import logo from '@/assets/image/logo.png';
import { apiClient } from '@/services/api/client';
import { DatePicker } from '@/components/ui/DatePicker';

const LOCKOUT_KEY = 'traveleke_register_lockout';

interface StoredLockout {
  lockedUntil: number;
  tier: 1 | 2;
  message: string;
}

export default function RegisterPage() {
  const router = useRouter();

  // Form state
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [gender, setGender] = useState<'MALE' | 'FEMALE' | 'OTHER' | ''>('');

  // Avatar
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // UI state
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isValidatingEmail, setIsValidatingEmail] = useState(false);
  const [step, setStep] = useState<1 | 2>(1);

  // Lockout / Anti-spam state
  const [isLocked, setIsLocked] = useState(false);
  const [lockoutTier, setLockoutTier] = useState<1 | 2>(1);
  const [lockoutMessage, setLockoutMessage] = useState('');
  const [remainingSeconds, setRemainingSeconds] = useState(0);

  // 1. Kiểm tra trạng thái khóa từ localStorage khi mở trang
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const storedStr = localStorage.getItem(LOCKOUT_KEY);
    if (!storedStr) return;

    try {
      const stored: StoredLockout = JSON.parse(storedStr);
      const now = Date.now();
      if (stored.lockedUntil > now) {
        setIsLocked(true);
        setLockoutTier(stored.tier || 1);
        setLockoutMessage(stored.message || 'Bạn tạm thời bị khóa do vi phạm nhập email không có thật.');
        setRemainingSeconds(Math.ceil((stored.lockedUntil - now) / 1000));
      } else {
        localStorage.removeItem(LOCKOUT_KEY);
      }
    } catch {
      localStorage.removeItem(LOCKOUT_KEY);
    }
  }, []);

  // 2. Bộ đếm ngược thời gian khóa từng giây
  useEffect(() => {
    if (!isLocked || remainingSeconds <= 0) {
      if (isLocked && remainingSeconds <= 0) {
        setIsLocked(false);
        setError('');
        if (typeof window !== 'undefined') {
          localStorage.removeItem(LOCKOUT_KEY);
        }
      }
      return;
    }

    const interval = setInterval(() => {
      setRemainingSeconds((prev) => {
        if (prev <= 1) {
          setIsLocked(false);
          setError('');
          if (typeof window !== 'undefined') {
            localStorage.removeItem(LOCKOUT_KEY);
          }
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isLocked, remainingSeconds]);

  // Hàm định dạng thời gian đếm ngược (MM:SS hoặc HH:MM:SS)
  const formatRemainingTime = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    if (h > 0) {
      return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
    }
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };

  // Kích hoạt khóa khi phát hiện vi phạm từ API
  const applyLockout = useCallback((tier: 1 | 2, lockedUntil: number, message: string) => {
    setIsLocked(true);
    setLockoutTier(tier);
    setLockoutMessage(message);
    const remaining = Math.max(1, Math.ceil((lockedUntil - Date.now()) / 1000));
    setRemainingSeconds(remaining);

    if (typeof window !== 'undefined') {
      localStorage.setItem(
        LOCKOUT_KEY,
        JSON.stringify({ lockedUntil, tier, message })
      );
    }
  }, []);

  // 3. Kiểm tra email trực tiếp với backend (chặn từ ngữ thô tục / email ảo / DNS MX)
  const checkEmailValidity = async (targetEmail: string): Promise<boolean> => {
    if (isLocked) return false;
    const trimmed = targetEmail.trim();
    if (!trimmed || !trimmed.includes('@')) return false;

    setIsValidatingEmail(true);
    try {
      await apiClient.post('/auth/validate-email', { email: trimmed });
      return true;
    } catch (err: any) {
      const data = err?.response?.data;
      if (data?.locked || err?.locked) {
        const tier = (data?.tier || err?.tier || 1) as 1 | 2;
        const until = data?.lockedUntil || err?.lockedUntil || (Date.now() + (tier === 2 ? 36000000 : 600000));
        const msg = data?.message || err?.message || 'Gmail không có thực! Bạn bị tạm khóa.';
        applyLockout(tier, until, msg);
      } else {
        setError(data?.message || err.message || 'Email không hợp lệ.');
      }
      return false;
    } finally {
      setIsValidatingEmail(false);
    }
  };

  const handleEmailBlur = async () => {
    if (!email.trim() || isLocked) return;
    await checkEmailValidity(email);
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (isLocked) return;
    const file = e.target.files?.[0];
    if (!file) return;
    setAvatarFile(file);
    const reader = new FileReader();
    reader.onload = () => setAvatarPreview(reader.result as string);
    reader.readAsDataURL(file);
  };

  // Chuyển từ Bước 1 sang Bước 2
  const handleNextStep = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (isLocked) return;

    if (!fullName.trim() || !email.trim() || !password || !confirmPassword) {
      setError('Vui lòng điền đầy đủ thông tin bắt buộc.');
      return;
    }
    if (password !== confirmPassword) {
      setError('Mật khẩu xác nhận không khớp. Vui lòng kiểm tra lại.');
      return;
    }
    if (password.length < 6) {
      setError('Mật khẩu phải có ít nhất 6 ký tự.');
      return;
    }

    // Kiểm tra tính hợp lệ của email với máy chủ
    const isValid = await checkEmailValidity(email);
    if (!isValid) return;

    setStep(2);
  };

  // Submit toàn bộ form
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (isLocked) return;

    setIsLoading(true);
    try {
      const formData = new FormData();
      formData.append('fullName', fullName.trim());
      formData.append('email', email.trim());
      formData.append('password', password);
      if (phone.trim()) formData.append('phone', phone.trim());
      if (address.trim()) formData.append('address', address.trim());
      if (dateOfBirth) formData.append('dateOfBirth', dateOfBirth);
      if (gender) formData.append('gender', gender);
      if (avatarFile) formData.append('avatar', avatarFile);

      await apiClient.post('/auth/register', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      setSuccessMsg(
        'Đăng ký tài khoản thành công! Chúng tôi đã gửi liên kết xác thực đến email của bạn. Đang chuyển hướng...',
      );
      setTimeout(() => {
        router.push(`/verify-email?email=${encodeURIComponent(email.trim())}`);
      }, 1400);
    } catch (err: any) {
      const data = err?.response?.data;
      if (data?.locked || err?.locked) {
        const tier = (data?.tier || err?.tier || 1) as 1 | 2;
        const until = data?.lockedUntil || err?.lockedUntil || (Date.now() + (tier === 2 ? 36000000 : 600000));
        const msg = data?.message || err?.message || 'Phát hiện email không có thực!';
        applyLockout(tier, until, msg);
      } else {
        const msg =
          data?.message ||
          (err instanceof Error ? err.message : 'Đăng ký thất bại, vui lòng thử lại.');
        setError(Array.isArray(msg) ? msg.join('. ') : msg);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const genderOptions = [
    { value: 'MALE', label: 'Nam' },
    { value: 'FEMALE', label: 'Nữ' },
  ];

  const inputClass = `w-full rounded-xl border border-gray-200 px-4 py-3 text-sm text-gray-900 placeholder-gray-400 outline-none transition focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-100 ${
    isLocked ? 'bg-gray-100 cursor-not-allowed opacity-60' : 'bg-gray-50'
  }`;

  const labelClass = 'block text-sm font-semibold text-gray-700 mb-1.5';

  return (
    <div className="min-h-screen flex bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      {/* Left panel */}
      <div className="hidden lg:flex lg:w-5/12 flex-col items-center justify-center relative overflow-hidden bg-gradient-to-br from-indigo-600 to-blue-700 p-12">
        <div className="absolute -top-24 -right-24 h-80 w-80 rounded-full bg-white/10" />
        <div className="absolute -bottom-16 -left-16 h-64 w-64 rounded-full bg-white/10" />

        <div className="relative z-10 text-center">
          <div className="mb-8 inline-flex h-20 w-20 items-center justify-center rounded-3xl bg-white/20 backdrop-blur-sm">
            <span className="text-4xl">✈️</span>
          </div>
          <h1 className="text-4xl font-extrabold text-white leading-tight mb-4">
            Khám phá thế giới
            <br />
            <span className="text-blue-200">cùng Traveleke!</span>
          </h1>
          <p className="text-blue-100 text-lg max-w-sm mx-auto leading-relaxed">
            Tạo tài khoản để tận hưởng không gian nghỉ dưỡng sang trọng và những hành trình tour độc đáo nhất.
          </p>

          <div className="mt-10 space-y-4 text-left">
            {[
              {
                icon: '🏨',
                title: 'Nghỉ dưỡng đẳng cấp',
                desc: 'Hàng ngàn khách sạn & resort cao cấp với tiện nghi chuẩn quốc tế.',
              },
              {
                icon: '🏖️',
                title: 'Tour du lịch độc đáo',
                desc: 'Lịch trình linh hoạt, trải nghiệm bản sắc văn hóa và điểm đến hàng đầu.',
              },
              {
                icon: '🎯',
                title: 'Đặc quyền thành viên',
                desc: 'Ưu đãi giá tốt nhất được đảm bảo, tích lũy điểm thưởng và giữ chỗ tức thì.',
              },
              {
                icon: '🛎️',
                title: 'Dịch vụ tận tâm 24/7',
                desc: 'Đội ngũ chăm sóc chu đáo, luôn sẵn sàng đồng hành trên từng chuyến đi.',
              },
            ].map((b) => (
              <div key={b.title} className="flex items-start gap-3.5 text-white">
                <span className="text-2xl shrink-0 mt-0.5">{b.icon}</span>
                <div>
                  <div className="text-sm font-bold text-white">{b.title}</div>
                  <div className="text-xs text-blue-100/90 leading-relaxed">{b.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right panel */}
      <div className="flex flex-1 items-center justify-center px-6 py-8 overflow-y-auto">
        <div className="w-full max-w-lg">
          {/* Logo */}
          <div className="mb-6 flex flex-col items-center">
            <Link href="/home">
              <Image src={logo} alt="Traveleke" className="h-12 w-auto object-contain mb-3" priority />
            </Link>
            <h2 className="text-2xl font-extrabold text-gray-900">Tạo tài khoản mới</h2>
            <p className="mt-1 text-sm text-gray-500">Điền thông tin chính xác để kích hoạt tài khoản</p>
          </div>

          {/* BANNER KHÓA PHÒNG NGỪA SPAM (10 PHÚT HOẶC 10 GIỜ) */}
          {isLocked && (
            <div className="mb-6 rounded-2xl border-2 border-red-400 bg-red-50/95 p-5 text-red-900 shadow-md animate-pulse">
              <div className="flex items-start gap-3.5">
                <span className="text-3xl shrink-0">🚫</span>
                <div className="flex-1">
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <span className="font-extrabold text-sm uppercase tracking-wider text-red-700 bg-red-100 px-2.5 py-0.5 rounded-full">
                      {lockoutTier === 2 ? 'KHÓA PHẠT 10 GIỜ' : 'TẠM KHÓA 10 PHÚT'}
                    </span>
                  </div>
                  <p className="text-sm font-bold leading-relaxed text-red-900 mt-1">
                    {lockoutMessage}
                  </p>
                  <div className="mt-3.5 flex items-center gap-2 font-mono text-xs sm:text-sm font-bold bg-white border border-red-200 rounded-xl px-3.5 py-2 text-red-700 shadow-inner w-fit">
                    <span>⏳ Thời gian mở khóa còn lại:</span>
                    <span className="text-red-600 text-base">{formatRemainingTime(remainingSeconds)}</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Step indicator */}
          <div className="mb-6 flex items-center gap-3">
            <div className={`flex-1 h-1.5 rounded-full transition-colors ${step >= 1 ? 'bg-blue-500' : 'bg-gray-200'}`} />
            <div className={`flex-1 h-1.5 rounded-full transition-colors ${step >= 2 ? 'bg-blue-500' : 'bg-gray-200'}`} />
          </div>
          <p className="mb-6 text-xs text-gray-400 font-semibold uppercase tracking-wider">
            Bước {step} / 2 — {step === 1 ? 'Thông tin tài khoản' : 'Thông tin cá nhân & Avatar'}
          </p>

          {/* Regular Alerts */}
          {error && !isLocked && (
            <div className="mb-4 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              <span className="shrink-0">⚠️</span>
              <span>{error}</span>
            </div>
          )}
          {successMsg && (
            <div className="mb-4 flex items-start gap-3 rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
              <span className="shrink-0">✅</span>
              <span>{successMsg}</span>
            </div>
          )}

          <form onSubmit={step === 1 ? handleNextStep : handleSubmit} className="space-y-4">
            {step === 1 ? (
              <>
                {/* Full name */}
                <div>
                  <label className={labelClass}>
                    Họ và tên <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400">👤</span>
                    <input
                      type="text"
                      disabled={isLocked}
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="Nguyễn Văn A"
                      className={`${inputClass} pl-10`}
                      required
                    />
                  </div>
                </div>

                {/* Email with real-time validation */}
                <div>
                  <label className={labelClass}>
                    Email Gmail chính thống <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400">📧</span>
                    <input
                      type="email"
                      disabled={isLocked}
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      onBlur={handleEmailBlur}
                      placeholder="you@gmail.com"
                      className={`${inputClass} pl-10 ${isValidatingEmail ? 'pr-10' : ''}`}
                      required
                    />
                    {isValidatingEmail && (
                      <div className="absolute right-3.5 top-1/2 -translate-y-1/2">
                        <div className="h-4 w-4 animate-spin rounded-full border-2 border-blue-500 border-t-transparent" />
                      </div>
                    )}
                  </div>
                  <p className="mt-1 text-[11px] text-gray-400">
                    Hệ thống sẽ tự động đối soát DNS và từ chối mọi email không tồn tại hoặc thô tục.
                  </p>
                </div>

                {/* Password */}
                <div>
                  <label className={labelClass}>
                    Mật khẩu <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400">🔒</span>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      disabled={isLocked}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Ít nhất 6 ký tự"
                      className={`${inputClass} pl-10 pr-12`}
                      required
                    />
                    <button
                      type="button"
                      disabled={isLocked}
                      onClick={() => setShowPassword((p) => !p)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showPassword ? '🙈' : '👁️'}
                    </button>
                  </div>
                </div>

                {/* Confirm password */}
                <div>
                  <label className={labelClass}>
                    Xác nhận mật khẩu <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400">🔒</span>
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      disabled={isLocked}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Nhập lại mật khẩu"
                      className={`${inputClass} pl-10 pr-12`}
                      required
                    />
                    <button
                      type="button"
                      disabled={isLocked}
                      onClick={() => setShowConfirmPassword((p) => !p)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showConfirmPassword ? '🙈' : '👁️'}
                    </button>
                  </div>
                  {confirmPassword && password !== confirmPassword && (
                    <p className="mt-1.5 text-xs text-red-500 font-medium">⚠️ Mật khẩu không khớp</p>
                  )}
                </div>

                {/* Next Step Button */}
                <button
                  type="submit"
                  disabled={isLocked || isValidatingEmail}
                  className={`w-full rounded-xl px-6 py-3.5 text-sm font-bold text-white shadow-lg transition-all ${
                    isLocked
                      ? 'bg-gray-400 cursor-not-allowed shadow-none'
                      : 'bg-gradient-to-r from-blue-500 to-indigo-600 shadow-blue-500/30 hover:from-blue-600 hover:to-indigo-700'
                  }`}
                >
                  {isLocked ? (
                    <span className="flex items-center justify-center gap-2">
                      <span>🔒</span>
                      <span>Đã bị khóa: Thử lại sau ({formatRemainingTime(remainingSeconds)})</span>
                    </span>
                  ) : isValidatingEmail ? (
                    <span>Đang kiểm tra Gmail...</span>
                  ) : (
                    'Tiếp theo →'
                  )}
                </button>
              </>
            ) : (
              <>
                {/* Avatar upload */}
                <div className="flex flex-col items-center gap-3">
                  <div className="relative">
                    <button
                      type="button"
                      disabled={isLocked}
                      onClick={() => fileInputRef.current?.click()}
                      className={`h-24 w-24 overflow-hidden rounded-full bg-gradient-to-tr from-blue-100 to-indigo-100 flex items-center justify-center border-4 border-white shadow-md transition ${
                        isLocked ? 'cursor-not-allowed opacity-50' : 'cursor-pointer hover:scale-105'
                      }`}
                    >
                      {avatarPreview ? (
                        <img src={avatarPreview} alt="Avatar" className="h-full w-full object-cover" />
                      ) : (
                        <span className="text-4xl">👤</span>
                      )}
                    </button>
                    {avatarPreview && !isLocked && (
                      <button
                        type="button"
                        onClick={() => {
                          setAvatarFile(null);
                          setAvatarPreview(null);
                        }}
                        className="absolute -top-1 -right-1 h-6 w-6 rounded-full bg-red-500 text-white text-xs flex items-center justify-center shadow"
                      >
                        ✕
                      </button>
                    )}
                  </div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    disabled={isLocked}
                    className="hidden"
                    onChange={handleAvatarChange}
                  />
                  <span className="text-xs text-gray-500">
                    Ảnh đại diện avatar (tuỳ chọn, tối đa 5MB)
                  </span>
                </div>

                {/* Phone */}
                <div>
                  <label className={labelClass}>Số điện thoại</label>
                  <div className="relative">
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400">📱</span>
                    <input
                      type="tel"
                      disabled={isLocked}
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="0901234567"
                      className={`${inputClass} pl-10`}
                    />
                  </div>
                </div>

                {/* Address */}
                <div>
                  <label className={labelClass}>Địa chỉ</label>
                  <div className="relative">
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400">📍</span>
                    <input
                      type="text"
                      disabled={isLocked}
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      placeholder="Số nhà, tên đường, quận/huyện, TP"
                      className={`${inputClass} pl-10`}
                    />
                  </div>
                </div>

                {/* Date of birth & Gender */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className={labelClass}>Ngày sinh</label>
                    <DatePicker
                      disabled={isLocked}
                      value={dateOfBirth}
                      onChange={(val) => setDateOfBirth(val)}
                      maxDate={new Date().toISOString().split('T')[0]}
                      placeholder="dd/mm/yyyy"
                    />
                  </div>
                  <div>
                    <label className={labelClass}>Giới tính</label>
                    <select
                      disabled={isLocked}
                      value={gender}
                      onChange={(e) => setGender(e.target.value as any)}
                      className={inputClass}
                    >
                      <option value="">Chọn giới tính</option>
                      {genderOptions.map((o) => (
                        <option key={o.value} value={o.value}>
                          {o.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    disabled={isLocked || isLoading}
                    onClick={() => setStep(1)}
                    className="flex-1 rounded-xl border border-gray-200 py-3.5 text-sm font-semibold text-gray-600 transition hover:bg-gray-50 disabled:opacity-50"
                  >
                    ← Quay lại
                  </button>

                  <button
                    type="submit"
                    disabled={isLocked || isLoading}
                    className={`flex-2 w-full rounded-xl px-6 py-3.5 text-sm font-bold text-white shadow-lg transition-all ${
                      isLocked
                        ? 'bg-gray-400 cursor-not-allowed shadow-none'
                        : 'bg-gradient-to-r from-blue-500 to-indigo-600 shadow-blue-500/30 hover:from-blue-600 hover:to-indigo-700'
                    }`}
                  >
                    {isLocked ? (
                      <span className="flex items-center justify-center gap-2">
                        <span>🔒</span>
                        <span>Đã bị khóa ({formatRemainingTime(remainingSeconds)})</span>
                      </span>
                    ) : isLoading ? (
                      <span className="flex items-center justify-center gap-2">
                        <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                        <span>Đang đăng ký & gửi mail...</span>
                      </span>
                    ) : (
                      'Hoàn tất đăng ký 🎉'
                    )}
                  </button>
                </div>
              </>
            )}
          </form>

          {/* Login link */}
          <p className="mt-6 text-center text-sm text-gray-500">
            Đã có tài khoản?{' '}
            <Link href="/customer-login" className="font-semibold text-blue-600 hover:underline">
              Đăng nhập ngay
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
