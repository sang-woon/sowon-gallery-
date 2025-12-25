'use client';

import { useMemo } from 'react';
import { TAG_OPTIONS, SORT_OPTIONS } from '@/lib/constants';
import { EMOTION_KEYWORDS, ACTION_KEYWORDS } from '@/hooks/useImages';
import type { FilterState, Image } from '@/types';
import { RotateCcw, X, TrendingUp, Heart } from 'lucide-react';

interface FilterPanelProps {
  filters: FilterState;
  onFilterChange: (key: keyof FilterState, value: string) => void;
  onReset: () => void;
  favoritesCount?: number;
  popularCount?: number;
  allImages?: Image[];
  characterCounts?: Record<string, number>;
}

// Helper function to check if image matches emotion keywords
function imageMatchesKeywords(image: Image, keywords: string[]): boolean {
  const description = (image.description || '').toLowerCase();
  return keywords.some(keyword => description.includes(keyword.toLowerCase()));
}

export default function FilterPanel({
  filters,
  onFilterChange,
  onReset,
  favoritesCount = 0,
  popularCount = 0,
  allImages = [],
  characterCounts = {},
}: FilterPanelProps) {
  // Calculate emotion counts
  const emotionCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    TAG_OPTIONS.emotions.forEach((emotion) => {
      const keywords = EMOTION_KEYWORDS[emotion.value] || [];
      counts[emotion.value] = allImages.filter((img) => imageMatchesKeywords(img, keywords)).length;
    });
    return counts;
  }, [allImages]);

  // Calculate action counts
  const actionCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    TAG_OPTIONS.actions.forEach((action) => {
      const keywords = ACTION_KEYWORDS[action.value] || [];
      counts[action.value] = allImages.filter((img) => imageMatchesKeywords(img, keywords)).length;
    });
    return counts;
  }, [allImages]);
  const hasActiveFilters =
    filters.character ||
    filters.emotion ||
    filters.action ||
    filters.scene ||
    filters.specialFilter;

  // 활성화된 필터 목록 생성
  const activeFilters: { key: keyof FilterState; label: string }[] = [];
  if (filters.specialFilter === 'popular') {
    activeFilters.push({ key: 'specialFilter', label: '🔥 인기' });
  }
  if (filters.specialFilter === 'favorites') {
    activeFilters.push({ key: 'specialFilter', label: '❤️ 즐겨찾기' });
  }
  if (filters.character) {
    const char = TAG_OPTIONS.characters.find(c => c.value === filters.character);
    if (char) activeFilters.push({ key: 'character', label: char.label });
  }
  if (filters.emotion) {
    const emotion = TAG_OPTIONS.emotions.find(e => e.value === filters.emotion);
    if (emotion) activeFilters.push({ key: 'emotion', label: `${emotion.emoji} ${emotion.label}` });
  }
  if (filters.action) {
    const action = TAG_OPTIONS.actions.find(a => a.value === filters.action);
    if (action) activeFilters.push({ key: 'action', label: action.label });
  }
  if (filters.scene) {
    const scene = TAG_OPTIONS.scenes.find(s => s.value === filters.scene);
    if (scene) activeFilters.push({ key: 'scene', label: scene.label });
  }

  return (
    <div className="mb-8 space-y-4">
      {/* 0. 특수 필터 (인기/즐겨찾기) */}
      <div className="flex flex-wrap gap-2 pb-3 border-b border-gray-200">
        <button
          onClick={() => onFilterChange('specialFilter', filters.specialFilter === 'popular' ? '' : 'popular')}
          className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium transition-all
            ${filters.specialFilter === 'popular'
              ? 'bg-orange-500 text-white shadow-md'
              : 'bg-orange-50 text-orange-700 hover:bg-orange-100 border border-orange-200'
            }`}
        >
          <TrendingUp className="w-4 h-4" />
          인기
          {popularCount > 0 && (
            <span className={`ml-1 px-1.5 py-0.5 text-xs rounded-full ${
              filters.specialFilter === 'popular' ? 'bg-orange-600' : 'bg-orange-100'
            }`}>
              {popularCount}
            </span>
          )}
        </button>
        <button
          onClick={() => onFilterChange('specialFilter', filters.specialFilter === 'favorites' ? '' : 'favorites')}
          className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium transition-all
            ${filters.specialFilter === 'favorites'
              ? 'bg-red-500 text-white shadow-md'
              : 'bg-red-50 text-red-700 hover:bg-red-100 border border-red-200'
            }`}
        >
          <Heart className={`w-4 h-4 ${filters.specialFilter === 'favorites' ? 'fill-white' : ''}`} />
          즐겨찾기
          {favoritesCount > 0 && (
            <span className={`ml-1 px-1.5 py-0.5 text-xs rounded-full ${
              filters.specialFilter === 'favorites' ? 'bg-red-600' : 'bg-red-100'
            }`}>
              {favoritesCount}
            </span>
          )}
        </button>
      </div>

      {/* 1. 캐릭터 필터 (탭 스타일) */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => onFilterChange('character', '')}
          className={`px-4 py-2 rounded-full text-sm font-medium transition-colors
            ${!filters.character
              ? 'bg-primary-600 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
        >
          전체
          {allImages.length > 0 && (
            <span className={`ml-1 text-xs ${!filters.character ? 'text-white/80' : 'text-gray-500'}`}>
              ({allImages.length})
            </span>
          )}
        </button>
        {TAG_OPTIONS.characters.map((char) => {
          const count = characterCounts[char.value] || 0;
          return (
            <button
              key={char.value}
              onClick={() => onFilterChange('character', char.value)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors
                ${filters.character === char.value
                  ? 'bg-primary-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
            >
              {char.label}
              {count > 0 && (
                <span className={`ml-1 text-xs ${filters.character === char.value ? 'text-white/80' : 'text-gray-500'}`}>
                  ({count})
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* 2. 감정/표정 필터 (이모지 칩 스타일) */}
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-sm text-gray-500 mr-1">감정:</span>
        {TAG_OPTIONS.emotions.map((emotion) => {
          const count = emotionCounts[emotion.value] || 0;
          return (
            <button
              key={emotion.value}
              onClick={() => onFilterChange('emotion', filters.emotion === emotion.value ? '' : emotion.value)}
              className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all
                ${filters.emotion === emotion.value
                  ? 'bg-primary-100 text-primary-700 ring-2 ring-primary-500'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
            >
              {emotion.emoji} {emotion.label}
              {count > 0 && (
                <span className="ml-1 text-xs text-gray-400">({count})</span>
              )}
            </button>
          );
        })}
      </div>

      {/* 3. 행동 필터 & 정렬 */}
      <div className="flex flex-wrap gap-3 items-center">
        {/* 행동 필터 */}
        <select
          value={filters.action}
          onChange={(e) => onFilterChange('action', e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-primary-500"
        >
          <option value="">행동 전체</option>
          {TAG_OPTIONS.actions.map((opt) => {
            const count = actionCounts[opt.value] || 0;
            return (
              <option key={opt.value} value={opt.value}>
                {opt.label} {count > 0 ? `(${count})` : ''}
              </option>
            );
          })}
        </select>

        {/* Divider */}
        <div className="hidden sm:block w-px h-8 bg-gray-300" />

        {/* 정렬 */}
        <select
          value={filters.sort}
          onChange={(e) => onFilterChange('sort', e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-primary-500"
        >
          {SORT_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>

        {/* 전체 초기화 버튼 */}
        {hasActiveFilters && (
          <button
            onClick={onReset}
            className="flex items-center gap-1 px-3 py-2 text-sm text-gray-600 hover:text-primary-600 transition-colors"
          >
            <RotateCcw className="w-4 h-4" />
            초기화
          </button>
        )}
      </div>

      {/* 4. 적용된 필터 표시 */}
      {activeFilters.length > 0 && (
        <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-gray-200">
          <span className="text-sm text-gray-500">적용됨:</span>
          {activeFilters.map(({ key, label }) => (
            <span
              key={key}
              className="inline-flex items-center gap-1 px-2 py-1 bg-primary-50 text-primary-700 text-sm rounded-md"
            >
              {label}
              <button
                onClick={() => onFilterChange(key, '')}
                className="hover:text-primary-900"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
