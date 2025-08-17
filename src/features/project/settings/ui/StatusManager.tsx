"use client"

import { useState } from "react"
import type { TranslationStatus } from "@/features/project/settings/types"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Trash2 } from "lucide-react"

const PALETTE = [
  { id: "slate", label: "Slate" },
  { id: "amber", label: "Amber" },
  { id: "emerald", label: "Emerald" },
  { id: "violet", label: "Violet" },
]

export function StatusManager({
  statuses,
  onChange,
}: {
  statuses: TranslationStatus[]
  onChange: (next: TranslationStatus[]) => void
}) {
  const [local, setLocal] = useState<TranslationStatus[]>(statuses)

  function update(idx: number, patch: Partial<TranslationStatus>) {
    const next = local.slice()
    next[idx] = { ...next[idx], ...patch }
    setLocal(next)
    onChange(next)
  }

  function add() {
    const next = [...local, { id: crypto.randomUUID(), name: "새 상태", color: "slate", order: local.length }]
    setLocal(next)
    onChange(next)
  }

  function remove(id: string) {
    const next = local.filter((s) => s.id !== id).map((s, i) => ({ ...s, order: i }))
    setLocal(next)
    onChange(next)
  }

  return (
    <div className="space-y-3">
      {local.map((s, idx) => (
        <div key={s.id} className="flex items-center gap-3 rounded-md border p-3">
          <div className={`h-4 w-4 rounded-full ${colorToClass(s.color)}`} aria-hidden />
          <Input className="max-w-[200px]" value={s.name} onChange={(e) => update(idx, { name: e.target.value })} />
          <select
            className="rounded-md border bg-background px-2 py-1 text-sm"
            value={s.color}
            onChange={(e) => update(idx, { color: e.target.value })}
          >
            {PALETTE.map((p) => (
              <option key={p.id} value={p.id}>
                {p.label}
              </option>
            ))}
          </select>
          <div className="ml-auto">
            <Button variant="ghost" size="icon" onClick={() => remove(s.id)}>
              <Trash2 size={16} className="text-red-600" />
            </Button>
          </div>
        </div>
      ))}
      <Button onClick={add}>상태 추가</Button>
    </div>
  )
}

function colorToClass(color: string) {
  switch (color) {
    case "slate":
      return "bg-slate-500"
    case "amber":
      return "bg-amber-500"
    case "emerald":
      return "bg-emerald-500"
    case "violet":
      return "bg-violet-500"
    default:
      return "bg-slate-500"
  }
}
