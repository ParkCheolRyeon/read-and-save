#!/usr/bin/env python3
"""
Enrich memory card JSON files with misconceptions and practice questions.
Appends to existing card answers without modifying original content.
"""
import json
import os

CARDS_DIR = os.path.join(os.path.dirname(__file__), '..', 'public', 'books', 'cards')

# Misconception + Practice question mappings per file
# Format: { card_index: { "misconception": "...", "practice": "..." } }

ENRICHMENTS = {
    "infra-20.json": {
        0: {
            "misconception": "CI/CD는 GitHub Actions 같은 도구를 말한다 → **틀림.** CI/CD는 프로세스이고, GitHub Actions는 그 프로세스를 구현하는 도구 중 하나.",
            "practice": "lint가 20초, test가 2분, build가 5분 걸리는 파이프라인에서, lint를 build 뒤에 배치하면 어떤 문제가 생기나?"
        },
        3: {
            "misconception": "자동화하면 무조건 빨라진다 → **핵심이 아님.** 자동화의 본질은 속도보다 **재현 가능한 안정적 반복**.",
            "practice": "담당자가 퇴사한 뒤 배포 절차를 아무도 모르는 상황이 생겼다. 이 문제를 자동화로 어떻게 방지할 수 있나?"
        },
        5: {
            "misconception": "COPY . . 을 맨 위에 넣는 게 편하다 → **빌드 시간 폭발.** 소스 한 줄만 바꿔도 의존성 설치부터 다시.",
            "practice": "소스 코드만 수정했는데 Docker 빌드가 5분 걸린다. 원인과 해결 방법은?"
        },
        8: {
            "misconception": "PM2는 개발용 도구다 → **틀림.** PM2는 운영 환경에서 프로세스를 관리하기 위한 도구. 개발에서는 `next dev`를 쓴다.",
            "practice": "새벽에 메모리 누수로 Node 프로세스가 죽었다. PM2 없이 `node server.js`로 실행했으면 어떻게 되었을까?"
        },
        10: {
            "misconception": "환경변수니까 안전하다 → **틀림.** `NEXT_PUBLIC_` 접두사가 붙으면 클라이언트 번들에 인라인되어 브라우저에서 다 보인다.",
            "practice": "`NEXT_PUBLIC_DATABASE_URL`이라고 설정하면 어떤 보안 문제가 생기나?"
        },
        15: {
            "misconception": "문제 생기면 이전 커밋 다시 배포하면 된다 → **너무 단순.** 빌드 시간, DB 마이그레이션, 환경변수 변경 등 고려할 것이 많다.",
            "practice": "금요일 저녁 배포 후 500 에러가 터졌는데, 이전 빌드 아티팩트를 안 남겨뒀다. 롤백하려면 어떻게 해야 하나?"
        },
    },
    "test-20.json": {
        0: {
            "misconception": "테스트를 쓰면 개발이 느려진다 → **단기적으로는 맞지만 장기적으로는 반대.** 수동 확인 + 버그 수정 시간을 합치면 테스트 작성이 더 빠르다.",
            "practice": "결제 모듈을 리팩터링해야 하는데 테스트가 없다. 가장 먼저 할 일은?"
        },
        2: {
            "misconception": "모든 컴포넌트를 단위 테스트해야 한다 → **과잉.** 단순 표시 컴포넌트는 통합 테스트에서 자연스럽게 검증된다.",
            "practice": "순수 함수 `calcTax(price, rate)`와 `<CheckoutPage>` 중 어떤 것을 단위 테스트, 어떤 것을 통합 테스트로 검증하겠는가?"
        },
        7: {
            "misconception": "getByTestId를 많이 쓰면 사용자 관점이다 → **아님.** `data-testid`는 사용자가 보는 것이 아니다. `getByRole`, `getByLabelText`가 더 사용자에 가깝다.",
            "practice": "`screen.getByTestId('submit-btn')` vs `screen.getByRole('button', { name: '제출' })` — 리팩터링에 더 강한 쪽은?"
        },
        9: {
            "misconception": "retry로 flaky를 가리면 된다 → **증상을 숨기는 것.** 근본 원인(타이밍, 공유 상태, 네트워크 의존)을 찾아 제거해야 한다.",
            "practice": "같은 테스트가 CI에서 10번 중 2번 실패한다. 가장 먼저 확인할 것은?"
        },
        11: {
            "misconception": "mock을 많이 쓸수록 테스트가 안정적이다 → **가짜 안정성.** mock이 실제와 달라도 테스트가 통과하는 위험이 있다.",
            "practice": "백엔드가 응답 필드 이름을 바꿨는데 프론트 테스트는 mock을 안 바꿔서 계속 통과했다. 이 문제를 어떻게 방지할 수 있나?"
        },
    },
    "web-performance-20.json": {
        0: {
            "misconception": "Lighthouse 100점이면 성능이 좋은 거다 → **실험실 점수일 뿐.** 실사용자의 기기/네트워크/데이터 양은 반영 안 됨.",
            "practice": "Lighthouse 95점인데 실사용자 불만이 많다. 다음으로 확인할 것은?"
        },
        2: {
            "misconception": "이미지를 압축하면 LCP가 좋아진다 → **부분만 맞음.** TTFB가 느리면 이미지 최적화 효과가 제한적.",
            "practice": "LCP가 3.5초인데 hero 이미지를 WebP로 바꿔도 개선이 안 된다. 다음으로 의심할 원인은?"
        },
        3: {
            "misconception": "CLS는 이미지에서만 발생한다 → **아님.** 폰트 교체, 동적 광고, 늦게 뜨는 쿠키 배너 등 다양한 원인.",
            "practice": "페이지 로딩 후 1초 뒤에 상단 배너가 삽입되면서 아래 콘텐츠가 밀린다. CLS를 줄이려면?"
        },
        4: {
            "misconception": "트리 쉐이킹이 자동으로 다 해준다 → **CommonJS 모듈은 안 됨.** ESM(`import/export`)을 써야 번들러가 미사용 코드를 제거.",
            "practice": "`import _ from 'lodash'`를 `import sortBy from 'lodash-es/sortBy'`로 바꾸면 번들 크기에 어떤 변화가 생기나?"
        },
        11: {
            "misconception": "모든 컴포넌트에 React.memo를 붙이면 좋다 → **과잉 최적화.** 비교 비용이 있고, 간단한 컴포넌트는 리렌더가 더 가벼울 수 있다.",
            "practice": "리스트 아이템 컴포넌트에 React.memo를 붙였는데 성능이 안 좋아졌다. 왜 그럴 수 있나?"
        },
    },
    "cs-20.json": {
        0: {
            "misconception": "JavaScript는 싱글 스레드이므로 브라우저도 싱글 스레드다 → **틀림.** JS 실행은 단일 스레드지만, 브라우저는 렌더링/네트워크/GPU 등 여러 스레드가 함께 동작.",
            "practice": "Chrome에서 탭 하나가 크래시해도 다른 탭이 영향받지 않는 이유는?"
        },
        2: {
            "misconception": "동기 = 느림, 비동기 = 빠름 → **틀림.** 동기/비동기는 속도가 아니라 흐름 제어 방식의 차이.",
            "practice": "`await fetch('/api')`는 겉으로 동기처럼 보이는데, 왜 메인 스레드를 블로킹하지 않나?"
        },
        5: {
            "misconception": "JavaScript는 싱글 스레드라 데드락이 없다 → **전통적 데드락은 없지만** 비동기 순환 대기나 Promise 체인 꼬임은 가능.",
            "practice": "`useEffect A`가 `stateB`를 기다리고, `useEffect B`가 `stateA`를 기다리면 어떤 문제가 생기나?"
        },
        7: {
            "misconception": "JavaScript는 메모리를 신경 안 써도 된다 → **GC가 있지만, 참조가 남아있으면 회수 못 한다.** 이벤트 리스너/클로저/전역 캐시에서 누수 흔함.",
            "practice": "컴포넌트에서 `window.addEventListener`를 등록하고 cleanup을 안 하면 어떤 일이 벌어지나?"
        },
        9: {
            "misconception": "JS 객체는 해시 테이블이다 → **엔진에 따라 다름.** V8은 히든 클래스 최적화를 사용. Map이 더 전통적 해시 테이블에 가깝다.",
            "practice": "10,000개 유저 배열에서 `find(u => u.id === 42)`를 매번 호출하는 것의 문제점과 해결 방법은?"
        },
    },
    "network-20.json": {
        0: {
            "misconception": "HTTP/2는 자동으로 암호화된다 → **스펙상 아님.** 하지만 브라우저들이 TLS 없는 HTTP/2를 거부하므로 사실상 HTTPS 필수.",
            "practice": "CDN 일부 URL이 `http://`로 하드코딩되어 있으면 HTTPS 사이트에서 어떤 문제가 생기나?"
        },
        7: {
            "misconception": "CORS는 백엔드가 막는 것이다 → **아님.** 서버는 정상 응답을 보냈지만, **브라우저가** 허용 헤더가 없으면 결과를 차단.",
            "practice": "Postman에서는 API가 잘 되는데 브라우저에서 CORS 에러가 난다. 왜 그런가?"
        },
        9: {
            "misconception": "`no-cache` = 캐시 안 함 → **아님!** `no-cache`는 '캐시하되 사용 전 서버 확인'. 아예 안 하려면 `no-store`.",
            "practice": "`Cache-Control: no-cache`와 `Cache-Control: no-store`의 동작 차이를 설명하라."
        },
        13: {
            "misconception": "navigator.onLine만 믿으면 된다 → **부족.** Wi-Fi 연결되어 있어도 서버가 죽어있을 수 있다. heartbeat가 필요.",
            "practice": "Wi-Fi는 연결됐는데 API가 계속 실패한다. `navigator.onLine`은 `true`다. 다음으로 확인할 것은?"
        },
        16: {
            "misconception": "retry를 많이 하면 좋다 → **서버 부하를 더 키울 수 있음.** backoff 없이 retry만 하면 장애를 악화시킨다.",
            "practice": "서버가 503을 반환하는데 클라이언트가 1초 간격으로 계속 재시도한다. 어떤 문제가 생기나?"
        },
    },
    "react-20.json": {
        1: {
            "misconception": "render = DOM 조작 → **틀림.** render는 '다음 UI를 계산하는 단계'이고, DOM 조작은 commit에서 일어난다.",
            "practice": "컴포넌트가 렌더되었는데 화면이 안 바뀌었다. 이게 가능한 이유는?"
        },
        5: {
            "misconception": "setState 후 console.log 하면 새 값이 보인다 → **아님.** 현재 렌더의 state 변수는 바뀌지 않는다.",
            "practice": "`setCount(count + 1); setCount(count + 1);` 했을 때 count가 1만 증가하는 이유는?"
        },
        8: {
            "misconception": "모든 컴포넌트에 React.memo를 붙이면 좋다 → **과잉 최적화.** props가 항상 바뀌는 컴포넌트에서는 비교 비용만 추가.",
            "practice": "memo로 감싼 컴포넌트가 여전히 매번 리렌더된다. 가장 흔한 원인은?"
        },
        10: {
            "misconception": "index를 key로 써도 보통 괜찮다 → **삽입/삭제/재정렬이 있으면 위험.** state가 엉뚱한 항목에 붙을 수 있다.",
            "practice": "리스트 항목에 input이 있는데, 첫 번째 항목을 삭제하면 두 번째 항목의 input 값이 사라진다. 왜?"
        },
    },
    "nextjs-20.json": {
        3: {
            "misconception": "Client Component는 서버에서 렌더되지 않는다 → **틀림.** SSR 시 서버에서 한 번 렌더될 수 있다. 'use client'는 번들 포함 여부를 의미.",
            "practice": "'use client' 컴포넌트 안에서 `process.env.SECRET`에 접근하면 어떻게 되나?"
        },
        4: {
            "misconception": "use client를 page.tsx에 붙여도 괜찮다 → **필요 이상으로 클라이언트 세계로 밀려** 서버에서 할 수 있었던 일을 잃고 JS 전송량 증가.",
            "practice": "page.tsx 전체에 'use client'를 붙였더니 번들 크기가 2배가 됐다. 어떻게 개선하나?"
        },
        17: {
            "misconception": "fetch는 기본적으로 캐시된다 → **단순하게 말하면 위험.** 동적 API 사용 여부에 따라 달라진다.",
            "practice": "Server Component에서 `cookies()`를 호출한 뒤 `fetch`를 하면 캐시가 되나 안 되나?"
        },
    },
    "js-20.json": {
        0: {
            "misconception": "let/const는 호이스팅되지 않는다 → **틀림.** 호이스팅은 되지만 TDZ 때문에 초기화 전 접근이 막힐 뿐.",
            "practice": "`console.log(x); let x = 1;`이 에러가 나는 이유를 호이스팅과 TDZ로 설명하라."
        },
        10: {
            "misconception": "setTimeout(..., 0)이 즉시 실행된다 → **아님.** 현재 콜 스택과 마이크로태스크가 모두 비워진 후에야 실행.",
            "practice": "`console.log(1); setTimeout(() => console.log(2), 0); Promise.resolve().then(() => console.log(3)); console.log(4);`의 출력 순서는?"
        },
    },
    "ts-20.json": {
        2: {
            "misconception": "any를 쓰면 TypeScript를 쓰는 의미가 없다 → **극단적이지만 방향은 맞음.** any는 타입 검사를 우회하므로 최소 범위에서만.",
            "practice": "외부 API 응답을 `any`로 받고 있다. 더 안전한 대안은?"
        },
        13: {
            "misconception": "TypeScript를 쓰면 런타임 에러가 없다 → **틀림.** 타입은 컴파일 타임 검사. API 응답 변경, 네트워크 실패 등은 여전히 런타임 문제.",
            "practice": "서버가 `{ user_name: '홍길동' }`을 보내는데 프론트가 `user.userName`으로 접근한다. TypeScript가 이 문제를 잡아줄 수 있나?"
        },
    },
}


def enrich_cards(filename, enrichments):
    filepath = os.path.join(CARDS_DIR, filename)
    with open(filepath, 'r', encoding='utf-8') as f:
        cards = json.load(f)

    for idx, additions in enrichments.items():
        if idx >= len(cards):
            continue
        card = cards[idx]
        answer = card['answer']

        # Add misconception
        if 'misconception' in additions:
            answer += f"\n\n---\n\n**⚠️ 자주 하는 오해**\n\n{additions['misconception']}"

        # Add practice question
        if 'practice' in additions:
            answer += f"\n\n**🔍 실습 질문**\n\n{additions['practice']}"

        card['answer'] = answer

    with open(filepath, 'w', encoding='utf-8') as f:
        json.dump(cards, f, ensure_ascii=False, indent=2)

    print(f"  ✅ {filename}: {len(enrichments)} cards enriched")


def main():
    print("Enriching memory cards with misconceptions and practice questions...\n")
    for filename, enrichments in ENRICHMENTS.items():
        enrich_cards(filename, enrichments)
    print("\nDone!")


if __name__ == '__main__':
    main()
