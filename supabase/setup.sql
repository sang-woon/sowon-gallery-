-- =====================================================
-- SOWONEE Gallery - Supabase 데이터베이스 설정
-- =====================================================

-- 1. images 테이블 생성
CREATE TABLE IF NOT EXISTS images (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(255) NOT NULL,
    description TEXT,
    file_path VARCHAR(500) NOT NULL,
    file_name VARCHAR(255) NOT NULL,
    width INTEGER,
    height INTEGER,

    -- 필터 메타데이터
    character VARCHAR(50),       -- sowon, mom, dad, grandma, grandpa, baby
    image_type VARCHAR(50),      -- photo, illustration, icon, graphic, character
    image_mood VARCHAR(50),      -- bright, dark, warm, cool, cute, elegant, playful
    image_shape VARCHAR(50),     -- square, portrait, landscape, banner, story
    image_purpose VARCHAR(50),   -- sns, blog, profile, wallpaper, thumbnail, banner

    tags TEXT[],
    likes INTEGER DEFAULT 0,
    is_visible BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. 인덱스 생성
CREATE INDEX IF NOT EXISTS idx_images_character ON images(character);
CREATE INDEX IF NOT EXISTS idx_images_type ON images(image_type);
CREATE INDEX IF NOT EXISTS idx_images_mood ON images(image_mood);
CREATE INDEX IF NOT EXISTS idx_images_shape ON images(image_shape);
CREATE INDEX IF NOT EXISTS idx_images_purpose ON images(image_purpose);
CREATE INDEX IF NOT EXISTS idx_images_visible ON images(is_visible);
CREATE INDEX IF NOT EXISTS idx_images_created_at ON images(created_at DESC);

-- 3. RLS (Row Level Security) 활성화
ALTER TABLE images ENABLE ROW LEVEL SECURITY;

-- 4. RLS 정책 설정
-- 읽기: 모든 사용자 (is_visible = true인 것만)
CREATE POLICY "Public can view visible images"
    ON images FOR SELECT
    USING (is_visible = true);

-- 쓰기: anon 키로 허용 (앱 레벨에서 비밀번호로 보호)
CREATE POLICY "Allow insert for anon"
    ON images FOR INSERT
    WITH CHECK (true);

CREATE POLICY "Allow update for anon"
    ON images FOR UPDATE
    USING (true)
    WITH CHECK (true);

CREATE POLICY "Allow delete for anon"
    ON images FOR DELETE
    USING (true);

-- =====================================================
-- Storage 버킷 설정 (Supabase Dashboard에서 수동 설정 필요)
-- =====================================================
-- 1. Storage > New bucket 클릭
-- 2. 버킷 이름: images
-- 3. Public bucket: 체크 (공개 읽기 허용)
-- 4. File size limit: 10MB
-- 5. Allowed MIME types: image/jpeg, image/png, image/gif, image/webp

-- Storage RLS 정책 (Supabase Dashboard > Storage > Policies에서 설정)
-- SELECT (읽기): 모든 사용자 허용
-- INSERT (업로드): 모든 사용자 허용 (앱 레벨에서 인증)
-- DELETE (삭제): 모든 사용자 허용 (앱 레벨에서 인증)
