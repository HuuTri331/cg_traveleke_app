'use client';

import React, { useRef } from 'react';
import { UploadCloud, X, Star, Trash2, CheckCircle2, Image as ImageIcon } from 'lucide-react';
import { getFullImageUrl } from '@/lib/utils';

export interface ExistingImage {
  id: string;
  imageUrl: string;
  isPrimary?: number | boolean;
}

export interface MultiImageUploadSectionProps {
  label?: string;
  maxImages?: number;
  existingImages?: ExistingImage[];
  onDeleteExisting?: (imageId: string) => void;
  onSetPrimaryExisting?: (imageId: string) => void;
  newFiles: File[];
  onNewFilesChange: (files: File[]) => void;
  primaryNewIndex?: number;
  onSetPrimaryNewIndex?: (index: number) => void;
  helperText?: string;
}

export function MultiImageUploadSection({
  label = 'Album & Ảnh đại diện (Hỗ trợ tải nhiều ảnh một lúc)',
  maxImages = 6,
  existingImages = [],
  onDeleteExisting,
  onSetPrimaryExisting,
  newFiles,
  onNewFilesChange,
  primaryNewIndex = 0,
  onSetPrimaryNewIndex,
  helperText,
}: MultiImageUploadSectionProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const totalCount = existingImages.length + newFiles.length;
  const remainingSlots = Math.max(0, maxImages - totalCount);

  const handleFilesSelected = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const validFiles: File[] = [];
    const maxCanAdd = maxImages - totalCount;

    for (let i = 0; i < Math.min(files.length, maxCanAdd); i++) {
      const file = files[i];
      if (file.type.startsWith('image/')) {
        validFiles.push(file);
      }
    }

    onNewFilesChange([...newFiles, ...validFiles]);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleRemoveNewFile = (index: number) => {
    const next = [...newFiles];
    next.splice(index, 1);
    onNewFilesChange(next);
    if (primaryNewIndex >= next.length && next.length > 0) {
      onSetPrimaryNewIndex?.(0);
    }
  };

  const hasAnyPrimaryExisting = existingImages.some((img) => Boolean(img.isPrimary));

  return (
    <div className="w-full space-y-3">
      <div className="flex items-center justify-between">
        <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
          {label}
        </label>
        <span className="text-xs font-semibold text-brand-600 dark:text-brand-400">
          {totalCount} / {maxImages} ảnh (Tối đa {maxImages})
        </span>
      </div>

      {/* Upload Dropzone / Multi-File Selector */}
      {remainingSlots > 0 && (
        <div
          onClick={() => fileInputRef.current?.click()}
          className="relative flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-gray-300 dark:border-gray-700 bg-gray-50/50 hover:bg-brand-50/30 hover:border-brand-400 dark:bg-gray-900/40 dark:hover:bg-gray-800/40 p-4 text-center transition-all cursor-pointer group"
        >
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept="image/*"
            className="hidden"
            onChange={handleFilesSelected}
          />
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-50 text-brand-500 dark:bg-brand-500/15 group-hover:scale-110 transition-transform mb-1.5 shadow-xs">
            <UploadCloud className="h-5 w-5" />
          </div>
          <p className="text-xs font-bold text-gray-800 dark:text-gray-200">
            Bấm để chọn <span className="text-brand-500 underline">nhiều ảnh cùng lúc</span> từ máy tính
          </p>
          <p className="text-xs-plus text-gray-400 mt-0.5">
            {helperText || `Có thể chọn tối đa ${remainingSlots} ảnh nữa (JPG, PNG, WEBP)`}
          </p>
        </div>
      )}

      {/* Combined Preview Grid of Existing + Newly Selected Images */}
      {totalCount > 0 && (
        <div className="space-y-2">
          <div className="text-xs-plus font-semibold text-gray-500 dark:text-gray-400 flex items-center justify-between">
            <span>Danh sách ảnh ({totalCount}) - Click biểu tượng sao để chọn làm ảnh đại diện chính:</span>
            {newFiles.length > 0 && (
              <button
                type="button"
                onClick={() => onNewFilesChange([])}
                className="text-red-500 hover:underline cursor-pointer"
              >
                Hủy {newFiles.length} ảnh mới
              </button>
            )}
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
            {/* 1. Existing Uploaded Images */}
            {existingImages.map((img) => {
              const isPrimary = Boolean(img.isPrimary);
              return (
                <div
                  key={img.id}
                  className={`group relative aspect-video sm:aspect-square rounded-xl overflow-hidden border bg-gray-900 shadow-xs transition-all ${
                    isPrimary
                      ? 'border-brand-500 ring-2 ring-brand-500/40'
                      : 'border-gray-200 dark:border-gray-700'
                  }`}
                >
                  <img
                    src={getFullImageUrl(img.imageUrl)}
                    alt="Uploaded photo"
                    className="h-full w-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src =
                        'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=200&q=80';
                    }}
                  />

                  {/* Primary Badge or Select Primary Button */}
                  {isPrimary ? (
                    <div className="absolute top-1 left-1 flex items-center gap-0.5 rounded-full bg-brand-500 px-1.5 py-0.5 text-3xs font-bold text-white shadow-md">
                      <Star className="h-2.5 w-2.5 fill-white" />
                      <span>Ảnh chính</span>
                    </div>
                  ) : (
                    onSetPrimaryExisting && (
                      <button
                        type="button"
                        onClick={() => onSetPrimaryExisting(img.id)}
                        className="absolute top-1 left-1 flex items-center gap-0.5 rounded-full bg-black/70 hover:bg-brand-500 px-1.5 py-0.5 text-3xs font-semibold text-white transition-colors cursor-pointer"
                        title="Đặt làm ảnh chính"
                      >
                        <Star className="h-2.5 w-2.5" />
                        <span>Chọn chính</span>
                      </button>
                    )
                  )}

                  {/* Delete Existing Button */}
                  {onDeleteExisting && (
                    <button
                      type="button"
                      onClick={() => onDeleteExisting(img.id)}
                      className="absolute top-1 right-1 flex h-6 w-6 items-center justify-center rounded-full bg-black/70 text-white hover:bg-red-500 transition-colors cursor-pointer"
                      title="Xóa ảnh này"
                    >
                      <Trash2 className="h-3 w-3" />
                    </button>
                  )}
                </div>
              );
            })}

            {/* 2. Newly Selected Local Image Files */}
            {newFiles.map((file, idx) => {
              const previewUrl = URL.createObjectURL(file);
              const isPrimaryNew = !hasAnyPrimaryExisting && primaryNewIndex === idx;

              return (
                <div
                  key={idx}
                  className={`group relative aspect-video sm:aspect-square rounded-xl overflow-hidden border bg-gray-900 shadow-xs transition-all ${
                    isPrimaryNew
                      ? 'border-brand-500 ring-2 ring-brand-500/40'
                      : 'border-gray-200 dark:border-gray-700'
                  }`}
                >
                  <img
                    src={previewUrl}
                    alt={`New ${idx}`}
                    className="h-full w-full object-cover"
                  />

                  {/* New Image Tag */}
                  <div className="absolute bottom-0 inset-x-0 bg-black/70 px-1 py-0.5 text-3xs text-center text-white truncate font-medium">
                    + Mới ({ (file.size / (1024 * 1024)).toFixed(1) } MB)
                  </div>

                  {/* Primary Badge or Select Button */}
                  {isPrimaryNew ? (
                    <div className="absolute top-1 left-1 flex items-center gap-0.5 rounded-full bg-brand-500 px-1.5 py-0.5 text-3xs font-bold text-white shadow-md">
                      <Star className="h-2.5 w-2.5 fill-white" />
                      <span>Ảnh chính</span>
                    </div>
                  ) : (
                    onSetPrimaryNewIndex && (
                      <button
                        type="button"
                        onClick={() => onSetPrimaryNewIndex(idx)}
                        className="absolute top-1 left-1 flex items-center gap-0.5 rounded-full bg-black/70 hover:bg-brand-500 px-1.5 py-0.5 text-3xs font-semibold text-white transition-colors cursor-pointer"
                        title="Đặt làm ảnh chính"
                      >
                        <Star className="h-2.5 w-2.5" />
                        <span>Chọn chính</span>
                      </button>
                    )
                  )}

                  {/* Remove Button */}
                  <button
                    type="button"
                    onClick={() => handleRemoveNewFile(idx)}
                    className="absolute top-1 right-1 flex h-6 w-6 items-center justify-center rounded-full bg-black/70 text-white hover:bg-red-500 transition-colors cursor-pointer"
                    title="Xóa ảnh mới chọn này"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
