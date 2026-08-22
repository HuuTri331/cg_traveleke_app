'use client';

import React from 'react';
import { Breadcrumb } from '@/components/dashboard/Breadcrumb';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { UserCheck, ShieldCheck, Mail, Phone, Lock, Save } from 'lucide-react';
import { useToast } from '@/components/ui/Toast';

export default function ProfilePage() {
  const { success } = useToast();

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    success('Thành công', 'Đã cập nhật thông tin tài khoản admin thành công!');
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <Breadcrumb pageTitle="Hồ Sơ Tài Khoản Quản Trị" items={[{ label: 'Tài Khoản' }]} />

      <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-xs dark:border-gray-800 dark:bg-white/[0.03]">
        <div className="flex items-center gap-4 pb-6 border-b border-gray-100 dark:border-gray-800">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-tr from-brand-600 to-indigo-400 text-white font-black text-2xl shadow-lg">
            AD
          </div>
          <div>
            <h3 className="text-base font-bold text-gray-900 dark:text-white">
              Quản Trị Viên Hệ Thống
            </h3>
            <p className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1 mt-0.5">
              <ShieldCheck className="h-3.5 w-3.5 text-brand-500" /> Vai trò: ADMIN (Toàn quyền hệ thống)
            </p>
          </div>
        </div>

        <form onSubmit={handleSave} className="space-y-4 mt-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Họ và tên"
              defaultValue="Đặng Quang Minh"
              leftIcon={<UserCheck className="h-4 w-4" />}
            />
            <Input
              label="Địa chỉ Email"
              type="email"
              defaultValue="admin@traveleke.vn"
              leftIcon={<Mail className="h-4 w-4" />}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Số điện thoại"
              defaultValue="0909 123 456"
              leftIcon={<Phone className="h-4 w-4" />}
            />
            <Input
              label="Đổi mật khẩu mới"
              type="password"
              placeholder="••••••••"
              leftIcon={<Lock className="h-4 w-4" />}
            />
          </div>

          <div className="flex justify-end pt-4">
            <Button type="submit" leftIcon={<Save className="h-4 w-4" />}>
              Lưu Thông Tin
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
