#!/usr/bin/env python3
"""
Add practice questions and misconceptions to chapter card JSON files.
"""
import json
import os

CARDS_DIR = os.path.join(os.path.dirname(__file__), '..', 'public', 'books', 'cards')

# Practice questions per chapter card (by card index)
PRACTICE = {
    "chapter2.json": {
        0: "const obj = {a:1}; const copy = {...obj}; copy.a = 2; — obj.a는 몇인가? 이유는?",
        1: "const user = {name:'kim', addr:{city:'Seoul'}}; const u2 = {...user}; u2.addr.city = 'Busan'; — user.addr.city는?",
        2: "setState에 같은 객체를 넘기면 왜 리렌더가 안 되는가?",
        3: "Object.is([], [])의 결과는? 왜 그런가?",
        4: "부모에서 setCount(c => c+1) 호출 시, React.memo로 감싼 자식은 리렌더되나?",
        5: "부모가 매 렌더마다 새 함수 () => {}를 자식 prop으로 넘기면, 자식의 React.memo가 작동하나?",
        6: "React.memo + useMemo + useCallback을 세 개 다 써야 효과가 나는 이유는?",
        7: "리스트에서 index를 key로 쓰면 항목 삭제 시 어떤 일이 벌어지나?",
        8: "하나의 상태를 3개 컴포넌트에서 공유해야 할 때, 가장 먼저 할 일은?",
    },
    "chapter3.json": {
        0: "await fetch('/api')는 메인 스레드를 블로킹하나? 왜?",
        1: "메인 스레드에서 1억 번 for 루프를 돌리면 UI가 어떻게 되나?",
        2: "console.log(1); setTimeout(()=>console.log(2),0); Promise.resolve().then(()=>console.log(3)); console.log(4); — 출력 순서는?",
        3: "Promise.all([a(), b()])에서 b()가 실패하면 a()의 결과는 어떻게 되나?",
        4: "async function foo() { return 1; }의 반환값 타입은?",
        5: "Promise.all vs Promise.allSettled — 부분 실패를 다뤄야 할 때 어떤 걸 쓰나?",
        6: "검색창에서 사용자가 'a' → 'ab' → 'abc'를 빠르게 입력했는데 'a' 응답이 가장 늦게 도착하면?",
        7: "AbortController로 이전 요청을 취소하면 서버에서도 작업이 중단되나?",
        8: "backoff 없이 retry만 하면 서버 장애 상황에서 어떤 일이 벌어지나?",
        9: "debounce와 throttle 중 스크롤 이벤트에는 어떤 게 적합한가? 이유는?",
    },
    "chapter4.json": {
        0: "TypeScript를 쓰는데 런타임에 API 응답이 깨지면 TS가 잡아주나?",
        1: "interface User {}를 두 번 선언하면? type User = {}를 두 번 선언하면?",
        2: "unknown 타입 변수에서 .name에 접근하려면 어떻게 해야 하나?",
        3: "if (typeof x === 'string')을 하면 그 블록 안에서 x의 타입은?",
        4: "유니온 A | B에서 A와 B 모두에 있는 필드만 접근 가능한 이유는?",
        5: "function identity<T>(x: T): T가 function identity(x: any): any보다 나은 이유는?",
        6: "keyof { name: string; age: number }의 결과 타입은?",
        7: "Partial<User>를 쓰면 모든 필드가 어떻게 바뀌나?",
        8: "as const를 쓰면 ['a','b']의 타입이 어떻게 달라지나?",
        9: "서버 응답을 z.object({name: z.string()}).parse(data)로 검증하면 무엇이 보장되나?",
        10: "TypeScript의 타입 검사는 언제 실행되나? 런타임에도 존재하나?",
    },
    "chapter5.json": {
        0: "jQuery의 '이 DOM을 이렇게 바꿔라'와 React의 '이 상태일 때 UI는 이렇다'는 어떻게 다른가?",
        1: "컴포넌트가 렌더되었는데 화면이 안 바뀌었다. 가능한가? 이유는?",
        2: "두 컴포넌트가 같은 state를 써야 하면 가장 먼저 할 일은?",
        3: "Context 값이 바뀌면 해당 Context를 구독하는 모든 컴포넌트가 리렌더되는데, 이를 줄이려면?",
        4: "Zustand에서 useStore(s => s.count)로 구독하면 왜 다른 상태가 바뀌어도 리렌더 안 되나?",
        5: "API에서 받은 사용자 목록은 서버 상태인가 로컬 상태인가? 이유는?",
        6: "useState vs useReducer — 폼 필드가 10개인 복잡한 폼에서는 어떤 게 적합한가?",
        7: "React 18의 startTransition은 어떤 문제를 해결하나?",
        8: "커스텀 훅 useDebounce(value, 300)은 내부적으로 어떤 훅을 조합하나?",
        9: "모달 open/close, 드래그 좌표, 서버 데이터 — 이 세 가지를 어떤 상태 도구로 각각 관리하겠나?",
    },
    "chapter6.json": {
        0: "React만으로 SSR을 구현하려면 뭘 직접 세팅해야 하나?",
        1: "App Router에서 cookies()를 호출하면 그 라우트는 정적으로 prerender 가능한가?",
        2: "Server Component 안에서 useState를 쓰면 어떻게 되나?",
        3: "Server Action을 export하면 외부에서 호출 가능한가? 보안 관점에서 주의할 점은?",
        4: "fetch에 { next: { revalidate: 60 } }를 설정하면 어떤 동작이 되나?",
        5: "Route Handler와 Server Action 중 파일 업로드에는 어떤 게 더 적합한가?",
        6: "searchParams를 layout에서 직접 읽으면 왜 stale해질 수 있나?",
    },
    "chapter7.json": {
        0: "사용자가 URL을 입력하면 화면이 뜨기까지 거치는 네트워크 단계를 순서대로 말해보세요.",
        1: "PUT /users/1과 PATCH /users/1의 차이를 보내는 데이터 관점에서 설명하세요.",
        2: "401과 403의 차이를 프론트엔드 처리 관점에서 설명하세요.",
        3: "Postman에서는 API가 잘 되는데 브라우저에서 CORS 에러가 나는 이유는?",
        4: "Cache-Control: no-cache와 no-store의 차이는?",
        5: "WebSocket과 SSE 중 알림 피드에는 어떤 게 적합한가?",
        6: "ESM과 CJS의 차이가 번들 크기에 어떤 영향을 미치나?",
    },
    "chapter8.json": {
        0: "Lighthouse 점수가 높은데 실사용자가 느리다고 느낀다면 다음으로 확인할 것은?",
        1: "LCP 요소가 뭔지 어떻게 찾나?",
        2: "INP가 나빠지는 가장 흔한 원인은?",
        3: "이미지에 width/height를 안 주면 CLS가 발생하는 이유는?",
        4: "layout을 유발하는 CSS 속성 vs composite만 사용하는 속성의 차이는?",
        5: "번들 분석기에서 lodash가 70KB를 차지한다면 어떻게 줄이나?",
        6: "LCP 이미지에 loading='lazy'를 붙이면 어떻게 되나?",
        7: "동기 <script>가 HTML 파싱을 막는 이유는?",
        8: "10,000개 아이템 리스트를 가상화 없이 렌더하면 어떤 문제가 생기나?",
        9: "네트워크가 느린 환경에서 3초 로딩 동안 빈 화면 vs skeleton — 사용자 체감 차이는?",
    },
    "chapter9.json": {
        0: "테스트 없이 3개월 미룬 리팩터링을 테스트 작성 후 하루 만에 끝낸 사례의 핵심 교훈은?",
        1: "단위 테스트가 다 통과하는데 실제 화면에서 버그가 나는 이유는?",
        2: "결제 로직 vs 정적 텍스트 — 테스트 ROI가 높은 쪽은? 이유는?",
        3: "mock이 실제 API와 달라도 테스트가 통과하는 문제를 어떻게 방지하나?",
        4: "같은 테스트가 CI에서 10번 중 2번 실패한다. 가장 먼저 확인할 것은?",
        5: "CSV 업로드 테스트에서 성공 케이스보다 실패 케이스가 더 중요한 이유는?",
        6: "모든 E2E를 모든 PR에서 돌리면 어떤 문제가 생기나?",
    },
    "chapter10.json": {
        0: "CI에서 lint → typecheck → test → build 순서를 지키는 이유는?",
        1: "Dockerfile에서 COPY . . 을 맨 위에 두면 어떤 문제가 생기나?",
        2: "PM2 없이 node server.js로 실행하면 새벽에 프로세스가 죽으면 어떻게 되나?",
        3: "NEXT_PUBLIC_ 접두사가 붙은 환경변수의 보안 위험은?",
        4: "정적 자산과 API 서버가 같은 EC2에 있으면 어떤 문제가 생기나?",
        5: "이전 빌드 아티팩트를 안 남겨두면 롤백 시 어떤 일이 벌어지나?",
        6: "모든 에러에 알림을 보내면 왜 안 좋은가?",
        7: "모노레포에서 web 앱만 수정했는데 api 앱도 빌드되면 어떤 문제가 생기나?",
    },
    "chapter11.json": {
        0: "면접에서 프로젝트를 설명할 때 가장 먼저 보여줘야 하는 건?",
        1: "'이 프로젝트에서 React를 썼습니다' vs '검색 유입이 많아서 SSR이 필요했고 Next.js를 선택했습니다' — 어떤 답변이 더 강한가?",
        2: "'문제가 있었습니다 → 해결했습니다'만 말하면 왜 약한가?",
        3: "'최신 기술을 썼다'와 '맞는 기술을 썼다'의 차이는?",
        4: "장애가 났을 때 '서버가 죽었다'만 말하면 왜 약한가?",
        5: "성과를 말할 때 '로딩 시간을 줄였다' vs '이탈률이 40%에서 15%로 줄었다' — 어떤 게 더 강한가?",
        6: "실패 경험을 물었을 때 '실패한 적 없다'고 답하면?",
        7: "'입사 후 뭘 하고 싶나'에 '시키는 거 다 하겠다'고 답하면?",
    },
    "chapter12.json": {
        0: "화살표 함수의 this는 어디서 결정되나? 일반 함수와 어떻게 다른가?",
        1: "arr.map(...)이 가능한 이유를 프로토타입 체인으로 설명하세요.",
        2: "value == null은 어떤 값들을 true로 판단하나?",
        3: "부모에 이벤트 리스너 하나만 두고 자식 클릭을 처리하는 방법은?",
        4: "Map과 Object 중 id → 엔티티 lookup에는 어떤 게 적합한가?",
        5: "axe-core가 잡을 수 있는 접근성 문제와 잡을 수 없는 문제의 차이는?",
        6: "{ name?: string }과 { name: string | undefined }의 차이는?",
        7: "함수 오버로드가 유니온 파라미터보다 유리한 경우는?",
        8: "enum의 단점과 union literal의 장점은?",
        9: "useEffect vs useLayoutEffect — tooltip 위치 측정에는 어떤 게 적합한가?",
    },
    "chapter13.json": {
        0: "Flexbox는 1차원, Grid는 2차원 — 이 차이가 실무에서 어떤 선택 기준이 되나?",
        1: "Container Query가 미디어 쿼리보다 유리한 경우는?",
        2: "XSS 공격에서 React의 JSX가 자동 방어하는 부분과 못 하는 부분은?",
        3: "SameSite=Lax 쿠키가 CSRF를 어떻게 완화하나?",
        4: "Next.js App Router에서 OG 이미지를 동적으로 생성하려면?",
        5: "React 19의 use() 훅은 기존 useEffect + useState 패턴과 어떻게 다른가?",
    },
    "chapter14.json": {
        0: "stale closure가 React에서 더 자주 문제되는 이유는?",
        1: "setState에 같은 객체 참조를 넘기면 왜 리렌더가 안 되나?",
        2: "검색 자동완성에서 이전 응답이 최신 결과를 덮어쓰는 문제의 이름과 해결법은?",
        3: "unknown과 any의 핵심 차이를 한 줄로 설명하면?",
        4: "제네릭 <T>와 any의 차이가 실무에서 왜 중요한가?",
        7: "render = DOM 조작인가? 아니라면 render는 뭘 하나?",
        9: "state를 가장 가까운 공통 부모로 올리는 것과 전역 store에 두는 것의 판단 기준은?",
        12: "SSR vs SSG — 로그인 대시보드에는 어떤 게 적합한가?",
        18: "채팅 UI에서 SSE vs WebSocket — 어떤 걸 선택하겠나?",
        19: "optimistic UI에서 서버 요청이 실패하면 어떻게 복구하나?",
    },
}


def add_practice(filename, practices):
    filepath = os.path.join(CARDS_DIR, filename)
    if not os.path.exists(filepath):
        print(f"  ⚠️  {filename}: not found")
        return

    with open(filepath, 'r', encoding='utf-8') as f:
        cards = json.load(f)

    updated = 0
    for idx, question in practices.items():
        if idx >= len(cards):
            continue
        card = cards[idx]
        if '실습 질문' not in card['answer']:
            card['answer'] += f"\n\n**🔍 실습 질문**\n\n{question}"
            updated += 1

    with open(filepath, 'w', encoding='utf-8') as f:
        json.dump(cards, f, ensure_ascii=False, indent=2)

    print(f"  ✅ {filename}: {updated} cards updated with practice questions")


def main():
    print("Adding practice questions to chapter cards...\n")
    for filename, practices in PRACTICE.items():
        add_practice(filename, practices)
    print("\nDone!")


if __name__ == '__main__':
    main()
