import { FaceBox } from '../../server/geminiService';
import { loadImage } from './hairCanvas';

export interface PortraitCropOptions {
  faceBox?: FaceBox;
  zoom?: number;       // 1.0 to 2.5
  offsetY?: number;    // -0.3 to 0.3
  offsetX?: number;    // -0.3 to 0.3
}

/**
 * Automatically crops any photo (landscape, full-body, or cafe scene)
 * into a close-up portrait centered around the detected face.
 */
export async function autoCropToPortrait(
  imageSrc: string,
  options: PortraitCropOptions = {}
): Promise<{ portraitUrl: string; computedBox: FaceBox }> {
  const img = await loadImage(imageSrc);
  const origW = img.naturalWidth || img.width;
  const origH = img.naturalHeight || img.height;

  // 1. Determine Face Bounding Box
  let box = options.faceBox;

  // Fallback: If no faceBox was provided, find face center using skin tone & brightness heuristics
  if (!box || !box.widthPercent) {
    box = estimateFaceBox(img, origW, origH);
  }

  // Convert percentages to pixel values
  const faceX = (box.leftPercent / 100) * origW;
  const faceY = (box.topPercent / 100) * origH;
  const faceW = (box.widthPercent / 100) * origW;
  const faceH = (box.heightPercent / 100) * origH;

  const faceCenterX = faceX + faceW * 0.5;
  const faceCenterY = faceY + faceH * 0.5;

  // 2. Calculate Portrait Framing Box (Aspect ratio 3:4)
  // We want the face height to take up approximately 40% - 48% of the portrait height
  const zoom = options.zoom || 1.0;
  const targetPortraitH = Math.min(origH, Math.max(faceH * 2.5 / zoom, origW * 0.45));
  const targetPortraitW = (targetPortraitH * 3) / 4;

  // Center on face with ergonomic head placement:
  // Face center in a standard portrait should be around 42% from the top
  const shiftX = (options.offsetX || 0) * targetPortraitW;
  const shiftY = (options.offsetY || 0) * targetPortraitH;

  let cropX = faceCenterX - targetPortraitW * 0.5 + shiftX;
  let cropY = faceCenterY - targetPortraitH * 0.42 + shiftY;

  // Clamp within image bounds
  if (cropX < 0) cropX = 0;
  if (cropY < 0) cropY = 0;
  if (cropX + targetPortraitW > origW) cropX = Math.max(0, origW - targetPortraitW);
  if (cropY + targetPortraitH > origH) cropY = Math.max(0, origH - targetPortraitH);

  // 3. Draw onto high-resolution portrait canvas
  const canvas = document.createElement('canvas');
  // High quality output size (min 900x1200 or native crop size)
  const outW = Math.max(900, Math.round(targetPortraitW));
  const outH = Math.round((outW * 4) / 3);
  canvas.width = outW;
  canvas.height = outH;

  const ctx = canvas.getContext('2d');
  if (!ctx) {
    return { portraitUrl: imageSrc, computedBox: box };
  }

  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';

  ctx.drawImage(
    img,
    cropX,
    cropY,
    targetPortraitW,
    targetPortraitH,
    0,
    0,
    outW,
    outH
  );

  // Recalculate face box coordinates relative to the cropped portrait canvas
  const newFaceX = faceX - cropX;
  const newFaceY = faceY - cropY;
  const newComputedBox: FaceBox = {
    leftPercent: Math.max(0, Math.min(100, (newFaceX / targetPortraitW) * 100)),
    topPercent: Math.max(0, Math.min(100, (newFaceY / targetPortraitH) * 100)),
    widthPercent: Math.max(15, Math.min(90, (faceW / targetPortraitW) * 100)),
    heightPercent: Math.max(20, Math.min(90, (faceH / targetPortraitH) * 100)),
  };

  const portraitUrl = canvas.toDataURL('image/jpeg', 0.95);
  return { portraitUrl, computedBox: newComputedBox };
}

/**
 * Fast client-side skin-tone & contrast heuristic to estimate face center and size
 * when image is freshly uploaded before API responds.
 */
function estimateFaceBox(img: HTMLImageElement, w: number, h: number): FaceBox {
  const canvas = document.createElement('canvas');
  const smallW = 120;
  const smallH = Math.round((h / w) * 120);
  canvas.width = smallW;
  canvas.height = smallH;
  const ctx = canvas.getContext('2d');

  if (!ctx) {
    // Default center upper-third
    return { topPercent: 18, leftPercent: 32, widthPercent: 36, heightPercent: 44 };
  }

  ctx.drawImage(img, 0, 0, smallW, smallH);
  const data = ctx.getImageData(0, 0, smallW, smallH).data;

  let skinPixelsCount = 0;
  let sumX = 0;
  let sumY = 0;

  // Check skin tone colors in typical portrait ranges
  for (let y = Math.round(smallH * 0.1); y < Math.round(smallH * 0.75); y++) {
    for (let x = Math.round(smallW * 0.15); x < Math.round(smallW * 0.85); x++) {
      const idx = (y * smallW + x) * 4;
      const r = data[idx];
      const g = data[idx + 1];
      const b = data[idx + 2];

      // Normalized skin chromaticity heuristic
      if (r > 60 && g > 40 && b > 20 && r > g && r > b && (r - g) > 12) {
        skinPixelsCount++;
        sumX += x;
        sumY += y;
      }
    }
  }

  if (skinPixelsCount > 80) {
    const avgX = (sumX / skinPixelsCount) / smallW;
    const avgY = (sumY / skinPixelsCount) / smallH;

    // Estimate box around detected center
    const estimatedW = Math.min(0.42, Math.max(0.24, Math.sqrt(skinPixelsCount / (smallW * smallH)) * 1.2));
    const estimatedH = estimatedW * 1.35;

    return {
      topPercent: Math.max(8, Math.round((avgY - estimatedH * 0.45) * 100)),
      leftPercent: Math.max(8, Math.round((avgX - estimatedW * 0.5) * 100)),
      widthPercent: Math.round(estimatedW * 100),
      heightPercent: Math.round(estimatedH * 100),
    };
  }

  // Fallback upper center
  return { topPercent: 18, leftPercent: 32, widthPercent: 36, heightPercent: 44 };
}
