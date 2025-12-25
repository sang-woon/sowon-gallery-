'use client';

import { useState, useEffect, useCallback } from 'react';

const STORAGE_KEYS = {
  IMAGE_VIEWS: 'sowonee_image_views',
  IMAGE_DOWNLOADS: 'sowonee_image_downloads',
  SEARCH_HISTORY: 'sowonee_search_history',
};

interface ImageStats {
  [imageId: string]: number;
}

interface SearchHistory {
  query: string;
  timestamp: number;
  count: number;
}

interface LocalStats {
  views: ImageStats;
  downloads: ImageStats;
  searches: SearchHistory[];
}

function getStorageItem<T>(key: string, defaultValue: T): T {
  if (typeof window === 'undefined') return defaultValue;
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
  } catch {
    return defaultValue;
  }
}

function setStorageItem<T>(key: string, value: T): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (e) {
    console.error('Failed to save to localStorage:', e);
  }
}

export function useLocalStats() {
  const [stats, setStats] = useState<LocalStats>({
    views: {},
    downloads: {},
    searches: [],
  });
  const [isLoaded, setIsLoaded] = useState(false);

  // Load stats from localStorage
  useEffect(() => {
    const views = getStorageItem<ImageStats>(STORAGE_KEYS.IMAGE_VIEWS, {});
    const downloads = getStorageItem<ImageStats>(STORAGE_KEYS.IMAGE_DOWNLOADS, {});
    const searches = getStorageItem<SearchHistory[]>(STORAGE_KEYS.SEARCH_HISTORY, []);

    setStats({ views, downloads, searches });
    setIsLoaded(true);
  }, []);

  // Track image view
  const trackView = useCallback((imageId: string) => {
    setStats((prev) => {
      const newViews = {
        ...prev.views,
        [imageId]: (prev.views[imageId] || 0) + 1,
      };
      setStorageItem(STORAGE_KEYS.IMAGE_VIEWS, newViews);
      return { ...prev, views: newViews };
    });
  }, []);

  // Track image download
  const trackDownload = useCallback((imageId: string) => {
    setStats((prev) => {
      const newDownloads = {
        ...prev.downloads,
        [imageId]: (prev.downloads[imageId] || 0) + 1,
      };
      setStorageItem(STORAGE_KEYS.IMAGE_DOWNLOADS, newDownloads);
      return { ...prev, downloads: newDownloads };
    });
  }, []);

  // Track search query
  const trackSearch = useCallback((query: string) => {
    if (!query.trim()) return;

    setStats((prev) => {
      const existingIndex = prev.searches.findIndex(
        (s) => s.query.toLowerCase() === query.toLowerCase()
      );

      let newSearches: SearchHistory[];

      if (existingIndex >= 0) {
        newSearches = [...prev.searches];
        newSearches[existingIndex] = {
          ...newSearches[existingIndex],
          count: newSearches[existingIndex].count + 1,
          timestamp: Date.now(),
        };
      } else {
        newSearches = [
          { query, timestamp: Date.now(), count: 1 },
          ...prev.searches,
        ].slice(0, 100); // Keep only last 100 searches
      }

      setStorageItem(STORAGE_KEYS.SEARCH_HISTORY, newSearches);
      return { ...prev, searches: newSearches };
    });
  }, []);

  // Get top viewed images
  const getTopViewed = useCallback((limit = 10): { id: string; count: number }[] => {
    return Object.entries(stats.views)
      .map(([id, count]) => ({ id, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, limit);
  }, [stats.views]);

  // Get top downloaded images
  const getTopDownloaded = useCallback((limit = 10): { id: string; count: number }[] => {
    return Object.entries(stats.downloads)
      .map(([id, count]) => ({ id, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, limit);
  }, [stats.downloads]);

  // Get popular image IDs (combined views + downloads)
  const getPopularImageIds = useCallback((limit = 20): string[] => {
    const combined: { [id: string]: number } = {};

    // Weight: views * 1 + downloads * 3
    Object.entries(stats.views).forEach(([id, count]) => {
      combined[id] = (combined[id] || 0) + count;
    });
    Object.entries(stats.downloads).forEach(([id, count]) => {
      combined[id] = (combined[id] || 0) + count * 3;
    });

    return Object.entries(combined)
      .sort((a, b) => b[1] - a[1])
      .slice(0, limit)
      .map(([id]) => id);
  }, [stats.views, stats.downloads]);

  // Get top searches
  const getTopSearches = useCallback((limit = 10): SearchHistory[] => {
    return [...stats.searches]
      .sort((a, b) => b.count - a.count)
      .slice(0, limit);
  }, [stats.searches]);

  // Get recent searches
  const getRecentSearches = useCallback((limit = 5): SearchHistory[] => {
    return [...stats.searches]
      .sort((a, b) => b.timestamp - a.timestamp)
      .slice(0, limit);
  }, [stats.searches]);

  // Get view count for specific image
  const getViewCount = useCallback((imageId: string): number => {
    return stats.views[imageId] || 0;
  }, [stats.views]);

  // Get download count for specific image
  const getDownloadCount = useCallback((imageId: string): number => {
    return stats.downloads[imageId] || 0;
  }, [stats.downloads]);

  // Clear all stats
  const clearStats = useCallback(() => {
    localStorage.removeItem(STORAGE_KEYS.IMAGE_VIEWS);
    localStorage.removeItem(STORAGE_KEYS.IMAGE_DOWNLOADS);
    localStorage.removeItem(STORAGE_KEYS.SEARCH_HISTORY);
    setStats({ views: {}, downloads: {}, searches: [] });
  }, []);

  return {
    stats,
    isLoaded,
    trackView,
    trackDownload,
    trackSearch,
    getTopViewed,
    getTopDownloaded,
    getPopularImageIds,
    getTopSearches,
    getRecentSearches,
    getViewCount,
    getDownloadCount,
    clearStats,
  };
}
