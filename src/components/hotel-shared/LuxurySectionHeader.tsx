'use client';

import React from 'react';

interface LuxurySectionHeaderProps {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  align?: 'left' | 'center';
  className?: string;
  action?: React.ReactNode;
}

export default function LuxurySectionHeader({
  eyebrow,
  title,
  subtitle,
  align = 'center',
  className = '',
  action,
}: LuxurySectionHeaderProps) {
  const isCenter = align === 'center';

  return (
    <div
      className={`mb-8 md:mb-12 ${
        isCenter ? 'text-center max-w-3xl mx-auto' : 'flex flex-col md:flex-row md:items-end md:justify-between'
      } ${className}`}
    >
      <div className={isCenter ? 'space-y-2.5' : 'space-y-2'}>
        {eyebrow && (
          <p className="text-xs uppercase tracking-[0.2em] font-bold text-[#E8A700] select-none">
            {eyebrow}
          </p>
        )}
        <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-[#1E4752] tracking-tight leading-tight">
          {title}
        </h2>
        {subtitle && (
          <p className="text-sm sm:text-base text-[#1E4752]/70 leading-relaxed font-normal">
            {subtitle}
          </p>
        )}
      </div>
      {action && !isCenter && <div className="mt-4 md:mt-0 shrink-0">{action}</div>}
    </div>
  );
}
