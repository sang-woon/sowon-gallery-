import { createClient, SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

let supabaseInstance: SupabaseClient | null = null;

export function getSupabase(): SupabaseClient {
  if (!supabaseInstance) {
    if (!supabaseUrl || !supabaseAnonKey) {
      throw new Error('Supabase credentials are not configured');
    }
    supabaseInstance = createClient(supabaseUrl, supabaseAnonKey);
  }
  return supabaseInstance;
}

// For convenience, export a getter that can be used in client components
export const supabase = {
  get client() {
    return getSupabase();
  },
};

export interface ImageTransformOptions {
  width?: number;
  height?: number;
  quality?: number;
  resize?: 'cover' | 'contain' | 'fill';
}

/**
 * 원본 이미지 URL 반환 (다운로드용)
 */
export function getOriginalImageUrl(filePath: string): string {
  if (!supabaseUrl) return '/placeholder.png';
  return `${supabaseUrl}/storage/v1/object/public/images/${filePath}`;
}

/**
 * 최적화된 이미지 URL 반환 (갤러리 표시용)
 * Supabase Image Transformation API 사용
 */
export function getOptimizedImageUrl(
  filePath: string,
  options: ImageTransformOptions = {}
): string {
  if (!supabaseUrl) return '/placeholder.png';

  const {
    width = 400,
    height,
    quality = 75,
    resize = 'cover',
  } = options;

  // Supabase Image Transformation URL
  const params = new URLSearchParams();
  params.set('width', width.toString());
  if (height) params.set('height', height.toString());
  params.set('quality', quality.toString());
  params.set('resize', resize);

  return `${supabaseUrl}/storage/v1/render/image/public/images/${filePath}?${params.toString()}`;
}

/**
 * 기존 함수 - 호환성 유지 (썸네일 최적화 버전 사용)
 */
export function getImageUrl(filePath: string): string {
  return getOptimizedImageUrl(filePath, { width: 400, height: 400, quality: 75 });
}
