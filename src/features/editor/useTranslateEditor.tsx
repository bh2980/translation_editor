"use client";
import type { LanguageCode } from "@/shared/constants/language-codes";
import type { Entry } from "@/entities/editor/types";
import { useEditorQueryData } from "@/features/editor/hooks/useEditorQueryData";
import { useEditorEntries, useMetaKeys } from "@/features/editor/hooks/useEditorEntries";
import { useHighlightedCols } from "@/features/editor/hooks/useHighlightedCols";
import { useEditorState } from "@/features/editor/hooks/useEditorState";
import { useTranslationActions } from "@/features/editor/hooks/useTranslationActions";
import { useEditorColumns } from "@/features/editor/hooks/useEditorColumns";
import { useEditorTable } from "@/features/editor/hooks/useEditorTable";

export function useTranslateEditor({
  projectId,
  targetLang,
}: {
  projectId?: number;
  targetLang?: LanguageCode;
} = {}) {
  const { highlightedCols, toggleHighlight } = useHighlightedCols();
  const { globalFilter, setGlobalFilter, rowSelection, setRowSelection, columnFilters, setColumnFilters } =
    useEditorState();

  const { dbEntries, dbUnits } = useEditorQueryData({ projectId, targetLang });
  const entries: Entry[] = useEditorEntries({ dbEntries, dbUnits });
  const metaKeys = useMetaKeys({ dbEntries, dbUnits });

  const { updateStatus, saveTranslation, findSimilar } = useTranslationActions({ projectId, targetLang });
  const cols = useEditorColumns({ metaKeys, findSimilar, saveTranslation, updateStatus });

  const table = useEditorTable({
    data: entries,
    columns: cols,
    state: { rowSelection, columnFilters, globalFilter },
    handlers: { setRowSelection, setColumnFilters, setGlobalFilter },
  });

  return {
    entries,
    globalFilter,
    highlightedCols,
    setGlobalFilter,
    toggleHighlight,
    // table
    table,
  } as const;
}
