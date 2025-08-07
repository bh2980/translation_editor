import Papa from "papaparse";

import { downloadFile, loadFile } from "./utils";
import { useGridStore } from "@/stores";
import { makeColumnDef } from "./grid";

export const loadCsv = () =>
  loadFile((file) => {
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        const colDef = results.meta?.fields?.map((field) =>
          makeColumnDef(field, field, { editable: true })
        );

        useGridStore.setState({
          columnDefs: colDef ?? [],
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
