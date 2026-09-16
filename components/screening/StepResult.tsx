'use client';

import React, { useEffect } from 'react';
import confetti from 'canvas-confetti';
import { ScreeningSession, SupportedLanguage, StudentProfile } from '@/lib/types';
import { TRANSLATIONS } from '@/lib/i18n';
import { AudioVoiceButton } from '../ui/AudioVoiceButton';
import { playChime } from '@/lib/audioService';
import { SankaraLogo } from '../branding/SankaraLogo';
import {
  CheckCircle2,
  AlertTriangle,
  AlertCircle,
  Eye,
  Calendar,
  Building2,
  ShieldCheck,
  Check,
  ArrowRight,
} from 'lucide-react';

interface StepResultProps {
  session: ScreeningSession;
  student: StudentProfile;
  language: SupportedLanguage;
  onFinish: () => void;
}

export const StepResult: React.FC<StepResultProps> = ({
  session,
  student,
  language,
  onFinish,
}) => {
  const t = TRANSLATIONS[language] || TRANSLATIONS.en;

  const isNormal = session.overallStatus === 'normal';
  const isRecheck = session.overallStatus === 'recheck';
  const isReferral = session.overallStatus === 'referral';

  useEffect(() => {
    if (isNormal) {
      playChime('celebration');
      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#0d9488', '#0284c7', '#f59e0b', '#10b981'],
        });
      } catch {
        // ignore
      }
    } else {
      playChime('alert');
    }
  }, [isNormal]);

  const spokenSummary = isNormal
    ? `${t.testComplete}. ${t.normalStatus}. ${t.normalMessage}`
    : isRecheck
    ? `${t.testComplete}. ${t.recheckStatus}. ${t.recheckMessage}`
    : `${t.testComplete}. ${t.referralStatus}. ${t.referralMessage}`;

  return (
    <div className="w-full max-w-lg mx-auto p-4 sm:p-6 text-center select-none" id="screening-step-result">
      {/* Top Banner Status */}
      <div className="mb-6">
        <div
          className={`w-20 h-20 mx-auto rounded-full flex items-center justify-center shadow-lg mb-4 ${
            isNormal
              ? 'bg-emerald-100 text-emerald-600 shadow-emerald-500/20'
              : isRecheck
              ? 'bg-amber-100 text-amber-600 shadow-amber-500/20'
              : 'bg-rose-100 text-rose-600 shadow-rose-500/20'
          }`}
        >
          {isNormal ? (
            <CheckCircle2 className="w-12 h-12 stroke-[2.5]" />
          ) : isRecheck ? (
            <AlertTriangle className="w-12 h-12 stroke-[2.5]" />
          ) : (
            <AlertCircle className="w-12 h-12 stroke-[2.5]" />
          )}
        </div>

        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
          {t.testComplete}
        </h1>

        <div className="mt-2 inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs sm:text-sm font-bold shadow-2xs border">
          {isNormal && (
            <span className="text-emerald-800 bg-emerald-50 border-emerald-300">
              {t.normalStatus}
            </span>
          )}
          {isRecheck && (
            <span className="text-amber-800 bg-amber-50 border-amber-300">
              {t.recheckStatus}
            </span>
          )}
          {isReferral && (
            <span className="text-rose-800 bg-rose-50 border-rose-300">
              {t.referralStatus}
            </span>
          )}
        </div>

        <p className="text-xs sm:text-sm text-slate-600 mt-3 max-w-md mx-auto leading-relaxed">
          {isNormal ? t.normalMessage : isRecheck ? t.recheckMessage : t.referralMessage}
        </p>

        <div className="mt-3">
          <AudioVoiceButton
            textToSpeak={spokenSummary}
            language={language}
            label="Listen to screening summary"
          />
        </div>
      </div>

      {/* Clinical Screening Summary Scores Card */}
      <div className="bg-white rounded-[2rem] p-6 sm:p-8 border border-orange-200/80 shadow-md text-left mb-6 space-y-4 relative overflow-hidden">
        {/* Brand accent bar */}
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-orange-600 via-amber-500 to-orange-600" />

        {/* Official Sankara Eye Foundation, India Logo inside Score Card */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-200 gap-3 pt-1">
          <SankaraLogo variant="full" size="lg" />
          <span className="text-[10px] font-black text-orange-800 bg-orange-50 border border-orange-200 px-2.5 py-1 rounded-full uppercase tracking-wider self-start sm:self-auto">
            Vision Screening Report
          </span>
        </div>

        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div>
            <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Student OP Card
            </div>
            <div className="text-sm font-mono font-bold text-slate-800">
              {student.opCardId}
            </div>
          </div>
          <div className="text-right">
            <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Class / Section
            </div>
            <div className="text-sm font-semibold text-slate-700">
              {student.gradeClass} - {student.section}
            </div>
          </div>
        </div>

        {/* Eye Results Grid */}
        <div className="grid grid-cols-2 gap-3">
          <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200">
            <div className="flex items-center gap-1.5 text-xs font-bold text-slate-500 uppercase">
              <Eye className="w-3.5 h-3.5 text-teal-600" />
              <span>{t.rightEyeAcuity}</span>
            </div>
            <div className="text-xl sm:text-2xl font-black text-slate-900 mt-1">
              {session.rightEyeResult?.snellenEquivalent || 'N/A'}
            </div>
            <div className="text-[10px] text-slate-500 mt-0.5">
              LogMAR: {session.rightEyeResult?.logMarEquivalent.toFixed(2) ?? 'N/A'}
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200">
            <div className="flex items-center gap-1.5 text-xs font-bold text-slate-500 uppercase">
              <Eye className="w-3.5 h-3.5 text-teal-600" />
              <span>{t.leftEyeAcuity}</span>
            </div>
            <div className="text-xl sm:text-2xl font-black text-slate-900 mt-1">
              {session.leftEyeResult?.snellenEquivalent || 'N/A'}
            </div>
            <div className="text-[10px] text-slate-500 mt-0.5">
              LogMAR: {session.leftEyeResult?.logMarEquivalent.toFixed(2) ?? 'N/A'}
            </div>
          </div>
        </div>

        {/* Colour Vision Status */}
        {session.colourVisionResult && session.colourVisionResult.tested && (
          <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between">
            <div>
              <div className="text-xs font-bold text-slate-500 uppercase">
                {t.colourVisionAcuity}
              </div>
              <div className="text-xs font-semibold text-slate-800 mt-0.5">
                {session.colourVisionResult.summaryText}
              </div>
            </div>
            <span
              className={`text-xs font-bold px-2.5 py-1 rounded-full ${
                session.colourVisionResult.status === 'normal'
                  ? 'bg-emerald-100 text-emerald-800'
                  : 'bg-amber-100 text-amber-800'
              }`}
            >
              {session.colourVisionResult.correctCount}/{session.colourVisionResult.platesCount}
            </span>
          </div>
        )}

        {/* Referral Box if recommended */}
        {isReferral && (
          <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-950 space-y-2">
            <div className="flex items-center gap-2 font-bold text-xs sm:text-sm text-rose-900">
              <Building2 className="w-4 h-4 text-rose-700" />
              <span>Hospital Follow-up Guidance</span>
            </div>
            <p className="text-xs text-rose-800 leading-relaxed">
              We recommend scheduling a comprehensive vision test at <span className="font-bold">Sankara Eye Hospital</span> or your nearest eye clinic. Follow-up consultation is advised for detailed evaluation.
            </p>
          </div>
        )}

        {/* Storage / Sync notice */}
        <div className="flex items-center justify-between pt-2 text-[11px] text-slate-400">
          <div className="flex items-center gap-1 text-emerald-700 font-medium">
            <Check className="w-3.5 h-3.5 text-emerald-600" />
            <span>{session.syncStatus === 'synced' ? t.syncedNotice : t.offlineNotice}</span>
          </div>
          <span className="font-mono">ID: {session.sessionId.slice(0, 12)}</span>
        </div>
      </div>

      {/* Mandatory Clinical Disclaimer */}
      <div className="mb-6 p-3 rounded-2xl bg-slate-100 border border-slate-200 text-left flex items-start gap-2 text-[11px] text-slate-600 leading-snug">
        <ShieldCheck className="w-4 h-4 text-teal-700 flex-shrink-0 mt-0.5" />
        <p>{t.disclaimer}</p>
      </div>

      {/* Finish Session Button */}
      <button
        type="button"
        onClick={onFinish}
        className="w-full py-4 px-6 bg-teal-600 hover:bg-teal-700 active:scale-98 text-white font-black text-base sm:text-lg rounded-2xl shadow-md flex items-center justify-center gap-2 transition cursor-pointer"
        id="btn-finish-screening"
      >
        <span>{t.returnHome}</span>
        <ArrowRight className="w-5 h-5 stroke-[1.75]" />
      </button>
    </div>
  );
};
