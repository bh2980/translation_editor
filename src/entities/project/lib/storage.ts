"use client"

import type { Project, TranslationEntry, TranslationStatus, AIProvider, GlossaryTerm } from "@/entities/project/model"

const LS_KEY = "game-translate-projects"

// Default glossary terms to populate new projects
const DEFAULT_GLOSSARY_TERMS: Omit<GlossaryTerm, "id">[] = [
  { source: "Player", target: "플레이어", notes: "게임 사용자" },
  { source: "Character", target: "캐릭터", notes: "게임 내 인물" },
  { source: "Level", target: "레벨", notes: "단계, 수준" },
  { source: "Quest", target: "퀘스트", notes: "임무, 과제" },
  { source: "Item", target: "아이템", notes: "게임 내 물건" },
  { source: "Inventory", target: "인벤토리", notes: "소지품 창" },
  { source: "Equipment", target: "장비", notes: "착용 가능한 아이템" },
  { source: "Weapon", target: "무기", notes: "공격용 장비" },
  { source: "Armor", target: "방어구", notes: "방어용 장비" },
  { source: "Shield", target: "방패", notes: "방어용 무기" },
  { source: "Potion", target: "포션", notes: "회복 아이템" },
  { source: "Magic", target: "마법", notes: "초자연적 능력" },
  { source: "Spell", target: "주문", notes: "마법 기술" },
  { source: "Skill", target: "스킬", notes: "능력, 기술" },
  { source: "Experience", target: "경험치", notes: "성장 포인트" },
  { source: "Health", target: "체력", notes: "생명력" },
  { source: "Mana", target: "마나", notes: "마법력" },
  { source: "Stamina", target: "스태미나", notes: "지구력" },
  { source: "Attack", target: "공격", notes: "적을 해치는 행위" },
  { source: "Defense", target: "방어", notes: "공격을 막는 행위" },
  { source: "Boss", target: "보스", notes: "강력한 적" },
  { source: "Enemy", target: "적", notes: "상대방" },
  { source: "Monster", target: "몬스터", notes: "괴물" },
  { source: "Dragon", target: "드래곤", notes: "용" },
  { source: "Warrior", target: "전사", notes: "근접 전투 직업" },
  { source: "Mage", target: "마법사", notes: "마법 사용 직업" },
  { source: "Archer", target: "궁수", notes: "원거리 공격 직업" },
  { source: "Healer", target: "힐러", notes: "치료 전문 직업" },
  { source: "Guild", target: "길드", notes: "플레이어 조합" },
  { source: "Party", target: "파티", notes: "소규모 그룹" },
  { source: "Team", target: "팀", notes: "협력 그룹" },
  { source: "Battle", target: "전투", notes: "싸움" },
  { source: "Victory", target: "승리", notes: "이김" },
  { source: "Defeat", target: "패배", notes: "짐" },
  { source: "Score", target: "점수", notes: "성과 측정" },
  { source: "Ranking", target: "랭킹", notes: "순위" },
  { source: "Leaderboard", target: "리더보드", notes: "순위표" },
  { source: "Achievement", target: "업적", notes: "성취" },
  { source: "Trophy", target: "트로피", notes: "상장" },
  { source: "Reward", target: "보상", notes: "상품" },
  { source: "Treasure", target: "보물", notes: "귀중품" },
  { source: "Gold", target: "골드", notes: "게임 화폐" },
  { source: "Coin", target: "코인", notes: "동전" },
  { source: "Currency", target: "화폐", notes: "돈" },
  { source: "Shop", target: "상점", notes: "구매 장소" },
  { source: "Merchant", target: "상인", notes: "판매자" },
  { source: "Trade", target: "거래", notes: "교환" },
  { source: "Buy", target: "구매", notes: "사기" },
  { source: "Sell", target: "판매", notes: "팔기" },
  { source: "Price", target: "가격", notes: "값" },
  { source: "Map", target: "지도", notes: "지형 정보" },
  { source: "World", target: "세계", notes: "게임 배경" },
  { source: "Dungeon", target: "던전", notes: "지하 미로" },
  { source: "Castle", target: "성", notes: "요새" },
  { source: "Village", target: "마을", notes: "작은 정착지" },
  { source: "City", target: "도시", notes: "큰 정착지" },
  { source: "Forest", target: "숲", notes: "나무가 많은 곳" },
  { source: "Mountain", target: "산", notes: "높은 지형" },
  { source: "River", target: "강", notes: "물길" },
  { source: "Ocean", target: "바다", notes: "큰 물" },
  { source: "Desert", target: "사막", notes: "모래 지역" },
  { source: "Cave", target: "동굴", notes: "바위 구멍" },
  { source: "Tower", target: "탑", notes: "높은 건물" },
  { source: "Bridge", target: "다리", notes: "연결 구조물" },
  { source: "Gate", target: "문", notes: "출입구" },
  { source: "Portal", target: "포털", notes: "이동 통로" },
  { source: "Teleport", target: "순간이동", notes: "즉시 이동" },
  { source: "Save", target: "저장", notes: "진행 상황 보관" },
  { source: "Load", target: "불러오기", notes: "저장된 데이터 복원" },
  { source: "Continue", target: "계속", notes: "진행" },
  { source: "Start", target: "시작", notes: "개시" },
  { source: "Exit", target: "종료", notes: "나가기" },
  { source: "Pause", target: "일시정지", notes: "잠시 멈춤" },
  { source: "Resume", target: "재개", notes: "다시 시작" },
  { source: "Settings", target: "설정", notes: "옵션" },
  { source: "Options", target: "옵션", notes: "선택사항" },
  { source: "Controls", target: "조작", notes: "컨트롤" },
  { source: "Graphics", target: "그래픽", notes: "화면 표현" },
  { source: "Sound", target: "사운드", notes: "소리" },
  { source: "Music", target: "음악", notes: "배경음" },
  { source: "Volume", target: "볼륨", notes: "소리 크기" },
  { source: "Difficulty", target: "난이도", notes: "어려움 정도" },
  { source: "Easy", target: "쉬움", notes: "낮은 난이도" },
  { source: "Normal", target: "보통", notes: "중간 난이도" },
  { source: "Hard", target: "어려움", notes: "높은 난이도" },
  { source: "Expert", target: "전문가", notes: "최고 난이도" },
  { source: "Tutorial", target: "튜토리얼", notes: "학습 과정" },
  { source: "Help", target: "도움말", notes: "안내" },
  { source: "Guide", target: "가이드", notes: "안내서" },
  { source: "Manual", target: "매뉴얼", notes: "사용법" },
  { source: "Hint", target: "힌트", notes: "단서" },
  { source: "Tip", target: "팁", notes: "조언" },
  { source: "Warning", target: "경고", notes: "주의사항" },
  { source: "Error", target: "오류", notes: "문제" },
  { source: "Loading", target: "로딩", notes: "불러오는 중" },
  { source: "Connecting", target: "연결 중", notes: "접속 중" },
  { source: "Online", target: "온라인", notes: "네트워크 연결" },
  { source: "Offline", target: "오프라인", notes: "네트워크 미연결" },
  { source: "Multiplayer", target: "멀티플레이어", notes: "다중 사용자" },
  { source: "Singleplayer", target: "싱글플레이어", notes: "단일 사용자" },
  { source: "Co-op", target: "협동", notes: "협력 플레이" },
  { source: "PvP", target: "PvP", notes: "플레이어 대 플레이어" },
  { source: "PvE", target: "PvE", notes: "플레이어 대 환경" },
  { source: "Campaign", target: "캠페인", notes: "주요 스토리" },
  { source: "Mission", target: "미션", notes: "임무" },
  { source: "Objective", target: "목표", notes: "달성 과제" },
  { source: "Progress", target: "진행도", notes: "완료 상황" },
  { source: "Complete", target: "완료", notes: "끝남" },
  { source: "Failed", target: "실패", notes: "실패함" },
  { source: "Success", target: "성공", notes: "성공함" },
]

export function loadAllProjects(): Project[] {
  if (typeof window === "undefined") return []
  try {
    const raw = localStorage.getItem(LS_KEY)
    return raw ? (JSON.parse(raw) as Project[]) : []
  } catch {
    return []
  }
}

export function loadProject(id: string): Project {
  return loadAllProjects().find((p) => p.id === id) as Project
}

export function saveProject(project: Project) {
  const all = loadAllProjects()
  const idx = all.findIndex((p) => p.id === project.id)
  if (idx >= 0) {
    all[idx] = project
  } else {
    all.push(project)
  }
  localStorage.setItem(LS_KEY, JSON.stringify(all))
}

export function deleteProject(id: string) {
  const next = loadAllProjects().filter((p) => p.id !== id)
  localStorage.setItem(LS_KEY, JSON.stringify(next))
}

export async function importProjectFromFile(file: File): Promise<Project | null> {
  const text = await file.text()
  const proj = JSON.parse(text) as Project
  saveProject(proj)
  return proj
}

export function exportProjectToFile(project: Project) {
  const blob = new Blob([JSON.stringify(project, null, 2)], { type: "application/json" })
  const url = URL.createObjectURL(blob)
  const a = document.createElement("a")
  a.href = url
  a.download = `${project.name.replace(/\s+/g, "_")}_${project.id}.json`
  document.body.appendChild(a)
  a.click()
  a.remove()
  URL.revokeObjectURL(url)
}

function createDefaultGlossary(): GlossaryTerm[] {
  return DEFAULT_GLOSSARY_TERMS.map((term) => ({
    ...term,
    id: crypto.randomUUID(),
  }))
}

export function createEmptyProject({
  id,
  name,
  sourceLang,
  targetLang,
  rows,
  mapping,
}: {
  id: string
  name: string
  sourceLang: string
  targetLang: string
  rows: Record<string, any>[]
  mapping: { key: string; source: string; target?: string; status?: string }
}) {
  const statuses: TranslationStatus[] = [
    { id: crypto.randomUUID(), name: "미번역", color: "slate", order: 0 },
    { id: crypto.randomUUID(), name: "초벌 번역", color: "amber", order: 1 },
    { id: crypto.randomUUID(), name: "번역 완료", color: "emerald", order: 2 },
    { id: crypto.randomUUID(), name: "검수 완료", color: "violet", order: 3 },
  ]
  const statusByName = new Map(statuses.map((s) => [s.name, s.id]))
  const defaultStatusId = statusByName.get("미번역")!

  const entries: TranslationEntry[] = rows.map((r, i) => {
    const key = String(r[mapping.key] ?? "")
    const source = String(r[mapping.source] ?? "")
    const target = mapping.target ? String(r[mapping.target] ?? "") : ""
    const rawStatus = mapping.status ? String(r[mapping.status] ?? "") : ""
    const statusId =
      rawStatus && statusByName.get(rawStatus) ? (statusByName.get(rawStatus) as string) : defaultStatusId
    return {
      id: crypto.randomUUID(),
      key,
      source,
      target,
      statusId,
    }
  })

  const now = Date.now()
  const project: Project = {
    id,
    name,
    createdAt: now,
    updatedAt: now,
    sourceLang,
    targetLang,
    statuses,
    entries,
    profiles: [],
    glossary: createDefaultGlossary(),
    aiAgent: {
      provider: "openai" as AIProvider,
      apiKey: "",
      model: "gpt-4o-mini",
      promptTemplate:
        "You are a professional game localization translator. Translate from {{sourceLang}} to {{targetLang}}. " +
        "Preserve placeholders exactly (e.g., {playerName}, <b>...</b>, %s, %d). Use glossary: {{glossary}}. " +
        "Return only the translated text.",
    },
    columnMapping: mapping,
  }
  return project
}

export function createBlankProject({
  id,
  name,
  sourceLang,
  targetLang,
}: {
  id: string
  name: string
  sourceLang: string
  targetLang: string
}) {
  const statuses: TranslationStatus[] = [
    { id: crypto.randomUUID(), name: "미번역", color: "slate", order: 0 },
    { id: crypto.randomUUID(), name: "초벌 번역", color: "amber", order: 1 },
    { id: crypto.randomUUID(), name: "번역 완료", color: "emerald", order: 2 },
    { id: crypto.randomUUID(), name: "검수 완료", color: "violet", order: 3 },
  ]
  const now = Date.now()
  const project: Project = {
    id,
    name,
    createdAt: now,
    updatedAt: now,
    sourceLang,
    targetLang,
    statuses,
    entries: [],
    profiles: [],
    glossary: createDefaultGlossary(),
    aiAgent: {
      provider: "openai" as AIProvider,
      apiKey: "",
      model: "gpt-4o-mini",
      promptTemplate:
        "You are a professional game localization translator. Translate from {{sourceLang}} to {{targetLang}}. " +
        "Preserve placeholders exactly (e.g., {playerName}, <b>...</b>, %s, %d). Use glossary: {{glossary}}. " +
        "Return only the translated text.",
    },
    columnMapping: undefined,
  }
  return project
}
