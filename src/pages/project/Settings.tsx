"use client"

import { useEffect, useState } from "react"
import { useParams } from "react-router-dom"
import { loadProject, saveProject, exportProjectToFile } from "@/lib/storage"
import type { Project } from "@/lib/types"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { StatusManager } from "@/components/status-manager"
import { Download } from "lucide-react"

export default function SettingsPage() {
  const params = useParams<{ id: string }>()
  const [project, setProject] = useState<Project | null>(null)
  const [name, setName] = useState("")

  useEffect(() => {
    if (!params?.id) return
    const p = loadProject(params.id)
    setProject(p)
    setName(p?.name ?? "")
  }, [params?.id])

  function saveName() {
    if (!project) return
    const next = { ...project, name, updatedAt: Date.now() }
    setProject(next)
    saveProject(next)
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
              const updated = { ...project, statuses: next, updatedAt: Date.now() }
              setProject(updated)
              saveProject(updated)
            }}
          />
        </CardContent>
      </Card>
    </div>
  )
}
