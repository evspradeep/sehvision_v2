'use client';

import React, { useState } from 'react';
import {
  Ruler,
  Check,
  RotateCcw,
  Sliders,
  Camera,
  X,
  Plus,
  Minus,
  CheckCircle2,
  Sparkles,
} from 'lucide-react';
import {
  DistanceCalibrationParams,
  DistanceValidationResult,
} from '@/lib/distanceConfig';
import {
  calibrateToTargetDistance,
  saveDistanceCalibration,
} from '@/lib/distanceEstimation';

interface DistanceCalibrationModalProps {
  isOpen: boolean;
  onClose: () => void;
  validation: DistanceValidationResult;
  calibration: DistanceCalibrationParams;
  onCalibrationChange: (updated: DistanceCalibrationParams) => void;
  facingMode: 'user' | 'environment';
}

export const DistanceCalibrationModal: React.FC<DistanceCalibrationModalProps> = ({
  isOpen,
  onClose,
  validation,
  calibration,
  onCalibrationChange,
  facingMode,
}) => {
  const [successNotice, setSuccessNotice] = useState<string | null>(null);

  if (!isOpen) return null;

  const currentDist = validation.estimatedDistanceMeters;
  const currentMultiplier = calibration.userFocalMultiplier;

  // Handler: Instant 1.00m lock
  const handleCalibrateOneMetre = () => {
    if (currentDist <= 0.3 || currentDist >= 3.5) {
      setSuccessNotice('Face not clearly detected. Please position face in view first.');
      return;
    }
    const updated = calibrateToTargetDistance(currentDist, 1.0, calibration, facingMode);
    onCalibrationChange(updated);
    setSuccessNotice(`Calibrated! Active multiplier set to ${updated.userFocalMultiplier.toFixed(3)}x`);
    setTimeout(() => setSuccessNotice(null), 3500);
  };

  // Handler: Nudge distance by delta cm
  // If user wants distance to read 5cm closer (-0.05m), we adjust multiplier:
  // newDistance = currentDistance + deltaM
  // ratio = (currentDistance + deltaM) / currentDistance
  const handleNudgeDistance = (deltaMeters: number) => {
    if (currentDist <= 0.3 || currentDist >= 3.5) return;
    const targetDist = Math.max(0.4, currentDist + deltaMeters);
    const updated = calibrateToTargetDistance(currentDist, targetDist, calibration, facingMode);
    onCalibrationChange(updated);
    const sign = deltaMeters > 0 ? `+${Math.round(deltaMeters * 100)}` : `${Math.round(deltaMeters * 100)}`;
    setSuccessNotice(`Nudged distance by ${sign} cm (${updated.userFocalMultiplier.toFixed(3)}x)`);
    setTimeout(() => setSuccessNotice(null), 2500);
  };

  // Handler: Lens Preset Selection
  const handlePresetSelect = (presetName: string, multiplier: number) => {
    const updated: DistanceCalibrationParams = {
      ...calibration,
      userFocalMultiplier: multiplier,
      deviceProfileName: presetName,
      lastCalibratedAt: new Date().toISOString(),
    };
    saveDistanceCalibration(updated, facingMode);
    onCalibrationChange(updated);
    setSuccessNotice(`Applied preset: ${presetName}`);
    setTimeout(() => setSuccessNotice(null), 2500);
  };

  // Handler: Reset to factory default
  const handleResetDefault = () => {
    const updated: DistanceCalibrationParams = {
      ...calibration,
      userFocalMultiplier: 1.00,
      lastCalibratedAt: new Date().toISOString(),
    };
    saveDistanceCalibration(updated, facingMode);
    onCalibrationChange(updated);
    setSuccessNotice('Reset to factory default calibration (1.00x)');
    setTimeout(() => setSuccessNotice(null), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div
        className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden flex flex-col max-h-[90vh]"
        id="modal-distance-calibration"
      >
        {/* Header */}
        <div className="px-6 pt-5 pb-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-orange-100 text-orange-600 flex items-center justify-center">
              <Ruler className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 leading-tight">
                Distance Calibration
              </h3>
              <p className="text-[11px] font-medium text-slate-500">
                Fine-tune accuracy for your phone camera
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-200/70 hover:bg-slate-200 text-slate-600 flex items-center justify-center cursor-pointer transition"
            id="btn-close-calibration"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-5 text-sm">
          {/* Live Feedback Banner */}
          <div className="p-4 rounded-2xl bg-gradient-to-br from-slate-900 to-slate-800 text-white flex items-center justify-between shadow-inner">
            <div>
              <span className="text-[10px] font-bold tracking-wider uppercase text-slate-400">
                Live Sensor Distance
              </span>
              <div className="text-3xl font-black tracking-tight text-white flex items-baseline gap-1.5">
                <span>{currentDist ? currentDist.toFixed(2) : '--'}</span>
                <span className="text-sm font-bold text-orange-400">m</span>
                <span className="text-xs font-normal text-slate-300 ml-1">
                  ({validation.estimatedDistanceCm} cm)
                </span>
              </div>
            </div>
            <div className="text-right">
              <span className="text-[10px] font-semibold text-slate-400 block">Active Multiplier</span>
              <span className="text-sm font-extrabold text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded-md border border-emerald-800">
                {currentMultiplier.toFixed(3)}x
              </span>
            </div>
          </div>

          {/* Toast Notification */}
          {successNotice && (
            <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center gap-2 animate-in fade-in slide-in-from-top-1">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{successNotice}</span>
            </div>
          )}

          {/* Quick Action: One-Tap 1.00m Anchor */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-orange-600" />
              <span>One-Tap 1.00 Metre Preset</span>
            </label>
            <p className="text-xs text-slate-600 leading-relaxed">
              If you or the student are currently positioned at 1 metre (measured with an outstretched arm or tape measure), tap below to lock this as 1.00 m:
            </p>
            <button
              type="button"
              onClick={handleCalibrateOneMetre}
              className="w-full py-3 px-4 rounded-xl bg-orange-600 hover:bg-orange-700 active:scale-[0.99] text-white font-bold text-xs flex items-center justify-center gap-2 shadow-sm transition cursor-pointer"
              id="btn-set-1m-target"
            >
              <Check className="w-4 h-4 stroke-[3]" />
              <span>Set Current Distance as Exactly 1.00 m</span>
            </button>
          </div>

          {/* Manual Nudge Distance */}
          <div className="space-y-2 pt-1 border-t border-slate-100">
            <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
              <Sliders className="w-4 h-4 text-slate-600" />
              <span>Manual Distance Nudge</span>
            </label>
            <p className="text-xs text-slate-600">
              Does the reading feel slightly off? Nudge it closer or farther by 5–10 cm:
            </p>
            <div className="grid grid-cols-4 gap-2">
              <button
                type="button"
                onClick={() => handleNudgeDistance(-0.10)}
                className="py-2 px-1 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition cursor-pointer text-center"
                title="Subtract 10 cm"
                id="btn-nudge-minus-10"
              >
                -10 cm
              </button>
              <button
                type="button"
                onClick={() => handleNudgeDistance(-0.05)}
                className="py-2 px-1 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition cursor-pointer text-center"
                title="Subtract 5 cm"
                id="btn-nudge-minus-5"
              >
                -5 cm
              </button>
              <button
                type="button"
                onClick={() => handleNudgeDistance(0.05)}
                className="py-2 px-1 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition cursor-pointer text-center"
                title="Add 5 cm"
                id="btn-nudge-plus-5"
              >
                +5 cm
              </button>
              <button
                type="button"
                onClick={() => handleNudgeDistance(0.10)}
                className="py-2 px-1 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition cursor-pointer text-center"
                title="Add 10 cm"
                id="btn-nudge-plus-10"
              >
                +10 cm
              </button>
            </div>
          </div>

          {/* Camera Lens Presets */}
          <div className="space-y-2 pt-1 border-t border-slate-100">
            <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
              <Camera className="w-4 h-4 text-slate-600" />
              <span>Camera Optical Lens Presets</span>
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => handlePresetSelect('Standard Selfie (74° FOV)', 1.00)}
                className={`p-2.5 rounded-xl border text-left text-xs transition cursor-pointer ${
                  Math.abs(currentMultiplier - 1.00) < 0.02
                    ? 'border-orange-500 bg-orange-50/50 text-orange-950 font-bold'
                    : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-700'
                }`}
                id="btn-preset-standard"
              >
                <div className="font-bold">Standard 1x Lens</div>
                <div className="text-[10px] text-slate-500 font-normal">Standard 74° selfie camera</div>
              </button>

              <button
                type="button"
                onClick={() => handlePresetSelect('Wide Angle (82° FOV)', 0.90)}
                className={`p-2.5 rounded-xl border text-left text-xs transition cursor-pointer ${
                  Math.abs(currentMultiplier - 0.90) < 0.02
                    ? 'border-orange-500 bg-orange-50/50 text-orange-950 font-bold'
                    : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-700'
                }`}
                id="btn-preset-wide"
              >
                <div className="font-bold">Wide / 0.5x Lens</div>
                <div className="text-[10px] text-slate-500 font-normal">Ultra-wide front camera</div>
              </button>

              <button
                type="button"
                onClick={() => handlePresetSelect('Laptop Webcam (73.5° FOV)', 1.02)}
                className={`p-2.5 rounded-xl border text-left text-xs transition cursor-pointer ${
                  Math.abs(currentMultiplier - 1.02) < 0.02
                    ? 'border-orange-500 bg-orange-50/50 text-orange-950 font-bold'
                    : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-700'
                }`}
                id="btn-preset-laptop"
              >
                <div className="font-bold">Laptop Built-in</div>
                <div className="text-[10px] text-slate-500 font-normal">MacBook / PC webcam</div>
              </button>

              <button
                type="button"
                onClick={() => handlePresetSelect('Desktop External (78° FOV)', 0.93)}
                className={`p-2.5 rounded-xl border text-left text-xs transition cursor-pointer ${
                  Math.abs(currentMultiplier - 0.93) < 0.02
                    ? 'border-orange-500 bg-orange-50/50 text-orange-950 font-bold'
                    : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-700'
                }`}
                id="btn-preset-desktop"
              >
                <div className="font-bold">External Webcam</div>
                <div className="text-[10px] text-slate-500 font-normal">Logitech / monitor webcam</div>
              </button>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
          <button
            type="button"
            onClick={handleResetDefault}
            className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800 transition cursor-pointer"
            id="btn-reset-calibration"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset to Default</span>
          </button>

          <button
            type="button"
            onClick={onClose}
            className="py-2 px-5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition cursor-pointer shadow-sm"
            id="btn-done-calibration"
          >
            Save & Close
          </button>
        </div>
      </div>
    </div>
  );
};
