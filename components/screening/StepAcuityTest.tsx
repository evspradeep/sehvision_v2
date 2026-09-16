'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { TumblingE } from '../optotype/TumblingE';
import { DirectionPad } from '../ui/DirectionPad';
import { DebugOverlay } from '../ui/DebugOverlay';
import {
  OptotypeOrientation,
  EyeTested,
  CalibrationData,
  ClinicalConfig,
  ScreeningResponse,
  EyeAcuityResult,
  SupportedLanguage,
} from '@/lib/types';
import { getHeightForLevelAndDistance } from '@/lib/clinicalConfig';
import { snellenToLogMAR } from '@/lib/optotypeMath';
import { TRANSLATIONS } from '@/lib/i18n';
import { playChime } from '@/lib/audioService';

interface StepAcuityTestProps {
  eye: EyeTested;
  sessionId: string;
  calibration: CalibrationData;
  clinicalConfig: ClinicalConfig;
  language: SupportedLanguage;
  onEyeTestComplete: (result: EyeAcuityResult) => void;
}

const POSSIBLE_ORIENTATIONS: OptotypeOrientation[] = ['up', 'down', 'left', 'right'];

function getRandomOrientation(exclude?: OptotypeOrientation): OptotypeOrientation {
  const choices = exclude ? POSSIBLE_ORIENTATIONS.filter(o => o !== exclude) : POSSIBLE_ORIENTATIONS;
  const idx = Math.floor(Math.random() * choices.length);
  return choices[idx];
}

export const StepAcuityTest: React.FC<StepAcuityTestProps> = ({
  eye,
  sessionId,
  calibration,
  clinicalConfig,
  language,
  onEyeTestComplete,
}) => {
  const t = TRANSLATIONS[language] || TRANSLATIONS.en;

  // Current clinical level index (starts at startLevelIndex e.g. 6/36)
  const [levelIndex, setLevelIndex] = useState(clinicalConfig.startLevelIndex ?? 1);
  // Current trial within this level (1 to trialsPerLevel)
  const [trialInLevel, setTrialInLevel] = useState(1);
  // Total questions answered in this eye test
  const [totalQuestionsAnswered, setTotalQuestionsAnswered] = useState(0);

  // Current orientation
  const [currentOrientation, setCurrentOrientation] = useState<OptotypeOrientation>(() => getRandomOrientation());
  // Responses recorded so far for this eye test
  const [recordedResponses, setRecordedResponses] = useState<ScreeningResponse[]>([]);
  // Highest Snellen level passed successfully
  const [highestPassedLevelIndex, setHighestPassedLevelIndex] = useState<number | null>(null);

  // Time tracking for individual response
  const trialStartTimeRef = useRef<number>(0);
  const [isProcessing, setIsProcessing] = useState(false);

  // Current level details
  const currentLevelConfig = clinicalConfig.acuityLevels[levelIndex] || clinicalConfig.acuityLevels[0];
  const trialsPerLevel = currentLevelConfig.trialsPerLevel;
  const passingScore = currentLevelConfig.passingScore;

  // Target physical size in mm for current level and configured distance
  const currentSizeMm = getHeightForLevelAndDistance(levelIndex, clinicalConfig.testingDistanceCm, clinicalConfig);

  const finishEyeTest = useCallback((finalLevelIdx: number, allResponses: ScreeningResponse[]) => {
    const finalLevel = clinicalConfig.acuityLevels[finalLevelIdx] || clinicalConfig.acuityLevels[0];
    const finalSizeMm = getHeightForLevelAndDistance(finalLevelIdx, clinicalConfig.testingDistanceCm, clinicalConfig);

    // Evaluate against clinical passing threshold (e.g. "6/9")
    // If threshold is 6/9, levels 6/9 and 6/6 pass, worse levels flag referral
    const thresholdParts = clinicalConfig.passingThresholdSnellen.split('/');
    const thresholdDen = thresholdParts.length === 2 ? parseFloat(thresholdParts[1]) : 9;
    const finalDen = parseFloat(finalLevel.snellenEquivalent.split('/')[1]) || 60;
    const passedThreshold = finalDen <= thresholdDen;

    const result: EyeAcuityResult = {
      eye,
      smallestIdentifiedMm: finalSizeMm,
      snellenEquivalent: finalLevel.snellenEquivalent,
      logMarEquivalent: finalLevel.logMar,
      trialsPassed: allResponses.filter(r => r.correct).length,
      totalTrials: allResponses.length,
      passedThreshold,
      rawResponses: allResponses,
    };

    playChime('correct');
    onEyeTestComplete(result);
  }, [clinicalConfig, eye, onEyeTestComplete]);

  // Reset trial start timer when orientation changes
  useEffect(() => {
    trialStartTimeRef.current = performance.now();
  }, [currentOrientation, levelIndex, trialInLevel]);

  // Handle user response from DirectionPad
  const handleAnswer = useCallback(
    (userAnswer: OptotypeOrientation) => {
      if (isProcessing) return;
      setIsProcessing(true);

      const responseTimeMs = trialStartTimeRef.current > 0 ? Math.round(performance.now() - trialStartTimeRef.current) : 500;
      const isCorrect = userAnswer === currentOrientation;

      if (isCorrect) {
        playChime('tap');
      }

      const newResponse: ScreeningResponse = {
        responseId: `resp-${eye}-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        sessionId,
        eye,
        questionNumber: totalQuestionsAnswered + 1,
        optotypeOrientation: currentOrientation,
        optotypeSizeMm: currentSizeMm,
        snellenEquivalent: currentLevelConfig.snellenEquivalent,
        expectedAnswer: currentOrientation,
        userAnswer,
        correct: isCorrect,
        responseTimeMs,
        timestamp: new Date().toISOString(),
      };

      const updatedResponses = [...recordedResponses, newResponse];
      setRecordedResponses(updatedResponses);
      setTotalQuestionsAnswered(prev => prev + 1);

      // Analyze progress in the current level
      // Gather trials answered for the current level
      const currentLevelResponses = updatedResponses.filter(
        r => r.snellenEquivalent === currentLevelConfig.snellenEquivalent
      );
      const correctInLevel = currentLevelResponses.filter(r => r.correct).length;
      const answeredInLevel = currentLevelResponses.length;

      // Check if level is finished
      if (answeredInLevel >= trialsPerLevel) {
        const passedLevel = correctInLevel >= passingScore;

        if (passedLevel) {
          // Check if there is a next smaller level to test
          const nextLevelIdx = levelIndex + 1;
          const hasNextLevel = nextLevelIdx < clinicalConfig.acuityLevels.length;

          if (hasNextLevel) {
            // Advance to smaller E!
            setHighestPassedLevelIndex(levelIndex);
            setLevelIndex(nextLevelIdx);
            setTrialInLevel(1);
            setCurrentOrientation(getRandomOrientation(currentOrientation));
            setIsProcessing(false);
          } else {
            // Reached the highest acuity level tested (6/6)! Finish test.
            finishEyeTest(levelIndex, updatedResponses);
          }
        } else {
          // Failed current level. The final acuity is the previously passed level.
          const finalLevel = highestPassedLevelIndex !== null ? highestPassedLevelIndex : levelIndex;
          finishEyeTest(finalLevel, updatedResponses);
        }
      } else {
        // Next trial within current level
        setTrialInLevel(prev => prev + 1);
        setCurrentOrientation(getRandomOrientation(currentOrientation));
        setIsProcessing(false);
      }
    },
    [
      isProcessing,
      currentOrientation,
      eye,
      sessionId,
      totalQuestionsAnswered,
      currentSizeMm,
      currentLevelConfig,
      recordedResponses,
      trialsPerLevel,
      passingScore,
      levelIndex,
      clinicalConfig.acuityLevels.length,
      highestPassedLevelIndex,
      finishEyeTest,
    ]
  );

  const eyeLabel =
    eye === 'right' ? 'Right Eye (OD)' : eye === 'left' ? 'Left Eye (OS)' : 'Both Eyes (OU)';

  return (
    <div
      className="w-full max-w-lg mx-auto p-3 sm:p-5 flex flex-col items-center justify-between min-h-[80vh] select-none"
      id="screening-step-acuity-test"
    >
      {/* Top Test Header & Progress Info */}
      <div className="w-full flex items-center justify-between px-2 pt-1 pb-2">
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-teal-500 animate-ping" />
          <span className="text-xs sm:text-sm font-extrabold uppercase tracking-wide text-slate-800">
            {eyeLabel}
          </span>
        </div>

        {/* Level & Trial Badge */}
        <div className="flex items-center gap-2 text-xs font-mono font-semibold text-slate-600 bg-slate-100 px-3 py-1 rounded-full border border-slate-200">
          <span>Level: {currentLevelConfig.snellenEquivalent}</span>
          <span className="text-slate-300">|</span>
          <span>Trial {trialInLevel}/{trialsPerLevel}</span>
        </div>
      </div>

      {/* 
        Central Controlled Optotype Stage:
        Pristine, distraction-free neutral canvas.
        Aspect ratio 1:1. Zero distortion. Instant updates.
      */}
      <div className="w-full flex-1 flex flex-col items-center justify-center my-3 sm:my-5">
        <div
          className="w-full max-w-sm aspect-square bg-white rounded-[2rem] border border-slate-200 shadow-sm flex items-center justify-center p-4 relative"
          id="optotype-presentation-stage"
        >
          <TumblingE
            sizeMm={currentSizeMm}
            pxPerMm={calibration.pxPerMm}
            orientation={currentOrientation}
            color="#000000"
            backgroundColor="transparent"
          />

          {/* Discreet Snellen Line Indicator for Clinical Observers */}
          <div className="absolute top-3 right-3 text-[10px] font-mono text-slate-400 select-none pointer-events-none">
            {currentLevelConfig.snellenEquivalent}
          </div>
        </div>

        <p className="text-xs sm:text-sm font-bold text-slate-600 mt-3 text-center">
          {t.whichWayFacing}
        </p>
      </div>

      {/* Accessible, Oversized Direction Pad for the Child */}
      <div className="w-full pb-2">
        <DirectionPad
          onSelect={handleAnswer}
          disabled={isProcessing}
          labels={{
            up: t.up,
            down: t.down,
            left: t.left,
            right: t.right,
          }}
        />
      </div>

      {/* Clinical Validation Debug Overlay */}
      <DebugOverlay
        calibration={calibration}
        testingDistanceCm={clinicalConfig.testingDistanceCm}
        currentSizeMm={currentSizeMm}
        snellenLevel={currentLevelConfig.snellenEquivalent}
        eye={eye}
        orientation={currentOrientation}
        currentTrial={trialInLevel}
        totalTrials={trialsPerLevel}
      />
    </div>
  );
};
