# Setup & Workflow Commands

AI는 작업을 시작하기 전에 아래 명령어를 사용해 개발 환경을 설정하고 유효성을 검사해야 한다.

| 역할        | 명령어         | 설명                                      |
| ----------- | -------------- | ----------------------------------------- |
| 의존성 설치 | pnpm init      | 모든 프로젝트 의존성을 설치               |
| 개발 서버   | pnpm dev       | 로컬 개발 서버 실행                       |
| 유닛 테스트 | pnpm test:unit | vitest 기반 단위 테스트 실행              |
| E2E 테스트  | pnpm test:e2e  | Playwright 기반 E2E 테스트 실행(HEADLESS) |

# 동작 환경

- Node.js v20.x 이상
- TypeScript strict 모드
- React v18 이상
- Zustand, react-router-dom v6, TailwindCSS
- shadcn/ui(src/shared/ui/\*), lucide-react, date-fns
- vitest, @testing-library/react, Playwright
- Prettier (탭 2칸, 세미콜론 필수, 홑따옴표)
- ESLint (airbnb-base + typescript-eslint)

# 네이밍 컨벤션

- 변수/함수: camelCase
- 클래스/타입/컴포넌트 파일: PascalCase
- 훅 파일: use 접두사 + camelCase
- 상수: UPPER_SNAKE_CASE
- 단위 테스트: `<원본파일명>.test.ts(x)` (소스와 나란히)
- E2E 테스트: `e2e/<도메인>/<기능>.spec.ts`
- 디렉터리: kebab-case
- 스코프(scope): FSD 레이어/도메인명과 동일
- 테스트 셀렉터: data-testid/data-test만 사용

# 개발 흐름

1. PR 이름과 동일한 노션 기술 명세서를 반드시 참조한다.
   문서가 없거나 접근 불가하면 작업을 진행하지 않고 문서 제공을 요청한다.
2. 기술 명세서로부터 테스트 자동 생성 (테스트 파일은 수정하지 않음)
   - 단위 테스트: vitest, @testing-library/react
   - E2E 테스트: Playwright (`*.spec.ts`, `e2e/` 디렉터리)
3. 기능 구현 (최소 스펙)
4. 테스트 통과까지 반복
5. 결과 문서화 및 모듈 역할·상관관계 기록

# 구현 원칙

- 최소한의 스펙으로 구현, 과잉 설계 금지
- Presentation / Business Logic 구분
- 모듈 역할 및 상관관계 1줄 정의
- 테스트 통과 = 구현 완료
- 스펙 변경은 코드 수정이 아니라 스펙 문서/스키마 수정으로만 가능

# 커밋 전략

## 정의

- 스펙 = 1 Branch = 1 PR (테스트 통과까지 포함)
- 커밋 = 스펙을 구성하는 최소 변화 단위
  - 예: UI 구조 / 상태 로직 / API 연동 / 테스트 / 문서 갱신
- 원칙: PR은 스펙 단위 완결, 커밋은 스펙 내부의 세부 단계 기록

## 메시지

- 형식: `<type>(<scope>): <subject>`
- type: feat | fix | docs | refactor | test | chore | ci | build
- scope: 레이어/도메인 (예: features/navbar)
- subject: 50자 이내, 한글, 소문자 시작, 마침표 금지

## body / footer

- 작성 금지
- 예외: 재현 방법, 설계 변경 이유 등 필수 맥락
- BREAKING CHANGE 발생 시 footer에 명시

## 커밋 단위 규칙

- 한 커밋 = 한 가지 의도 (혼합 금지: 기능 + 리팩터 X)
- 테스트 추가/수정은 `test:` 커밋으로 분리한다.
  - 단위 테스트는 `test(unit): ...`
  - E2E 테스트는 `test(e2e): ...`
- 포맷팅/정리는 `chore:` 단독 커밋

### 강제 분할 조건

- 파일 변경 10개 초과
- 순수 코드 변경(추가+삭제) 400라인 초과 (테스트/스냅샷 제외)
- UI/상태/API 로직이 한 커밋에 섞임

### 권장 분할 조건

- 새로운 도메인 엔티티 추가 시
- 외부 라이브러리 도입 시
- 문서 갱신은 코드와 분리 가능하면 분리

## 금지 사항

- 혼합 커밋(기능 + 리팩터 + 포맷팅)
- 스펙 문서 미수정 상태에서의 코드 기반 스펙 변경
- 테스트 없는 기능 추가/버그 수정
- E2E에서 `test.only`/`fixme` 방치
- 사유 없는 대규모 스냅샷 갱신

# 테스트 규칙

## 유닛/컴포넌트 (Vitest + Testing Library)

- 위치: 원본과 나란히 `<원본파일명>.test.ts(x)`
- 쿼리: getByRole > getByLabelText > … > getByTestId
- 상호작용: userEvent 사용, setTimeout 대기 금지
- Provider는 renderWithProviders() 사용
- 스냅샷: 의미 있는 단편만
- 금지: screen.debug(), console.log 커밋

## E2E (Playwright)

- 위치: `e2e/<도메인>/<기능>.spec.ts`
- 최소 시나리오: 성공/실패 각 1건
- 셀렉터: data-testid/data-test만
- 네트워크: 실제 백엔드, 필요 시 최소 모킹
- 대기: 조건 기반 wait, 고정 시간 금지
- 실패 시 trace/screenshot/video 보존
- 금지: test.only, fixme 방치

# 프로젝트 구조(FSD)

- app: 앱 초기화·글로벌 설정 (app, routes/router.tsx)
- pages: URL에 대응하는 페이지 컴포지션 (pages/\*)
- widgets: 페이지 내 굵은 섹션 단위 블록 (widgets/\*)
- features: 독립적 사용자 기능 단위 (features/\*)
- entities: 도메인 모델과 타입 정의 (entities/\*)
- shared: 공용 유틸리티와 디자인 시스템 (shared/\*)

# 코드 설계 원칙

위험도가 높을수록 응집도·결합도 우선, 위험이 낮을수록 가독성 우선.

1. 가독성 : 한 번에 들여다봐야 하는 맥락을 줄이고, 위에서 아래로 자연스럽게 읽히게 한다.

- 맥락 줄이기: 동시에 실행되지 않는 코드를 분리한다. 단일 컴포넌트/함수에 상호 배타적 분기를 교차 배치하지 않는다.
- 구현 상세 추상화: 역할(무엇을)과 구현(어떻게)을 분리한다. HOC/Wrapper/전용 컴포넌트로 이동·검증 같은 부수 로직을 감싼다.
- 함수 쪼개기: 로직 종류(쿼리 파라미터, 상태, API 등)를 한 함수에 혼합하지 않는다. 이름 가능한 최소 책임 단위로 분리한다.
- 이름 붙이기: 복잡한 조건·매직 넘버에 명시적 이름을 부여해 의도를 드러낸다.
- 위→아래 흐름: 시점 이동을 줄이고, 삼항 연산자는 단순하게 유지한다.

2. 예측 가능성 : 일관 규칙을 통해 동작을 이름·입력·출력만으로 추정할 수 있게 한다.

- 이름 충돌 금지: 범위·레이어별 네이밍 규칙을 정의하고 중복·오해 유발 명칭을 금한다.
- 반환 타입 통일: 동일 범주의 함수는 동일한 에러/로딩/데이터 표현을 반환한다.
- 숨은 로직 노출: 암묵적 규칙(디폴트 변환, 보정 로직 등)을 API 표면으로 끌어올린다.

3. 응집도 : 함께 바뀌는 것들이 물리적으로·논리적으로 함께 존재하도록 구조화한다.

- 공변 변경 묶기: 함께 수정되는 파일을 같은 디렉터리/모듈로 묶는다.
- 상수 중앙화: 매직 넘버를 도메인 상수로 승격하여 변경 지점을 단일화한다.
- 폼 단위 응집: 입력 필드·검증·전송 로직을 물리적으로 가깝게 둔다.

4. 결합도 : 변경의 영향 범위를 최소화한다.

- 단일 책임 원칙(현실적 적용): Hook/컴포넌트/함수는 한 가지 책임만 가진다.
- 중복 허용의 원칙: 결합도를 낮추기 위해 필요한 중복을 수용한다(의미 없는 DRY 금지).
- 데이터 전달 최소화: Props Drilling 제거 — 컨텍스트/컴포지션/상위 추상 계층으로 대체.
