'use client';

import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import { TAG_OPTIONS } from '@/lib/constants';

interface ImageMetadata {
  title: string;
  description: string;
  character: string;
  image_type: string;
  image_mood: string;
  image_shape: string;
  image_purpose: string;
}

interface ImageFormProps {
  metadata: ImageMetadata;
  onChange: (field: keyof ImageMetadata, value: string) => void;
}

export default function ImageForm({ metadata, onChange }: ImageFormProps) {
  return (
    <div className="space-y-4">
      <Input
        label="제목"
        value={metadata.title}
        onChange={(e) => onChange('title', e.target.value)}
        placeholder="이미지 제목"
        required
      />

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          설명
        </label>
        <textarea
          value={metadata.description}
          onChange={(e) => onChange('description', e.target.value)}
          placeholder="이미지 설명 (선택)"
          rows={3}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm
                     focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500
                     resize-none"
        />
      </div>

      <Select
        label="캐릭터"
        value={metadata.character}
        onChange={(e) => onChange('character', e.target.value)}
        options={TAG_OPTIONS.characters}
        placeholder="캐릭터 선택"
      />

      <div className="grid grid-cols-2 gap-4">
        <Select
          label="유형"
          value={metadata.image_type}
          onChange={(e) => onChange('image_type', e.target.value)}
          options={TAG_OPTIONS.types}
          placeholder="유형 선택"
        />

        <Select
          label="느낌"
          value={metadata.image_mood}
          onChange={(e) => onChange('image_mood', e.target.value)}
          options={TAG_OPTIONS.moods}
          placeholder="느낌 선택"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Select
          label="형태"
          value={metadata.image_shape}
          onChange={(e) => onChange('image_shape', e.target.value)}
          options={TAG_OPTIONS.shapes}
          placeholder="형태 선택"
        />

        <Select
          label="용도"
          value={metadata.image_purpose}
          onChange={(e) => onChange('image_purpose', e.target.value)}
          options={TAG_OPTIONS.purposes}
          placeholder="용도 선택"
        />
      </div>
    </div>
  );
}
