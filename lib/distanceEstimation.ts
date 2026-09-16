/**
 * Distance Estimation & Validation Engine for 1-Metre Visual Acuity Screening
 * 
 * Clinical Principles:
 * - Mathematical Pinhole Perspective Model: Distance = (FocalLength * RealWorldDimension) / DetectedPixelDimension
 * - In normalized screen coordinates: Distance ≈ K / NormalizedDimension
 * - Multi-metric fusion: Combines Interpupillary Distance (IPD) with Bizygomatic Face Width
 * - Temporal Smoothing: Adaptive Exponential Moving Average (EMA) to prevent jitter
 * - Modular architecture: Raw measurements -> Calibration parameters -> Distance estimation -> Validation -> UI state
 */

import {
  DistanceGateConfig,
  DEFAULT_DISTANCE_CONFIG,
  DistanceCalibrationParams,
  DEFAULT_DISTANCE_CALIBRATION,
  RawFaceMeasurement,
  DistanceValidationResult,
  DistanceAlignmentStatus,
  EstimatorStatus,
} from './distanceConfig';
import { getAutoDetectedCalibration } from './deviceDetection';

// Local storage key prefix for custom device distance calibration
const DISTANCE_CALIBRATION_STORAGE_PREFIX = 'sankara_device_dist_calib_v2_';

function getStorageKey(facingMode: 'user' | 'environment'): string {
  return `${DISTANCE_CALIBRATION_STORAGE_PREFIX}${facingMode}`;
}

/**
 * Retrieves auto-detected distance calibration according to device environment and lens facing mode (Front vs Rear)
 */
export function getSavedDistanceCalibration(facingMode: 'user' | 'environment' = 'user'): DistanceCalibrationParams {
  if (typeof window === 'undefined') return getAutoDetectedCalibration(facingMode);
  try {
    const key = getStorageKey(facingMode);
    const raw = localStorage.getItem(key);
    const autoDefault = getAutoDetectedCalibration(facingMode);
    if (!raw) return autoDefault;
    const parsed = JSON.parse(raw);
    return {
      ...autoDefault,
      ...parsed,
    };
  } catch (err) {
    console.warn('Failed to load distance calibration from storage:', err);
    return getAutoDetectedCalibration(facingMode);
  }
}

/**
 * Saves calibrated device parameters to localStorage per facing mode
 */
export function saveDistanceCalibration(params: DistanceCalibrationParams, facingMode: 'user' | 'environment' = 'user'): void {
  if (typeof window === 'undefined') return;
  try {
    const key = getStorageKey(facingMode);
    localStorage.setItem(key, JSON.stringify(params));
  } catch (err) {
    console.warn('Failed to persist distance calibration:', err);
  }
}

/**
 * Resets calibration to nominal factory defaults
 */
export function resetDistanceCalibration(facingMode?: 'user' | 'environment'): DistanceCalibrationParams {
  if (typeof window !== 'undefined') {
    try {
      if (facingMode) {
        localStorage.removeItem(getStorageKey(facingMode));
      } else {
        localStorage.removeItem(getStorageKey('user'));
        localStorage.removeItem(getStorageKey('environment'));
      }
      // Also clean up obsolete legacy v1 key
      localStorage.removeItem('sankara_device_distance_calibration_v1');
    } catch {
      // ignore
    }
  }
  return getAutoDetectedCalibration(facingMode ?? 'user');
}

/**
 * 1-Euro Filter implementation for zero-lag, jitter-free human position tracking
 * (Casiez et al., CHI 2012)
 */
class OneEuroFilter {
  private xPrev: number | null = null;
  private dxPrev: number = 0;
  private tPrev: number | null = null;

  constructor(
    private minCutoff: number = 0.9, // Hz: lower value = more smoothing when stationary
    private beta: number = 0.018,    // responsiveness when moving quickly
    private dCutoff: number = 1.0    // Hz: cutoff for velocity filter
  ) {}

  private alpha(cutoff: number, dt: number): number {
    const tau = 1.0 / (2 * Math.PI * cutoff);
    return 1.0 / (1.0 + tau / dt);
  }

  public filter(x: number, timestampMs: number): number {
    if (this.tPrev === null || this.xPrev === null) {
      this.xPrev = x;
      this.dxPrev = 0;
      this.tPrev = timestampMs;
      return x;
    }

    const dt = Math.max(0.001, (timestampMs - this.tPrev) / 1000);
    this.tPrev = timestampMs;

    // Filter derivative of signal (velocity)
    const dx = (x - this.xPrev) / dt;
    const aD = this.alpha(this.dCutoff, dt);
    const dxHat = aD * dx + (1 - aD) * this.dxPrev;
    this.dxPrev = dxHat;

    // Dynamic cutoff based on speed
    const cutoff = this.minCutoff + this.beta * Math.abs(dxHat);
    const a = this.alpha(cutoff, dt);
    const xHat = a * x + (1 - a) * this.xPrev;
    this.xPrev = xHat;

    return xHat;
  }

  public reset(): void {
    this.xPrev = null;
    this.dxPrev = 0;
    this.tPrev = null;
  }
}

/**
 * Calculates raw estimated physical distance in metres from a single face measurement.
 * 
 * ROTATION-INVARIANT DESIGN:
 * 1. Iris Diameter: Horizontal Visible Iris Diameter (HVID) is ~11.7mm (±0.5mm) across
 *    all human ages, sexes, and ethnicities. Highly invariant to facial geometry and head yaw.
 * 2. Interpupillary Distance (IPD ~63mm): Compensated for yaw foreshortening: IPD / cos(yaw).
 * 3. Bi-ocular Width (~92mm): Distance between outer eye corners (landmarks 33-263) / cos(yaw).
 * 4. Bizygomatic Face Width (~138mm): Compensated for yaw foreshortening: Width / cos(yaw).
 * 5. Vertical Face Height (~182mm): Forehead to chin in isotropic coordinates. Invariant to yaw,
 *    compensated for pitch: Height / cos(pitch).
 * 6. Robust Consensus Fusion: Blends all available optical features with confidence weighting.
 */
export function calculateRawEstimatedDistance(
  measurement: RawFaceMeasurement,
  calibration: DistanceCalibrationParams = DEFAULT_DISTANCE_CALIBRATION
): number {
  const { nominalIpdConstant, nominalFaceWidthConstant, userFocalMultiplier } = calibration;
  const nominalIrisConstant = calibration.nominalIrisConstant ?? (nominalIpdConstant * (11.7 / 63.0));
  const nominalBiocularConstant = calibration.nominalBiocularConstant ?? (nominalIpdConstant * (92.0 / 63.0));
  const nominalFaceHeightConstant = calibration.nominalFaceHeightConstant ?? 0.1375;

  // Yaw foreshortening compensation factor (cos yaw)
  const rawYawDeg = measurement.headYawDeg ?? 0;
  const absYawDeg = Math.abs(rawYawDeg);
  const yawRad = (absYawDeg * Math.PI) / 180;
  const cosYaw = Math.cos(yawRad);
  const yawForeshorteningFactor = Math.max(0.50, Math.min(1.0, cosYaw));

  // Pitch foreshortening compensation factor (cos pitch)
  const rawPitchDeg = measurement.headPitchDeg ?? 0;
  const absPitchDeg = Math.abs(rawPitchDeg);
  const pitchRad = (absPitchDeg * Math.PI) / 180;
  const cosPitch = Math.cos(pitchRad);
  const pitchForeshorteningFactor = Math.max(0.55, Math.min(1.0, cosPitch));

  const estimates: { distance: number; weight: number; label: string }[] = [];

  // Metric 1: Interpupillary Distance (IPD ~63 mm) - Primary Anchor (sub-pixel pupil center accuracy)
  if (measurement.interpupillaryDistanceNorm && measurement.interpupillaryDistanceNorm > 0.012) {
    const correctedIpdNorm = measurement.interpupillaryDistanceNorm / yawForeshorteningFactor;
    const distFromIpd = (nominalIpdConstant / correctedIpdNorm) * userFocalMultiplier;
    if (distFromIpd >= 0.25 && distFromIpd <= 3.5) {
      const weight = Math.max(0.25, 0.48 * yawForeshorteningFactor);
      estimates.push({ distance: distFromIpd, weight, label: 'ipd' });
    }
  }

  // Metric 2: Bi-ocular width (outer canthus to outer canthus ~92 mm) - Secondary Anchor
  if (measurement.biocularWidthNorm && measurement.biocularWidthNorm > 0.02) {
    const correctedBiocularNorm = measurement.biocularWidthNorm / yawForeshorteningFactor;
    const distFromBiocular = (nominalBiocularConstant / correctedBiocularNorm) * userFocalMultiplier;
    if (distFromBiocular >= 0.25 && distFromBiocular <= 3.5) {
      const weight = Math.max(0.18, 0.28 * yawForeshorteningFactor);
      estimates.push({ distance: distFromBiocular, weight, label: 'biocular' });
    }
  }

  // Metric 3: Vertical Face Height (FOREHEAD-TO-CHIN ~175 mm) - Yaw-Invariant Anchor
  if (measurement.faceHeightNorm && measurement.faceHeightNorm > 0.035) {
    const correctedHeightNorm = measurement.faceHeightNorm / pitchForeshorteningFactor;
    const distFromHeight = (nominalFaceHeightConstant / correctedHeightNorm) * userFocalMultiplier;
    if (distFromHeight >= 0.25 && distFromHeight <= 3.5) {
      // When head is turned sideways, height becomes even more important
      const weight = (0.20 + 0.25 * (1 - yawForeshorteningFactor)) * pitchForeshorteningFactor;
      estimates.push({ distance: distFromHeight, weight, label: 'height' });
    }
  }

  // Metric 4: Bizygomatic Face Width with yaw compensation (~137 mm)
  if (measurement.faceWidthNorm && measurement.faceWidthNorm > 0.03) {
    const correctedWidthNorm = measurement.faceWidthNorm / yawForeshorteningFactor;
    const distFromWidth = (nominalFaceWidthConstant / correctedWidthNorm) * userFocalMultiplier;
    if (distFromWidth >= 0.25 && distFromWidth <= 3.5) {
      const weight = Math.max(0.08, 0.16 * yawForeshorteningFactor);
      estimates.push({ distance: distFromWidth, weight, label: 'face_width' });
    }
  }

  // Metric 5: Horizontal Visible Iris Diameter (HVID ~11.7 mm) - Supplementary Micro-Anchor
  if (measurement.irisDiameterNorm && measurement.irisDiameterNorm > 0.0035) {
    const distFromIris = (nominalIrisConstant / measurement.irisDiameterNorm) * userFocalMultiplier;
    if (distFromIris >= 0.30 && distFromIris <= 3.2) {
      estimates.push({ distance: distFromIris, weight: 0.08, label: 'iris' });
    }
  }

  // Fallback Metric 6: Bounding box if high-res landmarks are unavailable
  if (estimates.length === 0 && measurement.box) {
    if (measurement.box.height > 0.04) {
      const distFromBoxHeight = (nominalFaceHeightConstant / (measurement.box.height / pitchForeshorteningFactor)) * userFocalMultiplier;
      if (distFromBoxHeight >= 0.25 && distFromBoxHeight <= 3.5) {
        estimates.push({ distance: distFromBoxHeight, weight: 1.0, label: 'box_height' });
      }
    } else if (measurement.box.width > 0.04) {
      const correctedBoxWidth = measurement.box.width / yawForeshorteningFactor;
      const distFromBoxWidth = (nominalFaceWidthConstant / correctedBoxWidth) * userFocalMultiplier;
      if (distFromBoxWidth >= 0.25 && distFromBoxWidth <= 3.5) {
        estimates.push({ distance: distFromBoxWidth, weight: 1.0, label: 'box_width' });
      }
    }
  }

  if (estimates.length === 0) {
    return 1.0; // neutral fallback
  }

  // Consensus Outlier Rejection:
  // If we have 3 or more metric estimates (e.g. iris, ipd, biocular, height, face_width),
  // compute median distance across candidate estimates. Reject or downweight estimates that deviate >25%
  // from consensus median (prevents noisy single-metric glitch from skewing distance).
  if (estimates.length >= 3) {
    const rawDistances = estimates.map((e) => e.distance).sort((a, b) => a - b);
    const medianVal = rawDistances[Math.floor(rawDistances.length / 2)];
    for (const est of estimates) {
      const dev = Math.abs(est.distance - medianVal) / Math.max(0.1, medianVal);
      if (dev > 0.28) {
        // Severe outlier: drop influence
        est.weight *= 0.05;
      } else if (dev > 0.15) {
        // Mild outlier: dampen influence
        est.weight *= 0.40;
      }
    }
  }

  // Multi-metric robust weighted fusion
  let totalWeight = 0;
  let weightedDistSum = 0;
  for (const est of estimates) {
    weightedDistSum += est.distance * est.weight;
    totalWeight += est.weight;
  }

  return totalWeight > 0 ? weightedDistSum / totalWeight : estimates[0].distance;
}

/**
 * Class for managing temporal smoothing and stability state over time
 */
export class DistanceStabilityTracker {
  private filter: OneEuroFilter = new OneEuroFilter(0.85, 0.020, 1.0);
  private rawMedianBuffer: number[] = [];
  private smoothedDistance: number | null = null;
  private perfectDistanceStartTime: number | null = null;
  private lastMeasurementTime: number = 0;
  private recentDistances: number[] = [];

  public reset(): void {
    this.filter.reset();
    this.rawMedianBuffer = [];
    this.smoothedDistance = null;
    this.perfectDistanceStartTime = null;
    this.recentDistances = [];
  }

  /**
   * Updates tracker with new frame measurement and returns comprehensive validation result
   */
  public update(
    rawMeasurement: RawFaceMeasurement | null,
    calibration: DistanceCalibrationParams = DEFAULT_DISTANCE_CALIBRATION,
    config: DistanceGateConfig = DEFAULT_DISTANCE_CONFIG,
    now: number = Date.now(),
    facingMode: 'user' | 'environment' = 'user'
  ): DistanceValidationResult {
    const isRear = facingMode === 'environment';

    // Case 1: No detection data / camera issue
    if (!rawMeasurement || rawMeasurement.faceCount === 0) {
      this.perfectDistanceStartTime = null;
      this.recentDistances = [];
      return {
        isReady: false,
        estimatedDistanceMeters: this.smoothedDistance ?? config.targetDistanceMeters,
        estimatedDistanceCm: Math.round((this.smoothedDistance ?? config.targetDistanceMeters) * 100),
        formattedDistance: '--',
        status: 'no_face',
        statusColor: 'slate',
        statusMessage: isRear ? 'Aim rear camera at student' : 'Position your face in the frame',
        guidanceText: isRear
          ? 'Hold device at student eye-level and align their face inside the oval.'
          : 'Ensure your room is well lit and look straight into the camera.',
        isCentered: false,
        isDistanceAcceptable: false,
        stabilityProgress: 0,
        stabilityElapsedMs: 0,
        faceCount: 0,
        confidence: 0,
      };
    }

    // Case 2: Multiple faces detected
    if (rawMeasurement.faceCount > 1) {
      this.perfectDistanceStartTime = null;
      this.recentDistances = [];
      return {
        isReady: false,
        estimatedDistanceMeters: this.smoothedDistance ?? config.targetDistanceMeters,
        estimatedDistanceCm: Math.round((this.smoothedDistance ?? config.targetDistanceMeters) * 100),
        formattedDistance: '--',
        status: 'multiple_faces',
        statusColor: 'red',
        statusMessage: 'Please make sure only one person is visible',
        guidanceText: `${rawMeasurement.faceCount} faces detected in frame. Only the student being screened should be in view.`,
        isCentered: false,
        isDistanceAcceptable: false,
        stabilityProgress: 0,
        stabilityElapsedMs: 0,
        faceCount: rawMeasurement.faceCount,
        confidence: rawMeasurement.confidence,
        rawMeasurement,
      };
    }

    // Case 3: Low confidence
    if (rawMeasurement.confidence < config.minConfidenceThreshold) {
      this.perfectDistanceStartTime = null;
      return {
        isReady: false,
        estimatedDistanceMeters: this.smoothedDistance ?? config.targetDistanceMeters,
        estimatedDistanceCm: Math.round((this.smoothedDistance ?? config.targetDistanceMeters) * 100),
        formattedDistance: '--',
        status: 'low_confidence',
        statusColor: 'amber',
        statusMessage: 'Hold steady for camera focus',
        guidanceText: isRear
          ? 'Hold the phone steady so the rear lens can focus on the student.'
          : 'Avoid rapid movements so the camera can measure your distance accurately.',
        isCentered: false,
        isDistanceAcceptable: false,
        stabilityProgress: 0,
        stabilityElapsedMs: 0,
        faceCount: 1,
        confidence: rawMeasurement.confidence,
        rawMeasurement,
      };
    }

    // Single face detected with sufficient confidence: Calculate distance
    const rawDist = calculateRawEstimatedDistance(rawMeasurement, calibration);

    // Median filter over last 5 raw measurements to reject single-frame optical spikes
    this.rawMedianBuffer.push(rawDist);
    if (this.rawMedianBuffer.length > 5) {
      this.rawMedianBuffer.shift();
    }
    const sorted = [...this.rawMedianBuffer].sort((a, b) => a - b);
    const medianDist = sorted[Math.floor(sorted.length / 2)];

    // Apply 1-Euro adaptive filter (zero lag when moving, zero jitter when holding position)
    const filteredDist = this.filter.filter(medianDist, now);
    this.smoothedDistance = filteredDist;

    const currentDist = this.smoothedDistance;
    const currentDistFormatted = `${currentDist.toFixed(2)} m`;
    const currentDistCm = Math.round(currentDist * 100);

    // Keep rolling window of last 10 readings for jitter calculation
    this.recentDistances.push(currentDist);
    if (this.recentDistances.length > 12) {
      this.recentDistances.shift();
    }

    // Check Centering: Face center should be within tolerance of (0.5, 0.5)
    const center = rawMeasurement.center || { x: 0.5, y: 0.5 };
    const xOffset = Math.abs(center.x - 0.5);
    const yOffset = Math.abs(center.y - 0.45); // slightly above vertical midpoint for natural face frame
    const isCentered = xOffset <= config.maxOffCenterToleranceNorm && yOffset <= (config.maxOffCenterToleranceNorm * 1.3);

    // Check Head Tilt / Roll
    const isTilted = rawMeasurement.headRollDeg !== undefined && Math.abs(rawMeasurement.headRollDeg) > config.maxHeadTiltRollDeg;
    const isTurned = rawMeasurement.headYawDeg !== undefined && Math.abs(rawMeasurement.headYawDeg) > config.maxHeadYawDeg;

    // Check Distance Range according to user requirements
    // Example:
    // 0.70 m -> Red -> "Too close — move farther away"
    // 0.85 m -> Orange -> "Move slightly farther away"
    // 0.96 m -> Green -> "Perfect distance"
    // 1.02 m -> Green -> "Perfect distance"
    // 1.15 m -> Orange -> "Move slightly closer"
    // 1.30 m -> Red -> "Too far — move closer"
    let status: DistanceAlignmentStatus;
    let statusColor: 'red' | 'orange' | 'green' | 'slate' | 'amber';
    let statusMessage: string;
    let guidanceText: string;
    let isDistanceAcceptable = false;

    if (currentDist < config.nearWarningDistanceMeters) {
      status = 'too_close';
      statusColor = 'red';
      statusMessage = isRear ? 'Too close — move back from student' : 'Too close — move farther away';
      guidanceText = isRear
        ? 'Move camera back or ask student to take a step back to reach 1.00 m.'
        : 'Step back until the distance reaches approximately 1.0 metre.';
    } else if (currentDist < config.minAcceptableDistanceMeters) {
      status = 'slightly_close';
      statusColor = 'orange';
      statusMessage = isRear ? 'Move camera slightly back' : 'Move slightly farther away';
      guidanceText = isRear
        ? 'Almost at 1.0 m! Step back a few centimetres.'
        : 'Almost there! Take a small half-step back.';
    } else if (currentDist > config.farWarningDistanceMeters) {
      status = 'too_far';
      statusColor = 'red';
      statusMessage = isRear ? 'Too far — move closer to student' : 'Too far — move closer';
      guidanceText = isRear
        ? 'Move camera forward or ask student to take a step closer to reach 1.00 m.'
        : 'Step forward towards the screen to reach 1.0 metre.';
    } else if (currentDist > config.maxAcceptableDistanceMeters) {
      status = 'slightly_far';
      statusColor = 'orange';
      statusMessage = isRear ? 'Move camera slightly closer' : 'Move slightly closer';
      guidanceText = isRear
        ? 'Almost at 1.0 m! Step forward a few centimetres.'
        : 'Almost there! Take a small half-step forward.';
    } else {
      // Inside acceptable range: 0.92 m - 1.08 m (Target 1.00 m)
      isDistanceAcceptable = true;

      if (!isCentered) {
        status = 'off_center';
        statusColor = 'orange';
        if (isRear) {
          statusMessage = xOffset > config.maxOffCenterToleranceNorm
            ? (center.x < 0.5 ? 'Pan camera left' : 'Pan camera right')
            : 'Center student in the guide';
          guidanceText = 'Align student face directly inside the oval target.';
        } else {
          statusMessage = xOffset > config.maxOffCenterToleranceNorm
            ? (center.x < 0.5 ? 'Move slightly right' : 'Move slightly left')
            : 'Center your face in the guide';
          guidanceText = 'Align your face directly inside the oval guide frame.';
        }
      } else if (isTilted || isTurned) {
        status = 'face_tilted';
        statusColor = 'orange';
        if (isTurned && rawMeasurement.headYawDeg) {
          statusMessage = isRear
            ? 'Student should face forward'
            : (rawMeasurement.headYawDeg > 0 ? 'Turn face slightly left' : 'Turn face slightly right');
          guidanceText = 'Face directly towards the camera for accurate visual screening.';
        } else {
          statusMessage = isRear ? 'Keep student head level' : 'Look straight at the screen';
          guidanceText = 'Keep head level and look directly forward.';
        }
      } else {
        status = 'perfect_distance';
        statusColor = 'green';
        statusMessage = isRear ? '1.00 m Distance Verified!' : 'Perfect distance';
        guidanceText = isRear
          ? 'Hold steady. Verifying 1.00 m distance to unlock test.'
          : 'Hold this position steady to unlock the vision test.';
      }
    }

    // Stability evaluation:
    // Requires: isDistanceAcceptable && isCentered && !isTilted && !isTurned
    const isQualifyingPosition = isDistanceAcceptable && isCentered && !isTilted && !isTurned;

    let stabilityElapsedMs = 0;
    let stabilityProgress = 0;
    let isReady = false;

    if (isQualifyingPosition) {
      if (this.perfectDistanceStartTime === null) {
        this.perfectDistanceStartTime = now;
      }
      stabilityElapsedMs = now - this.perfectDistanceStartTime;
      stabilityProgress = Math.min(1.0, stabilityElapsedMs / config.stabilityDurationMs);

      if (stabilityElapsedMs >= config.stabilityDurationMs) {
        isReady = true;
      }
    } else {
      // Reset stability timer if position deviates
      this.perfectDistanceStartTime = null;
      stabilityElapsedMs = 0;
      stabilityProgress = 0;
      isReady = false;
    }

    let estimatorStatus: EstimatorStatus;
    if (isReady) {
      estimatorStatus = 'READY';
    } else if (currentDist < config.minAcceptableDistanceMeters) {
      estimatorStatus = 'TOO_CLOSE';
    } else if (currentDist > config.farWarningDistanceMeters) {
      estimatorStatus = 'TOO_FAR';
    } else if (currentDist > config.maxAcceptableDistanceMeters) {
      estimatorStatus = 'MOVE_CLOSER';
    } else {
      estimatorStatus = 'ALMOST_READY';
    }

    this.lastMeasurementTime = now;

    return {
      isReady,
      estimatedDistanceMeters: Math.round(currentDist * 100) / 100,
      estimatedDistanceCm: currentDistCm,
      formattedDistance: currentDistFormatted,
      status,
      estimatorStatus,
      statusColor,
      statusMessage,
      guidanceText,
      isCentered,
      isDistanceAcceptable,
      stabilityProgress,
      stabilityElapsedMs,
      faceCount: 1,
      confidence: rawMeasurement.confidence,
      rawMeasurement,
    };
  }
}

/**
 * Modular DistanceEstimator component matching architectural requirements.
 * Accepts:
 * - detected facial measurement in pixels & normalized coords
 * - camera/video dimensions
 * - calibration parameters
 * - target distance & facing mode
 * 
 * Returns:
 * { distanceMeters, confidence, stable, status }
 */
export class DistanceEstimator {
  private tracker: DistanceStabilityTracker;

  constructor() {
    this.tracker = new DistanceStabilityTracker();
  }

  public estimate(params: {
    measurement: RawFaceMeasurement | null;
    videoDimensions?: { width: number; height: number };
    calibration?: DistanceCalibrationParams;
    targetDistance?: number;
    facingMode?: 'user' | 'environment';
    now?: number;
  }): {
    distanceMeters: number;
    confidence: number;
    stable: boolean;
    status: EstimatorStatus;
    validation: DistanceValidationResult;
  } {
    const config = params.targetDistance
      ? { ...DEFAULT_DISTANCE_CONFIG, targetDistanceMeters: params.targetDistance }
      : DEFAULT_DISTANCE_CONFIG;

    const validation = this.tracker.update(
      params.measurement,
      params.calibration ?? DEFAULT_DISTANCE_CALIBRATION,
      config,
      params.now ?? Date.now(),
      params.facingMode ?? 'user'
    );

    const status: EstimatorStatus =
      validation.estimatorStatus ||
      (validation.isReady
        ? 'READY'
        : validation.status === 'no_face'
        ? 'NO_FACE'
        : validation.status === 'multiple_faces'
        ? 'MULTIPLE_FACES'
        : validation.status === 'low_confidence'
        ? 'LOW_CONFIDENCE'
        : validation.status === 'too_close'
        ? 'TOO_CLOSE'
        : validation.status === 'too_far'
        ? 'TOO_FAR'
        : validation.status === 'slightly_far'
        ? 'MOVE_CLOSER'
        : 'ALMOST_READY');

    return {
      distanceMeters: validation.estimatedDistanceMeters,
      confidence: validation.confidence,
      stable: validation.isReady,
      status,
      validation,
    };
  }

  public reset(): void {
    this.tracker.reset();
  }
}

/**
 * Creates a calibrated userFocalMultiplier by setting the current detected distance to exactly 1.00m
 */
export function calibrateToTargetDistance(
  currentRawDistance: number,
  targetDistance: number = 1.0,
  currentCalibration: DistanceCalibrationParams = DEFAULT_DISTANCE_CALIBRATION,
  facingMode: 'user' | 'environment' = 'user'
): DistanceCalibrationParams {
  if (currentRawDistance <= 0.2 || currentRawDistance >= 4.0) {
    return currentCalibration;
  }

  // If current measurement is X meters, we want it to equal targetDistance
  // newMultiplier = oldMultiplier * (targetDistance / currentRawDistance)
  const ratio = targetDistance / currentRawDistance;
  const newMultiplier = Math.max(0.5, Math.min(2.2, currentCalibration.userFocalMultiplier * ratio));

  const updated: DistanceCalibrationParams = {
    ...currentCalibration,
    userFocalMultiplier: Math.round(newMultiplier * 1000) / 1000,
    lastCalibratedAt: new Date().toISOString(),
  };

  saveDistanceCalibration(updated, facingMode);
  return updated;
}
