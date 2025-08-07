import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
} from "@/ui";
import type { CustomHeaderProps } from "ag-grid-react";

export const HeaderCell = (props: CustomHeaderProps) => {
  return (
    <ContextMenu>
      <ContextMenuTrigger className="h-full w-full flex items-center px-3">
        {props.displayName}
      </ContextMenuTrigger>
      <ContextMenuContent>
        <ContextMenuItem>왼쪽에 열 추가</ContextMenuItem>
        <ContextMenuItem>오른쪽에 열 추가</ContextMenuItem>
        <ContextMenuItem>열 삭제</ContextMenuItem>
        <ContextMenuItem>열 정보 수정</ContextMenuItem>
      </ContextMenuContent>
    </ContextMenu>
  );
};
