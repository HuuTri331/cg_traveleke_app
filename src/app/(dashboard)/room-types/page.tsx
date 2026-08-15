'use client';

import React from 'react';
import { Breadcrumb } from '@/components/dashboard/Breadcrumb';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { HOTEL_TYPES } from '@/lib/constants';
import { Layers, Plus, Edit } from 'lucide-react';

export default function RoomTypesPage() {
  return (
    <div className="space-y-6">
      <Breadcrumb
        pageTitle="Danh Mục Loại Hình & Phân Loại Lưu Trú"
        items={[{ label: 'Loại Hình' }]}
      />

      <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-xs dark:border-gray-800 dark:bg-white/[0.03]">
        <div className="flex flex-col justify-between gap-4 border-b border-gray-200 px-5 py-4.5 sm:flex-row sm:items-center dark:border-gray-800">
          <div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <Layers className="h-5 w-5 text-brand-500" />
              Danh Sách Phân Loại Khách Sạn / Cơ Sở Lưu Trú
            </h3>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
              Cơ sở dữ liệu danh mục loại hình: Khách sạn, Khu nghỉ dưỡng (Resort), Homestay, Villa...
            </p>
          </div>
          <Button size="sm" leftIcon={<Plus className="h-4 w-4" />}>
            Thêm Loại Mới
          </Button>
        </div>

        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-gray-200 bg-gray-50/60 dark:border-gray-800 dark:bg-gray-850/40 text-gray-500 dark:text-gray-400 uppercase font-semibold">
              <tr>
                <th className="px-5 py-3.5">Mã Code</th>
                <th className="px-5 py-3.5">Tên Loại Hình</th>
                <th className="px-5 py-3.5">Mô Tả Chi Tiết</th>
                <th className="px-5 py-3.5">Trạng Thái</th>
                <th className="px-5 py-3.5 text-right">Thao Tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
              {HOTEL_TYPES.map((t) => (
                <tr key={t.id} className="hover:bg-gray-50/50 dark:hover:bg-gray-800/40 transition-colors">
                  <td className="px-5 py-4 font-mono font-bold text-brand-600 dark:text-brand-400">
                    {t.code}
                  </td>
                  <td className="px-5 py-4 font-bold text-gray-900 dark:text-white">
                    {t.name}
                  </td>
                  <td className="px-5 py-4 text-gray-600 dark:text-gray-300 max-w-md">
                    {t.description}
                  </td>
                  <td className="px-5 py-4">
                    <Badge variant="success" dot>
                      ACTIVE
                    </Badge>
                  </td>
                  <td className="px-5 py-4 text-right">
                    <Button variant="ghost" size="sm" leftIcon={<Edit className="h-3.5 w-3.5" />}>
                      Sửa
                    </Button>
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
