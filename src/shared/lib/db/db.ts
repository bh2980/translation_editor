import { Project } from "@/entities/project";
import Dexie, { type EntityTable } from "dexie";

const db = new Dexie("TranslationDatabase") as Dexie & {
  projects: EntityTable<
    Project,
    "id" // primary key "id" (for the typings only)
  >;
};

// Schema declaration: 검색.정렬에 사용할 필드만 적어둠 -> 이걸로 인덱스를 사용
db.version(1).stores({
  projects: "++id, name, createdAt", // primary key "id" (for the runtime!)
});

export { db };
