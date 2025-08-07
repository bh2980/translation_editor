import { create } from "zustand";
import { type ColDef } from "ag-grid-community";

interface GridStore {
  columnDefs: ColDef[];
  rowData: unknown[];
  setColumnDefs: (columnDefs: ColDef[]) => void;
  setRowData: (rowData: unknown[]) => void;
}

export const useGridStore = create<GridStore>((set) => ({
  columnDefs: [],
  rowData: [],
  setColumnDefs: (columnDefs) => set({ columnDefs }),
  setRowData: (rowData) => set({ rowData }),
}));
