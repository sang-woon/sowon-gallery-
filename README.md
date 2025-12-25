# SOWONEE Gallery

소원이 가족 캐릭터 이미지 관리 서비스

## 기술 스택

- **Frontend**: Next.js 16 (Static Export) + TypeScript
- **Database**: Supabase PostgreSQL
- **Storage**: Supabase Storage
- **Styling**: Tailwind CSS
- **Hosting**: GitHub Pages

## 기능

### 일반 사용자
- 이미지 갤러리 조회
- 다양한 필터 검색 (캐릭터, 유형, 느낌, 형태, 용도)
- Lightbox로 이미지 상세 보기
- 이미지 다운로드

### 관리자
- 비밀번호 로그인
- 이미지 업로드 (다중, 드래그앤드롭)
- 이미지 메타데이터 수정
- 이미지 삭제

## 설치 및 실행

```bash
# 의존성 설치
npm install

# 개발 서버 실행
npm run dev

# 빌드
npm run build
```

## 환경변수 설정

`.env.local` 파일 생성:

```env
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
NEXT_PUBLIC_ADMIN_PASSWORD=your-admin-password
NEXT_PUBLIC_OPENAI_API_KEY=your-openai-api-key  # AI 태그 추천 기능 (선택)
```

### AI 태그 추천 기능 (선택사항)
OpenAI API 키를 설정하면 이미지 업로드 시 AI가 자동으로 태그를 추천합니다:
- 캐릭터 자동 인식 (소원, 엄마, 아빠 등)
- 이미지 유형 분류 (사진, 일러스트, 아이콘 등)
- 분위기/느낌 분석 (밝은, 따뜻한, 귀여운 등)
- 이미지 형태 감지 (정사각형, 세로형, 가로형)
- 용도 추천 (SNS, 블로그, 프로필 등)

## Supabase 설정

### 1. Supabase 프로젝트 생성
1. https://supabase.com 에서 새 프로젝트 생성
2. Project Settings > API에서 URL과 anon key 확인

### 2. 데이터베이스 테이블 생성
SQL Editor에서 `supabase/setup.sql` 파일 내용 실행

### 3. Storage 버킷 생성
1. Storage > New bucket
2. 버킷 이름: `images`
3. Public bucket: 체크

### 4. Storage 정책 설정
Storage > Policies에서 다음 정책 추가:
- SELECT: 모든 사용자 허용
- INSERT: 모든 사용자 허용
- DELETE: 모든 사용자 허용

## GitHub Pages 배포

### 1. GitHub Repository 생성
`sowonee-gallery` 이름으로 레포지토리 생성

### 2. GitHub Secrets 설정
Repository Settings > Secrets and variables > Actions에서 추가:
- `SUPABASE_URL`: Supabase 프로젝트 URL
- `SUPABASE_ANON_KEY`: Supabase anon key
- `ADMIN_PASSWORD`: 관리자 비밀번호
- `OPENAI_API_KEY`: OpenAI API 키 (AI 태그 추천 기능 사용 시)

### 3. GitHub Pages 활성화
Settings > Pages에서:
- Source: GitHub Actions 선택

### 4. 배포
```bash
git add .
git commit -m "Initial commit"
git push origin main
```
main 브랜치에 push하면 자동으로 배포됩니다.

## 디렉토리 구조

```
sowonee-gallery/
├── .github/workflows/deploy.yml  # 자동 배포
├── src/
│   ├── app/                      # 페이지
│   ├── components/               # 컴포넌트
│   ├── hooks/                    # React 훅
│   ├── lib/                      # 유틸리티
│   └── types/                    # TypeScript 타입
├── supabase/setup.sql            # DB 스키마
└── next.config.js                # Next.js 설정
```

## 접속 URL

배포 후: `https://[username].github.io/sowonee-gallery`
