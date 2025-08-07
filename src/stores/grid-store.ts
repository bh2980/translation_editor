import { create } from "zustand";
import { type ColDef } from "ag-grid-community";

interface GridStore {
  columnDefs: ColDef[];
  rowData: unknown[];
  setColumnDefs: (
    columnDefs: ColDef[] | ((prev: ColDef[]) => ColDef[])
  ) => void;
  setRowData: (rowData: unknown[] | ((prev: unknown[]) => unknown[])) => void;
}

export const useGridStore = create<GridStore>((set, get) => ({
  columnDefs: [],
  rowData: [],
  setColumnDefs: (columnDefs) =>
    set({
      columnDefs:
        typeof columnDefs === "function"
          ? columnDefs(get().columnDefs)
          : columnDefs,
    }),
  setRowData: (rowData) =>
    set({
      rowData: typeof rowData === "function" ? rowData(get().rowData) : rowData,
    }),
}));
