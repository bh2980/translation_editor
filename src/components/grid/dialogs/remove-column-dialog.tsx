import { useGridStore } from "@/stores";
import { DialogContent, Dialog, DialogClose, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/ui";
import type { ColDef, Column } from "ag-grid-community";
import { useOverlay } from "@lemoncloud/react-overlay";
import type { OverlayProps } from "@lemoncloud/react-overlay/src/types";

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
