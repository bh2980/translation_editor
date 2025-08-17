"use client"

import Papa from "papaparse"
import { useRef, useState } from "react"
import { Button } from "@/shared/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/shared/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/shared/ui/select"
import { Input } from "@/shared/ui/input"
import type { GlossaryTerm } from "@/entities/project/model"
import { Spinner } from "@/shared/ui/spinner"

export function GlossaryImportDialog({
  open,
  onOpenChange,
  onImported,
}: {
  open: boolean
  onOpenChange: (o: boolean) => void
  onImported: (terms: GlossaryTerm[]) => void
}) {
  const [delimiter, setDelimiter] = useState<string>(",")
  const [custom, setCustom] = useState("")
  const [busy, setBusy] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)

  function resolveDelimiter(val: string) {
    if (val === "\\t") return "\t"
    if (val === "custom") return custom || ","
    return val
  }

  function parseFile(file: File, delim: string) {
    setBusy(true)
    const reader = new FileReader()
    reader.onload = () => {
      const text = String(reader.result ?? "")
      const result = Papa.parse<string[]>(text, { delimiter: delim, skipEmptyLines: true })
      const data = result.data as string[][]
      const terms: GlossaryTerm[] = []
      for (const row of data) {
        const [source, target, notes] = row
        if (!source || !target) continue
        terms.push({ id: crypto.randomUUID(), source: source.trim(), target: target.trim(), notes: notes?.trim() })
      }
      onImported(terms)
      setBusy(false)
      onOpenChange(false)
    }
    reader.readAsText(file)
  }

  return (
    <Dialog open={open} onOpenChange={(o) => !busy && onOpenChange(o)}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>CSV 가져오기</DialogTitle>
          <DialogDescription>용어집 CSV 파일과 구분자를 선택하세요.</DialogDescription>
        </DialogHeader>
        <div className="space-y-3">
          <div className="space-y-2">
            <div className="text-sm font-medium">구분자</div>
            <div className="flex items-center gap-2">
              <Select value={delimiter} onValueChange={setDelimiter}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="구분자 선택" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value=",">콤마 (,)</SelectItem>
                  <SelectItem value=";">세미콜론 (;)</SelectItem>
                  <SelectItem value="|">파이프 (|)</SelectItem>
                  <SelectItem value="\\t">탭 (\\t)</SelectItem>
                  <SelectItem value="custom">사용자 지정</SelectItem>
                </SelectContent>
              </Select>
              <Input
                placeholder="사용자 지정 구분자"
                value={custom}
                onChange={(e) => setCustom(e.target.value)}
                className="w-[160px]"
                maxLength={3}
              />
            </div>
            <p className="text-xs text-muted-foreground">열 순서: 원문, 번역, 메모</p>
          </div>
          <div>
            <input
              ref={fileRef}
              type="file"
              accept=".csv"
              onChange={(e) => {
                const f = e.target.files?.[0]
                if (f) parseFile(f, resolveDelimiter(delimiter))
              }}
            />
          </div>
          {busy && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Spinner /> 가져오는 중…
            </div>
          )}
        </div>
        <DialogFooter>
          <Button variant="outline" className="bg-transparent" onClick={() => onOpenChange(false)} disabled={busy}>
            닫기
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
