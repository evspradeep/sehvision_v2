'use client';

import React, { useState } from 'react';
import { TumblingE } from '../optotype/TumblingE';
import { DirectionPad } from '../ui/DirectionPad';
import { AudioVoiceButton } from '../ui/AudioVoiceButton';
import { OptotypeOrientation, SupportedLanguage, CalibrationData } from '@/lib/types';
import { TRANSLATIONS } from '@/lib/i18n';
import { playChime } from '@/lib/audioService';
import { Sparkles, ArrowRight, RotateCcw, CheckCircle2 } from 'lucide-react';

interface StepPracticeProps {
  language: SupportedLanguage;
  calibration: CalibrationData;
  onPracticeComplete: () => void;
}

const PRACTICE_ORIENTATIONS: OptotypeOrientation[] = ['right', 'up', 'down', 'left'];

export const StepPractice: React.FC<StepPracticeProps> = ({
  language,
  calibration,
  onPracticeComplete,
}) => {
  const t = TRANSLATIONS[language] || TRANSLATIONS.en;

  const [stepIndex, setStepIndex] = useState(0);
  const [feedback, setFeedback] = useState<'idle' | 'correct' | 'tryAgain'>('idle');
  const [consecutiveCorrect, setConsecutiveCorrect] = useState(0);

  const currentOrientation = PRACTICE_ORIENTATIONS[stepIndex % PRACTICE_ORIENTATIONS.length];
  // Generous large size for practice confidence: ~20mm (2 cm)
  const practiceSizeMm = 20.0;

  const handleSelectAnswer = (selected: OptotypeOrientation) => {
    if (selected === currentOrientation) {
      // Correct answer
      playChime('correct');
      setFeedback('correct');
      const newScore = consecutiveCorrect + 1;
      setConsecutiveCorrect(newScore);

      // Advance after a brief delay
      setTimeout(() => {
        if (newScore >= 2) {
          // Passed practice!
        } else {
          setStepIndex(prev => prev + 1);
          setFeedback('idle');
        }
      }, 700);
    } else {
      // Try again
      playChime('tryAgain');
      setFeedback('tryAgain');
      setTimeout(() => {
        setFeedback('idle');
      }, 1000);
    }
  };

  const spokenText = `${t.practiceTitle}. ${t.practiceSubtitle}. ${t.whichWayFacing}`;

  return (
    <div className="w-full max-w-md mx-auto p-4 sm:p-6 flex flex-col items-center select-none" id="screening-step-practice">
      {/* Practice Header Banner */}
      <div className="w-full text-center mb-4">
        <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-amber-100 border border-amber-300 text-amber-900 text-xs font-bold uppercase tracking-wider mb-2">
          <Sparkles className="w-3.5 h-3.5 text-amber-600" />
          <span>Practice Round (Not Scored)</span>
        </div>

        <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
          {t.practiceTitle}
        </h2>
        <p className="text-xs sm:text-sm text-slate-600 mt-0.5">
          {t.practiceSubtitle}
        </p>

        <div className="mt-2">
          <AudioVoiceButton
            textToSpeak={spokenText}
            language={language}
            label={t.listenToInstructions}
          />
        </div>
      </div>

      {consecutiveCorrect >= 2 ? (
        /* Practice Graduation Screen */
        <div className="w-full bg-white rounded-[2rem] p-6 sm:p-8 border border-emerald-200 shadow-sm text-center space-y-5 animate-fadeIn my-auto">
          <div className="w-16 h-16 mx-auto rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center">
            <CheckCircle2 className="w-10 h-10 stroke-[2.5]" />
          </div>

          <div>
            <h3 className="text-2xl font-black text-slate-900">
              {t.practiceSuccess}
            </h3>
            <p className="text-sm text-slate-600 mt-1">
              You know exactly what to do! Now let’s begin the eye screening.
            </p>
          </div>

          <button
            type="button"
            onClick={onPracticeComplete}
            className="w-full py-4 px-6 bg-teal-600 hover:bg-teal-700 active:scale-98 text-white font-black text-base sm:text-lg rounded-2xl shadow-md flex items-center justify-center gap-2 transition cursor-pointer"
            id="btn-start-official-test"
          >
            <span>Start Official Vision Test</span>
            <ArrowRight className="w-5 h-5 stroke-[1.75]" />
          </button>
        </div>
      ) : (
        /* Active Practice Test Area */
        <div className="w-full flex flex-col items-center">
          {/* E Display Arena */}
          <div className="w-full bg-white rounded-[2rem] p-6 sm:p-8 border border-slate-200 shadow-sm flex flex-col items-center justify-center relative min-h-[160px] sm:min-h-[190px] mb-4">
            <TumblingE
              sizeMm={practiceSizeMm}
              pxPerMm={calibration.pxPerMm}
              orientation={currentOrientation}
            />

            {/* Feedback Float Banner */}
            {feedback === 'correct' && (
              <div className="absolute inset-0 rounded-[2rem] bg-emerald-500/90 flex items-center justify-center text-white text-base sm:text-lg font-black backdrop-blur-xs animate-fadeIn">
                {t.greatJob}
              </div>
            )}
            {feedback === 'tryAgain' && (
              <div className="absolute inset-0 rounded-[2rem] bg-amber-500/90 flex items-center justify-center text-white text-base sm:text-lg font-black backdrop-blur-xs animate-fadeIn">
                {t.tryAgain}
              </div>
            )}
          </div>

          {/* Question Prompt */}
          <p className="text-sm sm:text-base font-bold text-slate-800 mb-3 text-center">
            {t.whichWayFacing}
          </p>

          {/* Child-Friendly Direction Pad */}
          <DirectionPad
            onSelect={handleSelectAnswer}
            disabled={feedback !== 'idle'}
            labels={{
              up: t.up,
              down: t.down,
              left: t.left,
              right: t.right,
            }}
          />

          {/* Practice Progress Dots */}
          <div className="flex items-center gap-2 mt-4 text-xs font-semibold text-slate-500">
            <span>Practice goal:</span>
            <div className="flex items-center gap-1.5">
              <div className={`w-3 h-3 rounded-full ${consecutiveCorrect >= 1 ? 'bg-teal-600' : 'bg-slate-300'}`} />
              <div className={`w-3 h-3 rounded-full ${consecutiveCorrect >= 2 ? 'bg-teal-600' : 'bg-slate-300'}`} />
            </div>
            <span>(2 correct answers)</span>
          </div>
        </div>
      )}
    </div>
  );
};
