/**
 * Browser-Compatible Computer Vision Engine for Face & Distance Detection
 * 
 * Supports:
 * 1. MediaPipe FaceLandmarker (High precision 478 3D landmarks + iris IPD)
 * 2. Hardware Native Shape Detection API (window.FaceDetector)
 * 3. Canvas optical silhouette analyzer (Zero-network fallback)
 * 
 * Privacy:
 * All video frames are processed purely client-side in browser memory.
 * No camera imagery or landmark telemetry is ever stored or transmitted.
 */

import { RawFaceMeasurement } from './distanceConfig';

export interface VisionEngineCallbacks {
  onMeasurement: (measurement: RawFaceMeasurement | null) => void;
  onError: (error: string) => void;
  onStatusChange: (status: 'loading' | 'active' | 'error') => void;
}

export class VisionEngine {
  private videoElement: HTMLVideoElement | null = null;
  private animFrameId: number | null = null;
  private faceLandmarker: any = null;
  private nativeFaceDetector: any = null;
  private isProcessing: boolean = false;
  private isDestroyed: boolean = false;
  private lastProcessedTime: number = 0;
  private fallbackCanvas: HTMLCanvasElement | null = null;
  private fallbackCtx: CanvasRenderingContext2D | null = null;
  private luminanceCanvas: HTMLCanvasElement | null = null;
  private luminanceCtx: CanvasRenderingContext2D | null = null;
  private lastLuminanceCheckTime: number = 0;
  private currentLuminance: number = 120;
  private isLowLight: boolean = false;

  constructor(private callbacks: VisionEngineCallbacks) {}

  /**
   * Initializes the vision engine with MediaPipe Face Landmarker or native fallbacks
   */
  public async initialize(): Promise<void> {
    this.callbacks.onStatusChange('loading');

    // 1. Check for native browser Shape Detection API first (super fast in Chromium)
    if (typeof window !== 'undefined' && 'FaceDetector' in window) {
      try {
        const FaceDetectorClass = (window as any).FaceDetector;
        this.nativeFaceDetector = new FaceDetectorClass({ maxDetectedFaces: 3, fastMode: true });
      } catch (e) {
        console.warn('Native FaceDetector initialization skipped:', e);
      }
    }

    // 2. Load MediaPipe Tasks Vision
    try {
      const vision = await import('@mediapipe/tasks-vision');
      const { FaceLandmarker, FilesetResolver } = vision;

      const filesetResolver = await FilesetResolver.forVisionTasks(
        'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm'
      );

      // Try GPU first for fast 60fps inference; fallback to CPU if WebGL fails
      try {
        this.faceLandmarker = await FaceLandmarker.createFromOptions(filesetResolver, {
          baseOptions: {
            modelAssetPath:
              'https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task',
            delegate: 'GPU',
          },
          outputFaceBlendshapes: false,
          runningMode: 'VIDEO',
          numFaces: 3,
        });
      } catch (gpuErr) {
        console.warn('MediaPipe GPU initialization failed, falling back to CPU delegate:', gpuErr);
        this.faceLandmarker = await FaceLandmarker.createFromOptions(filesetResolver, {
          baseOptions: {
            modelAssetPath:
              'https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task',
            delegate: 'CPU',
          },
          outputFaceBlendshapes: false,
          runningMode: 'VIDEO',
          numFaces: 3,
        });
      }
      this.callbacks.onStatusChange('active');
      return;
    } catch (err) {
      console.warn('MediaPipe CDN/WASM load failed, using native/canvas fallback:', err);
    }

    // Fallback: Check if native detector or canvas analyzer is available
    if (this.nativeFaceDetector) {
      this.callbacks.onStatusChange('active');
    } else {
      // Setup canvas fallback
      if (typeof document !== 'undefined') {
        this.fallbackCanvas = document.createElement('canvas');
        this.fallbackCanvas.width = 160;
        this.fallbackCanvas.height = 120;
        this.fallbackCtx = this.fallbackCanvas.getContext('2d', { willReadFrequently: true });
      }
      this.callbacks.onStatusChange('active');
    }
  }

  /**
   * Starts real-time video frame processing loop
   */
  public start(video: HTMLVideoElement): void {
    this.videoElement = video;
    this.isProcessing = true;
    this.isDestroyed = false;
    this.loop();
  }

  /**
   * Pauses / stops the processing loop
   */
  public stop(): void {
    this.isProcessing = false;
    this.isDestroyed = true;
    if (this.animFrameId !== null) {
      cancelAnimationFrame(this.animFrameId);
      this.animFrameId = null;
    }
    this.videoElement = null;
  }

  private loop = (): void => {
    if (!this.isProcessing || this.isDestroyed || !this.videoElement) return;

    // Rate-limit processing to ~18-22 FPS to prevent mobile CPU throttling and save battery
    const now = performance.now();
    if (now - this.lastProcessedTime >= 45 && this.videoElement.readyState >= 2) {
      this.lastProcessedTime = now;
      this.processCurrentFrame(now);
    }

    this.animFrameId = requestAnimationFrame(this.loop);
  };

  /**
   * Samples frame brightness to warn user if environment is too dark for optical screening
   */
  private checkFrameLuminance(now: number): { luminance: number; isLowLight: boolean } {
    if (now - this.lastLuminanceCheckTime < 500) {
      return { luminance: this.currentLuminance, isLowLight: this.isLowLight };
    }
    this.lastLuminanceCheckTime = now;

    if (!this.videoElement || this.videoElement.videoWidth === 0) {
      return { luminance: 120, isLowLight: false };
    }

    if (typeof document !== 'undefined' && !this.luminanceCanvas) {
      this.luminanceCanvas = document.createElement('canvas');
      this.luminanceCanvas.width = 32;
      this.luminanceCanvas.height = 24;
      this.luminanceCtx = this.luminanceCanvas.getContext('2d', { willReadFrequently: true });
    }

    if (!this.luminanceCtx || !this.luminanceCanvas) {
      return { luminance: 120, isLowLight: false };
    }

    try {
      this.luminanceCtx.drawImage(this.videoElement, 0, 0, 32, 24);
      const imgData = this.luminanceCtx.getImageData(0, 0, 32, 24);
      const data = imgData.data;
      let totalLum = 0;
      const count = 32 * 24;
      for (let i = 0; i < data.length; i += 4) {
        totalLum += 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
      }
      const avgLum = Math.round(totalLum / count);
      this.currentLuminance = avgLum;
      this.isLowLight = avgLum < 38;
      return { luminance: avgLum, isLowLight: this.isLowLight };
    } catch {
      return { luminance: 120, isLowLight: false };
    }
  }

  private async processCurrentFrame(timestampMs: number): Promise<void> {
    if (!this.videoElement) return;

    const { luminance, isLowLight } = this.checkFrameLuminance(timestampMs);

    try {
      // Strategy 1: MediaPipe Face Landmarker (most accurate)
      if (this.faceLandmarker) {
        const result = this.faceLandmarker.detectForVideo(this.videoElement, timestampMs);

        if (!result || !result.faceLandmarks || result.faceLandmarks.length === 0) {
          this.callbacks.onMeasurement({
            timestamp: Date.now(),
            faceCount: 0,
            confidence: 0,
            videoWidth: this.videoElement.videoWidth,
            videoHeight: this.videoElement.videoHeight,
            luminance,
            isLowLight,
          });
          return;
        }

        const faceCount = result.faceLandmarks.length;
        if (faceCount > 1) {
          this.callbacks.onMeasurement({
            timestamp: Date.now(),
            faceCount,
            confidence: 0.9,
            videoWidth: this.videoElement.videoWidth,
            videoHeight: this.videoElement.videoHeight,
            luminance,
            isLowLight,
          });
          return;
        }

        const landmarks = result.faceLandmarks[0];
        const measurement = this.extractMeasurementFromLandmarks(landmarks, luminance, isLowLight);
        this.callbacks.onMeasurement(measurement);
        return;
      }

      // Strategy 2: Browser Native Shape Detection FaceDetector
      if (this.nativeFaceDetector) {
        const faces = await this.nativeFaceDetector.detect(this.videoElement);
        if (!faces || faces.length === 0) {
          this.callbacks.onMeasurement({
            timestamp: Date.now(),
            faceCount: 0,
            confidence: 0,
            videoWidth: this.videoElement.videoWidth,
            videoHeight: this.videoElement.videoHeight,
            luminance,
            isLowLight,
          });
          return;
        }

        if (faces.length > 1) {
          this.callbacks.onMeasurement({
            timestamp: Date.now(),
            faceCount: faces.length,
            confidence: 0.85,
            videoWidth: this.videoElement.videoWidth,
            videoHeight: this.videoElement.videoHeight,
            luminance,
            isLowLight,
          });
          return;
        }

        const face = faces[0];
        const vW = this.videoElement.videoWidth || 640;
        const vH = this.videoElement.videoHeight || 480;
        const sensorDiagonal = Math.sqrt(vW * vW + vH * vH);
        const refEquivWidth = sensorDiagonal * (1280.0 / 1468.6);

        const boxNorm = {
          x: face.boundingBox.x / vW,
          y: face.boundingBox.y / vH,
          width: face.boundingBox.width / vW,
          height: face.boundingBox.height / vH,
        };

        const center = {
          x: boxNorm.x + boxNorm.width / 2,
          y: boxNorm.y + boxNorm.height / 2,
        };

        // Extract eye landmarks if detected natively
        let ipdNorm: number | undefined = undefined;
        let interEyeDistancePx: number | undefined = undefined;
        let leftEyePx: { x: number; y: number } | undefined = undefined;
        let rightEyePx: { x: number; y: number } | undefined = undefined;

        const leftEye = face.landmarks?.find((l: any) => l.type === 'eye' && l.location.x < center.x * vW);
        const rightEye = face.landmarks?.find((l: any) => l.type === 'eye' && l.location.x >= center.x * vW);

        if (leftEye && rightEye) {
          leftEyePx = { x: leftEye.location.x, y: leftEye.location.y };
          rightEyePx = { x: rightEye.location.x, y: rightEye.location.y };
          interEyeDistancePx = Math.hypot(rightEyePx.x - leftEyePx.x, rightEyePx.y - leftEyePx.y);
          ipdNorm = interEyeDistancePx / refEquivWidth;
        }

        const faceWidthPx = face.boundingBox.width;
        const faceHeightPx = face.boundingBox.height;

        this.callbacks.onMeasurement({
          timestamp: Date.now(),
          faceCount: 1,
          box: boxNorm,
          center,
          interEyeDistancePx,
          leftEyePx,
          rightEyePx,
          videoWidth: vW,
          videoHeight: vH,
          luminance,
          isLowLight,
          interpupillaryDistanceNorm: ipdNorm ?? (faceWidthPx * 0.44) / refEquivWidth,
          faceWidthNorm: (faceWidthPx * 0.9) / refEquivWidth,
          faceHeightNorm: faceHeightPx / refEquivWidth,
          headRollDeg: 0,
          headYawDeg: 0,
          confidence: 0.82,
        });
        return;
      }

      // Strategy 3: Canvas Luminance / Skin-Color Edge Silhouette Fallback
      if (this.fallbackCtx && this.fallbackCanvas) {
        const measurement = this.processFallbackCanvasFrame();
        measurement.luminance = luminance;
        measurement.isLowLight = isLowLight;
        measurement.videoWidth = this.videoElement.videoWidth;
        measurement.videoHeight = this.videoElement.videoHeight;
        this.callbacks.onMeasurement(measurement);
      }
    } catch (err) {
      console.warn('Frame processing error:', err);
    }
  }

  /**
   * Extracts geometric metrics from MediaPipe 478 3D landmarks
   * Uses sensor diagonal normalization for 100% orientation invariance between portrait & landscape
   */
  private extractMeasurementFromLandmarks(
    landmarks: Array<{ x: number; y: number; z?: number }>,
    luminance: number = 120,
    isLowLight: boolean = false
  ): RawFaceMeasurement {
    const vW = this.videoElement?.videoWidth || 640;
    const vH = this.videoElement?.videoHeight || 480;
    const aspectRatio = vW > 0 && vH > 0 ? vW / vH : 1.3333;

    // Sensor diagonal is rotation-invariant: sqrt(w^2 + h^2) is identical in portrait and landscape!
    // Scaling by 1280 / 1468.6 (~0.87158) maps diagonal directly to standard 16:9 1280px landscape width,
    // preserving complete compatibility with all standard distance calibration constants.
    const sensorDiagonal = Math.sqrt(vW * vW + vH * vH);
    const refEquivWidth = sensorDiagonal * (1280.0 / 1468.6);

    // Pupil / Iris Center Landmarks
    const leftEye = landmarks[468] || landmarks[33];
    const rightEye = landmarks[473] || landmarks[263];

    // Raw camera sensor pixel coordinates
    const leftEyePx = { x: leftEye.x * vW, y: leftEye.y * vH };
    const rightEyePx = { x: rightEye.x * vW, y: rightEye.y * vH };
    const interEyeDistancePx = Math.hypot(rightEyePx.x - leftEyePx.x, rightEyePx.y - leftEyePx.y);

    // Orientation-invariant IPD metric
    const ipdNorm = interEyeDistancePx / refEquivWidth;

    // High-Precision Horizontal Visible Iris Diameter (HVID ~11.7mm)
    let irisDiameterNorm: number | undefined = undefined;
    if (landmarks[468] && landmarks[469] && landmarks[471]) {
      const leftIrisPx = Math.hypot(
        (landmarks[469].x - landmarks[471].x) * vW,
        (landmarks[469].y - landmarks[471].y) * vH
      );

      let rightIrisPx: number | undefined;
      if (landmarks[473] && landmarks[474] && landmarks[476]) {
        rightIrisPx = Math.hypot(
          (landmarks[474].x - landmarks[476].x) * vW,
          (landmarks[474].y - landmarks[476].y) * vH
        );
      }

      const validPixelDiameters: number[] = [];
      // Expected iris pixel diameter at 0.5m - 2m is ~5px to ~60px
      if (leftIrisPx > 4 && leftIrisPx < 80) validPixelDiameters.push(leftIrisPx);
      if (rightIrisPx && rightIrisPx > 4 && rightIrisPx < 80) validPixelDiameters.push(rightIrisPx);

      if (validPixelDiameters.length > 0) {
        const avgIrisPx = validPixelDiameters.reduce((a, b) => a + b, 0) / validPixelDiameters.length;
        irisDiameterNorm = avgIrisPx / refEquivWidth;
      }
    }

    // Bi-ocular outer eye canthus to outer eye canthus (landmarks 33 to 263)
    const leftOuter = landmarks[33];
    const rightOuter = landmarks[263];
    let biocularWidthNorm: number | undefined = undefined;
    if (leftOuter && rightOuter) {
      const biocularPx = Math.hypot(
        (rightOuter.x - leftOuter.x) * vW,
        (rightOuter.y - leftOuter.y) * vH
      );
      biocularWidthNorm = biocularPx / refEquivWidth;
    }

    // Bizygomatic Face Width (landmarks 234 to 454)
    const leftCheek = landmarks[234] || landmarks[127];
    const rightCheek = landmarks[454] || landmarks[356];
    const faceWidthPx = Math.hypot(
      (rightCheek.x - leftCheek.x) * vW,
      (rightCheek.y - leftCheek.y) * vH
    );
    const faceWidthNorm = faceWidthPx / refEquivWidth;

    // Vertical Face Height (forehead 10 to chin 152)
    const forehead = landmarks[10];
    const chin = landmarks[152];
    const faceHeightPx = Math.hypot(
      (chin.x - forehead.x) * vW,
      (chin.y - forehead.y) * vH
    );
    const faceHeightNorm = faceHeightPx / refEquivWidth;

    const nose = landmarks[1];
    const center = {
      x: nose ? nose.x : (leftCheek.x + rightCheek.x) / 2,
      y: nose ? nose.y : (forehead.y + chin.y) / 2,
    };

    // Head Roll angle in degrees
    const rollRad = Math.atan2((rightEye.y - leftEye.y) * vH, (rightEye.x - leftEye.x) * vW);
    const headRollDeg = (rollRad * 180) / Math.PI;

    // Head Yaw (horizontal turn left or right)
    const distToLeft = Math.abs(nose.x - leftCheek.x) * vW;
    const distToRight = Math.abs(rightCheek.x - nose.x) * vW;
    const totalCheekDist = distToLeft + distToRight || 0.001;
    const yawAsymmetry = (distToRight - distToLeft) / totalCheekDist;
    let headYawDeg = Math.max(-65, Math.min(65, yawAsymmetry * 65));
    const dz = (rightEye.z ?? 0) - (leftEye.z ?? 0);
    if (Math.abs(dz) > 0.003 && ipdNorm > 0.02) {
      const zYawDeg = Math.asin(Math.max(-0.9, Math.min(0.9, dz / ipdNorm))) * (180 / Math.PI);
      headYawDeg = zYawDeg * 0.5 + headYawDeg * 0.5;
    }

    // Head Pitch (looking up/down)
    const eyeMidY = (leftEye.y + rightEye.y) / 2;
    const upperFaceY = Math.abs(nose.y - eyeMidY) * vH;
    const lowerFaceY = Math.abs(chin.y - nose.y) * vH;
    const pitchRatio = (lowerFaceY - upperFaceY) / (lowerFaceY + upperFaceY || 0.001);
    let headPitchDeg = Math.max(-45, Math.min(45, (pitchRatio - 0.28) * 65));
    if (landmarks[10]?.z !== undefined && landmarks[152]?.z !== undefined) {
      const dzPitch = (landmarks[10].z ?? 0) - (landmarks[152].z ?? 0);
      const zPitchDeg = Math.max(-45, Math.min(45, dzPitch * 120));
      headPitchDeg = headPitchDeg * 0.5 + zPitchDeg * 0.5;
    }

    // Normalized Bounding Box in camera coordinates [0..1]
    let minX = 1, minY = 1, maxX = 0, maxY = 0;
    for (let i = 0; i < landmarks.length; i += 8) {
      const p = landmarks[i];
      if (p.x < minX) minX = p.x;
      if (p.x > maxX) maxX = p.x;
      if (p.y < minY) minY = p.y;
      if (p.y > maxY) maxY = p.y;
    }

    return {
      timestamp: Date.now(),
      faceCount: 1,
      box: {
        x: Math.max(0, minX),
        y: Math.max(0, minY),
        width: Math.min(1, maxX - minX),
        height: Math.min(1, maxY - minY),
      },
      center,
      interEyeDistancePx,
      leftEyePx,
      rightEyePx,
      videoWidth: vW,
      videoHeight: vH,
      luminance,
      isLowLight,
      irisDiameterNorm,
      interpupillaryDistanceNorm: ipdNorm,
      biocularWidthNorm,
      faceWidthNorm,
      faceHeightNorm,
      aspectRatio,
      headRollDeg,
      headYawDeg,
      headPitchDeg,
      trackingMethod: irisDiameterNorm ? 'mediapipe_iris_478' : 'mediapipe_face',
      confidence: 0.98,
    };
  }

  /**
   * Lightweight Canvas Skin-Tone & Oval silhouette detector for environments where WASM is blocked
   */
  private processFallbackCanvasFrame(): RawFaceMeasurement {
    if (!this.fallbackCtx || !this.fallbackCanvas || !this.videoElement) {
      return { timestamp: Date.now(), faceCount: 0, confidence: 0 };
    }

    const vW = this.videoElement.videoWidth || 640;
    const vH = this.videoElement.videoHeight || 480;

    // Adapt fallback canvas to match camera aspect ratio (prevents squishing in portrait)
    const isPortrait = vH > vW;
    const targetW = isPortrait ? 120 : 160;
    const targetH = isPortrait ? 160 : 120;
    if (this.fallbackCanvas.width !== targetW || this.fallbackCanvas.height !== targetH) {
      this.fallbackCanvas.width = targetW;
      this.fallbackCanvas.height = targetH;
    }

    const cW = this.fallbackCanvas.width;
    const cH = this.fallbackCanvas.height;
    this.fallbackCtx.drawImage(this.videoElement, 0, 0, cW, cH);
    const imgData = this.fallbackCtx.getImageData(0, 0, cW, cH);
    const data = imgData.data;

    let skinPixelCount = 0;
    let sumX = 0;
    let sumY = 0;
    let minX = cW;
    let maxX = 0;
    let minY = cH;
    let maxY = 0;

    for (let y = 0; y < cH; y += 2) {
      for (let x = 0; x < cW; x += 2) {
        const idx = (y * cW + x) * 4;
        const r = data[idx];
        const g = data[idx + 1];
        const b = data[idx + 2];

        // Standard normalized RGB/YCbCr skin-tone filter
        if (r > 60 && g > 40 && b > 20 && r > g && r > b && (r - Math.min(g, b)) > 15) {
          skinPixelCount++;
          sumX += x;
          sumY += y;
          if (x < minX) minX = x;
          if (x > maxX) maxX = x;
          if (y < minY) minY = y;
          if (y > maxY) maxY = y;
        }
      }
    }

    const totalSampled = (cW * cH) / 4;
    const skinRatio = skinPixelCount / totalSampled;

    // A human face at ~1m typically occupies 6% to 22% of total frame pixels
    if (skinRatio < 0.03 || skinPixelCount < 50) {
      return { timestamp: Date.now(), faceCount: 0, confidence: 0 };
    }

    const avgX = (sumX / skinPixelCount) / cW;
    const avgY = (sumY / skinPixelCount) / cH;
    const canvasDiagonal = Math.sqrt(cW * cW + cH * cH);
    const refEquivWidth = canvasDiagonal * 0.87158;

    const widthNorm = Math.min(0.65, Math.max(0.06, (maxX - minX) / cW));
    const heightNorm = Math.min(0.85, Math.max(0.08, (maxY - minY) / cH));

    // Optical face measurements normalized to refEquivWidth
    const faceWidthNorm = (maxX - minX) / refEquivWidth;
    const faceHeightNorm = (maxY - minY) / refEquivWidth;
    const ipdNorm = faceWidthNorm * 0.46;

    // Normal frontal human face has an aspect ratio of ~1.32 (height / width)
    const expectedFrontalWidth = heightNorm * 0.76;
    const widthRatio = Math.min(1.0, Math.max(0.40, widthNorm / (expectedFrontalWidth || 0.1)));
    const estimatedYawRad = Math.acos(widthRatio);
    const boxCenterX = (minX + maxX) / (2 * cW);
    const yawSign = avgX < boxCenterX ? -1 : 1;
    const headYawDeg = Math.round((estimatedYawRad * 180 / Math.PI) * yawSign);

    return {
      timestamp: Date.now(),
      faceCount: 1,
      box: {
        x: Math.max(0, minX / cW),
        y: Math.max(0, minY / cH),
        width: widthNorm,
        height: heightNorm,
      },
      center: { x: avgX, y: avgY },
      interpupillaryDistanceNorm: ipdNorm,
      faceWidthNorm,
      faceHeightNorm,
      headRollDeg: 0,
      headYawDeg,
      confidence: Math.min(0.80, 0.5 + skinRatio),
    };
  }

  /**
   * Release resources
   */
  public destroy(): void {
    this.stop();
    if (this.faceLandmarker) {
      try {
        this.faceLandmarker.close?.();
      } catch {
        // ignore
      }
      this.faceLandmarker = null;
    }
    this.nativeFaceDetector = null;
    this.fallbackCanvas = null;
    this.fallbackCtx = null;
    this.luminanceCanvas = null;
    this.luminanceCtx = null;
  }
}
