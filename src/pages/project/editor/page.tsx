"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import { Select } from "@/shared/ui/select";

import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import {
  Select as UiSelect,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/ui/select";
import { statusColorToClass } from "@/shared/ui/status-badge";
import {
  Wand2,
  Search,
  Columns3,
  SlidersHorizontal,
  Download,
} from "lucide-react";
import {
  flexRender,
  getCoreRowModel,
  useReactTable,
  type ColumnDef,
  getSortedRowModel,
  getFilteredRowModel,
  type ColumnFiltersState,
} from "@tanstack/react-table";
import { Checkbox } from "@/shared/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/shared/ui/dropdown-menu";

import {
  TextColumnFilter,
  StatusColumnFilter,
} from "@/shared/ui/column-filter";
import { Switch } from "@/shared/ui/switch";
import { Popover, PopoverContent, PopoverTrigger } from "@/shared/ui/popover";
import {
  SelectTrigger as STrigger,
  SelectValue as SValue,
  SelectContent as SContent,
  SelectItem as SItem,
} from "@/shared/ui/select";
import {
  EditorCellPopover,
  EditorDrawerLeft,
  EditorMode,
  EditorSplitView,
} from "@/widgets/editor/EditorPanel";

const dummyStatuses = [
  { id: "1", name: "미번역", color: "slate" },
  { id: "2", name: "초벌 번역", color: "amber" },
  { id: "3", name: "번역 완료", color: "emerald" },
  { id: "4", name: "검수 완료", color: "violet" },
];

const dummyEntries = [
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

export default function TranslatePage() {
  const [entries, setEntries] = useState(dummyEntries);
  const [statuses, setStatuses] = useState(dummyStatuses);
  const [globalFilter, setGlobalFilter] = useState("");
  const [selected, setSelected] = useState<any | null>(null);
  const [editorMode, setEditorMode] = useState<EditorMode>("popover");
  const [rowSelection, setRowSelection] = useState<Record<string, boolean>>({});
  const [highlightedCols, setHighlightedCols] = useState<
    Record<string, boolean>
  >({});
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [autoNext, setAutoNext] = useState(false);
  const [exportDelim, setExportDelim] = useState<string>(",");

  const targetCellRefs = useRef<Record<string, HTMLButtonElement | null>>({});

  function updateEntry(update: any) {
    setEntries(entries.map((e) => (e.id === update.id ? update : e)));
  }

  function moveToNext(fromId: string) {
    const idx = entries.findIndex((e) => e.id === fromId);
    if (idx >= 0 && idx + 1 < entries.length) {
      const next = entries[idx + 1];
      if (editorMode === "popover") {
        const btn = targetCellRefs.current[next.id];
        if (btn) {
          setTimeout(() => btn.click(), 10);
        }
      } else {
        setSelected(next);
      }
    }
  }

  const cols = useMemo<ColumnDef<any>[]>(
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
        cell: ({ row }) => (
          <Button
            variant="outline"
            size="sm"
            className="gap-1 bg-transparent"
            onClick={() => alert("AI 번역 (더미)")}
          >
            <Wand2 size={14} />
            AI 번역
          </Button>
        ),
        size: 140,
        enableColumnFilter: false,
      },
    ],
    [statuses, editorMode, autoNext]
  );

  const table = useReactTable({
    data: entries,
    columns: cols,
    state: {
      rowSelection,
      columnFilters,
      globalFilter,
    },
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
      const e = row.original as any;
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
      const first = table.getRowModel().rows[0]?.original as any | undefined;
      if (first) setSelected(first);
    }
  }, [editorMode, selected, table]);

  function toggleHighlight(colId: string) {
    setHighlightedCols((prev) => ({ ...prev, [colId]: !prev[colId] }));
  }

  const tableView = (
    <div className="h-full overflow-auto rounded-md border">
      <table className="w-max min-w-[900px] text-sm">
        <thead className="bg-muted/50">
          {table.getHeaderGroups().map((hg) => (
            <tr key={hg.id} className="text-left">
              {hg.headers.map((header) => {
                const colId = header.column.id;
                const isResizable = header.column.getCanResize();
                const size = header.getSize();
                const isFiltered = header.column.getIsFiltered();
                return (
                  <th
                    key={header.id}
                    style={{ width: size, position: "relative" }}
                    className={`px-3 py-2 ${
                      highlightedCols[colId] ? "bg-muted/50" : ""
                    } ${
                      isFiltered
                        ? "after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-emerald-500"
                        : ""
                    }`}
                    onClick={(e) => {
                      if (e.metaKey || e.ctrlKey) toggleHighlight(colId);
                    }}
                  >
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                    {isResizable && (
                      <>
                        <span
                          onMouseDown={header.getResizeHandler()}
                          onTouchStart={header.getResizeHandler()}
                          className="absolute right-0 top-0 h-full w-1 cursor-col-resize"
                          aria-hidden
                        />
                        <span
                          className="absolute right-0 top-0 h-full w-px bg-border"
                          aria-hidden
                        />
                        <span
                          className="absolute -right-1 top-0 h-full w-2 cursor-col-resize"
                          onMouseDown={header.getResizeHandler()}
                          onTouchStart={header.getResizeHandler()}
                          aria-hidden
                        />
                      </>
                    )}
                  </th>
                );
              })}
            </tr>
          ))}
        </thead>
        <tbody>
          {table.getRowModel().rows.map((row) => (
            <tr
              key={row.id}
              className={`border-t align-top ${
                editorMode === "split" && selected?.id === row.original.id
                  ? "bg-muted/20"
                  : ""
              }`}
              onClick={() => {
                if (editorMode === "split") setSelected(row.original);
              }}
            >
              {row.getVisibleCells().map((cell) => {
                const colId = cell.column.id;
                return (
                  <td
                    key={cell.id}
                    className={`px-3 py-2 ${
                      highlightedCols[colId] ? "bg-muted/20" : ""
                    }`}
                    style={{ width: cell.column.getSize() }}
                  >
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  return (
    <div className="space-y-6">
      <header className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
        <div>
          <h2 className="text-xl font-semibold">샘플 프로젝트</h2>
          <div className="text-sm text-muted-foreground">
            ko → en · 총 {entries.length} 항목
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative">
            <Search
              className="absolute left-2 top-2.5 text-muted-foreground"
              size={16}
            />
            <Input
              className="w-[240px] pl-8"
              placeholder="검색 (key/원문/번역)"
              value={globalFilter}
              onChange={(e) => setGlobalFilter(e.target.value)}
            />
          </div>

          <UiSelect
            value={
              (table.getColumn("status")?.getFilterValue() as string) ?? "all"
            }
            onValueChange={(v) =>
              table
                .getColumn("status")
                ?.setFilterValue(v === "all" ? undefined : v)
            }
          >
            <SelectTrigger className="w-[160px]">
              <SelectValue placeholder="상태 필터" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">전체 상태</SelectItem>
              {statuses.map((s) => (
                <SelectItem key={s.id} value={s.id}>
                  {s.name}
                </SelectItem>
              ))}
            </SelectContent>
          </UiSelect>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="gap-2 bg-transparent">
                <Columns3 size={16} />열 표시/선택
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>열 표시</DropdownMenuLabel>
              {table.getAllLeafColumns().map((column) => (
                <DropdownMenuCheckboxItem
                  key={column.id}
                  className="capitalize"
                  checked={column.getIsVisible()}
                  onCheckedChange={(v) => column.toggleVisibility(!!v)}
                >
                  {column.id}
                </DropdownMenuCheckboxItem>
              ))}
              <DropdownMenuSeparator />
              <DropdownMenuLabel>열 하이라이트</DropdownMenuLabel>
              {table.getAllLeafColumns().map((column) => (
                <DropdownMenuCheckboxItem
                  key={`hi-${column.id}`}
                  className="capitalize"
                  checked={!!highlightedCols[column.id]}
                  onCheckedChange={() => toggleHighlight(column.id)}
                >
                  {column.id}
                </DropdownMenuCheckboxItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="gap-2 bg-transparent">
                <SlidersHorizontal size={16} />
                에디터 보기
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuCheckboxItem
                checked={editorMode === "popover"}
                onCheckedChange={() => setEditorMode("popover")}
              >
                Popover (셀 아래)
              </DropdownMenuCheckboxItem>
              <DropdownMenuCheckboxItem
                checked={editorMode === "drawer-left"}
                onCheckedChange={() => setEditorMode("drawer-left")}
              >
                우측 패널
              </DropdownMenuCheckboxItem>
              <DropdownMenuCheckboxItem
                checked={editorMode === "split"}
                onCheckedChange={() => setEditorMode("split")}
              >
                Split View
              </DropdownMenuCheckboxItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <div className="flex items-center gap-2">
            <Switch
              checked={autoNext}
              onCheckedChange={(v) => setAutoNext(!!v)}
              id="auto-next"
            />
            <label htmlFor="auto-next" className="text-sm">
              저장 후 다음 자동 열기
            </label>
          </div>

          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className="gap-2 bg-transparent">
                <Download size={16} />
                CSV 내보내기
              </Button>
            </PopoverTrigger>
            <PopoverContent align="end" className="w-64">
              <div className="space-y-2">
                <div className="text-sm font-medium">구분자</div>
                <Select value={exportDelim} onValueChange={setExportDelim}>
                  <STrigger>
                    <SValue placeholder="구분자" />
                  </STrigger>
                  <SContent>
                    <SItem value=",">콤마 (,)</SItem>
                    <SItem value=";">세미콜론 (;)</SItem>
                    <SItem value="|">파이프 (|)</SItem>
                    <SItem value="\t">탭 (\t)</SItem>
                  </SContent>
                </Select>
                <Button
                  onClick={() => alert("CSV 내보내기 (더미)")}
                  className="w-full"
                >
                  내보내기
                </Button>
              </div>
            </PopoverContent>
          </Popover>

          <Button
            variant="outline"
            className="gap-2 bg-transparent"
            onClick={() => alert("선택 행 AI 번역 (더미)")}
          >
            <Wand2 size={16} />
            선택 행 AI 번역
          </Button>
        </div>
      </header>

      {editorMode !== "split" ? (
        <>
          <div className="h-[70vh]">{tableView}</div>
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
          <div>{tableView}</div>
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
