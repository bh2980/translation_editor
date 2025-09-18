"use client";
import { db } from "@/shared/lib/db";
import type { Entry } from "@/entities/editor/types";
import type { LanguageCode } from "@/shared/constants/language-codes";

export function useTranslationActions({
  projectId,
  targetLang,
}: {
  projectId?: number;
  targetLang?: LanguageCode;
}) {
  async function updateStatus(entry: Entry, statusId: string) {
    if (!entry.projectId || !entry.targetLang) return;
    const units = await db.translationUnits.where("projectId").equals(entry.projectId).toArray();
    const hit = units.find((u) => u.key === entry.key && u.targetLang === entry.targetLang);
    if (hit?.id != null) {
      await db.translationUnits.update(hit.id, { statusId, updatedAt: Date.now() });
    }
  }

  async function saveTranslation(entry: Entry, target: string | undefined) {
    if (entry.unitId != null) {
      await db.translationUnits.update(entry.unitId, {
        target,
        updatedAt: Date.now(),
      });
      return;
    }
    if (entry.projectId && entry.targetLang) {
      const all = await db.translationUnits.where("projectId").equals(entry.projectId).toArray();
      const hit = all.find((u) => u.key === entry.key && u.targetLang === entry.targetLang);
      if (hit?.id != null) {
        await db.translationUnits.update(hit.id, { target, updatedAt: Date.now() });
      }
    }
  }

  async function findSimilar(entry: Pick<Entry, "key" | "source">) {
    if (!projectId) return [] as Array<Pick<Entry, "key" | "source" | "target">>;
    const dataList = await db.entries.where("projectId").equals(projectId).toArray();
    const tokens = String(entry.source || "")
      .toLowerCase()
      .split(/\s+/)
      .filter((t: string) => t.length >= 3)
      .slice(0, 8);
    const scored = dataList
      .filter((d: any) => d.key !== entry.key)
      .map((d: any) => {
        const s = String(d.source || "").toLowerCase();
        const score = tokens.reduce((acc, t) => acc + (s.includes(t) ? 1 : 0), 0);
        return { d, score };
      })
      .filter((x) => x.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, 10);

    let unitMap = new Map<string, any>();
    if (targetLang) {
      const units = await db.translationUnits.where("projectId").equals(projectId).toArray();
      unitMap = new Map(units.map((u: any) => [`${u.key}:${u.targetLang}`, u]));
    }
    return scored.map(({ d }) => ({
      key: d.key,
      source: d.source,
      target: targetLang ? unitMap.get(`${d.key}:${targetLang}`)?.target : undefined,
    }));
  }

  return { updateStatus, saveTranslation, findSimilar } as const;
}
