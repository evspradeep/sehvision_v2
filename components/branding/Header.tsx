'use client';

import React from 'react';
import Link from 'next/link';
import { SankaraLogo } from './SankaraLogo';
import { SupportedLanguage } from '@/lib/types';

interface HeaderProps {
  currentLanguage?: SupportedLanguage;
  onLanguageChange?: (lang: SupportedLanguage) => void;
  showAdminLink?: boolean;
  minimal?: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  minimal = false,
}) => {
  return (
    <header className="w-full bg-white/95 backdrop-blur-md border-b border-orange-100/80 sticky top-0 z-30" id="main-app-header">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 h-16 sm:h-18 flex items-center justify-between gap-3">
        {/* Sankara Eye Foundation, India Logo */}
        <Link href="/" className="hover:opacity-90 transition flex items-center py-1" id="header-home-link" aria-label="Sankara Eye Foundation, India Home">
          <SankaraLogo variant={minimal ? 'compact' : 'full'} size="md" />
        </Link>
      </div>
    </header>
  );
};
