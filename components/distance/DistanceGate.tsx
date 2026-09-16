'use client';

import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import {
  DistanceGateConfig,
  DEFAULT_DISTANCE_CONFIG,
  DistanceCalibrationParams,
  DistanceValidationResult,
  RawFaceMeasurement,
} from '@/lib/distanceConfig';
import {
  getSavedDistanceCalibration,
  DistanceStabilityTracker,
} from '@/lib/distanceEstimation';
import {
  getAutoDetectedProfile,
  DeviceProfileInfo,
  DEVICE_CALIBRATION_PROFILES,
} from '@/lib/deviceDetection';
import { VisionEngine } from '@/lib/visionEngine';
import { FacePositionGuide } from './FacePositionGuide';
import { DistanceIndicator } from './DistanceIndicator';
import {
  Camera,
  CameraOff,
  RefreshCw,
  ShieldCheck,
  CheckCircle2,
  Lock,
  ArrowRight,
  ChevronLeft,
  AlertTriangle,
  Sparkles,
  Laptop,
  Smartphone,
  Tablet,
  Monitor,
} from 'lucide-react';

interface DistanceGateProps {
  config?: Partial<DistanceGateConfig>;
  onUnlockAndStart: (distanceMeters: number) => void;
  onBack?: () => void;
  language?: string;
  allowManualBypass?: boolean;
}

export const DistanceGate: React.FC<DistanceGateProps> = ({
  config: userConfig,
  onUnlockAndStart,
  onBack,
  language = 'en',
  allowManualBypass = true,
}) => {
  // Merge user config with defaults
  const activeConfig = useMemo<DistanceGateConfig>(() => ({
    ...DEFAULT_DISTANCE_CONFIG,
    ...userConfig,
  }), [userConfig]);

  const configRef = useRef<DistanceGateConfig>(activeConfig);
  useEffect(() => {
    configRef.current = activeConfig;
  }, [activeConfig]);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const visionEngineRef = useRef<VisionEngine | null>(null);
  const stabilityTrackerRef = useRef<DistanceStabilityTracker>(new DistanceStabilityTracker());

  // Camera & permission states
  const [cameraState, setCameraState] = useState<'idle' | 'requesting' | 'streaming' | 'denied' | 'unavailable'>('idle');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('user');

  // Auto-detected device profile and lens calibration state
  const [deviceProfile, setDeviceProfile] = useState<DeviceProfileInfo>(() => getAutoDetectedProfile());
  const [calibration, setCalibration] = useState<DistanceCalibrationParams>(() => getSavedDistanceCalibration());
  const calibrationRef = useRef<DistanceCalibrationParams>(calibration);
  useEffect(() => {
    calibrationRef.current = calibration;
  }, [calibration]);

  // Sync on window resize or orientation change
  useEffect(() => {
    const handleResize = () => {
      const updated = getAutoDetectedProfile();
      setDeviceProfile(updated);
      setCalibration(updated.calibration);
    };
    window.addEventListener('resize', handleResize);
    window.addEventListener('orientationchange', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('orientationchange', handleResize);
    };
  }, []);

  // Live validation state
  const [validation, setValidation] = useState<DistanceValidationResult>(() => ({
    isReady: false,
    estimatedDistanceMeters: 1.0,
    estimatedDistanceCm: 100,
    formattedDistance: '--',
    status: 'initializing',
    statusColor: 'slate',
    statusMessage: 'Starting camera sensor...',
    guidanceText: 'Please allow camera permission so we can verify the 1-metre testing distance.',
    isCentered: false,
    isDistanceAcceptable: false,
    stabilityProgress: 0,
    stabilityElapsedMs: 0,
    faceCount: 0,
    confidence: 0,
  }));

  const [rawMeasurement, setRawMeasurement] = useState<RawFaceMeasurement | null>(null);
  const [videoDimensions, setVideoDimensions] = useState({ width: 640, height: 480 });

  // Stop camera tracks cleanly
  const stopCameraStream = useCallback(() => {
    if (visionEngineRef.current) {
      visionEngineRef.current.stop();
    }
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach((track) => {
        try {
          track.stop();
        } catch {
          // ignore
        }
      });
      mediaStreamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
  }, []);

  // Initialize and start camera stream
  const startCamera = useCallback(async () => {
    setCameraState('requesting');
    setErrorMessage(null);

    // Stop any existing stream
    stopCameraStream();

    if (typeof navigator === 'undefined' || !navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      setCameraState('unavailable');
      setErrorMessage('Camera access is not supported by this browser.');
      return;
    }

    try {
      const constraints: MediaStreamConstraints = {
        video: {
          facingMode: { ideal: facingMode },
          width: { ideal: 640, max: 1280 },
          height: { ideal: 480, max: 720 },
          frameRate: { ideal: 30, max: 30 },
        },
        audio: false,
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      mediaStreamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.onloadedmetadata = () => {
          if (videoRef.current) {
            videoRef.current.play().catch(console.warn);
            setVideoDimensions({
              width: videoRef.current.videoWidth || 640,
              height: videoRef.current.videoHeight || 480,
            });
            setCameraState('streaming');

            // Start computer vision engine once video is playing
            if (visionEngineRef.current) {
              visionEngineRef.current.start(videoRef.current);
            }
          }
        };
      }
    } catch (err: any) {
      console.warn('Camera permission or device error:', err);
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        setCameraState('denied');
        setErrorMessage('Camera permission was denied. Please allow camera access in your browser address bar.');
      } else {
        setCameraState('unavailable');
        setErrorMessage(err.message || 'Unable to open camera on this device.');
      }
    }
  }, [facingMode, stopCameraStream]);

  // Setup VisionEngine on mount
  useEffect(() => {
    const engine = new VisionEngine({
      onMeasurement: (measurement) => {
        setRawMeasurement(measurement);
        const res = stabilityTrackerRef.current.update(
          measurement,
          calibrationRef.current,
          configRef.current,
          Date.now()
        );
        setValidation(res);
      },
      onError: (err) => {
        console.warn('Vision engine warning:', err);
      },
      onStatusChange: (status) => {
        if (status === 'loading') {
          setValidation((prev) => ({
            ...prev,
            statusMessage: 'Loading face detection model...',
            guidanceText: 'Initializing optical computer vision sensor...',
          }));
        }
      },
    });

    visionEngineRef.current = engine;
    engine.initialize().then(() => {
      startCamera();
    });

    return () => {
      stopCameraStream();
      engine.destroy();
      visionEngineRef.current = null;
    };
  }, [startCamera, stopCameraStream]);

  // Flip camera toggle
  const handleFlipCamera = () => {
    setFacingMode((prev) => (prev === 'user' ? 'environment' : 'user'));
  };

  // Trigger test start when unlocked
  const handleStartTest = () => {
    if (!validation.isReady) return;
    stopCameraStream();
    onUnlockAndStart(validation.estimatedDistanceMeters);
  };

  // Optional manual override for field screenings if camera cannot open
  const handleManualConfirmation = () => {
    stopCameraStream();
    onUnlockAndStart(1.0);
  };

  return (
    <div className="w-full max-w-2xl mx-auto space-y-4" id="distance-gate-container">
      {/* Top Header & Navigation */}
      <div className="flex items-center justify-between">
        {onBack ? (
          <button
            type="button"
            onClick={() => {
              stopCameraStream();
              onBack();
            }}
            className="flex items-center gap-1.5 text-xs sm:text-sm font-extrabold text-slate-600 hover:text-slate-900 cursor-pointer bg-white px-3 py-1.5 rounded-xl border border-slate-200 shadow-2xs"
            id="btn-back-instructions"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>Back to Instructions</span>
          </button>
        ) : (
          <div />
        )}

        {/* Auto-detected Lens Profile Badge */}
        <div
          suppressHydrationWarning={true}
          className="flex items-center gap-1.5 text-xs font-bold text-slate-700 bg-white px-3 py-1.5 rounded-xl border border-slate-200 shadow-2xs"
          title={deviceProfile.description}
          id="device-auto-profile-badge"
        >
          {deviceProfile.category === 'mobile' && <Smartphone className="w-3.5 h-3.5 text-orange-600" />}
          {deviceProfile.category === 'tablet' && <Tablet className="w-3.5 h-3.5 text-orange-600" />}
          {deviceProfile.category === 'laptop' && <Laptop className="w-3.5 h-3.5 text-orange-600" />}
          {deviceProfile.category === 'desktop' && <Monitor className="w-3.5 h-3.5 text-orange-600" />}
          <span suppressHydrationWarning={true}>Auto-Calibrated: {deviceProfile.label}</span>
        </div>
      </div>

      {/* Main Vision Stage & Camera Viewport */}
      <div className="bg-white rounded-3xl p-4 sm:p-6 border border-orange-100 shadow-sm space-y-4">
        <div className="text-center">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-orange-100 text-orange-800 text-[11px] font-black uppercase tracking-wider mb-2">
            <ShieldCheck className="w-3.5 h-3.5 text-orange-700" />
            <span>Clinical 1-Metre Gate</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            Position Yourself at 1.0 Metre
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 font-medium mt-1 max-w-md mx-auto">
            Visual acuity screening requires an exact 1-metre distance. The test unlocks automatically once you are properly positioned.
          </p>
        </div>

        {/* Camera Stage Container with Pure White Surround */}
        <div className="relative w-full aspect-[4/3] min-h-[320px] max-h-[400px] bg-white rounded-3xl overflow-hidden border-2 border-slate-200 shadow-xs flex items-center justify-center">
          {/* Virtual Try-on Face Positioning Guide: Houses the oval aperture container */}
          <FacePositionGuide
            validation={validation}
            videoWidth={videoDimensions.width}
            videoHeight={videoDimensions.height}
          >
            {/* Live Video Preview (Mirrored): Mounted strictly inside the oval */}
            <video
              ref={videoRef}
              playsInline
              muted
              autoPlay
              className="w-full h-full object-cover -scale-x-100"
              id="camera-stream-video"
            />
          </FacePositionGuide>

          {/* Camera Flip Icon (if mobile device with multiple lenses) */}
          {cameraState === 'streaming' && (
            <button
              type="button"
              onClick={handleFlipCamera}
              className="absolute top-3 right-3 z-30 w-9 h-9 rounded-full bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 shadow-xs flex items-center justify-center transition cursor-pointer"
              title="Flip camera"
              id="btn-flip-camera"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          )}

          {/* Privacy Badge on Camera Preview */}
          <div className="absolute bottom-3 left-3 z-30 flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white/95 border border-slate-200 text-slate-600 text-[10px] font-semibold shadow-2xs">
            <ShieldCheck className="w-3 h-3 text-emerald-600" />
            <span>Private: Local browser processing</span>
          </div>

          {/* Camera Permission Denied or Unavailable State */}
          {(cameraState === 'denied' || cameraState === 'unavailable') && (
            <div className="absolute inset-0 bg-white text-slate-800 flex flex-col items-center justify-center p-6 text-center z-20 space-y-3">
              <div className="w-14 h-14 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center border border-rose-200 shadow-2xs">
                <CameraOff className="w-7 h-7 stroke-[1.75]" />
              </div>
              <div>
                <h3 className="text-base font-extrabold text-slate-900">
                  {cameraState === 'denied' ? 'Camera Access Required' : 'Camera Unavailable'}
                </h3>
                <p className="text-xs text-slate-600 mt-1 max-w-sm">
                  {errorMessage || 'Please enable camera permission in your browser to verify the 1-metre testing distance.'}
                </p>
              </div>
              <button
                type="button"
                onClick={startCamera}
                className="py-2 px-4 rounded-xl bg-orange-600 hover:bg-orange-700 text-white text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-sm"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Retry Camera</span>
              </button>
            </div>
          )}

          {/* Loading / Requesting Camera State */}
          {cameraState === 'requesting' && (
            <div className="absolute inset-0 bg-white text-slate-800 flex flex-col items-center justify-center p-6 text-center z-20 space-y-3">
              <div className="w-10 h-10 border-3 border-orange-500 border-t-transparent rounded-full animate-spin" />
              <p className="text-xs font-bold text-slate-700">Opening camera sensor...</p>
            </div>
          )}
        </div>

        {/* Live Distance & Positioning Feedback Indicator */}
        <DistanceIndicator
          validation={validation}
          targetDistanceMeters={activeConfig.targetDistanceMeters}
        />

        {/* LOCKED / UNLOCKED Action Button */}
        <div className="space-y-2 pt-2">
          {validation.isReady ? (
            <button
              type="button"
              onClick={handleStartTest}
              className="w-full py-4 px-6 bg-emerald-600 hover:bg-emerald-700 active:scale-[0.99] text-white font-extrabold text-base sm:text-lg rounded-2xl shadow-xl shadow-emerald-600/30 flex items-center justify-center gap-2.5 transition cursor-pointer animate-pulse"
              id="btn-start-test-unlocked"
            >
              <CheckCircle2 className="w-6 h-6 stroke-[2.5]" />
              <span>START VISION TEST (1.00 m LOCKED)</span>
              <ArrowRight className="w-5 h-5 stroke-[2]" />
            </button>
          ) : (
            <button
              type="button"
              disabled
              className="w-full py-4 px-6 bg-slate-200 text-slate-400 font-extrabold text-base sm:text-lg rounded-2xl shadow-none flex items-center justify-center gap-2.5 cursor-not-allowed select-none transition-all"
              id="btn-start-test-locked"
            >
              <Lock className="w-5 h-5" />
              <span>START TEST (LOCKED — ADJUST DISTANCE)</span>
            </button>
          )}

          {/* Manual Measurement Bypass (For rural school screenings when camera is unavailable or broken) */}
          {(cameraState === 'denied' || cameraState === 'unavailable' || allowManualBypass) && (
            <div className="text-center pt-2">
              <button
                type="button"
                onClick={handleManualConfirmation}
                className="text-xs font-semibold text-slate-500 hover:text-slate-800 underline underline-offset-4 cursor-pointer"
                id="btn-manual-distance-bypass"
              >
                Measured with physical 1-metre ruler/tape? Tap to continue manually
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
