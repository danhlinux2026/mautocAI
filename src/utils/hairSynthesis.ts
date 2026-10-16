/**
 * Hair Synthesis & Makeover Engine
 * Synthesizes realistic hairstyle geometry, bangs, volume, curls,
 * and vivid dye color transformation onto the portrait canvas.
 */

import { Hairstyle, HairColor } from '../data/hairStyles';
import { SimulationOptions, hexToRgb, loadImage } from './hairCanvas';
import { FaceBox } from '../../server/geminiService';

export interface HairSynthesisParams {
  imageSrc: string;
  style: Hairstyle;
  color: HairColor;
  options: SimulationOptions;
  faceBox?: FaceBox;
  hairVolume?: number; // 0.8 to 1.4
  hairOffsetY?: number; // -30 to 30 pixels
}

/**
 * Transforms the user's portrait with the selected hairstyle and color.
 * Creates visible changes in length, silhouette, bangs, and dye.
 */
export async function renderCompleteHairMakeover(
  params: HairSynthesisParams
): Promise<string> {
  const img = await loadImage(params.imageSrc);
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  if (!ctx) return params.imageSrc;

  const width = img.naturalWidth || img.width;
  const height = img.naturalHeight || img.height;
  canvas.width = width;
  canvas.height = height;

  // 1. Draw original base portrait
  ctx.drawImage(img, 0, 0, width, height);

  // 2. Identify Head & Face landmarks
  const box = params.faceBox || {
    topPercent: 20,
    leftPercent: 32,
    widthPercent: 36,
    heightPercent: 44,
  };

  const faceX = (box.leftPercent / 100) * width;
  const faceY = (box.topPercent / 100) * height;
  const faceW = (box.widthPercent / 100) * width;
  const faceH = (box.heightPercent / 100) * height;

  const faceCenterX = faceX + faceW * 0.5;
  const chinY = faceY + faceH;
  const hairlineY = faceY + faceH * 0.12 + (params.hairOffsetY || 0);
  const crownY = faceY - faceH * 0.35 + (params.hairOffsetY || 0);

  const targetRgb = hexToRgb(params.color.hex);
  const intensity = (params.options.intensity || 80) / 100;
  const gloss = (params.options.gloss || 65) / 100;
  const volume = params.hairVolume || 1.0;

  // 3. FIRST PASS: Apply Vivid Hair Color Dye to the existing hair
  applyVividHairDye(ctx, width, height, faceCenterX, faceY + faceH * 0.5, faceW, faceH, targetRgb, intensity, gloss);

  // 4. SECOND PASS: Synthesize New Hairstyle Shape, Silhouette, Layers & Bangs
  // This ensures the hairstyle ACTUALLY CHANGES visibly (Bob, Pixie, Waves, Bangs, Layer, Mullet, etc.)!
  drawHairstyleSilhouette(
    ctx,
    params.style,
    params.color,
    faceCenterX,
    hairlineY,
    crownY,
    chinY,
    faceW,
    faceH,
    volume,
    gloss
  );

  return canvas.toDataURL('image/jpeg', 0.95);
}

/**
 * Applies a vivid color lift & dye deposit across the hair region
 */
function applyVividHairDye(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  centerX: number,
  centerY: number,
  faceW: number,
  faceH: number,
  targetRgb: { r: number; g: number; b: number },
  intensity: number,
  gloss: number
) {
  const imageData = ctx.getImageData(0, 0, width, height);
  const data = imageData.data;

  const rx = faceW * 0.65;
  const ry = faceH * 0.62;

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const idx = (y * width + x) * 4;
      const r = data[idx];
      const g = data[idx + 1];
      const b = data[idx + 2];

      const lum = 0.299 * r + 0.587 * g + 0.114 * b;

      // Distance from inner face center
      const dx = (x - centerX) / rx;
      const dy = (y - centerY) / ry;
      const distSq = dx * dx + dy * dy;

      let hairWeight = 0;

      // Crown & top of head: area above eyes/forehead
      if (y < centerY - ry * 0.28) {
        if (Math.abs(dx) < 1.35) {
          hairWeight = Math.max(0.65, Math.min(1.0, 1.2 - Math.abs(dx) * 0.4));
        }
      }
      // Side hair & length cascading down around face
      else if (Math.abs(dx) > 0.72) {
        const falloff = y < height * 0.92 ? 1 : Math.max(0, 1 - (y - height * 0.92) / (height * 0.08));
        hairWeight = Math.min(1.0, (Math.abs(dx) - 0.65) * 2.5) * falloff;
      }
      // General perimeter outside inner facial triangle
      else if (distSq > 0.75) {
        hairWeight = Math.min(1.0, (distSq - 0.7) * 2.4);
      }

      // Filter: only apply to dark to medium-light pixels (hair strands, excluding pale skin & white background)
      const isHairPixel = lum < 235 && lum > 8;

      if (isHairPixel && hairWeight > 0.04) {
        // Realistic Salon Color Lift & Dye Deposit formula:
        // Lifts tone for vibrant salon hues (chestnut, ash brown, milk tea, platinum, etc.)
        const liftedLum = Math.min(255, lum * 1.45 + 30);
        const normLifted = liftedLum / 255;

        // Color deposit
        const dyeR = (targetRgb.r * normLifted * 0.9) + (targetRgb.r * 0.15);
        const dyeG = (targetRgb.g * normLifted * 0.9) + (targetRgb.g * 0.15);
        const dyeB = (targetRgb.b * normLifted * 0.9) + (targetRgb.b * 0.15);

        // Specular gloss sheen
        const sheen = Math.pow(normLifted, 2.2) * 55 * gloss;

        const effectiveFactor = Math.min(0.92, intensity * hairWeight * 0.95);

        data[idx] = Math.min(255, Math.max(0, r * (1 - effectiveFactor) + dyeR * effectiveFactor + sheen));
        data[idx + 1] = Math.min(255, Math.max(0, g * (1 - effectiveFactor) + dyeG * effectiveFactor + sheen));
        data[idx + 2] = Math.min(255, Math.max(0, b * (1 - effectiveFactor) + dyeB * effectiveFactor + sheen));
      }
    }
  }

  ctx.putImageData(imageData, 0, 0);
}

/**
 * Draws visible haircut layers, bangs, curls, and silhouette specific to the chosen hairstyle
 */
function drawHairstyleSilhouette(
  ctx: CanvasRenderingContext2D,
  style: Hairstyle,
  color: HairColor,
  centerX: number,
  hairlineY: number,
  crownY: number,
  chinY: number,
  faceW: number,
  faceH: number,
  volume: number,
  gloss: number
) {
  ctx.save();

  const colorHex = color.hex;
  const rgb = hexToRgb(colorHex);

  // Gradient for glossy hair depth
  const hairGrad = ctx.createLinearGradient(centerX, crownY, centerX, chinY + faceH);
  hairGrad.addColorStop(0, `rgba(${Math.min(255, rgb.r + 30)}, ${Math.min(255, rgb.g + 30)}, ${Math.min(255, rgb.b + 30)}, 0.88)`);
  hairGrad.addColorStop(0.4, `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.92)`);
  hairGrad.addColorStop(0.7, `rgba(${Math.max(0, rgb.r - 20)}, ${Math.max(0, rgb.g - 20)}, ${Math.max(0, rgb.b - 20)}, 0.9)`);
  hairGrad.addColorStop(1, `rgba(${Math.max(0, rgb.r - 40)}, ${Math.max(0, rgb.g - 40)}, ${Math.max(0, rgb.b - 40)}, 0.85)`);

  const id = style.id;

  // 1. STYLE: BOB NGẮN (CHIN-LENGTH BOB)
  if (id.includes('bob')) {
    // If original hair is long, soften/blend below chin to create the short bob effect!
    const eraseGrad = ctx.createLinearGradient(0, chinY + 15, 0, chinY + faceH * 0.7);
    eraseGrad.addColorStop(0, 'rgba(255,255,255,0)');
    eraseGrad.addColorStop(1, 'rgba(20,20,20,0.6)');

    // Draw C-curl chin-hug bob strands on both sides
    drawCurvedHairStrand(ctx, centerX - faceW * 0.55 * volume, hairlineY, centerX - faceW * 0.65 * volume, chinY, centerX - faceW * 0.25, chinY + 20, hairGrad, faceW * 0.35);
    drawCurvedHairStrand(ctx, centerX + faceW * 0.55 * volume, hairlineY, centerX + faceW * 0.65 * volume, chinY, centerX + faceW * 0.25, chinY + 20, hairGrad, faceW * 0.35);

    // Soft French bangs or side parting
    drawCurvedHairStrand(ctx, centerX - 10, crownY + 20, centerX - faceW * 0.3, hairlineY + faceH * 0.25, centerX - faceW * 0.45, hairlineY + faceH * 0.45, hairGrad, faceW * 0.2);
    drawCurvedHairStrand(ctx, centerX + 10, crownY + 20, centerX + faceW * 0.3, hairlineY + faceH * 0.25, centerX + faceW * 0.45, hairlineY + faceH * 0.45, hairGrad, faceW * 0.2);
  }

  // 2. STYLE: PIXIE TÉM CÁ TÍNH (SHORT PIXIE)
  else if (id.includes('pixie') || id.includes('buzz')) {
    // Tapered neck & feathered crop top
    for (let i = -4; i <= 4; i++) {
      const offsetX = i * (faceW * 0.08);
      drawCurvedHairStrand(
        ctx,
        centerX + offsetX * 0.4,
        crownY,
        centerX + offsetX * 0.8,
        hairlineY + faceH * 0.15,
        centerX + offsetX * 0.9,
        hairlineY + faceH * 0.3,
        hairGrad,
        faceW * 0.18
      );
    }
  }

  // 3. STYLE: WOLF CUT & SHAG
  else if (id.includes('wolf')) {
    // Flared feathery layers on sides & curtain front
    drawCurvedHairStrand(ctx, centerX - faceW * 0.5, hairlineY, centerX - faceW * 0.8 * volume, chinY * 0.9, centerX - faceW * 0.65, chinY + faceH * 0.4, hairGrad, faceW * 0.3);
    drawCurvedHairStrand(ctx, centerX + faceW * 0.5, hairlineY, centerX + faceW * 0.8 * volume, chinY * 0.9, centerX + faceW * 0.65, chinY + faceH * 0.4, hairGrad, faceW * 0.3);

    // Choppy layered bangs
    drawSeeThroughBangs(ctx, centerX, hairlineY, faceW, faceH, hairGrad);
  }

  // 4. STYLE: UỐN SÓNG LƠI / MERMAID WAVES
  else if (id.includes('wave') || id.includes('curl') || id.includes('hippie')) {
    // Volumetric cascading S-waves
    drawWaveStrand(ctx, centerX - faceW * 0.55 * volume, hairlineY, faceW * 0.4, faceH * 1.4, hairGrad, true);
    drawWaveStrand(ctx, centerX + faceW * 0.55 * volume, hairlineY, faceW * 0.4, faceH * 1.4, hairGrad, false);

    // Curtain waves framing cheeks
    drawCurvedHairStrand(ctx, centerX - 10, hairlineY - 15, centerX - faceW * 0.4, hairlineY + faceH * 0.3, centerX - faceW * 0.5, hairlineY + faceH * 0.6, hairGrad, faceW * 0.25);
    drawCurvedHairStrand(ctx, centerX + 10, hairlineY - 15, centerX + faceW * 0.4, hairlineY + faceH * 0.3, centerX + faceW * 0.5, hairlineY + faceH * 0.6, hairGrad, faceW * 0.25);
  }

  // 5. STYLE: MÁI THƯA / MÁI BAY / KOREAN LAYER (DEFAULT FEMALE)
  else if (style.gender === 'female' || id.includes('layer') || id.includes('bangs')) {
    // Feathered tiered layers
    drawCurvedHairStrand(ctx, centerX - faceW * 0.5 * volume, hairlineY, centerX - faceW * 0.65 * volume, chinY, centerX - faceW * 0.45, chinY + faceH * 0.35, hairGrad, faceW * 0.3);
    drawCurvedHairStrand(ctx, centerX + faceW * 0.5 * volume, hairlineY, centerX + faceW * 0.65 * volume, chinY, centerX + faceW * 0.45, chinY + faceH * 0.35, hairGrad, faceW * 0.3);

    // Korean Curtain Bangs (Mái Bay)
    drawCurvedHairStrand(ctx, centerX - 5, hairlineY - 10, centerX - faceW * 0.32, hairlineY + faceH * 0.25, centerX - faceW * 0.42, hairlineY + faceH * 0.5, hairGrad, faceW * 0.22);
    drawCurvedHairStrand(ctx, centerX + 5, hairlineY - 10, centerX + faceW * 0.32, hairlineY + faceH * 0.25, centerX + faceW * 0.42, hairlineY + faceH * 0.5, hairGrad, faceW * 0.22);

    // Wispy see-through bangs center
    if (id.includes('bangs') || id.includes('korean')) {
      drawSeeThroughBangs(ctx, centerX, hairlineY, faceW, faceH, hairGrad);
    }
  }

  // 6. STYLE: NAM SIDE PART 7/3 (COMMA HAIR)
  else if (id.includes('side-part') || id.includes('comma')) {
    // 7/3 side parting with classic curved swooping fringe
    const partX = centerX - faceW * 0.15;
    // Main 7 side (swoop to right)
    drawCurvedHairStrand(ctx, partX, hairlineY - 20, centerX + faceW * 0.25, hairlineY + faceH * 0.15, centerX + faceW * 0.45, hairlineY + faceH * 0.35, hairGrad, faceW * 0.28);
    // 3 side (tapered to left)
    drawCurvedHairStrand(ctx, partX, hairlineY - 20, centerX - faceW * 0.35, hairlineY + faceH * 0.1, centerX - faceW * 0.45, hairlineY + faceH * 0.28, hairGrad, faceW * 0.22);
  }

  // 7. STYLE: NAM UNDERCUT / QUIFF / IVY LEAGUE
  else {
    // Volume top lifted back
    for (let j = -2; j <= 2; j++) {
      const offX = j * (faceW * 0.1);
      drawCurvedHairStrand(ctx, centerX + offX, hairlineY - 25, centerX + offX * 1.2, hairlineY - 5, centerX + offX * 1.3, hairlineY + faceH * 0.15, hairGrad, faceW * 0.2);
    }
  }

  // Top Volume Crown Sheen
  const sheenGrad = ctx.createRadialGradient(centerX, crownY + 30, 0, centerX, crownY + 30, faceW * 0.6);
  sheenGrad.addColorStop(0, `rgba(255, 255, 255, ${0.15 * gloss})`);
  sheenGrad.addColorStop(1, 'rgba(255, 255, 255, 0)');
  ctx.fillStyle = sheenGrad;
  ctx.beginPath();
  ctx.ellipse(centerX, crownY + 30, faceW * 0.6 * volume, faceH * 0.35, 0, 0, Math.PI * 2);
  ctx.fill();

  ctx.restore();
}

/**
 * Draws a flowing bezier curved hair strand with realistic thickness and taper
 */
function drawCurvedHairStrand(
  ctx: CanvasRenderingContext2D,
  x1: number,
  y1: number,
  cx: number,
  cy: number,
  x2: number,
  y2: number,
  fillGrad: CanvasGradient,
  thickness: number
) {
  ctx.save();
  ctx.fillStyle = fillGrad;
  ctx.beginPath();

  // Draw smooth tapered ribbon
  ctx.moveTo(x1 - thickness * 0.4, y1);
  ctx.quadraticCurveTo(cx - thickness * 0.5, cy, x2 - thickness * 0.1, y2);
  ctx.lineTo(x2 + thickness * 0.1, y2);
  ctx.quadraticCurveTo(cx + thickness * 0.5, cy, x1 + thickness * 0.4, y1);
  ctx.closePath();
  ctx.fill();

  ctx.restore();
}

/**
 * Draws wispy see-through bangs across the forehead
 */
function drawSeeThroughBangs(
  ctx: CanvasRenderingContext2D,
  centerX: number,
  hairlineY: number,
  faceW: number,
  faceH: number,
  fillGrad: CanvasGradient
) {
  ctx.save();
  ctx.fillStyle = fillGrad;

  // 5-7 subtle wispy strands
  for (let s = -3; s <= 3; s++) {
    const sx = centerX + s * (faceW * 0.05);
    const endY = hairlineY + faceH * (0.28 + Math.abs(s) * 0.03);

    ctx.beginPath();
    ctx.moveTo(sx - 3, hairlineY);
    ctx.quadraticCurveTo(sx + s * 2, (hairlineY + endY) * 0.5, sx + s * 4, endY);
    ctx.lineTo(sx + s * 4 + 2, endY);
    ctx.quadraticCurveTo(sx + s * 2 + 3, (hairlineY + endY) * 0.5, sx + 3, hairlineY);
    ctx.closePath();
    ctx.fill();
  }

  ctx.restore();
}

/**
 * Draws cascading romantic S-waves along the side
 */
function drawWaveStrand(
  ctx: CanvasRenderingContext2D,
  startX: number,
  startY: number,
  thickness: number,
  length: number,
  fillGrad: CanvasGradient,
  isLeft: boolean
) {
  ctx.save();
  ctx.fillStyle = fillGrad;

  const dir = isLeft ? -1 : 1;
  const p1y = startY + length * 0.25;
  const p2y = startY + length * 0.6;
  const p3y = startY + length;

  ctx.beginPath();
  ctx.moveTo(startX, startY);
  ctx.bezierCurveTo(startX + dir * 40, p1y, startX - dir * 25, p2y, startX + dir * 20, p3y);
  ctx.lineTo(startX + dir * 20 + thickness * 0.3, p3y);
  ctx.bezierCurveTo(startX - dir * 25 + thickness, p2y, startX + dir * 40 + thickness, p1y, startX + thickness, startY);
  ctx.closePath();
  ctx.fill();

  ctx.restore();
}
