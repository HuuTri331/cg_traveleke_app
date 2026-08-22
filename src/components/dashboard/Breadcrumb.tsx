'use client';

import React from 'react';
import Link from 'next/link';
import { ChevronRight, Home } from 'lucide-react';

export interface BreadcrumbItem {
  label: string;
  href?: string;
}

export interface BreadcrumbProps {
  pageTitle: string;
  items?: BreadcrumbItem[];
}

export function Breadcrumb({ pageTitle, items = [] }: BreadcrumbProps) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
      <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white tracking-tight">
        {pageTitle}
      </h2>
      <nav aria-label="Breadcrumb">
        <ol className="flex items-center gap-1.5 text-xs font-medium">
          <li>
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-1 text-gray-500 hover:text-brand-500 dark:text-gray-400 dark:hover:text-brand-400 transition-colors"
            >
              <Home className="h-3.5 w-3.5" />
              <span>Trang chủ</span>
            </Link>
          </li>
          {items.map((item, index) => (
            <li key={index} className="flex items-center gap-1.5">
              <ChevronRight className="h-3.5 w-3.5 text-gray-400" />
              {item.href ? (
                <Link
                  href={item.href}
                  className="text-gray-500 hover:text-brand-500 dark:text-gray-400 dark:hover:text-brand-400 transition-colors"
                >
                  {item.label}
                </Link>
              ) : (
                <span className="text-gray-800 dark:text-white/90 font-semibold">
                  {item.label}
                </span>
              )}
            </li>
          ))}
          {items.length === 0 && (
            <li className="flex items-center gap-1.5">
              <ChevronRight className="h-3.5 w-3.5 text-gray-400" />
              <span className="text-gray-800 dark:text-white/90 font-semibold">
                {pageTitle}
              </span>
            </li>
          )}
        </ol>
      </nav>
    </div>
  );
}
