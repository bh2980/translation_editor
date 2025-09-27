"use client";

export default function HomePage() {
  return (
    <main className="mx-auto max-w-6xl px-6 py-10">
      <header className="mb-10">
        <h1 className="text-3xl font-semibold tracking-tight">
          게임 스크립트 번역 에디터
        </h1>
        <p className="text-muted-foreground mt-2">
          CSV, XLSX 스크립트를 불러와 매핑하고, 표 기반으로 번역하고, AI 도움을
          받아 워크플로우를 가속하세요.
        </p>
      </header>
    </main>
  );
}