"use client"

import type React from "react"

import { useEffect, useMemo, useState } from "react"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import type { GlossaryTerm, Project, TranslationEntry } from "@/lib/types"
import { TokenizedText, extractTokens, findMissingTokens } from "@/lib/tokenize"
import { Wand2, Save } from "lucide-react"

export type EditorMode = "popover" | "drawer-left" | "split"

export function EditorContent({
  entry,
  value,
  setValue,
  glossary,
  project,
  onSave,
}: {
  entry: TranslationEntry
  value: string
  setValue: (v: string) => void
  glossary: GlossaryTerm[]
  project: Project
  onSave: (entry: TranslationEntry) => void
}) {
  const sourceTokens = useMemo(() => extractTokens(entry?.source ?? ""), [entry?.source])
  const targetTokens = useMemo(() => extractTokens(value ?? ""), [value])
  const missing = useMemo(() => findMissingTokens(sourceTokens, targetTokens), [sourceTokens, targetTokens])

  async function aiTranslateSelection() {
    const selection = window.getSelection()?.toString() || entry.source
    const res = await fetch("/api/translate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        provider: project.aiAgent.provider,
        apiKey: project.aiAgent.apiKey,
        model: project.aiAgent.model,
        promptTemplate: project.aiAgent.promptTemplate,
        text: selection,
        sourceLang: project.sourceLang,
        targetLang: project.targetLang,
        glossary,
      }),
    })
    if (res.ok) {
      const data = await res.json()
      setValue((prev) => (selection === entry.source ? data.text : prev.replace(selection, data.text)))
    }
  }

  return (
    <div className="grid gap-4">
      <div>
        <div className="mb-1 text-xs font-medium text-muted-foreground">원문</div>
        <div className="rounded-md border p-3 text-sm">
          <TokenizedText text={entry?.source ?? ""} />
        </div>
      </div>

      <div>
        <div className="mb-1 text-xs font-medium text-muted-foreground">번역</div>
        <Textarea value={value} onChange={(e) => setValue(e.target.value)} rows={10} />
        {missing.length > 0 && (
          <div className="mt-2 text-xs text-amber-600">누락된 토큰: {missing.map((m) => m.value).join(", ")}</div>
        )}
      </div>

      <div className="flex items-center gap-2">
        <Button className="gap-2" onClick={aiTranslateSelection}>
          <Wand2 size={16} />
          AI 번역
        </Button>
        <Button variant="secondary" className="gap-2" onClick={() => onSave({ ...entry, target: value })}>
          <Save size={16} />
          저장
        </Button>
      </div>

      <div>
        <div className="mb-1 text-xs font-medium text-muted-foreground">용어집 미리보기</div>
        <div className="max-h-40 overflow-auto rounded-md border">
          <table className="w-full text-xs">
            <thead className="bg-muted/50">
              <tr className="text-left">
                <th className="px-2 py-1">원문</th>
                <th className="px-2 py-1">번역</th>
                <th className="px-2 py-1">메모</th>
              </tr>
            </thead>
            <tbody>
              {glossary.slice(0, 20).map((g) => (
                <tr key={g.id} className="border-t">
                  <td className="px-2 py-1">{g.source}</td>
                  <td className="px-2 py-1">{g.target}</td>
                  <td className="px-2 py-1">{g.notes}</td>
                </tr>
              ))}
              {glossary.length === 0 && (
                <tr>
                  <td colSpan={3} className="px-2 py-2 text-muted-foreground">
                    용어 없음
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

export function EditorDrawerLeft({
  open,
  onOpenChange,
  entry,
  onSave,
  glossary,
  project,
}: {
  open: boolean
  onOpenChange: (o: boolean) => void
  entry: TranslationEntry | null
  onSave: (entry: TranslationEntry) => void
  glossary: GlossaryTerm[]
  project: Project
}) {
  const [value, setValue] = useState(entry?.target ?? "")
  useEffect(() => setValue(entry?.target ?? ""), [entry?.target])
  if (!entry) return null
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full sm:max-w-2xl">
        <SheetHeader>
          <SheetTitle className="truncate">{entry.key}</SheetTitle>
        </SheetHeader>
        <div className="mt-4">
          <EditorContent
            entry={entry}
            value={value}
            setValue={setValue}
            glossary={glossary}
            project={project}
            onSave={onSave}
          />
        </div>
      </SheetContent>
    </Sheet>
  )
}

export function EditorSplitView({
  entry,
  onSave,
  glossary,
  project,
}: {
  entry: TranslationEntry | null
  onSave: (entry: TranslationEntry) => void
  glossary: GlossaryTerm[]
  project: Project
}) {
  const [value, setValue] = useState(entry?.target ?? "")
  useEffect(() => setValue(entry?.target ?? ""), [entry?.target])
  if (!entry) {
    return (
      <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
        왼쪽에서 항목을 선택하세요.
      </div>
    )
  }
  return (
    <div className="h-full overflow-auto p-4">
      <div className="mb-2 text-xs text-muted-foreground">{entry.key}</div>
      <EditorContent
        entry={entry}
        value={value}
        setValue={setValue}
        glossary={glossary}
        project={project}
        onSave={onSave}
      />
    </div>
  )
}

export function EditorCellPopover({
  children,
  entry,
  onSave,
  onSaved, // NEW
  glossary,
  project,
}: {
  children: React.ReactNode
  entry: TranslationEntry
  onSave: (entry: TranslationEntry) => void
  onSaved?: (saved: TranslationEntry) => void
  glossary: GlossaryTerm[]
  project: Project
}) {
  const [open, setOpen] = useState(false)
  const [value, setValue] = useState(entry?.target ?? "")
  useEffect(() => setValue(entry?.target ?? ""), [entry?.target])
  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>{children}</PopoverTrigger>
      <PopoverContent className="w-[min(92vw,720px)] p-4" align="start" side="bottom">
        <div className="mb-2 text-xs text-muted-foreground">{entry.key}</div>
        <EditorContent
          entry={entry}
          value={value}
          setValue={setValue}
          glossary={glossary}
          project={project}
          onSave={(e) => {
            onSave(e)
            setOpen(false)
            onSaved?.(e)
          }}
        />
      </PopoverContent>
    </Popover>
  )
}
