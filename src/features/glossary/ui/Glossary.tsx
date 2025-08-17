"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import type { GlossaryTerm } from "@/features/glossary/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Plus, UploadCloud, Trash2, Download } from "lucide-react";
import { ColGroup, ResizableHeaderCell, useResizableColumns } from "@/components/ui/resizable-columns";
import { GlossaryImportDialog } from "@/features/glossary/ui/GlossaryImportDialog";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { exportObjectsToCsv } from "@/lib/csv";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { useProjectStore } from "@/stores/project-store";

export default function GlossaryPage() {
  const params = useParams<{ id: string }>();
  const project = useProjectStore((s) => s.project);
  const load = useProjectStore((s) => s.load);
  const [query, setQuery] = useState("");
  const [importOpen, setImportOpen] = useState(false);
  const [exportDelim, setExportDelim] = useState<string>(",");
  const [selectedRows, setSelectedRows] = useState<Record<string, boolean>>({});
  const { toast } = useToast();

  const { widths, onMouseDown } = useResizableColumns(
    [
      { id: "select", initialWidth: 50, minWidth: 50 },
      { id: "src", initialWidth: 320, minWidth: 200 },
      { id: "tgt", initialWidth: 320, minWidth: 200 },
      { id: "notes", initialWidth: 400, minWidth: 240 },
      { id: "del", initialWidth: 80, minWidth: 60 },
    ],
    `glossary:${params?.id}`
  );

  const filtered = useMemo(
    () =>
      (project?.glossary ?? []).filter(
        (t) =>
          t.source.toLowerCase().includes(query.toLowerCase()) ||
          t.target.toLowerCase().includes(query.toLowerCase()) ||
          (t.notes ?? "").toLowerCase().includes(query.toLowerCase())
      ),
    [project?.glossary, query]
  );

  const selectedCount = useMemo(() => Object.values(selectedRows).filter(Boolean).length, [selectedRows]);

  const allSelected = useMemo(() => {
    if (filtered.length === 0) return false;
    return filtered.every((term) => selectedRows[term.id]);
  }, [filtered, selectedRows]);

  const someSelected = useMemo(() => {
    return filtered.some((term) => selectedRows[term.id]);
  }, [filtered, selectedRows]);

  function update(glossary: GlossaryTerm[]) {
    if (!project) return;
    useProjectStore.getState().update((p) => ({ ...p, glossary }));
  }

  function onImported(terms: GlossaryTerm[]) {
    update([...(project?.glossary ?? []), ...terms]);
    toast({
      title: "용어집 가져오기 완료",
      description: `${terms.length}개의 용어가 추가되었습니다.`,
    });
  }

  function toggleSelectAll() {
    if (allSelected) {
      // Deselect all
      setSelectedRows({});
    } else {
      // Select all filtered items
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
    if (!project || selectedCount === 0) return;

    const selectedIds = new Set(Object.keys(selectedRows).filter((id) => selectedRows[id]));
    const newGlossary = project.glossary.filter((term) => !selectedIds.has(term.id));

    update(newGlossary);
    setSelectedRows({});

    toast({
      title: "선택된 용어 삭제 완료",
      description: `${selectedCount}개의 용어가 삭제되었습니다.`,
    });
  }

  useEffect(() => {
    if (!params?.id) return;
    load(params.id);
  }, [params?.id, load]);

  if (!project) return <div>프로젝트를 찾을 수 없습니다.</div>;

  function exportCSV() {
    const cols = [
      { key: "source", header: "source" },
      { key: "target", header: "target" },
      { key: "notes", header: "notes" },
    ];
    exportObjectsToCsv(`${project?.name}_glossary.csv`, project?.glossary ?? [], exportDelim, cols);
  }

  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-semibold">용어집</h2>
          <p className="text-sm text-muted-foreground">
            번역 일관성을 위해 핵심 용어를 정의하세요. ({project.glossary.length}개 용어)
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Input placeholder="검색" value={query} onChange={(e) => setQuery(e.target.value)} />

          {selectedCount > 0 && (
            <Button variant="destructive" onClick={deleteSelected} className="gap-2">
              <Trash2 size={16} />
              선택 삭제 ({selectedCount})
            </Button>
          )}

          <Button variant="outline" className="gap-2 bg-transparent" onClick={() => setImportOpen(true)}>
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
                    <SelectItem value="\t">탭 (\\t)</SelectItem>
                  </SelectContent>
                </Select>
                <Button onClick={exportCSV} className="w-full">
                  내보내기
                </Button>
              </div>
            </PopoverContent>
          </Popover>

          <Button
            onClick={() =>
              update([...(project.glossary ?? []), { id: crypto.randomUUID(), source: "", target: "", notes: "" }])
            }
            className="gap-2"
          >
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
              <ResizableHeaderCell index={0} width={widths[0]} onMouseDown={onMouseDown}>
                <div className="flex items-center justify-center">
                  <Checkbox
                    checked={allSelected || (someSelected && "indeterminate")}
                    onCheckedChange={toggleSelectAll}
                    aria-label="전체 선택"
                  />
                </div>
              </ResizableHeaderCell>
              <ResizableHeaderCell index={1} width={widths[1]} onMouseDown={onMouseDown}>
                원문 용어
              </ResizableHeaderCell>
              <ResizableHeaderCell index={2} width={widths[2]} onMouseDown={onMouseDown}>
                번역 용어
              </ResizableHeaderCell>
              <ResizableHeaderCell index={3} width={widths[3]} onMouseDown={onMouseDown}>
                메모
              </ResizableHeaderCell>
              <ResizableHeaderCell index={4} width={widths[4]} onMouseDown={onMouseDown}>
                삭제
              </ResizableHeaderCell>
            </tr>
          </thead>
          <tbody>
            {filtered.map((t) => (
              <tr key={t.id} className={`border-t ${selectedRows[t.id] ? "bg-muted/20" : ""}`}>
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
                    onChange={(e) =>
                      update(project.glossary.map((x) => (x.id === t.id ? { ...x, source: e.target.value } : x)))
                    }
                  />
                </td>
                <td className="px-3 py-2">
                  <Input
                    value={t.target}
                    onChange={(e) =>
                      update(project.glossary.map((x) => (x.id === t.id ? { ...x, target: e.target.value } : x)))
                    }
                  />
                </td>
                <td className="px-3 py-2">
                  <Textarea
                    value={t.notes ?? ""}
                    onChange={(e) =>
                      update(project.glossary.map((x) => (x.id === t.id ? { ...x, notes: e.target.value } : x)))
                    }
                    rows={2}
                  />
                </td>
                <td className="px-3 py-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => update(project.glossary.filter((x) => x.id !== t.id))}
                  >
                    <Trash2 size={16} className="text-red-600" />
                  </Button>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={5} className="px-3 py-8 text-center text-muted-foreground">
                  {query ? "검색 결과가 없습니다." : "용어가 없습니다."}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <GlossaryImportDialog open={importOpen} onOpenChange={setImportOpen} onImported={onImported} />
    </div>
  );
}
