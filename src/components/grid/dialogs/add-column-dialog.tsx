import { useGridStore } from "@/stores";
import {
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
import type { ColDef, Column } from "ag-grid-community";
import { makeColumnDef } from "@/lib/grid";
import type { OverlayProps } from "@lemoncloud/react-overlay/src/types";
import { useRef } from "react";
import { insert } from "@/lib/utils";

interface AddColumnDialogProps extends OverlayProps {
  column?: Column;
  direction: "left" | "right";
}

export const AddColumnDialog = ({ column, direction, ...overlayProps }: AddColumnDialogProps) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const setColumnDefs = useGridStore((state) => state.setColumnDefs);

  if (!column) {
    return null;
  }

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
