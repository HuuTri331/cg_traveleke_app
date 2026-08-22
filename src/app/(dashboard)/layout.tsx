'use client';

import React, { useState } from 'react';
import { Sidebar } from '@/components/dashboard/Sidebar';
import { Header } from '@/components/dashboard/Header';
import { cn } from '@/lib/utils';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  return (
    <div className="min-h-screen bg-gray-50/70 dark:bg-gray-950 flex flex-col font-sans transition-colors duration-200">
      {/* Sidebar with smooth slide animation */}
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Main Content Area - shifts smoothly between 280px margin and 0px when sidebar toggles */}
      <div
        className={cn(
          'flex-1 flex flex-col transition-all duration-300 ease-in-out',
          sidebarOpen ? 'xl:ml-[280px]' : 'xl:ml-0'
        )}
      >
        {/* Sticky Header */}
        <Header onToggleSidebar={() => setSidebarOpen((prev) => !prev)} />

        {/* Page Content Container */}
        <main className="flex-1 p-4 sm:p-5 md:p-6 w-full animate-in fade-in duration-200">
          {children}
        </main>
      </div>
    </div>
  );
}
