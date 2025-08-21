"use client";
import { flexRender } from "@tanstack/react-table";
import type { Table } from "@tanstack/react-table";
import type { Entry } from "@/entities/editor/types";

export type EditorMode = "popover" | "drawer-left" | "split";

export function EditorDataTable({
  table,
  editorMode,
  selectedId,
  onRowClick,
  highlightedCols,
  onHeaderToggleHighlight,
}: {
  table: Table<Entry>;
  editorMode: EditorMode;
  selectedId?: string | null;
  onRowClick?: (entry: Entry) => void;
  highlightedCols: Record<string, boolean>;
  onHeaderToggleHighlight?: (columnId: string) => void;
}) {
  return (
    <div className="h-full overflow-auto rounded-md border">
      <table className="w-max min-w-[900px] text-sm">
        <thead className="bg-muted/50">
          {table.getHeaderGroups().map((hg) => (
            <tr key={hg.id} className="text-left">
              {hg.headers.map((header) => {
                const colId = header.column.id;
                const isResizable = header.column.getCanResize();
                const size = header.getSize();
                const isFiltered = header.column.getIsFiltered();
                return (
                  <th
                    key={header.id}
                    style={{ width: size, position: "relative" }}
                    className={`px-3 py-2 ${highlightedCols[colId] ? "bg-muted/50" : ""} ${
                      isFiltered
                        ? "after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-emerald-500"
                        : ""
                    }`}
                    onClick={(e) => {
                      if ((e as any).metaKey || (e as any).ctrlKey) {
                        onHeaderToggleHighlight?.(colId);
                      }
                    }}
                  >
                    {header.isPlaceholder
                      ? null
                      : flexRender(header.column.columnDef.header, header.getContext())}
                    {isResizable && (
                      <>
                        <span
                          onMouseDown={header.getResizeHandler()}
                          onTouchStart={header.getResizeHandler()}
                          className="absolute right-0 top-0 h-full w-1 cursor-col-resize"
                          aria-hidden
                        />
                        <span className="absolute right-0 top-0 h-full w-px bg-border" aria-hidden />
                        <span
                          className="absolute -right-1 top-0 h-full w-2 cursor-col-resize"
                          onMouseDown={header.getResizeHandler()}
                          onTouchStart={header.getResizeHandler()}
                          aria-hidden
                        />
                      </>
                    )}
                  </th>
                );
              })}
            </tr>
          ))}
        </thead>
        <tbody>
          {table.getRowModel().rows.map((row) => (
            <tr
              key={row.id}
              className={`border-t align-top ${
                editorMode === "split" && selectedId === row.original.id ? "bg-muted/20" : ""
              }`}
              onClick={() => editorMode === "split" && onRowClick?.(row.original)}
            >
              {row.getVisibleCells().map((cell) => {
                const colId = cell.column.id;
                return (
                  <td
                    key={cell.id}
                    className={`px-3 py-2 ${highlightedCols[colId] ? "bg-muted/20" : ""}`}
                    style={{ width: cell.column.getSize() }}
                  >
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
