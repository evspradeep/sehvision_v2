'use client';

import React, { useState, useEffect, useMemo, use } from 'react';
import { useRouter } from 'next/navigation';
import { Header } from '@/components/branding/Header';
import { StepLanding } from '@/components/screening/StepLanding';
import { StepLanguage } from '@/components/screening/StepLanguage';
import { StepInstructions } from '@/components/screening/StepInstructions';
import { StepCalibration } from '@/components/screening/StepCalibration';
import { StepPractice } from '@/components/screening/StepPractice';
import { StepEyeCover } from '@/components/screening/StepEyeCover';
import { StepAcuityTest } from '@/components/screening/StepAcuityTest';
import { StepColourVision } from '@/components/screening/StepColourVision';
import { StepResult } from '@/components/screening/StepResult';
import { DistanceGate } from '@/components/distance/DistanceGate';
import {
  SupportedLanguage,
  StudentProfile,
  CalibrationData,
  ClinicalConfig,
  EyeAcuityResult,
  ColourVisionResult,
  ScreeningSession,
  ScreeningOverallStatus,
} from '@/lib/types';
import { DEFAULT_CLINICAL_CONFIG } from '@/lib/clinicalConfig';
import { DEFAULT_FALLBACK_PX_PER_MM } from '@/lib/optotypeMath';
import {
  lookupStudentByQrOrId,
  saveScreeningSession,
  getDeviceCalibration,
  saveDeviceCalibration,
  getClinicalConfig,
  getSavedLanguage,
  savePreferredLanguage,
} from '@/lib/storage';
import { SankaraCrmAdapter } from '@/lib/crmService';

type ScreeningFlowStep =
  | 'welcome'
  | 'language'
  | 'instructions'
  | 'calibration'
  | 'distance_gate'
  | 'practice'
  | 'right_cover'
  | 'right_test'
  | 'left_cover'
  | 'left_test'
  | 'binocular_cover'
  | 'binocular_test'
  | 'colour_vision'
  | 'result';

interface PageProps {
  params: Promise<{ studentId: string }>;
}

export default function StudentScreeningPage({ params }: PageProps) {
  const router = useRouter();
  const unwrappedParams = use(params);
  const studentIdentifier = unwrappedParams.studentId || 'a8F7k29LmQ';

  const student = useMemo(() => lookupStudentByQrOrId(studentIdentifier), [studentIdentifier]);
  const [currentStep, setCurrentStep] = useState<ScreeningFlowStep>('welcome');
  const [language, setLanguage] = useState<SupportedLanguage>(() => {
    const saved = getSavedLanguage() as SupportedLanguage;
    return ['en', 'te', 'hi', 'ta', 'kn'].includes(saved) ? saved : 'en';
  });
  const [clinicalConfig, setClinicalConfig] = useState<ClinicalConfig>(() => getClinicalConfig());

  // Calibration state
  const [calibration, setCalibration] = useState<CalibrationData>(() => {
    return (
      getDeviceCalibration() || {
        pxPerMm: DEFAULT_FALLBACK_PX_PER_MM,
        calibratedObjectWidthMm: 85.6,
        userAdjustedPx: Math.round(85.6 * DEFAULT_FALLBACK_PX_PER_MM),
        dpr: typeof window !== 'undefined' ? window.devicePixelRatio || 1 : 1,
        screenWidth: typeof window !== 'undefined' ? window.screen.width : 0,
        screenHeight: typeof window !== 'undefined' ? window.screen.height : 0,
        viewportWidth: typeof window !== 'undefined' ? window.innerWidth : 0,
        viewportHeight: typeof window !== 'undefined' ? window.innerHeight : 0,
        userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : 'unknown',
        calibratedAt: new Date().toISOString(),
        method: 'card',
      }
    );
  });

  // Session state
  const [sessionId] = useState<string>(() => `sess-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`);
  const [rightEyeResult, setRightEyeResult] = useState<EyeAcuityResult | null>(null);
  const [leftEyeResult, setLeftEyeResult] = useState<EyeAcuityResult | null>(null);
  const [binocularResult, setBinocularResult] = useState<EyeAcuityResult | null>(null);
  const [colourVisionResult, setColourVisionResult] = useState<ColourVisionResult | null>(null);
  const [completedSession, setCompletedSession] = useState<ScreeningSession | null>(null);

  const handleLanguageChange = (newLang: SupportedLanguage) => {
    setLanguage(newLang);
    savePreferredLanguage(newLang);
  };

  const handleCalibrationConfirmed = (data: CalibrationData) => {
    setCalibration(data);
    saveDeviceCalibration(data);
    setCurrentStep('distance_gate');
  };

  const handleRightEyeDone = (res: EyeAcuityResult) => {
    setRightEyeResult(res);
    setCurrentStep('left_cover');
  };

  const handleLeftEyeDone = (res: EyeAcuityResult) => {
    setLeftEyeResult(res);
    if (clinicalConfig.binocularTestingEnabled) {
      setCurrentStep('binocular_cover');
    } else if (clinicalConfig.colourVisionEnabled) {
      setCurrentStep('colour_vision');
    } else {
      finalizeScreeningSession(rightEyeResult!, res, null, null);
    }
  };

  const handleBinocularDone = (res: EyeAcuityResult) => {
    setBinocularResult(res);
    if (clinicalConfig.colourVisionEnabled) {
      setCurrentStep('colour_vision');
    } else {
      finalizeScreeningSession(rightEyeResult!, leftEyeResult!, res, null);
    }
  };

  const handleColourVisionDone = (res: ColourVisionResult) => {
    setColourVisionResult(res);
    finalizeScreeningSession(rightEyeResult!, leftEyeResult!, binocularResult, res);
  };

  // Determine overall screening status based on clinical configuration
  const finalizeScreeningSession = (
    od: EyeAcuityResult,
    os: EyeAcuityResult,
    ou: EyeAcuityResult | null,
    cv: ColourVisionResult | null
  ) => {
    // Clinical Rule Evaluation:
    // 1. Passing threshold: e.g. 6/9
    const odPassed = od.passedThreshold;
    const osPassed = os.passedThreshold;

    // 2. Inter-ocular difference check (amblyopia/anisometropia risk)
    const odDen = parseFloat(od.snellenEquivalent.split('/')[1]) || 9;
    const osDen = parseFloat(os.snellenEquivalent.split('/')[1]) || 9;
    const linesDiff = Math.abs(Math.log2(odDen / osDen)); // approximate Snellen line differences

    const colorConcern = cv && cv.tested && cv.status === 'concern';

    let overallStatus: ScreeningOverallStatus = 'normal';
    let referralRequired = false;
    let clinicalNotes = '';

    if (!odPassed || !osPassed) {
      overallStatus = 'referral';
      referralRequired = true;
      clinicalNotes = `Visual acuity below school threshold (${clinicalConfig.passingThresholdSnellen}). Right: ${od.snellenEquivalent}, Left: ${os.snellenEquivalent}.`;
    } else if (linesDiff >= (clinicalConfig.referralRuleInterocularDifferenceLines * 0.5)) {
      overallStatus = 'referral';
      referralRequired = true;
      clinicalNotes = `Significant inter-ocular acuity difference detected between eyes (OD: ${od.snellenEquivalent}, OS: ${os.snellenEquivalent}). Pediatric evaluation advised.`;
    } else if (colorConcern) {
      // If acuity is normal but colour vision has concerns -> recommend re-check / specialized assessment
      overallStatus = 'recheck';
      clinicalNotes = 'Colour vision plates discrimination reduced. Daylight re-check suggested.';
    }

    const session: ScreeningSession = {
      sessionId,
      studentId: student?.studentId || `std-${studentIdentifier}`,
      opCardId: student?.opCardId || `OP-${studentIdentifier}`,
      qrId: studentIdentifier,
      schoolId: student?.schoolId || 'sch-sankara-01',
      schoolName: student?.schoolName || 'Sankara School Screening Center',
      gradeClass: student?.gradeClass || 'Class 4',
      section: student?.section || 'A',
      deviceId: typeof navigator !== 'undefined' ? navigator.userAgent.slice(0, 32) : 'Device',
      startedAt: new Date(Date.now() - 300000).toISOString(),
      completedAt: new Date().toISOString(),
      testDistanceCm: clinicalConfig.testingDistanceCm,
      calibration,
      rightEyeResult: od,
      leftEyeResult: os,
      binocularResult: ou || undefined,
      colourVisionResult: cv || undefined,
      overallStatus,
      referralRequired,
      referralStatus: referralRequired ? 'recommended' : undefined,
      clinicalNotes,
      syncStatus: (typeof navigator !== 'undefined' && navigator.onLine) ? 'synced' : 'pending',
      offlineCreated: typeof navigator !== 'undefined' ? !navigator.onLine : false,
      responses: [...od.rawResponses, ...os.rawResponses, ...(ou ? ou.rawResponses : [])],
    };

    // Save locally
    saveScreeningSession(session);
    setCompletedSession(session);

    // If online, dispatch to API & CRM
    if (typeof navigator !== 'undefined' && navigator.onLine) {
      fetch('/api/screenings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(session),
      }).catch(err => console.warn('Background sync queued locally:', err));

      if (referralRequired && student) {
        SankaraCrmAdapter.pushReferralLead(session, student).catch(console.warn);
      }
    }

    setCurrentStep('result');
  };

  if (!student) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="w-10 h-10 border-4 border-teal-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-sm font-semibold text-slate-700">Loading student screening profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col justify-between selection:bg-teal-100" id="screening-workflow-wrapper">
      <Header
        currentLanguage={language}
        onLanguageChange={handleLanguageChange}
        minimal={currentStep === 'right_test' || currentStep === 'left_test' || currentStep === 'binocular_test'}
      />

      <main className="flex-1 flex flex-col justify-center py-4 sm:py-6">
        {currentStep === 'welcome' && (
          <StepLanding
            language={language}
            student={student}
            onStart={() => setCurrentStep('language')}
          />
        )}

        {currentStep === 'language' && (
          <StepLanguage
            selectedLanguage={language}
            onSelectLanguage={handleLanguageChange}
            onContinue={() => setCurrentStep('instructions')}
          />
        )}

        {currentStep === 'instructions' && (
          <StepInstructions
            language={language}
            distanceCm={clinicalConfig.testingDistanceCm}
            onContinue={() => setCurrentStep('calibration')}
            onBack={() => setCurrentStep('language')}
          />
        )}

        {currentStep === 'calibration' && (
          <StepCalibration
            language={language}
            onCalibrationConfirmed={handleCalibrationConfirmed}
            onBack={() => setCurrentStep('instructions')}
          />
        )}

        {currentStep === 'distance_gate' && (
          <div className="w-full max-w-2xl mx-auto px-2 py-2">
            <DistanceGate
              onUnlockAndStart={(dist) => {
                setCurrentStep('practice');
              }}
              onBack={() => setCurrentStep('calibration')}
              language={language}
            />
          </div>
        )}

        {currentStep === 'practice' && (
          <StepPractice
            language={language}
            calibration={calibration}
            onPracticeComplete={() => setCurrentStep('right_cover')}
          />
        )}

        {currentStep === 'right_cover' && (
          <StepEyeCover
            eyeToTest="right"
            language={language}
            onReady={() => setCurrentStep('right_test')}
          />
        )}

        {currentStep === 'right_test' && (
          <StepAcuityTest
            eye="right"
            sessionId={sessionId}
            calibration={calibration}
            clinicalConfig={clinicalConfig}
            language={language}
            onEyeTestComplete={handleRightEyeDone}
          />
        )}

        {currentStep === 'left_cover' && (
          <StepEyeCover
            eyeToTest="left"
            language={language}
            onReady={() => setCurrentStep('left_test')}
          />
        )}

        {currentStep === 'left_test' && (
          <StepAcuityTest
            eye="left"
            sessionId={sessionId}
            calibration={calibration}
            clinicalConfig={clinicalConfig}
            language={language}
            onEyeTestComplete={handleLeftEyeDone}
          />
        )}

        {currentStep === 'binocular_cover' && (
          <StepEyeCover
            eyeToTest="binocular"
            language={language}
            onReady={() => setCurrentStep('binocular_test')}
          />
        )}

        {currentStep === 'binocular_test' && (
          <StepAcuityTest
            eye="binocular"
            sessionId={sessionId}
            calibration={calibration}
            clinicalConfig={clinicalConfig}
            language={language}
            onEyeTestComplete={handleBinocularDone}
          />
        )}

        {currentStep === 'colour_vision' && (
          <StepColourVision
            language={language}
            passThreshold={clinicalConfig.colourVisionPassThreshold}
            onComplete={handleColourVisionDone}
          />
        )}

        {currentStep === 'result' && completedSession && (
          <StepResult
            session={completedSession}
            student={student}
            language={language}
            onFinish={() => router.push('/')}
          />
        )}
      </main>
    </div>
  );
}
