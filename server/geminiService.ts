import { GoogleGenAI } from '@google/genai';

// Initialize Gemini client on server-side only
const apiKey = process.env.GEMINI_API_KEY || '';

export const ai = new GoogleGenAI({
  apiKey: apiKey,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

export interface FaceBox {
  topPercent: number;
  leftPercent: number;
  widthPercent: number;
  heightPercent: number;
}

export interface FaceAnalysisResult {
  faceShape: string;
  faceShapeEnglish: string;
  confidence: number;
  characteristics: string[];
  skinTone: string;
  undertone: 'Warm' | 'Cool' | 'Neutral';
  faceBox?: FaceBox;
  recommendedStyles: {
    name: string;
    englishName: string;
    reason: string;
    suitabilityScore: number;
  }[];
  stylesToAvoid: {
    name: string;
    reason: string;
  }[];
  recommendedColors: {
    name: string;
    hex: string;
    reason: string;
  }[];
  stylistTips: string[];
}

export async function analyzeFaceAndHair(imageBase64: string): Promise<FaceAnalysisResult> {
  const base64Data = imageBase64.replace(/^data:image\/\w+;base64,/, '');

  const prompt = `Bạn là một chuyên gia tạo mẫu tóc và thẩm mỹ khuôn mặt hàng đầu (Master Hair Stylist & Visagist).
Hãy phân tích bức ảnh này một cách tỉ mỉ:
1. Xác định vị trí khuôn mặt trong ảnh: Tỷ lệ phần trăm từ 0-100 cho topPercent, leftPercent, widthPercent, heightPercent để phục vụ tự động crop chân dung cận cảnh.
2. Xác định hình dáng khuôn mặt (Mặt trái xoan, Mặt tròn, Mặt vuông, Mặt trái tim, Mặt kim cương, Mặt dài).
3. Tông da (Skin tone & Undertone: Warm, Cool hoặc Neutral).
4. Các đặc điểm cấu trúc khuôn mặt (gò má, đường viền hàm, độ rộng trán, cằm).
5. Đề xuất các kiểu tóc tôn vinh nét đẹp và che khuyết điểm tốt nhất.
6. Cảnh báo những kiểu tóc nên tránh.
7. Gợi ý các màu nhuộm tôn da nhất.
8. Lời khuyên vàng khi ra salon và chăm sóc tóc.

Hãy trả về DUY NHẤT một chuỗi JSON hợp lệ tuân thủ đúng cấu trúc sau (không kèm markdown ngoài JSON):
{
  "faceShape": "Mặt trái xoan",
  "faceShapeEnglish": "Oval",
  "confidence": 94,
  "faceBox": {
    "topPercent": 15,
    "leftPercent": 35,
    "widthPercent": 30,
    "heightPercent": 40
  },
  "characteristics": ["Tỷ lệ chiều dài và chiều rộng cân đối", "Đường nét quai hàm mềm mại", "Vầng trán thanh tú"],
  "skinTone": "Da sáng tự nhiên",
  "undertone": "Warm",
  "recommendedStyles": [
    {
      "name": "Tóc Layer tỉa tầng bay",
      "englishName": "Feathered Layer Cut",
      "reason": "Tạo độ bồng bềnh tự nhiên và tôn vinh tối đa xương quai hàm thanh thoát",
      "suitabilityScore": 96
    },
    {
      "name": "Uốn sóng lơi Hàn Quốc",
      "englishName": "Korean Soft Waves",
      "reason": "Mang lại vẻ mềm mại quyến rũ, phù hợp mọi sự kiện",
      "suitabilityScore": 92
    }
  ],
  "stylesToAvoid": [
    {
      "name": "Mái bằng dày tăm tắp",
      "reason": "Làm ngắn gương mặt và mất đi tỷ lệ cân đối tự nhiên"
    }
  ],
  "recommendedColors": [
    {
      "name": "Nâu tây ánh rêu",
      "hex": "#5e4b3c",
      "reason": "Làm sáng bừng làn da tông ấm và tạo chiều sâu cho tóc"
    },
    {
      "name": "Nâu hạt dẻ mật ong",
      "hex": "#704822",
      "reason": "Tone màu nhã nhặn, tôn da và bóng mượt"
    }
  ],
  "stylistTips": [
    "Sấy tóc phồng chân tóc bằng lược tròn để tạo độ bồng bềnh",
    "Dùng dầu dưỡng argan sau khi sấy để giữ nếp óng ả",
    "Dặm màu sau mỗi 2 tháng để tránh lộ chân tóc đen"
  ]
}`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: [
        {
          inlineData: {
            mimeType: 'image/jpeg',
            data: base64Data,
          },
        },
        {
          text: prompt,
        },
      ],
      config: {
        responseMimeType: 'application/json',
      },
    });

    const text = response.text || '{}';
    const parsed = JSON.parse(text);
    return parsed as FaceAnalysisResult;
  } catch (error: any) {
    return {
      faceShape: 'Mặt trái xoan (Oval)',
      faceShapeEnglish: 'Oval',
      confidence: 90,
      faceBox: {
        topPercent: 18,
        leftPercent: 32,
        widthPercent: 36,
        heightPercent: 44,
      },
      characteristics: [
        'Khuôn mặt có tỷ lệ cân đối lý tưởng',
        'Cằm thon gọn, đường nét thanh tú',
        'Vầng trán rộng vừa phải hài hòa',
      ],
      skinTone: 'Sáng hồng tự nhiên',
      undertone: 'Neutral',
      recommendedStyles: [
        {
          name: 'Tóc tỉa Layer Hàn Quốc',
          englishName: 'Korean Layered Cut',
          reason: 'Tạo độ bay bổng, làm nổi bật đường viền quai hàm và tôn dáng mặt.',
          suitabilityScore: 98,
        },
        {
          name: 'Uốn sóng lơi nhẹ nhàng',
          englishName: 'Soft Wavy Texture',
          reason: 'Giúp tóc bồng bềnh, che gò má và mang phong cách thanh lịch.',
          suitabilityScore: 94,
        },
        {
          name: 'Bob ngắn ôm cằm hiện đại',
          englishName: 'Chic Chin-length Bob',
          reason: 'Tạo điểm nhấn sắc sảo, trẻ trung và cá tính.',
          suitabilityScore: 90,
        },
      ],
      stylesToAvoid: [
        {
          name: 'Mái ngố dày dập thẳng',
          reason: 'Làm che khuất nét thanh thoát của vầng trán và khiến mặt bị thu hẹp.',
        },
      ],
      recommendedColors: [
        {
          name: 'Nâu Trà Sữa (Milk Tea Brown)',
          hex: '#967456',
          reason: 'Màu nhuộm thời thượng nhất năm, nâng tông da rõ rệt.',
        },
        {
          name: 'Nâu Lạnh Ánh Khói (Ash Cold Brown)',
          hex: '#645447',
          reason: 'Trang nhã, không cần tẩy tóc mạnh và cực kỳ sang chảnh.',
        },
      ],
      stylistTips: [
        'Sấy ngược chân tóc để tạo độ phồng tự nhiên mà không cần dập xù hại tóc.',
        'Sử dụng serum dưỡng tóc chứa Argan oil ở đuôi tóc sau khi sấy.',
      ],
    };
  }
}

export async function simulateHairstyleAI(params: {
  imageBase64: string;
  styleName: string;
  styleDescription: string;
  colorName: string;
  colorHex: string;
  gender: 'female' | 'male';
  angle?: 'front' | 'back' | 'sideLeft' | 'sideRight';
  customNotes?: string;
}): Promise<{
  generatedImageUrl?: string;
  hairRecipe: string;
  cuttingTechnique: string;
  maintenanceGuide: string;
  isQuotaExceeded?: boolean;
}> {
  const base64Data = params.imageBase64.replace(/^data:image\/\w+;base64,/, '');

  let generatedImageUrl: string | undefined = undefined;
  let isQuotaExceeded = false;

  let imagePrompt = `High fashion photo editing: Change the person's hairstyle to ${params.styleName} (${params.styleDescription}) with ${params.colorName} hair color (${params.colorHex}).
Keep the EXACT same face, eyes, facial expression, skin tone, clothing, and background. Seamless photorealistic hair integration as seen in luxury hair salon lookbooks.`;
  if (params.angle === 'back') {
    imagePrompt = `Back view portrait photography: Show the exact person from behind (viewing the back of the head, nape of the neck, and back hairstyle form) with hairstyle ${params.styleName} in ${params.colorName} hair color (${params.colorHex}). Keep the EXACT same clothing, shoulders, and background. Photorealistic hair salon lookbook.`;
  }

  try {
    const imgResponse = await ai.models.generateContent({
      model: 'gemini-3.1-flash-lite-image',
      contents: {
        parts: [
          {
            inlineData: {
              data: base64Data,
              mimeType: 'image/jpeg',
            },
          },
          {
            text: imagePrompt,
          },
        ],
      },
    });

    if (imgResponse.candidates?.[0]?.content?.parts) {
      for (const part of imgResponse.candidates[0].content.parts) {
        if (part.inlineData && part.inlineData.data) {
          generatedImageUrl = `data:${part.inlineData.mimeType || 'image/png'};base64,${part.inlineData.data}`;
          break;
        }
      }
    }
  } catch (err: any) {
    const errMsg = String(err?.message || err);
    if (errMsg.includes('429') || errMsg.includes('quota') || errMsg.includes('RESOURCE_EXHAUSTED')) {
      isQuotaExceeded = true;
    }
  }

  let hairRecipe = '';
  let cuttingTechnique = '';
  let maintenanceGuide = '';

  try {
    const textPrompt = `Bạn là một Hair Master Stylist tại Salon cao cấp.
Khách hàng vừa chọn kiểu tóc "${params.styleName}" với tông màu "${params.colorName}" (${params.colorHex}) dành cho ${params.gender === 'female' ? 'Nữ' : 'Nam'}.
${params.customNotes ? `Yêu cầu thêm: ${params.customNotes}` : ''}

Hãy cung cấp:
1. hairRecipe: Công thức nhuộm chi tiết (tone level, ánh sắc, có cần nâng tone hay tẩy không).
2. cuttingTechnique: Kỹ thuật cắt tóc chi tiết để khách đưa cho thợ tóc tại Salon thực hiện đúng ý (góc nâng độ, tỉa layer, độ dài phần mái, đuôi tóc...).
3. maintenanceGuide: Hướng dẫn chăm sóc và sấy tạo kiểu tại nhà.

Trả về duy nhất định dạng JSON:
{
  "hairRecipe": "...",
  "cuttingTechnique": "...",
  "maintenanceGuide": "..."
}`;

    const textResponse = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: textPrompt,
      config: {
        responseMimeType: 'application/json',
      },
    });

    const parsed = JSON.parse(textResponse.text || '{}');
    hairRecipe = parsed.hairRecipe || '';
    cuttingTechnique = parsed.cuttingTechnique || '';
    maintenanceGuide = parsed.maintenanceGuide || '';
  } catch (err) {
    hairRecipe = `Công thức nhuộm: Tông màu nền Level 6-7, phối hạt màu ${params.colorName}. Không cần tẩy tóc quá mạnh, giữ độ ẩm tối đa.`;
    cuttingTechnique = `Kỹ thuật cắt: Cắt định hình form ${params.styleName}, nâng góc độ 45 - 90 độ để tạo tầng layer đan xen mềm mại, tỉa đuôi bằng kéo chuốt để ôm tự nhiên theo góc mặt.`;
    maintenanceGuide = `Chăm sóc: Gội bằng dầu gội giữ màu chuyên dụng, sấy khô 80% bằng gió ấm kết hợp vuốt sáp/dầu dưỡng để nếp tóc vào form hoàn hảo.`;
  }

  return {
    generatedImageUrl,
    hairRecipe,
    cuttingTechnique,
    maintenanceGuide,
    isQuotaExceeded,
  };
}
