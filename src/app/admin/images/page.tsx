'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Trash2, Edit, Search } from 'lucide-react';
import Button from '@/components/ui/Button';
import Modal from '@/components/ui/Modal';
import { useAuth } from '@/hooks/useAuth';
import { useImages } from '@/hooks/useImages';
import { useUpload } from '@/hooks/useUpload';
import { getImageUrl } from '@/lib/supabase';
import { TAG_OPTIONS } from '@/lib/constants';
import type { Image } from '@/types';

export default function AdminImagesPage() {
  const router = useRouter();
  const { isAuthenticated, loading: authLoading } = useAuth();
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
  const { deleteImage } = useUpload();

  const [searchTerm, setSearchTerm] = useState('');
  const [deleteTarget, setDeleteTarget] = useState<Image | null>(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/admin/login/');
    }
  }, [isAuthenticated, authLoading, router]);

  const filteredImages = images.filter(
    (img) =>
      img.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      img.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleDelete = async () => {
    if (!deleteTarget) return;

    setDeleting(true);
    try {
      await deleteImage(deleteTarget.id, deleteTarget.file_path);
      setDeleteTarget(null);
      // Refresh the page to update the list
      window.location.reload();
    } catch (err) {
      console.error('Delete failed:', err);
      alert('삭제에 실패했습니다');
    } finally {
      setDeleting(false);
    }
  };

  if (authLoading || !isAuthenticated) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600" />
      </div>
    );
  }

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
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-gray-900">이미지 관리</h1>
          <p className="text-gray-500">이미지를 수정하거나 삭제하세요</p>
        </div>
      </div>

      {/* Search */}
      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="이미지 검색..."
          className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
        />
      </div>

      {/* Images table */}
      <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
        {imagesLoading ? (
          <div className="text-center py-16 text-gray-500">로딩 중...</div>
        ) : filteredImages.length === 0 ? (
          <div className="text-center py-16 text-gray-500">
            이미지가 없습니다
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">
                    이미지
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">
                    제목
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">
                    캐릭터
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">
                    등록일
                  </th>
                  <th className="px-4 py-3 text-right text-sm font-medium text-gray-600">
                    작업
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {filteredImages.map((image) => (
                  <tr key={image.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <div className="w-16 h-16 bg-gray-100 rounded-lg overflow-hidden">
                        <img
                          src={getImageUrl(image.file_path)}
                          alt={image.title}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="font-medium text-gray-900">
                        {image.title}
                      </div>
                      {image.description && (
                        <div className="text-sm text-gray-500 truncate max-w-xs">
                          {image.description}
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      {image.character && (
                        <span className="px-2 py-1 bg-primary-100 text-primary-700 text-sm rounded-full">
                          {TAG_OPTIONS.characters.find(
                            (c) => c.value === image.character
                          )?.label || image.character}
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">
                      {new Date(image.created_at).toLocaleDateString('ko-KR')}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex justify-end gap-2">
                        <Link href={`/admin/edit/?id=${image.id}`}>
                          <Button variant="ghost" size="sm">
                            <Edit className="w-4 h-4" />
                          </Button>
                        </Link>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setDeleteTarget(image)}
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Delete confirmation modal */}
      <Modal
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        title="이미지 삭제"
        size="sm"
      >
        <div className="p-6">
          <p className="text-gray-600 mb-6">
            <strong>&ldquo;{deleteTarget?.title}&rdquo;</strong>을(를) 삭제하시겠습니까?
            <br />
            <span className="text-sm text-red-500">
              이 작업은 되돌릴 수 없습니다.
            </span>
          </p>
          <div className="flex gap-3">
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => setDeleteTarget(null)}
              disabled={deleting}
            >
              취소
            </Button>
            <Button
              variant="danger"
              className="flex-1"
              onClick={handleDelete}
              isLoading={deleting}
            >
              삭제
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
