import { type ColDef } from "ag-grid-community";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  Input,
  Menubar,
  MenubarContent,
  MenubarItem,
  MenubarMenu,
  MenubarTrigger,
} from "@/ui";
import { useRef, useState } from "react";
import Papa from "papaparse";
import { downloadFile, loadFile } from "./lib/utils";
import { Cell, Grid, HeaderCell } from "./components/grid";

export const App = () => {
  const [columnDefs, setColumnDefs] = useState<ColDef[]>([
    { headerName: "", checkboxSelection: true, width: 50 },
  ]);
  const [rowData, setRowData] = useState<unknown[]>([]);

  const columnKeyInputRef = useRef<HTMLInputElement>(null);
  const columnNameInputRef = useRef<HTMLInputElement>(null);

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
              editable: true,
              headerComponent: HeaderCell,
              cellRenderer: Cell,
            };
          });

          setColumnDefs((prev) => [...prev, ...(colDef ?? [])]);
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
    const key = columnKeyInputRef.current?.value;
    const name = columnNameInputRef.current?.value;

    if (!key || !name) return;

    setColumnDefs((prev) => [
      ...prev,
      {
        field: key,
        headerName: name,
        sortable: true,
        filter: true,
        editable: true,
      },
    ]);
  };

  return (
    <div className="p-8 flex flex-col gap-4 items-baseline h-full">
      <Menubar>
        <MenubarMenu>
          <MenubarTrigger>File</MenubarTrigger>
          <MenubarContent>
            <MenubarItem onClick={loadCsv}>Open CSV</MenubarItem>
            <MenubarItem onClick={saveToCsv}>Save to CSV</MenubarItem>
          </MenubarContent>
        </MenubarMenu>
      </Menubar>

      <Dialog>
        <DialogTrigger>열 추가</DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Column</DialogTitle>
          </DialogHeader>
          <DialogDescription className="grid grid-cols-2 gap-2">
            <label>Column Key</label>
            <Input
              type="text"
              placeholder="Column Key"
              ref={columnKeyInputRef}
            />
            <label>Column Name</label>
            <Input
              type="text"
              placeholder="Column Name"
              ref={columnNameInputRef}
            />
          </DialogDescription>
          <DialogFooter>
            <DialogClose>Cancel</DialogClose>
            <DialogClose onClick={addColumn}>Add</DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Grid
        columnDefs={columnDefs}
        rowData={rowData}
        domLayout="normal"
        className="w-full h-full"
        enableCellTextSelection
        rowSelection="multiple"
      />
    </div>
  );
};
