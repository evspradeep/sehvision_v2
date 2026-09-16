import React from 'react';
import Link from 'next/link';
import { Header } from '@/components/branding/Header';
import { ArrowLeft, Home } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#FFFDF9] flex flex-col justify-between" id="not-found-page">
      <Header />
      <main className="max-w-md w-full mx-auto p-6 my-auto text-center">
        <div className="w-16 h-16 bg-orange-50 text-orange-600 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-orange-200">
          <span className="text-2xl font-black">404</span>
        </div>
        <h1 className="text-2xl font-black text-slate-900 tracking-tight mb-2">
          Page Not Found
        </h1>
        <p className="text-sm text-slate-600 mb-6">
          The vision screening page or resource you are looking for does not exist or has been moved.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href="/"
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-orange-600 hover:bg-orange-700 text-white text-sm font-bold rounded-xl transition shadow-xs"
            id="not-found-home-btn"
          >
            <Home className="w-4 h-4" />
            <span>Return to Screening</span>
          </Link>
          <Link
            href="/admin"
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-bold rounded-xl transition"
            id="not-found-admin-btn"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Go to Admin</span>
          </Link>
        </div>
      </main>
      <footer className="p-4 text-center text-xs text-slate-400">
        © 2026 Sankara Eye Hospital. All rights reserved.
      </footer>
    </div>
  );
}
