'use client';

import { useState, useCallback, useMemo } from 'react';
import ImageGrid from '@/components/gallery/ImageGrid';
import FilterPanel from '@/components/gallery/FilterPanel';
import SearchBar from '@/components/gallery/SearchBar';
import { useImages } from '@/hooks/useImages';
import { useFavorites } from '@/hooks/useFavorites';
import { useLocalStats } from '@/hooks/useLocalStats';
import { getImageUrl } from '@/lib/supabase';
import type { FilterState } from '@/types';

const initialFilters: FilterState = {
  character: '',
  emotion: '',
  action: '',
  scene: '',
  search: '',
  sort: 'newest',
  specialFilter: '',
  // 기존 필터 (호환성 유지)
  type: '',
  mood: '',
  shape: '',
  purpose: '',
};

// Filters for fetching all images (no filters applied)
const allImagesFilters: FilterState = {
  ...initialFilters,
};

export default function Home() {
  const [filters, setFilters] = useState<FilterState>(initialFilters);

  const { images, loading, error } = useImages(filters);
  const { images: allImages } = useImages(allImagesFilters); // Get all images for counts
  const { favorites, getFavoritesCount } = useFavorites();
  const { getPopularImageIds } = useLocalStats();

  // Calculate character counts from all images
  const characterCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    allImages.forEach((img) => {
      if (img.character) {
        counts[img.character] = (counts[img.character] || 0) + 1;
      }
    });
    return counts;
  }, [allImages]);

  // Get popular images for the showcase section
  const popularImages = useMemo(() => {
    const popularIds = getPopularImageIds(10);
    const popular = allImages.filter((img) => popularIds.includes(img.id));
    return popular.sort((a, b) => {
      return popularIds.indexOf(a.id) - popularIds.indexOf(b.id);
    });
  }, [allImages, getPopularImageIds]);

  // Filter images based on special filter (popular/favorites)
  const filteredImages = useMemo(() => {
    if (!filters.specialFilter) return images;

    if (filters.specialFilter === 'favorites') {
      return images.filter((img) => favorites.includes(img.id));
    }

    if (filters.specialFilter === 'popular') {
      const popularIds = getPopularImageIds(50);
      const popularImages = images.filter((img) => popularIds.includes(img.id));
      // Sort by popularity order
      return popularImages.sort((a, b) => {
        return popularIds.indexOf(a.id) - popularIds.indexOf(b.id);
      });
    }

    return images;
  }, [images, filters.specialFilter, favorites, getPopularImageIds]);

  // Get counts for filter badges
  const favoritesCount = getFavoritesCount();
  const popularCount = getPopularImageIds(50).length;

  // Memoize handlers to prevent unnecessary re-renders
  const handleFilterChange = useCallback((key: keyof FilterState, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  }, []);

  const handleResetFilters = useCallback(() => {
    setFilters(initialFilters);
  }, []);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">
          SOWONEE Gallery
        </h1>
        <p className="text-gray-600">
          소원이 가족 캐릭터 이미지 갤러리
        </p>
      </div>

      <SearchBar
        value={filters.search}
        onChange={(value) => handleFilterChange('search', value)}
      />

      {/* Popular Images Section */}
      {popularImages.length > 0 && !filters.specialFilter && (
        <div className="mb-8 bg-gradient-to-r from-orange-50 to-red-50 rounded-2xl p-6 border border-orange-100">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
              <span className="text-2xl">🔥</span>
              인기 이미지
            </h2>
            <button
              onClick={() => handleFilterChange('specialFilter', 'popular')}
              className="text-sm text-orange-600 hover:text-orange-700 font-medium hover:underline"
            >
              전체보기 →
            </button>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {popularImages.slice(0, 5).map((img) => (
              <div
                key={img.id}
                className="relative aspect-square rounded-xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 cursor-pointer group"
                onClick={() => {
                  // You can add lightbox functionality here if needed
                }}
              >
                <img
                  src={getImageUrl(img.file_path)}
                  alt={img.title}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <div className="absolute bottom-2 left-2 right-2">
                    <p className="text-white text-sm font-medium truncate">
                      {img.title}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <FilterPanel
        filters={filters}
        onFilterChange={handleFilterChange}
        onReset={handleResetFilters}
        favoritesCount={favoritesCount}
        popularCount={popularCount}
        allImages={allImages}
        characterCounts={characterCounts}
      />

      {error ? (
        <div className="text-center py-8">
          <p className="text-red-500 text-lg">오류가 발생했습니다</p>
          <p className="text-gray-500 mt-2">{error}</p>
          <button
            onClick={handleResetFilters}
            className="mt-4 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
          >
            다시 시도
          </button>
        </div>
      ) : (
        <ImageGrid images={filteredImages} loading={loading} />
      )}
    </div>
  );
}
