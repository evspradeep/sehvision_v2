'use client';

import React from 'react';
import { TRANSLATIONS } from '@/lib/i18n';
import { SupportedLanguage } from '@/lib/types';
import { AudioVoiceButton } from '../ui/AudioVoiceButton';
import { ArrowRight, Smartphone, Eye, Ruler, ShieldAlert } from 'lucide-react';

interface StepInstructionsProps {
  language: SupportedLanguage;
  distanceCm: number;
  onContinue: () => void;
  onBack?: () => void;
}

export const StepInstructions: React.FC<StepInstructionsProps> = ({
  language,
  distanceCm,
  onContinue,
  onBack,
}) => {
  const t = TRANSLATIONS[language] || TRANSLATIONS.en;
  const distanceM = (distanceCm / 100).toFixed(1);
  const spokenText = `Instructions for vision screening: Number 1: Keep device kept at ${distanceM} meter distance from the eye. Number 2: Close the left eye first and do the vision test. Number 3: Next, close the right eye and do the vision test. Number 4: Identify the direction in which the “E” is facing and select the corresponding direction.`;

  return (
    <div className="w-full max-w-lg mx-auto p-5 sm:p-6" id="screening-step-instructions">
      <div className="text-center mb-5">
        <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
          Vision Screening Instructions
        </h2>
        <p className="text-sm sm:text-base text-slate-800 font-bold mt-1.5" id="instructions-subheading-step">
          Please follow the four rules below:
        </p>
      </div>

      {/* Visual Distance Illustration Card */}
      <div className="bg-white rounded-[2rem] p-6 sm:p-8 border border-orange-200 shadow-sm mb-6 flex flex-col items-center">
        {/* Vector Child <---> Screen Distance Diagram */}
        <div className="w-full max-w-xs flex items-center justify-between py-4 my-2 px-2 relative">
          {/* Person / Participant Icon */}
          <div className="flex flex-col items-center">
            <div className="w-14 h-14 rounded-2xl bg-orange-600 text-white flex items-center justify-center shadow-md shadow-orange-600/20">
              <span className="text-2xl" role="img" aria-label="person">
                👤
              </span>
            </div>
            <span className="text-[11px] font-bold text-slate-700 mt-1.5 uppercase">
              Person
            </span>
          </div>

          {/* Double-ended Distance Arrow with Indicator */}
          <div className="flex-1 flex flex-col items-center px-2">
            <div className="text-xs sm:text-sm font-extrabold text-orange-900 bg-orange-100 border border-orange-300 px-3 py-1 rounded-full shadow-2xs">
              {distanceM} Metre{distanceCm > 100 ? 's' : ''} ({distanceCm === 100 ? 'approx. 3.3 Feet' : '10 Feet'})
            </div>
            <div className="w-full flex items-center justify-center my-2 text-orange-600">
              <div className="w-2 h-2 rounded-full bg-orange-600" />
              <div className="flex-1 border-b-2 border-dashed border-orange-400" />
              <Ruler className="w-4 h-4 mx-1 text-orange-700" />
              <div className="flex-1 border-b-2 border-dashed border-orange-400" />
              <div className="w-2 h-2 rounded-full bg-orange-600" />
            </div>
            <span className="text-[10px] text-slate-500 font-medium">
              {distanceCm} cm distance
            </span>
          </div>

          {/* Device Icon */}
          <div className="flex flex-col items-center">
            <div className="w-14 h-14 rounded-2xl bg-amber-600 text-white flex items-center justify-center shadow-md shadow-amber-600/20">
              <Smartphone className="w-7 h-7" />
            </div>
            <span className="text-[11px] font-bold text-slate-700 mt-1.5 uppercase">
              Screen
            </span>
          </div>
        </div>

        {/* The 4 Specific Screening Instructions */}
        <div className="w-full mt-4 space-y-3 text-left text-xs sm:text-sm text-slate-700">
          <div className="flex items-center gap-3 p-3.5 rounded-xl bg-orange-50/60 border border-orange-100">
            <div className="w-7 h-7 rounded-full bg-orange-600 text-white font-extrabold flex items-center justify-center shrink-0 text-xs shadow-xs">
              1
            </div>
            <p className="font-extrabold text-slate-900 text-xs sm:text-sm">
              Keep device kept at {distanceM} meter distance from the eye
            </p>
          </div>

          <div className="flex items-center gap-3 p-3.5 rounded-xl bg-orange-50/60 border border-orange-100">
            <div className="w-7 h-7 rounded-full bg-orange-600 text-white font-extrabold flex items-center justify-center shrink-0 text-xs shadow-xs">
              2
            </div>
            <p className="font-extrabold text-slate-900 text-xs sm:text-sm">
              Close the left eye first and do the vision test
            </p>
          </div>

          <div className="flex items-center gap-3 p-3.5 rounded-xl bg-orange-50/60 border border-orange-100">
            <div className="w-7 h-7 rounded-full bg-orange-600 text-white font-extrabold flex items-center justify-center shrink-0 text-xs shadow-xs">
              3
            </div>
            <p className="font-extrabold text-slate-900 text-xs sm:text-sm">
              Next, close the right eye and do the vision test
            </p>
          </div>

          <div className="flex items-center gap-3 p-3.5 rounded-xl bg-orange-50/60 border border-orange-100">
            <div className="w-7 h-7 rounded-full bg-orange-600 text-white font-extrabold flex items-center justify-center shrink-0 text-xs shadow-xs">
              4
            </div>
            <p className="font-extrabold text-slate-900 text-xs sm:text-sm flex flex-wrap items-center gap-1.5">
              <span>Identify the direction in which the</span>
              <span className="inline-flex items-center justify-center w-7 h-7 rounded-md bg-slate-900 text-white font-black text-lg sm:text-xl shadow-xs border border-slate-700">
                E
              </span>
              <span>is facing and select the corresponding direction.</span>
            </p>
          </div>
        </div>

        <div className="mt-5 w-full flex justify-center">
          <AudioVoiceButton
            textToSpeak={spokenText}
            language={language}
            label={t.listenToInstructions}
          />
        </div>
      </div>

      <div className="flex items-center gap-3">
        {onBack && (
          <button
            type="button"
            onClick={onBack}
            className="py-3.5 px-5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-sm rounded-2xl transition cursor-pointer"
            id="btn-instructions-back"
          >
            {t.back}
          </button>
        )}

        <button
          type="button"
          onClick={onContinue}
          className="flex-1 py-4 px-6 bg-orange-600 hover:bg-orange-700 active:scale-98 text-white font-bold text-base sm:text-lg rounded-2xl shadow-md flex items-center justify-center gap-2 transition cursor-pointer"
          id="btn-instructions-next"
        >
          <span>{t.next}</span>
          <ArrowRight className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};
