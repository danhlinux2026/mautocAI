/**
 * Hair Canvas Simulation Utility
 * Handles real-time hair coloring, blend modes, gloss sheen highlights,
 * and salon consultation card generation.
 */

export interface SimulationOptions {
  colorHex: string;
  intensity: number; // 0 to 100
  gloss: number;     // 0 to 100
  brightness: number; // -50 to 50
}

export function hexToRgb(hex: string): { r: number; g: number; b: number } {
  let cleanHex = hex.replace('#', '');
  if (cleanHex.length === 3) {
    cleanHex = cleanHex.split('').map((c) => c + c).join('');
  }
  const num = parseInt(cleanHex, 16);
  return {
    r: (num >> 16) & 255,
    g: (num >> 8) & 255,
    b: num & 255,
  };
}

export async function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = (e) => reject(e);
    img.src = src;
  });
}

/**
 * Renders an instant preview of hair color change on the portrait.
 * Applies color blending, highlights sheen, and luminance protection for eyes/skin.
 */
export async function renderHairColorSimulation(
  imageSrc: string,
  options: SimulationOptions
): Promise<string> {
  const img = await loadImage(imageSrc);
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  if (!ctx) return imageSrc;

  // Set high resolution canvas
  const width = img.naturalWidth || img.width;
  const height = img.naturalHeight || img.height;
  canvas.width = width;
  canvas.height = height;

  // 1. Draw original base image
  ctx.drawImage(img, 0, 0, width, height);

  // 2. Get image data for intelligent hair region tinting
  const imageData = ctx.getImageData(0, 0, width, height);
  const data = imageData.data;
  const targetRgb = hexToRgb(options.colorHex);
  const intensityFactor = options.intensity / 100;
  const glossFactor = options.gloss / 100;
  const brightnessOffset = (options.brightness / 100) * 40;

  // Approximate face center box (to protect eyes, lips and center facial skin from excessive tinting)
  const faceCenterX = width * 0.5;
  const faceCenterY = height * 0.45;
  const faceRadiusX = width * 0.22;
  const faceRadiusY = height * 0.24;

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const idx = (y * width + x) * 4;
      const r = data[idx];
      const g = data[idx + 1];
      const b = data[idx + 2];

      // Luminance
      const lum = 0.299 * r + 0.587 * g + 0.114 * b;

      // Distance from face center (normalized elliptical distance)
      const dx = (x - faceCenterX) / faceRadiusX;
      const dy = (y - faceCenterY) / faceRadiusY;
      const faceDistSq = dx * dx + dy * dy;

      // Mask calculation: Hair tends to be darker than fair skin or concentrated in top, sides & surrounding crown
      // If inside inner face circle, drastically reduce tinting
      let maskWeight = 0;
      if (faceDistSq > 0.8) {
        // Outside inner face: high hair probability, especially in upper 70% of photo
        const verticalWeight = y < height * 0.85 ? 1 : Math.max(0, 1 - (y - height * 0.85) / (height * 0.15));
        maskWeight = Math.min(1, (faceDistSq - 0.7) * 1.5) * verticalWeight;
      } else if (y < height * 0.32) {
        // Forehead / Bangs area
        maskWeight = Math.max(0, 1 - y / (height * 0.32)) * 0.85;
      }

      // Hair fiber luminance filter (excludes pure white background or extreme specular highlights)
      if (lum < 240 && lum > 15 && maskWeight > 0.05) {
        // Calculate blended color with soft light / color blend algorithm
        const blendR = (r * (255 - targetRgb.r) + targetRgb.r * lum) / 255;
        const blendG = (g * (255 - targetRgb.g) + targetRgb.g * lum) / 255;
        const blendB = (b * (255 - targetRgb.b) + targetRgb.b * lum) / 255;

        // Apply gloss highlight sheen
        const glossSheen = Math.pow(lum / 255, 2.2) * 50 * glossFactor;

        const effectiveFactor = intensityFactor * maskWeight;

        data[idx] = Math.min(255, Math.max(0, r + (blendR - r) * effectiveFactor + brightnessOffset + glossSheen));
        data[idx + 1] = Math.min(255, Math.max(0, g + (blendG - g) * effectiveFactor + brightnessOffset + glossSheen));
        data[idx + 2] = Math.min(255, Math.max(0, b + (blendB - b) * effectiveFactor + brightnessOffset + glossSheen));
      }
    }
  }

  ctx.putImageData(imageData, 0, 0);

  // Return base64 JPEG
  return canvas.toDataURL('image/jpeg', 0.92);
}

/**
 * Creates a high-end Salon Consultation Card (Thẻ Tư Vấn Salon)
 * combining before, after, styling specifications, and salon tips into a downloadable image.
 */
export async function generateSalonCard(params: {
  originalImage: string;
  styledImage: string;
  styleName: string;
  styleEnglishName: string;
  colorName: string;
  colorHex: string;
  faceShape: string;
  hairRecipe: string;
  cuttingTechnique: string;
  maintenanceGuide: string;
}): Promise<string> {
  const [origImg, styledImg] = await Promise.all([
    loadImage(params.originalImage),
    loadImage(params.styledImage),
  ]);

  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  if (!ctx) return params.styledImage;

  const width = 1200;
  const height = 1500;
  canvas.width = width;
  canvas.height = height;

  // Background - Luxury Dark Slate / Rose Gold Theme
  const bgGrad = ctx.createLinearGradient(0, 0, width, height);
  bgGrad.addColorStop(0, '#141211');
  bgGrad.addColorStop(0.5, '#1c1917');
  bgGrad.addColorStop(1, '#0c0a09');
  ctx.fillStyle = bgGrad;
  ctx.fillRect(0, 0, width, height);

  // Decorative border
  ctx.strokeStyle = 'rgba(244, 63, 94, 0.35)';
  ctx.lineWidth = 3;
  ctx.strokeRect(30, 30, width - 60, height - 60);

  // Header Banner
  ctx.fillStyle = 'rgba(255, 255, 255, 0.03)';
  ctx.fillRect(30, 30, width - 60, 140);

  // Title & Brand
  ctx.fillStyle = '#fb7185';
  ctx.font = 'bold 36px "Plus Jakarta Sans", sans-serif';
  ctx.fillText('AI HAIR STUDIO', 70, 95);

  ctx.fillStyle = '#f5f5f4';
  ctx.font = '600 24px "Plus Jakarta Sans", sans-serif';
  ctx.fillText('THẺ TƯ VẤN KIỂU TÓC SALON CHUYÊN NGHIỆP', 70, 135);

  ctx.fillStyle = '#a8a29e';
  ctx.font = '16px "Plus Jakarta Sans", sans-serif';
  ctx.fillText(new Date().toLocaleDateString('vi-VN'), width - 180, 100);

  // Images Section (Side by Side)
  const imgY = 200;
  const imgWidth = 510;
  const imgHeight = 580;

  // Original Box
  ctx.save();
  ctx.beginPath();
  ctx.roundRect(70, imgY, imgWidth, imgHeight, 16);
  ctx.clip();
  ctx.drawImage(origImg, 70, imgY, imgWidth, imgHeight);
  ctx.restore();

  // Original Label
  ctx.fillStyle = 'rgba(0, 0, 0, 0.75)';
  ctx.fillRect(70, imgY + imgHeight - 45, 140, 45);
  ctx.fillStyle = '#e7e5e4';
  ctx.font = 'bold 18px "Plus Jakarta Sans", sans-serif';
  ctx.fillText('TRƯỚC (BEFORE)', 85, imgY + imgHeight - 16);

  // Transformed Box
  ctx.save();
  ctx.beginPath();
  ctx.roundRect(620, imgY, imgWidth, imgHeight, 16);
  ctx.clip();
  ctx.drawImage(styledImg, 620, imgY, imgWidth, imgHeight);
  ctx.restore();

  // Transformed Label
  ctx.fillStyle = 'rgba(225, 29, 72, 0.85)';
  ctx.fillRect(620, imgY + imgHeight - 45, 140, 45);
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 18px "Plus Jakarta Sans", sans-serif';
  ctx.fillText('SAU (AFTER)', 640, imgY + imgHeight - 16);

  // Hairstyle & Color Spec Badge
  const specY = 820;
  ctx.fillStyle = 'rgba(38, 38, 38, 0.8)';
  ctx.beginPath();
  ctx.roundRect(70, specY, width - 140, 120, 14);
  ctx.fill();
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
  ctx.stroke();

  // Style name
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 28px "Plus Jakarta Sans", sans-serif';
  ctx.fillText(params.styleName, 95, specY + 48);

  ctx.fillStyle = '#fb7185';
  ctx.font = '18px "Plus Jakarta Sans", sans-serif';
  ctx.fillText(params.styleEnglishName, 95, specY + 80);

  // Hair Color Sample
  ctx.fillStyle = '#a8a29e';
  ctx.font = '16px "Plus Jakarta Sans", sans-serif';
  ctx.fillText('MÀU NHUỘM:', 650, specY + 48);

  // Color circle
  ctx.fillStyle = params.colorHex;
  ctx.beginPath();
  ctx.arc(775, specY + 42, 16, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = '#ffffff';
  ctx.lineWidth = 2;
  ctx.stroke();

  ctx.fillStyle = '#f5f5f4';
  ctx.font = 'bold 20px "Plus Jakarta Sans", sans-serif';
  ctx.fillText(params.colorName, 805, specY + 50);

  // Face Shape match
  ctx.fillStyle = '#a8a29e';
  ctx.font = '16px "Plus Jakarta Sans", sans-serif';
  ctx.fillText(`DÁNG MẶT: ${params.faceShape}`, 650, specY + 85);

  // Detailed Recipe & Technician Instructions
  const infoY = 970;

  function drawInfoBox(x: number, y: number, w: number, h: number, title: string, text: string) {
    ctx!.fillStyle = 'rgba(28, 25, 23, 0.9)';
    ctx!.beginPath();
    ctx!.roundRect(x, y, w, h, 14);
    ctx!.fill();
    ctx!.strokeStyle = 'rgba(244, 63, 94, 0.2)';
    ctx!.lineWidth = 1.5;
    ctx!.stroke();

    ctx!.fillStyle = '#fb7185';
    ctx!.font = 'bold 18px "Plus Jakarta Sans", sans-serif';
    ctx!.fillText(title, x + 25, y + 36);

    ctx!.fillStyle = '#d6d3d1';
    ctx!.font = '16px "Plus Jakarta Sans", sans-serif';

    // Simple wrap text
    const words = text.split(' ');
    let line = '';
    let lineY = y + 70;
    const maxLineWidth = w - 50;

    for (let n = 0; n < words.length; n++) {
      const testLine = line + words[n] + ' ';
      const metrics = ctx!.measureText(testLine);
      if (metrics.width > maxLineWidth && n > 0) {
        ctx!.fillText(line, x + 25, lineY);
        line = words[n] + ' ';
        lineY += 26;
      } else {
        line = testLine;
      }
    }
    ctx!.fillText(line, x + 25, lineY);
  }

  // 3 Columns or stacked cards
  drawInfoBox(
    70,
    infoY,
    width - 140,
    120,
    '1. KỸ THUẬT CẮT CHO THỢ SALON (CUTTING TECHNIQUE)',
    params.cuttingTechnique || 'Cắt tỉa phân tầng Layer bay bổng ôm viền hàm, nâng góc độ 45-90 độ tạo độ bồng tự nhiên.'
  );

  drawInfoBox(
    70,
    infoY + 140,
    width - 140,
    110,
    '2. CÔNG THỨC PHA MÀU NHUỘM (COLOR RECIPE)',
    params.hairRecipe || `Tone nền mục tiêu: Level 6-7, ánh sắc ${params.colorName}. Dưỡng bóng phủ bóng collagen sau khi nhuộm.`
  );

  drawInfoBox(
    70,
    infoY + 270,
    width - 140,
    110,
    '3. HƯỚNG DẪN CHĂM SÓC & TẠO KIỂU TẠI NHÀ (MAINTENANCE)',
    params.maintenanceGuide || 'Sấy phồng ngược chiều chân tóc, thoa serum dưỡng ẩm đuôi tóc sau gội để giữ form chuẩn đẹp.'
  );

  // Footer Note
  ctx.fillStyle = '#78716c';
  ctx.font = '14px "Plus Jakarta Sans", sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('Đưa thẻ tư vấn này cho Chuyên gia tạo mẫu tóc của bạn khi ghé Salon để có mái tóc chuẩn xác nhất.', width / 2, height - 50);

  return canvas.toDataURL('image/jpeg', 0.95);
}
