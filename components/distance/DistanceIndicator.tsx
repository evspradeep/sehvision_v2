'use client';

import React from 'react';
import { DistanceValidationResult } from '@/lib/distanceConfig';
import {
  CheckCircle2,
  AlertCircle,
  Clock,
  Info,
  Users,
  Maximize2,
  Minimize2,
  Sparkles,
} from 'lucide-react';

interface DistanceIndicatorProps {
  validation: DistanceValidationResult;
  targetDistanceMeters?: number;
}

export const DistanceIndicator: React.FC<DistanceIndicatorProps> = ({
  validation,
  targetDistanceMeters = 1.0,
}) => {
  const {
    formattedDistance,
    estimatedDistanceMeters,
    statusColor,
    statusMessage,
    guidanceText,
    stabilityProgress,
    status,
    faceCount,
    isReady,
  } = validation;

  // Icon selector based on clinical alignment status
  const renderStatusIcon = () => {
    if (isReady) {
      return <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0 stroke-[2.5]" />;
    }
    if (status === 'multiple_faces') {
      return <Users className="w-5 h-5 text-rose-500 shrink-0 stroke-[2.5]" />;
    }
    if (status === 'too_close') {
      return <Minimize2 className="w-5 h-5 text-rose-500 shrink-0 stroke-[2.5]" />;
    }
    if (status === 'too_far') {
      return <Maximize2 className="w-5 h-5 text-rose-500 shrink-0 stroke-[2.5]" />;
    }
    if (status === 'slightly_close' || status === 'slightly_far') {
      return <AlertCircle className="w-5 h-5 text-amber-500 shrink-0 stroke-[2.5]" />;
    }
    if (status === 'perfect_distance') {
      return <Clock className="w-5 h-5 text-emerald-500 shrink-0 stroke-[2.5]" />;
    }
    return <Info className="w-5 h-5 text-slate-400 shrink-0 stroke-[2]" />;
  };

  const badgeBg = {
    green: 'bg-emerald-50 border-emerald-200 text-emerald-900',
    orange: 'bg-amber-50 border-amber-200 text-amber-900',
    amber: 'bg-amber-50 border-amber-200 text-amber-900',
    red: 'bg-rose-50 border-rose-200 text-rose-900',
    slate: 'bg-slate-100 border-slate-200 text-slate-800',
  }[statusColor] || 'bg-slate-100 border-slate-200 text-slate-800';

  const dotColor = {
    green: 'bg-emerald-500 animate-pulse',
    orange: 'bg-amber-500',
    amber: 'bg-amber-500',
    red: 'bg-rose-500',
    slate: 'bg-slate-400',
  }[statusColor] || 'bg-slate-400';

  return (
    <div className="w-full max-w-md mx-auto space-y-3" id="distance-indicator-card">
      {/* Live Distance Value Banner */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs flex items-center justify-between gap-4">
        <div>
          <div className="text-[11px] font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
            <span>Estimated Distance</span>
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 font-semibold">
              Target: {targetDistanceMeters.toFixed(2)} m
            </span>
          </div>
          <div className="flex items-baseline gap-2 mt-0.5">
            <span
              className={`text-3xl sm:text-4xl font-black tracking-tight ${
                statusColor === 'green'
                  ? 'text-emerald-600'
                  : statusColor === 'red'
                  ? 'text-rose-600'
                  : statusColor === 'orange' || statusColor === 'amber'
                  ? 'text-amber-600'
                  : 'text-slate-700'
              }`}
              id="live-distance-value"
            >
              {formattedDistance}
            </span>
            {formattedDistance !== '--' && (
              <span className="text-xs font-semibold text-slate-400">
                (≈ {Math.round(estimatedDistanceMeters * 100)} cm)
              </span>
            )}
          </div>
        </div>

        {/* State Badge Dot */}
        <div className="flex flex-col items-end gap-1">
          <div className="flex items-center gap-2">
            <span className={`w-3 h-3 rounded-full ${dotColor}`} />
            <span className="text-xs font-extrabold uppercase tracking-wide text-slate-700">
              {statusColor === 'green'
                ? isReady
                  ? 'READY'
                  : 'ALIGNED'
                : statusColor === 'red'
                ? 'ADJUST'
                : statusColor === 'orange' || statusColor === 'amber'
                ? 'NEAR TARGET'
                : 'SEARCHING'}
            </span>
          </div>
          {faceCount > 0 && (
            <span className="text-[11px] text-slate-500 font-medium">
              {faceCount === 1 ? '1 face detected' : `${faceCount} faces detected`}
            </span>
          )}
        </div>
      </div>

      {/* Primary Guidance & Status Card */}
      <div
        className={`p-3.5 sm:p-4 rounded-2xl border transition-all duration-200 ${badgeBg}`}
        id="distance-status-badge"
      >
        <div className="flex items-start gap-3">
          {renderStatusIcon()}
          <div className="flex-1 min-w-0">
            <h4 className="text-sm sm:text-base font-extrabold leading-tight tracking-tight flex items-center gap-1.5">
              <span>{statusMessage}</span>
              {isReady && <Sparkles className="w-4 h-4 text-emerald-600 animate-spin" />}
            </h4>
            <p className="text-xs sm:text-[13px] font-medium opacity-90 mt-1 leading-snug">
              {guidanceText}
            </p>
          </div>
        </div>

        {/* Stability Hold Countdown Bar (Shown when position is correct) */}
        {status === 'perfect_distance' && !isReady && (
          <div className="mt-3 pt-3 border-t border-emerald-200/80">
            <div className="flex items-center justify-between text-[11px] font-bold text-emerald-800 mb-1">
              <span>Hold steady at 1.0 m</span>
              <span>{Math.round(stabilityProgress * 100)}%</span>
            </div>
            <div className="w-full h-2 rounded-full bg-emerald-200/80 overflow-hidden">
              <div
                className="h-full bg-emerald-600 transition-all duration-100 ease-linear rounded-full"
                style={{ width: `${stabilityProgress * 100}%` }}
              />
            </div>
          </div>
        )}
      </div>

      {/* Optical Precision Telemetry Strip */}
      {validation.rawMeasurement && validation.faceCount === 1 && (
        <div className="flex items-center justify-between px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-[11px] text-slate-600">
          <div className="flex items-center gap-1.5 font-medium">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>
              {validation.rawMeasurement.irisDiameterNorm
                ? 'High-Precision Iris & 3D Landmark Fusion'
                : 'Facial Biometric Distance Tracking'}
            </span>
          </div>
          <span className="font-bold text-slate-700">
            {validation.rawMeasurement.irisDiameterNorm ? '±2 cm accuracy' : '±4 cm accuracy'}
          </span>
        </div>
      )}

      {/* Clinical Disclaimer Label */}
      <p className="text-[11px] text-slate-500 text-center leading-tight px-2">
        <span className="font-semibold text-slate-700">Clinical Protocol:</span> Calibrated for standard 1.00 m (100 cm) distance screening. Maintain eye-level alignment with camera.
      </p>
    </div>
  );
};
