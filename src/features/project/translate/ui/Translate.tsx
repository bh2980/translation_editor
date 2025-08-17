"use client"
import { useEffect, useMemo, useRef, useState } from "react"
import { Select } from "@/components/ui/select"

import { useParams } from "react-router-dom"
import type { TranslationEntry } from "@/features/project/translate/types"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select as UiSelect, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { statusColorToClass } from "@/components/ui/status-badge"
import { Wand2, Search, Columns3, SlidersHorizontal, Download } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { Spinner } from "@/components/ui/spinner"
import {
  flexRender,
  getCoreRowModel,
  useReactTable,
  type ColumnDef,
  getSortedRowModel,
  getFilteredRowModel,
  type ColumnFiltersState,
} from "@tanstack/react-table"
import { Checkbox } from "@/components/ui/checkbox"
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { EditorCellPopover, EditorDrawerLeft, EditorSplitView, type EditorMode } from "@/features/project/translate/ui/EditorPanel"
import { TextColumnFilter, StatusColumnFilter } from "@/components/ui/column-filter"
import { Switch } from "@/components/ui/switch"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import {
  SelectTrigger as STrigger,
  SelectValue as SValue,
  SelectContent as SContent,
  SelectItem as SItem,
} from "@/components/ui/select"
import { exportObjectsToCsv } from "@/lib/csv"
import { useProjectStore } from "@/stores/project-store"

export default function TranslatePage() {
  const params = useParams<{ id: string }>()
  const project = useProjectStore((s) => s.project)
  const isLoading = useProjectStore((s) => s.isLoading)
  const load = useProjectStore((s) => s.load)
  const [globalFilter, setGlobalFilter] = useState("")
  const [selected, setSelected] = useState<TranslationEntry | null>(null)
  const [editorMode, setEditorMode] = useState<EditorMode>(() => {
    if (typeof window !== "undefined") {
      return (localStorage.getItem("editor-mode") as EditorMode) || "popover"
    }
    return "popover"
  })
  const [rowSelection, setRowSelection] = useState<Record<string, boolean>>({})
  const [highlightedCols, setHighlightedCols] = useState<Record<string, boolean>>({})
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
  const [autoNext, setAutoNext] = useState<boolean>(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("auto-next") === "1"
    }
    return false
  })
  const [exportDelim, setExportDelim] = useState<string>(",")

  const targetCellRefs = useRef<Record<string, HTMLButtonElement | null>>({})

  const { toast } = useToast()

  useEffect(() => {
    if (!params?.id) return
    load(params.id)
  }, [params?.id, load])

  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("editor-mode", editorMode)
    }
  }, [editorMode])

  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("auto-next", autoNext ? "1" : "0")
    }
  }, [autoNext])

  const statuses = useMemo(() => project?.statuses ?? [], [project])

  function updateEntry(update: TranslationEntry) {
    if (!project) return
    const idx = project.entries.findIndex((e) => e.id === update.id)
    if (idx >= 0) {
      useProjectStore.getState().update((p) => {
        const next = { ...p }
        next.entries[idx] = update
        return next
      })
    }
  }

  function moveToNext(fromId: string) {
    const idx = entries.findIndex((e) => e.id === fromId)
    if (idx >= 0 && idx + 1 < entries.length) {
      const next = entries[idx + 1]
      if (editorMode === "popover") {
        // Open next cell's popover
        const btn = targetCellRefs.current[next.id]
        if (btn) {
          setTimeout(() => btn.click(), 10)
        }
      } else {
        setSelected(next)
      }
    }
  }

  async function aiTranslateRow(entry: TranslationEntry) {
    if (!project) return
    const res = await fetch("/api/translate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        provider: project.aiAgent.provider,
        apiKey: project.aiAgent.apiKey,
        model: project.aiAgent.model,
        promptTemplate: project.aiAgent.promptTemplate,
        text: entry.source,
        sourceLang: project.sourceLang,
        targetLang: project.targetLang,
        glossary: project.glossary,
      }),
    })
    if (!res.ok) {
      toast({ title: "AI 번역 실패", description: "설정을 확인해주세요.", variant: "destructive" })
      return
    }
    const data = await res.json()
    const newEntry = { ...entry, target: data.text }
    updateEntry(newEntry)
    toast({ title: "AI 번역 완료", description: "번역 결과가 적용되었습니다." })
  }

  async function aiTranslateSelected() {
    if (!project) return
    const rows = table.getSelectedRowModel().flatRows
    if (rows.length === 0) {
      toast({ title: "선택된 행이 없습니다.", description: "왼쪽 체크박스로 행을 선택하세요." })
      return
    }
    for (const r of rows) {
      await aiTranslateRow(r.original)
    }
  }

  const cols = useMemo<ColumnDef<TranslationEntry>[]>(
    () => [
      {
        id: "select",
        header: ({ table }) => (
          <div className="px-2">
            <Checkbox
              checked={table.getIsAllPageRowsSelected() || (table.getIsSomePageRowsSelected() && "indeterminate")}
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
          const e = row.original
          return (
            <UiSelect value={e.statusId} onValueChange={(val) => updateEntry({ ...e, statusId: val })}>
              <SelectTrigger className="h-8">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {statuses.map((s) => (
                  <SelectItem key={s.id} value={s.id}>
                    <span className="inline-flex items-center gap-2">
                      <span className={`h-2 w-2 rounded-full ${statusColorToClass(s.color)}`} />
                      {s.name}
                    </span>
                  </SelectItem>
                ))}
              </SelectContent>
            </UiSelect>
          )
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
        cell: ({ getValue }) => <span className="font-mono text-xs">{String(getValue() ?? "")}</span>,
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
        cell: ({ getValue }) => <span className="block">{String(getValue() ?? "")}</span>,
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
          const e = row.original
          const content = e.target ? (
            <span className="line-clamp-3">{e.target}</span>
          ) : (
            <span className="text-muted-foreground">클릭하여 번역 입력…</span>
          )

          if (editorMode === "popover") {
            return (
              <EditorCellPopover
                entry={e}
                onSave={updateEntry}
                onSaved={(saved) => autoNext && moveToNext(saved.id)}
                glossary={project!.glossary}
                project={project!}
              >
                <button
                  ref={(el) => {
                    targetCellRefs.current[e.id] = el
                  }}
                  className="w-full rounded-md border bg-background px-2 py-1 text-left hover:bg-muted"
                >
                  {content}
                </button>
              </EditorCellPopover>
            )
          }
          return (
            <button
              ref={(el) => {
                targetCellRefs.current[e.id] = el
              }}
              className="w-full rounded-md border bg-background px-2 py-1 text-left hover:bg-muted"
              onClick={() => setSelected(e)}
              aria-label="번역 편집"
            >
              {content}
            </button>
          )
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
            onClick={() => aiTranslateRow(row.original)}
          >
            <Wand2 size={14} />
            AI 번역
          </Button>
        ),
        size: 140,
        enableColumnFilter: false,
      },
    ],
    [statuses, project, editorMode, autoNext],
  )

  const table = useReactTable({
    data: project?.entries ?? [],
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
      if (!filterValue) return true
      const q = String(filterValue).toLowerCase()
      const e = row.original as TranslationEntry
      return (
        e.key.toLowerCase().includes(q) ||
        e.source.toLowerCase().includes(q) ||
        e.target.toLowerCase().includes(q)
      )
    },
    columnResizeMode: "onChange",
  })

  // Auto-select first row in Split View
  useEffect(() => {
    if (editorMode !== "split") return
    if (!selected) {
      const first = table.getRowModel().rows[0]?.original as TranslationEntry | undefined
      if (first) setSelected(first)
    }
  }, [editorMode, selected, table])

  function toggleHighlight(colId: string) {
    setHighlightedCols((prev) => ({ ...prev, [colId]: !prev[colId] }))
  }

  function exportCsv() {
    if (!project) return
    const csvData = project.entries.map((entry) => ({
      key: entry.key,
      source: entry.source,
      target: entry.target,
      status: statuses.find((status) => status.id === entry.statusId)?.name || "Unknown",
    }))
    exportObjectsToCsv(csvData, `${project.name}_translations.csv`)
  }

  if (isLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Spinner />
          <span>프로젝트 로딩 중…</span>
        </div>
      </div>
    )
  }

  if (!project) {
    return <div>프로젝트를 찾을 수 없습니다.</div>
  }

  const tableView = (
    <div className="h-full overflow-auto rounded-md border">
      <table className="w-max min-w-[900px] text-sm">
        <thead className="bg-muted/50">
          {table.getHeaderGroups().map((hg) => (
            <tr key={hg.id} className="text-left">
              {hg.headers.map((header) => {
                const colId = header.column.id
                const isResizable = header.column.getCanResize()
                const size = header.getSize()
                const isFiltered = header.column.getIsFiltered()
                return (
                  <th
                    key={header.id}
                    style={{ width: size, position: "relative" }}
                    className={`px-3 py-2 ${highlightedCols[colId] ? "bg-muted/50" : ""} ${
                      isFiltered
                        ? "after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-emerald-500"
                        : ""
                    }`}
                    onClick={(e) => {
                      if (e.metaKey || e.ctrlKey) toggleHighlight(colId)
                    }}
                  >
                    {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                    {isResizable && (
                      <>
                        <span
                          onMouseDown={header.getResizeHandler()}
                          onTouchStart={header.getResizeHandler()}
                          className="absolute right-0 top-0 h-full w-1 cursor-col-resize"
                          aria-hidden
                        />
                        <span className="absolute right-0 top-0 h-full w-px bg-border" aria-hidden />
                        <span
                          className="absolute -right-1 top-0 h-full w-2 cursor-col-resize"
                          onMouseDown={header.getResizeHandler()}
                          onTouchStart={header.getResizeHandler()}
                          aria-hidden
                        />
                      </>
                    )}
                  </th>
                )
              })}
            </tr>
          ))}
        </thead>
        <tbody>
          {table.getRowModel().rows.map((row) => (
            <tr
              key={row.id}
              className={`border-t align-top ${editorMode === "split" && selected?.id === row.original.id ? "bg-muted/20" : ""}`}
              onClick={() => {
                if (editorMode === "split") setSelected(row.original)
              }}
            >
              {row.getVisibleCells().map((cell) => {
                const colId = cell.column.id
                return (
                  <td
                    key={cell.id}
                    className={`px-3 py-2 ${highlightedCols[colId] ? "bg-muted/20" : ""}`}
                    style={{ width: cell.column.getSize() }}
                  >
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                )
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )

  return (
    <div className="space-y-6">
      <header className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
        <div>
          <h2 className="text-xl font-semibold">{project.name}</h2>
          <div className="text-sm text-muted-foreground">
            {project.sourceLang} → {project.targetLang} · 총 {project.entries.length} 항목
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative">
            <Search className="absolute left-2 top-2.5 text-muted-foreground" size={16} />
            <Input
              className="w-[240px] pl-8"
              placeholder="검색 (key/원문/번역)"
              value={globalFilter}
              onChange={(e) => setGlobalFilter(e.target.value)}
            />
          </div>

          <UiSelect
            value={(table.getColumn("status")?.getFilterValue() as string) ?? "all"}
            onValueChange={(v) => table.getColumn("status")?.setFilterValue(v === "all" ? undefined : v)}
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
              <DropdownMenuCheckboxItem checked={editorMode === "split"} onCheckedChange={() => setEditorMode("split")}>
                Split View
              </DropdownMenuCheckboxItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <div className="flex items-center gap-2">
            <Switch checked={autoNext} onCheckedChange={(v) => setAutoNext(!!v)} id="auto-next" />
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
                    <SItem value="\t">탭 (\\t)</SItem>
                  </SContent>
                </Select>
                <Button
                  onClick={() => {
                    if (!project) return
                    // Export rows currently in the table (respects filters)
                    const rows = table.getRowModel().rows.map((r) => r.original)
                    const statusName = new Map(project.statuses.map((s) => [s.id, s.name]))
                    const payload = rows.map((e) => ({
                      key: e.key,
                      source: e.source,
                      target: e.target,
                      status: statusName.get(e.statusId) || "",
                    }))
                    exportObjectsToCsv(`${project.name}_translations.csv`, payload, exportDelim, [
                      { key: "key", header: "key" },
                      { key: "source", header: "source" },
                      { key: "target", header: "target" },
                      { key: "status", header: "status" },
                    ])
                  }}
                  className="w-full"
                >
                  내보내기
                </Button>
              </div>
            </PopoverContent>
          </Popover>

          <Button variant="outline" className="gap-2 bg-transparent" onClick={aiTranslateSelected}>
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
              updateEntry(upd)
              if (autoNext) moveToNext(upd.id)
              else setSelected(null)
            }}
            glossary={project.glossary}
            project={project}
          />
        </>
      ) : (
        <div className="grid h-[70vh] gap-6 lg:grid-cols-[minmax(600px,1fr)_minmax(360px,1fr)]">
          <div>{tableView}</div>
          <div className="h-full overflow-auto rounded-md border">
            <EditorSplitView
              entry={selected}
              onSave={(upd) => {
                updateEntry(upd)
                if (autoNext) moveToNext(upd.id)
              }}
              glossary={project.glossary}
              project={project}
            />
          </div>
        </div>
      )}
    </div>
  )
}
