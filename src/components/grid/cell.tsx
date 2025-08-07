import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuTrigger,
} from "@/ui";
import type { CustomCellRendererProps } from "ag-grid-react";

export const Cell = (props: CustomCellRendererProps) => {
  return (
    <ContextMenu>
      <ContextMenuTrigger className="h-full w-full inline-flex px-3">
        <div>{props.value}</div>
      </ContextMenuTrigger>
      <ContextMenuContent>
        <ContextMenuItem>왼쪽에 열 추가</ContextMenuItem>
        <ContextMenuItem>오른쪽에 열 추가</ContextMenuItem>
        <ContextMenuSeparator />
        <ContextMenuItem>위쪽에 행 추가</ContextMenuItem>
        <ContextMenuItem>아래쪽에 행 추가</ContextMenuItem>
      </ContextMenuContent>
    </ContextMenu>
  );
};
