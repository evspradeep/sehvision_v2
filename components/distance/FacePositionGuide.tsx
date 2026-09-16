'use client';

import React from 'react';
import { DistanceValidationResult } from '@/lib/distanceConfig';
import { ArrowLeft, ArrowRight, ArrowUp, ArrowDown } from 'lucide-react';

interface FacePositionGuideProps {
  validation: DistanceValidationResult;
  videoWidth: number;
  videoHeight: number;
  facingMode?: 'user' | 'environment';
  children?: React.ReactNode;
}

export const FacePositionGuide: React.FC<FacePositionGuideProps> = ({
  validation,
  videoWidth,
  videoHeight,
  facingMode = 'user',
  children,
}) => {
  const { statusColor, isCentered, status, stabilityProgress, rawMeasurement } = validation;
  const isRear = facingMode === 'environment';

  // Frame colors based on clinical validation state
  const colorMap = {
    green: {
      border: 'border-emerald-500',
      glow: 'shadow-[0_0_24px_rgba(16,185,129,0.3)]',
      bg: 'bg-emerald-500/10',
      accent: '#10B981',
      text: 'text-emerald-400',
    },
    orange: {
      border: 'border-amber-500',
      glow: 'shadow-[0_0_20px_rgba(245,158,11,0.25)]',
      bg: 'bg-amber-500/10',
      accent: '#F59E0B',
      text: 'text-amber-400',
    },
    amber: {
      border: 'border-amber-500',
      glow: 'shadow-[0_0_20px_rgba(245,158,11,0.25)]',
      bg: 'bg-amber-500/10',
      accent: '#F59E0B',
      text: 'text-amber-400',
    },
    red: {
      border: 'border-rose-500',
      glow: 'shadow-[0_0_20px_rgba(244,63,94,0.25)]',
      bg: 'bg-rose-500/10',
      accent: '#F43F5E',
      text: 'text-rose-400',
    },
    slate: {
      border: 'border-slate-300',
      glow: 'shadow-none',
      bg: 'bg-slate-100',
      accent: '#94A3B8',
      text: 'text-slate-400',
    },
  };

  const theme = colorMap[statusColor] || colorMap.slate;

  // Detect directional arrows if off-center
  const center = rawMeasurement?.center;
  // In front camera (mirrored), center.x > 0.65 means subject appears on screen right
  // In rear camera (non-mirrored viewfinder), center.x > 0.65 means subject is to the right
  const showLeftArrow = isRear ? (center && center.x < 0.35) : (center && center.x > 0.65);
  const showRightArrow = isRear ? (center && center.x > 0.65) : (center && center.x < 0.35);
  const showUpArrow = center && center.y > 0.60;
  const showDownArrow = center && center.y < 0.30;

  return (
    <div className="absolute inset-0 flex items-center justify-center overflow-hidden">
      {/* 
        OVAL CAMERA VIEWPORT:
        The video element is mounted strictly inside this container with overflow-hidden and border-radius 50%/44%.
        Outside this oval's line, nothing of the camera is visible; only the surrounding white background.
      */}
      <div
        className={`relative w-[210px] h-[280px] sm:w-[240px] sm:h-[320px] rounded-[50%/44%] overflow-hidden border-[4px] ${theme.border} ${theme.glow} bg-slate-900 flex items-center justify-center transition-all duration-300 z-10`}
        style={{
          borderRadius: '50% / 44%',
          WebkitMaskImage: '-webkit-radial-gradient(white, black)',
        }}
        id="camera-oval-aperture"
      >
        {/* The Live Video Element rendered strictly inside the oval */}
        {children}

        {/* Eye Level Reference Line inside the oval */}
        <div className="absolute top-[38%] left-5 right-5 flex items-center justify-between pointer-events-none z-20 opacity-90">
          <div className="w-5 h-[1.5px] bg-white/90 shadow-2xs" />
          <span className="text-[9px] font-extrabold uppercase tracking-widest text-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.85)] bg-slate-900/60 px-2 py-0.5 rounded-full border border-white/20">
            {isRear ? 'Student Eye Level' : 'Eye Level'}
          </span>
          <div className="w-5 h-[1.5px] bg-white/90 shadow-2xs" />
        </div>

        {/* Live Pupil / Center Landmark feedback */}
        {rawMeasurement?.center && (
          <div
            className="absolute w-3.5 h-3.5 rounded-full border-2 border-white shadow-sm transition-all duration-150 z-20 pointer-events-none"
            style={{
              left: isRear
                ? `${rawMeasurement.center.x * 100}%`
                : `${(1 - rawMeasurement.center.x) * 100}%`,
              top: `${rawMeasurement.center.y * 100}%`,
              backgroundColor: theme.accent,
              transform: 'translate(-50%, -50%)',
            }}
          />
        )}
      </div>

      {/* Perimeter Overlay: Alignment Brackets, Progress Ring, and Arrows */}
      <div className="absolute w-[210px] h-[280px] sm:w-[240px] sm:h-[320px] pointer-events-none flex items-center justify-center z-20">
        {/* Target Alignment Bracket Notches on the oval perimeter */}
        <div
          className="absolute -top-3 left-1/2 -translate-x-1/2 w-8 h-1.5 rounded-full shadow-2xs transition-colors duration-300 z-20"
          style={{ backgroundColor: theme.accent }}
        />
        <div
          className="absolute -bottom-3 left-1/2 -translate-x-1/2 w-8 h-1.5 rounded-full shadow-2xs transition-colors duration-300 z-20"
          style={{ backgroundColor: theme.accent }}
        />
        <div
          className="absolute top-1/2 -left-3 -translate-y-1/2 h-8 w-1.5 rounded-full shadow-2xs transition-colors duration-300 z-20"
          style={{ backgroundColor: theme.accent }}
        />
        <div
          className="absolute top-1/2 -right-3 -translate-y-1/2 h-8 w-1.5 rounded-full shadow-2xs transition-colors duration-300 z-20"
          style={{ backgroundColor: theme.accent }}
        />

        {/* Circular / Oval Stability Ring when in Perfect Distance */}
        {stabilityProgress > 0 && (
          <svg className="absolute inset-[-8px] w-[calc(100%+16px)] h-[calc(100%+16px)] pointer-events-none -rotate-90 z-20">
            <rect
              x="4"
              y="4"
              width="calc(100% - 8px)"
              height="calc(100% - 8px)"
              rx="50%"
              ry="44%"
              fill="none"
              stroke="#10B981"
              strokeWidth="4.5"
              strokeDasharray="900"
              strokeDashoffset={900 * (1 - stabilityProgress)}
              className="transition-all duration-100 ease-linear"
            />
          </svg>
        )}

        {/* Off-Center Realtime Directional Indicators (Thinned stroke) on the pure white stage */}
        {showLeftArrow && (
          <div className="absolute -left-12 top-1/2 -translate-y-1/2 bg-amber-500 text-white p-2 rounded-full shadow-md animate-bounce z-20">
            <ArrowLeft className="w-5 h-5 stroke-[1.75]" />
          </div>
        )}
        {showRightArrow && (
          <div className="absolute -right-12 top-1/2 -translate-y-1/2 bg-amber-500 text-white p-2 rounded-full shadow-md animate-bounce z-20">
            <ArrowRight className="w-5 h-5 stroke-[1.75]" />
          </div>
        )}
        {showUpArrow && (
          <div className="absolute left-1/2 -top-12 -translate-x-1/2 bg-amber-500 text-white p-2 rounded-full shadow-md animate-bounce z-20">
            <ArrowUp className="w-5 h-5 stroke-[1.75]" />
          </div>
        )}
        {showDownArrow && (
          <div className="absolute left-1/2 -bottom-12 -translate-x-1/2 bg-amber-500 text-white p-2 rounded-full shadow-md animate-bounce z-20">
            <ArrowDown className="w-5 h-5 stroke-[1.75]" />
          </div>
        )}
      </div>

      {/* Corner Registration Crosshairs on the solid white surround */}
      <div className="absolute top-4 left-4 w-6 h-6 border-t-2 border-l-2 border-slate-300 z-10 pointer-events-none" />
      <div className="absolute top-4 right-4 w-6 h-6 border-t-2 border-r-2 border-slate-300 z-10 pointer-events-none" />
      <div className="absolute bottom-4 left-4 w-6 h-6 border-b-2 border-l-2 border-slate-300 z-10 pointer-events-none" />
      <div className="absolute bottom-4 right-4 w-6 h-6 border-b-2 border-r-2 border-slate-300 z-10 pointer-events-none" />
    </div>
  );
};
