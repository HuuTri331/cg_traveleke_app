'use client';

import React from 'react';
import { Breadcrumb } from '@/components/dashboard/Breadcrumb';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { CalendarCheck, Search, Filter, Download, Plus } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';

export default function BookingsPage() {
  const sampleBookings = [
    {
      code: 'BK-2026-0815-01',
      customerName: 'Nguyễn Văn An',
      phone: '0901 234 567',
      hotelName: 'Khách sạn Rex Sài Gòn',
      roomName: 'Deluxe Ocean View',
      checkIn: '16/08/2026',
      checkOut: '19/08/2026',
      total: 3500000,
      status: 'CONFIRMED',
    },
    {
      code: 'BK-2026-0815-02',
      customerName: 'Trần Thị Mai',
      phone: '0912 345 678',
      hotelName: 'Grand Tourane Đà Nẵng',
      roomName: 'Suite Hướng Biển',
      checkIn: '20/08/2026',
      checkOut: '22/08/2026',
      total: 4200000,
      status: 'PENDING',
    },
    {
      code: 'BK-2026-0815-03',
      customerName: 'Lê Hoàng Nam',
      phone: '0988 765 432',
      hotelName: 'Hanoi Pearl Hotel',
      roomName: 'Superior Double Room',
      checkIn: '25/08/2026',
      checkOut: '28/08/2026',
      total: 2800000,
      status: 'COMPLETED',
    },
  ];

  return (
    <div className="space-y-6">
      <Breadcrumb
        pageTitle="Quản Lý Đặt Phòng (Bookings)"
        items={[{ label: 'Danh Sách Đơn Đặt Phòng' }]}
      />

      <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-xs dark:border-gray-800 dark:bg-white/[0.03]">
        <div className="flex flex-col justify-between gap-4 border-b border-gray-200 px-5 py-4.5 sm:flex-row sm:items-center dark:border-gray-800">
          <div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <CalendarCheck className="h-5 w-5 text-brand-500" />
              Đơn Đặt Phòng Khách Sạn
            </h3>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
              Theo dõi lịch check-in/out, thông tin khách hàng và tình trạng xử lý đơn
            </p>
          </div>
          <div className="flex items-center gap-2.5">
            <Button variant="outline" size="sm" leftIcon={<Download className="h-4 w-4" />}>
              Xuất File
            </Button>
          </div>
        </div>

        {/* Filter bar */}
        <div className="border-b border-gray-200 px-5 py-3.5 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-900/40 flex items-center justify-between gap-3">
          <div className="relative flex-1 max-w-md">
            <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-gray-400">
              <Search className="h-4 w-4" />
            </span>
            <input
              type="text"
              placeholder="Tìm theo mã đơn, tên khách, số điện thoại..."
              className="h-10 w-full rounded-xl border border-gray-300 bg-white py-2 pl-10 pr-4 text-xs text-gray-800 placeholder:text-gray-400 focus:border-brand-500 focus:outline-none dark:border-gray-700 dark:bg-gray-900 dark:text-white/90"
            />
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-gray-200 bg-gray-50/60 dark:border-gray-800 dark:bg-gray-850/40 text-gray-500 dark:text-gray-400 uppercase font-semibold">
              <tr>
                <th className="px-5 py-3.5">Mã Đơn</th>
                <th className="px-5 py-3.5">Khách Hàng</th>
                <th className="px-5 py-3.5">Khách Sạn & Phòng</th>
                <th className="px-5 py-3.5">Ngày Lưu Trú</th>
                <th className="px-5 py-3.5">Tổng Tiền</th>
                <th className="px-5 py-3.5">Trạng Thái</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
              {sampleBookings.map((b, i) => (
                <tr key={i} className="hover:bg-gray-50/50 dark:hover:bg-gray-800/40 transition-colors">
                  <td className="px-5 py-4 font-mono font-bold text-brand-600 dark:text-brand-400">
                    {b.code}
                  </td>
                  <td className="px-5 py-4">
                    <p className="font-bold text-gray-900 dark:text-white">{b.customerName}</p>
                    <p className="text-[11px] text-gray-400">{b.phone}</p>
                  </td>
                  <td className="px-5 py-4">
                    <p className="font-semibold text-gray-800 dark:text-gray-200">{b.hotelName}</p>
                    <p className="text-[11px] text-gray-500">{b.roomName}</p>
                  </td>
                  <td className="px-5 py-4 text-gray-600 dark:text-gray-300">
                    {b.checkIn} → {b.checkOut}
                  </td>
                  <td className="px-5 py-4 font-bold text-gray-900 dark:text-white">
                    {formatCurrency(b.total)}
                  </td>
                  <td className="px-5 py-4">
                    <Badge
                      variant={
                        b.status === 'CONFIRMED'
                          ? 'success'
                          : b.status === 'PENDING'
                          ? 'warning'
                          : 'info'
                      }
                      dot
                    >
                      {b.status}
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
