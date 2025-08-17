"use client"
import type { Column } from "@tanstack/react-table"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { FilterIcon as Funnel, X } from "lucide-react"
import type { TranslationEntry } from "@/features/project/translate/types"
import type { TranslationStatus } from "@/features/project/settings/types"

export function TextColumnFilter({
  column,
  placeholder,
}: {
  column: Column<TranslationEntry, unknown>
  placeholder?: string
}) {
  const value = (column.getFilterValue() as string) ?? ""
  const active = value?.length > 0
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className={`${active ? "text-foreground" : "text-muted-foreground"}`}>
          <Funnel size={16} />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-64" align="start">
        <div className="space-y-2">
          <Input
            value={value}
            onChange={(e) => column.setFilterValue(e.target.value)}
            placeholder={placeholder ?? "텍스트 포함 필터"}
          />
          <div className="flex justify-end">
            <Button
              variant="outline"
              size="sm"
              className="gap-1 bg-transparent"
              onClick={() => column.setFilterValue("")}
            >
              <X size={14} />
              초기화
            </Button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  )
}

export function StatusColumnFilter({
  column,
  statuses,
}: {
  column: Column<TranslationEntry, unknown>
  statuses: TranslationStatus[]
}) {
  const value = (column.getFilterValue() as string) ?? ""
  const active = value?.length > 0
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className={`${active ? "text-foreground" : "text-muted-foreground"}`}>
          <Funnel size={16} />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-64" align="start">
        <div className="space-y-2">
          <Select value={value} onValueChange={(v) => column.setFilterValue(v)}>
            <SelectTrigger>
              <SelectValue placeholder="상태 선택" />
            </SelectTrigger>
            <SelectContent>
              {statuses.map((s) => (
                <SelectItem key={s.id} value={s.id}>
                  {s.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <div className="flex justify-end">
            <Button
              variant="outline"
              size="sm"
              className="gap-1 bg-transparent"
              onClick={() => column.setFilterValue(undefined)}
            >
              <X size={14} />
              초기화
            </Button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  )
}
