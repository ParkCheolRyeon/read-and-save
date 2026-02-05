# FirstMD for Interview

**목표:** 면접에서 "원리 → 동작 방식 → 실전 함정 → 해결 패턴"까지 말로 풀어낼 수 있게, 입문자도 이해 가능한 수준으로 정리한 문서.

**구성:** 각 항목마다 개념(왜?) → 동작(어떻게?) → 예제(코드) → 실수 포인트(주의).

---

## 1) 실행 컨텍스트, 스코프 체인, 렉시컬 환경

### 1-1. 실행 컨텍스트란?

JS 엔진이 코드를 실행할 때 필요한 "실행 단위"를 만들고 관리하는 구조.

코드 실행은 크게 2단계로 볼 수 있음:

- **생성 단계(Creation Phase):** 선언 수집, 스코프/환경 구성, this 결정 등
- **실행 단계(Execution Phase):** 실제 코드 한 줄씩 실행

실행 컨텍스트는 보통 아래 종류로 나뉨:

- **Global Execution Context:** 파일/스크립트 최상단
- **Function Execution Context:** 함수 호출마다 생성
- (모듈은 Module Environment가 따로 있음)

### 1-2. 렉시컬 환경(Lexical Environment)

"어떤 이름(식별자)이 어떤 값/바인딩을 가리키는가"를 담는 환경.

렉시컬 환경은 대략 이렇게 생각하면 됨:

- **Environment Record:** 현재 스코프에서 선언된 식별자(변수/함수/클래스 등) 목록과 바인딩
- **Outer(Environment) Reference:** 바깥 렉시컬 환경을 가리키는 포인터 (스코프 체인)

### 1-3. 스코프 체인(Scope Chain)

식별자를 찾을 때,

1. 현재 렉시컬 환경에서 찾고
2. 없으면 outer로 가서 찾고
3. 계속 반복해서 최종적으로 global까지 올라감

```js
const a = 1;

function outer() {
  const b = 2;

  function inner() {
    const c = 3;
    console.log(a, b, c); // 1 2 3 (체인으로 찾음)
  }

  inner();
}

outer();
```

**핵심:** 스코프는 "코드 작성 위치(lexical)"로 결정되고, 실행 컨텍스트는 실행 시점에 생성되지만 "어떤 outer를 바라볼지"는 작성 위치 기준으로 고정됨.

---

## 2) 호이스팅이 실제로 어떻게 동작? var/let/const 차이

### 2-1. 호이스팅이란?

"선언이 코드 상단으로 끌어올려지는 것처럼 보이는 현상". 정확히는 **생성 단계에서 선언을 먼저 처리**하기 때문에 그렇게 보임.

### 2-2. var 호이스팅

`var`는 선언 + 초기값(undefined) 할당이 생성 단계에서 발생하는 느낌. 그래서 선언 이전 접근이 `undefined`가 됨.

```js
console.log(x); // undefined
var x = 10;
console.log(x); // 10
```

### 2-3. let/const 호이스팅 + TDZ

`let`/`const`도 선언 자체는 생성 단계에 등록됨. 하지만 **초기화(실제 사용 가능 상태)가 선언문 도달 전까지 금지됨** → TDZ(Temporal Dead Zone).

```js
console.log(y); // ReferenceError
let y = 10;
```

### 2-4. let vs const

- **let:** 재할당 가능
- **const:** 재할당 불가("바인딩이 고정"). 단, 객체 내부 값 변경은 가능 (객체 자체를 다른 객체로 "재바인딩"하는 것만 불가)

```js
const obj = { a: 1 };
obj.a = 2;       // OK (내부 변경)
obj = { a: 3 };  // TypeError (재할당)
```

### 2-5. 실전 요약

- 기본은 `const`, 필요할 때만 `let`
- `var`는 함수 스코프 + 예측 어려운 호이스팅 때문에 현대 코드에서 지양

---

## 3) this 바인딩 규칙(기본/암시적/명시적/new/arrow) + 예제

`this`는 "함수 선언 위치"가 아니라 **호출 방식(call-site)**에 의해 대부분 결정됨(arrow 제외).

### 3-1. 기본 바인딩 (Default Binding)

일반 함수 호출: `this`는 전역 객체(브라우저: window) 또는 undefined(strict mode).

```js
"use strict";
function f() { console.log(this); }
f(); // undefined
```

### 3-2. 암시적 바인딩 (Implicit Binding)

"점(.) 앞의 객체"가 `this`가 됨.

```js
const user = {
  name: "Kim",
  hi() { console.log(this.name); }
};

user.hi(); // Kim
```

**함정:** 메서드만 떼서 호출하면 기본 바인딩으로 바뀜.

```js
const hi = user.hi;
hi(); // strict면 undefined.name -> TypeError
```

### 3-3. 명시적 바인딩 (Explicit Binding): call/apply/bind

```js
function greet() { console.log(this.name); }

const a = { name: "A" };
greet.call(a); // A
```

`bind`는 `this`가 고정된 "새 함수" 반환.

```js
const bound = greet.bind(a);
bound(); // A
```

### 3-4. new 바인딩 (Constructor)

`new`로 호출하면:

1. 빈 객체 생성
2. 그 객체가 `this`
3. 프로토타입 연결
4. 반환(명시 반환 객체 없으면 this 반환)

```js
function Person(name) {
  this.name = name;
}
const p = new Person("Lee");
console.log(p.name); // Lee
```

### 3-5. arrow 함수의 this

arrow는 자기 `this`가 없음. **바깥 스코프의 this를 렉시컬하게 캡처**.

```js
const obj = {
  name: "Obj",
  normal() {
    setTimeout(function () {
      console.log(this.name); // 기본 바인딩 -> window/undefined
    }, 0);

    setTimeout(() => {
      console.log(this.name); // Obj (렉시컬 캡처)
    }, 0);
  }
};

obj.normal();
```

---

## 4) 프로토타입 체인으로 메서드 탐색이 일어나는 방식

객체에서 `obj.method()` 호출 시,

1. `obj` 자신의 프로퍼티에서 `method` 찾음
2. 없으면 `[[Prototype]](= __proto__)`가 가리키는 프로토타입 객체로 이동
3. 거기에도 없으면 그 위로 계속…
4. 최종적으로 null이면 undefined

```js
const base = {
  hello() { return "hi"; }
};

const child = Object.create(base);
console.log(child.hello()); // "hi" (base에서 탐색)
console.log(child.hasOwnProperty("hello")); // false
```

**핵심:** "상속"처럼 보이지만 실제로는 **위임(delegation)** 기반 탐색.

---

## 5) 클래스 문법은 내부적으로 무엇인가(프로토타입 기반) + 장단점

### 5-1. class는 "문법 설탕(syntax sugar)"에 가깝다

JS는 본질적으로 프로토타입 기반. `class`는 생성자 함수 + prototype 메서드 정의를 깔끔히 써주는 문법.

```js
class Person {
  constructor(name) {
    this.name = name;
  }
  sayHi() {
    return `Hi ${this.name}`;
  }
}

const p = new Person("Kim");
console.log(p.sayHi());
```

내부적으로는 대략 이런 느낌:

```js
function Person(name) {
  this.name = name;
}
Person.prototype.sayHi = function () {
  return `Hi ${this.name}`;
};
```

### 5-2. 장점

- 문법이 명확: 생성자/메서드/상속 표현 쉬움
- 상속(extends, super)이 읽기 쉬움
- TS/IDE 친화적(타입/자동완성/리팩터)

### 5-3. 단점/함정

- "클래스처럼" 보이니 진짜 클래스(자바 등)와 동일하다고 착각하기 쉬움
- 메서드 바인딩 문제(그냥 this 규칙 그대로)
- 상속 남용 시 복잡도 증가 → 조합(Composition) 선호

---

## 6) 클로저란? 메모리/GC 관점 주의점

### 6-1. 클로저 정의

함수가 생성될 때, 그 함수는 **자신이 선언된 렉시컬 스코프의 변수들을 기억**할 수 있음. 즉 "함수 + 그 함수가 참조하는 외부 변수 환경"의 조합.

```js
function makeCounter() {
  let count = 0;
  return function () {
    count++;
    return count;
  };
}

const c = makeCounter();
c(); // 1
c(); // 2
```

### 6-2. 왜 메모리 이슈가 생기나?

클로저가 외부 변수를 참조하면, 그 **외부 렉시컬 환경이 GC 대상이 되지 않을 수 있음** (= 참조가 남아있어 "살아있는 객체"로 취급).

예: 큰 배열을 캡처하고 계속 참조하면 메모리 유지.

```js
function heavy() {
  const big = new Array(1e6).fill("x");
  return () => big.length;
}

const f = heavy(); // big이 계속 메모리에 남을 수 있음
```

### 6-3. 실전 주의

- 장시간 살아있는 핸들러/리스너에서 불필요한 캡처 방지
- 필요 끝나면 참조 끊기 (handler = null, 구독 해제)
- React 등에서는 "stale closure" 문제도 중요 (상태 최신값 미반영)

---

## 7) 이벤트 루프: 매크로태스크/마이크로태스크 순서

### 7-1. 큰 그림

JS는 싱글 스레드처럼 보이지만, 브라우저/런타임이 비동기 작업을 처리하고 "콜 스택이 비면" 이벤트 루프가 큐에서 작업을 가져옴.

### 7-2. 큐 우선순위(대표)

- **Microtask Queue:** Promise.then/catch/finally, queueMicrotask, MutationObserver
- **Macrotask Queue(Task Queue):** setTimeout, setInterval, setImmediate(Node), I/O 등

렌더링(Paint)은 런타임/브라우저 정책에 따라 마이크로태스크 비운 뒤 끼어드는 식으로 진행.

**기본 규칙(중요):**

1. 현재 콜스택 실행
2. 콜스택 비면 **마이크로태스크를 전부** 비움
3. 그 다음 **매크로태스크 하나** 실행
4. 반복

```js
console.log(1);

setTimeout(() => console.log("timeout"), 0);

Promise.resolve().then(() => console.log("promise"));

console.log(2);

// 출력: 1, 2, promise, timeout
```

### 7-3. 실전 함정

마이크로태스크를 무한히 쌓으면 렌더링이 굶음(프리징 체감).

---

## 8) Promise 체이닝: 에러 전파, catch 위치 차이

### 8-1. 기본 원리

`.then()`은 성공/실패 핸들러를 등록하고 새 Promise를 반환. 체인 중간에서 throw 또는 return Promise.reject() 하면 이후는 실패로 전파.

```js
Promise.resolve()
  .then(() => {
    throw new Error("boom");
  })
  .then(() => {
    console.log("여긴 실행 안 됨");
  })
  .catch((e) => {
    console.log("잡힘:", e.message);
  });
```

### 8-2. catch 위치의 의미

"그 이전 체인에서 발생한 에러"를 잡음. catch 이후에 다시 throw하면 또 아래로 전파.

```js
fetch("/a")
  .then(r => r.json())
  .catch(e => {
    // /a 요청 또는 json 파싱 에러 잡음
    return { fallback: true };
  })
  .then(data => {
    // 복구한 데이터로 이어감
  });
```

**패턴:**

- "최하단 catch 1개"는 전역 처리에 좋음
- "중간 catch"는 복구(recover) 전략에 좋음

---

## 9) async/await 병렬/순차 처리 실수 포인트

### 9-1. 순차(느릴 수 있음)

```js
const a = await fetchA();
const b = await fetchB();
```

A가 끝나야 B 시작 → 의존성이 없으면 비효율.

### 9-2. 병렬(권장)

```js
const [a, b] = await Promise.all([fetchA(), fetchB()]);
```

### 9-3. 흔한 실수: map에 await

```js
// ❌ 잘못된 기대: 이게 병렬일 거라 생각함
const results = items.map(async (x) => await work(x));
// results는 Promise 배열
```

해결:

```js
const results = await Promise.all(items.map(work));
```

### 9-4. 또 다른 실수: forEach + await

`forEach`는 await를 기다려주지 않음.

```js
items.forEach(async (x) => {
  await work(x);
});
```

해결(순차):

```js
for (const x of items) {
  await work(x);
}
```

해결(병렬):

```js
await Promise.all(items.map(work));
```

---

## 10) try/catch가 못 잡는 비동기 에러 사례 + 해결

### 10-1. 대표 사례: setTimeout 내부 throw

```js
try {
  setTimeout(() => {
    throw new Error("async error");
  }, 0);
} catch (e) {
  console.log("못 잡힘");
}
```

이유: try/catch는 **같은 콜스택 내**에서만 예외를 잡음. setTimeout 콜백은 "나중"에 다른 실행 컨텍스트에서 실행.

### 10-2. 해결 방법들

**콜백 내부에서 try/catch:**

```js
setTimeout(() => {
  try {
    throw new Error("err");
  } catch (e) {
    console.log("여기서 처리");
  }
}, 0);
```

**Promise로 감싸서 catch로 처리:**

```js
new Promise((_, reject) => {
  setTimeout(() => reject(new Error("err")), 0);
}).catch(console.error);
```

**전역 핸들러(최후 방어선):**

- 브라우저: `window.onerror`, `window.onunhandledrejection`
- Node: `process.on('uncaughtException')`, `process.on('unhandledRejection')`

---

## 11) 동시성 제한(동시에 N개 요청) 큐 구조

### 11-1. 요구사항

- 동시에 최대 N개만 실행
- 나머지는 대기열에 쌓기
- 하나 끝나면 다음 실행

### 11-2. 구현 예시 (p-limit 스타일)

```js
function createLimiter(limit) {
  let active = 0;
  const queue = [];

  const next = () => {
    if (active >= limit) return;
    const job = queue.shift();
    if (!job) return;

    active++;
    job()
      .finally(() => {
        active--;
        next();
      });
  };

  return function run(task) {
    // task: () => Promise<any>
    return new Promise((resolve, reject) => {
      queue.push(() => task().then(resolve, reject));
      next();
    });
  };
}

// 사용 예시
const run = createLimiter(2);

const tasks = [1, 2, 3, 4, 5].map(i =>
  new Promise(res => setTimeout(() => res(i), 1000))
);

Promise.all(tasks.map(t => run(t))).then(console.log);
```

**면접 포인트:**

- 상태: active(실행 중 개수), queue(대기 작업)
- finally에서 active 감소 후 next() 호출로 펌프(pump)

---

## 12) 불변성(immutability)이 왜 중요? 얕은/깊은 복사 이슈

### 12-1. 왜 중요?

- "같은 입력 → 같은 출력" 예측 가능
- 변경 추적이 쉬움 (특히 React state 비교, memoization)
- 버그가 줄어듦 (공유 참조로 인한 사이드이펙트 방지)

### 12-2. 얕은 복사 vs 깊은 복사

- **얕은 복사:** 1단계만 새로 만들고 내부 참조는 공유
- **깊은 복사:** 내부까지 전부 새로 생성

```js
const a = { user: { name: "Kim" } };
const b = { ...a }; // 얕은 복사

b.user.name = "Lee";
console.log(a.user.name); // Lee (공유 참조 버그)
```

깊은 복사 방법(상황별):

- 구조가 단순/JSON 가능: `structuredClone`, `JSON.parse(JSON.stringify(obj))` (단, Date/Map/함수 불가)
- 복잡한 데이터: 라이브러리(immer 등) 또는 직접 재귀 복사

---

## 13) 구조 분해/스프레드의 "얕은 복사" 버그 사례

### 13-1. 객체 스프레드

```js
const state = {
  items: [{ id: 1, count: 0 }]
};

const next = { ...state };      // 얕은 복사
next.items[0].count++;          // 내부 배열/객체는 공유
console.log(state.items[0].count); // 1 (원본 오염)
```

### 13-2. 안전한 업데이트 패턴

```js
const next = {
  ...state,
  items: state.items.map(item =>
    item.id === 1 ? { ...item, count: item.count + 1 } : item
  )
};
```

**면접 포인트:**

- "불변 업데이트는 바뀌는 경로만 새로 만들고, 나머지는 재사용"
- 구조 깊이가 깊어질수록 코드가 지저분해지니 immer 같은 도구를 쓰기도 함

---

## 14) ESM vs CJS + 번들러 트리 쉐이킹 조건

### 14-1. ESM(ES Modules)

- `import`/`export`
- 정적 구조(컴파일 타임에 의존성 그래프 분석 가능)
- 트리 쉐이킹에 유리

```js
// a.js
export const a = 1;
export const b = 2;

// main.js
import { a } from "./a.js"; // b는 제거 가능
```

### 14-2. CJS(CommonJS)

- `require`/`module.exports`
- 런타임에 require 가능 → 의존성 분석이 어려움 → 트리 쉐이킹 불리

```js
const mod = require("./a"); // 어떤 걸 쓰는지 정적 분석 어려움
```

### 14-3. 트리 쉐이킹이 되는 조건(실전 핵심)

번들러(webpack/rollup/esbuild)가 dead code 제거하려면:

- ESM 기반일 것(정적 import/export)
- side effects가 없다고 판단/표시 가능해야 함
- 패키지의 package.json에 `"sideEffects": false` 또는 특정 파일만 true 설정
- "사용되지 않는 export"를 추적 가능해야 함
- 바벨 변환에서 `modules: false` 등으로 ESM 유지 필요(환경에 따라)

**면접 한 줄:** "ESM은 정적이라 그래프 분석이 가능해서 트리 쉐이킹이 되고, CJS는 동적 require 때문에 어려움"

---

## 15) debounce vs throttle: 차이 + UI/네트워크 적용 기준

### 15-1. throttle(스로틀)

"일정 시간 간격마다 최대 1번 실행". 스크롤/리사이즈처럼 연속 이벤트에서 주기적으로 반응해야 할 때.

```js
function throttle(fn, interval) {
  let last = 0;
  return (...args) => {
    const now = Date.now();
    if (now - last >= interval) {
      last = now;
      fn(...args);
    }
  };
}
```

### 15-2. debounce(디바운스)

"마지막 호출 이후 일정 시간이 지나면 1번 실행". 입력 검색창처럼 "타이핑 끝난 뒤 한 번만" 호출하고 싶을 때.

```js
function debounce(fn, delay) {
  let t;
  return (...args) => {
    clearTimeout(t);
    t = setTimeout(() => fn(...args), delay);
  };
}
```

### 15-3. 선택 기준

| 상황 | 추천 |
|------|------|
| UI 반응(스크롤 위치 표시, 무한 스크롤 트리거) | throttle |
| 네트워크 요청(검색 자동완성, 필터 요청) | debounce |

드래그 중 실시간 업데이트는 throttle, 드래그 끝난 뒤 정산은 debounce 같은 혼합도 흔함.

---

## 16~20 TypeScript

## 16) 구조적 타이핑(Structural Typing): 장점/리스크

### 16-1. 구조적 타이핑이란?

"이 타입 이름이 무엇이냐"보다 **형태(프로퍼티 구조)**가 맞으면 호환되는 시스템.

```ts
type User = { id: string };
type Admin = { id: string };

const u: User = { id: "1" };
const a: Admin = u; // OK (구조가 같아서)
```

### 16-2. 장점

- 유연한 호환성: API 응답/DTO/컴포넌트 props 조합이 쉬움
- 리팩터링/확장에 강함(필요한 구조만 맞추면 됨)

### 16-3. 리스크(실수 포인트)

"의미가 다른데 구조가 같아서" 섞일 수 있음(도메인 오류). 해결: **브랜딩(명목성 흉내)**

```ts
type Brand<K, T> = K & { __brand: T };

type UserId = Brand<string, "UserId">;
type OrderId = Brand<string, "OrderId">;

const userId = "u1" as UserId;
const orderId = "o1" as OrderId;

// userId = orderId; // 컴파일 에러(의미 분리)
```

---

## 17) 제네릭 + extends 제약으로 타입 안전 API 설계

### 17-1. 기본 제네릭

```ts
function first<T>(arr: T[]): T | undefined {
  return arr[0];
}
```

### 17-2. extends로 제약 걸기

"특정 속성이 있는 타입만 받기"

```ts
function pluck<T extends object, K extends keyof T>(obj: T, key: K): T[K] {
  return obj[key];
}

const u = { id: "1", age: 20 };
const id = pluck(u, "id");  // string
// pluck(u, "nope");        // 에러
```

### 17-3. 실전 포인트

`keyof`, 인덱스 접근 타입(`T[K]`)으로 "입력에 따라 출력 타입이 자동 추론"되게 만들면 면접에서 강력함.

---

## 18) Union/Intersection + Narrowing(가드) 전략

### 18-1. Union(합집합) A | B

"둘 중 하나일 수 있음" → 사용할 때는 좁혀야 함.

```ts
type Shape = { kind: "circle"; r: number } | { kind: "rect"; w: number; h: number };

function area(s: Shape) {
  if (s.kind === "circle") return Math.PI * s.r * s.r;
  return s.w * s.h;
}
```

`kind` 같은 태그로 나누는 패턴 = **Discriminated Union**.

### 18-2. Intersection(교집합) A & B

"둘 다 만족" (합쳐진 형태)

```ts
type A = { a: number };
type B = { b: string };
type C = A & B; // {a:number, b:string}
```

### 18-3. Narrowing 전략

- `typeof`, `instanceof`
- `in` 연산자
- 사용자 정의 타입 가드

```ts
function isRect(s: Shape): s is Extract<Shape, { kind: "rect" }> {
  return s.kind === "rect";
}
```

---

## 19) type vs interface 선택 기준 + 선언 병합 언제 유용?

### 19-1. 실전 선택 기준

| | interface | type |
|--|--|--|
| 객체 형태 확장/상속 | 직관적 | |
| 선언 병합 | 가능(라이브러리 타입 확장에 유리) | |
| 유니온/인터섹션/매핑/조건부 타입 | | 표현력이 강함 |
| 함수/튜플/리터럴 조합 | | 유리 |

### 19-2. 선언 병합(Declaration Merging)

대표적으로 라이브러리 확장(예: 전역 Window, Express Request 확장).

```ts
declare global {
  interface Window {
    __APP_VERSION__: string;
  }
}
```

**면접 포인트:** "내부 도메인 모델은 type도 충분, 외부 확장/플러그인 형태는 interface가 편함"

---

## 20) Conditional Types / Utility Types 실무 사용

### 20-1. Utility Types 예시

- `Partial<T>`: 일부만
- `Pick<T, K>`: 일부만 뽑기
- `Omit<T, K>`: 일부 제외

```ts
type User = { id: string; name: string; age: number };

type UserPreview = Pick<User, "id" | "name">;
type UserUpdate = Partial<Omit<User, "id">>;
```

### 20-2. Conditional Types

```ts
type IsString<T> = T extends string ? true : false;

type A = IsString<"x">;  // true
type B = IsString<123>;  // false
```

실전: API 응답 정규화, 함수 오버로드 대체, `infer`로 반환 타입 추론 등에 자주 씀.

---

## 21~28 CSS / 브라우저 렌더링

## 21) 렌더링 파이프라인: Style → Layout → Paint → Composite

- **Style:** CSS 계산(어떤 스타일이 적용되는지)
- **Layout(Reflow):** 요소 크기/위치 계산
- **Paint:** 픽셀 그리기(배경, 글자, 테두리 등)
- **Composite:** 레이어 합성(transform/opacity 등 GPU 레이어 결합)

**성능 핵심:** Layout/Paint는 무거움. 가능하면 Composite만 일어나게 만들기(= transform/opacity 활용).

---

## 22) Reflow/Repaint 원인 + 최적화

### 22-1. Reflow(Layout) 유발 대표

- width/height 변경
- padding/margin 변경
- 폰트 변경(텍스트 흐름 변화)
- DOM 삽입/삭제
- `offsetWidth`, `getBoundingClientRect()` 같은 측정과 스타일 변경이 섞일 때(레이아웃 스래싱)

### 22-2. Repaint(Paint) 유발 대표

색상/배경색/그림자 변경(레이아웃은 그대로인데 다시 그려야 함)

### 22-3. 최적화

- 측정 → 변경 순서로 묶기 (read then write)
- 애니메이션은 transform/opacity
- `will-change: transform`은 남용 금지(레이어 메모리 증가)
- DOM 변경은 fragment로 묶거나 한 번에

---

## 23) Specificity 계산 + 의도치 않은 우선순위 방지

### 23-1. Specificity 기본 규칙

- inline style: 가장 강함(대개 1000 느낌)
- ID 선택자: (1,0,0)
- class/attribute/pseudo-class: (0,1,0)
- tag/pseudo-element: (0,0,1)
- `!important`는 별도 전쟁(가능하면 피하기)

### 23-2. 방지 전략

- 선택자 깊이(중첩) 줄이기
- 컴포넌트 단위 네이밍(BEM 등) 또는 CSS Modules
- `:where()`는 specificity를 0으로 만드는 데 유용
- "한 단계만 더 구체화" 같은 땜질을 반복하지 않기(특이성 인플레)

---

## 24) BFC란? 마진 겹침/float 문제 해결

### 24-1. BFC(Block Formatting Context)

블록 레이아웃의 독립 영역. BFC가 생기면 내부 레이아웃이 바깥에 덜 영향을 줌.

BFC 생성 예: `overflow: hidden/auto/scroll`, `display: flow-root`, `position: absolute/fixed`, float 등

### 24-2. 해결하는 문제

- **마진 겹침(margin collapse):** BFC로 분리하면 겹침 완화
- **float 포함 높이 문제:** 부모에 BFC를 만들면 float 자식이 부모 높이에 반영

```css
.container {
  display: flow-root; /* float 클리어 효과 */
}
```

---

## 25) Flex/Grid 각각 강점 + 선택 기준

- **Flex:** 1차원(행 또는 열) 정렬에 강함 — 버튼 정렬, 수평/수직 중앙 정렬, 아이템 간 간격 등
- **Grid:** 2차원(행+열) 레이아웃에 강함 — 카드 그리드, 대시보드, 복잡한 영역 배치

**선택 기준:** "한 줄(또는 한 컬럼) 정렬 문제"면 Flex. "행/열 동시에 설계"면 Grid.

---

## 26) Stacking Context 조건 + z-index가 안 먹는 이유

### 26-1. Stacking Context가 생기는 대표 조건

- position이 있고 z-index가 설정됨
- opacity < 1
- transform/filter/perspective
- `isolation: isolate`
- will-change 일부 등

### 26-2. z-index가 안 먹는 흔한 이유

서로 다른 stacking context에 있어서 비교 대상이 아님. 부모 stacking context 안에서만 z-index 경쟁.

**디버깅 요령:** "누가 stacking context를 만들었는지"를 먼저 찾기 (transform/opacity가 범인인 경우 많음)

---

## 27) 반응형 breakpoints 기준(디자인/콘텐츠 기반)

"기기 기준"만으로 잡으면 콘텐츠가 깨질 수 있음. **콘텐츠가 깨지는 지점**에서 breakpoint를 잡는 게 가장 튼튼함.

**실전 팁:** 텍스트 줄바꿈, 카드 최소 너비, 표/차트 가독성 기준으로 결정. 가능하면 container query로 컴포넌트 단위 반응형을 고려.

---

## 28) 애니메이션에서 transform/opacity 권장 이유 + 접근성

### 28-1. 왜 transform/opacity인가?

Layout/Paint를 피하고 Composite에서 처리될 가능성이 높음 → 부드러움.

### 28-2. 접근성: 모션 감소

사용자가 "동작 줄이기"를 켰다면 애니메이션 최소화.

```css
@media (prefers-reduced-motion: reduce) {
  .anim {
    transition: none;
    animation: none;
  }
}
```

---

## 29~35 네트워크 / 웹 보안

## 29) HTTP 메서드 의미(안전성/멱등성) + 설계 기준

- **안전(Safe):** 서버 상태를 바꾸지 않는 메서드 (GET, HEAD)
- **멱등(Idempotent):** 같은 요청을 여러 번 해도 결과가 동일 (GET, PUT, DELETE는 보통 멱등 / POST는 보통 비멱등)

**설계 포인트:** 생성: POST / 전체 치환: PUT / 부분 수정: PATCH / 조회: GET / 삭제: DELETE

---

## 30) 상태코드 처리 전략(200/201/204/304/400/401/403/404/409/429/500)

- **200 OK:** 일반 성공
- **201 Created:** 생성 성공(보통 Location 헤더)
- **204 No Content:** 성공 + 바디 없음(DELETE/PUT 결과 등)
- **304 Not Modified:** 캐시 사용
- **400 Bad Request:** 입력 검증 실패
- **401 Unauthorized:** 인증 필요(토큰 없음/만료)
- **403 Forbidden:** 인증은 됐지만 권한 없음
- **404 Not Found:** 리소스 없음
- **409 Conflict:** 충돌(중복 생성, 버전 충돌 등)
- **429 Too Many Requests:** 레이트 리밋(재시도/백오프)
- **500 Internal Server Error:** 서버 오류(사용자에게는 일반 메시지 + 로깅)

**프론트 전략:** 401 → 재로그인/토큰 갱신 플로우 / 403 → 권한 안내 화면 / 409 → 사용자에게 충돌 해결 UX(리로드/재시도) / 429 → 지수 백오프 + 안내 / 500 → 재시도 버튼 + 장애 안내

---

## 31) HTTP 캐시(ETag/Cache-Control/Last-Modified) + 프론트 활용

- **Cache-Control: max-age=...** — 신선도 기반 캐시
- **ETag + If-None-Match** — 콘텐츠 버전 태그로 조건부 요청 → 304
- **Last-Modified + If-Modified-Since** — 수정 시각 기반 조건부 요청

**프론트 활용:** 정적 자원(이미지/번들)은 긴 캐시 + 해시 파일명. API는 상황에 따라 조건부 요청/캐시 정책 설계(특히 Next/SSR 환경).

---

## 32) 쿠키 옵션 Domain/Path/HttpOnly/Secure/SameSite 언제?

- **Domain:** 서브도메인 공유 범위
- **Path:** 특정 경로에서만 쿠키 전송
- **HttpOnly:** JS에서 접근 불가(XSS로 탈취 방지에 유리)
- **Secure:** HTTPS에서만 전송
- **SameSite:** Lax(기본적인 CSRF 방어) / Strict(더 강함, 로그인/결제에서 UX 이슈 가능) / None(크로스사이트 허용, 반드시 Secure 필요)

---

## 33) CORS 왜 생기고, Preflight는 언제?

- 브라우저 보안 모델: 다른 출처 요청 제한(SOP). 서버가 허용하면 가능(CORS 헤더로 명시).
- **Preflight(OPTIONS)**가 발생하는 대표: "단순 요청"이 아닐 때 — 커스텀 헤더(Authorization 등), PUT/PATCH/DELETE, 특정 Content-Type 등.

**프론트 포인트:** 프론트가 해결하는 게 아니라 서버가 CORS 헤더로 허용해야 함. 불필요한 커스텀 헤더/메서드로 preflight를 남발하지 않게 설계할 수는 있음.

---

## 34) XSS/CSRF 방어 + 프론트 책임 범위

**XSS:** 악성 스크립트 실행. 방어: 출력 이스케이프, CSP, dangerouslySetInnerHTML 지양, 신뢰되지 않은 HTML 주입 금지. 토큰 저장은 HttpOnly 쿠키가 유리한 경우가 많음(탈취 난이도 상승).

**CSRF:** 사용자의 인증 상태(쿠키)를 이용해 원치 않는 요청. 방어: SameSite 쿠키, CSRF 토큰(더블서밋), Origin/Referer 체크.

**프론트 책임:** 사용자 입력을 그대로 HTML로 렌더링하지 않기. 토큰/쿠키 전략에 맞는 요청 설계(예: credentials 포함 여부). 에러 UX/재인증 흐름 제공.

---

## 35) 네트워크 장애 UX/재시도 정책

- **오프라인:** "오프라인 모드" 안내 + 로컬 큐/재전송(가능한 기능만)
- **타임아웃:** 재시도 버튼 + 자동 재시도는 제한적으로(백오프)
- **서버 다운(5xx):** 상태 페이지 수준 안내 + 로그/리포트

**재시도 원칙:** 멱등 요청(GET 등)은 자동 재시도 고려. 비멱등(POST 결제 등)은 자동 재시도 신중(중복 처리 방지 필요: idempotency key).

---

## 36~50 React

## 36) Render 단계 vs Commit 단계

- **Render:** "무엇을 그릴지 계산" (pure해야 함) — 컴포넌트 함수 실행, 가상 트리 계산, diff 준비
- **Commit:** 실제 DOM 반영 + ref 연결 + effect 스케줄

**면접 핵심:** Render는 중단/재시작 가능(특히 concurrent). Commit은 실제 반영이라 중단되면 안 됨.

---

## 37) Reconciliation + key 잘못 주면 생기는 문제

Reconciliation: 이전 트리와 새 트리를 비교해 최소 변경으로 UI 업데이트.

**key 역할:** 리스트에서 "이 아이템이 누구인지" 식별. 안정적인 key가 있어야 DOM/상태/포커스가 올바르게 유지.

**나쁜 예(인덱스 key):** 중간 삽입/정렬 시 다른 아이템으로 착각 → 입력값/상태가 엉킴.

```jsx
items.map((item, idx) => <Row key={idx} item={item} />) // 위험
```

**좋은 예:**

```jsx
items.map((item) => <Row key={item.id} item={item} />)
```

---

## 38) batching은 언제/왜? 체감 버그

React 18 이후: 여러 state 업데이트를 묶어서 한 번만 렌더(자동 배칭 범위 확대).

**체감 버그:** "setState 여러 번 했는데 바로 반영 안 되는 것처럼" 보임. 해결: 상태는 "즉시 변경"이 아니라 "업데이트 예약"이라고 이해. 필요 시 `flushSync`(정말 필요할 때만).

---

## 39) setState 함수형 업데이트 꼭 써야 하는 케이스

이전 상태에 의존할 때 필수:

```js
setCount(c => c + 1);
setCount(c => c + 1);
// 결과 +2 보장
```

그냥 `setCount(count + 1)` 두 번이면, 같은 count를 캡처해서 +1만 될 수 있음(배칭/클로저 영향).

---

## 40) useEffect 타이밍 + 의존성 배열 의미

useEffect는 **커밋 후**(브라우저 페인트 이후에 주로) 실행. 의존성 배열은 "이 값이 바뀌면 effect 다시 실행"의 선언.

```js
useEffect(() => {
  // 구독/타이머/로그/요청 등
  return () => {
    // 정리
  };
}, [dep1, dep2]);
```

**포인트:** 의존성은 "원하는 것만"이 아니라 "effect 내부에서 참조하는 값" 기준으로 생각해야 stale 문제를 피함.

---

## 41) useEffect cleanup 언제 호출? 무엇을 정리?

**cleanup 호출 시점:** 다음 effect 실행 직전 / 컴포넌트 언마운트 직전

**정리 대상:** 이벤트 리스너 제거, 타이머 clear, 구독 해제(WebSocket, store subscribe), AbortController로 fetch 취소 등

---

## 42) useLayoutEffect 언제 쓰고 왜 위험?

DOM 변경이 커밋된 직후, **페인트 전에** 동기 실행. 측정/레이아웃 계산 후 즉시 스타일 조정이 필요할 때.

**위험:** 페인트를 막아 첫 화면이 느려짐. 무거운 작업 넣으면 사용자 체감이 크게 나빠짐.

---

## 43) useMemo/useCallback 목적 + 오히려 느려지는 경우

**목적:** 값/함수 재생성 비용을 줄이거나, 참조 동일성을 유지해서 자식 리렌더를 줄이기

**느려지는 경우:** 메모이제이션 자체 비용 > 계산 비용. 의존성 관리가 복잡해져 버그 유발. 자식이 memo로 최적화되어 있지도 않은데 남발

**원칙:** "비싼 계산" 또는 "리렌더 폭발 지점"에만 사용

---

## 44) ref 필요한 상황 + 상태로 하면 안 되는 이유

**ref:** DOM 직접 접근(포커스, 스크롤). 렌더와 무관한 가변 값 저장(타이머 id, 외부 라이브러리 인스턴스).

**상태로 하면 안 되는 이유:** 상태 변경은 렌더 트리거 → 불필요한 렌더. 렌더와 무관한 값은 ref가 적합.

---

## 45) Controlled vs Uncontrolled 선택 기준 + 폼 철학

- **Controlled:** 입력값이 React state가 "단일 진실 소스". 즉시 검증/조건부 UI에 유리. 큰 폼에서는 리렌더 비용/코드량 증가 가능.
- **Uncontrolled:** DOM이 값을 들고 필요할 때만 읽음(ref). 성능/단순성 이점. 복잡한 실시간 검증은 불편.

**실전:** 작은 폼/검증 많음 → controlled. 매우 큰 폼/성능 중요 → uncontrolled + 제출 시 수집(또는 폼 라이브러리).

---

## 46) Context 리렌더 전파 줄이는 법(분리/selector)

**문제:** Provider value가 바뀌면 구독 컴포넌트들이 리렌더될 수 있음.

**해결:** context 분리(관심사별로 쪼개기). value 객체를 매 렌더마다 새로 만들지 않기(useMemo). selector 패턴(use-context-selector, zustand 등). 상태 관리 라이브러리로 전환(구독 단위 최적화).

---

## 47) Error Boundary 역할/한계(비동기/이벤트) + 대안

**역할:** 렌더링 중 에러, 라이프사이클 에러, 자식 트리 에러를 잡아 fallback UI

**한계:** 이벤트 핸들러 내부 에러는 못 잡음. 비동기(setTimeout, Promise reject)도 직접적으론 못 잡음

**대안:** 이벤트 핸들러에서 try/catch. 전역 에러 로깅(window.onerror, onunhandledrejection). 데이터 요청은 쿼리 라이브러리/에러 상태로 UI 처리.

---

## 48) Suspense가 해결하는 것 + 로딩 UI 주의

**해결:** "대기 중"을 렌더링 흐름에 통합 (fallback으로 로딩 표시).

**주의:** 로딩 UI가 레이아웃을 크게 흔들면 UX 나쁨(레이아웃 시프트). 스켈레톤/자리 유지형 로딩이 좋음. 너무 작은 단위로 suspense 쪼개면 깜빡임 증가(적절한 경계 설계).

---

## 49) Concurrent 기능 + useDeferredValue 맥락

**Concurrent 핵심:** 업데이트 우선순위. 렌더 중단/재시작(인터럽트 가능).

**useDeferredValue:** 입력은 즉시 반영, 무거운 리스트/검색 결과는 "조금 늦게" 갱신해 타이핑을 부드럽게.

```js
const deferredQuery = useDeferredValue(query);
const results = useMemo(() => search(deferredQuery), [deferredQuery]);
```

---

## 50) 테스트 전략(Unit/Integration/E2E) 분리 적용

- **Unit:** 함수/훅/유틸의 로직 (빠르고 많이)
- **Integration:** 컴포넌트 여러 개 조합 + 상호작용(React Testing Library)
- **E2E:** 실제 브라우저에서 사용자 시나리오(Playwright/Cypress)

**권장 비율 감각:** Unit/Integration으로 대부분 커버. E2E는 "핵심 플로우"만(로그인/결제/핵심 CRUD).

---

## 51~60 Next.js (App Router 중심)

## 51) App Router 구조(layout/page/loading/error) 역할

- **layout.tsx:** 공통 레이아웃(중첩 가능)
- **page.tsx:** 해당 라우트의 실제 페이지
- **loading.tsx:** 해당 세그먼트 로딩 UI
- **error.tsx:** 해당 세그먼트 에러 UI(에러 바운더리 성격)
- **not-found.tsx:** 404 처리
- **template.tsx:** 레이아웃과 비슷하지만 네비게이션마다 새로 생성되는 성격(필요할 때만)

---

## 52) Server Component vs Client Component 기준 + trade-off

**Server Component:** 서버에서 렌더, 클라이언트 번들에 JS를 덜 보냄. 데이터 접근/보안에 유리(비밀키, DB 접근 등). 단: 브라우저 API/useState/useEffect 불가.

**Client Component:** 상호작용(UI 상태, 이벤트) 필요할 때. 단: 번들 증가, hydration 비용 증가.

**기준:** "인터랙션 필요?" → Client. "데이터만 그리고 상호작용 없음?" → Server 우선.

---

## 53) Hydration이란? mismatch 대표 원인

**Hydration:** 서버가 만든 HTML에 클라이언트 React가 이벤트/상태를 붙이는 과정.

**Mismatch 원인:** 서버/클라 렌더 결과가 달라짐 — Math.random(), Date.now(), locale/timezone 차이, 클라이언트에서만 존재하는 값(window, localStorage)로 초기 렌더 구성, 조건부 렌더 분기 불일치.

**해결 패턴:** 랜덤/시간은 서버에서 값 확정해서 내려주기. 클라이언트 전용 값은 useEffect 이후에 반영(초기 렌더는 동일하게).

---

## 54) 데이터 패칭(Server/Client) 선택 + 캐시/재검증

**서버 패칭:** 초기 로딩 빠름(HTML에 포함). 보안/SEO 유리. Next fetch 캐시/재검증과 잘 결합.

**클라이언트 패칭:** 사용자 상호작용 기반 데이터. 실시간성/폴링/웹소켓 등.

**전략:** "초기 화면 필수 데이터"는 서버. "사용자 액션 후 데이터"는 클라. 캐시/재검증은 데이터 성격(정적/반정적/동적)에 맞게.

---

## 55) SSG/SSR/ISR 차이 + 서비스 성격별 선택

- **SSG:** 빌드 시 생성(가장 빠름, 변경 어려움)
- **SSR:** 요청마다 생성(항상 최신, 비용 큼)
- **ISR:** 정적 + 주기적 재생성(균형)

**선택 기준:** 변경 거의 없음(문서/소개): SSG. 로그인 개인화/항상 최신: SSR 또는 동적 렌더. 뉴스/상품 목록(자주 바뀌지만 매번 SSR은 부담): ISR.

---

## 56) Next 캐시(정적/동적) + revalidate/no-store 기준

- **revalidate:** 일정 시간 캐시 후 재검증
- **no-store:** 캐시하지 않음(항상 최신 필요)

**감각:** 사용자 개인 데이터/권한 민감: no-store. 공용 데이터/변경 주기 있음: revalidate. 완전 정적: 빌드 캐시 활용.

---

## 57) Server Actions란? API Route 대비 장단점

**Server Actions:** 폼/클라이언트에서 서버 함수를 직접 호출하는 듯한 DX. 서버에서 실행되므로 비밀키/DB 접근 가능.

**장점:** 라우트 핸들러(API) 보일러플레이트 줄어듦. 타입/코드 흐름이 한 곳에 모이기 쉬움.

**단점/주의:** 경계(클라/서버) 이해 필요. 캐시/리밸리데이션/에러 처리 패턴을 정교하게 설계해야 함. 외부 공개 API라면 API Route가 더 명확할 때도 많음.

---

## 58) Middleware로 인증/리다이렉트 설계 주의점

- 모든 요청에 걸릴 수 있어 비용/지연에 민감
- Edge 환경 제약(일부 Node API 불가)
- 쿠키/헤더 기반으로 빠르게 판정
- 무한 리다이렉트 루프 방지(예외 경로 설정)

---

## 59) 이미지/폰트 최적화 접근

**이미지:** 적절한 포맷(webp/avif). 크기 맞추기(원본 너무 큰 것 금지). lazy loading, placeholder(blur)로 UX 개선.

**폰트:** 서브셋/필요 굵기만. preload로 FOUT/FOIT 제어. 시스템 폰트 스택도 고려.

---

## 60) 배포 환경에서 env/비밀키/런타임 설정 안전 관리

**원칙:** 비밀키는 절대 클라이언트 번들로 보내지 않기. 서버 전용 env와 클라 노출 env를 분리(접두 규칙 등). CI/CD에서 secret manager 사용(배포 파이프라인에 주입). 런타임 설정이 필요한 값은 "서버에서 읽어서 내려주는 방식"으로 설계(정적 번들에 박지 않기).

---

## 마무리: 면접에서 "대답 구조" 템플릿

각 주제 질문이 오면 아래 순서로 답하면 안정적임:

1. **정의(한 줄):** "이건 ~~다"
2. **왜 필요한가(문제):** "이걸 안 하면 ~~ 문제가 생김"
3. **어떻게 동작하는가(메커니즘):** "내부적으로 ~~ 순서로 처리"
4. **실전 함정 1~2개:** "여기서 흔한 실수는 ~~"
5. **해결 패턴:** "그래서 보통 ~~로 푼다"
