'use client';

import React, { useState, useEffect } from 'react';
import { CalibrationData, EyeTested, OptotypeOrientation } from '@/lib/types';
import { mmToPixels } from '@/lib/optotypeMath';
import { Wrench, Eye, Monitor, X } from 'lucide-react';

interface DebugOverlayProps {
  calibration: CalibrationData;
  testingDistanceCm: number;
  currentSizeMm: number;
  snellenLevel: string;
  eye: EyeTested;
  orientation: OptotypeOrientation;
  currentTrial: number;
  totalTrials: number;
  defaultOpen?: boolean;
}

export const DebugOverlay: React.FC<DebugOverlayProps> = ({
  calibration,
  testingDistanceCm,
  currentSizeMm,
  snellenLevel,
  eye,
  orientation,
  currentTrial,
  totalTrials,
  defaultOpen = false,
}) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  const [viewport, setViewport] = useState({ w: 0, h: 0 });

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const update = () => setViewport({ w: window.innerWidth, h: window.innerHeight });
      update();
      window.addEventListener('resize', update);
      return () => window.removeEventListener('resize', update);
    }
  }, []);

  const renderedPx = mmToPixels(currentSizeMm, calibration.pxPerMm);

  // Compute visual angle in arcminutes subtended at patient eye
  // θ = 2 * arctan(height / (2 * distance))
  const distanceMm = testingDistanceCm * 10;
  const angleRad = 2 * Math.atan(currentSizeMm / (2 * distanceMm));
  const arcMinutes = (angleRad * 180 / Math.PI) * 60;

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-3 right-3 z-40 px-2.5 py-1.5 bg-slate-900/80 hover:bg-slate-900 text-slate-200 text-[11px] font-mono rounded-lg shadow-md border border-slate-700 flex items-center gap-1.5 backdrop-blur transition"
        id="btn-open-clinical-debug"
        title="Open Clinical & Optical Debug HUD"
      >
        <Wrench className="w-3.5 h-3.5 text-teal-400" />
        <span>Clinical HUD</span>
      </button>
    );
  }

  return (
    <div
      className="fixed bottom-3 right-3 z-50 w-80 max-w-[calc(100vw-24px)] bg-slate-950/95 text-slate-200 text-xs font-mono rounded-xl p-3.5 shadow-2xl border border-teal-500/40 backdrop-blur-md"
      id="clinical-optometric-debug-hud"
    >
      <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-800">
        <div className="flex items-center gap-1.5 text-teal-400 font-bold">
          <Eye className="w-4 h-4" />
          <span>Sankara Clinical HUD</span>
        </div>
        <button
          onClick={() => setIsOpen(false)}
          className="text-slate-400 hover:text-white p-1 rounded transition"
          id="btn-close-debug-hud"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>

      <div className="space-y-1.5 text-[11px]">
        <div className="flex justify-between">
          <span className="text-slate-400">Eye Tested:</span>
          <span className="font-bold text-white uppercase">{eye}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-slate-400">Snellen Level:</span>
          <span className="font-bold text-teal-300">{snellenLevel} (Trial {currentTrial}/{totalTrials})</span>
        </div>
        <div className="flex justify-between">
          <span className="text-slate-400">E Orientation:</span>
          <span className="font-bold text-amber-300 uppercase">{orientation}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-slate-400">Testing Distance:</span>
          <span className="font-semibold text-white">{testingDistanceCm} cm ({testingDistanceCm / 100} m)</span>
        </div>
        <div className="flex justify-between">
          <span className="text-slate-400">Target Physical Size:</span>
          <span className="font-bold text-emerald-400">{currentSizeMm.toFixed(2)} mm ({ (currentSizeMm / 10).toFixed(2) } cm)</span>
        </div>
        <div className="flex justify-between">
          <span className="text-slate-400">Rendered Screen Size:</span>
          <span className="font-bold text-emerald-300">{renderedPx} px</span>
        </div>
        <div className="flex justify-between">
          <span className="text-slate-400">Visual Angle:</span>
          <span className="font-semibold text-sky-300">{arcMinutes.toFixed(2)} arcmin</span>
        </div>

        <div className="pt-2 mt-2 border-t border-slate-800 space-y-1 text-[10px] text-slate-400">
          <div className="flex justify-between">
            <span>Calibration Factor:</span>
            <span className="text-slate-300 font-bold">{calibration.pxPerMm.toFixed(3)} px/mm</span>
          </div>
          <div className="flex justify-between">
            <span>Device DPR:</span>
            <span className="text-slate-300">{typeof window !== 'undefined' ? window.devicePixelRatio : 1}</span>
          </div>
          <div className="flex justify-between">
            <span>Viewport:</span>
            <span className="text-slate-300">{viewport.w} × {viewport.h}</span>
          </div>
          <div className="flex justify-between">
            <span>Screen:</span>
            <span className="text-slate-300">{calibration.screenWidth} × {calibration.screenHeight}</span>
          </div>
        </div>

        <div className="pt-1.5 text-[9px] text-teal-400/80 leading-tight">
          ✓ Reference physical chart E: ~1.4 cm × 1.4 cm maintained via geometric calibration
        </div>
      </div>
    </div>
  );
};
