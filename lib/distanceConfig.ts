/**
 * Distance Detection Configuration and Constants for 1-Metre Visual Acuity Screening
 * 
 * Clinical protocol:
 * - Target distance: exactly 1.00 metre (100 cm)
 * - Nominal human Interpupillary Distance (IPD): ~63 mm (adults: 58-70 mm, children: ~58-62 mm)
 * - Nominal human Bizygomatic Face Width: ~140 mm
 * - Typical front-facing mobile/laptop camera HFOV: ~65 degrees
 * 
 * DISCLAIMER:
 * This optical distance estimation is a non-diagnostic prototype feature.
 * Measurements are labeled internally as estimated distance until clinically validated.
 */

export interface DistanceGateConfig {
  /** Target testing distance in metres (default 1.00 m) */
  targetDistanceMeters: number;
  /** Minimum distance to consider acceptable for test (default 0.92 m) */
  minAcceptableDistanceMeters: number;
  /** Maximum distance to consider acceptable for test (default 1.08 m) */
  maxAcceptableDistanceMeters: number;
  /** Distance below which status is red "Too close" (default 0.80 m) */
  nearWarningDistanceMeters: number;
  /** Distance above which status is red "Too far" (default 1.22 m) */
  farWarningDistanceMeters: number;
  /** Maximum normalized deviation from camera center allowed [0..1] (default 0.18 = 18%) */
  maxOffCenterToleranceNorm: number;
  /** Maximum head tilt roll angle in degrees (default 18°) */
  maxHeadTiltRollDeg: number;
  /** Maximum head yaw angle in degrees (default 20°) */
  maxHeadYawDeg: number;
  /** Duration in milliseconds the user must remain stable at ~1m (default 1500 ms) */
  stabilityDurationMs: number;
  /** Minimum detection confidence threshold (default 0.60) */
  minConfidenceThreshold: number;
  /** Allowable distance jitter standard deviation in metres to consider stable (default 0.04 m) */
  maxDistanceJitterForStabilityM: number;
}

export const DEFAULT_DISTANCE_CONFIG: DistanceGateConfig = {
  targetDistanceMeters: 1.0,
  minAcceptableDistanceMeters: 0.90, // clinical 1.00m ± 0.10m target range
  maxAcceptableDistanceMeters: 1.10, // clinical 1.00m ± 0.10m target range
  nearWarningDistanceMeters: 0.78,
  farWarningDistanceMeters: 1.25,
  maxOffCenterToleranceNorm: 0.25, // natural user centering tolerance
  maxHeadTiltRollDeg: 22,
  maxHeadYawDeg: 24,
  stabilityDurationMs: 1200, // 1.2 seconds of stable positioning
  minConfidenceThreshold: 0.45,
  maxDistanceJitterForStabilityM: 0.055,
};

export interface DistanceCalibrationParams {
  /** Nominal calibration constant for iris diameter (~11.7 mm) */
  nominalIrisConstant?: number;
  /** Nominal calibration constant for IPD (interpupillary distance ~63 mm) */
  nominalIpdConstant: number;
  /** Nominal calibration constant for bi-ocular width (~92 mm, landmarks 33-263) */
  nominalBiocularConstant?: number;
  /** Nominal calibration constant for face width (bizygomatic ~137 mm) */
  nominalFaceWidthConstant: number;
  /** Nominal calibration constant for face height (forehead-to-chin ~175 mm) */
  nominalFaceHeightConstant?: number;
  /** User/device multiplier for fine tuning (default 1.0) */
  userFocalMultiplier: number;
  /** Label for current device profile */
  deviceProfileName: string;
  /** Timestamp when last calibrated */
  lastCalibratedAt?: string;
}

export const DEFAULT_DISTANCE_CALIBRATION: DistanceCalibrationParams = {
  // Optically grounded for standard front selfie camera & laptop webcam (~74° DFOV) at Z = 1.00 m
  nominalIrisConstant: 0.00891,
  nominalIpdConstant: 0.0480,
  nominalBiocularConstant: 0.0701,
  nominalFaceWidthConstant: 0.1044,
  nominalFaceHeightConstant: 0.1333,
  userFocalMultiplier: 1.0,
  deviceProfileName: 'Standard Front Lens (~74° DFOV)',
};

export type DistanceAlignmentStatus =
  | 'no_camera'
  | 'permission_denied'
  | 'initializing'
  | 'no_face'
  | 'multiple_faces'
  | 'off_center'
  | 'face_tilted'
  | 'too_close'
  | 'slightly_close'
  | 'perfect_distance'
  | 'slightly_far'
  | 'too_far'
  | 'low_confidence';

export type EstimatorStatus =
  | 'TOO_CLOSE'
  | 'MOVE_CLOSER'
  | 'ALMOST_READY'
  | 'READY'
  | 'TOO_FAR'
  | 'NO_FACE'
  | 'LOW_CONFIDENCE'
  | 'MULTIPLE_FACES';

export interface RawFaceMeasurement {
  timestamp: number;
  faceCount: number;
  /** Normalized bounding box [0..1] */
  box?: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
  /** Normalized center of face [0..1] */
  center?: {
    x: number;
    y: number;
  };
  /** Normalized average iris diameter [0..1] (Horizontal Visible Iris Diameter ~11.7mm) */
  irisDiameterNorm?: number;
  /** Normalized distance between eye centers [0..1] */
  interpupillaryDistanceNorm?: number;
  /** Normalized bi-ocular width between outer eye canthi [0..1] */
  biocularWidthNorm?: number;
  /** Normalized temple-to-temple face width [0..1] */
  faceWidthNorm?: number;
  /** Normalized forehead-to-chin face height in isotropic width units [0..1] */
  faceHeightNorm?: number;
  /** Inter-eye distance in actual camera sensor pixels */
  interEyeDistancePx?: number;
  /** Left eye landmark in camera sensor pixels */
  leftEyePx?: { x: number; y: number };
  /** Right eye landmark in camera sensor pixels */
  rightEyePx?: { x: number; y: number };
  /** Actual video frame buffer width */
  videoWidth?: number;
  /** Actual video frame buffer height */
  videoHeight?: number;
  /** Estimated average frame luminance [0..255] */
  luminance?: number;
  /** Flagged if lighting is insufficient */
  isLowLight?: boolean;
  /** Video aspect ratio (width / height) */
  aspectRatio?: number;
  /** Estimated head roll in degrees */
  headRollDeg?: number;
  /** Estimated head yaw in degrees */
  headYawDeg?: number;
  /** Estimated head pitch in degrees (looking up/down) */
  headPitchDeg?: number;
  /** Tracking method used */
  trackingMethod?: 'mediapipe_iris_478' | 'mediapipe_face' | 'native_detector' | 'silhouette';
  /** Detection confidence [0..1] */
  confidence: number;
}

export interface DistanceValidationResult {
  /** True ONLY when all locking rules are met and distance has remained stable */
  isReady: boolean;
  /** Estimated physical distance in metres (e.g. 0.98) */
  estimatedDistanceMeters: number;
  /** Estimated physical distance in centimetres (e.g. 98) */
  estimatedDistanceCm: number;
  /** Display string (e.g. "0.98 m") */
  formattedDistance: string;
  /** Current clinical alignment status */
  status: DistanceAlignmentStatus;
  /** Modular status required for distance estimator */
  estimatorStatus?: EstimatorStatus;
  /** Visual color theme for status badges and guides */
  statusColor: 'red' | 'orange' | 'green' | 'slate' | 'amber';
  /** Primary status headline matching prompt examples */
  statusMessage: string;
  /** Secondary actionable guidance for child / screener */
  guidanceText: string;
  /** Whether face is within horizontal and vertical center zone */
  isCentered: boolean;
  /** Whether estimated distance is in the green acceptable window (0.92m - 1.08m) */
  isDistanceAcceptable: boolean;
  /** Stability timer progress from 0.0 to 1.0 (100% = unlocked) */
  stabilityProgress: number;
  /** Stability elapsed time in ms */
  stabilityElapsedMs: number;
  /** Number of detected faces (must be strictly 1) */
  faceCount: number;
  /** Confidence score [0..1] */
  confidence: number;
  /** Raw measurement reference for debugging / telemetry */
  rawMeasurement?: RawFaceMeasurement;
}
