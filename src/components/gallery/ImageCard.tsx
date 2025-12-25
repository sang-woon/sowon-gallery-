'use client';

import { useState, useEffect, useRef } from 'react';
import { Heart, Copy, Check } from 'lucide-react';
import { getImageUrl } from '@/lib/supabase';
import { TAG_OPTIONS } from '@/lib/constants';
import { formatDate } from '@/lib/utils';
import type { Image } from '@/types';

interface ImageCardProps {
  image: Image;
  onImageClick?: (image: Image) => void;
}

export default function ImageCard({ image, onImageClick }: ImageCardProps) {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  const imageUrl = getImageUrl(image.file_path);

  // Intersection Observer for lazy loading
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsVisible(true);
            observer.disconnect();
          }
        });
      },
      {
        rootMargin: '100px', // Start loading 100px before entering viewport
        threshold: 0.01,
      }
    );

    if (cardRef.current) {
      observer.observe(cardRef.current);
    }

    return () => observer.disconnect();
  }, []);

  // Reset state when image changes
  useEffect(() => {
    setImageLoaded(false);
    setImageError(false);
  }, [image.id]);

  const characterLabel = TAG_OPTIONS.characters.find(
    (c) => c.value === image.character
  )?.label;

  const handleClick = () => {
    if (onImageClick) {
      onImageClick(image);
    }
  };

  const handleImageLoad = () => {
    setImageLoaded(true);
  };

  const handleCopyImage = async (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent opening lightbox

    try {
      const response = await fetch(imageUrl);
      const blob = await response.blob();

      await navigator.clipboard.write([
        new ClipboardItem({
          [blob.type]: blob,
        }),
      ]);

      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy image:', error);
      alert('이미지 복사에 실패했습니다.');
    }
  };

  return (
    <div
      ref={cardRef}
      className="group relative bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 cursor-pointer"
      onClick={handleClick}
    >
      {/* Image container */}
      <div className="relative aspect-square bg-gray-100">
        {/* Skeleton loading */}
        {(!isVisible || !imageLoaded) && !imageError && (
          <div className="absolute inset-0 bg-gray-200">
            <div className="absolute inset-0 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 animate-shimmer" />
            {/* Loading spinner in center */}
            {isVisible && !imageLoaded && (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-8 h-8 border-3 border-gray-300 border-t-primary-500 rounded-full animate-spin" />
              </div>
            )}
          </div>
        )}

        {imageError ? (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
            <span className="text-gray-400 text-sm">이미지 로드 실패</span>
          </div>
        ) : (
          isVisible && (
            <img
              src={imageUrl}
              alt={image.title}
              loading="lazy"
              decoding="async"
              className={`w-full h-full object-cover transition-all duration-300 group-hover:scale-105 ${
                imageLoaded ? 'opacity-100' : 'opacity-0'
              }`}
              onLoad={handleImageLoad}
              onError={() => {
                console.error('[ImageCard] Image load failed:', {
                  imageId: image.id,
                  title: image.title,
                  url: imageUrl,
                });
                setImageError(true);
              }}
            />
          )
        )}

        {/* Overlay on hover */}
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors duration-300" />

        {/* Copy button */}
        <button
          onClick={handleCopyImage}
          className="absolute bottom-2 right-2 p-2 bg-white/90 hover:bg-white rounded-full shadow-md opacity-0 group-hover:opacity-100 transition-all duration-300 hover:scale-110"
          title="이미지 복사"
        >
          {isCopied ? (
            <Check className="w-4 h-4 text-green-600" />
          ) : (
            <Copy className="w-4 h-4 text-gray-700" />
          )}
        </button>

        {/* Character badge */}
        {characterLabel && (
          <span className="absolute top-2 left-2 px-2 py-1 bg-primary-600 text-white text-xs font-medium rounded-full">
            {characterLabel}
          </span>
        )}

        {/* Likes badge */}
        {image.likes > 0 && (
          <span className="absolute top-2 right-2 flex items-center gap-1 px-2 py-1 bg-white/90 text-gray-700 text-xs rounded-full">
            <Heart className="w-3 h-3 fill-red-500 text-red-500" />
            {image.likes}
          </span>
        )}
      </div>

      {/* Info */}
      <div className="p-3">
        <h3 className="font-medium text-gray-900 truncate" title={image.title}>
          {image.title}
        </h3>
        {image.description && (
          <p className="text-sm text-gray-500 truncate mt-1" title={image.description}>
            {image.description}
          </p>
        )}
        <p className="text-xs text-gray-400 mt-2">
          {formatDate(image.created_at)}
        </p>
      </div>
    </div>
  );
}
