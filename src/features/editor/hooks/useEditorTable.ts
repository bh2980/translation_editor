"use client";
import type { Entry } from "@/entities/editor/types";
import type { ColumnDef } from "@tanstack/react-table";
import { getCoreRowModel, getSortedRowModel, getFilteredRowModel, useReactTable } from "@tanstack/react-table";

export function useEditorTable({
  data,
  columns,
  state,
  handlers,
}: {
  data: Entry[];
  columns: ColumnDef<Entry, any>[];
  state: {
    rowSelection: Record<string, boolean>;
    columnFilters: any;
    globalFilter: string;
  };
  handlers: {
    setRowSelection: (updater: any) => void;
    setColumnFilters: (updater: any) => void;
    setGlobalFilter: (updater: any) => void;
  };
}) {
  const table = useReactTable({
    data,
    columns,
    state,
    onColumnFiltersChange: handlers.setColumnFilters,
    onGlobalFilterChange: handlers.setGlobalFilter,
    enableRowSelection: true,
    onRowSelectionChange: handlers.setRowSelection,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    globalFilterFn: (row, _columnId, filterValue: string) => {
      if (!filterValue) return true;
      const q = String(filterValue).toLowerCase();
      const e = row.original as Entry;
      return (
        e.key.toLowerCase().includes(q) ||
        e.source.toLowerCase().includes(q) ||
        e.target.toLowerCase().includes(q)
      );
    },
    columnResizeMode: "onChange",
  });

  return table;
}

