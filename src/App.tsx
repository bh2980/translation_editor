import { type ColDef } from "ag-grid-community";
import {
  Button,
  Grid,
  Menubar,
  MenubarContent,
  MenubarItem,
  MenubarMenu,
  MenubarTrigger,
} from "@/ui";
import { useState } from "react";
import Papa from "papaparse";
import { downloadFile, loadFile } from "./lib/utils";

export const App = () => {
  const [columnDefs, setColumnDefs] = useState<ColDef[]>([]);
  const [rowData, setRowData] = useState<unknown[]>([]);

  const loadCsv = () =>
    loadFile((file) => {
      Papa.parse(file, {
        header: true,
        skipEmptyLines: true,
        complete: (results) => {
          const colDef = results.meta?.fields?.map((field) => {
            return {
              field: field,
              headerName: field,
              sortable: true,
              filter: true,
              editable: true,
            };
          });

          setColumnDefs(colDef ?? []);
          setRowData(results.data);
        },
      });
    });

  const saveToCsv = () => {
    const csv = Papa.unparse(rowData, {
      columns: columnDefs.map((col) => col.field ?? ""),
    });

    const blob = new Blob([csv], { type: "text/csv" });

    downloadFile(blob, "data.csv");
  };

  const addColumn = () => {
    setColumnDefs([
      ...columnDefs,
      {
        field: "newColumn",
        headerName: "New Column",
        sortable: true,
        filter: true,
        editable: true,
      },
    ]);
  };

  return (
    <div className="p-8 flex flex-col gap-4 items-baseline">
      <Menubar>
        <MenubarMenu>
          <MenubarTrigger>File</MenubarTrigger>
          <MenubarContent>
            <MenubarItem onClick={loadCsv}>Open CSV</MenubarItem>
            <MenubarItem onClick={saveToCsv}>Save to CSV</MenubarItem>
          </MenubarContent>
        </MenubarMenu>
      </Menubar>
      <Button onClick={addColumn}>열 추가</Button>
      <Grid
        columnDefs={columnDefs}
        rowData={rowData}
        domLayout="autoHeight"
        className="w-full"
      />
    </div>
  );
};
