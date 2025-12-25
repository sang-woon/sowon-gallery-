'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Sparkles, Loader2 } from 'lucide-react';
import Button from '@/components/ui/Button';
import ImageUploader from '@/components/admin/ImageUploader';
import ImageForm from '@/components/admin/ImageForm';
import { useAuth } from '@/hooks/useAuth';
import { useUpload } from '@/hooks/useUpload';
import { analyzeImage, isOpenAIConfigured, type ImageAnalysisResult } from '@/lib/openai';

interface PendingImage {
  file: File;
  preview: string;
  metadata: {
    title: string;
    description: string;
    character: string;
    image_type: string;
    image_mood: string;
    image_shape: string;
    image_purpose: string;
  };
  aiAnalyzed?: boolean;
}

export default function AdminUploadPage() {
  const router = useRouter();
  const { isAuthenticated, loading: authLoading } = useAuth();
  const { uploadImage, uploading } = useUpload();

  const [pendingImages, setPendingImages] = useState<PendingImage[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);

  const aiConfigured = isOpenAIConfigured();

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/admin/login/');
    }
  }, [isAuthenticated, authLoading, router]);

  const handleFilesSelected = (files: File[]) => {
    const newImages: PendingImage[] = files.map((file) => ({
      file,
      preview: URL.createObjectURL(file),
      metadata: {
        title: file.name.replace(/\.[^/.]+$/, ''),
        description: '',
        character: '',
        image_type: '',
        image_mood: '',
        image_shape: '',
        image_purpose: '',
      },
      aiAnalyzed: false,
    }));
    setPendingImages(newImages);
    setCurrentIndex(0);
    setUploadSuccess(false);
    setAiError(null);
  };

  const handleMetadataChange = (
    field: keyof PendingImage['metadata'],
    value: string
  ) => {
    setPendingImages((prev) =>
      prev.map((img, idx) =>
        idx === currentIndex
          ? { ...img, metadata: { ...img.metadata, [field]: value } }
          : img
      )
    );
  };

  const handleAIAnalyze = async () => {
    const currentImage = pendingImages[currentIndex];
    if (!currentImage) return;

    setAnalyzing(true);
    setAiError(null);

    try {
      const result: ImageAnalysisResult = await analyzeImage(currentImage.file);

      setPendingImages((prev) =>
        prev.map((img, idx) =>
          idx === currentIndex
            ? {
                ...img,
                metadata: {
                  title: result.title || img.metadata.title,
                  description: result.description || img.metadata.description,
                  character: result.character || img.metadata.character,
                  image_type: result.image_type || img.metadata.image_type,
                  image_mood: result.image_mood || img.metadata.image_mood,
                  image_shape: result.image_shape || img.metadata.image_shape,
                  image_purpose: result.image_purpose || img.metadata.image_purpose,
                },
                aiAnalyzed: true,
              }
            : img
        )
      );
    } catch (err) {
      console.error('AI analysis failed:', err);
      setAiError(err instanceof Error ? err.message : 'AI 분석에 실패했습니다');
    } finally {
      setAnalyzing(false);
    }
  };

  const handleAnalyzeAll = async () => {
    setAnalyzing(true);
    setAiError(null);

    try {
      const updatedImages = [...pendingImages];

      for (let i = 0; i < updatedImages.length; i++) {
        if (updatedImages[i].aiAnalyzed) continue;

        try {
          const result = await analyzeImage(updatedImages[i].file);
          updatedImages[i] = {
            ...updatedImages[i],
            metadata: {
              title: result.title || updatedImages[i].metadata.title,
              description: result.description || updatedImages[i].metadata.description,
              character: result.character || updatedImages[i].metadata.character,
              image_type: result.image_type || updatedImages[i].metadata.image_type,
              image_mood: result.image_mood || updatedImages[i].metadata.image_mood,
              image_shape: result.image_shape || updatedImages[i].metadata.image_shape,
              image_purpose: result.image_purpose || updatedImages[i].metadata.image_purpose,
            },
            aiAnalyzed: true,
          };
          setPendingImages([...updatedImages]);
        } catch (err) {
          console.error(`AI analysis failed for image ${i}:`, err);
        }
      }
    } catch (err) {
      console.error('Batch AI analysis failed:', err);
      setAiError('일부 이미지 분석에 실패했습니다');
    } finally {
      setAnalyzing(false);
    }
  };

  const handleUpload = async () => {
    const currentImage = pendingImages[currentIndex];
    if (!currentImage) return;

    try {
      await uploadImage(currentImage.file, currentImage.metadata);

      // Move to next image or finish
      if (currentIndex < pendingImages.length - 1) {
        setCurrentIndex((prev) => prev + 1);
      } else {
        setUploadSuccess(true);
        // Clean up previews
        pendingImages.forEach((img) => URL.revokeObjectURL(img.preview));
        setPendingImages([]);
      }
    } catch (err) {
      console.error('Upload failed:', err);
      alert('업로드에 실패했습니다');
    }
  };

  const handleSkip = () => {
    if (currentIndex < pendingImages.length - 1) {
      setCurrentIndex((prev) => prev + 1);
    }
  };

  if (authLoading || !isAuthenticated) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600" />
      </div>
    );
  }

  if (uploadSuccess) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto text-center py-16">
          <div className="text-6xl mb-4">🎉</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            업로드 완료!
          </h2>
          <p className="text-gray-500 mb-8">
            모든 이미지가 성공적으로 업로드되었습니다
          </p>
          <div className="flex justify-center gap-4">
            <Button onClick={() => setUploadSuccess(false)}>
              추가 업로드
            </Button>
            <Link href="/admin/">
              <Button variant="outline">대시보드로</Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const currentImage = pendingImages[currentIndex];

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <Link
          href="/admin/"
          className="p-2 text-gray-600 hover:text-gray-900 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">이미지 업로드</h1>
          <p className="text-gray-500">새 이미지를 갤러리에 추가하세요</p>
        </div>
      </div>

      {pendingImages.length === 0 ? (
        <ImageUploader onFilesSelected={handleFilesSelected} />
      ) : (
        <div className="max-w-4xl mx-auto">
          {/* Progress */}
          <div className="mb-6">
            <div className="flex items-center justify-between text-sm text-gray-600 mb-2">
              <span>
                {currentIndex + 1} / {pendingImages.length} 이미지
              </span>
              <span>{Math.round(((currentIndex + 1) / pendingImages.length) * 100)}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-primary-600 h-2 rounded-full transition-all"
                style={{
                  width: `${((currentIndex + 1) / pendingImages.length) * 100}%`,
                }}
              />
            </div>
          </div>

          {/* AI Analysis Buttons */}
          {aiConfigured && (
            <div className="mb-6 p-4 bg-gradient-to-r from-purple-50 to-blue-50 rounded-xl border border-purple-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-purple-600" />
                  <span className="font-medium text-purple-900">AI 자동 태그 추천</span>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleAIAnalyze}
                    disabled={analyzing || currentImage?.aiAnalyzed}
                    className="border-purple-300 text-purple-700 hover:bg-purple-100"
                  >
                    {analyzing ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-1 animate-spin" />
                        분석 중...
                      </>
                    ) : currentImage?.aiAnalyzed ? (
                      '분석 완료'
                    ) : (
                      '현재 이미지 분석'
                    )}
                  </Button>
                  {pendingImages.length > 1 && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleAnalyzeAll}
                      disabled={analyzing}
                      className="border-purple-300 text-purple-700 hover:bg-purple-100"
                    >
                      {analyzing ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-1 animate-spin" />
                          분석 중...
                        </>
                      ) : (
                        '전체 이미지 분석'
                      )}
                    </Button>
                  )}
                </div>
              </div>
              {aiError && (
                <p className="text-red-600 text-sm mt-2">{aiError}</p>
              )}
              {currentImage?.aiAnalyzed && (
                <p className="text-green-600 text-sm mt-2">
                  AI가 태그를 추천했습니다. 필요시 수정하세요.
                </p>
              )}
            </div>
          )}

          {!aiConfigured && (
            <div className="mb-6 p-4 bg-gray-50 rounded-xl border border-gray-200">
              <div className="flex items-center gap-2 text-gray-600">
                <Sparkles className="w-5 h-5" />
                <span className="text-sm">
                  AI 태그 추천을 사용하려면 환경변수에 NEXT_PUBLIC_OPENAI_API_KEY를 설정하세요
                </span>
              </div>
            </div>
          )}

          <div className="grid md:grid-cols-2 gap-8">
            {/* Preview */}
            <div className="bg-white rounded-xl shadow-sm border p-4">
              <div className="relative">
                <img
                  src={currentImage.preview}
                  alt="Preview"
                  className="w-full rounded-lg object-contain max-h-[400px]"
                />
                {currentImage.aiAnalyzed && (
                  <div className="absolute top-2 right-2 bg-purple-600 text-white text-xs px-2 py-1 rounded-full flex items-center gap-1">
                    <Sparkles className="w-3 h-3" />
                    AI 분석됨
                  </div>
                )}
              </div>
            </div>

            {/* Form */}
            <div className="bg-white rounded-xl shadow-sm border p-6">
              <ImageForm
                metadata={currentImage.metadata}
                onChange={handleMetadataChange}
              />

              <div className="flex gap-3 mt-6">
                <Button
                  onClick={handleUpload}
                  isLoading={uploading}
                  className="flex-1"
                >
                  업로드
                </Button>
                {pendingImages.length > 1 && currentIndex < pendingImages.length - 1 && (
                  <Button
                    variant="outline"
                    onClick={handleSkip}
                    disabled={uploading}
                  >
                    건너뛰기
                  </Button>
                )}
              </div>
            </div>
          </div>

          {/* Thumbnail Navigation */}
          {pendingImages.length > 1 && (
            <div className="mt-6">
              <p className="text-sm text-gray-600 mb-3">모든 이미지:</p>
              <div className="flex gap-2 overflow-x-auto pb-2">
                {pendingImages.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setCurrentIndex(idx)}
                    className={`relative flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-all ${
                      idx === currentIndex
                        ? 'border-primary-600 ring-2 ring-primary-200'
                        : 'border-gray-200 hover:border-gray-400'
                    }`}
                  >
                    <img
                      src={img.preview}
                      alt={`Thumbnail ${idx + 1}`}
                      className="w-full h-full object-cover"
                    />
                    {img.aiAnalyzed && (
                      <div className="absolute top-0 right-0 bg-purple-600 text-white p-0.5 rounded-bl">
                        <Sparkles className="w-2 h-2" />
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
