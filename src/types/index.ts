export interface Image {
  id: string;
  title: string;
  description: string | null;
  file_path: string;
  file_name: string;
  width: number | null;
  height: number | null;
  character: string | null;
  image_type: string | null;
  image_mood: string | null;
  image_shape: string | null;
  image_purpose: string | null;
  tags: string[] | null;
  likes: number;
  is_visible: boolean;
  created_at: string;
  updated_at: string;
}

export interface FilterState {
  character: string;
  emotion: string;
  action: string;
  scene: string;
  search: string;
  sort: 'newest' | 'oldest' | 'popular' | 'title';
  // 특수 필터 (인기/즐겨찾기)
  specialFilter: '' | 'popular' | 'favorites';
  // 기존 필터 (호환성 유지)
  type: string;
  mood: string;
  shape: string;
  purpose: string;
}

export interface TagOption {
  value: string;
  label: string;
}

export interface EmotionOption extends TagOption {
  emoji: string;
}

export interface TagOptions {
  characters: TagOption[];
  emotions: EmotionOption[];
  actions: TagOption[];
  scenes: TagOption[];
  // 기존 필터 (호환성 유지)
  types: TagOption[];
  moods: TagOption[];
  shapes: TagOption[];
  purposes: TagOption[];
}
