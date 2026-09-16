'use client';

import React from 'react';
import { SankaraLogo } from '../branding/SankaraLogo';
import { AudioVoiceButton } from '../ui/AudioVoiceButton';
import { TRANSLATIONS } from '@/lib/i18n';
import { SupportedLanguage, StudentProfile } from '@/lib/types';
import { ArrowRight, Sparkles, ShieldCheck, QrCode } from 'lucide-react';

interface StepLandingProps {
  language: SupportedLanguage;
  student: StudentProfile;
  onStart: () => void;
}

export const StepLanding: React.FC<StepLandingProps> = ({
  language,
  student,
  onStart,
}) => {
  const t = TRANSLATIONS[language] || TRANSLATIONS.en;
  const spokenWelcome = `${t.hello}. ${t.letsCheckVision}. ${t.hospitalName}.`;

  return (
    <div className="w-full max-w-md mx-auto flex flex-col items-center text-center p-5 sm:p-6" id="screening-step-landing">
      {/* Brand Header */}
      <div className="mb-6 flex justify-center">
        <SankaraLogo variant="full" size="xl" priority />
      </div>

      {/* Child-Friendly Greeting Hero Card */}
      <div className="w-full bg-white rounded-[2rem] p-6 sm:p-8 border border-slate-200 shadow-sm relative overflow-hidden mb-6">
        {/* Playful Floating Sparkle Badges */}
        <div className="absolute -top-3 -right-3 w-14 h-14 rounded-full bg-teal-50 flex items-center justify-center text-teal-600 pointer-events-none">
          <Sparkles className="w-6 h-6 animate-pulse" />
        </div>

        <div className="w-20 h-20 mx-auto rounded-2xl bg-teal-600 text-white flex items-center justify-center shadow-lg shadow-teal-600/20 mb-5">
          <span className="text-4xl select-none" role="img" aria-label="waving hand">
            👋
          </span>
        </div>

        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight mb-2">
          {t.hello}
        </h1>

        <p className="text-base sm:text-lg font-semibold text-teal-800 mb-4">
          {t.letsCheckVision}
        </p>

        {/* Student OP Card Badge */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-50 border border-slate-200 shadow-2xs text-xs font-mono text-slate-700 mb-5">
          <QrCode className="w-3.5 h-3.5 text-teal-600" />
          <span>Card: {student.opCardId}</span>
          <span className="text-slate-300">|</span>
          <span className="font-sans font-medium text-slate-600">{student.gradeClass}</span>
        </div>

        {/* Listen Voice Instruction Button */}
        <div>
          <AudioVoiceButton
            textToSpeak={spokenWelcome}
            language={language}
            label={t.listenToInstructions}
          />
        </div>
      </div>

      {/* Big High-Contrast Start Button */}
      <button
        type="button"
        onClick={onStart}
        className="w-full py-4 px-6 bg-teal-600 hover:bg-teal-700 active:scale-98 text-white font-black text-lg sm:text-xl rounded-2xl shadow-md hover:shadow-lg shadow-teal-600/30 flex items-center justify-center gap-3 transition cursor-pointer select-none"
        id="btn-landing-start"
      >
        <span>{t.start}</span>
        <ArrowRight className="w-6 h-6 stroke-[1.75]" />
      </button>

      {/* Trust & Non-Diagnostic Disclaimer Note */}
      <div className="mt-6 flex items-center gap-2 text-xs text-slate-500 font-medium">
        <ShieldCheck className="w-4 h-4 text-teal-600 flex-shrink-0" />
        <span>Sankara Eye Hospital School Health Mission • Digital Screening</span>
      </div>
    </div>
  );
};
