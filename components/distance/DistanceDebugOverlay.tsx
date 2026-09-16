'use client';

import React from 'react';
import { DistanceValidationResult } from '@/lib/distanceConfig';
import { DeviceProfileInfo } from '@/lib/deviceDetection';

interface DistanceDebugOverlayProps {
  validation: DistanceValidationResult;
  videoDimensions: { width: number; height: number };
  deviceProfile: DeviceProfileInfo;
  calibrationMultiplier: number;
  isOpen: boolean;
  onClose: () => void;
}

export const DistanceDebugOverlay: React.FC<DistanceDebugOverlayProps> = ({
  validation,
  videoDimensions,
  deviceProfile,
  calibrationMultiplier,
  isOpen,
  onClose,
}) => {
  if (!isOpen) return null;

  const raw = validation.rawMeasurement;
  const isPortrait = typeof window !== 'undefined' && window.innerHeight > window.innerWidth;
  const orientation = isPortrait ? 'Portrait' : 'Landscape';
  const vW = videoDimensions.width;
  const vH = videoDimensions.height;
  const sensorDiag = Math.round(Math.hypot(vW, vH));

  // Compute pixel dimensions if available
  const faceWidthPx = raw?.faceWidthNorm && vW > 0 ? Math.round(raw.faceWidthNorm * (sensorDiag * 0.87158)) : null;
  const ipdPx = raw?.interEyeDistancePx ? Math.round(raw.interEyeDistancePx * 10) / 10 : null;

  return (
    <div
      className="fixed inset-x-3 bottom-3 sm:inset-auto sm:top-20 sm:right-4 z-50 max-w-sm w-full bg-slate-950/95 text-emerald-400 font-mono text-[11px] p-3.5 rounded-2xl border border-emerald-500/40 shadow-2xl backdrop-blur-md max-h-[80vh] overflow-y-auto"
      id="distance-debug-overlay"
    >
      <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-800 text-slate-200">
        <div className="flex items-center gap-1.5 font-bold text-xs text-emerald-300">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
          <span>OPTICAL DIAGNOSTIC TELEMETRY</span>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="text-slate-400 hover:text-white px-2 py-0.5 rounded bg-slate-800 text-[10px] font-bold cursor-pointer"
        >
          CLOSE [✕]
        </button>
      </div>

      <div className="space-y-2">
        {/* Device & Orientation */}
        <div>
          <div className="text-[10px] uppercase text-slate-400 font-bold tracking-wider">Device & Viewport</div>
          <div className="grid grid-cols-2 gap-x-2 text-slate-300">
            <div>Device Category:</div>
            <div className="text-white font-semibold">{deviceProfile.category} ({deviceProfile.label})</div>
            <div>Orientation:</div>
            <div className="text-amber-300 font-semibold">{orientation} ({typeof window !== 'undefined' ? `${window.innerWidth}x${window.innerHeight}` : '--'})</div>
            <div>Camera Sensor:</div>
            <div className="text-white">{vW}x{vH} px (diag: {sensorDiag}px)</div>
            <div>Focal Multiplier:</div>
            <div className="text-white">{calibrationMultiplier.toFixed(3)}x</div>
          </div>
        </div>

        {/* Distance Engine */}
        <div className="pt-1.5 border-t border-slate-800/80">
          <div className="text-[10px] uppercase text-slate-400 font-bold tracking-wider">Distance State</div>
          <div className="grid grid-cols-2 gap-x-2 text-slate-300">
            <div>Estimated Dist:</div>
            <div className="text-emerald-300 font-bold">{validation.formattedDistance} ({validation.estimatedDistanceCm} cm)</div>
            <div>Internal Status:</div>
            <div className="text-white font-semibold">{validation.status}</div>
            <div>Modular Status:</div>
            <div className="text-amber-300 font-bold">{validation.estimatorStatus || (validation.isReady ? 'READY' : 'PENDING')}</div>
            <div>Confidence:</div>
            <div className="text-white">{Math.round(validation.confidence * 100)}%</div>
            <div>1m Gate Lock:</div>
            <div className={validation.isReady ? 'text-emerald-400 font-bold' : 'text-slate-400'}>
              {validation.isReady ? 'UNLOCKED (READY)' : `HOLDING (${Math.round(validation.stabilityProgress * 100)}%)`}
            </div>
            <div>Stability Hold:</div>
            <div className="text-white">{validation.stabilityElapsedMs}ms / 1500ms</div>
          </div>
        </div>

        {/* Face Landmark Telemetry */}
        <div className="pt-1.5 border-t border-slate-800/80">
          <div className="text-[10px] uppercase text-slate-400 font-bold tracking-wider">Landmark Geometry</div>
          {raw ? (
            <div className="grid grid-cols-2 gap-x-2 text-slate-300">
              <div>Faces Detected:</div>
              <div className="text-white">{raw.faceCount}</div>
              <div>Inter-Eye (IPD):</div>
              <div className="text-emerald-300">{ipdPx ? `${ipdPx} px` : '--'} ({raw.interpupillaryDistanceNorm ? raw.interpupillaryDistanceNorm.toFixed(4) : '--'})</div>
              <div>Iris Diameter:</div>
              <div className="text-white">{raw.irisDiameterNorm ? raw.irisDiameterNorm.toFixed(5) : 'Facial profile'}</div>
              <div>Face Width:</div>
              <div className="text-white">{faceWidthPx ? `${faceWidthPx} px` : '--'} ({raw.faceWidthNorm?.toFixed(3) ?? '--'})</div>
              <div>Face Center:</div>
              <div className="text-white">x: {raw.center?.x.toFixed(3)}, y: {raw.center?.y.toFixed(3)}</div>
              <div>Head Roll / Tilt:</div>
              <div className={Math.abs(raw.headRollDeg || 0) > 12 ? 'text-rose-400' : 'text-slate-300'}>
                {raw.headRollDeg ? `${raw.headRollDeg.toFixed(1)}°` : '0°'}
              </div>
              <div>Head Yaw:</div>
              <div className={Math.abs(raw.headYawDeg || 0) > 18 ? 'text-rose-400' : 'text-slate-300'}>
                {raw.headYawDeg ? `${raw.headYawDeg.toFixed(1)}°` : '0°'}
              </div>
              <div>Frame Luminance:</div>
              <div className={raw.isLowLight ? 'text-amber-400 font-bold' : 'text-emerald-400'}>
                {raw.luminance ?? 120}/255 {raw.isLowLight ? '⚠️ LOW LIGHT' : '✓ OK'}
              </div>
              <div>Tracking Engine:</div>
              <div className="text-slate-400 truncate">{raw.trackingMethod || 'mediapipe'}</div>
            </div>
          ) : (
            <div className="text-slate-500 italic">No face measurement data received</div>
          )}
        </div>
      </div>
    </div>
  );
};
