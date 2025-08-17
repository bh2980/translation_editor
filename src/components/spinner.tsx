"use client"

import { cn } from "@/lib/utils"

export function Spinner({ className }: { className?: string }) {
  return (
    <span
      aria-label="loading"
      role="status"
      className={cn(
        "inline-block h-4 w-4 animate-spin rounded-full border-2 border-slate-300 border-t-transparent",
        className,
      )}
    />
  )
}
