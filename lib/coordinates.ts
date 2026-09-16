/**
 * Coordinate Transformation & Spatial Alignment Engine
 * 
 * Separates and maps between the 3 distinct coordinate systems:
 * A. Camera Frame Coordinates (native sensor pixels [0..videoWidth, 0..videoHeight])
 * B. Displayed Video Coordinates (CSS pixels within rendered viewport with object-fit)
 * C. UI Face-Guide Coordinates (oval target aperture centered in screen space)
 * 
 * Eliminates the desktop vs mobile discrepancy where camera pixel != CSS pixel,
 * especially in portrait/landscape mobile orientations.
 */

export interface Point2D {
  x: number;
  y: number;
}

export interface Dimensions2D {
  width: number;
  height: number;
}

export interface VideoViewportTransform {
  scale: number;
  renderedWidth: number;
  renderedHeight: number;
  offsetX: number;
  offsetY: number;
  isMirrored: boolean;
  container: Dimensions2D;
  video: Dimensions2D;
}

/**
 * Calculates the transformation matrix parameters between native camera sensor pixels
 * and the CSS displayed container using object-fit: cover or contain.
 */
export function getViewportTransform(
  videoDims: Dimensions2D,
  containerDims: Dimensions2D,
  isMirrored: boolean = false,
  fit: 'cover' | 'contain' = 'cover'
): VideoViewportTransform {
  const vW = Math.max(1, videoDims.width);
  const vH = Math.max(1, videoDims.height);
  const cW = Math.max(1, containerDims.width);
  const cH = Math.max(1, containerDims.height);

  const scale = fit === 'cover'
    ? Math.max(cW / vW, cH / vH)
    : Math.min(cW / vW, cH / vH);

  const renderedWidth = vW * scale;
  const renderedHeight = vH * scale;

  const offsetX = (cW - renderedWidth) / 2;
  const offsetY = (cH - renderedHeight) / 2;

  return {
    scale,
    renderedWidth,
    renderedHeight,
    offsetX,
    offsetY,
    isMirrored,
    container: { width: cW, height: cH },
    video: { width: vW, height: vH },
  };
}

/**
 * Converts a point from normalized camera coordinates [0..1, 0..1]
 * to displayed CSS container coordinates [0..cW, 0..cH].
 */
export function cameraNormToDisplayPoint(
  normPoint: Point2D,
  transform: VideoViewportTransform
): Point2D {
  const camPxX = normPoint.x * transform.video.width;
  const camPxY = normPoint.y * transform.video.height;

  // Unmirrored coordinate in container space
  const unmirroredX = camPxX * transform.scale + transform.offsetX;
  const dispY = camPxY * transform.scale + transform.offsetY;

  // If front selfie camera, mirror horizontally across container center
  const dispX = transform.isMirrored
    ? transform.container.width - unmirroredX
    : unmirroredX;

  return { x: dispX, y: dispY };
}

/**
 * Converts camera sensor pixels to displayed CSS container coordinates.
 */
export function cameraPxToDisplayPoint(
  camPx: Point2D,
  transform: VideoViewportTransform
): Point2D {
  const unmirroredX = camPx.x * transform.scale + transform.offsetX;
  const dispY = camPx.y * transform.scale + transform.offsetY;

  const dispX = transform.isMirrored
    ? transform.container.width - unmirroredX
    : unmirroredX;

  return { x: dispX, y: dispY };
}

/**
 * Checks if a displayed point is centered within the target face guide oval.
 * Returns normalized offset [-1..1] along X and Y, and total radial deviation.
 */
export function evaluateOvalCentering(
  displayPoint: Point2D,
  ovalCenter: Point2D,
  radiusX: number,
  radiusY: number,
  tolerance: number = 0.38
): {
  isCentered: boolean;
  radialError: number;
  xOffsetRatio: number;
  yOffsetRatio: number;
  direction: 'center' | 'left' | 'right' | 'up' | 'down';
} {
  const rX = Math.max(1, radiusX);
  const rY = Math.max(1, radiusY);

  const dx = (displayPoint.x - ovalCenter.x) / rX;
  const dy = (displayPoint.y - ovalCenter.y) / rY;

  const radialError = Math.sqrt(dx * dx + dy * dy);
  const isCentered = radialError <= tolerance;

  let direction: 'center' | 'left' | 'right' | 'up' | 'down' = 'center';
  if (!isCentered) {
    if (Math.abs(dx) > Math.abs(dy)) {
      // User perspective: If displayed point is to the left of the center, user should move right to center it
      direction = dx < 0 ? 'right' : 'left';
    } else {
      direction = dy < 0 ? 'down' : 'up';
    }
  }

  return {
    isCentered,
    radialError,
    xOffsetRatio: dx,
    yOffsetRatio: dy,
    direction,
  };
}
