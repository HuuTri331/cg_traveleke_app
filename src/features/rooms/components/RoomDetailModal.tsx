'use client';

import React, { useState, useEffect } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { ImageSlider } from '@/components/ui/ImageSlider';
import { apiClient } from '@/services/api/client';
import { Room, RoomImage, RoomAssignedService } from '@/types/room';
import { Hotel } from '@/types/hotel';
import { roomsApi } from '@/services/api/rooms.api';
import { formatCurrency } from '@/lib/utils';
import {
  BedDouble,
  Users,
  DollarSign,
  Clock,
  Sparkles,
  Layers,
  Star,
  Edit,
  Building2,
  CheckCircle2,
  PlusCircle,
} from 'lucide-react';

export interface RoomDetailModalProps {
  room: Room | null;
  hotels: Hotel[];
  isOpen: boolean;
  onClose: () => void;
  onEdit: () => void;
  onOpenGallery: () => void;
}

export function RoomDetailModal({
  room,
  hotels,
  isOpen,
  onClose,
  onEdit,
  onOpenGallery,
}: RoomDetailModalProps) {
  const [images, setImages] = useState<RoomImage[]>([]);
  const [services, setServices] = useState<RoomAssignedService[]>([]);

  useEffect(() => {
    if (isOpen && room) {
      const fetchImages = async () => {
        try {
          const res = await roomsApi.getImages(room.id);
          setImages(res);
        } catch (err) {
          console.error('Failed to load room gallery images:', err);
        }
      };
      fetchImages();

      // Load assigned services
      if (room.services && room.services.length > 0) {
        setServices(room.services);
      } else {
        apiClient
          .get(`/rooms/${room.id}/services`)
          .then((res) => {
            if (Array.isArray(res.data)) {
              setServices(res.data);
            }
          })
          .catch((err) => console.error('Failed to load room services in modal:', err));
      }
    }
  }, [isOpen, room]);

  if (!room) return null;

  const hotel = hotels.find((h) => String(h.id) === String(room.hotelId));

  const statusVariantMap = {
    AVAILABLE: 'success',
    UNAVAILABLE: 'danger',
    MAINTENANCE: 'warning',
  } as const;

  const statusLabelMap = {
    AVAILABLE: 'Còn phòng trống',
    UNAVAILABLE: 'Hết phòng',
    MAINTENANCE: 'Đang bảo trì',
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={room.name}
      subtitle={`Thuộc khách sạn: ${hotel?.name || 'Khách sạn'}`}
      maxWidth="5xl"
    >
      {/* 2-Column Split Layout: Left = Full Image Slider, Right = Room Information */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* LEFT COLUMN (6 Cols): Image Slider + Gallery Management */}
        <div className="lg:col-span-6 space-y-4">
          <ImageSlider
            images={images}
            fallbackUrl={room.coverImageUrl}
            altTitle={room.name}
            heightClass="h-80 sm:h-96 lg:h-[380px]"
            overlayBadge={
              <Badge variant={statusVariantMap[room.status] || 'neutral'} size="md" dot>
                {statusLabelMap[room.status] || room.status}
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

        {/* RIGHT COLUMN (6 Cols): Detailed Room Parameters */}
        <div className="lg:col-span-6 space-y-4">
          {/* Header Info */}
          <div className="pb-3 border-b border-gray-100 dark:border-gray-800">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-1 text-xs text-amber-400 font-bold">
                <Star className="h-4 w-4 fill-amber-400" />
                <span>{room.rating || 5} sao tiêu chuẩn</span>
              </div>
              <Badge variant={statusVariantMap[room.status] || 'neutral'} size="sm" dot>
                {statusLabelMap[room.status] || room.status}
              </Badge>
            </div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mt-1.5">
              {room.name}
            </h3>
            <p className="text-xs text-brand-600 dark:text-brand-400 font-semibold flex items-center gap-1.5 mt-1">
              <Building2 className="h-4 w-4" />
              {hotel?.name || `Khách sạn`}
            </p>
          </div>

          {/* 4 Core Cards in 2x2 grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Price */}
            <div className="flex items-start gap-3 rounded-xl border border-gray-100 bg-gray-50/60 p-3 dark:border-gray-800 dark:bg-gray-800/40">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-50 text-brand-500 dark:bg-brand-500/15 shrink-0">
                <DollarSign className="h-5 w-5" />
              </div>
              <div>
                <p className="text-2xs font-bold uppercase tracking-wider text-gray-400">
                  Giá mỗi đêm
                </p>
                <p className="text-sm font-bold text-brand-600 dark:text-brand-400 mt-0.5">
                  {formatCurrency(room.pricePerNight)}
                </p>
              </div>
            </div>

            {/* Beds & Size */}
            <div className="flex items-start gap-3 rounded-xl border border-gray-100 bg-gray-50/60 p-3 dark:border-gray-800 dark:bg-gray-800/40">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-50 text-indigo-500 dark:bg-indigo-500/15 shrink-0">
                <BedDouble className="h-5 w-5" />
              </div>
              <div>
                <p className="text-2xs font-bold uppercase tracking-wider text-gray-400">
                  Giường & Diện tích
                </p>
                <p className="text-xs font-semibold text-gray-800 dark:text-gray-200 mt-0.5">
                  {room.bedCount} × {room.bedType} {room.roomSize ? `• ${room.roomSize} m²` : ''}
                </p>
              </div>
            </div>

            {/* Capacity */}
            <div className="flex items-start gap-3 rounded-xl border border-gray-100 bg-gray-50/60 p-3 dark:border-gray-800 dark:bg-gray-800/40">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-50 text-emerald-500 dark:bg-emerald-500/15 shrink-0">
                <Users className="h-5 w-5" />
              </div>
              <div>
                <p className="text-2xs font-bold uppercase tracking-wider text-gray-400">
                  Sức chứa
                </p>
                <p className="text-xs font-semibold text-gray-800 dark:text-gray-200 mt-0.5">
                  {room.maxAdults} NL {room.maxChildren > 0 ? `• ${room.maxChildren} TE` : ''}
                </p>
              </div>
            </div>

            {/* Availability */}
            <div className="flex items-start gap-3 rounded-xl border border-gray-100 bg-gray-50/60 p-3 dark:border-gray-800 dark:bg-gray-800/40">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-amber-50 text-amber-500 dark:bg-amber-500/15 shrink-0">
                <Layers className="h-5 w-5" />
              </div>
              <div>
                <p className="text-2xs font-bold uppercase tracking-wider text-gray-400">
                  Tình trạng phòng
                </p>
                <p className="text-xs font-semibold text-gray-800 dark:text-gray-200 mt-0.5">
                  Còn <strong className="text-green-600 dark:text-green-400">{room.availableRooms}</strong> / {room.totalRooms} phòng
                </p>
              </div>
            </div>
          </div>

          {/* Check-in & Check-out time */}
          <div className="flex items-center gap-2.5 rounded-xl border border-gray-100 bg-gray-50/60 p-3 text-xs dark:border-gray-800 dark:bg-gray-800/40">
            <Clock className="h-4 w-4 text-brand-500 shrink-0" />
            <span className="text-gray-600 dark:text-gray-300">
              Nhận phòng: <strong className="text-gray-800 dark:text-gray-200">{room.checkInTime || '14:00:00'}</strong> • Trả phòng: <strong className="text-gray-800 dark:text-gray-200">{room.checkOutTime || '12:00:00'}</strong>
            </span>
          </div>

          {/* Room Services & Amenities */}
          {services.length > 0 && (
            <div className="rounded-xl border border-gray-100 bg-gray-50/60 p-3.5 dark:border-gray-800 dark:bg-gray-800/40">
              <div className="flex items-center justify-between mb-2">
                <p className="text-2xs font-bold uppercase tracking-wider text-gray-400">
                  Dịch vụ & Tiện ích đi kèm ({services.length})
                </p>
                <div className="flex items-center gap-1.5 text-2xs">
                  <span className="text-emerald-600 dark:text-emerald-400 font-semibold">
                    {services.filter((s) => s.isComplimentary).length} Miễn phí
                  </span>
                  <span>•</span>
                  <span className="text-violet-600 dark:text-violet-400 font-semibold">
                    {services.filter((s) => !s.isComplimentary).length} Thu phí
                  </span>
                </div>
              </div>

              <div className="flex flex-wrap gap-1.5">
                {services.map((svc) => (
                  <span
                    key={svc.id}
                    className={`inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-lg border font-medium ${
                      svc.isComplimentary
                        ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800'
                        : 'bg-violet-50 text-violet-700 dark:bg-violet-950/40 dark:text-violet-300 border-violet-200 dark:border-violet-800'
                    }`}
                  >
                    {svc.isComplimentary ? (
                      <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                    ) : (
                      <PlusCircle className="h-3.5 w-3.5 text-violet-600" />
                    )}
                    <span>{svc.name}</span>
                    <span className="text-2xs opacity-75">
                      {svc.isComplimentary
                        ? '(Miễn phí)'
                        : `(${new Intl.NumberFormat('vi-VN').format(svc.basePrice)}₫)`}
                    </span>
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Room Description & Amenities */}
          {room.description && (
            <div className="rounded-xl border border-gray-100 bg-gray-50/60 p-3.5 dark:border-gray-800 dark:bg-gray-800/40">
              <p className="text-2xs font-bold uppercase tracking-wider text-gray-400 mb-1">
                Mô tả tiện nghi phòng
              </p>
              <p className="text-xs text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-line">
                {room.description}
              </p>
            </div>
          )}

          {/* Bottom Action Buttons */}
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
              Chỉnh Sửa Phòng
            </Button>
          </div>
        </div>
      </div>
    </Modal>
  );
}
