import { CHARACTERS, IMAGE_TYPES, IMAGE_MOODS, IMAGE_SHAPES, IMAGE_PURPOSES } from './constants';

const OPENAI_API_KEY = process.env.NEXT_PUBLIC_OPENAI_API_KEY || '';

export interface ImageAnalysisResult {
  character: string;
  image_type: string;
  image_mood: string;
  image_shape: string;
  image_purpose: string;
  title: string;
  description: string;
  tags: string[];
  confidence: number;
}

export async function analyzeImage(file: File): Promise<ImageAnalysisResult> {
  if (!OPENAI_API_KEY) {
    throw new Error('OpenAI API 키가 설정되지 않았습니다');
  }

  // Convert file to base64
  const base64 = await fileToBase64(file);

  // Get image dimensions for shape detection
  const dimensions = await getImageDimensions(file);
  const aspectRatio = dimensions.width / dimensions.height;

  // Determine shape based on aspect ratio
  let detectedShape = 'square';
  if (aspectRatio > 1.5) {
    detectedShape = 'landscape';
  } else if (aspectRatio < 0.7) {
    detectedShape = 'portrait';
  } else if (aspectRatio > 2.5) {
    detectedShape = 'banner';
  }

  const characterOptions = CHARACTERS.map(c => `${c.value}(${c.label})`).join(', ');
  const typeOptions = IMAGE_TYPES.map(t => `${t.value}(${t.label})`).join(', ');
  const moodOptions = IMAGE_MOODS.map(m => `${m.value}(${m.label})`).join(', ');
  const purposeOptions = IMAGE_PURPOSES.map(p => `${p.value}(${p.label})`).join(', ');

  const prompt = `이 이미지를 분석하고 다음 카테고리에 맞는 태그를 추천해주세요.

이 서비스는 "소원이 가족" 캐릭터 이미지 갤러리입니다.
소원이는 귀여운 여자아이 캐릭터이고, 가족 구성원(엄마, 아빠, 할머니, 할아버지, 아기)도 있습니다.

분석 항목:
1. 캐릭터: ${characterOptions}
2. 이미지 유형: ${typeOptions}
3. 느낌/분위기: ${moodOptions}
4. 용도: ${purposeOptions}

다음 JSON 형식으로 응답해주세요 (JSON만 출력, 다른 텍스트 없이):
{
  "character": "캐릭터 value (sowon, mom, dad, grandma, grandpa, baby 중 하나, 없으면 빈 문자열)",
  "image_type": "유형 value (photo, illustration, icon, graphic, character 중 하나)",
  "image_mood": "느낌 value (bright, dark, warm, cute, cool, calm, energetic, romantic 중 하나)",
  "image_purpose": "용도 value (sns, blog, profile, wallpaper, print, presentation 중 하나)",
  "title": "이미지 제목 추천 (한글, 20자 이내)",
  "description": "이미지 설명 (한글, 50자 이내)",
  "tags": ["관련 태그1", "관련 태그2", "관련 태그3"],
  "confidence": 0.0에서 1.0 사이의 확신도
}`;

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'user',
            content: [
              {
                type: 'text',
                text: prompt,
              },
              {
                type: 'image_url',
                image_url: {
                  url: `data:${file.type};base64,${base64}`,
                  detail: 'low',
                },
              },
            ],
          },
        ],
        max_tokens: 500,
        temperature: 0.3,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error?.message || `API 요청 실패: ${response.status}`);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || '';

    // Parse JSON from response
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('AI 응답을 파싱할 수 없습니다');
    }

    const result = JSON.parse(jsonMatch[0]) as ImageAnalysisResult;

    // Add detected shape
    result.image_shape = detectedShape;

    // Validate and normalize values
    return normalizeAnalysisResult(result);
  } catch (error) {
    console.error('OpenAI API error:', error);
    throw error;
  }
}

function normalizeAnalysisResult(result: ImageAnalysisResult): ImageAnalysisResult {
  const validCharacters = CHARACTERS.map(c => c.value);
  const validTypes = IMAGE_TYPES.map(t => t.value);
  const validMoods = IMAGE_MOODS.map(m => m.value);
  const validShapes = IMAGE_SHAPES.map(s => s.value);
  const validPurposes = IMAGE_PURPOSES.map(p => p.value);

  return {
    character: validCharacters.includes(result.character) ? result.character : '',
    image_type: validTypes.includes(result.image_type) ? result.image_type : 'illustration',
    image_mood: validMoods.includes(result.image_mood) ? result.image_mood : 'bright',
    image_shape: validShapes.includes(result.image_shape) ? result.image_shape : 'square',
    image_purpose: validPurposes.includes(result.image_purpose) ? result.image_purpose : 'sns',
    title: result.title || '새 이미지',
    description: result.description || '',
    tags: Array.isArray(result.tags) ? result.tags.slice(0, 5) : [],
    confidence: typeof result.confidence === 'number' ? Math.min(1, Math.max(0, result.confidence)) : 0.5,
  };
}

function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      // Remove data URL prefix
      const base64 = result.split(',')[1];
      resolve(base64);
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

function getImageDimensions(file: File): Promise<{ width: number; height: number }> {
  return new Promise((resolve) => {
    const img = new window.Image();
    img.onload = () => {
      resolve({ width: img.width, height: img.height });
      URL.revokeObjectURL(img.src);
    };
    img.onerror = () => {
      resolve({ width: 100, height: 100 });
      URL.revokeObjectURL(img.src);
    };
    img.src = URL.createObjectURL(file);
  });
}

export function isOpenAIConfigured(): boolean {
  return !!OPENAI_API_KEY;
}
