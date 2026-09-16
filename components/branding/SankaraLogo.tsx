'use client';

import React from 'react';
import Image from 'next/image';

export type SankaraLogoVariant = 'full' | 'compact' | 'white' | 'vertical' | 'horizontal';

interface SankaraLogoProps {
  variant?: SankaraLogoVariant;
  className?: string;
  subtitle?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  priority?: boolean;
  showEmblem?: boolean;
}

/**
 * Official Sankara Eye Foundation / Sankara Eye Hospital Brand Logo
 * Sourced directly from official web assets (sankaraeye.com)
 */
export const SankaraLogo: React.FC<SankaraLogoProps> = ({
  variant = 'full',
  className = '',
  subtitle,
  size = 'md',
  priority = false,
}) => {
  const isWhite = variant === 'white';

  const sizeClasses = {
    sm: 'h-8 sm:h-9',
    md: 'h-10 sm:h-12',
    lg: 'h-12 sm:h-14',
    xl: 'h-16 sm:h-20',
  }[size];

  // Official logo assets from sankaraeye.com
  const logoSrc = isWhite
    ? '/sankaraeye_white_logo.png'
    : '/sankaraeye_colored_logo.png';

  const imgWidth = isWhite ? 251 : 314;
  const imgHeight = 70;

  return (
    <div
      className={`inline-flex flex-col items-center select-none ${className}`}
      id="sankara-brand-container"
    >
      <div
        className="relative flex items-center justify-center"
        id="sankara-logo-image-wrapper"
      >
        <Image
          src={logoSrc}
          alt="Sankara Eye Foundation, India"
          width={imgWidth}
          height={imgHeight}
          priority={priority}
          className={`${sizeClasses} w-auto object-contain`}
          referrerPolicy="no-referrer"
          id="sankara-logo-img"
        />
      </div>

      {subtitle && (
        <span
          className={`text-[10px] sm:text-xs font-semibold tracking-wide mt-1 ${
            isWhite ? 'text-slate-300' : 'text-slate-500'
          }`}
          id="sankara-logo-subtitle"
        >
          {subtitle}
        </span>
      )}
    </div>
  );
};

