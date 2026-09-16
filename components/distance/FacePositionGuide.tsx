'use client';

import React, { useState, useEffect, useRef } from 'react';
import { DistanceValidationResult } from '@/lib/distanceConfig';
import { ArrowLeft, ArrowRight, ArrowUp, ArrowDown } from 'lucide-react';
import {
  getViewportTransform,
  cameraNormToDisplayPoint,
  evaluateOvalCentering,
} from '@/lib/coordinates';

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
  const { statusColor, stabilityProgress, rawMeasurement } = validation;
  const isRear = facingMode === 'environment';

  const ovalRef = useRef<HTMLDivElement>(null);
  const [ovalDimensions, setOvalDimensions] = useState<{ width: number; height: number }>({
    width: 230,
    height: 300,
  });

  // Measure actual oval container size in CSS pixels
  useEffect(() => {
    const measureOval = () => {
      if (ovalRef.current) {
        const rect = ovalRef.current.getBoundingClientRect();
        if (rect.width > 0 && rect.height > 0) {
          setOvalDimensions({ width: rect.width, height: rect.height });
        }
      }
    };

    measureOval();
    window.addEventListener('resize', measureOval);
    return () => window.removeEventListener('resize', measureOval);
  }, []);

  // Frame colors based on clinical validation state
  const colorMap = {
    green: {
      border: 'border-emerald-500',
      glow: 'shadow-[0_0_24px_rgba(16,185,129,0.35)]',
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

  // Transform raw camera landmarks into actual displayed CSS coordinates inside the oval aperture
  const center = rawMeasurement?.center;
  const vW = videoWidth > 0 ? videoWidth : 640;
  const vH = videoHeight > 0 ? videoHeight : 480;

  const transform = getViewportTransform(
    { width: vW, height: vH },
    ovalDimensions,
    !isRear, // front camera is mirrored
    'cover'
  );

  let displayedCenter: { x: number; y: number } | null = null;
  let showLeftArrow = false;
  let showRightArrow = false;
  let showUpArrow = false;
  let showDownArrow = false;

  if (center) {
    displayedCenter = cameraNormToDisplayPoint(center, transform);
    const ovalCenter = {
      x: ovalDimensions.width / 2,
      y: ovalDimensions.height / 2,
    };
    const centeringEval = evaluateOvalCentering(
      displayedCenter,
      ovalCenter,
      ovalDimensions.width / 2,
      ovalDimensions.height / 2,
      0.35
    );

    if (!centeringEval.isCentered) {
      if (centeringEval.direction === 'left') showLeftArrow = true;
      else if (centeringEval.direction === 'right') showRightArrow = true;
      else if (centeringEval.direction === 'up') showUpArrow = true;
      else if (centeringEval.direction === 'down') showDownArrow = true;
    }
  }

  return (
    <div className="absolute inset-0 flex items-center justify-center overflow-hidden" id="face-guide-wrapper">
      {/* 
        OVAL CAMERA VIEWPORT:
        Responsive size adapting to mobile and desktop displays.
        The video element is mounted strictly inside this container with overflow-hidden and border-radius 50%/44%.
      */}
      <div
        ref={ovalRef}
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
        <div className="absolute top-[38%] left-4 right-4 flex items-center justify-between pointer-events-none z-20 opacity-90">
          <div className="w-5 h-[1.5px] bg-white/90 shadow-2xs" />
          <span className="text-[9px] font-extrabold uppercase tracking-widest text-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.85)] bg-slate-900/60 px-2 py-0.5 rounded-full border border-white/20">
            {isRear ? 'Student Eye Level' : 'Eye Level'}
          </span>
          <div className="w-5 h-[1.5px] bg-white/90 shadow-2xs" />
        </div>

        {/* Optically Mapped Pupil / Face Center Marker */}
        {displayedCenter && (
          <div
            className="absolute w-3.5 h-3.5 rounded-full border-2 border-white shadow-sm transition-all duration-100 z-20 pointer-events-none"
            style={{
              left: `${displayedCenter.x}px`,
              top: `${displayedCenter.y}px`,
              backgroundColor: theme.accent,
              transform: 'translate(-50%, -50%)',
            }}
          />
        )}
      </div>

      {/* Perimeter Overlay: Alignment Brackets, Progress Ring, and Directional Guidance */}
      <div
        className="absolute pointer-events-none flex items-center justify-center z-20"
        style={{
          width: `${ovalDimensions.width}px`,
          height: `${ovalDimensions.height}px`,
        }}
      >
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

        {/* Circular / Oval Stability Ring when in Perfect Distance Range */}
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
              strokeWidth="5"
              strokeDasharray="900"
              strokeDashoffset={900 * (1 - stabilityProgress)}
              className="transition-all duration-100 ease-linear"
            />
          </svg>
        )}

        {/* Off-Center Realtime Directional Indicators positioned relative to screen */}
        {showLeftArrow && (
          <div
            className="absolute -left-12 top-1/2 -translate-y-1/2 bg-amber-500 text-white p-2 rounded-full shadow-md animate-bounce z-20"
            title="Move slightly left"
          >
            <ArrowLeft className="w-5 h-5 stroke-[2]" />
          </div>
        )}
        {showRightArrow && (
          <div
            className="absolute -right-12 top-1/2 -translate-y-1/2 bg-amber-500 text-white p-2 rounded-full shadow-md animate-bounce z-20"
            title="Move slightly right"
          >
            <ArrowRight className="w-5 h-5 stroke-[2]" />
          </div>
        )}
        {showUpArrow && (
          <div
            className="absolute left-1/2 -top-12 -translate-x-1/2 bg-amber-500 text-white p-2 rounded-full shadow-md animate-bounce z-20"
            title="Move slightly up"
          >
            <ArrowUp className="w-5 h-5 stroke-[2]" />
          </div>
        )}
        {showDownArrow && (
          <div
            className="absolute left-1/2 -bottom-12 -translate-x-1/2 bg-amber-500 text-white p-2 rounded-full shadow-md animate-bounce z-20"
            title="Move slightly down"
          >
            <ArrowDown className="w-5 h-5 stroke-[2]" />
          </div>
        )}
      </div>

      {/* Corner Registration Crosshairs on the solid surround */}
      <div className="absolute top-4 left-4 w-6 h-6 border-t-2 border-l-2 border-slate-300 z-10 pointer-events-none" />
      <div className="absolute top-4 right-4 w-6 h-6 border-t-2 border-r-2 border-slate-300 z-10 pointer-events-none" />
      <div className="absolute bottom-4 left-4 w-6 h-6 border-b-2 border-l-2 border-slate-300 z-10 pointer-events-none" />
      <div className="absolute bottom-4 right-4 w-6 h-6 border-b-2 border-r-2 border-slate-300 z-10 pointer-events-none" />
    </div>
  );
};
