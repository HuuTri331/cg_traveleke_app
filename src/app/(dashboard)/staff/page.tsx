'use client';

import React from 'react';
import { Breadcrumb } from '@/components/dashboard/Breadcrumb';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Users, Plus, ShieldCheck, Mail, Phone, Building2 } from 'lucide-react';

export default function StaffPage() {
  const sampleStaff = [
    {
      id: 1,
      name: 'Đặng Quang Minh',
      email: 'minh.dang@traveleke.vn',
      phone: '0909 111 222',
      role: 'ADMIN',
      hotel: 'Toàn hệ thống',
      status: 'ACTIVE',
    },
    {
      id: 2,
      name: 'Phạm Đức Huy',
      email: 'huy.pham@traveleke.vn',
      phone: '0908 333 444',
      role: 'MANAGER',
      hotel: 'Khách sạn Rex Sài Gòn',
      status: 'ACTIVE',
    },
    {
      id: 3,
      name: 'Vũ Thu Trang',
      email: 'trang.vu@traveleke.vn',
      phone: '0907 555 666',
      role: 'EMPLOYEE',
      hotel: 'Grand Tourane Đà Nẵng',
      status: 'ACTIVE',
    },
  ];

  return (
    <div className="space-y-6">
      <Breadcrumb pageTitle="Quản Lý Phân Công Nhân Viên" items={[{ label: 'Nhân Viên' }]} />

      <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-xs dark:border-gray-800 dark:bg-white/[0.03]">
        <div className="flex flex-col justify-between gap-4 border-b border-gray-200 px-5 py-4.5 sm:flex-row sm:items-center dark:border-gray-800">
          <div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <Users className="h-5 w-5 text-brand-500" />
              Danh Sách Nhân Sự & Phân Công Khách Sạn
            </h3>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
              Phân quyền tài khoản quản lý và nhân viên phục vụ tại từng khách sạn
            </p>
          </div>
          <Button size="sm" leftIcon={<Plus className="h-4 w-4" />}>
            Thêm Nhân Viên
          </Button>
        </div>

        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-gray-200 bg-gray-50/60 dark:border-gray-800 dark:bg-gray-850/40 text-gray-500 dark:text-gray-400 uppercase font-semibold">
              <tr>
                <th className="px-5 py-3.5">Họ & Tên</th>
                <th className="px-5 py-3.5">Liên Hệ</th>
                <th className="px-5 py-3.5">Vai Trò</th>
                <th className="px-5 py-3.5">Khách Sạn Phụ Trách</th>
                <th className="px-5 py-3.5">Trạng Thái</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
              {sampleStaff.map((s) => (
                <tr key={s.id} className="hover:bg-gray-50/50 dark:hover:bg-gray-800/40 transition-colors">
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <div className="h-9 w-9 rounded-full bg-brand-100 dark:bg-brand-500/20 text-brand-700 dark:text-brand-300 font-bold flex items-center justify-center">
                        {s.name.charAt(0)}
                      </div>
                      <span className="font-bold text-gray-900 dark:text-white">{s.name}</span>
                    </div>
                  </td>
                  <td className="px-5 py-4">
                    <p className="text-gray-700 dark:text-gray-300 flex items-center gap-1">
                      <Mail className="h-3.5 w-3.5 text-gray-400" />
                      {s.email}
                    </p>
                    <p className="text-[11px] text-gray-400 flex items-center gap-1 mt-0.5">
                      <Phone className="h-3.5 w-3.5" />
                      {s.phone}
                    </p>
                  </td>
                  <td className="px-5 py-4">
                    <span className="inline-flex items-center gap-1 font-bold text-brand-600 dark:text-brand-400">
                      <ShieldCheck className="h-3.5 w-3.5" />
                      {s.role}
                    </span>
                  </td>
                  <td className="px-5 py-4 font-semibold text-gray-800 dark:text-gray-200 flex items-center gap-1 mt-3">
                    <Building2 className="h-3.5 w-3.5 text-gray-400" />
                    {s.hotel}
                  </td>
                  <td className="px-5 py-4">
                    <Badge variant="success" dot>
                      {s.status}
                    </Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
