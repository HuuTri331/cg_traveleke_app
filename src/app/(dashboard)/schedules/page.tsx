'use client';

import React from 'react';
import { Breadcrumb } from '@/components/dashboard/Breadcrumb';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { CalendarDays, Plus, MapPin, Clock, ArrowRight } from 'lucide-react';

export default function SchedulesPage() {
  const sampleSchedules = [
    {
      id: 1,
      tour: 'Tour Vịnh Hạ Long 2N1Đ',
      departure: '18/08/2026 07:30',
      origin: 'Hà Nội',
      destination: 'Hạ Long',
      slots: '15/20',
      status: 'SCHEDULED',
    },
    {
      id: 2,
      tour: 'Tour Phố Cổ Hội An & Cù Lao Chàm',
      departure: '22/08/2026 08:00',
      origin: 'Đà Nẵng',
      destination: 'Hội An',
      slots: '18/25',
      status: 'SCHEDULED',
    },
  ];

  return (
    <div className="space-y-6">
      <Breadcrumb pageTitle="Quản Lý Lịch Trình Di Chuyển" items={[{ label: 'Lịch Trình' }]} />

      <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-xs dark:border-gray-800 dark:bg-white/[0.03]">
        <div className="flex flex-col justify-between gap-4 border-b border-gray-200 px-5 py-4.5 sm:flex-row sm:items-center dark:border-gray-800">
          <div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <CalendarDays className="h-5 w-5 text-brand-500" />
              Lịch Trình Khởi Hành & Di Chuyển
            </h3>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
              Theo dõi ngày giờ khởi hành, điểm xuất phát và số lượng chỗ đã đặt
            </p>
          </div>
          <Button size="sm" leftIcon={<Plus className="h-4 w-4" />}>
            Tạo Lịch Trình Mới
          </Button>
        </div>

        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-gray-200 bg-gray-50/60 dark:border-gray-800 dark:bg-gray-850/40 text-gray-500 dark:text-gray-400 uppercase font-semibold">
              <tr>
                <th className="px-5 py-3.5">Tour Du Lịch</th>
                <th className="px-5 py-3.5">Thời Gian Khởi Hành</th>
                <th className="px-5 py-3.5">Tuyến Đường</th>
                <th className="px-5 py-3.5">Số Chỗ</th>
                <th className="px-5 py-3.5">Trạng Thái</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
              {sampleSchedules.map((s) => (
                <tr key={s.id} className="hover:bg-gray-50/50 dark:hover:bg-gray-800/40 transition-colors">
                  <td className="px-5 py-4 font-bold text-gray-900 dark:text-white">
                    {s.tour}
                  </td>
                  <td className="px-5 py-4 text-gray-600 dark:text-gray-300">
                    <span className="flex items-center gap-1.5">
                      <Clock className="h-3.5 w-3.5 text-brand-500" />
                      {s.departure}
                    </span>
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-1.5 text-gray-800 dark:text-gray-200 font-medium">
                      <span>{s.origin}</span>
                      <ArrowRight className="h-3 w-3 text-gray-400" />
                      <span>{s.destination}</span>
                    </div>
                  </td>
                  <td className="px-5 py-4 font-semibold text-gray-800 dark:text-gray-200">
                    {s.slots} chỗ
                  </td>
                  <td className="px-5 py-4">
                    <Badge variant="info" dot>
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
