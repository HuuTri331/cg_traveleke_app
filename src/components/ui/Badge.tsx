import React from 'react';
import { cn } from '@/lib/utils';

export interface BadgeProps {
  children: React.ReactNode;
  variant?: 'success' | 'warning' | 'danger' | 'info' | 'neutral' | 'brand';
  size?: 'sm' | 'md';
  className?: string;
  dot?: boolean;
}

export function Badge({
  children,
  variant = 'neutral',
  size = 'md',
  className,
  dot = false,
}: BadgeProps) {
  const variantStyles = {
    success:
      'bg-green-50 text-green-700 dark:bg-green-500/15 dark:text-green-400 border border-green-200/50 dark:border-green-500/20',
    warning:
      'bg-amber-50 text-amber-700 dark:bg-amber-500/15 dark:text-amber-400 border border-amber-200/50 dark:border-amber-500/20',
    danger:
      'bg-red-50 text-red-700 dark:bg-red-500/15 dark:text-red-400 border border-red-200/50 dark:border-red-500/20',
    info: 'bg-sky-50 text-sky-700 dark:bg-sky-500/15 dark:text-sky-400 border border-sky-200/50 dark:border-sky-500/20',
    brand:
      'bg-brand-50 text-brand-700 dark:bg-brand-500/15 dark:text-brand-400 border border-brand-200/50 dark:border-brand-500/20',
    neutral:
      'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300 border border-gray-200/50 dark:border-gray-700/50',
  };

  const dotStyles = {
    success: 'bg-green-500',
    warning: 'bg-amber-500',
    danger: 'bg-red-500',
    info: 'bg-sky-500',
    brand: 'bg-brand-500',
    neutral: 'bg-gray-400',
  };

  const sizeStyles = {
    sm: 'px-2 py-0.5 text-xs font-medium rounded-md gap-1',
    md: 'px-2.5 py-1 text-xs font-semibold rounded-md gap-1.5',
  };

  return (
    <span
      className={cn(
        'inline-flex items-center',
        variantStyles[variant],
        sizeStyles[size],
        className
      )}
    >
      {dot && <span className={cn('h-1.5 w-1.5 rounded-full', dotStyles[variant])} />}
      {children}
    </span>
  );
}
