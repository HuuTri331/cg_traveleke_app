'use client';

import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Star, Image as ImageIcon, Sparkles } from 'lucide-react';
import { getFullImageUrl } from '@/lib/utils';

export interface SliderImage {
  id?: string | number;
  imageUrl: string;
  caption?: string | null;
  isPrimary?: number | boolean;
}

export interface ImageSliderProps {
  images?: SliderImage[];
  fallbackUrl?: string | null;
  altTitle?: string;
  overlayBadge?: React.ReactNode;
  heightClass?: string;
}

export function ImageSlider({
  images = [],
  fallbackUrl,
  altTitle = 'Photo',
  overlayBadge,
  heightClass = 'h-80 sm:h-96 lg:h-[420px]',
}: ImageSliderProps) {
  // Build effective list of images
  const allImages: SliderImage[] = [];

  // Add gallery images
  if (images && images.length > 0) {
    // Sort so primary image is first
    const sorted = [...images].sort((a, b) => (b.isPrimary ? 1 : 0) - (a.isPrimary ? 1 : 0));
    allImages.push(...sorted);
  } else if (fallbackUrl) {
    allImages.push({ imageUrl: fallbackUrl, isPrimary: true });
  }

  const [currentIndex, setCurrentIndex] = useState(0);

  // Reset index when images list changes
  useEffect(() => {
    setCurrentIndex(0);
  }, [images.length, fallbackUrl]);

  if (allImages.length === 0) {
    return (
      <div
        className={`relative flex flex-col items-center justify-center rounded-2xl bg-gray-100 dark:bg-gray-800 ${heightClass} text-gray-400 border border-gray-200 dark:border-gray-700`}
      >
        <ImageIcon className="h-10 w-10 mb-2" />
        <p className="text-xs font-semibold">Chưa có hình ảnh nào trong album</p>
      </div>
    );
  }

  const currentImg = allImages[currentIndex];
  const isPrimary = Boolean(currentImg?.isPrimary);
  const imageUrl = getFullImageUrl(currentImg?.imageUrl);

  const prevSlide = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentIndex((prev) => (prev === 0 ? allImages.length - 1 : prev - 1));
  };

  const nextSlide = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentIndex((prev) => (prev === allImages.length - 1 ? 0 : prev + 1));
  };

  return (
    <div className="flex flex-col space-y-3 w-full">
      {/* Main Large Slide Container */}
      <div
        className={`relative w-full overflow-hidden rounded-2xl bg-gray-950 shadow-lg ${heightClass} group select-none flex items-center justify-center`}
      >
        {/* Ambient blurred background of the photo */}
        <div
          className="absolute inset-0 bg-cover bg-center filter blur-xl opacity-30 scale-110"
          style={{ backgroundImage: `url(${imageUrl})` }}
        />

        {/* Foreground full photo - 100% visible without cropping */}
        <img
          key={currentIndex}
          src={imageUrl}
          alt={currentImg?.caption || altTitle}
          className="relative z-0 max-h-full max-w-full object-contain animate-in fade-in zoom-in-95 duration-200"
          onError={(e) => {
            (e.target as HTMLImageElement).src =
              'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1000&q=80';
          }}
        />

        {/* Custom Overlay Badge (e.g. Status Pill) */}
        {overlayBadge && <div className="absolute top-3 right-3 z-10">{overlayBadge}</div>}

        {/* Primary Cover Badge */}
        {isPrimary && (
          <div className="absolute top-3 left-3 z-10 flex items-center gap-1 rounded-full bg-brand-500/90 backdrop-blur-xs px-2.5 py-1 text-[11px] font-bold text-white shadow-md">
            <Star className="h-3.5 w-3.5 fill-white" />
            <span>Ảnh bìa chính</span>
          </div>
        )}

        {/* Navigation Arrows (Only shown when > 1 image) */}
        {allImages.length > 1 && (
          <>
            <button
              type="button"
              onClick={prevSlide}
              className="absolute left-3 top-1/2 -translate-y-1/2 flex h-10 w-10 items-center justify-center rounded-full bg-black/60 text-white backdrop-blur-xs hover:bg-brand-500 transition-all opacity-85 hover:opacity-100 hover:scale-110 z-10 cursor-pointer shadow-xl border border-white/10"
              title="Ảnh trước"
            >
              <ChevronLeft className="h-6 w-6" />
            </button>

            <button
              type="button"
              onClick={nextSlide}
              className="absolute right-3 top-1/2 -translate-y-1/2 flex h-10 w-10 items-center justify-center rounded-full bg-black/60 text-white backdrop-blur-xs hover:bg-brand-500 transition-all opacity-85 hover:opacity-100 hover:scale-110 z-10 cursor-pointer shadow-xl border border-white/10"
              title="Ảnh tiếp theo"
            >
              <ChevronRight className="h-6 w-6" />
            </button>
          </>
        )}

        {/* Counter Badge at bottom-right */}
        {allImages.length > 1 && (
          <div className="absolute bottom-3 right-3 z-10 rounded-xl bg-black/75 backdrop-blur-xs px-3 py-1 text-xs font-bold text-white shadow-md">
            {currentIndex + 1} / {allImages.length} ảnh
          </div>
        )}
      </div>

      {/* Thumbnail Strip with Horizontal Scroll */}
      {allImages.length > 1 && (
        <div className="flex items-center gap-2 overflow-x-auto py-1 px-0.5 custom-scrollbar">
          {allImages.map((img, idx) => {
            const active = idx === currentIndex;
            const thumbUrl = getFullImageUrl(img.imageUrl);
            return (
              <button
                key={idx}
                type="button"
                onClick={() => setCurrentIndex(idx)}
                className={`relative h-16 w-24 shrink-0 rounded-xl overflow-hidden border-2 bg-gray-900 transition-all cursor-pointer ${
                  active
                    ? 'border-brand-500 ring-2 ring-brand-500/40 scale-105 shadow-md opacity-100'
                    : 'border-transparent opacity-60 hover:opacity-100 hover:scale-102'
                }`}
              >
                <img
                  src={thumbUrl}
                  alt={`Thumbnail ${idx + 1}`}
                  className="h-full w-full object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src =
                      'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=200&q=80';
                  }}
                />
                {Boolean(img.isPrimary) && (
                  <div className="absolute bottom-1 right-1 rounded-full bg-brand-500 p-0.5 text-white shadow-xs">
                    <Star className="h-2.5 w-2.5 fill-white" />
                  </div>
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
