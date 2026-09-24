'use client';

import React, { useRef } from 'react';
import { UploadCloud, Image as ImageIcon, Trash2, RefreshCw, Check } from 'lucide-react';
import { getFullImageUrl } from '@/lib/utils';

export interface SingleImageUploaderProps {
  label?: string;
  imageUrl?: string | null;
  onImageChange: (previewUrl: string | null, file?: File | null) => void;
  helperText?: string;
}

export function SingleImageUploader({
  label = 'Ảnh đại diện chính (Cover Image)',
  imageUrl,
  onImageChange,
  helperText = 'Tải ảnh chất lượng cao (JPG, PNG, WEBP) làm ảnh đại diện chính',
}: SingleImageUploaderProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const preview = URL.createObjectURL(file);
      onImageChange(preview, file);
    }
  };

  const handleRemove = () => {
    onImageChange(null, null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className="w-full">
      {label && (
        <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5 uppercase tracking-wider">
          {label}
        </label>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFileSelect}
      />

      {imageUrl ? (
        <div className="relative rounded-2xl border border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/40 p-3 flex flex-col sm:flex-row items-center gap-4">
          <div className="relative h-24 w-36 sm:h-28 sm:w-44 rounded-xl overflow-hidden bg-gray-100 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 shrink-0">
            <img
              src={getFullImageUrl(imageUrl)}
              alt="Thumbnail preview"
              className="h-full w-full object-cover"
              onError={(e) => {
                (e.target as HTMLImageElement).src =
                  'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=300&q=80';
              }}
            />
          </div>

          <div className="flex-1 space-y-2 text-center sm:text-left">
            <div>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-brand-50 text-brand-600 dark:bg-brand-500/15 dark:text-brand-400 text-xs-plus font-bold">
                <Check className="h-3 w-3" />
                <span>Đã chọn ảnh đại diện</span>
              </span>
              <p className="text-xs-plus text-gray-500 dark:text-gray-400 mt-1">
                Ảnh này sẽ hiển thị làm ảnh bìa chính trên trang chủ và danh sách.
              </p>
            </div>

            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 dark:bg-gray-800 dark:border-gray-600 dark:text-gray-200 dark:hover:bg-gray-700 transition-colors cursor-pointer shadow-xs"
              >
                <RefreshCw className="h-3.5 w-3.5" />
                Thay đổi ảnh khác
              </button>

              <button
                type="button"
                onClick={handleRemove}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950/30 transition-colors cursor-pointer"
              >
                <Trash2 className="h-3.5 w-3.5" />
                Xóa ảnh
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div
          onClick={() => fileInputRef.current?.click()}
          className="relative flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-gray-300 dark:border-gray-700 bg-gray-50/50 hover:bg-brand-50/30 hover:border-brand-400 dark:bg-gray-900/40 dark:hover:bg-gray-800/40 p-5 text-center transition-all cursor-pointer group"
        >
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-50 text-brand-500 dark:bg-brand-500/15 group-hover:scale-110 transition-transform mb-2">
            <UploadCloud className="h-5 w-5" />
          </div>
          <p className="text-xs font-semibold text-gray-800 dark:text-gray-200">
            Bấm để chọn <span className="text-brand-500 underline">ảnh đại diện từ thiết bị</span>
          </p>
          <p className="mt-0.5 text-xs-plus text-gray-400">{helperText}</p>
        </div>
      )}
    </div>
  );
}
