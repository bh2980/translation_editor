"use client";
import { Download, Columns3, SlidersHorizontal, Wand2, Search } from "lucide-react";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import { Switch } from "@/shared/ui/switch";
import { Popover, PopoverContent, PopoverTrigger } from "@/shared/ui/popover";
import {
  Select as UiSelect,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/ui/select";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/shared/ui/dropdown-menu";
import { Select, SelectContent as SContent, SelectItem as SItem, SelectTrigger as STrigger, SelectValue as SValue } from "@/shared/ui/select";
import type { Table } from "@tanstack/react-table";
import type { Entry, Status } from "@/entities/editor/types";
import type { EditorMode } from "./EditorDataTable";

export function EditorHeader({
  projectName,
  entriesCount,
  globalFilter,
  setGlobalFilter,
  table,
  statuses,
  highlightedCols,
  toggleHighlight,
  editorMode,
  setEditorMode,
  autoNext,
  setAutoNext,
  exportDelim,
  setExportDelim,
}: {
  projectName: string;
  entriesCount: number;
  globalFilter: string;
  setGlobalFilter: (v: string) => void;
  table: Table<Entry>;
  statuses: Status[];
  highlightedCols: Record<string, boolean>;
  toggleHighlight: (id: string) => void;
  editorMode: EditorMode;
  setEditorMode: (m: EditorMode) => void;
  autoNext: boolean;
  setAutoNext: (v: boolean) => void;
  exportDelim: string;
  setExportDelim: (v: string) => void;
}) {
  return (
    <header className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
      <div>
        <h2 className="text-xl font-semibold">{projectName}</h2>
        <div className="text-sm text-muted-foreground">ko → en · 총 {entriesCount} 항목</div>
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
            <DropdownMenuCheckboxItem checked={editorMode === "popover"} onCheckedChange={() => setEditorMode("popover")}>
              Popover (셀 아래)
            </DropdownMenuCheckboxItem>
            <DropdownMenuCheckboxItem checked={editorMode === "drawer-left"} onCheckedChange={() => setEditorMode("drawer-left")}>
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
                  <SItem value="\t">탭 (\t)</SItem>
                </SContent>
              </Select>
              <Button onClick={() => alert("CSV 내보내기 (더미)")} className="w-full">
                내보내기
              </Button>
            </div>
          </PopoverContent>
        </Popover>

        <Button variant="outline" className="gap-2 bg-transparent" onClick={() => alert("선택 행 AI 번역 (더미)")}>
          <Wand2 size={16} />
          선택 행 AI 번역
        </Button>
      </div>
    </header>
  );
}

