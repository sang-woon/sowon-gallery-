'use client';

import { useCallback, useEffect, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, Image as ImageIcon, Clipboard } from 'lucide-react';

interface ImageUploaderProps {
  onFilesSelected: (files: File[]) => void;
}

export default function ImageUploader({ onFilesSelected }: ImageUploaderProps) {
  const [isPasteActive, setIsPasteActive] = useState(false);

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      if (acceptedFiles.length > 0) {
        onFilesSelected(acceptedFiles);
      }
    },
    [onFilesSelected]
  );

  // Handle clipboard paste
  const handlePaste = useCallback(
    async (e: ClipboardEvent) => {
      const items = e.clipboardData?.items;
      if (!items) return;

      const imageFiles: File[] = [];

      for (let i = 0; i < items.length; i++) {
        const item = items[i];

        // Check if the item is an image
        if (item.type.startsWith('image/')) {
          const file = item.getAsFile();
          if (file) {
            // Generate a unique filename for pasted images
            const timestamp = Date.now();
            const extension = file.type.split('/')[1] || 'png';
            const newFile = new File(
              [file],
              `pasted-image-${timestamp}.${extension}`,
              { type: file.type }
            );
            imageFiles.push(newFile);
          }
        }
      }

      if (imageFiles.length > 0) {
        e.preventDefault();
        setIsPasteActive(true);
        onFilesSelected(imageFiles);

        // Reset paste active state after animation
        setTimeout(() => setIsPasteActive(false), 1000);
      }
    },
    [onFilesSelected]
  );

  // Add paste event listener
  useEffect(() => {
    document.addEventListener('paste', handlePaste);
    return () => {
      document.removeEventListener('paste', handlePaste);
    };
  }, [handlePaste]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.gif', '.webp'],
    },
    multiple: true,
  });

  const isActive = isDragActive || isPasteActive;

  return (
    <div
      {...getRootProps()}
      className={`
        relative border-2 border-dashed rounded-2xl p-12 text-center cursor-pointer
        transition-all duration-200
        ${
          isActive
            ? 'border-primary-500 bg-primary-50'
            : 'border-gray-300 hover:border-primary-400 hover:bg-gray-50'
        }
      `}
    >
      <input {...getInputProps()} />

      <div className="flex flex-col items-center">
        <div
          className={`
            p-4 rounded-full mb-4 transition-colors
            ${isActive ? 'bg-primary-100' : 'bg-gray-100'}
          `}
        >
          {isPasteActive ? (
            <Clipboard className="w-12 h-12 text-primary-600" />
          ) : isDragActive ? (
            <ImageIcon className="w-12 h-12 text-primary-600" />
          ) : (
            <Upload className="w-12 h-12 text-gray-400" />
          )}
        </div>

        <h3 className="text-lg font-medium text-gray-900 mb-2">
          {isPasteActive
            ? '이미지가 붙여넣기 되었습니다!'
            : isDragActive
            ? '여기에 놓으세요!'
            : '이미지를 드래그하거나 클릭하세요'}
        </h3>

        <p className="text-gray-500 text-sm mb-3">
          JPG, PNG, GIF, WebP 파일 지원 (여러 파일 선택 가능)
        </p>

        {/* Paste hint */}
        <div className="flex items-center gap-2 px-3 py-1.5 bg-gray-100 rounded-full">
          <Clipboard className="w-4 h-4 text-gray-500" />
          <span className="text-xs text-gray-600">
            <kbd className="px-1.5 py-0.5 bg-white rounded border border-gray-300 text-xs font-mono">
              Ctrl
            </kbd>
            {' + '}
            <kbd className="px-1.5 py-0.5 bg-white rounded border border-gray-300 text-xs font-mono">
              V
            </kbd>
            {' '}로 이미지 붙여넣기 가능
          </span>
        </div>
      </div>
    </div>
  );
}
