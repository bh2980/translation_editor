"use client"

import { useEffect, useState } from "react"
import { useParams } from "react-router-dom"
import { exportProjectToFile } from "@/features/project/lib/storage"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { StatusManager } from "@/features/project/settings/ui/StatusManager"
import { Download } from "lucide-react"
import { useProjectStore } from "@/stores/project-store"

export default function SettingsPage() {
  const params = useParams<{ id: string }>()
  const project = useProjectStore((s) => s.project)
  const load = useProjectStore((s) => s.load)
  const [name, setName] = useState("")

  useEffect(() => {
    if (!params?.id) return
    load(params.id)
  }, [params?.id, load])

  useEffect(() => {
    setName(project?.name ?? "")
  }, [project?.name])

  function saveName() {
    if (!project) return
    useProjectStore.getState().update((p) => ({ ...p, name }))
  }

  if (!project) return <div>프로젝트를 찾을 수 없습니다.</div>

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>프로젝트 정보</CardTitle>
          <CardDescription>프로젝트 이름을 변경하고 백업 파일로 내보낼 수 있습니다.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex max-w-md items-center gap-2">
            <Input value={name} onChange={(e) => setName(e.target.value)} />
            <Button onClick={saveName}>저장</Button>
          </div>
          <Button variant="outline" className="gap-2 bg-transparent" onClick={() => exportProjectToFile(project)}>
            <Download size={16} />
            JSON 내보내기
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>번역 상태</CardTitle>
          <CardDescription>상태를 자유롭게 추가/편집하여 워크플로우에 맞게 구성합니다.</CardDescription>
        </CardHeader>
        <CardContent>
          <StatusManager
            statuses={project.statuses}
            onChange={(next) => {
              useProjectStore.getState().update((p) => ({ ...p, statuses: next }))
            }}
          />
        </CardContent>
      </Card>
    </div>
  )
}
