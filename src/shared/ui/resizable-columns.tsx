"use client"

import type React from "react"

import { useCallback, useEffect, useMemo, useRef, useState } from "react"

type ColumnInit = { id: string; initialWidth: number; minWidth?: number }

export function useResizableColumns(cols: ColumnInit[], storageKey?: string) {
  const initial = useMemo(() => {
    if (typeof window !== "undefined" && storageKey) {
      try {
        const raw = localStorage.getItem(`resizable:${storageKey}`)
        if (raw) return JSON.parse(raw) as number[]
      } catch {}
    }
    return cols.map((c) => c.initialWidth)
  }, [cols, storageKey])

  const minWidths = useMemo(() => cols.map((c) => c.minWidth ?? 80), [cols])

  const [widths, setWidths] = useState<number[]>(initial)
  const startX = useRef(0)
  const startWidths = useRef<number[]>([])
  const activeIndex = useRef<number | null>(null)

  useEffect(() => {
    if (!storageKey) return
    try {
      localStorage.setItem(`resizable:${storageKey}`, JSON.stringify(widths))
    } catch {}
  }, [widths, storageKey])

  const onMouseDown = useCallback(
    (index: number, e: React.MouseEvent) => {
      e.preventDefault()
      startX.current = e.clientX
      startWidths.current = widths.slice()
      activeIndex.current = index

      const onMove = (ev: MouseEvent) => {
        if (activeIndex.current === null) return
        const dx = ev.clientX - startX.current
        setWidths((prev) => {
          const next = prev.slice()
          const i = activeIndex.current as number
          next[i] = Math.max(minWidths[i], (startWidths.current[i] ?? prev[i]) + dx)
          return next
        })
      }
      const onUp = () => {
        activeIndex.current = null
        window.removeEventListener("mousemove", onMove)
        window.removeEventListener("mouseup", onUp)
      }
      window.addEventListener("mousemove", onMove)
      window.addEventListener("mouseup", onUp)
    },
    [minWidths, widths],
  )

  return { widths, onMouseDown, setWidths }
}

export function ColGroup({ widths }: { widths: number[] }) {
  return (
    <colgroup>
      {widths.map((w, i) => (
        <col key={i} style={{ width: `${w}px` }} />
      ))}
    </colgroup>
  )
}

export function ResizableHeaderCell({
  index,
  width,
  onMouseDown,
  className,
  children,
}: {
  index: number
  width: number
  onMouseDown: (index: number, e: React.MouseEvent) => void
  className?: string
  children: React.ReactNode
}) {
  return (
    <th className={`relative px-3 py-2 ${className ?? ""}`} style={{ width }}>
      <div className="truncate">{children}</div>
      <span
        aria-hidden
        onMouseDown={(e) => onMouseDown(index, e)}
        className="absolute right-0 top-0 h-full w-1 cursor-col-resize"
      />
      <span className="absolute right-0 top-0 h-full w-px bg-border" aria-hidden />
      <span
        className="absolute -right-1 top-0 h-full w-2 cursor-col-resize"
        onMouseDown={(e) => onMouseDown(index, e)}
      />
    </th>
  )
}
