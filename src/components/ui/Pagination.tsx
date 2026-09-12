'use client';

import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { PaginationMeta } from '@/types/common';
import { cn } from '@/lib/utils';

export interface PaginationProps {
  meta: PaginationMeta;
  onPageChange: (page: number) => void;
}

export function Pagination({ meta, onPageChange }: PaginationProps) {
  const { page, perPage, total, totalPages } = meta;

  const startItem = total === 0 ? 0 : (page - 1) * perPage + 1;
  const endItem = Math.min(page * perPage, total);

  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    if (totalPages <= 5) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      if (page <= 3) {
        pages.push(1, 2, 3, 4, '...', totalPages);
      } else if (page >= totalPages - 2) {
        pages.push(1, '...', totalPages - 3, totalPages - 2, totalPages - 1, totalPages);
      } else {
        pages.push(1, '...', page - 1, page, page + 1, '...', totalPages);
      }
    }
    return pages;
  };

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-gray-200 px-5 py-4 dark:border-gray-800">
      {/* Items info */}
      <div className="text-xs text-gray-500 dark:text-gray-400 font-medium">
        Hiển thị <span className="font-semibold text-gray-800 dark:text-white/90">{startItem}</span> -{' '}
        <span className="font-semibold text-gray-800 dark:text-white/90">{endItem}</span> trong tổng số{' '}
        <span className="font-semibold text-gray-800 dark:text-white/90">{total}</span> mục
      </div>

      {/* Pagination controls */}
      <div className="flex items-center gap-1.5">
        <button
          onClick={() => onPageChange(page - 1)}
          disabled={page <= 1}
          className="flex h-9 w-9 items-center justify-center rounded-lg border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-750 transition-colors shadow-xs"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>

        <div className="flex items-center gap-1">
          {getPageNumbers().map((p, index) =>
            typeof p === 'number' ? (
              <button
                key={index}
                onClick={() => onPageChange(p)}
                className={cn(
                  'flex h-9 min-w-9 items-center justify-center rounded-lg px-2.5 text-xs font-semibold transition-colors shadow-xs cursor-pointer',
                  p === page
                    ? 'bg-brand-500 text-white shadow-brand-500/20'
                    : 'border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-750'
                )}
              >
                {p}
              </button>
            ) : (
              <span
                key={index}
                className="flex h-9 w-7 items-center justify-center text-xs text-gray-400 dark:text-gray-600"
              >
                ...
              </span>
            )
          )}
        </div>

        <button
          onClick={() => onPageChange(page + 1)}
          disabled={page >= totalPages || totalPages === 0}
          className="flex h-9 w-9 items-center justify-center rounded-lg border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-750 transition-colors shadow-xs"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
