'use client';

import React, { useState } from 'react';
import { ColourVisionResult, ColourVisionResponse, SupportedLanguage } from '@/lib/types';
import { TRANSLATIONS } from '@/lib/i18n';
import { AudioVoiceButton } from '../ui/AudioVoiceButton';
import { playChime } from '@/lib/audioService';
import { Eye, HelpCircle, ArrowRight } from 'lucide-react';

interface StepColourVisionProps {
  language: SupportedLanguage;
  passThreshold?: number;
  onComplete: (result: ColourVisionResult) => void;
}

interface ColourPlateDefinition {
  id: string;
  name: string;
  targetShape: 'circle' | 'star' | 'triangle' | 'square' | 'number_7';
  label: string;
  description: string;
  bgColors: string[];
  fgColors: string[];
  options: Array<{ id: string; label: string; icon: string }>;
  correctOptionId: string;
}

const PLATES: ColourPlateDefinition[] = [
  {
    id: 'plate-1-demo',
    name: 'Demonstration Plate 1',
    targetShape: 'circle',
    label: 'Circle',
    description: 'High-contrast demonstration pattern',
    bgColors: ['#94a3b8', '#cbd5e1', '#64748b'],
    fgColors: ['#f97316', '#ea580c', '#fb923c'],
    options: [
      { id: 'circle', label: 'Circle', icon: '⭕' },
      { id: 'star', label: 'Star', icon: '⭐' },
      { id: 'triangle', label: 'Triangle', icon: '🔺' },
      { id: 'none', label: 'Only Dots', icon: '⚪' },
    ],
    correctOptionId: 'circle',
  },
  {
    id: 'plate-2-rg',
    name: 'Red-Green Screening Plate 2',
    targetShape: 'star',
    label: 'Star',
    description: 'Protan/Deutan confusion test',
    bgColors: ['#f87171', '#ef4444', '#dc2626', '#fca5a5'],
    fgColors: ['#4ade80', '#22c55e', '#16a34a', '#86efac'],
    options: [
      { id: 'star', label: 'Star', icon: '⭐' },
      { id: 'square', label: 'Square', icon: '⬛' },
      { id: 'circle', label: 'Circle', icon: '⭕' },
      { id: 'none', label: 'Only Dots', icon: '⚪' },
    ],
    correctOptionId: 'star',
  },
  {
    id: 'plate-3-rg',
    name: 'Red-Green Screening Plate 3',
    targetShape: 'triangle',
    label: 'Triangle',
    description: 'Deutan confusion pattern',
    bgColors: ['#86efac', '#4ade80', '#22c55e', '#a7f3d0'],
    fgColors: ['#fb923c', '#f97316', '#ea580c', '#fdba74'],
    options: [
      { id: 'triangle', label: 'Triangle', icon: '🔺' },
      { id: 'circle', label: 'Circle', icon: '⭕' },
      { id: 'star', label: 'Star', icon: '⭐' },
      { id: 'none', label: 'Only Dots', icon: '⚪' },
    ],
    correctOptionId: 'triangle',
  },
  {
    id: 'plate-4-rg',
    name: 'Red-Green Screening Plate 4',
    targetShape: 'square',
    label: 'Square',
    description: 'Protan confusion pattern',
    bgColors: ['#fca5a5', '#f87171', '#ef4444', '#fee2e2'],
    fgColors: ['#34d399', '#10b981', '#059669', '#6ee7b7'],
    options: [
      { id: 'square', label: 'Square', icon: '⬛' },
      { id: 'star', label: 'Star', icon: '⭐' },
      { id: 'triangle', label: 'Triangle', icon: '🔺' },
      { id: 'none', label: 'Only Dots', icon: '⚪' },
    ],
    correctOptionId: 'square',
  },
  {
    id: 'plate-5-by',
    name: 'Blue-Yellow Screening Plate 5',
    targetShape: 'circle',
    label: 'Circle',
    description: 'Tritan axis discrimination',
    bgColors: ['#fde047', '#facc15', '#eab308', '#fef08a'],
    fgColors: ['#60a5fa', '#3b82f6', '#2563eb', '#93c5fd'],
    options: [
      { id: 'circle', label: 'Circle', icon: '⭕' },
      { id: 'triangle', label: 'Triangle', icon: '🔺' },
      { id: 'square', label: 'Square', icon: '⬛' },
      { id: 'none', label: 'Only Dots', icon: '⚪' },
    ],
    correctOptionId: 'circle',
  },
];

export const StepColourVision: React.FC<StepColourVisionProps> = ({
  language,
  passThreshold = 4,
  onComplete,
}) => {
  const t = TRANSLATIONS[language] || TRANSLATIONS.en;
  const [currentPlateIndex, setCurrentPlateIndex] = useState(0);
  const [recordedResponses, setRecordedResponses] = useState<ColourVisionResponse[]>([]);
  const [isDone, setIsDone] = useState(false);

  const currentPlate = PLATES[currentPlateIndex];

  const handleOptionSelect = (optionId: string) => {
    playChime('tap');
    const isCorrect = optionId === currentPlate.correctOptionId;

    const resp: ColourVisionResponse = {
      plateId: currentPlate.id,
      plateName: currentPlate.name,
      expectedOption: currentPlate.correctOptionId,
      userOption: optionId,
      correct: isCorrect,
      responseTimeMs: 1200,
    };

    const nextResponses = [...recordedResponses, resp];
    setRecordedResponses(nextResponses);

    if (currentPlateIndex + 1 < PLATES.length) {
      setCurrentPlateIndex(prev => prev + 1);
    } else {
      // Calculate outcome
      const correctCount = nextResponses.filter(r => r.correct).length;
      const isPassed = correctCount >= passThreshold;

      const outcome: ColourVisionResult = {
        tested: true,
        platesCount: PLATES.length,
        correctCount,
        status: isPassed ? 'normal' : 'concern',
        summaryText: isPassed
          ? 'Colour vision screening: No concern detected'
          : 'Colour vision screening: Further assessment recommended',
        responses: nextResponses,
      };

      setIsDone(true);
      playChime(isPassed ? 'correct' : 'tap');
      setTimeout(() => {
        onComplete(outcome);
      }, 500);
    }
  };

  const spokenText = `${t.colourVisionTitle}. ${t.colourVisionDesc}. ${t.colourVisionPrompt}`;

  return (
    <div className="w-full max-w-md mx-auto p-4 sm:p-6 flex flex-col items-center select-none" id="screening-step-colour-vision">
      <div className="text-center mb-4">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-100 text-purple-800 text-xs font-bold uppercase tracking-wider mb-2">
          <span>Plate {currentPlateIndex + 1} of {PLATES.length}</span>
        </div>

        <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
          {t.colourVisionTitle}
        </h2>
        <p className="text-xs sm:text-sm text-slate-600 mt-1">
          {t.colourVisionDesc}
        </p>

        <div className="mt-2">
          <AudioVoiceButton
            textToSpeak={spokenText}
            language={language}
            label={t.listenToInstructions}
          />
        </div>
      </div>

      {/* Pseudo-Isochromatic Plate Canvas */}
      <div className="w-64 h-64 sm:w-72 sm:h-72 rounded-full p-2 bg-white border-4 border-slate-200 shadow-md flex items-center justify-center relative overflow-hidden mb-5">
        <svg viewBox="0 0 200 200" className="w-full h-full rounded-full">
          {/* Background Matrix of Jittered Dots */}
          <g>
            {Array.from({ length: 85 }).map((_, i) => {
              const angle = (i * 47) % 360;
              const dist = 15 + ((i * 19) % 78);
              const cx = 100 + dist * Math.cos((angle * Math.PI) / 180);
              const cy = 100 + dist * Math.sin((angle * Math.PI) / 180);
              const r = 3.5 + (i % 4) * 1.5;
              const fill = currentPlate.bgColors[i % currentPlate.bgColors.length];
              return <circle key={`bg-${i}`} cx={cx} cy={cy} r={r} fill={fill} opacity="0.9" />;
            })}
          </g>

          {/* Embedded Target Shape Dots */}
          <g>
            {currentPlate.targetShape === 'circle' && (
              Array.from({ length: 30 }).map((_, i) => {
                const angle = (i * 12) * (Math.PI / 180);
                const cx = 100 + 44 * Math.cos(angle);
                const cy = 100 + 44 * Math.sin(angle);
                const r = 4.5 + (i % 3);
                const fill = currentPlate.fgColors[i % currentPlate.fgColors.length];
                return <circle key={`fg-c-${i}`} cx={cx} cy={cy} r={r} fill={fill} />;
              })
            )}

            {currentPlate.targetShape === 'triangle' && (
              Array.from({ length: 26 }).map((_, i) => {
                const seg = i % 3;
                const t = (i / 8) % 1;
                let cx = 100, cy = 60;
                if (seg === 0) {
                  // Left side
                  cx = 100 - t * 45;
                  cy = 60 + t * 75;
                } else if (seg === 1) {
                  // Bottom side
                  cx = 55 + t * 90;
                  cy = 135;
                } else {
                  // Right side
                  cx = 145 - t * 45;
                  cy = 135 - t * 75;
                }
                const r = 4.5 + (i % 2) * 1.2;
                const fill = currentPlate.fgColors[i % currentPlate.fgColors.length];
                return <circle key={`fg-t-${i}`} cx={cx} cy={cy} r={r} fill={fill} />;
              })
            )}

            {currentPlate.targetShape === 'square' && (
              Array.from({ length: 28 }).map((_, i) => {
                const seg = Math.floor(i / 7);
                const t = (i % 7) / 7;
                let cx = 65, cy = 65;
                if (seg === 0) {
                  cx = 65 + t * 70;
                  cy = 65;
                } else if (seg === 1) {
                  cx = 135;
                  cy = 65 + t * 70;
                } else if (seg === 2) {
                  cx = 135 - t * 70;
                  cy = 135;
                } else {
                  cx = 65;
                  cy = 135 - t * 70;
                }
                const r = 4.5 + (i % 3);
                const fill = currentPlate.fgColors[i % currentPlate.fgColors.length];
                return <circle key={`fg-s-${i}`} cx={cx} cy={cy} r={r} fill={fill} />;
              })
            )}

            {currentPlate.targetShape === 'star' && (
              Array.from({ length: 28 }).map((_, i) => {
                const angle = (i * 36) * (Math.PI / 180);
                const rad = i % 2 === 0 ? 46 : 22;
                const cx = 100 + rad * Math.cos(angle);
                const cy = 100 + rad * Math.sin(angle);
                const r = 4.2 + (i % 2) * 1.5;
                const fill = currentPlate.fgColors[i % currentPlate.fgColors.length];
                return <circle key={`fg-star-${i}`} cx={cx} cy={cy} r={r} fill={fill} />;
              })
            )}
          </g>
        </svg>
      </div>

      <p className="text-sm font-bold text-slate-800 mb-3 text-center">
        {t.colourVisionPrompt}
      </p>

      {/* Child Option Buttons */}
      <div className="grid grid-cols-2 gap-2.5 w-full">
        {currentPlate.options.map((opt) => (
          <button
            key={opt.id}
            type="button"
            onClick={() => handleOptionSelect(opt.id)}
            className="py-3 px-4 rounded-2xl bg-white hover:bg-slate-50 border-2 border-slate-200 hover:border-teal-500 shadow-xs flex items-center justify-center gap-2.5 transition active:scale-95 cursor-pointer font-bold text-slate-800 text-sm sm:text-base"
            id={`btn-colour-opt-${opt.id}`}
          >
            <span className="text-xl">{opt.icon}</span>
            <span>{opt.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
};
