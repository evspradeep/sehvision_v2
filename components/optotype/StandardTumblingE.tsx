'use client';

import React, { useMemo } from 'react';
import { OptotypeOrientation } from '@/lib/types';
import {
  ONE_METRE_6_18_HEIGHT_MM,
  ONE_METRE_6_18_WIDTH_MM,
  ONE_METRE_6_18_STROKE_MM,
  ONE_METRE_6_18_DISTANCE_MM,
  ONE_METRE_6_18_ARCMINUTES,
  ONE_METRE_6_18_LOGMAR,
  STANDARD_1M_6_18_OPTOTYPE,
  TUMBLING_E_SVG_PATH,
  mmToPixels,
  getOrientationDegrees,
  detectDeviceScreenType,
} from '@/lib/optotypeMath';

export interface StandardTumblingEProps {
  /**
   * Direction the open limbs of the Tumbling E point:
   * 'right' (0°), 'down' (90°), 'left' (180°), 'up' (270°)
   * Default: 'right'
   */
  orientation?: OptotypeOrientation;
  /**
   * Screen calibration factor in device pixels per millimeter (px/mm).
   * If not provided, automatically detected from hardware display profile.
   */
  pxPerMm?: number;
  /**
   * Letter height and width in millimeters.
   * Defaults to strictly 4.37 mm (standard ISO 8596 6/18 optotype at 1.00 metre).
   */
  sizeMm?: number;
  /**
   * Stroke color of the Tumbling E optotype.
   * Strictly #000000 (solid black) per visual acuity test standards.
   */
  color?: string;
  /**
   * Background color of the optotype container.
   * Strictly #FFFFFF (pure white) per visual acuity test standards.
   */
  backgroundColor?: string;
  /**
   * Optional DOM id for targeting or automated verification.
   */
  id?: string;
  /**
   * Optional CSS class name for outer layout wrapper.
   */
  className?: string;
}

/**
 * Standardized 5x5 Tumbling E Optotype for 1-Metre Visual-Acuity Testing
 * 
 * Clinical Specifications (ISO 8596 / Snellen standard):
 * - Testing distance: exactly 1.00 metre (1000 mm)
 * - Optotype: Tumbling E
 * - Grid: 5 x 5 units
 * - Visual acuity: 6/18 (≈0.48 logMAR)
 * - Subtended visual angle: exactly 15 arcminutes (0.25°) at 1.00 m
 * - Letter height: 4.37 mm
 * - Letter width: 4.37 mm (strict 1:1 square aspect ratio; zero stretch/compression)
 * - Stroke thickness: 0.874 mm (1 unit = 4.37 mm / 5)
 * - Horizontal bars: Three bars of strictly equal length (5 units, extending 4 units from backbone)
 * - Gaps between bars: Two gaps each equal to stroke thickness (1 unit = 0.874 mm)
 * - Symmetry & Centering: Perfectly symmetrical across horizontal midline (y = 2.5),
 *   rotated around exact geometric center (2.5, 2.5) of 5x5 grid.
 * - Presentation: Solid black (#000000) on pure white (#FFFFFF) background.
 * - Rendering: shape-rendering="crispEdges" to prevent anti-aliasing distortion or blur.
 * - No borders, shadows, textures, perspectives, or decorations.
 */
export const StandardTumblingE: React.FC<StandardTumblingEProps> = ({
  orientation = 'right',
  pxPerMm,
  sizeMm = ONE_METRE_6_18_HEIGHT_MM, // 4.37 mm
  color = '#000000',                 // Solid black
  backgroundColor = '#FFFFFF',       // Pure white
  id = 'standard-1m-tumbling-e',
  className = '',
}) => {
  // Determine effective pixels per millimeter
  const effectivePxPerMm = useMemo(() => {
    if (pxPerMm && pxPerMm > 0) return pxPerMm;
    return detectDeviceScreenType().pxPerMm;
  }, [pxPerMm]);

  // Convert physical millimeters (4.37 mm) to precise screen pixels
  const renderedDimensionPx = useMemo(() => {
    return mmToPixels(sizeMm, effectivePxPerMm);
  }, [sizeMm, effectivePxPerMm]);

  // Rotation angles for 5x5 Tumbling E around coordinate center (2.5, 2.5)
  const rotationDegrees = useMemo(() => {
    return getOrientationDegrees(orientation);
  }, [orientation]);

  return (
    <div
      id={id}
      suppressHydrationWarning={true}
      className={`inline-flex items-center justify-center select-none flex-shrink-0 ${className}`}
      style={{
        width: `${renderedDimensionPx}px`,
        height: `${renderedDimensionPx}px`,
        minWidth: `${renderedDimensionPx}px`,
        maxWidth: `${renderedDimensionPx}px`,
        minHeight: `${renderedDimensionPx}px`,
        maxHeight: `${renderedDimensionPx}px`,
        backgroundColor,
        padding: 0,
        margin: 0,
        border: 'none',
        outline: 'none',
        boxShadow: 'none',
      }}
      aria-label={`Standardized 5x5 Tumbling E optotype for 1-metre 6/18 acuity test facing ${orientation}`}
      role="img"
    >
      <svg
        viewBox="0 0 5 5"
        width={renderedDimensionPx}
        height={renderedDimensionPx}
        suppressHydrationWarning={true}
        className="block flex-shrink-0"
        style={{
          width: `${renderedDimensionPx}px`,
          height: `${renderedDimensionPx}px`,
          minWidth: `${renderedDimensionPx}px`,
          maxWidth: `${renderedDimensionPx}px`,
          minHeight: `${renderedDimensionPx}px`,
          maxHeight: `${renderedDimensionPx}px`,
          display: 'block',
          border: 'none',
          boxShadow: 'none',
        }}
        shapeRendering="crispEdges"
      >
        {/*
          Rotation around exact geometric center (2.5, 2.5) of the 5x5 unit space:
          Preserves perfect 1:1 symmetry, 0.874 mm stroke thickness, and 4.37 mm letter height and width.
        */}
        <g transform={`rotate(${rotationDegrees} 2.5 2.5)`}>
          <path
            d={TUMBLING_E_SVG_PATH}
            fill={color}
            fillRule="evenodd"
          />
        </g>
      </svg>
    </div>
  );
};

export default StandardTumblingE;
