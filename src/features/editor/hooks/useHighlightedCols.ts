"use client";
import { useState } from "react";

export function useHighlightedCols() {
  const [highlightedCols, setHighlightedCols] = useState<Record<string, boolean>>({});
  function toggleHighlight(colId: string) {
    setHighlightedCols((prev) => ({ ...prev, [colId]: !prev[colId] }));
  }
  return { highlightedCols, toggleHighlight } as const;
}

