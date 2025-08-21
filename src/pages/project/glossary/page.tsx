"use client";

import { useMemo, useState } from "react";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import { Textarea } from "@/shared/ui/textarea";
import { Plus, UploadCloud, Trash2, Download } from "lucide-react";
import {
  ColGroup,
  ResizableHeaderCell,
  useResizableColumns,
} from "@/shared/ui/resizable-columns";
import { Popover, PopoverContent, PopoverTrigger } from "@/shared/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/ui/select";
import { Checkbox } from "@/shared/ui/checkbox";
import { GlossaryImportDialog } from "@/widgets/glossary/GlossaryImportDialog";

const dummyGlossary = [
  { id: "1", source: "Character", target: "캐릭터", notes: "게임 내 인물" },
  { id: "2", source: "Quest", target: "퀘스트", notes: "임무 또는 과제" },
  { id: "3", source: "Item", target: "아이템", notes: "" },
  { id: "4", source: "Guild", target: "길드", notes: "플레이어들의 모임" },
];

export default function GlossaryPage() {
  const [glossary, setGlossary] = useState(dummyGlossary);
  const [query, setQuery] = useState("");
  const [importOpen, setImportOpen] = useState(false);
  const [exportDelim, setExportDelim] = useState<string>(",");
  const [selectedRows, setSelectedRows] = useState<Record<string, boolean>>({});

  const { widths, onMouseDown } = useResizableColumns(
    [
      { id: "select", initialWidth: 50, minWidth: 50 },
      { id: "src", initialWidth: 320, minWidth: 200 },
      { id: "tgt", initialWidth: 320, minWidth: 200 },
      { id: "notes", initialWidth: 400, minWidth: 240 },
      { id: "del", initialWidth: 80, minWidth: 60 },
    ],
    `glossary:dummy-project-id`
  );

  const filtered = useMemo(
    () =>
      glossary.filter(
        (t) =>
          t.source.toLowerCase().includes(query.toLowerCase()) ||
          t.target.toLowerCase().includes(query.toLowerCase()) ||
          (t.notes ?? "").toLowerCase().includes(query.toLowerCase())
      ),
    [glossary, query]
  );

  const selectedCount = useMemo(
    () => Object.values(selectedRows).filter(Boolean).length,
    [selectedRows]
  );

  const allSelected = useMemo(() => {
    if (filtered.length === 0) return false;
    return filtered.every((term) => selectedRows[term.id]);
  }, [filtered, selectedRows]);

  const someSelected = useMemo(() => {
    return filtered.some((term) => selectedRows[term.id]);
  }, [filtered, selectedRows]);

  function update(updatedTerm: any) {
    setGlossary(
      glossary.map((t) => (t.id === updatedTerm.id ? updatedTerm : t))
    );
  }

  function onImported(terms: any[]) {
    setGlossary([...glossary, ...terms]);
  }

  function toggleSelectAll() {
    if (allSelected) {
      setSelectedRows({});
    } else {
      const newSelection: Record<string, boolean> = {};
      filtered.forEach((term) => {
        newSelection[term.id] = true;
      });
      setSelectedRows(newSelection);
    }
  }

  function toggleSelectRow(termId: string) {
    setSelectedRows((prev) => ({
      ...prev,
      [termId]: !prev[termId],
    }));
  }

  function deleteSelected() {
    if (selectedCount === 0) return;
    const selectedIds = new Set(
      Object.keys(selectedRows).filter((id) => selectedRows[id])
    );
    const newGlossary = glossary.filter((term) => !selectedIds.has(term.id));
    setGlossary(newGlossary);
    setSelectedRows({});
  }

  function addTerm() {
    const newTerm = {
      id: crypto.randomUUID(),
      source: "",
      target: "",
      notes: "",
    };
    setGlossary([...glossary, newTerm]);
  }

  function removeTerm(id: string) {
    setGlossary(glossary.filter((t) => t.id !== id));
  }

  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-semibold">용어집</h2>
          <p className="text-sm text-muted-foreground">
            번역 일관성을 위해 핵심 용어를 정의하세요. ({glossary.length}개
            용어)
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Input
            placeholder="검색"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />

          {selectedCount > 0 && (
            <Button
              variant="destructive"
              onClick={deleteSelected}
              className="gap-2"
            >
              <Trash2 size={16} />
              선택 삭제 ({selectedCount})
            </Button>
          )}

          <Button
            variant="outline"
            className="gap-2 bg-transparent"
            onClick={() => setImportOpen(true)}
          >
            <UploadCloud size={16} />
            CSV 가져오기
          </Button>

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
                  <SelectTrigger>
                    <SelectValue placeholder="구분자" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value=",">콤마 (,)</SelectItem>
                    <SelectItem value=";">세미콜론 (;)</SelectItem>
                    <SelectItem value="|">파이프 (|)</SelectItem>
                    <SelectItem value="\t">탭 (\t)</SelectItem>
                  </SelectContent>
                </Select>
                <Button
                  onClick={() => alert("내보내기 (더미)")}
                  className="w-full"
                >
                  내보내기
                </Button>
              </div>
            </PopoverContent>
          </Popover>

          <Button onClick={addTerm} className="gap-2">
            <Plus size={16} />
            용어 추가
          </Button>
        </div>
      </header>

      <div className="overflow-auto rounded-md border">
        <table className="min-w-[800px] w-max text-sm table-fixed">
          <ColGroup widths={widths} />
          <thead className="bg-muted/50">
            <tr className="text-left">
              <ResizableHeaderCell
                index={0}
                width={widths[0]}
                onMouseDown={onMouseDown}
              >
                <div className="flex items-center justify-center">
                  <Checkbox
                    checked={allSelected || (someSelected && "indeterminate")}
                    onCheckedChange={toggleSelectAll}
                    aria-label="전체 선택"
                  />
                </div>
              </ResizableHeaderCell>
              <ResizableHeaderCell
                index={1}
                width={widths[1]}
                onMouseDown={onMouseDown}
              >
                원문 용어
              </ResizableHeaderCell>
              <ResizableHeaderCell
                index={2}
                width={widths[2]}
                onMouseDown={onMouseDown}
              >
                번역 용어
              </ResizableHeaderCell>
              <ResizableHeaderCell
                index={3}
                width={widths[3]}
                onMouseDown={onMouseDown}
              >
                메모
              </ResizableHeaderCell>
              <ResizableHeaderCell
                index={4}
                width={widths[4]}
                onMouseDown={onMouseDown}
              >
                삭제
              </ResizableHeaderCell>
            </tr>
          </thead>
          <tbody>
            {filtered.map((t) => (
              <tr
                key={t.id}
                className={`border-t ${
                  selectedRows[t.id] ? "bg-muted/20" : ""
                }`}
              >
                <td className="px-3 py-2">
                  <div className="flex items-center justify-center">
                    <Checkbox
                      checked={!!selectedRows[t.id]}
                      onCheckedChange={() => toggleSelectRow(t.id)}
                      aria-label="행 선택"
                    />
                  </div>
                </td>
                <td className="px-3 py-2">
                  <Input
                    value={t.source}
                    onChange={(e) => update({ ...t, source: e.target.value })}
                  />
                </td>
                <td className="px-3 py-2">
                  <Input
                    value={t.target}
                    onChange={(e) => update({ ...t, target: e.target.value })}
                  />
                </td>
                <td className="px-3 py-2">
                  <Textarea
                    value={t.notes ?? ""}
                    onChange={(e) => update({ ...t, notes: e.target.value })}
                    rows={2}
                  />
                </td>
                <td className="px-3 py-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => removeTerm(t.id)}
                  >
                    <Trash2 size={16} className="text-red-600" />
                  </Button>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td
                  colSpan={5}
                  className="px-3 py-8 text-center text-muted-foreground"
                >
                  {query ? "검색 결과가 없습니다." : "용어가 없습니다."}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <GlossaryImportDialog
        open={importOpen}
        onOpenChange={setImportOpen}
        onImported={onImported}
      />
    </div>
  );
}
