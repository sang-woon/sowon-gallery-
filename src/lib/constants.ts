import type { TagOptions } from '@/types';

export const CHARACTERS = [
  { value: 'sowon', label: '소원' },
  { value: 'mom', label: '엄마' },
  { value: 'dad', label: '아빠' },
  { value: 'grandma', label: '할머니' },
  { value: 'grandpa', label: '할아버지' },
  { value: 'baby', label: '아기' },
];

// 감정/표정 필터 (직관적인 이모지와 함께)
export const EMOTIONS = [
  { value: 'happy', label: '기쁨', emoji: '😊' },
  { value: 'excited', label: '신남', emoji: '🎉' },
  { value: 'love', label: '사랑', emoji: '💕' },
  { value: 'surprised', label: '놀람', emoji: '😲' },
  { value: 'confused', label: '당황', emoji: '😅' },
  { value: 'worried', label: '걱정', emoji: '😟' },
  { value: 'thinking', label: '생각중', emoji: '🤔' },
  { value: 'proud', label: '뿌듯', emoji: '😤' },
  { value: 'touched', label: '감동', emoji: '🥹' },
  { value: 'calm', label: '평온', emoji: '😌' },
];

// 행동/상황 필터
export const ACTIONS = [
  { value: 'greeting', label: '인사' },
  { value: 'working', label: '일하기' },
  { value: 'playing', label: '놀기' },
  { value: 'celebrating', label: '축하' },
  { value: 'exercising', label: '운동' },
  { value: 'resting', label: '휴식' },
  { value: 'shopping', label: '쇼핑' },
  { value: 'talking', label: '대화' },
  { value: 'posing', label: '포즈' },
];

// 장면/배경 필터
export const SCENES = [
  { value: 'home', label: '집' },
  { value: 'outdoor', label: '야외' },
  { value: 'office', label: '사무실' },
  { value: 'street', label: '거리' },
  { value: 'simple', label: '단순배경' },
];

// 기존 필터 (호환성 유지)
export const IMAGE_TYPES = [
  { value: 'photo', label: '사진' },
  { value: 'illustration', label: '일러스트' },
  { value: 'icon', label: '아이콘' },
  { value: 'graphic', label: '그래픽' },
  { value: 'character', label: '캐릭터' },
];

export const IMAGE_MOODS = EMOTIONS.map(e => ({ value: e.value, label: e.label }));

export const IMAGE_SHAPES = [
  { value: 'square', label: '정사각형' },
  { value: 'portrait', label: '세로형' },
  { value: 'landscape', label: '가로형' },
  { value: 'banner', label: '배너형' },
  { value: 'story', label: '스토리형' },
];

export const IMAGE_PURPOSES = [
  { value: 'sns', label: 'SNS' },
  { value: 'blog', label: '블로그' },
  { value: 'profile', label: '프로필' },
  { value: 'wallpaper', label: '배경화면' },
  { value: 'print', label: '인쇄물' },
  { value: 'presentation', label: '프레젠테이션' },
];

export const TAG_OPTIONS: TagOptions = {
  characters: CHARACTERS,
  emotions: EMOTIONS,
  actions: ACTIONS,
  scenes: SCENES,
  types: IMAGE_TYPES,
  moods: IMAGE_MOODS,
  shapes: IMAGE_SHAPES,
  purposes: IMAGE_PURPOSES,
};

export const SORT_OPTIONS = [
  { value: 'newest', label: '최신순' },
  { value: 'oldest', label: '오래된순' },
  { value: 'popular', label: '인기순' },
  { value: 'title', label: '이름순' },
];
