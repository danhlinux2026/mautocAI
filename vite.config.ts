import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig, Plugin } from 'vite';
import express from 'express';
import { analyzeFaceAndHair, simulateHairstyleAI } from './server/geminiService.ts';
import { testAgnesConnection, generateHairstyleWithAgnes } from './server/agnesService.ts';

function apiServerPlugin(): Plugin {
  return {
    name: 'api-server-plugin',
    configureServer(server) {
      const app = express();
      app.use(express.json({ limit: '50mb' }));
      app.use(express.urlencoded({ limit: '50mb', extended: true }));

      // Face analysis endpoint
      app.post('/api/analyze-face', async (req, res) => {
        try {
          const { image } = req.body;
          if (!image) {
            return res.status(400).json({ error: 'Hình ảnh là bắt buộc' });
          }
          const result = await analyzeFaceAndHair(image);
          res.setHeader('Content-Type', 'application/json');
          res.json(result);
        } catch (err: any) {
          console.error('Lỗi phân tích khuôn mặt:', err);
          res.status(500).json({ error: err.message || 'Lỗi khi phân tích' });
        }
      });

      // Simulation endpoint (supports Gemini & Agnes AI)
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
            provider, // 'gemini' | 'agnes' | 'auto'
            agnesConfig,
          } = req.body;

          if (!image || !styleName) {
            return res.status(400).json({ error: 'Thiếu hình ảnh hoặc kiểu tóc' });
          }

          // If Agnes AI is explicitly requested
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

            // Also get professional salon recipe via Gemini for hair advice
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

            res.setHeader('Content-Type', 'application/json');
            return res.json({
              generatedImageUrl: agnesResult.imageUrl,
              hairRecipe: salonAdvice.hairRecipe,
              cuttingTechnique: salonAdvice.cuttingTechnique,
              maintenanceGuide: salonAdvice.maintenanceGuide,
              agnesStatus: agnesResult,
            });
          }

          // Default Gemini AI handler
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

          res.setHeader('Content-Type', 'application/json');
          res.json(result);
        } catch (err: any) {
          console.error('Lỗi giả lập kiểu tóc:', err);
          res.status(500).json({ error: err.message || 'Lỗi khi giả lập' });
        }
      });

      // Agnes AI specific endpoints
      app.post('/api/agnes/test', async (req, res) => {
        try {
          const { apiKey, baseUrl } = req.body;
          const result = await testAgnesConnection(apiKey, baseUrl);
          res.setHeader('Content-Type', 'application/json');
          res.json(result);
        } catch (err: any) {
          res.status(500).json({ connected: false, message: err.message || 'Lỗi kiểm tra' });
        }
      });

      app.post('/api/agnes/simulate', async (req, res) => {
        try {
          const result = await generateHairstyleWithAgnes(req.body);
          res.setHeader('Content-Type', 'application/json');
          res.json(result);
        } catch (err: any) {
          res.status(500).json({ success: false, message: err.message || 'Lỗi xử lý Agnes AI' });
        }
      });

      server.middlewares.use(app);
    },
  };
}

export default defineConfig(() => {
  return {
    plugins: [react(), tailwindcss(), apiServerPlugin()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      port: 3000,
      host: '0.0.0.0',
      hmr: process.env.DISABLE_HMR !== 'true',
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
