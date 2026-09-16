'use client';

import React, { useEffect } from 'react';
import { OptotypeOrientation } from '@/lib/types';
import { ArrowUp, ArrowDown, ArrowLeft, ArrowRight } from 'lucide-react';
import { playChime } from '@/lib/audioService';

interface DirectionPadProps {
  onSelect: (orientation: OptotypeOrientation) => void;
  disabled?: boolean;
  activeAnswer?: OptotypeOrientation | null;
  labels?: {
    up?: string;
    down?: string;
    left?: string;
    right?: string;
  };
}

export const DirectionPad: React.FC<DirectionPadProps> = ({
  onSelect,
  disabled = false,
  activeAnswer = null,
  labels = {
    up: 'UP',
    down: 'DOWN',
    left: 'LEFT',
    right: 'RIGHT',
  },
}) => {
  // Keyboard arrow and WASD listeners for laptop testing
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (disabled) return;
      const key = e.key.toLowerCase();
      if (e.key === 'ArrowUp' || key === 'w') {
        e.preventDefault();
        playChime('tap');
        onSelect('up');
      } else if (e.key === 'ArrowDown' || key === 's') {
        e.preventDefault();
        playChime('tap');
        onSelect('down');
      } else if (e.key === 'ArrowLeft' || key === 'a') {
        e.preventDefault();
        playChime('tap');
        onSelect('left');
      } else if (e.key === 'ArrowRight' || key === 'd') {
        e.preventDefault();
        playChime('tap');
        onSelect('right');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [disabled, onSelect]);

  const handleClick = (dir: OptotypeOrientation) => {
    if (disabled) return;
    playChime('tap');
    onSelect(dir);
  };

  const getButtonClass = (dir: OptotypeOrientation) => {
    const isSelected = activeAnswer === dir;
    return `
      flex flex-col items-center justify-center select-none cursor-pointer
      transition-all duration-150 active:scale-90 touch-manipulation
      bg-transparent border-0
      ${isSelected ? 'scale-125' : 'hover:scale-110'}
      disabled:opacity-40 disabled:pointer-events-none disabled:active:scale-100
    `;
  };

  const getIconColor = (dir: OptotypeOrientation) => {
    switch (dir) {
      case 'up':
        return 'text-blue-600';
      case 'left':
        return 'text-rose-600';
      case 'right':
        return 'text-emerald-600';
      case 'down':
        return 'text-amber-500';
    }
  };

  return (
    <div className="w-full max-w-xs sm:max-w-sm mx-auto select-none" id="child-direction-pad">
      {/* 
        Diamond / Cross D-Pad Grid
        Optimized with 4 distinct colors: massive touch targets (68px - 76px)
      */}
      <div className="grid grid-cols-3 grid-rows-3 gap-2 sm:gap-3 p-1">
        {/* Row 1: UP button in center (Blue) */}
        <div className="col-start-2">
          <button
            type="button"
            onClick={() => handleClick('up')}
            disabled={disabled}
            className={`${getButtonClass('up')} w-full h-16 sm:h-20`}
            aria-label="E is pointing Up (Blue Arrow)"
            id="btn-direction-up"
          >
            <ArrowUp className={`w-9 h-9 sm:w-11 sm:h-11 ${getIconColor('up')} stroke-[1.5]`} />
          </button>
        </div>

        {/* Row 2: LEFT in col 1 (Rose/Red), RIGHT in col 3 (Emerald/Green) */}
        <div className="col-start-1 row-start-2">
          <button
            type="button"
            onClick={() => handleClick('left')}
            disabled={disabled}
            className={`${getButtonClass('left')} w-full h-16 sm:h-20`}
            aria-label="E is pointing Left (Red Arrow)"
            id="btn-direction-left"
          >
            <ArrowLeft className={`w-9 h-9 sm:w-11 sm:h-11 ${getIconColor('left')} stroke-[1.5]`} />
          </button>
        </div>

        {/* Center Space */}
        <div className="col-start-2 row-start-2 flex items-center justify-center pointer-events-none" />

        <div className="col-start-3 row-start-2">
          <button
            type="button"
            onClick={() => handleClick('right')}
            disabled={disabled}
            className={`${getButtonClass('right')} w-full h-16 sm:h-20`}
            aria-label="E is pointing Right (Green Arrow)"
            id="btn-direction-right"
          >
            <ArrowRight className={`w-9 h-9 sm:w-11 sm:h-11 ${getIconColor('right')} stroke-[1.5]`} />
          </button>
        </div>

        {/* Row 3: DOWN in center (Amber/Yellow) */}
        <div className="col-start-2 row-start-3">
          <button
            type="button"
            onClick={() => handleClick('down')}
            disabled={disabled}
            className={`${getButtonClass('down')} w-full h-16 sm:h-20`}
            aria-label="E is pointing Down (Yellow Arrow)"
            id="btn-direction-down"
          >
            <ArrowDown className={`w-9 h-9 sm:w-11 sm:h-11 ${getIconColor('down')} stroke-[1.5]`} />
          </button>
        </div>
      </div>
    </div>
  );
};
