"use client"

import type React from "react"

import { useMemo, useState } from "react"
import { useNavigate } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Upload } from "lucide-react"
import { FileMappingDialog } from "@/components/file-mapping-dialog"
import { parseSpreadsheet } from "@/lib/parse-spreadsheet"
import { createEmptyProject, saveProject, createBlankProject } from "@/lib/storage"
import type { Project, ParsedRow } from "@/lib/types"
import { v4 as uuidv4 } from "@/lib/uuid"
import { Spinner } from "@/components/spinner"

const LANGS = [
  { code: "ko", label: "Korean (ko)" },
  { code: "en", label: "English (en)" },
  { code: "ja", label: "Japanese (ja)" },
  { code: "zh-CN", label: "Chinese Simplified (zh-CN)" },
  { code: "zh-TW", label: "Chinese Traditional (zh-TW)" },
  { code: "de", label: "German (de)" },
  { code: "fr", label: "French (fr)" },
  { code: "es", label: "Spanish (es)" },
]

export default function NewProjectPage() {
  const [name, setName] = useState("새 프로젝트")
  const [sourceLang, setSourceLang] = useState("ko")
  const [targetLang, setTargetLang] = useState("en")
  const [file, setFile] = useState<File | null>(null)
  const [rows, setRows] = useState<ParsedRow[]>([])
  const [columns, setColumns] = useState<string[]>([])
  const [mappingOpen, setMappingOpen] = useState(false)
  const [isParsing, setIsParsing] = useState(false)
  const [delimiter, setDelimiter] = useState<string>("auto")
  const navigate = useNavigate()

  const isCsv = useMemo(() => {
    const nameLower = (file?.name || "").toLowerCase()
    return nameLower.endsWith(".csv") || file?.type === "text/csv"
  }, [file])

  async function doParse(f: File, delim: string) {
    setIsParsing(true)
    try {
      const { rows, columns } = await parseSpreadsheet(f, { delimiter: delim as any })
      setRows(rows)
      setColumns(columns)
    } finally {
      setIsParsing(false)
    }
  }

  async function onFileSelected(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0]
    if (!f) return
    setFile(f)
    await doParse(f, delimiter)
    setMappingOpen(true)
  }

  async function onCreateBlank() {
    const id = uuidv4()
    const project: Project = createBlankProject({
      id,
      name,
      sourceLang,
      targetLang,
    })
    saveProject(project)
    navigate(`/project/${id}/translate`)
  }

  async function onDelimiterChange(d: string) {
    setDelimiter(d)
    if (file) {
      await doParse(file, d)
    }
  }

  async function onMappingComplete(mapping: { key: string; source: string; target?: string; status?: string }) {
    if (!rows.length) return
    const id = uuidv4()
    const project: Project = createEmptyProject({
      id,
      name,
      sourceLang,
      targetLang,
      rows,
      mapping,
    })
    saveProject(project)
    navigate(`/project/${id}/translate`)
  }

  return (
    <main className="mx-auto max-w-3xl px-6 py-10">
      <Card>
        <CardHeader>
          <CardTitle>새 프로젝트 생성</CardTitle>
          <CardDescription>프로젝트 정보를 설정하고 CSV/XLSX 파일을 불러옵니다.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="name">프로젝트 이름</Label>
              <Input id="name" value={name} onChange={(e) => setName(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>소스 언어</Label>
              <Select value={sourceLang} onValueChange={setSourceLang}>
                <SelectTrigger>
                  <SelectValue placeholder="소스 언어" />
                </SelectTrigger>
                <SelectContent>
                  {LANGS.map((l) => (
                    <SelectItem key={l.code} value={l.code}>
                      {l.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>타겟 언어</Label>
              <Select value={targetLang} onValueChange={setTargetLang}>
                <SelectTrigger>
                  <SelectValue placeholder="타겟 언어" />
                </SelectTrigger>
                <SelectContent>
                  {LANGS.map((l) => (
                    <SelectItem key={l.code} value={l.code}>
                      {l.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Button onClick={onCreateBlank} className="gap-2">
              파일 없이 생성
            </Button>
            <span className="text-sm text-muted-foreground">
              나중에 번역 데이터를 가져오거나 직접 추가할 수 있어요.
            </span>
          </div>

          <div className="relative rounded-md border p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="font-medium">파일 불러오기</div>
                <div className="text-sm text-muted-foreground">CSV 또는 XLSX 형식 지원</div>
              </div>
              <div className={isParsing ? "pointer-events-none opacity-60" : ""}>
                <label htmlFor="upload" className="inline-flex">
                  <Button className="gap-2" asChild disabled={isParsing}>
                    <span>
                      <Upload size={16} />
                      파일 선택
                    </span>
                  </Button>
                </label>
                <input
                  id="upload"
                  type="file"
                  accept=".csv, .xlsx, .xls"
                  className="hidden"
                  onChange={onFileSelected}
                  disabled={isParsing}
                />
              </div>
            </div>
            {file && <div className="mt-3 text-sm">선택된 파일: {file.name}</div>}

            {isParsing && (
              <div className="absolute inset-0 z-10 flex items-center justify-center rounded-md bg-background/70 backdrop-blur-sm">
                <div className="flex items-center gap-2 rounded-md border bg-background px-3 py-2 text-sm">
                  <Spinner />
                  <span>파일 분석 중…</span>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <FileMappingDialog
        open={mappingOpen}
        onOpenChange={setMappingOpen}
        columns={columns}
        sampleRows={rows.slice(0, 5)}
        onComplete={onMappingComplete}
        isCsv={isCsv}
        delimiter={delimiter}
        onDelimiterChange={onDelimiterChange}
        busy={isParsing}
      />
    </main>
  )
}
