import {
  Menubar,
  MenubarContent,
  MenubarItem,
  MenubarMenu,
  MenubarTrigger,
} from "@/ui";
import { Grid } from "./components/grid";
import { useGridStore } from "./stores";
import { loadCsv, saveToCsv } from "./lib/csv";

export const App = () => {
  const { columnDefs, rowData } = useGridStore();

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
