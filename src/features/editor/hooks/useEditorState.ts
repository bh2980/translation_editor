"use client";
import { useState } from "react";
import type { ColumnFiltersState } from "@tanstack/react-table";

export function useEditorState() {
  const [globalFilter, setGlobalFilter] = useState("");
  const [rowSelection, setRowSelection] = useState<Record<string, boolean>>({});
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);

  return {
    globalFilter,
    setGlobalFilter,
    rowSelection,
    setRowSelection,
    columnFilters,
    setColumnFilters,
  } as const;
}

