'use client';

import { useState, useEffect, useCallback } from 'react';

const STORAGE_KEY = 'sowonee_favorites';

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

export function useFavorites() {
  const [favorites, setFavorites] = useState<string[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load favorites from localStorage
  useEffect(() => {
    const saved = getStorageItem<string[]>(STORAGE_KEY, []);
    setFavorites(saved);
    setIsLoaded(true);
  }, []);

  // Check if image is favorited
  const isFavorite = useCallback(
    (imageId: string): boolean => {
      return favorites.includes(imageId);
    },
    [favorites]
  );

  // Toggle favorite
  const toggleFavorite = useCallback((imageId: string) => {
    setFavorites((prev) => {
      const newFavorites = prev.includes(imageId)
        ? prev.filter((id) => id !== imageId)
        : [...prev, imageId];

      setStorageItem(STORAGE_KEY, newFavorites);
      return newFavorites;
    });
  }, []);

  // Add to favorites
  const addFavorite = useCallback((imageId: string) => {
    setFavorites((prev) => {
      if (prev.includes(imageId)) return prev;
      const newFavorites = [...prev, imageId];
      setStorageItem(STORAGE_KEY, newFavorites);
      return newFavorites;
    });
  }, []);

  // Remove from favorites
  const removeFavorite = useCallback((imageId: string) => {
    setFavorites((prev) => {
      const newFavorites = prev.filter((id) => id !== imageId);
      setStorageItem(STORAGE_KEY, newFavorites);
      return newFavorites;
    });
  }, []);

  // Clear all favorites
  const clearFavorites = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY);
    setFavorites([]);
  }, []);

  // Get favorite image IDs
  const getFavoriteIds = useCallback((): string[] => {
    return [...favorites];
  }, [favorites]);

  // Get favorites count
  const getFavoritesCount = useCallback((): number => {
    return favorites.length;
  }, [favorites]);

  return {
    favorites,
    isLoaded,
    isFavorite,
    toggleFavorite,
    addFavorite,
    removeFavorite,
    clearFavorites,
    getFavoriteIds,
    getFavoritesCount,
  };
}
