import { Cell, HeaderCell } from "@/components/grid";
import type { ColDef } from "ag-grid-community";

export const makeColumnDef = (
  columnKey: string,
  headerName: string,
  config?: Omit<Partial<ColDef>, "field" | "headerName">
) => {
  return {
    field: columnKey,
    headerName,
    headerComponent: HeaderCell,
    cellRenderer: Cell,
    ...config,
  };
};
