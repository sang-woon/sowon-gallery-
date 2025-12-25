const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');
const sizeOf = require('image-size');

// Supabase config
const SUPABASE_URL = 'https://stcplaupnwqikmewxzuo.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InN0Y3BsYXVwbndxaWttZXd4enVvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjY1ODA0NDgsImV4cCI6MjA4MjE1NjQ0OH0.Ate1iman3w5Cnz5qhy_N0yjREnOmrHCOBwvR8mchR3o';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Character mapping from filename prefix
const CHARACTER_MAP = {
  'baby': 'baby',
  'father': 'dad',
  'grandfather': 'grandpa',
  'grandmother': 'grandma',
  'mother': 'mom',
  'sowonee': 'sowon',
};

// Mood mapping from filename keywords
const MOOD_MAP = {
  'celebrate': 'bright',
  'smile': 'cute',
  'cute': 'cute',
  'dance': 'energetic',
  'dreaming': 'warm',
  'curious': 'cute',
  'confused': 'calm',
  'memo': 'calm',
  'surprised': 'bright',
  'thumbsup': 'bright',
  'touched': 'warm',
  'working': 'calm',
  'laugh': 'bright',
  'proud': 'bright',
  'shocked': 'bright',
  'bow': 'warm',
  'greeting': 'warm',
  'kind': 'warm',
  'shopping': 'bright',
  'worried': 'calm',
  'exercise': 'energetic',
  'heart': 'warm',
  'rest': 'calm',
  'tears': 'warm',
  'buffering': 'calm',
  'candidate': 'bright',
  'conference': 'calm',
  'default': 'cute',
  'street': 'bright',
  'family': 'warm',
  'home': 'warm',
  'lcc': 'bright',
  'main': 'cute',
  'mosaic': 'bright',
  'pph': 'bright',
  'selfie': 'cute',
  'shh': 'cute',
  'thinking': 'calm',
  'custom': 'warm',
  'end': 'calm',
};

// Korean title mapping
const TITLE_MAP = {
  'celebrate': '축하',
  'smile': '미소',
  'cute': '귀여움',
  'dance': '춤',
  'dreaming': '꿈꾸는',
  'curious': '호기심',
  'confused': '혼란',
  'memo': '메모',
  'surprised': '놀람',
  'thumbsup': '엄지척',
  'touched': '감동',
  'working': '일하는',
  'laugh': '웃음',
  'proud': '자랑스러운',
  'shocked': '충격',
  'bow': '인사',
  'greeting': '인사',
  'kind': '친절한',
  'shopping': '쇼핑',
  'worried': '걱정',
  'exercise': '운동',
  'heart': '하트',
  'rest': '휴식',
  'tears': '눈물',
  'buffering': '버퍼링',
  'candidate': '후보',
  'conference': '회의',
  'default': '기본',
  'street': '거리',
  'family': '가족',
  'home': '홈',
  'lcc': 'LCC',
  'main': '메인',
  'mosaic': '모자이크',
  'pph': 'PPH',
  'selfie': '셀피',
  'shh': '쉿',
  'thinking': '생각',
  'custom': '커스텀',
  'end': '끝',
};

const CHARACTER_KOREAN = {
  'baby': '아기',
  'dad': '아빠',
  'grandpa': '할아버지',
  'grandma': '할머니',
  'mom': '엄마',
  'sowon': '소원이',
};

function parseFilename(filename) {
  const nameWithoutExt = filename.replace(/\.(png|jpg|jpeg|gif|webp)$/i, '');
  const parts = nameWithoutExt.split('_');

  // Get character from first part
  const charKey = parts[0].toLowerCase();
  const character = CHARACTER_MAP[charKey] || 'sowon';

  // Get action/mood from remaining parts
  const actionParts = parts.slice(1);
  let action = actionParts[0] || 'default';
  let number = '';

  // Check if last part is a number
  if (actionParts.length > 1) {
    const lastPart = actionParts[actionParts.length - 1];
    if (/^\d+$/.test(lastPart)) {
      number = lastPart;
      action = actionParts.slice(0, -1).join('_');
    } else {
      action = actionParts.join('_');
    }
  }

  const mood = MOOD_MAP[action.split('_')[0]] || 'cute';
  const titleAction = TITLE_MAP[action.split('_')[0]] || action;
  const charKorean = CHARACTER_KOREAN[character];

  let title = `${charKorean} ${titleAction}`;
  if (number) {
    title += ` ${number}`;
  }

  return {
    character,
    mood,
    title,
    action,
  };
}

function getImageShape(width, height) {
  const ratio = width / height;

  if (ratio >= 1.8) return 'banner';
  if (ratio >= 1.2) return 'landscape';
  if (ratio <= 0.6) return 'story';
  if (ratio <= 0.85) return 'portrait';
  return 'square';
}

async function uploadImage(filePath, filename) {
  try {
    // Read file
    const fileBuffer = fs.readFileSync(filePath);
    const fileExt = path.extname(filename).toLowerCase();
    const contentType = fileExt === '.jpg' || fileExt === '.jpeg'
      ? 'image/jpeg'
      : 'image/png';

    // Get image dimensions
    let width = 512, height = 512;
    try {
      const dimensions = sizeOf(filePath);
      width = dimensions.width || 512;
      height = dimensions.height || 512;
    } catch (e) {
      console.log(`Could not get dimensions for ${filename}, using defaults`);
    }

    // Parse filename for metadata
    const { character, mood, title, action } = parseFilename(filename);
    const shape = getImageShape(width, height);

    // Generate unique storage path
    const storagePath = `uploads/${Date.now()}_${filename}`;

    // Upload to Supabase Storage
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('images')
      .upload(storagePath, fileBuffer, {
        contentType,
        upsert: false,
      });

    if (uploadError) {
      console.error(`Upload error for ${filename}:`, uploadError.message);
      return null;
    }

    // Create database record
    const imageRecord = {
      title,
      description: `${CHARACTER_KOREAN[character]} 캐릭터 - ${action}`,
      file_path: storagePath,
      file_name: filename,
      width,
      height,
      character,
      image_type: 'character',
      image_mood: mood,
      image_shape: shape,
      image_purpose: 'sns',
      is_visible: true,
      likes: 0,
    };

    const { data: dbData, error: dbError } = await supabase
      .from('images')
      .insert(imageRecord)
      .select()
      .single();

    if (dbError) {
      console.error(`DB error for ${filename}:`, dbError.message);
      // Try to delete uploaded file
      await supabase.storage.from('images').remove([storagePath]);
      return null;
    }

    console.log(`✓ Uploaded: ${filename} -> ${title}`);
    return dbData;

  } catch (error) {
    console.error(`Error processing ${filename}:`, error.message);
    return null;
  }
}

async function main() {
  const imagesDir = path.join(__dirname, '..', 'downloaded-images');

  if (!fs.existsSync(imagesDir)) {
    console.error('downloaded-images directory not found');
    process.exit(1);
  }

  const files = fs.readdirSync(imagesDir)
    .filter(f => /\.(png|jpg|jpeg|gif|webp)$/i.test(f));

  console.log(`Found ${files.length} images to upload\n`);

  let success = 0;
  let failed = 0;

  for (const filename of files) {
    const filePath = path.join(imagesDir, filename);
    const result = await uploadImage(filePath, filename);

    if (result) {
      success++;
    } else {
      failed++;
    }

    // Small delay to avoid rate limiting
    await new Promise(r => setTimeout(r, 100));
  }

  console.log(`\n========================================`);
  console.log(`Upload complete!`);
  console.log(`Success: ${success}`);
  console.log(`Failed: ${failed}`);
  console.log(`========================================`);
}

main().catch(console.error);
