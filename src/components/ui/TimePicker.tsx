'use client';

import React, { useRef } from 'react';
import { Clock } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface TimePickerProps {
  label?: string;
  value?: string;
  onChange: (val: string) => void;
  helperText?: string;
  className?: string;
}

export function TimePicker({
  label = 'Thời gian',
  value = '14:00:00',
  onChange,
  helperText,
  className,
}: TimePickerProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  // Extract HH:mm for input type="time"
  const timeValue = value ? value.substring(0, 5) : '14:00';

  const handleTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    if (val) {
      onChange(`${val}:00`);
    }
  };

  const openPicker = () => {
    try {
      if (inputRef.current) {
        if (typeof inputRef.current.showPicker === 'function') {
          inputRef.current.showPicker();
        } else {
          inputRef.current.focus();
        }
      }
    } catch (err) {
      inputRef.current?.focus();
    }
  };

  return (
    <div className={cn('w-full', className)}>
      {label && (
        <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5 uppercase tracking-wider">
          {label}
        </label>
      )}

      {/* Click anywhere on the box to automatically open the time picker */}
      <div
        onClick={openPicker}
        className="relative flex items-center w-full cursor-pointer group"
      >
        <span className="absolute left-3.5 text-brand-500 pointer-events-none group-hover:scale-110 transition-transform">
          <Clock className="h-4 w-4" />
        </span>

        <input
          ref={inputRef}
          type="time"
          value={timeValue}
          onChange={handleTimeChange}
          onClick={(e) => {
            e.stopPropagation();
            openPicker();
          }}
          className="w-full rounded-lg border border-gray-300 bg-white pl-10 pr-3.5 py-2.5 text-xs sm:text-sm font-semibold text-gray-800 transition-all focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 shadow-xs cursor-pointer hover:border-brand-400"
        />
      </div>

      {helperText && (
        <p className="mt-1 text-[11px] text-gray-500 dark:text-gray-400">{helperText}</p>
      )}
    </div>
  );
}
