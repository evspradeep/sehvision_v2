'use client';

import React from 'react';
import { SUPPORTED_LANGUAGES, TRANSLATIONS } from '@/lib/i18n';
import { SupportedLanguage } from '@/lib/types';
import { Check, Globe2, ArrowRight } from 'lucide-react';
import { AudioVoiceButton } from '../ui/AudioVoiceButton';

interface StepLanguageProps {
  selectedLanguage: SupportedLanguage;
  onSelectLanguage: (lang: SupportedLanguage) => void;
  onContinue: () => void;
}

export const StepLanguage: React.FC<StepLanguageProps> = ({
  selectedLanguage,
  onSelectLanguage,
  onContinue,
}) => {
  const t = TRANSLATIONS[selectedLanguage] || TRANSLATIONS.en;

  return (
    <div className="w-full max-w-md mx-auto bg-white rounded-[2rem] p-6 sm:p-8 border border-slate-200 shadow-sm" id="screening-step-language">
      <div className="text-center mb-6">
        <div className="w-12 h-12 mx-auto rounded-2xl bg-teal-50 text-teal-700 flex items-center justify-center mb-3">
          <Globe2 className="w-6 h-6" />
        </div>
        <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
          Choose Your Language
        </h2>
        <p className="text-xs sm:text-sm text-slate-600 mt-1">
          భాషను ఎంచుకోండి / अपनी भाषा चुनें / மொழியைத் தேர்ந்தெடுக்கவும்
        </p>
      </div>

      {/* Language Grid */}
      <div className="space-y-2.5 mb-6">
        {SUPPORTED_LANGUAGES.map((lang) => {
          const isSelected = selectedLanguage === lang.code;
          return (
            <button
              key={lang.code}
              type="button"
              onClick={() => onSelectLanguage(lang.code)}
              className={`w-full p-4 rounded-2xl flex items-center justify-between transition cursor-pointer select-none border-2 text-left active:scale-98 ${
                isSelected
                  ? 'bg-teal-50 border-teal-600 shadow-sm ring-2 ring-teal-200'
                  : 'bg-white hover:bg-slate-50 border-slate-200 hover:border-teal-400'
              }`}
              id={`lang-option-${lang.code}`}
            >
              <div>
                <div className="text-base sm:text-lg font-bold text-slate-900 leading-tight">
                  {lang.nativeName}
                </div>
                <div className="text-xs font-medium text-slate-500">
                  {lang.name}
                </div>
              </div>

              <div
                className={`w-7 h-7 rounded-full flex items-center justify-center transition ${
                  isSelected ? 'bg-teal-600 text-white' : 'border border-slate-300 text-transparent'
                }`}
              >
                <Check className="w-4 h-4 stroke-[3]" />
              </div>
            </button>
          );
        })}
      </div>

      <div className="flex flex-col items-center gap-3">
        <AudioVoiceButton
          textToSpeak={`${t.hello}. ${t.letsCheckVision}`}
          language={selectedLanguage}
          label="Listen in selected language"
        />

        <button
          type="button"
          onClick={onContinue}
          className="w-full py-4 px-6 bg-teal-600 hover:bg-teal-700 active:scale-98 text-white font-bold text-base sm:text-lg rounded-2xl shadow-md flex items-center justify-center gap-2 transition cursor-pointer"
          id="btn-confirm-language"
        >
          <span>{t.next}</span>
          <ArrowRight className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};
