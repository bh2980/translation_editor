/// <reference types="vite/client" />

interface ImportMetaEnv {
  // Vite의 기본 타입과 충돌을 피하기 위해 추가 속성만 정의
  // DEV, PROD, MODE는 이미 vite/client에서 정의됨
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
