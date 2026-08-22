'use client';

import React from 'react';
import { Breadcrumb } from '@/components/dashboard/Breadcrumb';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Compass, Plus, Download, MapPin, Clock, Star } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';

export default function ToursPage() {
  const sampleTours = [
    {
      id: 1,
      title: 'Tour Khám Phá Vịnh Hạ Long 2N1Đ - Du Thuyền 5 Sao',
      location: 'Quảng Ninh',
      duration: '2 Ngày 1 Đêm',
      price: 2450000,
      rating: 4.9,
      status: 'ACTIVE',
      image: 'https://images.unsplash.com/photo-1528127269322-539801943592?auto=format&fit=crop&w=400&q=80',
    },
    {
      id: 2,
      title: 'Tour Trải Nghiệm Văn Hóa Phố Cổ Hội An & Cù Lao Chàm',
      location: 'Quảng Nam - Đà Nẵng',
      duration: '3 Ngày 2 Đêm',
      price: 3200000,
      rating: 4.8,
      status: 'ACTIVE',
      image: 'https://images.unsplash.com/photo-1559592413-7cec4d0cae2b?auto=format&fit=crop&w=400&q=80',
    },
    {
      id: 3,
      title: 'Tour Nghỉ Dưỡng Phú Quốc - Lặn Ngắm San Hô Hòn Thơm',
      location: 'Kiên Giang',
      duration: '4 Ngày 3 Đêm',
      price: 4900000,
      rating: 5.0,
      status: 'ACTIVE',
      image: 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=400&q=80',
    },
  ];

  return (
    <div className="space-y-6">
      <Breadcrumb pageTitle="Quản Lý Tour Du Lịch" items={[{ label: 'Tour' }]} />

      <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-xs dark:border-gray-800 dark:bg-white/[0.03]">
        <div className="flex flex-col justify-between gap-4 border-b border-gray-200 px-5 py-4.5 sm:flex-row sm:items-center dark:border-gray-800">
          <div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <Compass className="h-5 w-5 text-brand-500" />
              Danh Sách Tour Du Lịch
            </h3>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
              Quản lý các gói trải nghiệm, lịch trình di chuyển và giá vé tour
            </p>
          </div>
          <div className="flex items-center gap-2.5">
            <Button variant="outline" size="sm" leftIcon={<Download className="h-4 w-4" />}>
              Xuất File
            </Button>
            <Button size="sm" leftIcon={<Plus className="h-4 w-4" />}>
              Thêm Tour Mới
            </Button>
          </div>
        </div>

        <div className="p-5 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {sampleTours.map((t) => (
            <div
              key={t.id}
              className="rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900 overflow-hidden shadow-xs hover:shadow-md transition-all group"
            >
              <div className="aspect-video w-full overflow-hidden bg-gray-100 dark:bg-gray-800 relative">
                <img
                  src={t.image}
                  alt={t.title}
                  className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute top-2.5 right-2.5">
                  <Badge variant="success" size="sm" dot>
                    {t.status}
                  </Badge>
                </div>
              </div>

              <div className="p-4 space-y-2.5">
                <h4 className="text-xs font-bold text-gray-900 dark:text-white line-clamp-2">
                  {t.title}
                </h4>

                <div className="flex items-center justify-between text-[11px] text-gray-500 dark:text-gray-400">
                  <span className="flex items-center gap-1">
                    <MapPin className="h-3.5 w-3.5 text-brand-500" />
                    {t.location}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="h-3.5 w-3.5" />
                    {t.duration}
                  </span>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-gray-100 dark:border-gray-800">
                  <div>
                    <span className="text-[10px] text-gray-400 block">Giá trọn gói</span>
                    <span className="text-sm font-bold text-brand-600 dark:text-brand-400">
                      {formatCurrency(t.price)}
                    </span>
                  </div>
                  <div className="flex items-center gap-1 text-amber-400 text-xs font-bold">
                    <Star className="h-4 w-4 fill-amber-400" />
                    <span>{t.rating}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
