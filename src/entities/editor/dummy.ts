import type { Entry, Status } from "./types";

export const dummyStatuses: Status[] = [
  { id: "1", name: "미번역", color: "slate" },
  { id: "2", name: "초벌 번역", color: "amber" },
  { id: "3", name: "번역 완료", color: "emerald" },
  { id: "4", name: "검수 완료", color: "violet" },
];

export const dummyEntries: Entry[] = [
  {
    id: "1",
    key: "GREETING",
    source: "Hello, adventurer!",
    target: "안녕하세요, 모험가님!",
    statusId: "4",
  },
  {
    id: "2",
    key: "FAREWELL",
    source: "Goodbye, brave warrior.",
    target: "안녕히 가세요, 용감한 전사여.",
    statusId: "3",
  },
  {
    id: "3",
    key: "ITEM_APPLE",
    source: "A juicy red apple.",
    target: "아주 맛있는 빨간 사과.",
    statusId: "2",
  },
  {
    id: "4",
    key: "QUEST_START",
    source: "Please defeat 10 slimes.",
    target: "",
    statusId: "1",
  },
];

