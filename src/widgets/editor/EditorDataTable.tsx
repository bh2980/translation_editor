"use client";
import { flexRender } from "@tanstack/react-table";
import type { Table } from "@tanstack/react-table";
import type { Entry } from "@/entities/editor/types";
import { useVirtualizer } from "@tanstack/react-virtual";
import { useMemo, useRef } from "react";

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
  // 1) 실제 스크롤 컨테이너
  const viewportRef = useRef<HTMLDivElement>(null);

  // 2) 열 폭을 CSS Grid로 동기화
  const visibleCols = table.getVisibleLeafColumns();
  const gridTemplateColumns = useMemo(
    () => visibleCols.map((c) => `${c.getSize()}px`).join(" "),
    [visibleCols.map((c) => c.getSize()).join("|")] // 폭 변경 시 재계산
  );

  // 3) 행 가상화
  const rows = table.getRowModel().rows;
  const virtualizer = useVirtualizer({
    count: rows.length,
    getScrollElement: () => viewportRef.current,
    estimateSize: () => 50, // 평균 행높이
    overscan: 12, // 스크롤 여유 버퍼
    // 동적 높이가 섞여 있다면 측정 활성화
    measureElement: (el) => el?.getBoundingClientRect().height ?? 0,
  });

  const virtualItems = virtualizer.getVirtualItems();
  const totalSize = virtualizer.getTotalSize();

  return (
    <div className="h-full w-full rounded-md border flex flex-col overflow-hidden">
      {/* 스크롤 뷰포트 */}
      <div ref={viewportRef} className="h-full w-full overflow-auto relative">
        {/* 4) Sticky Header: 그리드 한 줄 */}
        <div className="sticky top-0 z-10 border-b bg-muted">
          <div className="grid text-sm" style={{ gridTemplateColumns }}>
            {table.getHeaderGroups().map((hg) => (
              <div key={hg.id} className="contents">
                {hg.headers.map((header) => {
                  const colId = header.column.id;
                  const isResizable = header.column.getCanResize();
                  const size = header.getSize();
                  const isFiltered = header.column.getIsFiltered();
                  return (
                    <div
                      key={header.id}
                      role="columnheader"
                      style={{ width: size, position: "relative" }}
                      className={[
                        "px-3 py-2",
                        highlightedCols[colId] ? "bg-muted/50" : "",
                        isFiltered
                          ? "after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-emerald-500"
                          : "",
                      ].join(" ")}
                      onClick={(e) => {
                        if ((e as any).metaKey || (e as any).ctrlKey) {
                          onHeaderToggleHighlight?.(colId);
                        }
                      }}
                    >
                      {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
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
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        </div>

        {/* 5) 가상 리스트 캔버스: 절대 배치된 행들 */}
        <div style={{ height: totalSize, position: "relative" }}>
          {virtualItems.map((vi) => {
            const row = rows[vi.index];
            return (
              <div
                key={row.id}
                // 행 컨테이너를 절대 배치 + translateY
                className={[
                  "absolute left-0 right-0 grid border-t align-top text-sm",
                  editorMode === "split" && selectedId === row.original.id ? "bg-muted/20" : "",
                ].join(" ")}
                style={{
                  transform: `translateY(${vi.start}px)`,
                  height: vi.size, // 고정 높이면 지정, 동적이면 measureElement가 보정
                  gridTemplateColumns,
                }}
                // 동적 높이 측정
                ref={virtualizer.measureElement as unknown as (el: HTMLDivElement | null) => void}
                onClick={() => editorMode === "split" && onRowClick?.(row.original)}
                role="row"
                data-index={vi.index}
              >
                {row.getVisibleCells().map((cell) => {
                  const colId = cell.column.id;
                  return (
                    <div
                      key={cell.id}
                      role="cell"
                      className={["px-3 py-2", highlightedCols[colId] ? "bg-muted/20" : ""].join(" ")}
                      style={{ width: cell.column.getSize() }}
                    >
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </div>
                  );
                })}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
