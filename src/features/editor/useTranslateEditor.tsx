"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import type { ColumnDef, ColumnFiltersState } from "@tanstack/react-table";
import {
  getCoreRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  useReactTable,
} from "@tanstack/react-table";

import { statusColorToClass } from "@/shared/ui/status-badge";
import {
  Select as UiSelect,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/ui/select";
import { Checkbox } from "@/shared/ui/checkbox";
import {
  TextColumnFilter,
  StatusColumnFilter,
} from "@/shared/ui/column-filter";
import { EditorCellPopover, EditorMode } from "@/widgets/editor/EditorPanel";
import { dummyEntries, dummyStatuses } from "@/entities/editor/dummy";
import type { Entry, Status } from "@/entities/editor/types";

export function useTranslateEditor() {
  const [entries, setEntries] = useState<Entry[]>(dummyEntries);
  const [statuses, setStatuses] = useState<Status[]>(dummyStatuses);
  const [globalFilter, setGlobalFilter] = useState("");
  const [selected, setSelected] = useState<Entry | null>(null);
  const [editorMode, setEditorMode] = useState<EditorMode>("popover");
  const [rowSelection, setRowSelection] = useState<Record<string, boolean>>({});
  const [highlightedCols, setHighlightedCols] = useState<
    Record<string, boolean>
  >({});
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [autoNext, setAutoNext] = useState(false);
  const [exportDelim, setExportDelim] = useState<string>(",");

  const targetCellRefs = useRef<Record<string, HTMLButtonElement | null>>({});

  function updateEntry(update: Entry) {
    setEntries((prev) => prev.map((e) => (e.id === update.id ? update : e)));
  }

  function moveToNext(fromId: string) {
    const idx = entries.findIndex((e) => e.id === fromId);
    if (idx >= 0 && idx + 1 < entries.length) {
      const next = entries[idx + 1];
      if (editorMode === "popover") {
        const btn = targetCellRefs.current[next.id];
        if (btn) setTimeout(() => btn.click(), 10);
      } else {
        setSelected(next);
      }
    }
  }

  function toggleHighlight(colId: string) {
    setHighlightedCols((prev) => ({ ...prev, [colId]: !prev[colId] }));
  }

  const cols = useMemo<ColumnDef<Entry>[]>(
    () => [
      {
        id: "select",
        header: ({ table }) => (
          <div className="px-2">
            <Checkbox
              checked={
                table.getIsAllPageRowsSelected() ||
                (table.getIsSomePageRowsSelected() && "indeterminate")
              }
              onCheckedChange={(v) => table.toggleAllPageRowsSelected(!!v)}
              aria-label="전체 선택"
            />
          </div>
        ),
        cell: ({ row }) => (
          <div className="px-2">
            <Checkbox
              checked={row.getIsSelected()}
              onCheckedChange={(v) => row.toggleSelected(!!v)}
              aria-label="행 선택"
            />
          </div>
        ),
        size: 44,
        enableResizing: false,
        enableColumnFilter: false,
      },
      {
        id: "status",
        accessorFn: (row) => row.statusId,
        header: ({ column }) => (
          <div className="flex items-center justify-between">
            <span>번역 상태</span>
            <StatusColumnFilter column={column} statuses={statuses} />
          </div>
        ),
        cell: ({ row }) => {
          const e = row.original;
          return (
            <UiSelect
              value={e.statusId}
              onValueChange={(val) => updateEntry({ ...e, statusId: val })}
            >
              <SelectTrigger className="h-8">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {statuses.map((s) => (
                  <SelectItem key={s.id} value={s.id}>
                    <span className={`inline-flex items-center gap-2`}>
                      <span
                        className={`h-2 w-2 rounded-full ${statusColorToClass(
                          s.color
                        )}`}
                      />
                      {s.name}
                    </span>
                  </SelectItem>
                ))}
              </SelectContent>
            </UiSelect>
          );
        },
        size: 160,
        filterFn: "equalsString",
        enableColumnFilter: true,
      },
      {
        accessorKey: "key",
        header: ({ column }) => (
          <div className="flex items-center justify-between">
            <span>key</span>
            <TextColumnFilter column={column} placeholder="key 포함 텍스트" />
          </div>
        ),
        cell: ({ getValue }) => (
          <span className="font-mono text-xs">{String(getValue() ?? "")}</span>
        ),
        size: 220,
        filterFn: "includesString",
        enableColumnFilter: true,
      },
      {
        accessorKey: "source",
        header: ({ column }) => (
          <div className="flex items-center justify-between">
            <span>원문</span>
            <TextColumnFilter column={column} placeholder="원문 포함 텍스트" />
          </div>
        ),
        cell: ({ getValue }) => (
          <span className="block">{String(getValue() ?? "")}</span>
        ),
        size: 520,
        filterFn: "includesString",
        enableColumnFilter: true,
      },
      {
        id: "target",
        header: ({ column }) => (
          <div className="flex items-center justify-between">
            <span>번역</span>
            <TextColumnFilter column={column} placeholder="번역 포함 텍스트" />
          </div>
        ),
        cell: ({ row }) => {
          const e = row.original;
          const content = e.target ? (
            <span className="line-clamp-3">{e.target}</span>
          ) : (
            <span className="text-muted-foreground">클릭하여 번역 입력…</span>
          );

          if (editorMode === "popover") {
            return (
              <EditorCellPopover
                entry={e}
                onSave={updateEntry}
                onSaved={(saved) => autoNext && moveToNext(saved.id)}
                glossary={[]}
                project={{}}
              >
                <button
                  ref={(el) => {
                    targetCellRefs.current[e.id] = el;
                  }}
                  className="w-full rounded-md border bg-background px-2 py-1 text-left hover:bg-muted"
                >
                  {content}
                </button>
              </EditorCellPopover>
            );
          }
          return (
            <button
              ref={(el) => {
                targetCellRefs.current[e.id] = el;
              }}
              className="w-full rounded-md border bg-background px-2 py-1 text-left hover:bg-muted"
              onClick={() => setSelected(e)}
              aria-label="번역 편집"
            >
              {content}
            </button>
          );
        },
        size: 520,
        filterFn: "includesString",
        enableColumnFilter: true,
      },
      {
        id: "actions",
        header: "작업",
        cell: () => (
          <button
            className="inline-flex items-center gap-1 rounded-md border px-2 py-1 text-xs"
            onClick={() => alert("AI 번역 (더미)")}
          >
            AI 번역
          </button>
        ),
        size: 140,
        enableColumnFilter: false,
      },
    ],
    [statuses, editorMode, autoNext, entries]
  );

  const table = useReactTable({
    data: entries,
    columns: cols,
    state: { rowSelection, columnFilters, globalFilter },
    onColumnFiltersChange: setColumnFilters,
    onGlobalFilterChange: setGlobalFilter,
    enableRowSelection: true,
    onRowSelectionChange: setRowSelection,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    globalFilterFn: (row, _columnId, filterValue: string) => {
      if (!filterValue) return true;
      const q = String(filterValue).toLowerCase();
      const e = row.original as Entry;
      return (
        e.key.toLowerCase().includes(q) ||
        e.source.toLowerCase().includes(q) ||
        e.target.toLowerCase().includes(q)
      );
    },
    columnResizeMode: "onChange",
  });

  useEffect(() => {
    if (editorMode !== "split") return;
    if (!selected) {
      const first = table.getRowModel().rows[0]?.original as Entry | undefined;
      if (first) setSelected(first);
    }
  }, [editorMode, selected, table]);

  return {
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
    // refs
    targetCellRefs,
    // table
    table,
  } as const;
}
