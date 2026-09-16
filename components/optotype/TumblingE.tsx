'use client';

import React, { useMemo } from 'react';
import { OptotypeOrientation } from '@/lib/types';
import {
  mmToPixels,
  getOrientationDegrees,
  TUMBLING_E_SVG_PATH,
  ONE_METRE_6_18_HEIGHT_MM,
  detectDeviceScreenType,
} from '@/lib/optotypeMath';
import { StandardTumblingE } from './StandardTumblingE';

export { StandardTumblingE };

export interface TumblingEProps {
  /** Target physical height/width in millimeters. Defaults to 4.37 mm (standard 6/18 optotype at 1.00 metre). */
  sizeMm?: number;
  /** Screen calibration factor in pixels per millimeter */
  pxPerMm?: number;
  /** Direction the open limbs of the E are pointing */
  orientation: OptotypeOrientation;
  /** Optical color of the optotype (Default is solid black #000000) */
  color?: string;
  /** Optional background fill of the square optotype card (Default is pure white #FFFFFF) */
  backgroundColor?: string;
  /** Optional test level label for clinical auditing */
  snellenLabel?: string;
  /** Show subtle bounding border for clinical alignment check */
  showDebugBounds?: boolean;
  className?: string;
  id?: string;
}

/**
 * Standardized ISO 8596 5x5 Tumbling-E Optotype Vector Engine
 * 
 * Strict Physical Constraints:
 * 1. Mathematically defined 5x5 grid (3 horizontal limbs, 2 equal gaps, 1 backbone)
 * 2. Absolute 1:1 square bounding box (no stretching or compression, width === height)
 * 3. Exact physical scaling derived from (sizeMm * pxPerMm), defaulting to 4.37 mm (6/18 at 1 metre)
 * 4. Zero font dependencies; pure SVG vector geometry
 * 5. High-contrast, non-distorting rendering with crispEdges to eliminate anti-aliasing artifacts
 * 6. Perfectly centered and geometrically symmetrical rotation around (2.5, 2.5)
 */
export const TumblingE: React.FC<TumblingEProps> = ({
  sizeMm = ONE_METRE_6_18_HEIGHT_MM, // 4.37 mm
  pxPerMm,
  orientation,
  color = '#000000',
  backgroundColor = '#FFFFFF',
  showDebugBounds = false,
  className = '',
  id = 'clinical-tumbling-e-optotype',
}) => {
  // Determine effective pixel density
  const effectivePxPerMm = useMemo(() => {
    if (pxPerMm && pxPerMm > 0) return pxPerMm;
    return detectDeviceScreenType().pxPerMm;
  }, [pxPerMm]);

  // Calculate exact rendered square dimension in device pixels
  const renderedPixels = useMemo(() => {
    return Math.max(1, mmToPixels(sizeMm, effectivePxPerMm));
  }, [sizeMm, effectivePxPerMm]);

  // Compute rotation angle (facing Right = 0°, Down = 90°, Left = 180°, Up = 270°)
  const rotationDegrees = useMemo(() => {
    return getOrientationDegrees(orientation);
  }, [orientation]);

  return (
    <div
      id={id}
      suppressHydrationWarning={true}
      className={`relative inline-flex items-center justify-center select-none flex-shrink-0 ${className}`}
      style={{
        width: `${renderedPixels}px`,
        height: `${renderedPixels}px`,
        minWidth: `${renderedPixels}px`,
        maxWidth: `${renderedPixels}px`,
        minHeight: `${renderedPixels}px`,
        maxHeight: `${renderedPixels}px`,
        backgroundColor,
        padding: 0,
        margin: 0,
        border: 'none',
        outline: 'none',
        boxShadow: 'none',
      }}
      aria-label={`Visual Acuity 5x5 Tumbling E pointing ${orientation}`}
      role="img"
    >
      {/* 
        Mathematical 5x5 Coordinate System:
        viewBox="0 0 5 5" guarantees identical stroke-to-gap ratio (1:1:1:1:1)
        shapeRendering="crispEdges" eliminates anti-aliasing distortion
      */}
      <svg
        viewBox="0 0 5 5"
        width={renderedPixels}
        height={renderedPixels}
        suppressHydrationWarning={true}
        className="block flex-shrink-0"
        style={{
          width: `${renderedPixels}px`,
          height: `${renderedPixels}px`,
          minWidth: `${renderedPixels}px`,
          maxWidth: `${renderedPixels}px`,
          minHeight: `${renderedPixels}px`,
          maxHeight: `${renderedPixels}px`,
          display: 'block',
          border: 'none',
          boxShadow: 'none',
          transition: 'none', // Critical: no animating transitions that alter perceived optotype size
        }}
        shapeRendering="crispEdges"
      >
        <g transform={`rotate(${rotationDegrees} 2.5 2.5)`}>
          <path
            d={TUMBLING_E_SVG_PATH}
            fill={color}
            fillRule="evenodd"
          />
        </g>
      </svg>

      {showDebugBounds && (
        <div
          className="absolute inset-0 border border-red-400/40 pointer-events-none"
          title={`Target: ${sizeMm.toFixed(2)}mm (${renderedPixels}px)`}
        />
      )}
    </div>
  );
};
