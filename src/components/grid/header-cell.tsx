import { useGridStore } from "@/stores";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
  DialogContent,
  Dialog,
  DialogClose,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  Input,
  Label,
} from "@/ui";
import type { CustomHeaderProps } from "ag-grid-react";
import { insert } from "@/lib/utils";
import type { ColDef, Column } from "ag-grid-community";
import { makeColumnDef } from "@/lib/grid";
import { useOverlay } from "@lemoncloud/react-overlay";
import type { OverlayProps } from "@lemoncloud/react-overlay/src/types";
import { useRef } from "react";

interface AddColumnDialogProps extends OverlayProps {
  column: Column;
  direction: "left" | "right";
}

export const AddColumnDialog = ({ column, direction, ...overlayProps }: AddColumnDialogProps) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const setColumnDefs = useGridStore((state) => state.setColumnDefs);

  const addColumn = () => {
    if (!inputRef.current?.value) {
      return;
    }

    const columnName = inputRef.current.value;

    const currentColId = column.getColId();

    setColumnDefs((prev: ColDef[]) => {
      const currentIndex = prev.findIndex((col: ColDef) => col.field === currentColId);
      const targetIndex = direction === "left" ? currentIndex : currentIndex + 1;

      return insert(prev, targetIndex, makeColumnDef(columnName, columnName)) as ColDef[];
    });
  };

  return (
    <Dialog {...overlayProps}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{direction === "left" ? "왼쪽" : "오른쪽"}에 열 추가하기</DialogTitle>
        </DialogHeader>
        <DialogDescription>
          <Label>열 이름</Label>
          <Input type="text" placeholder="Column Name" ref={inputRef} />
        </DialogDescription>
        <DialogFooter>
          <DialogClose>취소</DialogClose>
          <DialogClose onClick={addColumn}>확인</DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

interface RemoveColumnDialogProps extends OverlayProps {
  column: Column;
}

export const RemoveColumnDialog = ({ column, ...overlayProps }: RemoveColumnDialogProps) => {
  const setColumnDefs = useGridStore((state) => state.setColumnDefs);

  const removeColumn = () => {
    const currentColId = column.getColId();

    setColumnDefs((prev: ColDef[]) => {
      return prev.filter((col: ColDef) => col.field !== currentColId) as ColDef[];
    });
  };

  return (
    <Dialog {...overlayProps}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{column.getColId()} 열 삭제하기</DialogTitle>
        </DialogHeader>
        <DialogDescription>
          <p>정말 삭제하시겠습니까?</p>
        </DialogDescription>
        <DialogFooter>
          <DialogClose>취소</DialogClose>
          <DialogClose onClick={removeColumn}>확인</DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

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
