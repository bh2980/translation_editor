import { AgGridReact, type AgGridReactProps } from "ag-grid-react";
import { AG_GRID_LOCALE_KR } from "@ag-grid-community/locale";
import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/ag-theme-quartz.css";

type GridProps = AgGridReactProps;

export const Grid = ({ domLayout = "autoHeight", ...props }: GridProps) => {
  return (
    <div className="ag-theme-quartz">
      <AgGridReact
        theme={"legacy"}
        domLayout={domLayout}
        localeText={AG_GRID_LOCALE_KR}
        {...props}
      />
    </div>
  );
};
