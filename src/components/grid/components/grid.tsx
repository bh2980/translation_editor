import { AgGridReact, type AgGridReactProps } from "ag-grid-react";
import { AG_GRID_LOCALE_KR } from "@ag-grid-community/locale";
import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/ag-theme-quartz.css";
import { cn } from "@/lib/utils";

type GridProps = AgGridReactProps;

export const Grid = ({ className, ...props }: GridProps) => {
  return (
    <div className={cn("ag-theme-quartz", className)}>
      <AgGridReact theme={"legacy"} localeText={AG_GRID_LOCALE_KR} {...props} />
    </div>
  );
};
