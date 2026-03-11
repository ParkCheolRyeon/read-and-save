# Interview Content Validation

검증 일자: 2026-03-11

## 범위

- `public/books/*.mdx` 10개 챕터를 기준으로 구조와 답변 내용을 점검했다.
- 모든 문장을 논문 수준으로 증명한 것은 아니고, 면접에서 오답 가능성이 높은 항목을 우선적으로 공식 문서와 대조했다.
- 10장 `프로젝트 맞춤 20문항`은 포트폴리오/실무 경험 의존 문항이 많아서 외부 공식 문서로 사실 여부를 확정할 수 없다.

## 이번에 직접 수정한 항목

1. `js-20.mdx`
   - 화살표 함수의 `arguments` 설명을 수정했다.
   - 화살표 함수는 **자기 자신의 `arguments`를 만들지 않고**, 바깥 함수의 `arguments`를 캡처할 수 있다.

2. `react-20.mdx`
   - `useEffect` 실행 시점을 더 정확하게 고쳤다.
   - 보통 paint 이후로 설명해도 되지만, **상호작용으로 발생한 Effect는 paint 이전에 실행될 수 있다**는 공식 문서의 단서를 반영했다.

3. `network-20.mdx`
   - preflight 예시에서 `application/json` 표현을 더 분명히 했다.
   - `Content-Type: application/json`은 simple request 조건에서 벗어난다.

4. `cs-20.mdx`
   - 배열 설명을 JS 런타임에 대한 단정처럼 읽히지 않도록 조정했다.
   - “전통적인 배열 설명”이라는 표현으로 바꿨다.

## 확인됨

### JavaScript

- `var / let / const`, TDZ, 호이스팅 설명의 큰 방향은 맞다.
- 클로저, 렉시컬 스코프, `this`, 프로토타입 체인, 이벤트 루프, Promise 조합 함수 설명도 면접 답변 수준에서 타당하다.
- `AbortController`를 요청 취소와 race condition 방지에 연결한 설명도 적절하다.

### TypeScript

- `interface` vs `type`, `any / unknown / never`, 제네릭, narrowing, utility types 설명은 공식 핸드북과 부합한다.
- `optional property`와 `undefined`의 차이를 따로 설명한 흐름도 적절하다.
- Zod를 “런타임 경계 검증”으로 설명한 방향도 적절하다.

### React

- render / commit, state snapshot, 부모 렌더 시 자식 렌더 기본값, `memo`, `useMemo`, `useCallback`, controlled / uncontrolled, `key`, lifting state up 설명은 공식 문서와 맞는다.
- 에러 바운더리를 “렌더 트리 복구용 안전장치”로 설명한 방향도 타당하다.

### Next.js

- App Router와 Pages Router의 차이, Server / Client Component 경계, `use client` 비용, Metadata API, Route Handlers, Server Actions, Proxy 설명의 큰 방향은 맞다.
- 인증/인가에서 Proxy를 1차 UX 가드로만 두고 실제 검사는 데이터 계층 가까이서 하라는 설명도 공식 가이드와 맞는다.

### 네트워크 / 인프라 / 테스트 / 성능

- HTTP/HTTPS, TLS 개요, CORS, 캐시 헤더, timeout/retry/backoff, CDN, Docker image/container, multi-stage build, S3/EC2/CloudFront 역할, 테스트 레벨 구분, flaky test, Core Web Vitals, LCP/CLS 설명의 핵심 방향은 맞다.

## 애매하거나 단정적으로 말하면 안 되는 항목

1. `var`가 “전역 객체 프로퍼티가 된다”는 설명
   - **classic script의 전역 범위**에서는 대체로 맞지만, ES module이나 다른 실행 문맥까지 일반화하면 과하다.

2. `Virtual DOM`
   - React 공식 문서의 중심 용어라기보다 **설명용 개념어**에 가깝다.
   - 면접에서는 “렌더 단계에서 계산한 다음 UI 표현” 정도로 설명하면 충분하다.

3. Next.js 캐싱 기본값
   - App Router의 fetch/cache 설명은 **버전 의존성이 높다**.
   - 답변할 때는 “Next 16 기준”처럼 버전을 붙이거나, “정적 prerender / data cache / revalidate 조합”으로 설명하는 편이 안전하다.

4. `structuredClone`
   - 요즘 브라우저와 최신 Node 런타임에서는 널리 지원되지만, **실행 환경에 따라 지원 여부를 확인해야 한다**고 덧붙이면 더 안전하다.

5. `PATCH`의 멱등성
   - “PATCH는 비멱등”이라고 단정하기보다, **설계에 따라 달라질 수 있다**고 말하는 편이 맞다.
   - 현재 본문도 이 방향이라 괜찮다.

6. 배열의 “메모리상 연속 구조”
   - 자료구조 설명으로는 유효하지만, **JS 엔진 내부 표현을 그대로 단정하는 문장**으로 읽히면 과장될 수 있다.

7. 테스트 / 네트워크 / 운영 UX 관련 답변 다수
   - 이 영역은 단일 정답보다 **판단 기준과 trade-off**가 중요하다.
   - 면접에서는 “왜 그렇게 선택했는지”를 말해야 강해진다.

8. `프로젝트 맞춤 20문항`
   - 기술 문법 검증 대상이 아니라 **실제 포트폴리오 경험과 일치해야 하는 문항**이다.
   - 이력서 사실관계와 어긋나면 가장 큰 리스크가 된다.

## 확인에 사용한 공식 문서

- MDN Hoisting: https://developer.mozilla.org/en-US/docs/Glossary/Hoisting
- MDN Arrow functions: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Functions/Arrow_functions
- TypeScript Handbook, Interfaces: https://www.typescriptlang.org/docs/handbook/interfaces.html
- TypeScript Handbook, Narrowing: https://www.typescriptlang.org/docs/handbook/2/narrowing.html
- TypeScript Handbook, Functions / Overloads: https://www.typescriptlang.org/docs/handbook/2/functions.html
- TypeScript Handbook, Utility Types: https://www.typescriptlang.org/docs/handbook/utility-types.html
- React, Render and Commit: https://react.dev/learn/render-and-commit
- React, State as a Snapshot: https://react.dev/learn/state-as-a-snapshot
- React, useEffect: https://react.dev/reference/react/useEffect
- React, useLayoutEffect: https://react.dev/reference/react/useLayoutEffect
- React, memo: https://react.dev/reference/react/memo
- React, useMemo: https://react.dev/reference/react/useMemo
- Next.js, Server and Client Components: https://nextjs.org/docs/app/getting-started/server-and-client-components
- Next.js, use client: https://nextjs.org/docs/app/api-reference/directives/use-client
- Next.js, Metadata and OG images: https://nextjs.org/docs/app/getting-started/metadata-and-og-images
- Next.js, Caching and Revalidating: https://nextjs.org/docs/app/getting-started/caching-and-revalidating
- web.dev Core Web Vitals: https://web.dev/articles/vitals
- web.dev LCP: https://web.dev/articles/lcp
- Docker, Images: https://docs.docker.com/get-started/docker-concepts/the-basics/what-is-an-image/
- Docker, Containers: https://docs.docker.com/get-started/docker-concepts/the-basics/what-is-a-container/
- Docker, Multi-stage builds: https://docs.docker.com/build/building/multi-stage/
- AWS S3: https://docs.aws.amazon.com/AmazonS3/latest/userguide/Welcome.html
- AWS CloudFront: https://docs.aws.amazon.com/AmazonCloudFront/latest/DeveloperGuide/Introduction.html
- Vitest Guide: https://vitest.dev/guide/
- Playwright Introduction: https://playwright.dev/docs/intro
