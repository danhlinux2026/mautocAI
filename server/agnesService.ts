/**
 * Agnes AI Service
 * Integration with Agnes AI Platform (https://apihub.agnes-ai.com/v1)
 * Supports image generation, image-to-image hairstyle transformations,
 * and OpenAI-compatible endpoints.
 */

export interface AgnesConfig {
  apiKey?: string;
  baseUrl?: string;
  model?: string;
}

export interface AgnesHairstyleParams {
  imageBase64: string;
  styleName: string;
  styleEnglishName?: string;
  colorName: string;
  colorHex?: string;
  gender: 'female' | 'male';
  angle?: 'front' | 'back' | 'sideLeft' | 'sideRight';
  customNotes?: string;
  config?: AgnesConfig;
}

export interface AgnesHairstyleResponse {
  success: boolean;
  imageUrl?: string;
  provider: 'agnes-ai' | 'fallback';
  modelUsed: string;
  message?: string;
  rawResponse?: any;
}

const DEFAULT_AGNES_BASE_URL = process.env.AGNES_API_BASE_URL || 'https://apihub.agnes-ai.com/v1';
const DEFAULT_AGNES_KEY = process.env.AGNES_API_KEY || '';
const DEFAULT_AGNES_MODEL = 'agnes-image-2.5-flash';

/**
 * Checks connection to Agnes AI Hub
 */
export async function testAgnesConnection(apiKey?: string, baseUrl?: string): Promise<{
  connected: boolean;
  message: string;
  models?: string[];
}> {
  const key = apiKey || DEFAULT_AGNES_KEY;
  const url = (baseUrl || DEFAULT_AGNES_BASE_URL).replace(/\/+$/, '');

  if (!key) {
    return {
      connected: false,
      message: 'Chưa cấu hình AGNES_API_KEY. Vui lòng nhập API Key từ console.agnes-ai.com.',
    };
  }

  try {
    const res = await fetch(`${url}/models`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${key}`,
        'Content-Type': 'application/json',
      },
    });

    if (!res.ok) {
      const errText = await res.text();
      return {
        connected: false,
        message: `Lỗi kết nối Agnes AI (${res.status}): ${errText.slice(0, 150)}`,
      };
    }

    const data = await res.json();
    const modelList = Array.isArray(data?.data)
      ? data.data.map((m: any) => m.id || m.name)
      : ['agnes-image-2.5-flash', 'agnes-image-2.1-flash', 'agnes-2.5-flash'];

    return {
      connected: true,
      message: 'Kết nối Agnes AI Hub thành công!',
      models: modelList,
    };
  } catch (error: any) {
    return {
      connected: false,
      message: `Không thể kết nối đến ${url}: ${error.message || 'Lỗi mạng'}`,
    };
  }
}

/**
 * Performs hairstyle transformation using Agnes AI API
 */
export async function generateHairstyleWithAgnes(
  params: AgnesHairstyleParams
): Promise<AgnesHairstyleResponse> {
  const key = params.config?.apiKey || DEFAULT_AGNES_KEY;
  const baseUrl = (params.config?.baseUrl || DEFAULT_AGNES_BASE_URL).replace(/\/+$/, '');
  const model = params.config?.model || DEFAULT_AGNES_MODEL;

  if (!key) {
    return {
      success: false,
      provider: 'fallback',
      modelUsed: model,
      message: 'Vui lòng cung cấp AGNES_API_KEY để kích hoạt tính năng chuyển đổi bằng Agnes AI.',
    };
  }

  let prompt = `Professional salon hair makeover portrait photography: Change the person's hairstyle to ${params.styleName} (${params.styleEnglishName || ''}) with vivid ${params.colorName} hair dye. Retain the exact same person's face identity, facial features, expressions, eye color, skin texture, and lighting. Photorealistic 4K studio quality. ${params.customNotes ? `Additional notes: ${params.customNotes}` : ''}`;
  if (params.angle === 'back') {
    prompt = `Back view salon hair photography: Show the exact person from behind (viewing the back of the head, nape of the neck, and back haircut form) with hairstyle ${params.styleName} (${params.styleEnglishName || ''}) dyed in ${params.colorName} color (${params.colorHex || ''}). Retain the exact same clothing, shoulders, and background from the original portrait. 4K studio quality.`;
  } else if (params.angle === 'sideLeft' || params.angle === 'sideRight') {
    prompt = `Side profile hair photography: Show the exact person from the ${params.angle === 'sideLeft' ? 'left' : 'right'} side profile showing their ear, jawline and hairstyle ${params.styleName} with ${params.colorName} hair color. Retain the exact clothing and background.`;
  }

  try {
    // 1. Try Agnes Image Generations / Edits endpoint (OpenAI compatible format)
    const payload = {
      model: model,
      prompt: prompt,
      image: params.imageBase64,
      n: 1,
      size: '1024x1024',
      response_format: 'b64_json',
    };

    const res = await fetch(`${baseUrl}/images/generations`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${key}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (res.ok) {
      const data = await res.json();
      const firstItem = data?.data?.[0];
      let resultUrl = '';

      if (firstItem?.b64_json) {
        resultUrl = `data:image/png;base64,${firstItem.b64_json}`;
      } else if (firstItem?.url) {
        resultUrl = firstItem.url;
      }

      if (resultUrl) {
        return {
          success: true,
          imageUrl: resultUrl,
          provider: 'agnes-ai',
          modelUsed: model,
          message: 'Tạo kiểu tóc thành công bằng Agnes AI!',
          rawResponse: data,
        };
      }
    }

    // 2. Fallback: try Chat Completions with Vision / Image model format if images/generations failed
    const chatPayload = {
      model: model.includes('image') ? model : 'agnes-2.5-flash',
      messages: [
        {
          role: 'user',
          content: [
            { type: 'text', text: prompt },
            {
              type: 'image_url',
              image_url: { url: params.imageBase64 },
            },
          ],
        },
      ],
      max_tokens: 1500,
    };

    const chatRes = await fetch(`${baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${key}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(chatPayload),
    });

    if (chatRes.ok) {
      const chatData = await chatRes.json();
      const messageContent = chatData.choices?.[0]?.message?.content;
      // Look for data:image or markdown image url in content
      const imgMatch = messageContent?.match(/https?:\/\/[^\s)]+\.(png|jpg|jpeg|webp)/i) || messageContent?.match(/data:image\/[a-zA-Z]+;base64,[^"'\s)]+/);
      if (imgMatch) {
        return {
          success: true,
          imageUrl: imgMatch[0],
          provider: 'agnes-ai',
          modelUsed: model,
          message: 'Tạo kiểu tóc thành công bằng Agnes AI!',
        };
      }
    }

    const errDetail = await res.text().catch(() => 'Unknown error');
    return {
      success: false,
      provider: 'fallback',
      modelUsed: model,
      message: `Agnes AI phản hồi: ${errDetail.slice(0, 200)}`,
    };
  } catch (err: any) {
    console.error('Lỗi gọi Agnes API:', err);
    return {
      success: false,
      provider: 'fallback',
      modelUsed: model,
      message: `Không thể kết nối tới Agnes API: ${err.message || 'Lỗi kết nối mạng'}`,
    };
  }
}
