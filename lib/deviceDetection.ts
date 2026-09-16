/**
 * Device Environment Detection & Lens Auto-Calibration Engine
 * 
 * Automatically detects whether the screening link is running on:
 * - Laptop (Built-in 65°-70° HFOV bezel webcam)
 * - Desktop (External display with wide 78°-90° HFOV webcam)
 * - Mobile (Smartphone front selfie camera ~75°-80° HFOV)
 * - Tablet (iPad / Android tablet front camera)
 * 
 * Automatically selects and applies the optimal nominal focal constants
 * without requiring manual user intervention or calibration buttons.
 */

import { DistanceCalibrationParams } from './distanceConfig';

export type DeviceCategory = 'mobile' | 'tablet' | 'laptop' | 'desktop';

export interface DeviceProfileInfo {
  category: DeviceCategory;
  label: string;
  description: string;
  calibration: DistanceCalibrationParams;
}

export const DEVICE_CALIBRATION_PROFILES: Record<DeviceCategory, DeviceProfileInfo> = {
  mobile: {
    category: 'mobile',
    label: 'Mobile Front Lens',
    description: 'Smartphone front camera (Auto-adjusted for standard ~74° selfie lens)',
    calibration: {
      nominalIrisConstant: 0.00891,
      nominalIpdConstant: 0.0480,
      nominalBiocularConstant: 0.0701,
      nominalFaceWidthConstant: 0.1044,
      nominalFaceHeightConstant: 0.1333,
      userFocalMultiplier: 1.00,
      deviceProfileName: 'Mobile Front Lens (~74° FOV)',
    },
  },
  tablet: {
    category: 'tablet',
    label: 'Tablet Front Lens',
    description: 'Tablet front camera (Auto-adjusted for ~75° lens)',
    calibration: {
      nominalIrisConstant: 0.00882,
      nominalIpdConstant: 0.0475,
      nominalBiocularConstant: 0.0694,
      nominalFaceWidthConstant: 0.1033,
      nominalFaceHeightConstant: 0.1319,
      userFocalMultiplier: 1.00,
      deviceProfileName: 'Tablet Front Lens (~75° FOV)',
    },
  },
  laptop: {
    category: 'laptop',
    label: 'Laptop Built-in Webcam',
    description: 'Laptop built-in webcam (Auto-adjusted for standard ~73.5° FOV)',
    calibration: {
      nominalIrisConstant: 0.00895,
      nominalIpdConstant: 0.0482,
      nominalBiocularConstant: 0.0704,
      nominalFaceWidthConstant: 0.1048,
      nominalFaceHeightConstant: 0.1339,
      userFocalMultiplier: 1.00,
      deviceProfileName: 'Laptop Webcam (~73.5° FOV)',
    },
  },
  desktop: {
    category: 'desktop',
    label: 'Desktop Webcam',
    description: 'Desktop monitor camera (Auto-adjusted for standard ~78° external webcam)',
    calibration: {
      nominalIrisConstant: 0.00828,
      nominalIpdConstant: 0.0446,
      nominalBiocularConstant: 0.0651,
      nominalFaceWidthConstant: 0.0970,
      nominalFaceHeightConstant: 0.1239,
      userFocalMultiplier: 1.00,
      deviceProfileName: 'Desktop Webcam (~78° FOV)',
    },
  },
};

/**
 * Detects the client device category based on browser user-agent, touch points,
 * screen resolution, and display characteristics.
 */
export function detectDeviceCategory(): DeviceCategory {
  if (typeof window === 'undefined' || typeof navigator === 'undefined') {
    return 'laptop';
  }

  const ua = navigator.userAgent || '';
  const screenW = window.screen?.width || window.innerWidth || 1024;
  const screenH = window.screen?.height || window.innerHeight || 768;
  const minDim = Math.min(screenW, screenH);
  const maxDim = Math.max(screenW, screenH);
  const touchPoints = navigator.maxTouchPoints || 0;

  // 1. Mobile smartphone detection
  const isMobilePhoneUA = /Android.*Mobile|iPhone|iPod|BlackBerry|IEMobile|Opera Mini/i.test(ua);
  const isSmallScreenTouch = touchPoints > 0 && minDim < 600;

  if (isMobilePhoneUA || isSmallScreenTouch) {
    return 'mobile';
  }

  // 2. Tablet detection (iPad, Android Tablet, Silk)
  const isTabletUA = /iPad|Android(?!.*Mobile)|Tablet|Silk/i.test(ua);
  const isIPadOS = /Macintosh/i.test(ua) && touchPoints > 1; // iPadOS 13+ reports Macintosh with touch
  const isTabletScreenTouch = touchPoints > 0 && minDim >= 600 && maxDim <= 1366;

  if (isTabletUA || isIPadOS || isTabletScreenTouch) {
    return 'tablet';
  }

  // 3. Desktop vs Laptop detection
  // Desktops typically have large external screens (>= 24" / >= 1920x1150 or >= 2560px width) with 0 touch points
  const isLargeDesktopScreen = (screenW >= 2400 || (screenW >= 1920 && screenH >= 1150)) && touchPoints === 0;

  if (isLargeDesktopScreen) {
    return 'desktop';
  }

  // Default: Laptop (standard built-in bezel camera)
  return 'laptop';
}

/**
 * Retrieves the automatically detected device profile and calibration constants,
 * taking into account whether the front (selfie) or rear (environment/back) camera is active.
 */
export function getAutoDetectedProfile(facingMode: 'user' | 'environment' = 'user'): DeviceProfileInfo {
  const category = detectDeviceCategory();

  // If rear (environment) camera is active:
  if (facingMode === 'environment') {
    if (category === 'mobile') {
      return {
        category: 'mobile',
        label: 'Mobile (Rear Camera)',
        description: 'Smartphone rear camera (Auto-adjusted for ~80° main optical lens)',
        calibration: {
          nominalIrisConstant: 0.00799,
          nominalIpdConstant: 0.0430,
          nominalBiocularConstant: 0.0628,
          nominalFaceWidthConstant: 0.0935,
          nominalFaceHeightConstant: 0.1194,
          userFocalMultiplier: 1.00,
          deviceProfileName: 'Mobile Rear Camera (~80° FOV)',
        },
      };
    }
    if (category === 'tablet') {
      return {
        category: 'tablet',
        label: 'Tablet (Rear Camera)',
        description: 'Tablet rear camera (Auto-adjusted for ~76° main optical lens)',
        calibration: {
          nominalIrisConstant: 0.00845,
          nominalIpdConstant: 0.0455,
          nominalBiocularConstant: 0.0664,
          nominalFaceWidthConstant: 0.0989,
          nominalFaceHeightConstant: 0.1264,
          userFocalMultiplier: 1.00,
          deviceProfileName: 'Tablet Rear Camera (~76° FOV)',
        },
      };
    }
    // Laptop / Desktop with rear/external camera toggle:
    const base = DEVICE_CALIBRATION_PROFILES[category];
    return {
      ...base,
      label: `${base.label} (Examiner View)`,
      description: `${base.label} camera configured for examiner distance screening`,
    };
  }

  return DEVICE_CALIBRATION_PROFILES[category];
}

/**
 * Returns calibration parameters tailored automatically for the active device and camera lens
 */
export function getAutoDetectedCalibration(facingMode: 'user' | 'environment' = 'user'): DistanceCalibrationParams {
  const profile = getAutoDetectedProfile(facingMode);
  return {
    ...profile.calibration,
    lastCalibratedAt: new Date().toISOString(),
  };
}
