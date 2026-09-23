'use client';

import React, { useState, useEffect } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { ImageSlider } from '@/components/ui/ImageSlider';
import { Hotel, HotelImage } from '@/types/hotel';
import { Room } from '@/types/room';
import { hotelsApi } from '@/services/api/hotels.api';
import { roomsApi } from '@/services/api/rooms.api';
import { HOTEL_TYPES, LOCATIONS } from '@/lib/constants';
import { formatCurrency, getFullImageUrl } from '@/lib/utils';
import {
  Star,
  MapPin,
  Phone,
  Clock,
  Building2,
  Sparkles,
  BedDouble,
  Eye,
  Plus,
  Edit,
  Mail,
} from 'lucide-react';

export interface HotelDetailModalProps {
  hotel: Hotel | null;
  isOpen: boolean;
  onClose: () => void;
  onEdit: () => void;
  onOpenGallery: () => void;
  onViewRoomDetail?: (room: Room) => void;
  onAddRoomForHotel?: (hotelId: string) => void;
}

export function HotelDetailModal({
  hotel,
  isOpen,
  onClose,
  onEdit,
  onOpenGallery,
  onViewRoomDetail,
  onAddRoomForHotel,
}: HotelDetailModalProps) {
  const [images, setImages] = useState<HotelImage[]>([]);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loadingRooms, setLoadingRooms] = useState(false);
  const [activeTab, setActiveTab] = useState<'info' | 'rooms'>('info');

  useEffect(() => {
    if (isOpen && hotel) {
      setActiveTab('info');

      // Fetch all hotel gallery images for the slider
      const fetchImages = async () => {
        try {
          const res = await hotelsApi.getImages(hotel.id);
          setImages(res);
        } catch (err) {
          console.error('Failed to load hotel images:', err);
        }
      };

      // Fetch all rooms belonging to this hotel
      const fetchRooms = async () => {
        try {
          setLoadingRooms(true);
          const res = await roomsApi.getAll({
            hotelId: Number(hotel.id),
            perPage: 50,
          });
          setRooms(res.data);
        } catch (err) {
          console.error('Failed to load hotel rooms:', err);
        } finally {
          setLoadingRooms(false);
        }
      };

      fetchImages();
      fetchRooms();
    }
  }, [isOpen, hotel]);

  if (!hotel) return null;

  const hotelType = HOTEL_TYPES.find((t) => t.id === Number(hotel.hotelTypeId));
  const location = LOCATIONS.find((l) => l.id === Number(hotel.locationId));

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
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={hotel.name}
      subtitle={`${hotelType?.name || 'Khách sạn'} • ${location?.name || 'Việt Nam'}`}
      maxWidth="5xl"
    >
      <div className="space-y-5">
        {/* Navigation Tabs */}
        <div className="flex items-center gap-2 border-b border-gray-200 dark:border-gray-800 pb-2">
          <button
            type="button"
            onClick={() => setActiveTab('info')}
            className={`flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-xl transition-colors cursor-pointer ${
              activeTab === 'info'
                ? 'bg-brand-500 text-white shadow-xs'
                : 'text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800'
            }`}
          >
            <Building2 className="h-4 w-4" />
            Thông Tin Khách Sạn
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('rooms')}
            className={`flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-xl transition-colors cursor-pointer ${
              activeTab === 'rooms'
                ? 'bg-brand-500 text-white shadow-xs'
                : 'text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800'
            }`}
          >
            <BedDouble className="h-4 w-4" />
            Danh Sách Phòng ({rooms.length})
          </button>
        </div>

        {activeTab === 'info' ? (
          /* TAB 1: 2-Column Clean Layout (Left: Slider, Right: Parameters) */
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* LEFT COLUMN (6 cols): Image Slider + Gallery Action */}
            <div className="lg:col-span-6 space-y-4">
              <ImageSlider
                images={images}
                fallbackUrl={hotel.coverImageUrl}
                altTitle={hotel.name}
                heightClass="h-80 sm:h-96 lg:h-[380px]"
                overlayBadge={
                  <Badge variant={statusVariantMap[hotel.status] || 'neutral'} size="md" dot>
                    {statusLabelMap[hotel.status] || hotel.status}
                  </Badge>
                }
              />

              <div className="flex items-center justify-between pt-1">
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  Album hình ảnh: <strong className="text-gray-800 dark:text-white">{images.length}</strong> ảnh
                </span>
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  leftIcon={<Sparkles className="h-4 w-4 text-brand-500" />}
                  onClick={() => {
                    onClose();
                    onOpenGallery();
                  }}
                >
                  Quản Lý Album Ảnh
                </Button>
              </div>
            </div>

            {/* RIGHT COLUMN (6 cols): Clean Business Parameters */}
            <div className="lg:col-span-6 space-y-4">
              {/* Hotel Name & Stars */}
              <div className="pb-3 border-b border-gray-100 dark:border-gray-800">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1 text-xs text-amber-400 font-bold">
                    {Array.from({ length: hotel.starRating || 0 }).map((_, i) => (
                      <Star key={i} className="h-3.5 w-3.5 fill-amber-400" />
                    ))}
                    <span className="ml-1 text-gray-700 dark:text-gray-300 font-bold">
                      {hotel.starRating || 0} sao chuẩn chất lượng
                    </span>
                  </div>
                  <Badge variant={statusVariantMap[hotel.status] || 'neutral'} size="sm" dot>
                    {statusLabelMap[hotel.status] || hotel.status}
                  </Badge>
                </div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mt-1.5">
                  {hotel.name}
                </h3>
              </div>

              {/* 4 Core Parameter Cards (2x2 Grid) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="flex items-start gap-3 rounded-xl border border-gray-100 bg-gray-50/60 p-3 dark:border-gray-800 dark:bg-gray-800/40">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-50 text-brand-500 dark:bg-brand-500/15 shrink-0">
                    <Building2 className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-2xs font-bold uppercase tracking-wider text-gray-400">
                      Loại hình
                    </p>
                    <p className="text-xs font-semibold text-gray-800 dark:text-gray-200 mt-0.5">
                      {hotelType?.name || `Khách sạn`}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 rounded-xl border border-gray-100 bg-gray-50/60 p-3 dark:border-gray-800 dark:bg-gray-800/40">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-50 text-brand-500 dark:bg-brand-500/15 shrink-0">
                    <MapPin className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-2xs font-bold uppercase tracking-wider text-gray-400">
                      Tỉnh / Thành phố
                    </p>
                    <p className="text-xs font-semibold text-gray-800 dark:text-gray-200 mt-0.5">
                      {location?.name || `Việt Nam`}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 rounded-xl border border-gray-100 bg-gray-50/60 p-3 dark:border-gray-800 dark:bg-gray-800/40">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-50 text-brand-500 dark:bg-brand-500/15 shrink-0">
                    <Clock className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-2xs font-bold uppercase tracking-wider text-gray-400">
                      Giờ nhận / trả phòng
                    </p>
                    <p className="text-xs font-semibold text-gray-800 dark:text-gray-200 mt-0.5">
                      Nhận: {hotel.checkInTime} • Trả: {hotel.checkOutTime}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 rounded-xl border border-gray-100 bg-gray-50/60 p-3 dark:border-gray-800 dark:bg-gray-800/40">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-50 text-brand-500 dark:bg-brand-500/15 shrink-0">
                    <Phone className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-2xs font-bold uppercase tracking-wider text-gray-400">
                      Số điện thoại
                    </p>
                    <p className="text-xs font-semibold text-gray-800 dark:text-gray-200 mt-0.5 truncate max-w-40">
                      {hotel.phone || 'Chưa cập nhật'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Email & Địa chỉ chi tiết */}
              <div className="space-y-2">
                {hotel.email && (
                  <div className="rounded-xl border border-gray-100 bg-gray-50/60 p-3 dark:border-gray-800 dark:bg-gray-800/40 text-xs flex items-center gap-2">
                    <Mail className="h-4 w-4 text-brand-500 shrink-0" />
                    <span className="text-gray-700 dark:text-gray-300 font-medium">{hotel.email}</span>
                  </div>
                )}

                <div className="rounded-xl border border-gray-100 bg-gray-50/60 p-3 dark:border-gray-800 dark:bg-gray-800/40">
                  <p className="text-2xs font-bold uppercase tracking-wider text-gray-400 mb-0.5">
                    Địa chỉ chi tiết
                  </p>
                  <p className="text-xs font-medium text-gray-800 dark:text-gray-200 flex items-center gap-1.5">
                    <MapPin className="h-3.5 w-3.5 text-brand-500 shrink-0" />
                    {hotel.address}
                  </p>
                </div>
              </div>

              {/* Mô tả */}
              {hotel.description && (
                <div className="rounded-xl border border-gray-100 bg-gray-50/60 p-3.5 dark:border-gray-800 dark:bg-gray-800/40">
                  <p className="text-2xs font-bold uppercase tracking-wider text-gray-400 mb-1">
                    Giới thiệu khách sạn
                  </p>
                  <p className="text-xs text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-line">
                    {hotel.description}
                  </p>
                </div>
              )}

              {/* Action buttons */}
              <div className="flex items-center justify-end gap-2.5 pt-2">
                <Button variant="outline" onClick={onClose}>
                  Đóng
                </Button>
                <Button
                  leftIcon={<Edit className="h-4 w-4" />}
                  onClick={() => {
                    onClose();
                    onEdit();
                  }}
                >
                  Chỉnh Sửa Khách Sạn
                </Button>
              </div>
            </div>
          </div>
        ) : (
          /* TAB 2: Danh Sách Các Phòng Thuộc Khách Sạn */
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-sm font-bold text-gray-900 dark:text-white">
                  Danh Sách Phòng Thuộc Khách Sạn: {hotel.name}
                </h4>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Tổng cộng có {rooms.length} phòng đang được quản lý
                </p>
              </div>

              {onAddRoomForHotel && (
                <Button
                  size="sm"
                  leftIcon={<Plus className="h-4 w-4" />}
                  onClick={() => {
                    onClose();
                    onAddRoomForHotel(hotel.id);
                  }}
                >
                  Thêm Phòng Mới
                </Button>
              )}
            </div>

            {loadingRooms ? (
              <div className="py-12 text-center text-xs text-gray-500">
                Đang nạp danh sách phòng...
              </div>
            ) : rooms.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-gray-300 dark:border-gray-700 p-8 text-center">
                <BedDouble className="h-10 w-10 text-gray-400 mx-auto mb-2" />
                <p className="text-sm font-semibold text-gray-800 dark:text-white">
                  Khách sạn này chưa có phòng nào
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  Hãy thêm phòng mới để bắt đầu nhận đặt phòng.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {rooms.map((r) => (
                  <div
                    key={r.id}
                    className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-4 shadow-xs hover:shadow-md transition-all flex flex-col justify-between space-y-3"
                  >
                    <div className="flex items-start gap-3">
                      <div className="h-16 w-20 rounded-xl overflow-hidden bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shrink-0">
                        <img
                          src={getFullImageUrl(r.coverImageUrl)}
                          alt={r.name}
                          className="h-full w-full object-cover"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src =
                              'https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=200&q=80';
                          }}
                        />
                      </div>
                      <div className="min-w-0 flex-1">
                        <h5 className="text-xs font-bold text-gray-900 dark:text-white truncate">
                          {r.name}
                        </h5>
                        <p className="text-xs-plus text-gray-500 dark:text-gray-400 mt-0.5">
                          {r.bedCount} × {r.bedType} {r.roomSize ? `• ${r.roomSize} m²` : ''}
                        </p>
                        <p className="text-xs-plus text-brand-600 dark:text-brand-400 font-bold mt-1">
                          {formatCurrency(r.pricePerNight)} / đêm
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-gray-100 dark:border-gray-800 text-xs-plus">
                      <span className="text-gray-500">
                        Sức chứa: <strong>{r.maxAdults} NL</strong>
                        {r.maxChildren > 0 ? ` • ${r.maxChildren} TE` : ''}
                      </span>

                      <div className="flex items-center gap-2">
                        <Badge variant={r.status === 'AVAILABLE' ? 'success' : 'warning'} size="sm">
                          {r.availableRooms}/{r.totalRooms} trống
                        </Badge>

                        {onViewRoomDetail && (
                          <button
                            type="button"
                            onClick={() => {
                              onClose();
                              onViewRoomDetail(r);
                            }}
                            className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold text-brand-600 hover:bg-brand-50 dark:text-brand-400 dark:hover:bg-brand-500/15 transition-colors cursor-pointer"
                          >
                            <Eye className="h-3.5 w-3.5" />
                            <span>Chi tiết phòng</span>
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </Modal>
  );
}
