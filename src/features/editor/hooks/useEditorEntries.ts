"use client";
import { useMemo } from "react";
import type { LanguageCode } from "@/shared/constants/language-codes";
import type { Entry } from "@/entities/editor/types";

export function useEditorEntries({
  dbEntries,
  dbUnits,
}: {
  dbEntries?: any[] | null;
  dbUnits?: any[] | null;
}) {
  const entries: Entry[] = useMemo(() => {
    const dataMap = new Map<string, any>();
    (dbEntries ?? []).forEach((e: any) => dataMap.set(`${e.projectId}:${e.key}`, e));
    return (dbUnits ?? []).map((u: any) => {
      const data = dataMap.get(`${u.projectId}:${u.key}`);
      return {
        id: String(u.id ?? `${u.projectId}:${u.key}:${u.targetLang}`),
        key: String(u.key ?? ""),
        source: String(data?.source ?? ""),
        target: String(u?.target ?? ""),
        meta: (data?.meta as Record<string, unknown> | undefined) ?? undefined,
        statusId: String(u?.statusId ?? ""),
        projectId: u.projectId as number,
        targetLang: u.targetLang as LanguageCode,
        unitId: u.id as number | undefined,
      } as Entry;
    });
  }, [dbEntries, dbUnits]);

  return entries;
}

export function useMetaKeys({
  dbEntries,
  dbUnits,
  limit = 8,
}: {
  dbEntries?: any[] | null;
  dbUnits?: any[] | null;
  limit?: number;
}) {
  return useMemo(() => {
    const keysForUnits = new Set<string>((dbUnits ?? []).map((u: any) => String(u.key)));
    const s = new Set<string>();
    (dbEntries ?? []).forEach((e: any) => {
      if (!keysForUnits.has(String(e.key))) return;
      if (e?.meta && typeof e.meta === "object") {
        Object.keys(e.meta).forEach((k) => s.add(k));
      }
    });
    return Array.from(s).slice(0, limit);
  }, [dbEntries, dbUnits, limit]);
}

