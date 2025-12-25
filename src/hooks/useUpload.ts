'use client';

import { useState, useCallback } from 'react';
import { getSupabase } from '@/lib/supabase';
import type { Image } from '@/types';

interface UploadProgress {
  fileName: string;
  progress: number;
  status: 'pending' | 'uploading' | 'success' | 'error';
  error?: string;
}

interface ImageMetadata {
  title: string;
  description?: string;
  character?: string;
  image_type?: string;
  image_mood?: string;
  image_shape?: string;
  image_purpose?: string;
  tags?: string[];
}

export function useUpload() {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState<UploadProgress[]>([]);

  const uploadImage = useCallback(
    async (file: File, metadata: ImageMetadata): Promise<Image | null> => {
      const supabase = getSupabase();
      const fileName = `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
      const filePath = `gallery/${fileName}`;

      try {
        // Upload to Supabase Storage
        const { error: uploadError } = await supabase.storage
          .from('images')
          .upload(filePath, file, {
            cacheControl: '3600',
            upsert: false,
          });

        if (uploadError) {
          throw uploadError;
        }

        // Get image dimensions
        const dimensions = await getImageDimensions(file);

        // Insert into database
        const { data, error: insertError } = await supabase
          .from('images')
          .insert({
            title: metadata.title,
            description: metadata.description || null,
            file_path: filePath,
            file_name: file.name,
            width: dimensions.width,
            height: dimensions.height,
            character: metadata.character || null,
            image_type: metadata.image_type || null,
            image_mood: metadata.image_mood || null,
            image_shape: metadata.image_shape || null,
            image_purpose: metadata.image_purpose || null,
            tags: metadata.tags || null,
          })
          .select()
          .single();

        if (insertError) {
          // Clean up uploaded file on error
          await supabase.storage.from('images').remove([filePath]);
          throw insertError;
        }

        return data;
      } catch (err) {
        console.error('Upload error:', err);
        throw err;
      }
    },
    []
  );

  const uploadMultiple = useCallback(
    async (
      files: File[],
      getMetadata: (file: File, index: number) => ImageMetadata
    ): Promise<(Image | null)[]> => {
      setUploading(true);
      setProgress(
        files.map((file) => ({
          fileName: file.name,
          progress: 0,
          status: 'pending' as const,
        }))
      );

      const results: (Image | null)[] = [];

      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const metadata = getMetadata(file, i);

        setProgress((prev) =>
          prev.map((p, idx) =>
            idx === i ? { ...p, status: 'uploading' as const, progress: 50 } : p
          )
        );

        try {
          const result = await uploadImage(file, metadata);
          results.push(result);
          setProgress((prev) =>
            prev.map((p, idx) =>
              idx === i
                ? { ...p, status: 'success' as const, progress: 100 }
                : p
            )
          );
        } catch (err) {
          results.push(null);
          setProgress((prev) =>
            prev.map((p, idx) =>
              idx === i
                ? {
                    ...p,
                    status: 'error' as const,
                    error:
                      err instanceof Error ? err.message : 'Upload failed',
                  }
                : p
            )
          );
        }
      }

      setUploading(false);
      return results;
    },
    [uploadImage]
  );

  const updateImage = useCallback(
    async (id: string, updates: Partial<ImageMetadata>): Promise<Image | null> => {
      const supabase = getSupabase();
      try {
        const { data, error } = await supabase
          .from('images')
          .update({
            ...updates,
            updated_at: new Date().toISOString(),
          })
          .eq('id', id)
          .select()
          .single();

        if (error) {
          throw error;
        }

        return data;
      } catch (err) {
        console.error('Update error:', err);
        throw err;
      }
    },
    []
  );

  const deleteImage = useCallback(async (id: string, filePath: string): Promise<void> => {
    const supabase = getSupabase();
    try {
      // Delete from storage
      const { error: storageError } = await supabase.storage
        .from('images')
        .remove([filePath]);

      if (storageError) {
        console.error('Storage delete error:', storageError);
      }

      // Delete from database
      const { error: dbError } = await supabase
        .from('images')
        .delete()
        .eq('id', id);

      if (dbError) {
        throw dbError;
      }
    } catch (err) {
      console.error('Delete error:', err);
      throw err;
    }
  }, []);

  return {
    uploading,
    progress,
    uploadImage,
    uploadMultiple,
    updateImage,
    deleteImage,
  };
}

async function getImageDimensions(
  file: File
): Promise<{ width: number; height: number }> {
  return new Promise((resolve) => {
    const img = new window.Image();
    img.onload = () => {
      resolve({ width: img.width, height: img.height });
      URL.revokeObjectURL(img.src);
    };
    img.onerror = () => {
      resolve({ width: 0, height: 0 });
      URL.revokeObjectURL(img.src);
    };
    img.src = URL.createObjectURL(file);
  });
}
