import { type ColDef } from "ag-grid-community";
import { Button, Grid } from "@/ui";

export const App = () => {
  // 컬럼 정의
  const columnDefs: ColDef[] = [
    {
      field: "name",
      headerName: "이름",
      sortable: true,
      filter: true,
      editable: true,
    },
    { field: "age", headerName: "나이", sortable: true, filter: true },
    { field: "city", headerName: "도시", sortable: true, filter: true },
    { field: "email", headerName: "이메일", sortable: true, filter: true },
  ];

  // 샘플 데이터
  const rowData = [
    { name: "김철수", age: 25, city: "서울", email: "kim@example.com" },
    { name: "이영희", age: 30, city: "부산", email: "lee@example.com" },
    { name: "박민수", age: 28, city: "대구", email: "park@example.com" },
    { name: "정수진", age: 35, city: "인천", email: "jung@example.com" },
    { name: "최동현", age: 27, city: "광주", email: "choi@example.com" },
  ];

  return (
    <div className="p-8">
      <Button>Hello</Button>
      <Grid
        columnDefs={columnDefs}
        rowData={rowData}
        pagination={true}
        paginationPageSize={10}
        domLayout="autoHeight"
      />
    </div>
  );
};
