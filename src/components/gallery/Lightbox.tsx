'use client';

import { useEffect, useCallback } from 'react';
import { X, ChevronLeft, ChevronRight, Download, Heart } from 'lucide-react';
import { getOptimizedImageUrl, getOriginalImageUrl } from '@/lib/supabase';
import { TAG_OPTIONS } from '@/lib/constants';
import { useFavorites } from '@/hooks/useFavorites';
import { useLocalStats } from '@/hooks/useLocalStats';
import type { Image } from '@/types';

interface LightboxProps {
  image: Image;
  images: Image[];
  onClose: () => void;
  onNavigate: (image: Image) => void;
}

export default function Lightbox({
  image,
  images,
  onClose,
  onNavigate,
}: LightboxProps) {
  const { isFavorite, toggleFavorite } = useFavorites();
  const { trackView, trackDownload } = useLocalStats();

  const currentIndex = images.findIndex((img) => img.id === image.id);
  const hasPrev = currentIndex > 0;
  const hasNext = currentIndex < images.length - 1;
  const isImageFavorite = isFavorite(image.id);

  // Track view when image changes
  useEffect(() => {
    trackView(image.id);
  }, [image.id, trackView]);

  const handlePrev = useCallback(() => {
    if (hasPrev) {
      onNavigate(images[currentIndex - 1]);
    }
  }, [currentIndex, hasPrev, images, onNavigate]);

  const handleNext = useCallback(() => {
    if (hasNext) {
      onNavigate(images[currentIndex + 1]);
    }
  }, [currentIndex, hasNext, images, onNavigate]);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      switch (e.key) {
        case 'Escape':
          onClose();
          break;
        case 'ArrowLeft':
          handlePrev();
          break;
        case 'ArrowRight':
          handleNext();
          break;
      }
    },
    [onClose, handlePrev, handleNext]
  );

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    document.body.style.overflow = 'hidden';

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'unset';
    };
  }, [handleKeyDown]);

  // 미리보기용 최적화 이미지 (1200px, 고품질)
  const previewUrl = getOptimizedImageUrl(image.file_path, {
    width: 1200,
    quality: 85,
    resize: 'contain',
  });

  // 다운로드용 원본 이미지
  const originalUrl = getOriginalImageUrl(image.file_path);

  const characterLabel = TAG_OPTIONS.characters.find(
    (c) => c.value === image.character
  )?.label;

  const handleDownload = async () => {
    try {
      // 다운로드 추적
      trackDownload(image.id);

      // 원본 이미지 다운로드
      const response = await fetch(originalUrl);
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = image.file_name || image.title;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Download failed:', err);
      // 폴백: 직접 링크로 다운로드
      window.open(originalUrl, '_blank');
    }
  };

  const handleToggleFavorite = () => {
    toggleFavorite(image.id);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90">
      {/* Close button */}
      <button
        onClick={onClose}
        className="absolute top-4 right-4 p-2 text-white/80 hover:text-white transition-colors z-10"
      >
        <X className="w-8 h-8" />
      </button>

      {/* Favorite button */}
      <button
        onClick={handleToggleFavorite}
        className={`absolute top-4 right-28 p-2 transition-colors z-10 ${
          isImageFavorite ? 'text-red-500 hover:text-red-400' : 'text-white/80 hover:text-white'
        }`}
        title={isImageFavorite ? '즐겨찾기 해제' : '즐겨찾기 추가'}
      >
        <Heart className={`w-6 h-6 ${isImageFavorite ? 'fill-current' : ''}`} />
      </button>

      {/* Download button */}
      <button
        onClick={handleDownload}
        className="absolute top-4 right-16 p-2 text-white/80 hover:text-white transition-colors z-10"
        title="다운로드"
      >
        <Download className="w-6 h-6" />
      </button>

      {/* Navigation buttons */}
      {hasPrev && (
        <button
          onClick={handlePrev}
          className="absolute left-4 top-1/2 -translate-y-1/2 p-2 text-white/80 hover:text-white transition-colors"
        >
          <ChevronLeft className="w-10 h-10" />
        </button>
      )}

      {hasNext && (
        <button
          onClick={handleNext}
          className="absolute right-4 top-1/2 -translate-y-1/2 p-2 text-white/80 hover:text-white transition-colors"
        >
          <ChevronRight className="w-10 h-10" />
        </button>
      )}

      {/* Image container */}
      <div className="max-w-[90vw] max-h-[85vh] relative" onClick={(e) => e.stopPropagation()}>
        <img
          src={previewUrl}
          alt={image.title}
          className="max-w-full max-h-[85vh] object-contain"
        />
      </div>

      {/* Image info */}
      <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black/80 to-transparent">
        <div className="max-w-3xl mx-auto text-white">
          <div className="flex items-center gap-2 mb-2">
            {characterLabel && (
              <span className="px-2 py-1 bg-primary-600 text-xs font-medium rounded-full">
                {characterLabel}
              </span>
            )}
            <span className="text-sm text-white/60">
              {currentIndex + 1} / {images.length}
            </span>
          </div>
          <h2 className="text-xl font-semibold">{image.title}</h2>
          {image.description && (
            <p className="text-white/80 mt-1">{image.description}</p>
          )}
        </div>
      </div>

      {/* Click outside to close */}
      <div
        className="absolute inset-0 -z-10"
        onClick={onClose}
      />
    </div>
  );
}
