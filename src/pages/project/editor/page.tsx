"use client";
import {
  EditorDrawerLeft,
  EditorSplitView,
} from "@/widgets/editor/EditorPanel";
import { EditorHeader } from "@/widgets/editor/EditorHeader";
import { EditorDataTable } from "@/widgets/editor/EditorDataTable";
import { useTranslateEditor } from "@/features/editor/useTranslateEditor";

export default function TranslatePage() {
  const {
    // data
    entries,
    statuses,
    // view state
    editorMode,
    selected,
    autoNext,
    exportDelim,
    globalFilter,
    highlightedCols,
    // actions
    setEditorMode,
    setSelected,
    setAutoNext,
    setExportDelim,
    setGlobalFilter,
    toggleHighlight,
    updateEntry,
    moveToNext,
    // table
    table,
  } = useTranslateEditor();

  return (
    <div className="space-y-6 flex flex-col w-screen">
      <EditorHeader
        projectName="샘플 프로젝트"
        entriesCount={entries.length}
        globalFilter={globalFilter}
        setGlobalFilter={setGlobalFilter}
        table={table}
        statuses={statuses}
        highlightedCols={highlightedCols}
        toggleHighlight={toggleHighlight}
        editorMode={editorMode}
        setEditorMode={setEditorMode}
        autoNext={autoNext}
        setAutoNext={setAutoNext}
        exportDelim={exportDelim}
        setExportDelim={setExportDelim}
      />

      {editorMode !== "split" ? (
        <>
          <div className="h-[70vh]">
            <EditorDataTable
              table={table}
              editorMode={editorMode}
              selectedId={selected?.id}
              onRowClick={(e) => setSelected(e)}
              highlightedCols={highlightedCols}
              onHeaderToggleHighlight={toggleHighlight}
            />
          </div>
          <EditorDrawerLeft
            open={editorMode === "drawer-left" && !!selected}
            onOpenChange={(o) => !o && setSelected(null)}
            entry={selected}
            onSave={(upd) => {
              updateEntry(upd);
              if (autoNext) moveToNext(upd.id);
              else setSelected(null);
            }}
            glossary={[]}
            project={{}}
          />
        </>
      ) : (
        <div className="grid h-[70vh] gap-6 lg:grid-cols-[minmax(600px,1fr)_minmax(360px,1fr)]">
          <div>
            <EditorDataTable
              table={table}
              editorMode={editorMode}
              selectedId={selected?.id}
              onRowClick={(e) => setSelected(e)}
              highlightedCols={highlightedCols}
              onHeaderToggleHighlight={toggleHighlight}
            />
          </div>
          <div className="h-full overflow-auto rounded-md border">
            <EditorSplitView
              entry={selected}
              onSave={(upd) => {
                updateEntry(upd);
                if (autoNext) moveToNext(upd.id);
              }}
              glossary={[]}
              project={{}}
            />
          </div>
        </div>
      )}
    </div>
  );
}
