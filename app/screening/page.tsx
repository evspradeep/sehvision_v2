'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Header } from '@/components/branding/Header';
import { SankaraLogo } from '@/components/branding/SankaraLogo';
import { DEMO_STUDENTS } from '@/lib/mockData';
import { QrCode, ArrowRight, Sparkles, UserCheck, ShieldCheck } from 'lucide-react';
import { SupportedLanguage } from '@/lib/types';

export default function ScreeningLauncherPage() {
  const router = useRouter();
  const [customQrId, setCustomQrId] = useState('');
  const [language, setLanguage] = useState<SupportedLanguage>('en');

  const handleLaunch = (qrId: string) => {
    if (!qrId.trim()) return;
    router.push(`/screening/${qrId.trim()}`);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-between">
      <Header currentLanguage={language} onLanguageChange={setLanguage} />

      <main className="max-w-xl w-full mx-auto p-4 sm:p-6 my-auto">
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm text-center">
          <div className="w-14 h-14 mx-auto rounded-2xl bg-teal-50 text-teal-700 flex items-center justify-center mb-4 border border-teal-200">
            <QrCode className="w-7 h-7" />
          </div>

          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            Student Vision Screening
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 mt-1 max-w-sm mx-auto">
            Scan the QR code printed on the Sankara OP Card or select a student from the registered roster.
          </p>

          {/* Quick OP Card QR ID input */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleLaunch(customQrId || 'a8F7k29LmQ');
            }}
            className="mt-6 flex flex-col sm:flex-row gap-2"
          >
            <input
              type="text"
              value={customQrId}
              onChange={(e) => setCustomQrId(e.target.value)}
              placeholder="e.g. a8F7k29LmQ or OP-2026-8812"
              className="flex-1 px-4 py-3 bg-slate-50 border border-slate-300 rounded-xl text-sm font-mono focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
              id="input-qr-identifier"
            />
            <button
              type="submit"
              className="px-6 py-3 bg-teal-600 hover:bg-teal-700 text-white font-bold text-sm rounded-xl shadow-xs flex items-center justify-center gap-2 transition cursor-pointer"
              id="btn-launch-screening"
            >
              <span>Launch</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* Quick Demo Students list */}
          <div className="mt-8 text-left">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                Demo School Students:
              </span>
              <span className="text-[11px] text-teal-700 font-medium">Click to test flow</span>
            </div>

            <div className="space-y-2">
              {DEMO_STUDENTS.map((std) => (
                <button
                  key={std.qrId}
                  type="button"
                  onClick={() => handleLaunch(std.qrId)}
                  className="w-full p-3 rounded-xl bg-slate-50 hover:bg-teal-50 border border-slate-200 hover:border-teal-300 flex items-center justify-between text-left transition cursor-pointer group"
                  id={`btn-demo-std-${std.qrId}`}
                >
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-teal-100 text-teal-800 flex items-center justify-center font-bold text-xs">
                      {std.gradeClass.slice(-1)}
                    </div>
                    <div>
                      <div className="text-xs sm:text-sm font-bold text-slate-800 group-hover:text-teal-900">
                        {std.name}
                      </div>
                      <div className="text-[10px] font-mono text-slate-500">
                        OP: {std.opCardId} • {std.gradeClass} ({std.section})
                      </div>
                    </div>
                  </div>

                  <span className="text-xs font-bold text-teal-700 flex items-center gap-1 opacity-80 group-hover:opacity-100">
                    Screen <ArrowRight className="w-3.5 h-3.5" />
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-6 flex items-center justify-center gap-2 text-xs text-slate-500">
          <ShieldCheck className="w-4 h-4 text-teal-700" />
          <span>Sankara Eye Hospital • Non-diagnostic Preliminary Screening</span>
        </div>
      </main>

      <footer className="p-4 text-center text-xs text-slate-400">
        © 2026 Sankara Eye Hospital. All rights reserved.
      </footer>
    </div>
  );
}
