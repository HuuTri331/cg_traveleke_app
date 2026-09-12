import React, { InputHTMLAttributes, forwardRef } from 'react';
import { cn } from '@/lib/utils';

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  { label, error, helperText, leftIcon, rightIcon, className, ...props },
  ref
) {
  return (
    <div className="w-full">
      {label && (
        <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5 uppercase tracking-wider">
          {label}
        </label>
      )}
      <div className="relative flex items-center">
        {leftIcon && (
          <span className="absolute left-3.5 text-gray-400 dark:text-gray-500 pointer-events-none">
            {leftIcon}
          </span>
        )}
        <input
          ref={ref}
          className={cn(
            'w-full rounded-lg border bg-white px-3.5 py-2.5 text-sm text-gray-800 transition-colors placeholder:text-gray-400 focus:outline-none dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-gray-500 shadow-xs',
            leftIcon ? 'pl-10' : '',
            rightIcon ? 'pr-10' : '',
            error
              ? 'border-red-500 focus:border-red-500 focus:ring-2 focus:ring-red-500/20'
              : 'border-gray-300 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 dark:border-gray-700 dark:focus:border-brand-500',
            className
          )}
          {...props}
        />
        {rightIcon && (
          <span className="absolute right-3.5 text-gray-400 dark:text-gray-500">
            {rightIcon}
          </span>
        )}
      </div>
      {error ? (
        <p className="mt-1 text-xs text-red-500">{error}</p>
      ) : helperText ? (
        <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">{helperText}</p>
      ) : null}
    </div>
  );
});
