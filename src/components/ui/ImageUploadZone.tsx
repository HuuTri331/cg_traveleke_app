'use client';

import React, { useRef, useState } from 'react';
import { UploadCloud, X, Image as ImageIcon } from 'lucide-react';
import { Button } from './Button';

export interface ImageUploadZoneProps {
  maxFiles?: number;
  currentCount?: number;
  onFilesSelected: (files: File[]) => void;
  isUploading?: boolean;
}

export function ImageUploadZone({
  maxFiles = 6,
  currentCount = 0,
  onFilesSelected,
  isUploading = false,
}: ImageUploadZoneProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedFiles, setSelectedFiles] = useState<{ file: File; preview: string }[]>([]);
  const [dragActive, setDragActive] = useState(false);
  const remainingSlots = Math.max(0, maxFiles - currentCount);

  const handleFiles = (files: FileList | null) => {
    if (!files) return;
    const validFiles: { file: File; preview: string }[] = [];
    const maxCanAdd = remainingSlots - selectedFiles.length;

    for (let i = 0; i < Math.min(files.length, maxCanAdd); i++) {
      const file = files[i];
      if (file.type.startsWith('image/')) {
        validFiles.push({
          file,
          preview: URL.createObjectURL(file),
        });
      }
    }

    setSelectedFiles((prev) => [...prev, ...validFiles]);
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFiles(e.dataTransfer.files);
    }
  };

  const removeFile = (index: number) => {
    setSelectedFiles((prev) => {
      const next = [...prev];
      URL.revokeObjectURL(next[index].preview);
      next.splice(index, 1);
      return next;
    });
  };

  const handleUploadClick = () => {
    if (selectedFiles.length === 0) return;
    onFilesSelected(selectedFiles.map((f) => f.file));
    setSelectedFiles([]);
  };

  return (
    <div className="space-y-4">
      {/* Drop area */}
      <div
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`relative flex flex-col items-center justify-center rounded-2xl border-2 border-dashed p-6 text-center transition-all cursor-pointer ${
          dragActive
            ? 'border-brand-500 bg-brand-50/50 dark:bg-brand-500/10'
            : 'border-gray-300 hover:border-brand-400 bg-gray-50/50 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800/50 dark:hover:bg-gray-800'
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="image/*"
          className="hidden"
          onChange={(e) => handleFiles(e.target.files)}
          disabled={remainingSlots <= selectedFiles.length}
        />
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-brand-50 text-brand-500 dark:bg-brand-500/15 mb-3">
          <UploadCloud className="h-6 w-6" />
        </div>
        <p className="text-sm font-semibold text-gray-800 dark:text-gray-200">
          Kéo thả ảnh vào đây hoặc <span className="text-brand-500 underline">chọn từ thiết bị</span>
        </p>
        <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
          Hỗ trợ JPG, PNG, WEBP (Tối đa {maxFiles} ảnh tổng cộng. Còn lại: {remainingSlots - selectedFiles.length} ảnh)
        </p>
      </div>

      {/* Selected file previews */}
      {selectedFiles.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between text-xs text-gray-600 dark:text-gray-400 font-semibold">
            <span>Ảnh chuẩn bị tải lên ({selectedFiles.length})</span>
            <button
              onClick={() => {
                selectedFiles.forEach((f) => URL.revokeObjectURL(f.preview));
                setSelectedFiles([]);
              }}
              className="text-red-500 hover:underline cursor-pointer"
            >
              Hủy tất cả
            </button>
          </div>

          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3">
            {selectedFiles.map((item, index) => (
              <div
                key={index}
                className="group relative aspect-square rounded-xl overflow-hidden border border-gray-200 dark:border-gray-700 bg-gray-100 dark:bg-gray-800 shadow-xs"
              >
                <img
                  src={item.preview}
                  alt={`Preview ${index}`}
                  className="h-full w-full object-cover"
                />
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    removeFile(index);
                  }}
                  className="absolute top-1 right-1 flex h-6 w-6 items-center justify-center rounded-full bg-black/70 text-white hover:bg-red-500 transition-colors"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
                <div className="absolute bottom-0 inset-x-0 bg-black/60 px-1.5 py-0.5 text-[10px] text-white truncate text-center">
                  {(item.file.size / (1024 * 1024)).toFixed(1)} MB
                </div>
              </div>
            ))}
          </div>

          <Button
            type="button"
            onClick={handleUploadClick}
            isLoading={isUploading}
            className="w-full"
            leftIcon={<UploadCloud className="h-4 w-4" />}
          >
            Tải lên {selectedFiles.length} ảnh đã chọn
          </Button>
        </div>
      )}
    </div>
  );
}
