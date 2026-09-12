'use client';

import React, { useState } from 'react';
import { Hotel, HotelStatus } from '@/types/hotel';
import { HOTEL_TYPES, LOCATIONS, HOTEL_STATUS_OPTIONS } from '@/lib/constants';
import { getFullImageUrl } from '@/lib/utils';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Dropdown } from '@/components/ui/Dropdown';
import { Pagination } from '@/components/ui/Pagination';
import { PaginationMeta } from '@/types/common';
import {
  Search,
  Plus,
  MoreVertical,
  Edit,
  Eye,
  Image as ImageIcon,
  Star,
  Building2,
  MapPin,
  CheckCircle2,
  XCircle,
  ChevronDown,
} from 'lucide-react';
import styles from '../hotel.module.css';

export interface HotelTableProps {
  hotels: Hotel[];
  loading: boolean;
  meta: PaginationMeta;
  search: string;
  onSearchChange: (val: string) => void;
  status: HotelStatus | '';
  onStatusChange: (val: HotelStatus | '') => void;
  locationId: number | '';
  onLocationChange: (val: number | '') => void;
  hotelTypeId: number | '';
  onHotelTypeChange: (val: number | '') => void;
  onPageChange: (page: number) => void;
  onOpenCreate: () => void;
  onOpenEdit: (hotel: Hotel) => void;
  onOpenGallery: (hotel: Hotel) => void;
  onOpenDetail: (hotel: Hotel) => void;
  onToggleStatus: (hotel: Hotel, nextStatus: HotelStatus) => void;
}

export function HotelTable({
  hotels,
  loading,
  meta,
  search,
  onSearchChange,
  status,
  onStatusChange,
  locationId,
  onLocationChange,
  hotelTypeId,
  onHotelTypeChange,
  onPageChange,
  onOpenCreate,
  onOpenEdit,
  onOpenGallery,
  onOpenDetail,
  onToggleStatus,
}: HotelTableProps) {
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedIds(hotels.map((h) => h.id));
    } else {
      setSelectedIds([]);
    }
  };

  const handleSelectOne = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const statusVariantMap = {
    ACTIVE: 'success',
    DRAFT: 'warning',
    INACTIVE: 'danger',
  } as const;

  const statusLabelMap = {
    ACTIVE: 'Đang hoạt động',
    DRAFT: 'Bản nháp',
    INACTIVE: 'Tạm ngưng',
  };

  return (
    <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-xs dark:border-gray-800 dark:bg-white/[0.03]">
      {/* Top Header Card */}
      <div className="flex flex-col justify-between gap-4 border-b border-gray-200 px-4 sm:px-6 py-4 sm:flex-row sm:items-center dark:border-gray-800">
        <div>
          <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <Building2 className="h-5 w-5 text-brand-500" />
            Danh Sách Khách Sạn
          </h3>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
            Quản lý cơ sở lưu trú, album ảnh, xếp hạng sao và phân loại phòng
          </p>
        </div>

        {/* Action Button: Thêm Khách Sạn */}
        <div className="flex items-center gap-2.5">
          <Button
            size="sm"
            onClick={onOpenCreate}
            leftIcon={<Plus className="h-4 w-4" />}
          >
            Thêm Khách Sạn
          </Button>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="border-b border-gray-200 px-4 sm:px-6 py-3.5 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-900/40">
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
          {/* Search Box */}
          <div className="relative flex-1 max-w-md">
            <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-gray-400">
              <Search className="h-4 w-4" />
            </span>
            <input
              type="text"
              placeholder="Tìm theo tên khách sạn, địa chỉ..."
              value={search}
              onChange={(e) => onSearchChange(e.target.value)}
              className="h-10 w-full rounded-xl border border-gray-300 bg-white py-2 pl-10 pr-4 text-xs text-gray-800 placeholder:text-gray-400 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/15 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 shadow-xs"
            />
          </div>

          {/* Filter Selects with proper arrow positioning */}
          <div className="flex flex-wrap items-center gap-2.5">
            {/* Status filter */}
            <div className="relative">
              <select
                value={status}
                onChange={(e) => onStatusChange(e.target.value as HotelStatus | '')}
                className="h-10 appearance-none rounded-xl border border-gray-300 bg-white pl-3.5 pr-8 text-xs text-gray-700 focus:border-brand-500 focus:outline-none dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300 shadow-xs cursor-pointer"
              >
                <option value="">Tất cả trạng thái</option>
                {HOTEL_STATUS_OPTIONS.map((st) => (
                  <option key={st.value} value={st.value}>
                    {st.label}
                  </option>
                ))}
              </select>
              <span className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400">
                <ChevronDown className="h-3.5 w-3.5" />
              </span>
            </div>

            {/* Location filter */}
            <div className="relative">
              <select
                value={locationId}
                onChange={(e) =>
                  onLocationChange(e.target.value ? Number(e.target.value) : '')
                }
                className="h-10 appearance-none rounded-xl border border-gray-300 bg-white pl-3.5 pr-8 text-xs text-gray-700 focus:border-brand-500 focus:outline-none dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300 shadow-xs cursor-pointer"
              >
                <option value="">Tất cả địa điểm</option>
                {LOCATIONS.map((loc) => (
                  <option key={loc.id} value={loc.id}>
                    {loc.name}
                  </option>
                ))}
              </select>
              <span className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400">
                <ChevronDown className="h-3.5 w-3.5" />
              </span>
            </div>

            {/* Hotel Type filter */}
            <div className="relative">
              <select
                value={hotelTypeId}
                onChange={(e) =>
                  onHotelTypeChange(e.target.value ? Number(e.target.value) : '')
                }
                className="h-10 appearance-none rounded-xl border border-gray-300 bg-white pl-3.5 pr-8 text-xs text-gray-700 focus:border-brand-500 focus:outline-none dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300 shadow-xs cursor-pointer"
              >
                <option value="">Tất cả loại hình</option>
                {HOTEL_TYPES.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.name}
                  </option>
                ))}
              </select>
              <span className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400">
                <ChevronDown className="h-3.5 w-3.5" />
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Table Area */}
      <div className="overflow-x-auto custom-scrollbar">
        <table className="w-full text-left text-xs">
          {/* Table Header */}
          <thead className="border-b border-gray-200 bg-gray-50/60 dark:border-gray-800 dark:bg-gray-850/40 text-gray-500 dark:text-gray-400 uppercase tracking-wider font-semibold">
            <tr>
              <th className="w-12 px-4 sm:px-5 py-3.5">
                <input
                  type="checkbox"
                  checked={
                    hotels.length > 0 && selectedIds.length === hotels.length
                  }
                  onChange={handleSelectAll}
                  className="h-4 w-4 rounded border-gray-300 text-brand-500 focus:ring-brand-500 dark:border-gray-700 dark:bg-gray-900 cursor-pointer"
                />
              </th>
              <th className="px-4 sm:px-5 py-3.5">Khách Sạn</th>
              <th className="px-4 sm:px-5 py-3.5">Loại Hình & Tỉnh Thành</th>
              <th className="px-4 sm:px-5 py-3.5">Đánh Giá Sao</th>
              <th className="px-4 sm:px-5 py-3.5">Giờ Nhận / Trả</th>
              <th className="px-4 sm:px-5 py-3.5">Trạng Thái</th>
              <th className="px-4 sm:px-5 py-3.5 text-right">Thao Tác</th>
            </tr>
          </thead>

          {/* Table Body */}
          <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
            {loading ? (
              <tr>
                <td colSpan={7} className="px-5 py-12 text-center text-gray-500">
                  <div className="flex flex-col items-center justify-center gap-2">
                    <div className="h-6 w-6 animate-spin rounded-full border-2 border-brand-500 border-t-transparent" />
                    <span>Đang nạp dữ liệu khách sạn...</span>
                  </div>
                </td>
              </tr>
            ) : hotels.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-5 py-14 text-center">
                  <div className="mx-auto flex flex-col items-center justify-center max-w-sm">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gray-100 dark:bg-gray-800 text-gray-400 mb-3">
                      <Building2 className="h-6 w-6" />
                    </div>
                    <p className="text-sm font-bold text-gray-800 dark:text-white">
                      Không tìm thấy khách sạn nào
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      Thử thay đổi từ khóa tìm kiếm hoặc bấm nút "+ Thêm Khách Sạn" để tạo mới.
                    </p>
                  </div>
                </td>
              </tr>
            ) : (
              hotels.map((hotel) => {
                const hotelType = HOTEL_TYPES.find(
                  (t) => t.id === Number(hotel.hotelTypeId)
                );
                const location = LOCATIONS.find(
                  (l) => l.id === Number(hotel.locationId)
                );
                const isSelected = selectedIds.includes(hotel.id);

                return (
                  <tr
                    key={hotel.id}
                    className={`transition-colors hover:bg-gray-50/80 dark:hover:bg-gray-800/40 ${
                      isSelected ? 'bg-brand-50/40 dark:bg-brand-500/5' : ''
                    }`}
                  >
                    {/* Checkbox */}
                    <td className="w-12 px-4 sm:px-5 py-4">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => handleSelectOne(hotel.id)}
                        className="h-4 w-4 rounded border-gray-300 text-brand-500 focus:ring-brand-500 dark:border-gray-700 dark:bg-gray-900 cursor-pointer"
                      />
                    </td>

                    {/* Khách Sạn (Thumbnail, Name, Address) */}
                    <td className="px-4 sm:px-5 py-4">
                      <div className="flex items-center gap-3.5">
                        <div
                          className="h-12 w-12 shrink-0 rounded-xl overflow-hidden bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 cursor-pointer group"
                          onClick={() => onOpenGallery(hotel)}
                          title="Bấm để xem album ảnh"
                        >
                          <img
                            src={getFullImageUrl(hotel.coverImageUrl)}
                            alt={hotel.name}
                            className="h-full w-full object-cover group-hover:scale-110 transition-transform duration-200"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src =
                                'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=150&q=80';
                            }}
                          />
                        </div>
                        <div className="min-w-0">
                          <button
                            type="button"
                            onClick={() => onOpenDetail(hotel)}
                            className="font-bold text-gray-900 hover:text-brand-500 dark:text-white dark:hover:text-brand-400 transition-colors text-left truncate block max-w-xs cursor-pointer text-xs"
                          >
                            {hotel.name}
                          </button>
                          <p className="text-[11px] text-gray-500 dark:text-gray-400 truncate max-w-xs mt-0.5 flex items-center gap-1">
                            <MapPin className="h-3 w-3 shrink-0 text-gray-400" />
                            {hotel.address}
                          </p>
                        </div>
                      </div>
                    </td>

                    {/* Loại hình & Địa điểm */}
                    <td className="px-4 sm:px-5 py-4">
                      <div className="space-y-1">
                        <span className="inline-block px-2 py-0.5 rounded-md bg-gray-100 dark:bg-gray-800 text-[11px] font-semibold text-gray-700 dark:text-gray-300">
                          {hotelType?.name || `Loại #${hotel.hotelTypeId}`}
                        </span>
                        <p className="text-[11px] text-gray-500 dark:text-gray-400">
                          {location?.name || `Địa điểm #${hotel.locationId}`}
                        </p>
                      </div>
                    </td>

                    {/* Đánh giá sao */}
                    <td className="px-4 sm:px-5 py-4">
                      <div className="flex items-center gap-1 text-amber-400">
                        {Array.from({ length: hotel.starRating || 0 }).map((_, i) => (
                          <Star key={i} className="h-3.5 w-3.5 fill-amber-400" />
                        ))}
                        <span className="text-xs font-bold text-gray-700 dark:text-gray-300 ml-1">
                          {hotel.starRating || 0}★
                        </span>
                      </div>
                    </td>

                    {/* Giờ nhận / trả */}
                    <td className="px-4 sm:px-5 py-4">
                      <div className="text-[11px] text-gray-600 dark:text-gray-300 font-medium">
                        <p>Nhận: <span className="font-semibold text-gray-800 dark:text-gray-200">{hotel.checkInTime}</span></p>
                        <p>Trả: <span className="font-semibold text-gray-800 dark:text-gray-200">{hotel.checkOutTime}</span></p>
                      </div>
                    </td>

                    {/* Trạng thái */}
                    <td className="px-4 sm:px-5 py-4 whitespace-nowrap">
                      <Badge
                        variant={statusVariantMap[hotel.status] || 'neutral'}
                        dot
                      >
                        {statusLabelMap[hotel.status] || hotel.status}
                      </Badge>
                    </td>

                    {/* Thao tác */}
                    <td className="px-4 sm:px-5 py-4 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          type="button"
                          onClick={() => onOpenDetail(hotel)}
                          title="Xem Chi Tiết"
                          className="flex h-8 w-8 items-center justify-center rounded-lg text-gray-500 hover:bg-gray-100 hover:text-gray-800 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-white transition-colors cursor-pointer"
                        >
                          <Eye className="h-4 w-4" />
                        </button>

                        <button
                          type="button"
                          onClick={() => onOpenGallery(hotel)}
                          title="Album Ảnh"
                          className="flex h-8 w-8 items-center justify-center rounded-lg text-gray-500 hover:bg-brand-50 hover:text-brand-600 dark:text-gray-400 dark:hover:bg-brand-500/15 dark:hover:text-brand-400 transition-colors cursor-pointer"
                        >
                          <ImageIcon className="h-4 w-4" />
                        </button>

                        <button
                          type="button"
                          onClick={() => onOpenEdit(hotel)}
                          title="Chỉnh Sửa"
                          className="flex h-8 w-8 items-center justify-center rounded-lg text-gray-500 hover:bg-gray-100 hover:text-gray-800 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-white transition-colors cursor-pointer"
                        >
                          <Edit className="h-4 w-4" />
                        </button>

                        {/* More dropdown */}
                        <Dropdown
                          trigger={
                            <button
                              type="button"
                              className="flex h-8 w-8 items-center justify-center rounded-lg text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800 transition-colors cursor-pointer"
                            >
                              <MoreVertical className="h-4 w-4" />
                            </button>
                          }
                          items={[
                            {
                              label: 'Xem chi tiết',
                              icon: <Eye className="h-4 w-4" />,
                              onClick: () => onOpenDetail(hotel),
                            },
                            {
                              label: 'Chỉnh sửa thông tin',
                              icon: <Edit className="h-4 w-4" />,
                              onClick: () => onOpenEdit(hotel),
                            },
                            {
                              label: 'Quản lý album ảnh',
                              icon: <ImageIcon className="h-4 w-4" />,
                              onClick: () => onOpenGallery(hotel),
                            },
                            {
                              label:
                                hotel.status === 'ACTIVE'
                                  ? 'Chuyển sang Tạm ngưng'
                                  : 'Kích hoạt Hoạt động',
                              icon:
                                hotel.status === 'ACTIVE' ? (
                                  <XCircle className="h-4 w-4 text-amber-500" />
                                ) : (
                                  <CheckCircle2 className="h-4 w-4 text-green-500" />
                                ),
                              onClick: () =>
                                onToggleStatus(
                                  hotel,
                                  hotel.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE'
                                ),
                            },
                          ]}
                        />
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      {!loading && hotels.length > 0 && (
        <Pagination meta={meta} onPageChange={onPageChange} />
      )}
    </div>
  );
}
