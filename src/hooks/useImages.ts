'use client';

import { useState, useEffect, useRef } from 'react';
import { getSupabase } from '@/lib/supabase';
import type { Image, FilterState } from '@/types';

// 감정 → 검색 키워드 매핑
export const EMOTION_KEYWORDS: Record<string, string[]> = {
  happy: ['smile', 'cute', 'laugh', '미소', '웃음', '귀여움'],
  excited: ['dance', 'celebrate', 'excited', '춤', '축하', '신남'],
  love: ['heart', 'love', '하트', '사랑'],
  surprised: ['surprised', 'shocked', '놀람', '충격'],
  confused: ['confused', '혼란', '당황'],
  worried: ['worried', '걱정'],
  thinking: ['thinking', 'curious', 'memo', '생각', '호기심', '메모'],
  proud: ['proud', 'thumbsup', '자랑', '엄지척', '뿌듯'],
  touched: ['touched', '감동'],
  calm: ['rest', 'calm', 'dreaming', '휴식', '평온', '꿈꾸는'],
};

// 행동 → 검색 키워드 매핑
export const ACTION_KEYWORDS: Record<string, string[]> = {
  greeting: ['greeting', 'bow', '인사'],
  working: ['working', 'memo', 'conference', '일하는', '메모', '회의'],
  playing: ['dance', 'playing', '춤', '놀기'],
  celebrating: ['celebrate', 'party', '축하'],
  exercising: ['exercise', '운동'],
  resting: ['rest', 'dreaming', '휴식', '꿈꾸는'],
  shopping: ['shopping', '쇼핑'],
  talking: ['talking', 'conference', '대화', '회의'],
  posing: ['selfie', 'default', 'posing', '셀피', '기본', '포즈'],
};

// 장면 → 검색 키워드 매핑
const SCENE_KEYWORDS: Record<string, string[]> = {
  home: ['home', '홈', '집'],
  outdoor: ['street', 'outdoor', '거리', '야외'],
  office: ['conference', 'office', 'working', '회의', '사무실', '일하는'],
  street: ['street', '거리'],
  simple: ['default', 'simple', '기본', '단순'],
};

export function useImages(filters: FilterState) {
  const [images, setImages] = useState<Image[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const isInitialMount = useRef(true);

  // Create stable dependency key from filters
  const filtersKey = JSON.stringify(filters);

  useEffect(() => {
    let isCancelled = false;

    async function fetchImages() {
      // Only show loading on initial mount, not on filter changes
      if (isInitialMount.current) {
        setLoading(true);
        isInitialMount.current = false;
      }
      setError(null);

      try {
        const supabase = getSupabase();
        let query = supabase
          .from('images')
          .select('*')
          .eq('is_visible', true);

        // Apply filters
        if (filters.character) {
          query = query.eq('character', filters.character);
        }

        // 새로운 필터: 감정 (description 검색)
        if (filters.emotion && EMOTION_KEYWORDS[filters.emotion]) {
          const keywords = EMOTION_KEYWORDS[filters.emotion];
          const orConditions = keywords.map(k => `description.ilike.%${k}%`).join(',');
          query = query.or(orConditions);
        }

        // 새로운 필터: 행동 (description 검색)
        if (filters.action && ACTION_KEYWORDS[filters.action]) {
          const keywords = ACTION_KEYWORDS[filters.action];
          const orConditions = keywords.map(k => `description.ilike.%${k}%`).join(',');
          query = query.or(orConditions);
        }

        // 새로운 필터: 장면 (description 검색)
        if (filters.scene && SCENE_KEYWORDS[filters.scene]) {
          const keywords = SCENE_KEYWORDS[filters.scene];
          const orConditions = keywords.map(k => `description.ilike.%${k}%`).join(',');
          query = query.or(orConditions);
        }

        // 기존 필터 (호환성 유지)
        if (filters.type) {
          query = query.eq('image_type', filters.type);
        }
        if (filters.mood) {
          query = query.eq('image_mood', filters.mood);
        }
        if (filters.shape) {
          query = query.eq('image_shape', filters.shape);
        }
        if (filters.purpose) {
          query = query.eq('image_purpose', filters.purpose);
        }

        // 검색어 필터
        if (filters.search) {
          query = query.or(
            `title.ilike.%${filters.search}%,description.ilike.%${filters.search}%`
          );
        }

        // Apply sorting
        switch (filters.sort) {
          case 'oldest':
            query = query.order('created_at', { ascending: true });
            break;
          case 'popular':
            query = query.order('likes', { ascending: false });
            break;
          case 'title':
            query = query.order('title', { ascending: true });
            break;
          case 'newest':
          default:
            query = query.order('created_at', { ascending: false });
        }

        const { data, error: fetchError } = await query;

        if (fetchError) {
          throw fetchError;
        }

        // Only update state if not cancelled
        if (!isCancelled) {
          setImages(data || []);
          setLoading(false);
        }
      } catch (err) {
        if (!isCancelled) {
          console.error('Error fetching images:', err);
          setError(err instanceof Error ? err.message : '이미지를 불러오는데 실패했습니다');
          setLoading(false);
        }
      }
    }

    fetchImages();

    // Cleanup function to cancel pending requests
    return () => {
      isCancelled = true;
    };
  }, [filtersKey]); // Use stable key instead of object reference

  return { images, loading, error };
}

export function useImage(id: string) {
  const [image, setImage] = useState<Image | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchImage() {
      if (!id) return;

      setLoading(true);
      setError(null);

      try {
        const supabase = getSupabase();
        const { data, error: fetchError } = await supabase
          .from('images')
          .select('*')
          .eq('id', id)
          .single();

        if (fetchError) {
          throw fetchError;
        }

        setImage(data);
      } catch (err) {
        console.error('Error fetching image:', err);
        setError(err instanceof Error ? err.message : '이미지를 불러오는데 실패했습니다');
      } finally {
        setLoading(false);
      }
    }

    fetchImage();
  }, [id]);

  return { image, loading, error };
}
