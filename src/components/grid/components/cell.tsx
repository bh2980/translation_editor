import { ContextMenu, ContextMenuContent, ContextMenuItem, ContextMenuSeparator, ContextMenuTrigger } from "@/ui";
import type { CustomCellRendererProps } from "ag-grid-react";
import { useOverlay } from "@lemoncloud/react-overlay";
import { AddColumnDialog } from "../dialogs/add-column-dialog";
import { useGridStore } from "@/stores";
import { insert } from "@/lib/utils";

export const Cell = (props: CustomCellRendererProps) => {
  const overlay = useOverlay();
  const setRowData = useGridStore((state) => state.setRowData);

  const addRow = (direction: "up" | "down") => {
    const rowIndex = Number(props.node.rowIndex);
    const targetIndex = direction === "up" ? rowIndex : rowIndex + 1;

    setRowData((prev) => insert(prev, targetIndex, {}));
  };

  return (
    <ContextMenu>
      <ContextMenuTrigger className="h-full w-full inline-flex px-3">
        <div>{props.value}</div>
      </ContextMenuTrigger>
      <ContextMenuContent>
        <ContextMenuItem
          onClick={() =>
            overlay.open((overlayProps) => <AddColumnDialog {...overlayProps} column={props.column} direction="left" />)
          }
        >
          왼쪽에 열 추가
        </ContextMenuItem>
        <ContextMenuItem
          onClick={() =>
            overlay.open((overlayProps) => (
              <AddColumnDialog {...overlayProps} column={props.column} direction="right" />
            ))
          }
        >
          오른쪽에 열 추가
        </ContextMenuItem>
        <ContextMenuSeparator />
        <ContextMenuItem onClick={() => addRow("up")}>위쪽에 행 추가</ContextMenuItem>
        <ContextMenuItem onClick={() => addRow("down")}>아래쪽에 행 추가</ContextMenuItem>
      </ContextMenuContent>
    </ContextMenu>
  );
};
