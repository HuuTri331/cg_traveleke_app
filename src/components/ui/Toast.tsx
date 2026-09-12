'use client';

import React, { createContext, useContext, useState, useCallback } from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';
import { cn } from '@/lib/utils';

export type ToastType = 'success' | 'error' | 'info';

export interface ToastItem {
  id: string;
  type: ToastType;
  title: string;
  message?: string;
}

interface ToastContextValue {
  showToast: (title: string, message?: string, type?: ToastType) => void;
  success: (title: string, message?: string) => void;
  error: (title: string, message?: string) => void;
  info: (title: string, message?: string) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within ToastProvider');
  }
  return context;
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const showToast = useCallback(
    (title: string, message?: string, type: ToastType = 'info') => {
      const id = Math.random().toString(36).substring(2, 9);
      setToasts((prev) => [...prev, { id, title, message, type }]);

      setTimeout(() => {
        removeToast(id);
      }, 4000);
    },
    [removeToast]
  );

  const success = useCallback(
    (title: string, message?: string) => showToast(title, message, 'success'),
    [showToast]
  );
  const error = useCallback(
    (title: string, message?: string) => showToast(title, message, 'error'),
    [showToast]
  );
  const info = useCallback(
    (title: string, message?: string) => showToast(title, message, 'info'),
    [showToast]
  );

  return (
    <ToastContext.Provider value={{ showToast, success, error, info }}>
      {children}
      <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2.5 max-w-sm w-full pointer-events-none">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={cn(
              'pointer-events-auto flex items-start gap-3 rounded-xl border p-4 shadow-xl transition-all animate-in slide-in-from-bottom-5 duration-200 bg-white dark:bg-gray-900',
              toast.type === 'success' && 'border-green-500/30 text-green-700 dark:text-green-400',
              toast.type === 'error' && 'border-red-500/30 text-red-700 dark:text-red-400',
              toast.type === 'info' && 'border-brand-500/30 text-brand-700 dark:text-brand-400'
            )}
          >
            <span className="shrink-0 mt-0.5">
              {toast.type === 'success' && <CheckCircle2 className="h-5 w-5 text-green-500" />}
              {toast.type === 'error' && <AlertCircle className="h-5 w-5 text-red-500" />}
              {toast.type === 'info' && <Info className="h-5 w-5 text-brand-500" />}
            </span>
            <div className="flex-1 min-w-0">
              <h4 className="text-xs font-bold text-gray-900 dark:text-white leading-tight">
                {toast.title}
              </h4>
              {toast.message && (
                <p className="mt-0.5 text-xs text-gray-500 dark:text-gray-400">
                  {toast.message}
                </p>
              )}
            </div>
            <button
              onClick={() => removeToast(toast.id)}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}
