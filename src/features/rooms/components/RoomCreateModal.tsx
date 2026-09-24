'use client';

import React, { useState, useEffect } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Textarea } from '@/components/ui/Textarea';
import { Button } from '@/components/ui/Button';
import { TimePicker } from '@/components/ui/TimePicker';
import { MultiImageUploadSection } from '@/components/ui/MultiImageUploadSection';
import { RoomServicesPicker } from './RoomServicesPicker';
import { BED_TYPES, ROOM_STATUS_OPTIONS } from '@/lib/constants';
import { slugify } from '@/lib/utils';
import { roomsApi } from '@/services/api/rooms.api';
import { CreateRoomInput, RoomStatus } from '@/types/room';
import { Hotel } from '@/types/hotel';
import { BedDouble, Users, DollarSign } from 'lucide-react';
import { useToast } from '@/components/ui/Toast';

export interface RoomCreateModalProps {
  hotels: Hotel[];
  defaultHotelId?: number | '';
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function RoomCreateModal({
  hotels,
  defaultHotelId,
  isOpen,
  onClose,
  onSuccess,
}: RoomCreateModalProps) {
  const { success, error } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [newFiles, setNewFiles] = useState<File[]>([]);
  const [primaryNewIndex, setPrimaryNewIndex] = useState<number>(0);
  const [autoSlug, setAutoSlug] = useState(true);
  const [selectedServiceIds, setSelectedServiceIds] = useState<number[]>([]);

  const [formData, setFormData] = useState<CreateRoomInput>({
    hotelId:
      defaultHotelId
        ? Number(defaultHotelId)
        : hotels[0]?.id
        ? Number(hotels[0].id)
        : 1,
    name: '',
    slug: '',
    pricePerNight: 500000,
    checkInTime: '14:00:00',
    checkOutTime: '12:00:00',
    maxAdults: 2,
    maxChildren: 1,
    totalRooms: 5,
    availableRooms: 5,
    bedCount: 1,
    bedType: 'Giường Đôi',
    roomSize: 32,
    rating: 5,
    reviewCount: 0,
    coverImageUrl: '',
    description: '',
    status: 'AVAILABLE' as RoomStatus,
  });

  useEffect(() => {
    if (isOpen) {
      setFormData({
        hotelId:
          defaultHotelId
            ? Number(defaultHotelId)
            : hotels[0]?.id
            ? Number(hotels[0].id)
            : 1,
        name: '',
        slug: '',
        pricePerNight: 500000,
        checkInTime: '14:00:00',
        checkOutTime: '12:00:00',
        maxAdults: 2,
        maxChildren: 1,
        totalRooms: 5,
        availableRooms: 5,
        bedCount: 1,
        bedType: 'Giường Đôi',
        roomSize: 32,
        rating: 5,
        reviewCount: 0,
        coverImageUrl: '',
        description: '',
        status: 'AVAILABLE',
      });
      setNewFiles([]);
      setPrimaryNewIndex(0);
      setAutoSlug(true);
      setSelectedServiceIds([]);
    }
  }, [isOpen, defaultHotelId, hotels]);

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setFormData((prev) => ({
      ...prev,
      name: val,
      slug: autoSlug ? slugify(val) : prev.slug,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.hotelId) {
      error('Thiếu thông tin', 'Vui lòng chọn khách sạn trực thuộc.');
      return;
    }
    if (!formData.name.trim()) {
      error('Thiếu thông tin', 'Vui lòng nhập tên phòng.');
      return;
    }
    if (Number(formData.bedCount) > 2) {
      error('Không hợp lệ', 'Số lượng giường tối đa là 2 giường.');
      return;
    }

    try {
      setIsSubmitting(true);
      const createdRoom = await roomsApi.create({
        ...formData,
        hotelId: Number(formData.hotelId),
        pricePerNight: Number(formData.pricePerNight),
        maxAdults: Number(formData.maxAdults),
        maxChildren: Number(formData.maxChildren),
        totalRooms: Number(formData.totalRooms),
        availableRooms: Number(formData.availableRooms),
        bedCount: Number(formData.bedCount),
        roomSize: formData.roomSize ? Number(formData.roomSize) : null,
        serviceIds: selectedServiceIds,
      });

      // Batch upload all selected images for this room
      if (newFiles.length > 0 && createdRoom?.id) {
        try {
          const uploaded = await roomsApi.uploadImages(createdRoom.id, newFiles);
          if (uploaded && uploaded.length > 0) {
            const primaryId = uploaded[primaryNewIndex]?.id || uploaded[0].id;
            await roomsApi.setPrimaryImage(createdRoom.id, primaryId);
          }
        } catch (uploadErr: any) {
          console.error('Failed to upload room images in batch:', uploadErr);
        }
      }

      success('Thành công', `Đã thêm phòng "${formData.name}" với ${newFiles.length} ảnh vào hệ thống!`);
      onSuccess();
      onClose();
    } catch (err: any) {
      error('Lỗi tạo phòng', err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Thêm Mới Phòng Khách Sạn"
      subtitle="Cấu hình loại phòng, giá thuê, số lượng giường và tải nhiều ảnh cùng lúc"
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
            label="Trạng thái phòng"
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
            placeholder="Ví dụ: Deluxe Ocean View"
            value={formData.name}
            onChange={handleNameChange}
            required
            leftIcon={<BedDouble className="h-4 w-4" />}
          />
          <Input
            label="Slug (Đường dẫn tĩnh)"
            placeholder="deluxe-ocean-view"
            value={formData.slug}
            onChange={(e) => {
              setAutoSlug(false);
              setFormData((prev) => ({ ...prev, slug: e.target.value }));
            }}
          />
        </div>

        {/* Hàng 3: Giá phòng & Diện tích */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="Giá mỗi đêm (VNĐ) *"
            type="number"
            min={0}
            step="any"
            placeholder="500000"
            value={formData.pricePerNight}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, pricePerNight: Number(e.target.value) }))
            }
            required
            leftIcon={<DollarSign className="h-4 w-4" />}
          />
          <Input
            label="Diện tích phòng (m²)"
            type="number"
            min={1}
            placeholder="35"
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
            label="Người lớn tối đa"
            type="number"
            min={1}
            value={formData.maxAdults || 2}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, maxAdults: Number(e.target.value) }))
            }
            leftIcon={<Users className="h-4 w-4" />}
          />
          <Input
            label="Trẻ em tối đa"
            type="number"
            min={0}
            value={formData.maxChildren || 0}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, maxChildren: Number(e.target.value) }))
            }
          />
        </div>

        {/* Hàng 6: Tổng số phòng & Số phòng trống */}
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
            value={formData.availableRooms || 1}
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

        {/* Hàng 8: Album ảnh & Chọn nhiều ảnh cùng lúc */}
        <MultiImageUploadSection
          label="Album Ảnh Phòng (Chọn nhiều ảnh cùng lúc)"
          maxImages={5}
          newFiles={newFiles}
          onNewFilesChange={setNewFiles}
          primaryNewIndex={primaryNewIndex}
          onSetPrimaryNewIndex={setPrimaryNewIndex}
          helperText="Tải tối đa 5 ảnh cho phòng nghỉ. Bấm vào biểu tượng ngôi sao để chọn ảnh làm đại diện chính."
        />

        {/* Hàng 9: Dịch vụ & Tiện ích kèm theo phòng (Miễn phí mặc định & Có phí) */}
        <RoomServicesPicker
          selectedServiceIds={selectedServiceIds}
          onChange={setSelectedServiceIds}
          defaultCheckComplimentary={true}
        />

        {/* Hàng 10: Mô tả */}
        <Textarea
          label="Mô tả tiện nghi phòng"
          placeholder="Ban công ngắm biển, bồn tắm nằm, minibar, TV thông minh..."
          rows={3}
          value={formData.description || ''}
          onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
        />

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100 dark:border-gray-800">
          <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>
            Hủy bỏ
          </Button>
          <Button type="submit" isLoading={isSubmitting}>
            Lưu & Tạo Phòng
          </Button>
        </div>
      </form>
    </Modal>
  );
}
