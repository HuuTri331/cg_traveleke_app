'use client';

import React, { useState, useEffect } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Textarea } from '@/components/ui/Textarea';
import { Button } from '@/components/ui/Button';
import { TimePicker } from '@/components/ui/TimePicker';
import { MultiImageUploadSection } from '@/components/ui/MultiImageUploadSection';
import { HOTEL_TYPES, LOCATIONS, HOTEL_STATUS_OPTIONS } from '@/lib/constants';
import { slugify } from '@/lib/utils';
import { hotelsApi } from '@/services/api/hotels.api';
import { CreateHotelInput, HotelStatus } from '@/types/hotel';
import { Star, Building2, MapPin, Phone, Mail } from 'lucide-react';
import { useToast } from '@/components/ui/Toast';

export interface HotelCreateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function HotelCreateModal({
  isOpen,
  onClose,
  onSuccess,
}: HotelCreateModalProps) {
  const { success, error } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [newFiles, setNewFiles] = useState<File[]>([]);
  const [primaryNewIndex, setPrimaryNewIndex] = useState<number>(0);

  const [formData, setFormData] = useState<CreateHotelInput>({
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

  const [autoSlug, setAutoSlug] = useState(true);

  useEffect(() => {
    if (isOpen) {
      setFormData({
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
        status: 'ACTIVE',
      });
      setNewFiles([]);
      setPrimaryNewIndex(0);
      setAutoSlug(true);
    }
  }, [isOpen]);

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
    if (!formData.name.trim()) {
      error('Thiếu thông tin', 'Vui lòng nhập tên khách sạn.');
      return;
    }
    if (!formData.address.trim()) {
      error('Thiếu thông tin', 'Vui lòng nhập địa chỉ khách sạn.');
      return;
    }

    try {
      setIsSubmitting(true);
      const createdHotel = await hotelsApi.create({
        ...formData,
        hotelTypeId: Number(formData.hotelTypeId),
        locationId: Number(formData.locationId),
        starRating: Number(formData.starRating),
      });

      // Batch upload all selected images
      if (newFiles.length > 0 && createdHotel?.id) {
        try {
          const uploaded = await hotelsApi.uploadImages(createdHotel.id, newFiles);
          if (uploaded && uploaded.length > 0) {
            const primaryId = uploaded[primaryNewIndex]?.id || uploaded[0].id;
            await hotelsApi.setPrimaryImage(createdHotel.id, primaryId);
          }
        } catch (uploadErr: any) {
          console.error('Failed to batch upload hotel images:', uploadErr);
        }
      }

      success('Thành công', `Đã thêm khách sạn "${formData.name}" với ${newFiles.length} ảnh vào hệ thống!`);
      onSuccess();
      onClose();
    } catch (err: any) {
      error('Lỗi tạo khách sạn', err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Thêm Mới Khách Sạn"
      subtitle="Cấu hình thông tin cơ sở lưu trú và tải nhiều ảnh cùng lúc"
      maxWidth="3xl"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Hàng 1: Tên & Slug */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="Tên khách sạn *"
            placeholder="Ví dụ: Khách sạn Rex Sài Gòn"
            value={formData.name}
            onChange={handleNameChange}
            required
            leftIcon={<Building2 className="h-4 w-4" />}
          />
          <Input
            label="Đường dẫn tĩnh (Slug)"
            placeholder="khach-san-rex-sai-gon"
            value={formData.slug}
            onChange={(e) => {
              setAutoSlug(false);
              setFormData((prev) => ({ ...prev, slug: e.target.value }));
            }}
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

        {/* Hàng 3: Xếp hạng sao & Trạng thái */}
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
            label="Trạng thái hoạt động"
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

        {/* Hàng 4: Địa chỉ chi tiết */}
        <Input
          label="Địa chỉ chi tiết *"
          placeholder="Số nhà, tên đường, phường/xã..."
          value={formData.address}
          onChange={(e) => setFormData((prev) => ({ ...prev, address: e.target.value }))}
          required
          leftIcon={<MapPin className="h-4 w-4" />}
        />

        {/* Hàng 5: Liên hệ SĐT & Email */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="Số điện thoại"
            placeholder="028 3829 2185"
            value={formData.phone || ''}
            onChange={(e) => setFormData((prev) => ({ ...prev, phone: e.target.value }))}
            leftIcon={<Phone className="h-4 w-4" />}
          />
          <Input
            label="Email liên hệ"
            type="email"
            placeholder="contact@hotel.vn"
            value={formData.email || ''}
            onChange={(e) => setFormData((prev) => ({ ...prev, email: e.target.value }))}
            leftIcon={<Mail className="h-4 w-4" />}
          />
        </div>

        {/* Hàng 6: Giờ nhận & trả phòng với TimePicker trực quan */}
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

        {/* Hàng 7: Tải nhiều ảnh cùng lúc */}
        <MultiImageUploadSection
          label="Album Ảnh Khách Sạn (Chọn nhiều ảnh cùng lúc)"
          maxImages={6}
          newFiles={newFiles}
          onNewFilesChange={setNewFiles}
          primaryNewIndex={primaryNewIndex}
          onSetPrimaryNewIndex={setPrimaryNewIndex}
          helperText="Tải tối đa 6 ảnh cho khách sạn. Bấm vào ngôi sao ⭐ để chọn ảnh bìa đại diện chính."
        />

        {/* Hàng 8: Mô tả */}
        <Textarea
          label="Mô tả giới thiệu khách sạn"
          placeholder="Giới thiệu về tiện nghi, vị trí đắc địa, dịch vụ..."
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
            Lưu & Tạo Khách Sạn
          </Button>
        </div>
      </form>
    </Modal>
  );
}
