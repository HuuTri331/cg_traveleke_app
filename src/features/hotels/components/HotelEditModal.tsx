'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Textarea } from '@/components/ui/Textarea';
import { Button } from '@/components/ui/Button';
import { TimePicker } from '@/components/ui/TimePicker';
import { MultiImageUploadSection } from '@/components/ui/MultiImageUploadSection';
import { HOTEL_TYPES, LOCATIONS, HOTEL_STATUS_OPTIONS } from '@/lib/constants';
import { hotelsApi } from '@/services/api/hotels.api';
import { Hotel, HotelImage, HotelStatus, UpdateHotelInput } from '@/types/hotel';
import { Star, Building2, MapPin, Phone, Mail } from 'lucide-react';
import { useToast } from '@/components/ui/Toast';

export interface HotelEditModalProps {
  hotel: Hotel | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function HotelEditModal({
  hotel,
  isOpen,
  onClose,
  onSuccess,
}: HotelEditModalProps) {
  const { success, error } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [existingImages, setExistingImages] = useState<HotelImage[]>([]);
  const [newFiles, setNewFiles] = useState<File[]>([]);
  const [primaryNewIndex, setPrimaryNewIndex] = useState<number>(0);

  const [formData, setFormData] = useState<UpdateHotelInput>({
    name: '',
    slug: '',
    hotelTypeId: 1,
    locationId: 1,
    starRating: 4,
    address: '',
    phone: '',
    email: '',
    checkInTime: '14:00:00',
    checkOutTime: '12:00:00',
    coverImageUrl: '',
    description: '',
    status: 'ACTIVE' as HotelStatus,
  });

  const fetchImages = useCallback(async () => {
    if (!hotel) return;
    try {
      const res = await hotelsApi.getImages(hotel.id);
      setExistingImages(res);
    } catch (err) {
      console.error('Failed to load hotel images:', err);
    }
  }, [hotel]);

  useEffect(() => {
    if (hotel && isOpen) {
      setFormData({
        name: hotel.name,
        slug: hotel.slug,
        hotelTypeId: Number(hotel.hotelTypeId),
        locationId: Number(hotel.locationId),
        starRating: hotel.starRating || 4,
        address: hotel.address,
        phone: hotel.phone || '',
        email: hotel.email || '',
        checkInTime: hotel.checkInTime || '14:00:00',
        checkOutTime: hotel.checkOutTime || '12:00:00',
        coverImageUrl: hotel.coverImageUrl || '',
        description: hotel.description || '',
        status: hotel.status,
      });
      setNewFiles([]);
      setPrimaryNewIndex(0);
      fetchImages();
    }
  }, [hotel, isOpen, fetchImages]);

  const handleDeleteExisting = async (imageId: string) => {
    if (!hotel) return;
    try {
      await hotelsApi.deleteImage(hotel.id, imageId);
      success('Đã xóa ảnh', 'Đã gỡ ảnh khỏi album thành công.');
      await fetchImages();
    } catch (err: any) {
      error('Lỗi xóa ảnh', err.message);
    }
  };

  const handleSetPrimaryExisting = async (imageId: string) => {
    if (!hotel) return;
    try {
      await hotelsApi.setPrimaryImage(hotel.id, imageId);
      success('Đã đổi ảnh chính', 'Ảnh được chọn đã được đặt làm ảnh đại diện.');
      await fetchImages();
    } catch (err: any) {
      error('Lỗi đổi ảnh chính', err.message);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!hotel) return;

    try {
      setIsSubmitting(true);

      // Upload new files in batch if any
      if (newFiles.length > 0) {
        try {
          const uploaded = await hotelsApi.uploadImages(hotel.id, newFiles);
          if (uploaded && uploaded.length > 0 && existingImages.length === 0) {
            const primaryId = uploaded[primaryNewIndex]?.id || uploaded[0].id;
            await hotelsApi.setPrimaryImage(hotel.id, primaryId);
          }
        } catch (uploadErr: any) {
          console.error('Failed to upload new hotel images:', uploadErr);
        }
      }

      await hotelsApi.update(hotel.id, {
        ...formData,
        hotelTypeId: Number(formData.hotelTypeId),
        locationId: Number(formData.locationId),
        starRating: Number(formData.starRating),
      });

      success('Thành công', `Đã cập nhật khách sạn "${formData.name}" thành công!`);
      onSuccess();
      onClose();
    } catch (err: any) {
      error('Lỗi cập nhật khách sạn', err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!hotel) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Chỉnh Sửa Khách Sạn: ${hotel.name}`}
      subtitle={`Cập nhật thông tin chi tiết & quản lý album ảnh`}
      maxWidth="3xl"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Hàng 1: Tên & Slug */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="Tên khách sạn *"
            value={formData.name || ''}
            onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
            required
            leftIcon={<Building2 className="h-4 w-4" />}
          />
          <Input
            label="Đường dẫn tĩnh (Slug)"
            value={formData.slug || ''}
            onChange={(e) => setFormData((prev) => ({ ...prev, slug: e.target.value }))}
          />
        </div>

        {/* Hàng 2: Loại hình & Địa điểm */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Select
            label="Loại hình lưu trú *"
            value={formData.hotelTypeId}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, hotelTypeId: Number(e.target.value) }))
            }
            options={HOTEL_TYPES.map((t) => ({ value: t.id, label: t.name }))}
          />
          <Select
            label="Tỉnh / Thành phố *"
            value={formData.locationId}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, locationId: Number(e.target.value) }))
            }
            options={LOCATIONS.map((loc) => ({ value: loc.id, label: loc.name }))}
          />
        </div>

        {/* Hàng 3: Sao & Trạng thái */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5 uppercase tracking-wider">
              Xếp hạng sao
            </label>
            <div className="flex items-center gap-1.5 h-10 px-3.5 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setFormData((prev) => ({ ...prev, starRating: star }))}
                  className="p-0.5 cursor-pointer text-gray-300 hover:text-amber-400 focus:outline-none transition-colors"
                >
                  <Star
                    className={`h-5 w-5 ${
                      star <= (formData.starRating || 0)
                        ? 'text-amber-400 fill-amber-400'
                        : 'text-gray-300 dark:text-gray-600'
                    }`}
                  />
                </button>
              ))}
              <span className="ml-auto text-xs font-bold text-gray-600 dark:text-gray-400">
                {formData.starRating} sao
              </span>
            </div>
          </div>

          <Select
            label="Trạng thái"
            value={formData.status}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, status: e.target.value as HotelStatus }))
            }
            options={HOTEL_STATUS_OPTIONS.map((st) => ({
              value: st.value,
              label: st.label,
            }))}
          />
        </div>

        {/* Hàng 4: Địa chỉ */}
        <Input
          label="Địa chỉ chi tiết *"
          value={formData.address || ''}
          onChange={(e) => setFormData((prev) => ({ ...prev, address: e.target.value }))}
          required
          leftIcon={<MapPin className="h-4 w-4" />}
        />

        {/* Hàng 5: SĐT & Email */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="Số điện thoại"
            value={formData.phone || ''}
            onChange={(e) => setFormData((prev) => ({ ...prev, phone: e.target.value }))}
            leftIcon={<Phone className="h-4 w-4" />}
          />
          <Input
            label="Email liên hệ"
            type="email"
            value={formData.email || ''}
            onChange={(e) => setFormData((prev) => ({ ...prev, email: e.target.value }))}
            leftIcon={<Mail className="h-4 w-4" />}
          />
        </div>

        {/* Hàng 6: Giờ nhận trả với TimePicker */}
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

        {/* Hàng 7: Quản lý Album & Tải nhiều ảnh cùng lúc */}
        <MultiImageUploadSection
          label="Album Ảnh Khách Sạn (Tải thêm nhiều ảnh cùng lúc)"
          maxImages={6}
          existingImages={existingImages}
          onDeleteExisting={handleDeleteExisting}
          onSetPrimaryExisting={handleSetPrimaryExisting}
          newFiles={newFiles}
          onNewFilesChange={setNewFiles}
          primaryNewIndex={primaryNewIndex}
          onSetPrimaryNewIndex={setPrimaryNewIndex}
          helperText="Tải tối đa 6 ảnh. Bấm vào biểu tượng ngôi sao để chọn ảnh làm đại diện chính."
        />

        {/* Hàng 8: Mô tả */}
        <Textarea
          label="Mô tả khách sạn"
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
