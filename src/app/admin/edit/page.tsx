'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import Button from '@/components/ui/Button';
import ImageForm from '@/components/admin/ImageForm';
import { useAuth } from '@/hooks/useAuth';
import { useImage } from '@/hooks/useImages';
import { useUpload } from '@/hooks/useUpload';
import { getImageUrl } from '@/lib/supabase';
import { Suspense } from 'react';

function EditPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const id = searchParams.get('id') || '';

  const { isAuthenticated, loading: authLoading } = useAuth();
  const { image, loading: imageLoading, error: imageError } = useImage(id);
  const { updateImage } = useUpload();

  const [metadata, setMetadata] = useState({
    title: '',
    description: '',
    character: '',
    image_type: '',
    image_mood: '',
    image_shape: '',
    image_purpose: '',
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/admin/login/');
    }
  }, [isAuthenticated, authLoading, router]);

  useEffect(() => {
    if (image) {
      setMetadata({
        title: image.title || '',
        description: image.description || '',
        character: image.character || '',
        image_type: image.image_type || '',
        image_mood: image.image_mood || '',
        image_shape: image.image_shape || '',
        image_purpose: image.image_purpose || '',
      });
    }
  }, [image]);

  const handleChange = (field: keyof typeof metadata, value: string) => {
    setMetadata((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await updateImage(id, metadata);
      router.push('/admin/images/');
    } catch (err) {
      console.error('Update failed:', err);
      alert('수정에 실패했습니다');
    } finally {
      setSaving(false);
    }
  };

  if (authLoading || !isAuthenticated) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600" />
      </div>
    );
  }

  if (!id) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center py-16">
          <p className="text-red-500 mb-4">이미지 ID가 필요합니다</p>
          <Link href="/admin/images/">
            <Button variant="outline">목록으로 돌아가기</Button>
          </Link>
        </div>
      </div>
    );
  }

  if (imageLoading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600" />
      </div>
    );
  }

  if (imageError || !image) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center py-16">
          <p className="text-red-500 mb-4">이미지를 찾을 수 없습니다</p>
          <Link href="/admin/images/">
            <Button variant="outline">목록으로 돌아가기</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <Link
          href="/admin/images/"
          className="p-2 text-gray-600 hover:text-gray-900 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">이미지 수정</h1>
          <p className="text-gray-500">이미지 정보를 수정하세요</p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto">
        <div className="grid md:grid-cols-2 gap-8">
          {/* Preview */}
          <div className="bg-white rounded-xl shadow-sm border p-4">
            <img
              src={getImageUrl(image.file_path)}
              alt={image.title}
              className="w-full rounded-lg object-contain max-h-[400px]"
            />
            <div className="mt-4 text-sm text-gray-500">
              <p>파일명: {image.file_name}</p>
              {image.width && image.height && (
                <p>크기: {image.width} x {image.height}</p>
              )}
              <p>등록일: {new Date(image.created_at).toLocaleDateString('ko-KR')}</p>
            </div>
          </div>

          {/* Form */}
          <div className="bg-white rounded-xl shadow-sm border p-6">
            <ImageForm metadata={metadata} onChange={handleChange} />

            <div className="flex gap-3 mt-6">
              <Button
                onClick={handleSave}
                isLoading={saving}
                className="flex-1"
              >
                저장
              </Button>
              <Link href="/admin/images/">
                <Button variant="outline" disabled={saving}>
                  취소
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function AdminEditPage() {
  return (
    <Suspense fallback={
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600" />
      </div>
    }>
      <EditPageContent />
    </Suspense>
  );
}
