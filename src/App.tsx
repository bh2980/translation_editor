import { type ColDef } from "ag-grid-community";
import {
  Grid,
  Menubar,
  MenubarContent,
  MenubarItem,
  MenubarMenu,
  MenubarTrigger,
} from "@/ui";
import { useState } from "react";
import Papa from "papaparse";

export const App = () => {
  const [columnDefs, setColumnDefs] = useState<ColDef[]>([]);
  const [rowData, setRowData] = useState<unknown[]>([]);

  const loadFile = () => {
    const fileInput = document.createElement("input");
    fileInput.type = "file";
    fileInput.accept = "*/*";
    fileInput.onchange = (e: Event) => {
      const file = (e.target as HTMLInputElement).files?.[0];

      if (file) {
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
      } else {
        console.log("파일이 선택되지 않았습니다.");
      }
    };

    fileInput.click();
  };

  const saveToCsv = () => {
    const csv = Papa.unparse(rowData);
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "data.csv";
    a.click();
  };

  return (
    <div className="p-8 flex flex-col gap-4">
      <Menubar>
        <MenubarMenu>
          <MenubarTrigger>File</MenubarTrigger>
          <MenubarContent>
            <MenubarItem onClick={loadFile}>Open File</MenubarItem>
            <MenubarItem onClick={saveToCsv}>Save to CSV</MenubarItem>
          </MenubarContent>
        </MenubarMenu>
      </Menubar>
      <Grid columnDefs={columnDefs} rowData={rowData} domLayout="autoHeight" />
    </div>
  );
};
