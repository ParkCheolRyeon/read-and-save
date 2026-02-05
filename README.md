# 이북 리더 (PWA)

Next.js 기반 PWA 이북 리더입니다. `public/books/`에 마크다운 파일을 넣으면 책 목록으로 보여주고, 세로 스크롤 스냅으로 이북처럼 읽을 수 있습니다.

## 기능

- **정적 로그인**: ID/비밀번호 클라이언트 검증 (DB 없음)
- **책 목록**: `public/books/manifest.json`에 등록된 MD 파일 목록 표시
- **리더**: MD 파싱(GFM), 세로 스크롤 스냅, 로딩 스피너
- **PWA**: Web App Manifest + Service Worker, 홈 화면에 추가 가능

## 로그인

- ID: `pcr`
- 비밀번호: `1q2w3e4r!@#`

(세션은 `sessionStorage`에 저장되며, 브라우저를 닫으면 초기화됩니다.)

## 책 추가 방법

1. 마크다운 파일을 `public/books/`에 넣습니다. (예: `03-my-book.md`)
2. `public/books/manifest.json`을 열어 파일명을 배열에 추가합니다.

   ```json
   ["01-sample.md", "02-another.md", "03-my-book.md"]
   ```

## PWA로 앱처럼 사용하기 (iPhone)

1. **Safari**에서 이 사이트를 엽니다.
2. 하단 **공유** 버튼을 누릅니다.
3. **"홈 화면에 추가"**를 선택합니다.
4. 이름을 확인한 뒤 **추가**를 누릅니다.

홈 화면에 생긴 아이콘을 탭하면 주소창 없이 풀스크린으로 실행되어 앱처럼 사용할 수 있습니다.

- **오프라인**: Service Worker가 켜져 있으면 일부 페이지/자원이 캐시될 수 있으나, iOS Safari의 오프라인 지원은 제한적일 수 있습니다.
- **앱처럼 보이기**: Manifest의 `display: standalone`과 `theme_color`로 브라우저 UI 없이 실행됩니다.

## 개발

```bash
npm install
npm run dev
```

브라우저에서 http://localhost:3000 을 엽니다. (개발 모드에서는 PWA Service Worker가 비활성화됩니다.)

## 빌드 및 배포

```bash
npm run build -- --webpack
npm run start
```

PWA 플러그인이 Webpack을 사용하므로 **`--webpack`** 옵션으로 빌드해야 합니다.

### Vercel 배포

1. 이 저장소를 Vercel에 연결합니다.
2. Build Command에 `next build --webpack` 를 설정합니다. (또는 `package.json`의 `build` 스크립트를 `"next build --webpack"` 로 변경)
3. 배포가 완료되면 프로젝트 설정 → **Domains**에서 개인 도메인을 추가합니다.
4. 도메인 제공처에서 CNAME(또는 A 레코드)을 Vercel이 안내한 값으로 설정합니다.

개인 도메인 연결 후 HTTPS로 접속하면 PWA(홈 화면에 추가)가 정상 동작합니다.

## 기술 스택

- Next.js 16 (App Router), TypeScript
- Tailwind CSS v4, @tailwindcss/typography
- react-markdown, remark-gfm
- @ducanh2912/next-pwa (Service Worker)
- lucide-react (아이콘)
