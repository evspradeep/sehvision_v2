import { OptotypeOrientation } from './types';

/**
 * Optotype Mathematical & Optical Calculations
 * Following ISO 8596: Visual acuity testing — Standard optotype and its presentation
 * 
 * Standard Snellen principles:
 * - 6/6 optotype subtends 5 minutes of arc at 6 metres (each stroke & gap = 1 minute of arc).
 * - Visual angle θ (radians) = 2 * arctan(height / (2 * distance)).
 * - For small angles: height = 2 * distance * tan(θ / 2).
 */

// ISO/IEC 7810 ID-1 standard card dimensions (standard debit / credit / ID card / Sankara OP card)
export const STANDARD_CARD_WIDTH_MM = 85.60;
export const STANDARD_CARD_HEIGHT_MM = 53.98;

// Fallback CSS baseline (assuming standard 96 CSS dpi, 96 / 25.4 ≈ 3.7795 px/mm)
export const DEFAULT_FALLBACK_PX_PER_MM = 96 / 25.4;

/**
 * Calculates physical height of a standard Snellen optotype for a given distance and visual acuity ratio.
 * @param snellenDenominator - The bottom number of the Snellen fraction (e.g. 60 for 6/60, 18 for 6/18, 6 for 6/6)
 * @param distanceMm - Distance between patient's eye and display in millimeters (e.g. 1500mm for 1.5m, 3000mm for 3m)
 * @param snellenNumerator - Standard 6 (or 20 for imperial 20/20)
 */
export function calculateOptotypeHeightMm(
  snellenDenominator: number,
  distanceMm: number,
  snellenNumerator: number = 6
): number {
  // Visual angle for 6/6 is 5 arcminutes = (5 / 60) * (PI / 180) radians.
  // For 6/X, angle is 5 arcmin * (X / 6)
  const arcMinutes = 5.0 * (snellenDenominator / snellenNumerator);
  const angleRadians = (arcMinutes / 60.0) * (Math.PI / 180.0);
  
  // Height = 2 * distance * tan(angle / 2)
  const heightMm = 2.0 * distanceMm * Math.tan(angleRadians / 2.0);
  return heightMm;
}

/**
 * Converts physical millimeters to screen pixels using calibrated pxPerMm.
 */
export function mmToPixels(sizeMm: number, pxPerMm: number): number {
  return Math.max(1, Math.round(sizeMm * pxPerMm * 10) / 10);
}

/**
 * Returns rotation angle in degrees for an optotype orientation.
 */
export function getOrientationDegrees(orientation: OptotypeOrientation): number {
  switch (orientation) {
    case 'right':
      return 0;
    case 'down':
      return 90;
    case 'left':
      return 180;
    case 'up':
      return 270;
  }
}

/**
 * Converts Snellen fraction string (e.g. "6/18") to decimal LogMAR.
 * LogMAR = -log10(decimal acuity)
 * decimal acuity = 6 / 18 = 0.3333 -> LogMAR ≈ 0.48
 */
export function snellenToLogMAR(snellen: string): number {
  const parts = snellen.split('/');
  if (parts.length !== 2) return 0.0;
  const num = parseFloat(parts[0]);
  const den = parseFloat(parts[1]);
  if (den <= 0) return 0.0;
  const decimalAcuity = num / den;
  const logMar = -Math.log10(decimalAcuity);
  return Math.round(logMar * 100) / 100;
}

/**
 * Standardized ISO 8596 5x5 Tumbling E Optotype Specifications for 1-Metre Visual Acuity
 * 
 * Standard visual-acuity geometry:
 * - Testing distance: exactly 1.00 metre (1000 mm)
 * - Optotype: Tumbling E
 * - Grid: 5 x 5 units
 * - Visual acuity: 6/18 (Snellen) ≈ 0.48 logMAR (decimal acuity = 0.3333)
 * - Subtended visual angle: exactly 15 arcminutes (0.25 degrees)
 *   Each stroke & gap subtends 3 arcminutes (15 / 5 = 3 arcmin)
 * - Letter height: exactly 4.37 mm (2 * 1000 * tan(15' / 2) = 4.3633 mm ≈ 4.37 mm)
 * - Letter width: exactly 4.37 mm (strict 1:1 aspect ratio, no stretch or compression)
 * - Stroke thickness: exactly 0.874 mm (4.37 mm / 5 = 0.874 mm)
 * - Horizontal bars: Three bars of exactly equal length (5 units, extending 4 units from backbone)
 * - Gaps: Two gaps each equal to stroke thickness (1 unit = 0.874 mm)
 * - Color: Solid black (#000000) on pure white (#FFFFFF) background
 */
export const ONE_METRE_6_18_HEIGHT_MM = 4.37;
export const ONE_METRE_6_18_WIDTH_MM = 4.37;
export const ONE_METRE_6_18_STROKE_MM = 0.874;
export const ONE_METRE_6_18_DISTANCE_MM = 1000;
export const ONE_METRE_6_18_ARCMINUTES = 15.0;
export const ONE_METRE_6_18_LOGMAR = 0.48;

export const STANDARD_1M_6_18_OPTOTYPE = {
  testingDistanceMm: ONE_METRE_6_18_DISTANCE_MM, // 1000 mm (1.00 m)
  snellenEquivalent: '6/18',
  logMAR: ONE_METRE_6_18_LOGMAR, // ≈0.48 logMAR
  visualAngleArcmin: ONE_METRE_6_18_ARCMINUTES, // 15 arcminutes
  letterHeightMm: ONE_METRE_6_18_HEIGHT_MM, // 4.37 mm
  letterWidthMm: ONE_METRE_6_18_WIDTH_MM, // 4.37 mm
  strokeThicknessMm: ONE_METRE_6_18_STROKE_MM, // 0.874 mm
  gridDimension: 5, // 5 x 5 units
  strokeUnits: 1, // 1 unit
  gapUnits: 1, // 1 unit
  limbLengthUnits: 5, // 5 units (3 bars of equal length)
  color: '#000000', // Solid black
  backgroundColor: '#FFFFFF', // Pure white
} as const;

/**
 * Generates the SVG path data for a standardized ISO 8596 5x5 Tumbling E optotype
 * in a 5x5 coordinate system facing RIGHT.
 * 
 * 5x5 Grid Breakdown:
 * - Backbone: x: [0, 1], y: [0, 5] (thickness = 1 unit)
 * - Top limb: x: [1, 5], y: [0, 1] (length = 5 units total, height = 1 unit)
 * - Mid limb: x: [1, 5], y: [2, 3] (length = 5 units total, height = 1 unit)
 * - Bot limb: x: [1, 5], y: [4, 5] (length = 5 units total, height = 1 unit)
 * - Upper gap: x: [1, 5], y: [1, 2] (height = 1 unit = stroke thickness)
 * - Lower gap: x: [1, 5], y: [3, 4] (height = 1 unit = stroke thickness)
 * 
 * Perfect geometrical symmetry:
 * Horizontal midline at y = 2.5 passes directly through center of middle limb.
 * Upper and lower limbs & gaps are perfectly symmetrical across y = 2.5.
 * Center of the 5x5 grid is (2.5, 2.5).
 */
export const TUMBLING_E_SVG_PATH = 'M 0,0 L 5,0 L 5,1 L 1,1 L 1,2 L 5,2 L 5,3 L 1,3 L 1,4 L 5,4 L 5,5 L 0,5 Z';

export type DeviceScreenType = 'mobile' | 'tablet' | 'laptop' | 'desktop';

export interface DeviceScreenEstimate {
  type: DeviceScreenType;
  label: string;
  pxPerMm: number;
  pixelsFor14mm: number;
  description: string;
}

/**
 * Calibrated Physical Pixel Density per Device Category:
 * Ensures the Tumbling-E symbol physically measures 1.4 cm × 1.4 cm across phones, tablets, laptops, and monitors.
 */
export const DEVICE_PRESETS: Record<DeviceScreenType, DeviceScreenEstimate> = {
  mobile: {
    type: 'mobile',
    label: 'Mobile Phone',
    pxPerMm: 5.57, // ~141.5 CSS DPI -> 14mm = 78 CSS px
    pixelsFor14mm: 78,
    description: 'Calibrated for smartphones (iPhone, Galaxy, Pixel, etc.)',
  },
  tablet: {
    type: 'tablet',
    label: 'Tablet',
    pxPerMm: 4.85, // ~123.2 CSS DPI -> 14mm = 68 CSS px
    pixelsFor14mm: 68,
    description: 'Calibrated for tablets (iPad, Galaxy Tab, etc.)',
  },
  laptop: {
    type: 'laptop',
    label: 'Laptop PC',
    pxPerMm: 4.60, // ~116.8 CSS DPI -> 14mm = 64 CSS px
    pixelsFor14mm: 64,
    description: 'Calibrated for 13"-16" laptop screens with OS scaling',
  },
  desktop: {
    type: 'desktop',
    label: 'Desktop PC Monitor',
    pxPerMm: 3.78, // Standard 96 CSS DPI -> 14mm = 53 CSS px
    pixelsFor14mm: 53,
    description: 'Calibrated for standard 21"-27" desktop computer monitors',
  },
};

/**
 * Automatically detects the physical device category (mobile phone, tablet, laptop, desktop)
 * and returns the calibrated pxPerMm ratio so that 14.0 mm renders as true 1.4 cm in the physical world
 * without requiring any manual toggling or visual indicators.
 */
export function detectDeviceScreenType(): DeviceScreenEstimate {
  if (typeof window === 'undefined') {
    return DEVICE_PRESETS.laptop;
  }

  const ua = (navigator.userAgent || '').toLowerCase();
  const screenW = window.screen.width || window.innerWidth || 1920;
  const screenH = window.screen.height || window.innerHeight || 1080;
  const innerW = window.innerWidth || screenW;
  const innerH = window.innerHeight || screenH;
  const minDim = Math.min(screenW, screenH);
  const maxDim = Math.max(screenW, screenH);
  const minInner = Math.min(innerW, innerH);
  const dpr = window.devicePixelRatio || 1;
  const maxTouchPoints = navigator.maxTouchPoints || 0;

  // 1. Mobile Phone check (User agent matches mobile phones, or touch device with phone width, or narrow viewport)
  const isMobileUa = /mobile|iphone|ipod|android/i.test(ua);
  const isPhoneDimension = (maxTouchPoints > 0 && minDim < 600) || (minInner < 600 && isMobileUa);
  if (isPhoneDimension || (isMobileUa && !/ipad|tablet/i.test(ua) && minDim < 768)) {
    return DEVICE_PRESETS.mobile;
  }

  // 2. Tablet check (iPad, Android tablet, Surface, or touch screen with tablet dimensions)
  const isIPad = /ipad/i.test(ua) || (/macintosh/i.test(ua) && maxTouchPoints > 1);
  const isAndroidTablet = /android/i.test(ua) && !/mobile/i.test(ua);
  const isTabletDimension = maxTouchPoints > 0 && (minDim >= 600 || minInner >= 600) && maxDim <= 1366;

  if (isIPad || isAndroidTablet || isTabletDimension) {
    return DEVICE_PRESETS.tablet;
  }

  // 3. Laptop vs Desktop
  // Laptops have high DPR (1.25, 1.5, 2.0 Retina) or compact screen resolutions <= 1600
  const isLaptop = dpr > 1.1 || (minDim <= 1050 && maxDim <= 1600);
  if (isLaptop) {
    return DEVICE_PRESETS.laptop;
  }

  // 4. Default to standard desktop PC monitor
  return DEVICE_PRESETS.desktop;
}

