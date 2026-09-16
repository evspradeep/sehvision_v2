'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { STANDARD_CARD_WIDTH_MM, STANDARD_CARD_HEIGHT_MM, DEFAULT_FALLBACK_PX_PER_MM } from '@/lib/optotypeMath';
import { CalibrationData } from '@/lib/types';
import { saveDeviceCalibration, getDeviceCalibration } from '@/lib/storage';
import { CreditCard, CheckCircle2, RotateCcw, HelpCircle, ShieldCheck } from 'lucide-react';

interface CalibrationBoxProps {
  onComplete: (calibration: CalibrationData) => void;
  onCancel?: () => void;
  initialPxPerMm?: number;
}

export const CalibrationBox: React.FC<CalibrationBoxProps> = ({
  onComplete,
  onCancel,
  initialPxPerMm,
}) => {
  // Card standard dimensions
  const cardWidthMm = STANDARD_CARD_WIDTH_MM; // 85.6 mm
  const cardAspectRatio = STANDARD_CARD_HEIGHT_MM / STANDARD_CARD_WIDTH_MM; // ~0.63

  // Load existing or estimate initial width in CSS pixels
  const [cardWidthPx, setCardWidthPx] = useState<number>(() => {
    if (typeof window !== 'undefined') {
      const saved = getDeviceCalibration();
      if (saved && saved.userAdjustedPx > 100) {
        return saved.userAdjustedPx;
      }
      if (initialPxPerMm) {
        return Math.round(cardWidthMm * initialPxPerMm);
      }
    }
    return Math.round(cardWidthMm * DEFAULT_FALLBACK_PX_PER_MM); // ~324px
  });

  const [activeTab, setActiveTab] = useState<'card' | 'ruler'>('card');
  const [showGuide, setShowGuide] = useState(false);

  // Derived pixels per millimeter
  const currentPxPerMm = useMemo(() => {
    return cardWidthPx / cardWidthMm;
  }, [cardWidthPx, cardWidthMm]);

  // Derived estimated screen PPI
  const estimatedDpi = useMemo(() => {
    return Math.round(currentPxPerMm * 25.4);
  }, [currentPxPerMm]);

  // Step adjustments
  const adjustPx = (delta: number) => {
    setCardWidthPx(prev => Math.min(600, Math.max(160, prev + delta)));
  };

  const handleConfirm = () => {
    const dpr = typeof window !== 'undefined' ? window.devicePixelRatio || 1 : 1;
    const sWidth = typeof window !== 'undefined' ? window.screen.width : 0;
    const sHeight = typeof window !== 'undefined' ? window.screen.height : 0;
    const vWidth = typeof window !== 'undefined' ? window.innerWidth : 0;
    const vHeight = typeof window !== 'undefined' ? window.innerHeight : 0;

    const calibrationData: CalibrationData = {
      pxPerMm: currentPxPerMm,
      calibratedObjectWidthMm: cardWidthMm,
      userAdjustedPx: cardWidthPx,
      dpr,
      screenWidth: sWidth,
      screenHeight: sHeight,
      viewportWidth: vWidth,
      viewportHeight: vHeight,
      userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : 'unknown',
      calibratedAt: new Date().toISOString(),
      method: activeTab,
    };

    saveDeviceCalibration(calibrationData);
    onComplete(calibrationData);
  };

  const handleResetToStandard = () => {
    setCardWidthPx(Math.round(cardWidthMm * DEFAULT_FALLBACK_PX_PER_MM));
  };

  return (
    <div className="w-full max-w-xl mx-auto bg-white rounded-[2rem] shadow-sm border border-slate-200 overflow-hidden" id="calibration-box-container">
      {/* Header */}
      <div className="bg-slate-900 text-white p-5 sm:p-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-teal-500/20 text-teal-400 flex items-center justify-center border border-teal-400/30">
            <CreditCard className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base sm:text-lg font-bold text-white tracking-tight">
              Screen Size Calibration
            </h2>
            <p className="text-xs text-slate-300">
              Matches digital optotype to physical centimetres
            </p>
          </div>
        </div>

        <button
          onClick={() => setShowGuide(!showGuide)}
          className="text-xs flex items-center gap-1.5 text-slate-300 hover:text-white bg-slate-800 px-3 py-1.5 rounded-xl transition cursor-pointer"
          id="btn-calibration-help"
        >
          <HelpCircle className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">How to match</span>
        </button>
      </div>

      {showGuide && (
        <div className="bg-sky-50 border-b border-sky-100 p-4 text-xs text-sky-950 space-y-1.5 leading-relaxed">
          <p className="font-semibold text-sky-900">Why is this essential?</p>
          <p>
            Different screens (iPhones, Android tablets, laptops) have different pixel densities. 
            By aligning the on-screen card outline with your real physical Sankara OP card or school ID card, 
            we calibrate the exact visual angle for the child’s vision test.
          </p>
        </div>
      )}

      {/* Main Calibration Canvas */}
      <div className="p-4 sm:p-6 flex flex-col items-center">
        <p className="text-xs sm:text-sm font-medium text-slate-700 text-center mb-4">
          Place your physical <span className="font-bold text-slate-900">Sankara OP Card</span> or any <span className="font-bold text-slate-900">Standard ID / ATM Card</span> directly on the screen:
        </p>

        {/* The Card Outline to Match */}
        <div
          id="calibration-target-card"
          className="relative transition-all duration-75 flex flex-col justify-between p-3.5 rounded-xl border-2 border-dashed border-teal-600 bg-gradient-to-br from-teal-50 to-sky-50 shadow-inner select-none overflow-hidden"
          style={{
            width: `${cardWidthPx}px`,
            height: `${cardWidthPx * cardAspectRatio}px`,
          }}
        >
          {/* Card branding mock to simulate card visual alignment */}
          <div className="flex items-center justify-between pointer-events-none">
            <span className="text-[11px] font-bold tracking-wider text-teal-800 uppercase">
              Sankara OP Card
            </span>
            <span className="text-[10px] font-mono font-semibold text-slate-600">
              85.6 × 54 mm
            </span>
          </div>

          <div className="text-center pointer-events-none my-auto">
            <div className="text-xs font-semibold text-teal-900">
              Align physical card edges here
            </div>
            <div className="text-[10px] text-slate-500 font-mono mt-0.5">
              Current Width: {cardWidthPx}px (≈ {currentPxPerMm.toFixed(2)} px/mm)
            </div>
          </div>

          <div className="flex items-center justify-between text-[9px] text-slate-500 font-mono pointer-events-none">
            <span>ISO/IEC 7810 ID-1</span>
            <span>Est: {estimatedDpi} DPI</span>
          </div>

          {/* Golden chip replica to help child visually orient card */}
          <div className="absolute top-7 left-4 w-7 h-5 rounded bg-amber-200 border border-amber-400 opacity-60 pointer-events-none" />
        </div>

        {/* Interactive Sizing Stepper Controls */}
        <div className="w-full mt-6 space-y-4">
          <div className="flex items-center justify-center gap-2">
            <button
              onClick={() => adjustPx(-5)}
              className="px-3 py-2 text-xs font-bold bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg transition active:scale-95"
              id="btn-calib-minus-5"
              title="Shrink by 5 pixels"
            >
              -5 px
            </button>
            <button
              onClick={() => adjustPx(-1)}
              className="px-4 py-2 text-sm font-bold bg-slate-200 hover:bg-slate-300 text-slate-900 rounded-lg transition active:scale-95"
              id="btn-calib-minus-1"
              title="Shrink by 1 pixel"
            >
              -
            </button>

            <span className="px-4 py-1.5 bg-slate-100 border border-slate-200 rounded-lg font-mono text-sm font-bold text-slate-800 min-w-[80px] text-center">
              {cardWidthPx} px
            </span>

            <button
              onClick={() => adjustPx(1)}
              className="px-4 py-2 text-sm font-bold bg-slate-200 hover:bg-slate-300 text-slate-900 rounded-lg transition active:scale-95"
              id="btn-calib-plus-1"
              title="Enlarge by 1 pixel"
            >
              +
            </button>
            <button
              onClick={() => adjustPx(5)}
              className="px-3 py-2 text-xs font-bold bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg transition active:scale-95"
              id="btn-calib-plus-5"
              title="Enlarge by 5 pixels"
            >
              +5 px
            </button>
          </div>

          {/* Slider for quick thumb adjustment */}
          <div className="px-3">
            <input
              type="range"
              min={200}
              max={500}
              value={cardWidthPx}
              onChange={(e) => setCardWidthPx(Number(e.target.value))}
              className="w-full accent-teal-600 h-2 bg-slate-200 rounded-lg cursor-pointer"
              id="slider-calibration-width"
            />
          </div>

          {/* Quick Preset Reset */}
          <div className="flex items-center justify-between text-xs text-slate-500 pt-1 border-t border-slate-100">
            <button
              onClick={handleResetToStandard}
              className="flex items-center gap-1 hover:text-slate-800 transition"
              id="btn-reset-calib"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Reset to device default
            </button>
            <span className="text-[11px] font-mono text-slate-400">
              Factor: {currentPxPerMm.toFixed(3)} px/mm
            </span>
          </div>
        </div>
      </div>

      {/* Confirmation Footer */}
      <div className="p-4 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-xs text-emerald-800 font-medium">
          <ShieldCheck className="w-4 h-4 text-emerald-600 flex-shrink-0" />
          <span>Screen calibration ensures standardized visual acuity</span>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          {onCancel && (
            <button
              onClick={onCancel}
              className="flex-1 sm:flex-none px-4 py-2.5 text-xs font-semibold text-slate-600 hover:text-slate-800 rounded-xl transition"
              id="btn-cancel-calibration"
            >
              Cancel
            </button>
          )}
          <button
            onClick={handleConfirm}
            className="flex-1 sm:flex-none px-6 py-2.5 bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs sm:text-sm rounded-xl shadow-sm flex items-center justify-center gap-2 transition active:scale-98"
            id="btn-confirm-calibration"
          >
            <CheckCircle2 className="w-4 h-4" />
            CALIBRATION CONFIRMED
          </button>
        </div>
      </div>
    </div>
  );
};
