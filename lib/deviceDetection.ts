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
    label: 'Mobile',
    description: 'Smartphone front camera (Auto-adjusted for wide ~76° selfie lens)',
    calibration: {
      nominalIrisConstant: 0.00749,
      nominalIpdConstant: 0.0403,
      nominalBiocularConstant: 0.0589,
      nominalFaceWidthConstant: 0.0883,
      nominalFaceHeightConstant: 0.1165,
      userFocalMultiplier: 1.00,
      deviceProfileName: 'Mobile (Auto-Adjusted)',
    },
  },
  tablet: {
    category: 'tablet',
    label: 'Tablet',
    description: 'Tablet front camera (Auto-adjusted for ~72° tablet lens)',
    calibration: {
      nominalIrisConstant: 0.00805,
      nominalIpdConstant: 0.0434,
      nominalBiocularConstant: 0.0633,
      nominalFaceWidthConstant: 0.0950,
      nominalFaceHeightConstant: 0.1253,
      userFocalMultiplier: 1.00,
      deviceProfileName: 'Tablet (Auto-Adjusted)',
    },
  },
  laptop: {
    category: 'laptop',
    label: 'Laptop',
    description: 'Laptop built-in webcam (Auto-adjusted for standard ~67° FOV)',
    calibration: {
      nominalIrisConstant: 0.00884,
      nominalIpdConstant: 0.0476,
      nominalBiocularConstant: 0.0695,
      nominalFaceWidthConstant: 0.1042,
      nominalFaceHeightConstant: 0.1375,
      userFocalMultiplier: 1.00,
      deviceProfileName: 'Laptop (Auto-Adjusted)',
    },
  },
  desktop: {
    category: 'desktop',
    label: 'Desktop',
    description: 'Desktop monitor camera (Auto-adjusted for wide ~82° external webcam)',
    calibration: {
      nominalIrisConstant: 0.00673,
      nominalIpdConstant: 0.0362,
      nominalBiocularConstant: 0.0529,
      nominalFaceWidthConstant: 0.0794,
      nominalFaceHeightConstant: 0.1047,
      userFocalMultiplier: 1.00,
      deviceProfileName: 'Desktop (Auto-Adjusted)',
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
 * Retrieves the automatically detected device profile and calibration constants
 */
export function getAutoDetectedProfile(): DeviceProfileInfo {
  const category = detectDeviceCategory();
  return DEVICE_CALIBRATION_PROFILES[category];
}

/**
 * Returns calibration parameters tailored automatically for the active device
 */
export function getAutoDetectedCalibration(): DistanceCalibrationParams {
  const profile = getAutoDetectedProfile();
  return {
    ...profile.calibration,
    lastCalibratedAt: new Date().toISOString(),
  };
}
