'use client';

import React, { useState } from 'react';
import { Room, RoomStatus } from '@/types/room';
import { Hotel } from '@/types/hotel';
import { ROOM_STATUS_OPTIONS } from '@/lib/constants';
import { getFullImageUrl, formatCurrency } from '@/lib/utils';
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
  Trash2,
  Image as ImageIcon,
  BedDouble,
  Users,
  Building2,
  CheckCircle2,
  XCircle,
  ChevronDown,
} from 'lucide-react';
import styles from '../room.module.css';

export interface RoomTableProps {
  rooms: Room[];
  hotels: Hotel[];
  loading: boolean;
  meta: PaginationMeta;
  selectedHotelId: number | '';
  onHotelChange: (val: number | '') => void;
  search: string;
  onSearchChange: (val: string) => void;
  status: RoomStatus | '';
  onStatusChange: (val: RoomStatus | '') => void;
  onPageChange: (page: number) => void;
  onOpenCreate: () => void;
  onOpenEdit: (room: Room) => void;
  onOpenDetail: (room: Room) => void;
  onOpenGallery: (room: Room) => void;
  onDeleteRoom: (room: Room) => void;
  onToggleStatus: (room: Room, nextStatus: RoomStatus) => void;
}

export function RoomTable({
  rooms,
  hotels,
  loading,
  meta,
  selectedHotelId,
  onHotelChange,
  search,
  onSearchChange,
  status,
  onStatusChange,
  onPageChange,
  onOpenCreate,
  onOpenEdit,
  onOpenDetail,
  onOpenGallery,
  onDeleteRoom,
  onToggleStatus,
}: RoomTableProps) {
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedIds(rooms.map((r) => r.id));
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
    AVAILABLE: 'success',
    UNAVAILABLE: 'danger',
    MAINTENANCE: 'warning',
  } as const;

  const statusLabelMap = {
    AVAILABLE: 'Còn phòng',
    UNAVAILABLE: 'Hết phòng',
    MAINTENANCE: 'Đang bảo trì',
  };

  return (
    <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-xs dark:border-gray-800 dark:bg-white/[0.03]">
      {/* Header Card */}
      <div className="flex flex-col justify-between gap-4 border-b border-gray-200 px-4 sm:px-6 py-4 sm:flex-row sm:items-center dark:border-gray-800">
        <div>
          <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <BedDouble className="h-5 w-5 text-brand-500" />
            Danh Sách Phòng Khách Sạn
          </h3>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
            Quản lý loại phòng, giá mỗi đêm, số lượng giường và tình trạng phòng trống
          </p>
        </div>

        {/* Action Button: Thêm Phòng */}
        <div className="flex items-center gap-2.5">
          <Button
            size="sm"
            onClick={onOpenCreate}
            leftIcon={<Plus className="h-4 w-4" />}
          >
            Thêm Phòng Mới
          </Button>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="border-b border-gray-200 px-4 sm:px-6 py-3.5 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-900/40">
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
          {/* Hotel & Status Filter Dropdowns with clean arrows */}
          <div className="flex flex-wrap items-center gap-2.5 flex-1">
            {/* Hotel dropdown */}
            <div className="relative min-w-56">
              <select
                value={selectedHotelId}
                onChange={(e) =>
                  onHotelChange(e.target.value ? Number(e.target.value) : '')
                }
                className="h-10 w-full appearance-none rounded-xl border border-brand-300/80 bg-white pl-3.5 pr-8 text-xs font-semibold text-brand-700 focus:border-brand-500 focus:outline-none dark:border-brand-500/30 dark:bg-gray-900 dark:text-brand-300 shadow-xs cursor-pointer"
              >
                <option value="">-- Tất cả khách sạn --</option>
                {hotels.map((h) => (
                  <option key={h.id} value={h.id}>
                    {h.name} (#{h.id})
                  </option>
                ))}
              </select>
              <span className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-brand-500">
                <ChevronDown className="h-3.5 w-3.5" />
              </span>
            </div>

            {/* Status Filter */}
            <div className="relative">
              <select
                value={status}
                onChange={(e) => onStatusChange(e.target.value as RoomStatus | '')}
                className="h-10 appearance-none rounded-xl border border-gray-300 bg-white pl-3.5 pr-8 text-xs text-gray-700 focus:border-brand-500 focus:outline-none dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300 shadow-xs cursor-pointer"
              >
                <option value="">Tất cả trạng thái</option>
                {ROOM_STATUS_OPTIONS.map((st) => (
                  <option key={st.value} value={st.value}>
                    {st.label}
                  </option>
                ))}
              </select>
              <span className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400">
                <ChevronDown className="h-3.5 w-3.5" />
              </span>
            </div>
          </div>

          {/* Search Box */}
          <div className="relative w-full sm:w-72">
            <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-gray-400">
              <Search className="h-4 w-4" />
            </span>
            <input
              type="text"
              placeholder="Tìm theo tên phòng..."
              value={search}
              onChange={(e) => onSearchChange(e.target.value)}
              className="h-10 w-full rounded-xl border border-gray-300 bg-white py-2 pl-10 pr-4 text-xs text-gray-800 placeholder:text-gray-400 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/15 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 shadow-xs"
            />
          </div>
        </div>
      </div>

      {/* Main Table */}
      <div className="overflow-x-auto custom-scrollbar">
        <table className="w-full text-left text-xs">
          <thead className="border-b border-gray-200 bg-gray-50/60 dark:border-gray-800 dark:bg-gray-850/40 text-gray-500 dark:text-gray-400 uppercase tracking-wider font-semibold">
            <tr>
              <th className="w-12 px-4 sm:px-5 py-3.5">
                <input
                  type="checkbox"
                  checked={rooms.length > 0 && selectedIds.length === rooms.length}
                  onChange={handleSelectAll}
                  className="h-4 w-4 rounded border-gray-300 text-brand-500 focus:ring-brand-500 dark:border-gray-700 dark:bg-gray-900 cursor-pointer"
                />
              </th>
              <th className="px-4 sm:px-5 py-3.5">Phòng Nghỉ</th>
              <th className="px-4 sm:px-5 py-3.5">Khách Sạn</th>
              <th className="px-4 sm:px-5 py-3.5">Giá Mỗi Đêm</th>
              <th className="px-4 sm:px-5 py-3.5">Giường & Diện Tích</th>
              <th className="px-4 sm:px-5 py-3.5">Sức Chứa</th>
              <th className="px-4 sm:px-5 py-3.5">Phòng Trống</th>
              <th className="px-4 sm:px-5 py-3.5">Trạng Thái</th>
              <th className="px-4 sm:px-5 py-3.5 text-right">Thao Tác</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
            {loading ? (
              <tr>
                <td colSpan={9} className="px-5 py-12 text-center text-gray-500">
                  <div className="flex flex-col items-center justify-center gap-2">
                    <div className="h-6 w-6 animate-spin rounded-full border-2 border-brand-500 border-t-transparent" />
                    <span>Đang nạp dữ liệu danh sách phòng...</span>
                  </div>
                </td>
              </tr>
            ) : rooms.length === 0 ? (
              <tr>
                <td colSpan={9} className="px-5 py-14 text-center">
                  <div className="mx-auto flex flex-col items-center justify-center max-w-sm">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gray-100 dark:bg-gray-800 text-gray-400 mb-3">
                      <BedDouble className="h-6 w-6" />
                    </div>
                    <p className="text-sm font-bold text-gray-800 dark:text-white">
                      Chưa có phòng nào
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      Hãy chọn khách sạn khác hoặc bấm &quot;+ Thêm Phòng Mới&quot;.
                    </p>
                  </div>
                </td>
              </tr>
            ) : (
              rooms.map((room) => {
                const hotel = hotels.find((h) => String(h.id) === String(room.hotelId));
                const isSelected = selectedIds.includes(room.id);

                return (
                  <tr
                    key={room.id}
                    className={`transition-colors hover:bg-gray-50/80 dark:hover:bg-gray-800/40 ${
                      isSelected ? 'bg-brand-50/40 dark:bg-brand-500/5' : ''
                    }`}
                  >
                    {/* Checkbox */}
                    <td className="w-12 px-4 sm:px-5 py-4">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => handleSelectOne(room.id)}
                        className="h-4 w-4 rounded border-gray-300 text-brand-500 focus:ring-brand-500 dark:border-gray-700 dark:bg-gray-900 cursor-pointer"
                      />
                    </td>

                    {/* Room details */}
                    <td className="px-4 sm:px-5 py-4">
                      <div className="flex items-center gap-3.5">
                        <div
                          className="h-12 w-12 shrink-0 rounded-xl overflow-hidden bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 cursor-pointer group"
                          onClick={() => onOpenGallery(room)}
                          title="Bấm để xem album ảnh phòng"
                        >
                          <img
                            src={getFullImageUrl(room.coverImageUrl)}
                            alt={room.name}
                            className="h-full w-full object-cover group-hover:scale-110 transition-transform duration-200"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src =
                                'https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=150&q=80';
                            }}
                          />
                        </div>
                        <div>
                          <button
                            type="button"
                            onClick={() => onOpenDetail(room)}
                            className="font-bold text-gray-900 dark:text-white hover:text-brand-500 dark:hover:text-brand-400 transition-colors text-left truncate block max-w-xs text-xs cursor-pointer"
                          >
                            {room.name}
                          </button>
                          <p className="text-2xs text-gray-400 font-mono mt-0.5">
                            /{room.slug}
                          </p>
                        </div>
                      </div>
                    </td>

                    {/* Thuộc Khách sạn */}
                    <td className="px-4 sm:px-5 py-4">
                      <div className="flex items-center gap-1.5 text-gray-800 dark:text-gray-200 font-medium">
                        <Building2 className="h-3.5 w-3.5 text-brand-500 shrink-0" />
                        <span className="truncate max-w-44">
                          {hotel?.name || `Khách sạn #${room.hotelId}`}
                        </span>
                      </div>
                    </td>

                    {/* Giá phòng */}
                    <td className="px-4 sm:px-5 py-4 whitespace-nowrap">
                      <span className="text-xs font-bold text-brand-600 dark:text-brand-400">
                        {formatCurrency(room.pricePerNight)}
                      </span>
                      <span className="text-2xs text-gray-400 block">/ đêm</span>
                    </td>

                    {/* Giường & Diện tích */}
                    <td className="px-4 sm:px-5 py-4">
                      <div className="space-y-0.5">
                        <p className="font-semibold text-gray-800 dark:text-gray-200">
                          {room.bedCount} × {room.bedType}
                        </p>
                        <p className="text-xs-plus text-gray-500 dark:text-gray-400">
                          {room.roomSize ? `${room.roomSize} m²` : 'Chưa nhập'}
                        </p>
                      </div>
                    </td>

                    {/* Sức chứa */}
                    <td className="px-4 sm:px-5 py-4">
                      <div className="flex items-center gap-1 text-xs-plus text-gray-600 dark:text-gray-300">
                        <Users className="h-3.5 w-3.5 text-gray-400" />
                        <span>{room.maxAdults} NL</span>
                        {room.maxChildren > 0 && <span>• {room.maxChildren} TE</span>}
                      </div>
                    </td>

                    {/* Số phòng trống */}
                    <td className="px-4 sm:px-5 py-4 whitespace-nowrap">
                      <span className="font-bold text-gray-800 dark:text-gray-200">
                        {room.availableRooms}
                      </span>
                      <span className="text-gray-400"> / {room.totalRooms} phòng</span>
                    </td>

                    {/* Trạng thái */}
                    <td className="px-4 sm:px-5 py-4 whitespace-nowrap">
                      <Badge variant={statusVariantMap[room.status] || 'neutral'} dot>
                        {statusLabelMap[room.status] || room.status}
                      </Badge>
                    </td>

                    {/* Thao tác */}
                    <td className="px-4 sm:px-5 py-4 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          type="button"
                          onClick={() => onOpenDetail(room)}
                          title="Xem Chi Tiết Phòng"
                          className="flex h-8 w-8 items-center justify-center rounded-lg text-gray-500 hover:bg-gray-100 hover:text-gray-800 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-white transition-colors cursor-pointer"
                        >
                          <Eye className="h-4 w-4" />
                        </button>

                        <button
                          type="button"
                          onClick={() => onOpenGallery(room)}
                          title="Album Ảnh Phòng"
                          className="flex h-8 w-8 items-center justify-center rounded-lg text-gray-500 hover:bg-brand-50 hover:text-brand-600 dark:text-gray-400 dark:hover:bg-brand-500/15 dark:hover:text-brand-400 transition-colors cursor-pointer"
                        >
                          <ImageIcon className="h-4 w-4" />
                        </button>

                        <button
                          type="button"
                          onClick={() => onOpenEdit(room)}
                          title="Chỉnh Sửa"
                          className="flex h-8 w-8 items-center justify-center rounded-lg text-gray-500 hover:bg-gray-100 hover:text-gray-800 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-white transition-colors cursor-pointer"
                        >
                          <Edit className="h-4 w-4" />
                        </button>

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
                              label: 'Xem chi tiết phòng',
                              icon: <Eye className="h-4 w-4" />,
                              onClick: () => onOpenDetail(room),
                            },
                            {
                              label: 'Chỉnh sửa phòng',
                              icon: <Edit className="h-4 w-4" />,
                              onClick: () => onOpenEdit(room),
                            },
                            {
                              label: 'Album ảnh phòng',
                              icon: <ImageIcon className="h-4 w-4" />,
                              onClick: () => onOpenGallery(room),
                            },
                            {
                              label:
                                room.status === 'AVAILABLE'
                                  ? 'Đánh dấu Hết phòng'
                                  : 'Đánh dấu Còn phòng',
                              icon:
                                room.status === 'AVAILABLE' ? (
                                  <XCircle className="h-4 w-4 text-amber-500" />
                                ) : (
                                  <CheckCircle2 className="h-4 w-4 text-green-500" />
                                ),
                              onClick: () =>
                                onToggleStatus(
                                  room,
                                  room.status === 'AVAILABLE' ? 'UNAVAILABLE' : 'AVAILABLE'
                                ),
                            },
                            {
                              label: 'Xóa phòng này',
                              icon: <Trash2 className="h-4 w-4" />,
                              variant: 'danger',
                              onClick: () => onDeleteRoom(room),
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
      {!loading && rooms.length > 0 && (
        <Pagination meta={meta} onPageChange={onPageChange} />
      )}
    </div>
  );
}
