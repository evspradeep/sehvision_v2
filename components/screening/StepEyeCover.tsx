'use client';

import React from 'react';
import { EyeTested, SupportedLanguage } from '@/lib/types';
import { TRANSLATIONS } from '@/lib/i18n';
import { AudioVoiceButton } from '../ui/AudioVoiceButton';
import { ArrowRight, ShieldAlert, HeartHandshake } from 'lucide-react';

interface StepEyeCoverProps {
  eyeToTest: EyeTested;
  language: SupportedLanguage;
  onReady: () => void;
}

export const StepEyeCover: React.FC<StepEyeCoverProps> = ({
  eyeToTest,
  language,
  onReady,
}) => {
  const t = TRANSLATIONS[language] || TRANSLATIONS.en;

  const isRightEye = eyeToTest === 'right';
  const isLeftEye = eyeToTest === 'left';
  const isBinocular = eyeToTest === 'binocular';

  const heading = isRightEye
    ? t.coverLeftEye
    : isLeftEye
    ? t.coverRightEye
    : t.bothEyesOpen;

  const description = isRightEye
    ? t.coverLeftEyeDesc
    : isLeftEye
    ? t.coverRightEyeDesc
    : t.bothEyesOpenDesc;

  const spokenText = `${heading}. ${description}. ${t.gentleReminder}`;

  return (
    <div className="w-full max-w-md mx-auto p-4 sm:p-6 flex flex-col items-center text-center select-none" id="screening-step-eye-cover">
      {/* Test Identification Tag */}
      <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-teal-100 text-teal-800 text-xs font-bold uppercase tracking-wider mb-3">
        <span>Step {isRightEye ? '1: Right Eye' : isLeftEye ? '2: Left Eye' : '3: Both Eyes'}</span>
      </div>

      <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight mb-2">
        {heading}
      </h2>
      <p className="text-xs sm:text-sm text-slate-600 mb-4 max-w-sm">
        {description}
      </p>

      {/* Voice Button */}
      <div className="mb-5">
        <AudioVoiceButton
          textToSpeak={spokenText}
          language={language}
          label={t.listenToInstructions}
        />
      </div>

      {/* Child Eye Cover Vector Graphic */}
      <div className="w-full bg-white rounded-[2rem] p-6 sm:p-8 border border-slate-200 shadow-sm flex flex-col items-center mb-5">
        <div className="relative w-40 h-32 flex items-center justify-center my-2">
          {/* Face Outline */}
          <div className="w-32 h-28 rounded-[2rem] bg-amber-100/90 border-2 border-amber-300 flex items-center justify-around px-3 relative shadow-sm">
            {/* Left Eye Representation (Viewer's Left = Subject's Right) */}
            <div className="flex flex-col items-center">
              {isRightEye ? (
                /* Testing Right Eye -> Right eye stays OPEN */
                <div className="w-9 h-9 rounded-full bg-white border-2 border-slate-700 flex items-center justify-center shadow-xs">
                  <div className="w-4 h-4 rounded-full bg-sky-600 flex items-center justify-center">
                    <div className="w-1.5 h-1.5 rounded-full bg-white" />
                  </div>
                </div>
              ) : isLeftEye ? (
                /* Testing Left Eye -> Right eye is COVERED */
                <div className="w-10 h-10 rounded-full bg-teal-600 text-white flex items-center justify-center shadow-md text-xs font-black">
                  ✋
                </div>
              ) : (
                /* Binocular -> OPEN */
                <div className="w-9 h-9 rounded-full bg-white border-2 border-slate-700 flex items-center justify-center">
                  <div className="w-4 h-4 rounded-full bg-sky-600" />
                </div>
              )}
              <span className="text-[10px] font-bold text-slate-600 mt-1 uppercase">
                Right Eye
              </span>
            </div>

            {/* Nose bridge */}
            <div className="w-1.5 h-4 rounded-full bg-amber-300/80" />

            {/* Right Eye Representation (Viewer's Right = Subject's Left) */}
            <div className="flex flex-col items-center">
              {isRightEye ? (
                /* Testing Right Eye -> Left eye is COVERED */
                <div className="w-10 h-10 rounded-full bg-teal-600 text-white flex items-center justify-center shadow-md text-xs font-black">
                  ✋
                </div>
              ) : isLeftEye ? (
                /* Testing Left Eye -> Left eye stays OPEN */
                <div className="w-9 h-9 rounded-full bg-white border-2 border-slate-700 flex items-center justify-center shadow-xs">
                  <div className="w-4 h-4 rounded-full bg-sky-600 flex items-center justify-center">
                    <div className="w-1.5 h-1.5 rounded-full bg-white" />
                  </div>
                </div>
              ) : (
                /* Binocular -> OPEN */
                <div className="w-9 h-9 rounded-full bg-white border-2 border-slate-700 flex items-center justify-center">
                  <div className="w-4 h-4 rounded-full bg-sky-600" />
                </div>
              )}
              <span className="text-[10px] font-bold text-slate-600 mt-1 uppercase">
                Left Eye
              </span>
            </div>

            {/* Friendly Smile */}
            <div className="absolute bottom-2 left-1/2 -translate-x-1/2 w-8 h-2.5 border-b-2 border-amber-600 rounded-b-full" />
          </div>
        </div>

        {/* Gentle reminder alert */}
        <div className="flex items-center gap-2 p-3 rounded-2xl bg-amber-50 border border-amber-200 text-xs text-amber-900 text-left mt-2">
          <HeartHandshake className="w-4 h-4 text-amber-700 flex-shrink-0" />
          <span className="leading-snug">{t.gentleReminder}</span>
        </div>
      </div>

      {/* Start Button */}
      <button
        type="button"
        onClick={onReady}
        className="w-full py-4 px-6 bg-teal-600 hover:bg-teal-700 active:scale-98 text-white font-black text-base sm:text-lg rounded-2xl shadow-md flex items-center justify-center gap-2 transition cursor-pointer"
        id="btn-eye-ready"
      >
        <span>I am Ready! Start Test</span>
        <ArrowRight className="w-5 h-5 stroke-[1.75]" />
      </button>
    </div>
  );
};
