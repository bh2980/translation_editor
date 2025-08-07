import Papa from "papaparse";

import { downloadFile, loadFile } from "./utils";
import { Cell, HeaderCell } from "@/components/grid";
import { useGridStore } from "@/stores";

export const loadCsv = () =>
  loadFile((file) => {
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        const colDef = results.meta?.fields?.map((field) => {
          return {
            field: field,
            headerName: field,
            editable: true,
            headerComponent: HeaderCell,
            cellRenderer: Cell,
          };
        });

        useGridStore.setState({
          columnDefs: [
            ...useGridStore.getState().columnDefs,
            ...(colDef ?? []),
          ],
          rowData: results.data,
        });
      },
    });
  });

export const saveToCsv = () => {
  const data = useGridStore.getState().rowData;

  if (!data.length) {
    return;
  }

  const csv = Papa.unparse(data, {
    columns: useGridStore.getState().columnDefs.map((col) => col.field ?? ""),
  });

  const blob = new Blob([csv], { type: "text/csv" });

  downloadFile(blob, "data.csv");
};
