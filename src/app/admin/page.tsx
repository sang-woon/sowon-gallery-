'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Upload, Images, LogOut, Plus } from 'lucide-react';
import Button from '@/components/ui/Button';
import { useAuth } from '@/hooks/useAuth';
import { useImages } from '@/hooks/useImages';

export default function AdminDashboardPage() {
  const router = useRouter();
  const { isAuthenticated, loading: authLoading, logout } = useAuth();
  const { images, loading: imagesLoading } = useImages({
    character: '',
    emotion: '',
    action: '',
    scene: '',
    specialFilter: '',
    type: '',
    mood: '',
    shape: '',
    purpose: '',
    search: '',
    sort: 'newest',
  });

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/admin/login/');
    }
  }, [isAuthenticated, authLoading, router]);

  const handleLogout = () => {
    logout();
    router.push('/');
  };

  if (authLoading || !isAuthenticated) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600" />
      </div>
    );
  }

  const totalImages = images.length;
  const recentImages = images.slice(0, 5);

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">관리자 대시보드</h1>
          <p className="text-gray-500 mt-1">이미지를 관리하세요</p>
        </div>
        <div className="flex items-center gap-4">
          <Link href="/admin/upload/">
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              이미지 업로드
            </Button>
          </Link>
          <Button variant="outline" onClick={handleLogout}>
            <LogOut className="w-4 h-4 mr-2" />
            로그아웃
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-xl shadow-sm p-6 border">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-primary-100 rounded-lg">
              <Images className="w-6 h-6 text-primary-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">전체 이미지</p>
              <p className="text-2xl font-bold text-gray-900">
                {imagesLoading ? '...' : totalImages}개
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 border">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-green-100 rounded-lg">
              <Upload className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">이번 달 업로드</p>
              <p className="text-2xl font-bold text-gray-900">
                {imagesLoading ? '...' : countThisMonth(images)}개
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 border">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-blue-100 rounded-lg">
              <Images className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">오늘 업로드</p>
              <p className="text-2xl font-bold text-gray-900">
                {imagesLoading ? '...' : countToday(images)}개
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <Link
          href="/admin/upload/"
          className="bg-white rounded-xl shadow-sm p-6 border hover:shadow-md transition-shadow flex items-center gap-4"
        >
          <div className="p-4 bg-primary-100 rounded-lg">
            <Upload className="w-8 h-8 text-primary-600" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">이미지 업로드</h3>
            <p className="text-sm text-gray-500">새 이미지를 업로드하세요</p>
          </div>
        </Link>

        <Link
          href="/admin/images/"
          className="bg-white rounded-xl shadow-sm p-6 border hover:shadow-md transition-shadow flex items-center gap-4"
        >
          <div className="p-4 bg-green-100 rounded-lg">
            <Images className="w-8 h-8 text-green-600" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">이미지 관리</h3>
            <p className="text-sm text-gray-500">이미지를 수정하거나 삭제하세요</p>
          </div>
        </Link>
      </div>

      {/* Recent Images */}
      <div className="bg-white rounded-xl shadow-sm border">
        <div className="px-6 py-4 border-b">
          <h2 className="font-semibold text-gray-900">최근 업로드</h2>
        </div>
        <div className="p-6">
          {imagesLoading ? (
            <div className="text-center py-8 text-gray-500">로딩 중...</div>
          ) : recentImages.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              아직 업로드된 이미지가 없습니다
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              {recentImages.map((image) => (
                <Link
                  key={image.id}
                  href={`/admin/edit/?id=${image.id}`}
                  className="group relative aspect-square bg-gray-100 rounded-lg overflow-hidden"
                >
                  <img
                    src={`${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/images/${image.file_path}`}
                    alt={image.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                  />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors" />
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function countThisMonth(images: { created_at: string }[]): number {
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  return images.filter(
    (img) => new Date(img.created_at) >= startOfMonth
  ).length;
}

function countToday(images: { created_at: string }[]): number {
  const now = new Date();
  const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  return images.filter(
    (img) => new Date(img.created_at) >= startOfDay
  ).length;
}
