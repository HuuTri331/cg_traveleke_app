'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Textarea } from '@/components/ui/Textarea';
import { Button } from '@/components/ui/Button';
import { TimePicker } from '@/components/ui/TimePicker';
import { MultiImageUploadSection } from '@/components/ui/MultiImageUploadSection';
import { BED_TYPES, ROOM_STATUS_OPTIONS } from '@/lib/constants';
import { roomsApi } from '@/services/api/rooms.api';
import { Room, RoomImage, RoomStatus, UpdateRoomInput } from '@/types/room';
import { Hotel } from '@/types/hotel';
import { BedDouble, Users, DollarSign } from 'lucide-react';
import { useToast } from '@/components/ui/Toast';

export interface RoomEditModalProps {
  room: Room | null;
  hotels: Hotel[];
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function RoomEditModal({
  room,
  hotels,
  isOpen,
  onClose,
  onSuccess,
}: RoomEditModalProps) {
  const { success, error } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [existingImages, setExistingImages] = useState<RoomImage[]>([]);
  const [newFiles, setNewFiles] = useState<File[]>([]);
  const [primaryNewIndex, setPrimaryNewIndex] = useState<number>(0);

  const [formData, setFormData] = useState<UpdateRoomInput>({
    hotelId: 1,
    name: '',
    slug: '',
    pricePerNight: 0,
    checkInTime: '14:00:00',
    checkOutTime: '12:00:00',
    maxAdults: 2,
    maxChildren: 1,
    totalRooms: 1,
    availableRooms: 1,
    bedCount: 1,
    bedType: 'Giường Đôi',
    roomSize: 30,
    coverImageUrl: '',
    description: '',
    status: 'AVAILABLE' as RoomStatus,
  });

  const fetchImages = useCallback(async () => {
    if (!room) return;
    try {
      const res = await roomsApi.getImages(room.id);
      setExistingImages(res);
    } catch (err) {
      console.error('Failed to load room images:', err);
    }
  }, [room]);

  useEffect(() => {
    if (room && isOpen) {
      setFormData({
        hotelId: Number(room.hotelId),
        name: room.name,
        slug: room.slug,
        pricePerNight: Number(room.pricePerNight),
        checkInTime: room.checkInTime,
        checkOutTime: room.checkOutTime,
        maxAdults: room.maxAdults,
        maxChildren: room.maxChildren,
        totalRooms: room.totalRooms,
        availableRooms: room.availableRooms,
        bedCount: room.bedCount,
        bedType: room.bedType,
        roomSize: room.roomSize,
        coverImageUrl: room.coverImageUrl || '',
        description: room.description || '',
        status: room.status,
      });
      setNewFiles([]);
      setPrimaryNewIndex(0);
      fetchImages();
    }
  }, [room, isOpen, fetchImages]);

  const handleDeleteExisting = async (imageId: string) => {
    if (!room) return;
    try {
      await roomsApi.deleteImage(room.id, imageId);
      success('Đã xóa ảnh', 'Đã gỡ ảnh khỏi album phòng thành công.');
      await fetchImages();
    } catch (err: any) {
      error('Lỗi xóa ảnh', err.message);
    }
  };

  const handleSetPrimaryExisting = async (imageId: string) => {
    if (!room) return;
    try {
      await roomsApi.setPrimaryImage(room.id, imageId);
      success('Đã đổi ảnh chính', 'Ảnh được chọn đã được đặt làm ảnh đại diện cho phòng.');
      await fetchImages();
    } catch (err: any) {
      error('Lỗi đổi ảnh chính', err.message);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!room) return;

    try {
      setIsSubmitting(true);

      // Upload new files in batch if any
      if (newFiles.length > 0) {
        try {
          const uploaded = await roomsApi.uploadImages(room.id, newFiles);
          if (uploaded && uploaded.length > 0 && existingImages.length === 0) {
            const primaryId = uploaded[primaryNewIndex]?.id || uploaded[0].id;
            await roomsApi.setPrimaryImage(room.id, primaryId);
          }
        } catch (uploadErr: any) {
          console.error('Failed to upload new room images:', uploadErr);
        }
      }

      await roomsApi.update(room.id, {
        ...formData,
        hotelId: Number(formData.hotelId),
        pricePerNight: Number(formData.pricePerNight),
        maxAdults: Number(formData.maxAdults),
        maxChildren: Number(formData.maxChildren),
        totalRooms: Number(formData.totalRooms),
        availableRooms: Number(formData.availableRooms),
        bedCount: Number(formData.bedCount),
        roomSize: formData.roomSize ? Number(formData.roomSize) : null,
      });

      success('Thành công', `Đã cập nhật phòng "${formData.name}" thành công!`);
      onSuccess();
      onClose();
    } catch (err: any) {
      error('Lỗi cập nhật phòng', err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!room) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Chỉnh Sửa Phòng: ${room.name}`}
      subtitle={`Cập nhật giá, sức chứa và quản lý album ảnh`}
      maxWidth="3xl"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Hàng 1: Khách sạn & Trạng thái */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Select
            label="Thuộc Khách sạn *"
            value={formData.hotelId}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, hotelId: Number(e.target.value) }))
            }
            options={hotels.map((h) => ({ value: h.id, label: `${h.name} (#${h.id})` }))}
            required
          />
          <Select
            label="Trạng thái"
            value={formData.status}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, status: e.target.value as RoomStatus }))
            }
            options={ROOM_STATUS_OPTIONS.map((st) => ({
              value: st.value,
              label: st.label,
            }))}
          />
        </div>

        {/* Hàng 2: Tên & Slug */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="Tên phòng *"
            value={formData.name || ''}
            onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
            required
            leftIcon={<BedDouble className="h-4 w-4" />}
          />
          <Input
            label="Slug"
            value={formData.slug || ''}
            onChange={(e) => setFormData((prev) => ({ ...prev, slug: e.target.value }))}
          />
        </div>

        {/* Hàng 3: Giá & Diện tích */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="Giá mỗi đêm (VNĐ) *"
            type="number"
            min={0}
            step="any"
            value={formData.pricePerNight || 0}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, pricePerNight: Number(e.target.value) }))
            }
            required
            leftIcon={<DollarSign className="h-4 w-4" />}
          />
          <Input
            label="Diện tích (m²)"
            type="number"
            min={1}
            value={formData.roomSize || ''}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, roomSize: Number(e.target.value) }))
            }
          />
        </div>

        {/* Hàng 4: Giường & Loại giường */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="Số giường (Tối đa 2) *"
            type="number"
            min={1}
            max={2}
            value={formData.bedCount || 1}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, bedCount: Number(e.target.value) }))
            }
            required
          />
          <Select
            label="Loại giường"
            value={formData.bedType || 'Giường Đôi'}
            onChange={(e) => setFormData((prev) => ({ ...prev, bedType: e.target.value }))}
            options={BED_TYPES.map((b) => ({ value: b, label: b }))}
          />
        </div>

        {/* Hàng 5: Người lớn & Trẻ em */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="Người lớn"
            type="number"
            min={1}
            value={formData.maxAdults || 2}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, maxAdults: Number(e.target.value) }))
            }
            leftIcon={<Users className="h-4 w-4" />}
          />
          <Input
            label="Trẻ em"
            type="number"
            min={0}
            value={formData.maxChildren || 0}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, maxChildren: Number(e.target.value) }))
            }
          />
        </div>

        {/* Hàng 6: Tổng số phòng & Còn trống */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="Tổng số phòng"
            type="number"
            min={1}
            value={formData.totalRooms || 1}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, totalRooms: Number(e.target.value) }))
            }
          />
          <Input
            label="Số phòng còn trống"
            type="number"
            min={0}
            value={formData.availableRooms || 0}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, availableRooms: Number(e.target.value) }))
            }
          />
        </div>

        {/* Hàng 7: Giờ nhận trả với TimePicker */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <TimePicker
            label="Giờ nhận phòng"
            value={formData.checkInTime || '14:00:00'}
            onChange={(val) => setFormData((prev) => ({ ...prev, checkInTime: val }))}
          />
          <TimePicker
            label="Giờ trả phòng"
            value={formData.checkOutTime || '12:00:00'}
            onChange={(val) => setFormData((prev) => ({ ...prev, checkOutTime: val }))}
          />
        </div>

        {/* Hàng 8: Quản lý Album & Tải nhiều ảnh cùng lúc */}
        <MultiImageUploadSection
          label="Album Ảnh Phòng (Tải thêm nhiều ảnh cùng lúc)"
          maxImages={5}
          existingImages={existingImages}
          onDeleteExisting={handleDeleteExisting}
          onSetPrimaryExisting={handleSetPrimaryExisting}
          newFiles={newFiles}
          onNewFilesChange={setNewFiles}
          primaryNewIndex={primaryNewIndex}
          onSetPrimaryNewIndex={setPrimaryNewIndex}
          helperText="Tải tối đa 5 ảnh. Bấm vào ngôi sao ⭐ để chọn ảnh làm đại diện chính."
        />

        {/* Hàng 9: Mô tả */}
        <Textarea
          label="Mô tả tiện nghi phòng"
          rows={3}
          value={formData.description || ''}
          onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
        />

        {/* Buttons */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100 dark:border-gray-800">
          <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>
            Hủy bỏ
          </Button>
          <Button type="submit" isLoading={isSubmitting}>
            Lưu Thay Đổi
          </Button>
        </div>
      </form>
    </Modal>
  );
}
