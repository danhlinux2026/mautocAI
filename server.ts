import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { analyzeFaceAndHair, simulateHairstyleAI } from './server/geminiService.ts';
import { testAgnesConnection, generateHairstyleWithAgnes } from './server/agnesService.ts';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = Number(process.env.PORT) || 3000;

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// API Endpoints
app.post('/api/analyze-face', async (req, res) => {
  try {
    const { image } = req.body;
    if (!image) {
      return res.status(400).json({ error: 'Hình ảnh là bắt buộc' });
    }
    const result = await analyzeFaceAndHair(image);
    res.json(result);
  } catch (err: any) {
    console.error('Lỗi phân tích khuôn mặt:', err);
    res.status(500).json({ error: err.message || 'Lỗi khi phân tích' });
  }
});

app.post('/api/simulate-hair', async (req, res) => {
  try {
    const {
      image,
      styleName,
      styleEnglishName,
      styleDescription,
      colorName,
      colorHex,
      gender,
      angle,
      customNotes,
      provider,
      agnesConfig,
    } = req.body;

    if (!image || !styleName) {
      return res.status(400).json({ error: 'Thiếu hình ảnh hoặc kiểu tóc' });
    }

    if (provider === 'agnes') {
      const agnesResult = await generateHairstyleWithAgnes({
        imageBase64: image,
        styleName,
        styleEnglishName,
        colorName: colorName || 'Tự nhiên',
        colorHex,
        gender: gender || 'female',
        angle: angle || 'front',
        customNotes,
        config: agnesConfig,
      });

      const salonAdvice = await simulateHairstyleAI({
        imageBase64: image,
        styleName,
        styleDescription: styleDescription || '',
        colorName: colorName || 'Tự nhiên',
        colorHex: colorHex || '#33241d',
        gender: gender || 'female',
        angle: angle || 'front',
        customNotes,
      }).catch(() => ({
        hairRecipe: `Tone nền Level 6-7, ánh sắc ${colorName}.`,
        cuttingTechnique: `Cắt tỉa form ${styleName} bồng bềnh tự nhiên.`,
        maintenanceGuide: 'Sấy phồng chân tóc, dùng dưỡng ẩm thường xuyên.',
      }));

      return res.json({
        generatedImageUrl: agnesResult.imageUrl,
        hairRecipe: salonAdvice.hairRecipe,
        cuttingTechnique: salonAdvice.cuttingTechnique,
        maintenanceGuide: salonAdvice.maintenanceGuide,
        agnesStatus: agnesResult,
      });
    }

    const result = await simulateHairstyleAI({
      imageBase64: image,
      styleName,
      styleDescription: styleDescription || '',
      colorName: colorName || 'Tự nhiên',
      colorHex: colorHex || '#33241d',
      gender: gender || 'female',
      angle: angle || 'front',
      customNotes,
    });
    res.json(result);
  } catch (err: any) {
    console.error('Lỗi giả lập kiểu tóc:', err);
    res.status(500).json({ error: err.message || 'Lỗi khi giả lập' });
  }
});

// Agnes AI endpoints
app.post('/api/agnes/test', async (req, res) => {
  try {
    const { apiKey, baseUrl } = req.body;
    const result = await testAgnesConnection(apiKey, baseUrl);
    res.json(result);
  } catch (err: any) {
    res.status(500).json({ connected: false, message: err.message || 'Lỗi kiểm tra' });
  }
});

app.post('/api/agnes/simulate', async (req, res) => {
  try {
    const result = await generateHairstyleWithAgnes(req.body);
    res.json(result);
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message || 'Lỗi xử lý Agnes AI' });
  }
});

// Serve static frontend build if available
const distPath = path.join(__dirname, 'dist');
app.use(express.static(distPath));

app.get('*', (req, res) => {
  res.sendFile(path.join(distPath, 'index.html'));
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server chạy tại cổng ${PORT}`);
});
