'use client';

import React, { useState } from 'react';
import {
  DistanceCalibrationParams,
  DEFAULT_DISTANCE_CALIBRATION,
} from '@/lib/distanceConfig';
import {
  saveDistanceCalibration,
  resetDistanceCalibration,
  calibrateToTargetDistance,
} from '@/lib/distanceEstimation';
import { Sliders, RotateCcw, Check, Sparkles, Smartphone, Laptop, Camera } from 'lucide-react';

interface DistanceCalibrationProps {
  currentCalibration: DistanceCalibrationParams;
  currentRawDistanceMeters: number;
  onCalibrationChange: (updated: DistanceCalibrationParams) => void;
  onClose?: () => void;
}

export const DistanceCalibration: React.FC<DistanceCalibrationProps> = ({
  currentCalibration,
  currentRawDistanceMeters,
  onCalibrationChange,
  onClose,
}) => {
  const [multiplier, setMultiplier] = useState(currentCalibration.userFocalMultiplier);
  const [savedSuccess, setSavedSuccess] = useState(false);

  // One-tap physical calibration at 1.0 metre
  const handleAutoCalibrateAtOneMeter = () => {
    if (currentRawDistanceMeters <= 0.2 || currentRawDistanceMeters >= 4.0) {
      alert('Please position your face in view of the camera first to calibrate.');
      return;
    }
    const updated = calibrateToTargetDistance(currentRawDistanceMeters, 1.0, currentCalibration);
    setMultiplier(updated.userFocalMultiplier);
    onCalibrationChange(updated);
    showSuccessToast();
  };

  const handleMultiplierSlider = (val: number) => {
    setMultiplier(val);
    const updated: DistanceCalibrationParams = {
      ...currentCalibration,
      userFocalMultiplier: Math.round(val * 100) / 100,
      lastCalibratedAt: new Date().toISOString(),
    };
    saveDistanceCalibration(updated);
    onCalibrationChange(updated);
  };

  const handleSelectPreset = (profileName: string, focalMult: number) => {
    setMultiplier(focalMult);
    const updated: DistanceCalibrationParams = {
      ...currentCalibration,
      userFocalMultiplier: focalMult,
      deviceProfileName: profileName,
      lastCalibratedAt: new Date().toISOString(),
    };
    saveDistanceCalibration(updated);
    onCalibrationChange(updated);
    showSuccessToast();
  };

  const handleReset = () => {
    const defaultParams = resetDistanceCalibration();
    setMultiplier(defaultParams.userFocalMultiplier);
    onCalibrationChange(defaultParams);
    showSuccessToast();
  };

  const showSuccessToast = () => {
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2000);
  };

  return (
    <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200 shadow-xl max-w-md w-full mx-auto text-slate-800 space-y-5" id="distance-calibration-panel">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-100 pb-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-orange-100 text-orange-700 flex items-center justify-center">
            <Sliders className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm sm:text-base font-extrabold text-slate-900">
              Camera Distance Calibration
            </h3>
            <p className="text-[11px] text-slate-500">Fine-tune for your webcam lens field-of-view</p>
          </div>
        </div>
        {savedSuccess && (
          <span className="flex items-center gap-1 text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200 animate-fadeIn">
            <Check className="w-3.5 h-3.5 stroke-[3]" /> Saved
          </span>
        )}
      </div>

      {/* 1-Tap Physical Ruler Calibration */}
      <div className="p-4 rounded-2xl bg-orange-50/60 border border-orange-200/90 space-y-2.5">
        <div className="flex items-center justify-between">
          <span className="text-xs font-black uppercase tracking-wider text-orange-900">
            Quick 1-Metre Physical Calibration
          </span>
          <span className="text-[10px] px-2 py-0.5 rounded-md bg-orange-200/60 text-orange-800 font-bold">
            Recommended
          </span>
        </div>
        <p className="text-xs text-slate-700 leading-relaxed">
          Position yourself or your student at exactly 1.0 metre using a tape measure or 1m cord, then press below:
        </p>
        <button
          type="button"
          onClick={handleAutoCalibrateAtOneMeter}
          className="w-full py-2.5 px-4 rounded-xl bg-orange-600 hover:bg-orange-700 active:scale-[0.99] text-white font-bold text-xs sm:text-sm shadow-md shadow-orange-600/20 flex items-center justify-center gap-2 transition cursor-pointer"
          id="btn-calibrate-1m"
        >
          <Sparkles className="w-4 h-4" />
          <span>Set Current Position as 1.00 m</span>
        </button>
      </div>

      {/* Device Lens Presets */}
      <div className="space-y-2">
        <span className="text-xs font-bold text-slate-700 uppercase tracking-wide">
          Camera Hardware Profiles
        </span>
        <div className="grid grid-cols-3 gap-2">
          <button
            type="button"
            onClick={() => handleSelectPreset('Laptop Webcam', 1.0)}
            className={`p-2.5 rounded-xl border text-center transition cursor-pointer flex flex-col items-center gap-1 ${
              Math.abs(multiplier - 1.0) < 0.03
                ? 'bg-orange-50 border-orange-400 text-orange-950 font-bold shadow-xs'
                : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Laptop className="w-4 h-4" />
            <span className="text-[11px] leading-tight">Laptop</span>
            <span className="text-[9px] text-slate-400">Standard</span>
          </button>

          <button
            type="button"
            onClick={() => handleSelectPreset('Smartphone / Tablet', 0.92)}
            className={`p-2.5 rounded-xl border text-center transition cursor-pointer flex flex-col items-center gap-1 ${
              Math.abs(multiplier - 0.92) < 0.03
                ? 'bg-orange-50 border-orange-400 text-orange-950 font-bold shadow-xs'
                : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Smartphone className="w-4 h-4" />
            <span className="text-[11px] leading-tight">Mobile</span>
            <span className="text-[9px] text-slate-400">Front Camera</span>
          </button>

          <button
            type="button"
            onClick={() => handleSelectPreset('Wide-Angle External', 1.15)}
            className={`p-2.5 rounded-xl border text-center transition cursor-pointer flex flex-col items-center gap-1 ${
              Math.abs(multiplier - 1.15) < 0.03
                ? 'bg-orange-50 border-orange-400 text-orange-950 font-bold shadow-xs'
                : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Camera className="w-4 h-4" />
            <span className="text-[11px] leading-tight">Wide Lens</span>
            <span className="text-[9px] text-slate-400">USB Webcam</span>
          </button>
        </div>
      </div>

      {/* Manual Fine Tuning Slider */}
      <div className="space-y-1.5 pt-1">
        <div className="flex items-center justify-between text-xs">
          <span className="font-bold text-slate-700">Focal Scale Multiplier</span>
          <span className="font-mono font-black text-orange-700 bg-orange-50 px-2 py-0.5 rounded">
            {multiplier.toFixed(2)}x
          </span>
        </div>
        <input
          type="range"
          min="0.60"
          max="1.50"
          step="0.02"
          value={multiplier}
          onChange={(e) => handleMultiplierSlider(parseFloat(e.target.value))}
          className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-orange-600"
          id="slider-focal-multiplier"
        />
        <div className="flex justify-between text-[10px] text-slate-400">
          <span>0.60x (Closer)</span>
          <span>1.00x (Default)</span>
          <span>1.50x (Farther)</span>
        </div>
      </div>

      {/* Footer Actions */}
      <div className="flex items-center justify-between pt-2 border-t border-slate-100">
        <button
          type="button"
          onClick={handleReset}
          className="text-xs font-semibold text-slate-500 hover:text-slate-800 flex items-center gap-1 cursor-pointer"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Reset Defaults</span>
        </button>

        {onClose && (
          <button
            type="button"
            onClick={onClose}
            className="py-1.5 px-4 rounded-xl bg-slate-900 text-white text-xs font-bold hover:bg-slate-800 cursor-pointer"
          >
            Done
          </button>
        )}
      </div>
    </div>
  );
};
