import { Project } from "@/entities/project";
import type { Data } from "@/entities/entry";
import type { TranslationUnit } from "@/entities/translation-unit/model";
import Dexie, { type EntityTable } from "dexie";

const db = new Dexie("TranslationDatabase") as Dexie & {
  projects: EntityTable<
    Project,
    "id" // primary key "id" (for the typings only)
  >;
  entries: EntityTable<
    Data,
    "id"
  >;
  translationUnits: EntityTable<
    TranslationUnit,
    "id"
  >;
};

// Schema declaration: 검색.정렬에 사용할 필드만 적어둠 -> 이걸로 인덱스를 사용
db.version(1).stores({
  projects: "++id, name, createdAt",
});

db.version(2).stores({
  entries: "++id, projectId, key, createdAt",
});

db.version(3).stores({
  translationUnits: "++id, projectId, key, targetLang, sourceLang, createdAt",
});

db.version(4).stores({
  // refine indexes: ensure entries no longer include targetLang
  entries: "++id, projectId, key, createdAt",
});

export { db };
