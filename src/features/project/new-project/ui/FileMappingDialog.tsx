"use client";

import { useMemo, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/shared/ui/dialog";
import { Button } from "@/shared/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/shared/ui/select";
import type { ParsedRow } from "@/shared/types/common";
import { ColGroup, ResizableHeaderCell, useResizableColumns } from "@/shared/ui/resizable-columns";
import { Input } from "@/shared/ui/input";
import { Spinner } from "@/shared/ui/spinner";

export function FileMappingDialog({
  open,
  onOpenChange,
  columns,
  sampleRows,
  onComplete,
  isCsv = false,
  delimiter = "auto",
  onDelimiterChange,
  busy = false,
}: {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  columns: string[];
  sampleRows: ParsedRow[];
  onComplete: (mapping: { key: string; source: string; target?: string; status?: string }) => void;
  isCsv?: boolean;
  delimiter?: string;
  onDelimiterChange?: (d: string) => void;
  busy?: boolean;
}) {
  const [keyCol, setKeyCol] = useState<string>("");
  const [srcCol, setSrcCol] = useState<string>("");
  const [tgtCol, setTgtCol] = useState<string>("");
  const [stCol, setStCol] = useState<string>("");
  const [customDelim, setCustomDelim] = useState<string>("");

  const canConfirm = keyCol && srcCol;

  const handleDelimiter = (val: string) => {
    if (val === "custom") {
      onDelimiterChange?.(customDelim || ",");
    } else {
      onDelimiterChange?.(val);
    }
  };

  const preview = useMemo(() => {
    return sampleRows.map((r) => {
      const targetCol = tgtCol && tgtCol !== "none" ? tgtCol : "";
      const statusCol = stCol && stCol !== "none" ? stCol : "";
      return {
        key: keyCol ? r[keyCol] ?? "" : "",
        source: srcCol ? r[srcCol] ?? "" : "",
        target: targetCol ? r[targetCol] ?? "" : "",
        status: statusCol ? r[statusCol] ?? "" : "",
      };
    });
  }, [sampleRows, keyCol, srcCol, tgtCol, stCol]);

  const { widths, onMouseDown } = useResizableColumns(
    [
      { id: "key", initialWidth: 180, minWidth: 140 },
      { id: "source", initialWidth: 340, minWidth: 220 },
      { id: "target", initialWidth: 320, minWidth: 200 },
      { id: "status", initialWidth: 180, minWidth: 140 },
    ],
    "mapping-preview"
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="!max-w-fit">
        <DialogHeader>
          <DialogTitle>열 매핑</DialogTitle>
          <DialogDescription>어떤 열을 key/원문/번역/상태로 사용할지 선택하세요.</DialogDescription>
        </DialogHeader>
        <div className="h-[300px] overflow-auto">
          {isCsv && (
            <div className="mb-3 grid gap-2 rounded-md border p-3">
              <div className="text-sm font-medium">CSV 구분자</div>
              <div className="flex items-center gap-2">
                <Select value={delimiter ?? "auto"} onValueChange={handleDelimiter}>
                  <SelectTrigger className="w-[200px]">
                    <SelectValue placeholder="구분자 선택" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="auto">자동 감지</SelectItem>
                    <SelectItem value=",">콤마 (,)</SelectItem>
                    <SelectItem value=";">세미콜론 (;)</SelectItem>
                    <SelectItem value="|">파이프 (|)</SelectItem>
                    <SelectItem value="\t">탭 (\\t)</SelectItem>
                    <SelectItem value="custom">사용자 지정</SelectItem>
                  </SelectContent>
                </Select>
                <Input
                  placeholder="사용자 지정 구분자"
                  value={customDelim}
                  onChange={(e) => setCustomDelim(e.target.value)}
                  className="w-[200px]"
                  maxLength={3}
                />
                <Button
                  variant="outline"
                  className="bg-transparent"
                  onClick={() => onDelimiterChange?.(customDelim || ",")}
                >
                  적용
                </Button>
                {busy && (
                  <span className="ml-auto flex items-center gap-2 text-xs text-muted-foreground">
                    <Spinner /> 재파싱 중…
                  </span>
                )}
              </div>
            </div>
          )}

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <div className="text-sm font-medium">Key 열</div>
              <Select value={keyCol} onValueChange={setKeyCol}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="열 선택" />
                </SelectTrigger>
                <SelectContent>
                  {columns.map((c) => (
                    <SelectItem key={c} value={c}>
                      {c}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <div className="text-sm font-medium">원문 열</div>
              <Select value={srcCol} onValueChange={setSrcCol}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="열 선택" />
                </SelectTrigger>
                <SelectContent>
                  {columns.map((c) => (
                    <SelectItem key={c} value={c}>
                      {c}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <div className="text-sm font-medium">번역 열 (선택)</div>
              <Select value={tgtCol} onValueChange={setTgtCol}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="열 선택 (없으면 비워두기)" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">없음</SelectItem>
                  {columns.map((c) => (
                    <SelectItem key={c} value={c}>
                      {c}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <div className="text-sm font-medium">상태 열 (선택)</div>
              <Select value={stCol} onValueChange={setStCol}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="열 선택 (없으면 비워두기)" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">없음</SelectItem>
                  {columns.map((c) => (
                    <SelectItem key={c} value={c}>
                      {c}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="mt-2 overflow-auto rounded-md border">
            <table className="min-w-[700px] w-max text-sm table-fixed">
              <ColGroup widths={widths} />
              <thead className="bg-muted/50">
                <tr className="text-left">
                  <ResizableHeaderCell index={0} width={widths[0]} onMouseDown={onMouseDown}>
                    Key
                  </ResizableHeaderCell>
                  <ResizableHeaderCell index={1} width={widths[1]} onMouseDown={onMouseDown}>
                    원문
                  </ResizableHeaderCell>
                  <ResizableHeaderCell index={2} width={widths[2]} onMouseDown={onMouseDown}>
                    번역
                  </ResizableHeaderCell>
                  <ResizableHeaderCell index={3} width={widths[3]} onMouseDown={onMouseDown}>
                    상태
                  </ResizableHeaderCell>
                </tr>
              </thead>
              <tbody>
                {preview.length > 0 ? (
                  preview.map((r, i) => (
                    <tr key={i} className="border-t">
                      <td className="px-3 py-2">{String(r.key)}</td>
                      <td className="px-3 py-2">{String(r.source)}</td>
                      <td className="px-3 py-2">{String(r.target)}</td>
                      <td className="px-3 py-2">{String(r.status)}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={4} className="px-3 py-4 text-center text-muted-foreground">
                      미리보기 없음
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
        <DialogFooter>
          <Button
            onClick={() =>
              onComplete({
                key: keyCol,
                source: srcCol,
                target: tgtCol === "none" ? undefined : tgtCol,
                status: stCol === "none" ? undefined : stCol,
              })
            }
            disabled={!canConfirm}
          >
            매핑 완료
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
