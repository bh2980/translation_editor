"use client";

import { useState } from "react";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/shared/ui/card";
import { Download } from "lucide-react";
import { StatusManager } from "@/features/settings/ui/StatusManager";

export default function SettingsPage() {
  const [name, setName] = useState("샘플 프로젝트");
  const [statuses, setStatuses] = useState([
    { id: "1", name: "미번역", color: "slate", order: 0 },
    { id: "2", name: "초벌 번역", color: "amber", order: 1 },
    { id: "3", name: "번역 완료", color: "emerald", order: 2 },
    { id: "4", name: "검수 완료", color: "violet", order: 3 },
  ]);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>프로젝트 정보</CardTitle>
          <CardDescription>
            프로젝트 이름을 변경하고 백업 파일로 내보낼 수 있습니다.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex max-w-md items-center gap-2">
            <Input value={name} onChange={(e) => setName(e.target.value)} />
            <Button onClick={() => alert("저장되었습니다 (더미)")}>저장</Button>
          </div>
          <Button
            variant="outline"
            className="gap-2 bg-transparent"
            onClick={() => alert("JSON 내보내기 (더미)")}
          >
            <Download size={16} />
            JSON 내보내기
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>번역 상태</CardTitle>
          <CardDescription>
            상태를 자유롭게 추가/편집하여 워크플로우에 맞게 구성합니다.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <StatusManager statuses={statuses} onChange={setStatuses} />
        </CardContent>
      </Card>
    </div>
  );
}
