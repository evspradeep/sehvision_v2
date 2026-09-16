'use client';

import React, { useState } from 'react';
import { TumblingE } from './TumblingE';
import {
  DeviceScreenType,
  DEVICE_PRESETS,
  STANDARD_CARD_WIDTH_MM,
} from '@/lib/optotypeMath';
import { CalibrationData } from '@/lib/types';
import { saveDeviceCalibration } from '@/lib/storage';
import {
  Ruler,
  Smartphone,
  Tablet,
  Laptop,
  Monitor,
  Check,
  RotateCcw,
  Plus,
  Minus,
  X,
  CreditCard,
  Sliders,
} from 'lucide-react';

interface RulerCalibrationModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentPxPerMm: number;
  onApplyCalibration: (newPxPerMm: number) => void;
  deviceType: DeviceScreenType;
}

export const RulerCalibrationModal: React.FC<RulerCalibrationModalProps> = (props) => {
  if (!props.isOpen) return null;
  return <RulerCalibrationDialog {...props} key={`${props.currentPxPerMm}-${props.deviceType}`} />;
};

const RulerCalibrationDialog: React.FC<RulerCalibrationModalProps> = ({
  onClose,
  currentPxPerMm,
  onApplyCalibration,
  deviceType,
}) => {
  const [activeTab, setActiveTab] = useState<'ruler' | 'card'>('ruler');
  const [tempPxPerMm, setTempPxPerMm] = useState<number>(currentPxPerMm);
  const [selectedPreset, setSelectedPreset] = useState<DeviceScreenType>(deviceType);

  const targetSymbolMm = 14.0; // 1.4 cm
  const currentRenderedPx = Math.round(targetSymbolMm * tempPxPerMm);

  // Card calibration state
  const cardWidthPx = Math.round(STANDARD_CARD_WIDTH_MM * tempPxPerMm);

  const handleSelectPreset = (presetKey: DeviceScreenType) => {
    setSelectedPreset(presetKey);
    const preset = DEVICE_PRESETS[presetKey];
    setTempPxPerMm(preset.pxPerMm);
  };

  const handleNudge = (deltaPx: number) => {
    // Modify pxPerMm by small delta
    const newPx = Math.max(30, currentRenderedPx + deltaPx);
    const newPxPerMm = newPx / targetSymbolMm;
    setTempPxPerMm(newPxPerMm);
  };

  const handleReset = () => {
    const defaultPreset = DEVICE_PRESETS[deviceType];
    setSelectedPreset(deviceType);
    setTempPxPerMm(defaultPreset.pxPerMm);
  };

  const handleSaveAndApply = () => {
    onApplyCalibration(tempPxPerMm);

    // Save to localStorage
    const dpr = typeof window !== 'undefined' ? window.devicePixelRatio || 1 : 1;
    const sWidth = typeof window !== 'undefined' ? window.screen.width : 0;
    const sHeight = typeof window !== 'undefined' ? window.screen.height : 0;
    const vWidth = typeof window !== 'undefined' ? window.innerWidth : 0;
    const vHeight = typeof window !== 'undefined' ? window.innerHeight : 0;

    const data: CalibrationData = {
      pxPerMm: tempPxPerMm,
      calibratedObjectWidthMm: targetSymbolMm,
      userAdjustedPx: currentRenderedPx,
      dpr,
      screenWidth: sWidth,
      screenHeight: sHeight,
      viewportWidth: vWidth,
      viewportHeight: vHeight,
      userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : 'unknown',
      calibratedAt: new Date().toISOString(),
      method: activeTab === 'card' ? 'card' : 'ruler',
    };
    saveDeviceCalibration(data);
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/70 backdrop-blur-xs animate-fadeIn"
      id="modal-ruler-calibration"
    >
      <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="bg-slate-900 text-white p-4 sm:p-5 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-orange-500/20 text-orange-400 flex items-center justify-center border border-orange-500/30">
              <Ruler className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white tracking-tight flex items-center gap-2">
                1.4 cm Size Verification
              </h2>
              <p className="text-xs text-slate-300">
                Guarantees the symbol is physical 1.4 cm on any screen
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center justify-center transition cursor-pointer"
            aria-label="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-5">
          {/* Mode Selector */}
          <div className="flex rounded-xl bg-slate-100 p-1">
            <button
              type="button"
              onClick={() => setActiveTab('ruler')}
              className={`flex-1 py-2 text-xs font-bold rounded-lg flex items-center justify-center gap-1.5 transition cursor-pointer ${
                activeTab === 'ruler'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Ruler className="w-3.5 h-3.5" />
              Ruler & Device Presets
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('card')}
              className={`flex-1 py-2 text-xs font-bold rounded-lg flex items-center justify-center gap-1.5 transition cursor-pointer ${
                activeTab === 'card'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <CreditCard className="w-3.5 h-3.5" />
              Debit / ID Card Match
            </button>
          </div>

          {activeTab === 'ruler' ? (
            <>
              {/* Device Presets */}
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-2">
                  Select Device Screen Type:
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {(
                    [
                      { key: 'mobile', label: 'Mobile', icon: Smartphone },
                      { key: 'tablet', label: 'Tablet', icon: Tablet },
                      { key: 'laptop', label: 'Laptop', icon: Laptop },
                      { key: 'desktop', label: 'PC Monitor', icon: Monitor },
                    ] as const
                  ).map(item => {
                    const Icon = item.icon;
                    const isSelected = selectedPreset === item.key;
                    const preset = DEVICE_PRESETS[item.key];
                    return (
                      <button
                        key={item.key}
                        type="button"
                        onClick={() => handleSelectPreset(item.key)}
                        className={`p-2.5 rounded-xl border text-center transition flex flex-col items-center gap-1.5 cursor-pointer ${
                          isSelected
                            ? 'border-orange-500 bg-orange-50/80 text-orange-950 font-bold ring-1 ring-orange-400'
                            : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-700'
                        }`}
                      >
                        <Icon
                          className={`w-4 h-4 ${
                            isSelected ? 'text-orange-600' : 'text-slate-400'
                          }`}
                        />
                        <span className="text-xs">{item.label}</span>
                        <span className="text-[10px] text-slate-500 font-mono">
                          {preset.pixelsFor14mm}px
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Physical Symbol & Live Measurement Display */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-center flex flex-col items-center">
                <div className="flex items-center justify-between w-full mb-3 text-xs">
                  <span className="font-bold text-slate-800">
                    Live Optotype (1.4 cm × 1.4 cm)
                  </span>
                  <span className="font-mono text-slate-600 bg-white px-2 py-0.5 rounded border border-slate-200">
                    {currentRenderedPx} px ({tempPxPerMm.toFixed(2)} px/mm)
                  </span>
                </div>

                {/* Visual measurement container */}
                <div className="relative p-6 bg-white rounded-xl shadow-xs border border-slate-300 flex items-center justify-center my-2">
                  {/* Outer 1.4 cm highlight box */}
                  <div
                    className="border-2 border-dashed border-orange-500 rounded flex items-center justify-center relative"
                    style={{
                      width: `${currentRenderedPx}px`,
                      height: `${currentRenderedPx}px`,
                    }}
                  >
                    <TumblingE
                      sizeMm={targetSymbolMm}
                      pxPerMm={tempPxPerMm}
                      orientation="right"
                      color="#000000"
                    />

                    {/* Width dimension label */}
                    <div className="absolute -bottom-5 left-1/2 -translate-x-1/2 text-[10px] font-bold text-orange-700 whitespace-nowrap bg-orange-100/90 px-1 rounded">
                      ↔ 1.4 cm
                    </div>
                    {/* Height dimension label */}
                    <div className="absolute -left-6 top-1/2 -translate-y-1/2 -rotate-90 text-[10px] font-bold text-orange-700 whitespace-nowrap bg-orange-100/90 px-1 rounded">
                      1.4 cm
                    </div>
                  </div>
                </div>

                <p className="text-[11px] text-slate-500 mt-5 leading-relaxed max-w-sm">
                  💡 <span className="font-semibold text-slate-700">Verification:</span>{' '}
                  Hold any physical ruler to your screen. The symbol and dashed box measure{' '}
                  <span className="font-bold text-slate-900">1.4 cm length</span> by{' '}
                  <span className="font-bold text-slate-900">1.4 cm breadth</span>.
                </p>

                {/* Fine-Tuning Nudge Buttons */}
                <div className="flex items-center gap-2 mt-4 pt-3 border-t border-slate-200 w-full justify-center">
                  <span className="text-xs font-semibold text-slate-600 mr-1 flex items-center gap-1">
                    <Sliders className="w-3.5 h-3.5" /> Fine-tune:
                  </span>
                  <button
                    type="button"
                    onClick={() => handleNudge(-2)}
                    className="px-2.5 py-1.5 rounded-lg bg-white border border-slate-300 text-slate-700 hover:bg-slate-100 active:scale-95 text-xs font-bold flex items-center gap-1 cursor-pointer"
                    title="Shrink by ~0.5mm"
                  >
                    <Minus className="w-3 h-3" /> 0.5mm
                  </button>
                  <button
                    type="button"
                    onClick={() => handleNudge(2)}
                    className="px-2.5 py-1.5 rounded-lg bg-white border border-slate-300 text-slate-700 hover:bg-slate-100 active:scale-95 text-xs font-bold flex items-center gap-1 cursor-pointer"
                    title="Enlarge by ~0.5mm"
                  >
                    <Plus className="w-3 h-3" /> 0.5mm
                  </button>
                  <button
                    type="button"
                    onClick={handleReset}
                    className="p-1.5 rounded-lg bg-white border border-slate-200 text-slate-500 hover:text-slate-700 text-xs"
                    title="Reset to default preset"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </>
          ) : (
            /* Credit / ID Card match tab */
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-center flex flex-col items-center">
              <p className="text-xs text-slate-600 mb-3">
                Place any standard card (ATM / Credit Card / School ID) on the screen and adjust the box until it matches the card&apos;s physical width.
              </p>

              <div
                className="border-2 border-teal-600 bg-teal-50/50 rounded-lg flex flex-col items-center justify-center p-4 my-2 transition-all"
                style={{
                  width: `${Math.min(360, cardWidthPx)}px`,
                  height: `${Math.round(Math.min(360, cardWidthPx) * (53.98 / 85.6))}px`,
                }}
              >
                <CreditCard className="w-6 h-6 text-teal-600 mb-1" />
                <span className="text-xs font-bold text-teal-900">Standard Card</span>
                <span className="text-[10px] text-teal-700 font-mono">
                  85.6 mm × 53.98 mm
                </span>
              </div>

              <div className="flex items-center gap-2 mt-4">
                <button
                  type="button"
                  onClick={() => handleNudge(-3)}
                  className="px-3 py-1.5 rounded-lg bg-white border border-slate-300 text-slate-700 hover:bg-slate-100 text-xs font-bold flex items-center gap-1 cursor-pointer"
                >
                  <Minus className="w-3 h-3" /> Smaller
                </button>
                <button
                  type="button"
                  onClick={() => handleNudge(3)}
                  className="px-3 py-1.5 rounded-lg bg-white border border-slate-300 text-slate-700 hover:bg-slate-100 text-xs font-bold flex items-center gap-1 cursor-pointer"
                >
                  <Plus className="w-3 h-3" /> Larger
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="bg-slate-50 p-4 border-t border-slate-200 flex items-center justify-between gap-3 shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 text-xs font-bold text-slate-600 hover:text-slate-800 bg-white border border-slate-300 rounded-xl transition cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSaveAndApply}
            className="px-5 py-2.5 text-xs font-extrabold text-white bg-orange-600 hover:bg-orange-700 active:scale-98 rounded-xl shadow-xs flex items-center gap-2 transition cursor-pointer"
          >
            <Check className="w-4 h-4" />
            Apply 1.4 cm ({currentRenderedPx}px)
          </button>
        </div>
      </div>
    </div>
  );
};
