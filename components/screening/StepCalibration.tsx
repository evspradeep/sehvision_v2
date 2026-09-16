'use client';

import React, { useState } from 'react';
import { CalibrationBox } from '../optotype/CalibrationBox';
import { TumblingE } from '../optotype/TumblingE';
import { CalibrationData, SupportedLanguage } from '@/lib/types';
import { TRANSLATIONS } from '@/lib/i18n';
import { AudioVoiceButton } from '../ui/AudioVoiceButton';
import { CheckCircle, Sparkles, ArrowRight } from 'lucide-react';

interface StepCalibrationProps {
  language: SupportedLanguage;
  onCalibrationConfirmed: (calibration: CalibrationData) => void;
  onBack?: () => void;
}

export const StepCalibration: React.FC<StepCalibrationProps> = ({
  language,
  onCalibrationConfirmed,
  onBack,
}) => {
  const t = TRANSLATIONS[language] || TRANSLATIONS.en;
  const [confirmedCalibration, setConfirmedCalibration] = useState<CalibrationData | null>(null);

  const handleBoxComplete = (data: CalibrationData) => {
    setConfirmedCalibration(data);
  };

  const handleProceedToPractice = () => {
    if (confirmedCalibration) {
      onCalibrationConfirmed(confirmedCalibration);
    }
  };

  const spokenText = `${t.calibrationTitle}. ${t.calibrationDesc}. ${t.calibrationPrompt}`;

  return (
    <div className="w-full max-w-xl mx-auto p-4 sm:p-6" id="screening-step-calibration">
      <div className="text-center mb-4">
        <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
          {t.calibrationTitle}
        </h2>
        <p className="text-xs sm:text-sm text-slate-600 mt-1 max-w-md mx-auto">
          {t.calibrationDesc}
        </p>
        <div className="mt-2.5">
          <AudioVoiceButton
            textToSpeak={spokenText}
            language={language}
            label={t.listenToInstructions}
          />
        </div>
      </div>

      {!confirmedCalibration ? (
        <CalibrationBox
          onComplete={handleBoxComplete}
          onCancel={onBack}
        />
      ) : (
        /* Calibration Confirmation & Optotype Verification Preview */
        <div className="bg-white rounded-[2rem] p-6 sm:p-8 border border-teal-200 shadow-sm text-center space-y-6 animate-fadeIn">
          <div className="w-16 h-16 mx-auto rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center">
            <CheckCircle className="w-10 h-10 stroke-[2.5]" />
          </div>

          <div>
            <h3 className="text-xl font-black text-slate-900">
              Calibration Verified!
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 mt-1">
              Screen factor: <span className="font-mono font-bold text-teal-700">{confirmedCalibration.pxPerMm.toFixed(3)} px/mm</span>
            </p>
          </div>

          {/* Calibrated Physical E Preview */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col items-center">
            <span className="text-xs font-bold text-slate-700 mb-3">
              Standard Physical Reference E (1.4 cm × 1.4 cm)
            </span>
            <div className="p-6 bg-white rounded-xl shadow-xs border border-slate-200 flex items-center justify-center">
              <TumblingE
                sizeMm={14.0}
                pxPerMm={confirmedCalibration.pxPerMm}
                orientation="right"
                showDebugBounds={true}
              />
            </div>
            <p className="text-[11px] text-slate-500 font-mono mt-3">
              Target: 14.00 mm • Rendered: {Math.round(14.0 * confirmedCalibration.pxPerMm)} px
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <button
              type="button"
              onClick={() => setConfirmedCalibration(null)}
              className="w-full sm:w-auto px-5 py-3 text-xs font-bold text-slate-600 hover:text-slate-800 bg-slate-100 rounded-xl transition cursor-pointer"
            >
              Re-Adjust Calibration
            </button>

            <button
              type="button"
              onClick={handleProceedToPractice}
              className="w-full sm:w-auto px-8 py-3.5 bg-teal-600 hover:bg-teal-700 text-white font-black text-sm sm:text-base rounded-xl shadow-md flex items-center justify-center gap-2 transition cursor-pointer active:scale-98"
              id="btn-proceed-to-practice"
            >
              <Sparkles className="w-4 h-4" />
              <span>Let’s Try Practice!</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
