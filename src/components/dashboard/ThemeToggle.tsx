'use client';

import React, { useEffect, useState } from 'react';
import { Sun, Moon } from 'lucide-react';

export function ThemeToggle() {
  const [isDark, setIsDark] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const savedTheme = localStorage.getItem('traveleke-theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    if (savedTheme === 'dark' || (!savedTheme && prefersDark)) {
      setIsDark(true);
      document.documentElement.classList.add('dark');
    } else {
      setIsDark(false);
      document.documentElement.classList.remove('dark');
    }
  }, []);

  const toggleTheme = () => {
    if (isDark) {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('traveleke-theme', 'light');
      setIsDark(false);
    } else {
      document.documentElement.classList.add('dark');
      localStorage.setItem('traveleke-theme', 'dark');
      setIsDark(true);
    }
  };

  if (!mounted) {
    return (
      <div className="h-11 w-11 rounded-full border border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900" />
    );
  }

  return (
    <button
      onClick={toggleTheme}
      aria-label="Chuyển chế độ giao diện"
      className="relative flex h-11 w-11 items-center justify-center rounded-full border border-gray-200 bg-white text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-800 dark:border-gray-800 dark:bg-gray-900 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-white cursor-pointer shadow-xs"
    >
      {isDark ? (
        <Sun className="h-5 w-5 text-amber-400 animate-in spin-in-180 duration-200" />
      ) : (
        <Moon className="h-5 w-5 text-gray-600 animate-in spin-in-180 duration-200" />
      )}
    </button>
  );
}
