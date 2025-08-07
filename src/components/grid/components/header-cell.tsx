import { ContextMenu, ContextMenuContent, ContextMenuItem, ContextMenuTrigger } from "@/ui";
import type { CustomHeaderProps } from "ag-grid-react";
import { useOverlay } from "@lemoncloud/react-overlay";
import { AddColumnDialog } from "../dialogs/add-column-dialog";
import { RemoveColumnDialog } from "../dialogs/remove-column-dialog";

export const HeaderCell = (props: CustomHeaderProps) => {
  const overlay = useOverlay();

  const editColumn = () => {
    console.log("editColumn", props.column.getColId());
  };

  return (
    <ContextMenu>
      <ContextMenuTrigger className="h-full w-full flex items-center px-3">{props.displayName}</ContextMenuTrigger>
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
        <ContextMenuItem
          onClick={() => overlay.open((overlayProps) => <RemoveColumnDialog {...overlayProps} column={props.column} />)}
        >
          열 삭제
        </ContextMenuItem>
        <ContextMenuItem onClick={editColumn}>열 정보 수정</ContextMenuItem>
      </ContextMenuContent>
    </ContextMenu>
  );
};
