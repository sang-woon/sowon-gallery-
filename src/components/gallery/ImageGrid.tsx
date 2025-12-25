'use client';

import { useState } from 'react';
import ImageCard from './ImageCard';
import Lightbox from './Lightbox';
import type { Image } from '@/types';

interface ImageGridProps {
  images: Image[];
  loading: boolean;
}

export default function ImageGrid({ images, loading }: ImageGridProps) {
  const [selectedImage, setSelectedImage] = useState<Image | null>(null);

  if (loading) {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {Array.from({ length: 10 }).map((_, i) => (
          <div key={i} className="aspect-square bg-gray-200 rounded-xl overflow-hidden">
            <div className="w-full h-full bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 animate-shimmer" />
          </div>
        ))}
      </div>
    );
  }

  if (images.length === 0) {
    return (
      <div className="text-center py-16">
        <p className="text-gray-500 text-lg">이미지가 없습니다</p>
        <p className="text-gray-400 text-sm mt-2">
          다른 필터를 선택해 보세요
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {images.map((image) => (
          <ImageCard
            key={image.id}
            image={image}
            onImageClick={setSelectedImage}
          />
        ))}
      </div>

      {selectedImage && (
        <Lightbox
          image={selectedImage}
          images={images}
          onClose={() => setSelectedImage(null)}
          onNavigate={setSelectedImage}
        />
      )}
    </>
  );
}
