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
  getAutoDetectedCalibration,
  DeviceProfileInfo,
  DEVICE_CALIBRATION_PROFILES,
} from '@/lib/deviceDetection';
import { VisionEngine } from '@/lib/visionEngine';
import { FacePositionGuide } from './FacePositionGuide';
import { DistanceIndicator } from './DistanceIndicator';
import { DistanceDebugOverlay } from './DistanceDebugOverlay';
import { DistanceCalibrationModal } from './DistanceCalibrationModal';
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
  UserCheck,
  SwitchCamera,
  Eye,
  Activity,
  Ruler,
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
  const previousIsReadyRef = useRef<boolean>(false);

  // Camera & permission states
  const [cameraState, setCameraState] = useState<'idle' | 'requesting' | 'streaming' | 'denied' | 'unavailable'>('idle');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('user');
  const [showDebug, setShowDebug] = useState<boolean>(false);
  const [showCalibration, setShowCalibration] = useState<boolean>(false);
  const [videoDimensions, setVideoDimensions] = useState<{ width: number; height: number }>({ width: 640, height: 480 });
  const facingModeRef = useRef<'user' | 'environment'>('user');
  useEffect(() => {
    facingModeRef.current = facingMode;
  }, [facingMode]);

  // Auto-detected device profile and lens calibration state
  const [deviceProfile, setDeviceProfile] = useState<DeviceProfileInfo>(() => getAutoDetectedProfile('user'));
  const [calibration, setCalibration] = useState<DistanceCalibrationParams>(() => getSavedDistanceCalibration('user'));
  const calibrationRef = useRef<DistanceCalibrationParams>(calibration);
  useEffect(() => {
    calibrationRef.current = calibration;
  }, [calibration]);

  // Sync on window resize or orientation change without interrupting video stream
  useEffect(() => {
    const handleResize = () => {
      const mode = facingModeRef.current;
      const updated = getAutoDetectedProfile(mode);
      const savedCalib = getSavedDistanceCalibration(mode);
      setDeviceProfile(updated);
      setCalibration(savedCalib);
      if (videoRef.current && videoRef.current.videoWidth > 0) {
        setVideoDimensions({
          width: videoRef.current.videoWidth,
          height: videoRef.current.videoHeight,
        });
      }
    };
    window.addEventListener('resize', handleResize);
    window.addEventListener('orientationchange', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('orientationchange', handleResize);
    };
  }, []);

  // Web Audio Lock Chime (Pleasant acoustic confirmation when 1.00m lock triggers)
  const playLockChime = useCallback(() => {
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const now = ctx.currentTime;

      // Note 1: C5 (523.25 Hz)
      const osc1 = ctx.createOscillator();
      const gain1 = ctx.createGain();
      osc1.type = 'sine';
      osc1.frequency.setValueAtTime(523.25, now);
      gain1.gain.setValueAtTime(0.12, now);
      gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.16);
      osc1.connect(gain1);
      gain1.connect(ctx.destination);
      osc1.start(now);
      osc1.stop(now + 0.16);

      // Note 2: E5 (659.25 Hz)
      const osc2 = ctx.createOscillator();
      const gain2 = ctx.createGain();
      osc2.type = 'sine';
      osc2.frequency.setValueAtTime(659.25, now + 0.09);
      gain2.gain.setValueAtTime(0.15, now + 0.09);
      gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.28);
      osc2.connect(gain2);
      gain2.connect(ctx.destination);
      osc2.start(now + 0.09);
      osc2.stop(now + 0.28);

      // Note 3: G5 (783.99 Hz)
      const osc3 = ctx.createOscillator();
      const gain3 = ctx.createGain();
      osc3.type = 'sine';
      osc3.frequency.setValueAtTime(783.99, now + 0.18);
      gain3.gain.setValueAtTime(0.18, now + 0.18);
      gain3.gain.exponentialRampToValueAtTime(0.001, now + 0.42);
      osc3.connect(gain3);
      gain3.connect(ctx.destination);
      osc3.start(now + 0.18);
      osc3.stop(now + 0.42);

      // Haptic confirmation vibration on mobile
      if (typeof navigator !== 'undefined' && navigator.vibrate) {
        navigator.vibrate([40, 50, 70]);
      }
    } catch {
      // AudioContext blocked or not supported
    }
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

  // Initialize and start camera stream with specific facing mode
  const startCamera = useCallback(async (targetMode: 'user' | 'environment' = facingModeRef.current) => {
    setCameraState('requesting');
    setErrorMessage(null);

    // Pause vision processing and stop old tracks
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

    if (typeof navigator === 'undefined' || !navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      setCameraState('unavailable');
      setErrorMessage('Camera access is not supported by this browser.');
      return;
    }

    try {
      // Progressive fallback chain for mobile Safari, Android Chrome, and desktop webcams
      let stream: MediaStream | null = null;
      const attempts: MediaStreamConstraints[] = [
        // Attempt 1: Optimal mobile/desktop constraints with ideal facing mode
        {
          video: {
            facingMode: { ideal: targetMode },
            width: { ideal: 1280 },
            height: { ideal: 720 },
          },
          audio: false,
        },
        // Attempt 2: Plain facing mode constraint
        {
          video: { facingMode: targetMode },
          audio: false,
        },
        // Attempt 3: Any video device fallback
        {
          video: true,
          audio: false,
        },
      ];

      for (const constraint of attempts) {
        try {
          stream = await navigator.mediaDevices.getUserMedia(constraint);
          if (stream) break;
        } catch {
          // try next constraint in chain
        }
      }

      if (!stream) {
        throw new Error('Unable to access camera on this device.');
      }

      mediaStreamRef.current = stream;

      // Auto-calibrate optical profile for active camera lens
      const updatedProfile = getAutoDetectedProfile(targetMode);
      const savedCalib = getSavedDistanceCalibration(targetMode);
      setDeviceProfile(updatedProfile);
      setCalibration(savedCalib);
      calibrationRef.current = savedCalib;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.onloadedmetadata = () => {
          if (videoRef.current) {
            videoRef.current.play().catch(console.warn);
            const w = videoRef.current.videoWidth || 640;
            const h = videoRef.current.videoHeight || 480;
            setVideoDimensions({ width: w, height: h });
            setCameraState('streaming');

            // Resume computer vision engine once new stream is playing
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
  }, []);

  // Setup VisionEngine ONCE on mount (prevents expensive WASM re-instantiation on camera flip)
  useEffect(() => {
    const engine = new VisionEngine({
      onMeasurement: (measurement) => {
        setRawMeasurement(measurement);
        const res = stabilityTrackerRef.current.update(
          measurement,
          calibrationRef.current,
          configRef.current,
          Date.now(),
          facingModeRef.current
        );
        setValidation(res);

        // Trigger audio lock chime upon stability completion
        if (res.isReady && !previousIsReadyRef.current) {
          playLockChime();
        }
        previousIsReadyRef.current = res.isReady;
      },
      onError: (err) => {
        console.warn('Vision engine warning:', err);
      },
      onStatusChange: (status) => {
        if (status === 'loading') {
          setValidation((prev) => ({
            ...prev,
            statusMessage: 'Loading optical detection model...',
            guidanceText: 'Initializing biometric distance tracker...',
          }));
        }
      },
    });

    visionEngineRef.current = engine;
    engine.initialize().then(() => {
      startCamera('user');
    });

    return () => {
      stopCameraStream();
      engine.destroy();
      visionEngineRef.current = null;
    };
  }, [playLockChime, startCamera, stopCameraStream]);

  // Switch camera mode (front vs rear)
  const handleSelectFacingMode = (mode: 'user' | 'environment') => {
    if (mode === facingMode) return;
    setFacingMode(mode);
    facingModeRef.current = mode;
    previousIsReadyRef.current = false;
    stabilityTrackerRef.current.reset();
    startCamera(mode);
  };

  // Flip camera toggle
  const handleFlipCamera = () => {
    const nextMode = facingMode === 'user' ? 'environment' : 'user';
    handleSelectFacingMode(nextMode);
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

  const isRear = facingMode === 'environment';

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

        <div className="flex items-center gap-2">
          {/* Distance Calibration Tool Button */}
          <button
            type="button"
            onClick={() => setShowCalibration(true)}
            className="flex items-center gap-1.5 text-xs font-bold px-2.5 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 shadow-2xs transition cursor-pointer"
            id="btn-open-calibration-header"
            title="Fine-tune distance accuracy or calibrate 1.00m lock"
          >
            <Ruler className="w-3.5 h-3.5 text-orange-600" />
            <span className="hidden sm:inline">Calibrate</span>
          </button>

          {/* Debug Mode Toggle Button */}
          <button
            type="button"
            onClick={() => setShowDebug((prev) => !prev)}
            className={`flex items-center gap-1.5 text-xs font-bold px-2.5 py-1.5 rounded-xl border transition cursor-pointer ${
              showDebug
                ? 'bg-slate-900 text-emerald-400 border-slate-700 shadow-2xs'
                : 'bg-white text-slate-600 hover:text-slate-900 border-slate-200 shadow-2xs'
            }`}
            id="btn-toggle-distance-debug"
            title="Toggle Real-Time Camera & Landmark Diagnostics"
          >
            <Activity className="w-3.5 h-3.5 text-emerald-500" />
            <span className="hidden sm:inline">Debug</span>
          </button>

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
      </div>

      {/* Main Vision Stage & Camera Viewport */}
      <div className="bg-white rounded-3xl p-4 sm:p-6 border border-orange-100 shadow-sm space-y-4">
        {/* Screening Mode / Title */}
        <div className="text-center">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-orange-100 text-orange-800 text-[11px] font-black uppercase tracking-wider mb-2">
            <ShieldCheck className="w-3.5 h-3.5 text-orange-700" />
            <span>Clinical 1-Metre Distance Gate</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            {isRear ? 'Examiner Mode: Aim at Student at 1.0 Metre' : 'Position Yourself at 1.0 Metre'}
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 font-medium mt-1 max-w-md mx-auto">
            {isRear
              ? 'Hold device at student eye level. Point rear camera until student face aligns inside oval and 1.00 m turns green.'
              : 'Visual acuity screening requires an exact 1-metre distance. The test unlocks automatically once you are properly positioned.'}
          </p>
        </div>

        {/* Camera Lens Mode Selector: Front vs Rear View */}
        <div className="flex items-center justify-center gap-1.5 p-1 bg-slate-100/90 rounded-2xl border border-slate-200/90 max-w-md mx-auto">
          <button
            type="button"
            onClick={() => handleSelectFacingMode('user')}
            className={`flex-1 py-2 px-3 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition cursor-pointer ${
              !isRear
                ? 'bg-white text-slate-900 shadow-xs border border-slate-200 font-extrabold'
                : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
            }`}
            id="tab-camera-front"
            title="Front selfie camera for self-screening"
          >
            <UserCheck className="w-4 h-4 text-orange-600" />
            <span>Front (Self-Test)</span>
          </button>

          <button
            type="button"
            onClick={() => handleSelectFacingMode('environment')}
            className={`flex-1 py-2 px-3 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition cursor-pointer ${
              isRear
                ? 'bg-white text-teal-900 shadow-xs border border-teal-200 font-extrabold'
                : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
            }`}
            id="tab-camera-rear"
            title="Rear outward-facing camera for teachers and examiners"
          >
            <Camera className="w-4 h-4 text-teal-600" />
            <span>Rear (Examiner Mode)</span>
          </button>
        </div>

        {/* Camera Stage Container with Pure White Surround */}
        <div className="relative w-full aspect-[4/3] min-h-[320px] max-h-[400px] bg-white rounded-3xl overflow-hidden border-2 border-slate-200 shadow-xs flex items-center justify-center">
          {/* Virtual Try-on Face Positioning Guide: Houses the oval aperture container */}
          <FacePositionGuide
            validation={validation}
            videoWidth={videoDimensions.width}
            videoHeight={videoDimensions.height}
            facingMode={facingMode}
          >
            {/* Live Video Preview: Front camera is mirrored (-scale-x-100), Rear camera is un-mirrored (scale-x-100) */}
            <video
              ref={videoRef}
              playsInline
              muted
              autoPlay
              className={`w-full h-full object-cover transition-transform duration-300 ${
                isRear ? 'scale-x-100' : '-scale-x-100'
              }`}
              id="camera-stream-video"
            />
          </FacePositionGuide>

          {/* Camera Flip Quick Button */}
          {cameraState === 'streaming' && (
            <button
              type="button"
              onClick={handleFlipCamera}
              className="absolute top-3 right-3 z-30 px-2.5 py-1.5 rounded-xl bg-white/95 hover:bg-white text-slate-700 border border-slate-200 shadow-sm flex items-center gap-1.5 text-xs font-bold transition cursor-pointer active:scale-95"
              title={isRear ? 'Switch to Front Camera' : 'Switch to Rear Camera'}
              id="btn-flip-camera"
            >
              <SwitchCamera className="w-4 h-4 text-orange-600" />
              <span className="hidden sm:inline">{isRear ? 'Use Front' : 'Use Rear'}</span>
            </button>
          )}

          {/* Rear Camera Indicator Banner */}
          {isRear && cameraState === 'streaming' && (
            <div className="absolute top-3 left-3 z-30 flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-teal-500/90 text-white text-[10px] font-bold shadow-2xs backdrop-blur-xs">
              <Camera className="w-3 h-3" />
              <span>Rear Viewfinder Active</span>
            </div>
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
                onClick={() => startCamera(facingMode)}
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
          onOpenCalibration={() => setShowCalibration(true)}
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
              <span>
                {isRear ? 'START VISION TEST (STUDENT AT 1.00 m)' : 'START VISION TEST (1.00 m LOCKED)'}
              </span>
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
              <span>
                {isRear
                  ? 'START TEST (LOCKED — ALIGN STUDENT AT 1.00 m)'
                  : 'START TEST (LOCKED — ADJUST DISTANCE)'}
              </span>
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

      {/* Distance Calibration Modal */}
      <DistanceCalibrationModal
        isOpen={showCalibration}
        onClose={() => setShowCalibration(false)}
        validation={validation}
        calibration={calibration}
        onCalibrationChange={(updated) => {
          setCalibration(updated);
          calibrationRef.current = updated;
        }}
        facingMode={facingMode}
      />

      {/* Debug Overlay */}
      <DistanceDebugOverlay
        validation={validation}
        videoDimensions={videoDimensions}
        deviceProfile={deviceProfile}
        calibrationMultiplier={calibration.userFocalMultiplier}
        isOpen={showDebug}
        onClose={() => setShowDebug(false)}
      />
    </div>
  );
};
