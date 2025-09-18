"use client";
import EditorToolbar from "@/widgets/editor/EditorToolbar";
import { EditorDataTable } from "@/widgets/editor/EditorDataTable";
import { useTranslateEditor } from "@/features/editor/useTranslateEditor";
import { useNavigate, useParams } from "react-router-dom";
import { useLiveQuery } from "dexie-react-hooks";
import { db } from "@/shared/lib/db";
import { useEffect, useMemo, useState } from "react";
import type { LanguageCode } from "@/shared/constants/language-codes";
import JsonImportDialog from "@/features/import/JsonImportDialog";

export default function TranslatePage() {
  const { id } = useParams<{ id: string }>();
  const project = useLiveQuery(async () => {
    if (!id) return undefined;
    return db.projects.get(Number(id));
  }, [id]);
  const targetLangs = useMemo(() => (project?.targetLang as LanguageCode[] | undefined) ?? [], [project]);
  const [currentLang, setCurrentLang] = useState<LanguageCode | undefined>(
    targetLangs[0]
  );
  const navigate = useNavigate();
  const [showJsonImport, setShowJsonImport] = useState(false);
  const [importText, setImportText] = useState<string | undefined>(undefined);
  useEffect(() => {
    if (!currentLang && targetLangs.length > 0) {
      setCurrentLang(targetLangs[0]);
    }
  }, [targetLangs, currentLang]);
  const { entries, globalFilter, highlightedCols, setGlobalFilter, toggleHighlight, table } = useTranslateEditor({
    projectId: id ? Number(id) : undefined,
    targetLang: currentLang,
  });

  return (
    <div className="flex flex-col gap-6 w-full flex-1 min-h-0">
      <EditorToolbar
        targetLangs={targetLangs}
        currentLang={currentLang}
        onChangeLang={(c) => setCurrentLang(c)}
        onImportJson={async (file) => {
          try {
            const text = await file.text();
            setImportText(text);
          } catch (e) {
            // ignore
          }
          setShowJsonImport(true);
        }}
        onImportCsv={(file) => {
          alert(`CSV 불러오기: ${file.name} (더미)`);
        }}
        onExportJson={() => {
          alert("JSON으로 내보내기 (더미)");
        }}
        globalFilter={globalFilter}
        setGlobalFilter={setGlobalFilter}
        selectionCount={table.getSelectedRowModel().rows.length}
        onDeleteSelected={async () => {
          const ids = table
            .getSelectedRowModel()
            .rows.map((r) => r.original.unitId)
            .filter((v): v is number => typeof v === "number");
          if (!ids.length) return;
          if (!confirm(`${ids.length}건을 삭제할까요?`)) return;
          await db.translationUnits.bulkDelete(ids as any);
          table.resetRowSelection();
        }}
        onAddLanguage={() => navigate(`/project/${id}/settings`)}
      />
      <JsonImportDialog
        open={showJsonImport}
        onOpenChange={setShowJsonImport}
        projectId={Number(id)}
        targetLangs={targetLangs}
        initialText={importText}
        sourceLang={project?.sourceLang as any}
      />

      <div className="flex-1 min-h-0 overflow-hidden">
        <EditorDataTable
          table={table}
          editorMode={"popover"}
          selectedId={null}
          highlightedCols={highlightedCols}
          onHeaderToggleHighlight={toggleHighlight}
        />
      </div>
    </div>
  );
}
