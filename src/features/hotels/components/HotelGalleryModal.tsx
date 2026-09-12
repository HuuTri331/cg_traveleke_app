'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { ImageUploadZone } from '@/components/ui/ImageUploadZone';
import { Hotel, HotelImage } from '@/types/hotel';
import { hotelsApi } from '@/services/api/hotels.api';
import { getFullImageUrl } from '@/lib/utils';
import { Star, Trash2, CheckCircle2, Image as ImageIcon, AlertCircle, X } from 'lucide-react';
import { useToast } from '@/components/ui/Toast';

export interface HotelGalleryModalProps {
  hotel: Hotel | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function HotelGalleryModal({
  hotel,
  isOpen,
  onClose,
  onSuccess,
}: HotelGalleryModalProps) {
  const { success, error } = useToast();
  const [images, setImages] = useState<HotelImage[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);

  const fetchImages = useCallback(async () => {
    if (!hotel) return;
    try {
      setLoading(true);
      const res = await hotelsApi.getImages(hotel.id);
      setImages(res);
    } catch (err: any) {
      error('Lỗi tải album ảnh', err.message);
    } finally {
      setLoading(false);
    }
  }, [hotel, error]);

  useEffect(() => {
    if (isOpen && hotel) {
      fetchImages();
    }
  }, [isOpen, hotel, fetchImages]);

  const handleUpload = async (files: File[]) => {
    if (!hotel) return;
    try {
      setUploading(true);
      await hotelsApi.uploadImages(hotel.id, files);
      success('Tải ảnh thành công', `Đã thêm ${files.length} ảnh vào album khách sạn!`);
      await fetchImages();
      onSuccess();
    } catch (err: any) {
      error('Lỗi tải ảnh lên', err.message);
    } finally {
      setUploading(false);
    }
  };

  const handleSetPrimary = async (imageId: string) => {
    if (!hotel) return;
    try {
      await hotelsApi.setPrimaryImage(hotel.id, imageId);
      success('Đã đổi ảnh đại diện', 'Ảnh được chọn đã được đặt làm ảnh đại diện chính.');
      await fetchImages();
      onSuccess();
    } catch (err: any) {
      error('Lỗi đổi ảnh chính', err.message);
    }
  };

  const handleDelete = async (imageId: string) => {
    if (!hotel) return;
    try {
      await hotelsApi.deleteImage(hotel.id, imageId);
      success('Đã xóa ảnh', 'Ảnh đã được gỡ khỏi album thành công.');
      await fetchImages();
      onSuccess();
    } catch (err: any) {
      error('Lỗi xóa ảnh', err.message);
    }
  };

  if (!hotel) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Album Ảnh: ${hotel.name}`}
      subtitle={`Quản lý tối đa 6 ảnh cho khách sạn. Hiện có ${images.length}/6 ảnh.`}
      maxWidth="4xl"
    >
      <div className="space-y-6">
        {/* Upload Zone */}
        {images.length < 6 ? (
          <div className="rounded-2xl bg-gray-50/70 p-5 dark:bg-gray-850/50 border border-gray-200 dark:border-gray-800">
            <h4 className="text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300 mb-3 flex items-center gap-2">
              <ImageIcon className="h-4 w-4 text-brand-500" /> Tải thêm nhiều ảnh lên album (Tối đa 6 ảnh)
            </h4>
            <ImageUploadZone
              maxFiles={6}
              currentCount={images.length}
              onFilesSelected={handleUpload}
              isUploading={uploading}
            />
          </div>
        ) : (
          <div className="flex items-center gap-2 rounded-xl bg-amber-50 p-4 text-xs font-medium text-amber-800 dark:bg-amber-950/30 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
            <AlertCircle className="h-5 w-5 shrink-0 text-amber-500" />
            Khách sạn này đã đạt giới hạn tối đa 6 ảnh trong album. Hãy xóa bớt ảnh cũ nếu bạn muốn thêm ảnh mới.
          </div>
        )}

        {/* Existing Images Gallery */}
        <div>
          <h4 className="text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300 mb-3 flex items-center justify-between">
            <span>Danh sách ảnh hiện tại ({images.length})</span>
          </h4>

          {loading ? (
            <div className="flex items-center justify-center py-12 text-sm text-gray-500">
              Đang tải danh sách ảnh...
            </div>
          ) : images.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-gray-300 py-12 text-center dark:border-gray-700">
              <ImageIcon className="h-10 w-10 text-gray-400 mb-2" />
              <p className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                Chưa có ảnh nào trong album khách sạn
              </p>
              <p className="text-xs text-gray-500">
                Hãy kéo thả hoặc chọn file ở khung bên trên để thêm ảnh trực quan.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {images.map((img) => {
                const isPrimary = Number(img.isPrimary) === 1;
                return (
                  <div
                    key={img.id}
                    className={`group relative rounded-2xl overflow-hidden border bg-white dark:bg-gray-800 shadow-sm transition-all ${
                      isPrimary
                        ? 'border-brand-500 ring-2 ring-brand-500/20'
                        : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'
                    }`}
                  >
                    {/* Image Preview */}
                    <div className="aspect-video w-full overflow-hidden bg-gray-100 dark:bg-gray-900 relative">
                      <img
                        src={getFullImageUrl(img.imageUrl)}
                        alt={img.caption || 'Hotel photo'}
                        className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src =
                            'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=600&q=80';
                        }}
                      />

                      {/* Explicit Delete X button on top-right */}
                      <button
                        type="button"
                        onClick={() => handleDelete(img.id)}
                        className="absolute top-2 right-2 flex h-7 w-7 items-center justify-center rounded-full bg-black/70 text-white hover:bg-red-500 transition-colors shadow-md cursor-pointer"
                        title="Xóa ảnh này khỏi album"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>

                    {/* Footer Info & Actions */}
                    <div className="p-3 bg-white dark:bg-gray-800 flex items-center justify-between border-t border-gray-100 dark:border-gray-700/60">
                      {isPrimary ? (
                        <div className="flex items-center gap-1.5 text-xs font-bold text-brand-600 dark:text-brand-400">
                          <CheckCircle2 className="h-4 w-4" />
                          <span>Ảnh đại diện chính</span>
                        </div>
                      ) : (
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          leftIcon={<Star className="h-3.5 w-3.5 text-amber-500" />}
                          onClick={() => handleSetPrimary(img.id)}
                        >
                          Chọn làm ảnh chính
                        </Button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Modal Close Action */}
        <div className="flex justify-end pt-4 border-t border-gray-100 dark:border-gray-800">
          <Button variant="outline" onClick={onClose}>
            Đóng cửa sổ
          </Button>
        </div>
      </div>
    </Modal>
  );
}
