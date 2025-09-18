"use client";
import { useMemo } from "react";
import type { ColumnDef } from "@tanstack/react-table";
import type { Entry } from "@/entities/editor/types";
import { Checkbox } from "@/shared/ui/checkbox";
import { TextColumnFilter } from "@/shared/ui/column-filter";
import {
  Select as UiSelect,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/ui/select";
import { EditorCellPopover } from "@/widgets/editor/EditorPanel";

export function useEditorColumns({
  metaKeys,
  findSimilar,
  saveTranslation,
  updateStatus,
}: {
  metaKeys: string[];
  findSimilar: (entry: Pick<Entry, "key" | "source">) => Promise<Pick<Entry, "key" | "source" | "target">[]>;
  saveTranslation: (entry: Entry, target: string | undefined) => Promise<void>;
  updateStatus: (entry: Entry, statusId: string) => Promise<void>;
}) {
  const cols = useMemo<ColumnDef<Entry>[]>(
    () => [
      {
        id: "rowIndex",
        header: "#",
        cell: ({ row }) => <span className="text-muted-foreground">{row.index + 1}</span>,
        size: 48,
        enableResizing: false,
        enableColumnFilter: false,
      },
      {
        id: "select",
        header: ({ table }) => (
          <div className="px-2">
            <Checkbox
              checked={
                table.getIsAllPageRowsSelected() ||
                (table.getIsSomePageRowsSelected() && "indeterminate")
              }
              onCheckedChange={(v) => table.toggleAllPageRowsSelected(!!v)}
              aria-label="전체 선택"
            />
          </div>
        ),
        cell: ({ row }) => (
          <div className="px-2">
            <Checkbox
              checked={row.getIsSelected()}
              onCheckedChange={(v) => row.toggleSelected(!!v)}
              aria-label="행 선택"
            />
          </div>
        ),
        size: 44,
        enableResizing: false,
        enableColumnFilter: false,
      },
      {
        id: "status",
        header: "상태",
        cell: ({ row }) => {
          const e = row.original;
          const value = e.statusId || "1";
          return (
            <UiSelect value={value} onValueChange={(v) => updateStatus(e, v)}>
              <SelectTrigger className="h-8 w-[120px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1">미번역</SelectItem>
                <SelectItem value="2">초벌 번역</SelectItem>
                <SelectItem value="3">번역 완료</SelectItem>
                <SelectItem value="4">검수 완료</SelectItem>
              </SelectContent>
            </UiSelect>
          );
        },
        size: 160,
        enableColumnFilter: true,
        filterFn: "equalsString",
        accessorFn: (row) => row.statusId,
      },
      {
        accessorKey: "key",
        header: ({ column }) => (
          <div className="flex items-center justify-between">
            <span>key</span>
            <TextColumnFilter column={column} placeholder="key 포함 텍스트" />
          </div>
        ),
        cell: ({ getValue }) => (
          <span className="font-mono text-xs">{String(getValue() ?? "")}</span>
        ),
        size: 220,
        filterFn: "includesString",
        enableColumnFilter: true,
      },
      {
        accessorKey: "source",
        header: ({ column }) => (
          <div className="flex items-center justify-between">
            <span>원문</span>
            <TextColumnFilter column={column} placeholder="원문 포함 텍스트" />
          </div>
        ),
        cell: ({ getValue }) => <span className="block">{String(getValue() ?? "")}</span>,
        size: 520,
        filterFn: "includesString",
        enableColumnFilter: true,
      },
      ...metaKeys.map((mk) => ({
        id: `meta:${mk}`,
        header: ({ column }: any) => (
          <div className="flex items-center justify-between">
            <span>{mk}</span>
            <TextColumnFilter column={column as any} placeholder={`${mk} 포함 텍스트`} />
          </div>
        ),
        cell: ({ row }: any) => {
          const v = (row.original.meta ?? {})[mk];
          return <span className="block truncate max-w-[360px]">{String(v ?? "")}</span>;
        },
        size: 260,
        filterFn: "includesString",
        enableColumnFilter: true,
      } as ColumnDef<Entry>)),
      {
        id: "target",
        header: ({ column }) => (
          <div className="flex items-center justify-between">
            <span>번역</span>
            <TextColumnFilter column={column} placeholder="번역 포함 텍스트" />
          </div>
        ),
        cell: ({ row }) => {
          const e = row.original;
          const content = e.target ? (
            <span className="line-clamp-3">{e.target}</span>
          ) : (
            <span className="text-muted-foreground">클릭하여 번역 입력…</span>
          );

          return (
            <EditorCellPopover
              entry={{ key: e.key, source: e.source, target: e.target }}
              glossary={[]}
              project={{}}
              findSimilar={(entry) => findSimilar(entry)}
              onSave={(upd) => saveTranslation(e, upd.target)}
            >
              <button className="w-full rounded-md border bg-background px-2 py-1 text-left hover:bg-muted">
                {content}
              </button>
            </EditorCellPopover>
          );
        },
        size: 520,
        filterFn: "includesString",
        enableColumnFilter: true,
      },
    ],
    [metaKeys, findSimilar, saveTranslation, updateStatus]
  );

  return cols;
}

