"use client";
import { useLiveQuery } from "dexie-react-hooks";
import { db } from "@/shared/lib/db";
import type { LanguageCode } from "@/shared/constants/language-codes";

export function useEditorQueryData({
  projectId,
  targetLang,
}: {
  projectId?: number;
  targetLang?: LanguageCode;
}) {
  const dbEntries = useLiveQuery(async () => {
    if (!projectId) return [] as any[];
    const list = await db.entries.where("projectId").equals(projectId).toArray();
    return list;
  }, [projectId]);

  const dbUnits = useLiveQuery(async () => {
    if (!projectId || !targetLang) return [] as any[];
    const list = await db.translationUnits.where("projectId").equals(projectId).toArray();
    return list.filter((u) => u.targetLang === targetLang);
  }, [projectId, targetLang]);

  return { dbEntries, dbUnits } as const;
}
