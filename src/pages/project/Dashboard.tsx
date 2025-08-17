"use client"

import { useEffect, useState, useMemo } from "react"
import { useParams } from "react-router-dom"
import type { DashboardWidget } from "@/types"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Settings, TrendingUp, FileText, BookOpen, Zap } from "lucide-react"
import {
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
} from "recharts"
import { Switch } from "@/components/ui/switch"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { useProjectStore } from "@/stores/project-store"

const COLORS = {
  slate: "#64748b",
  amber: "#f59e0b",
  emerald: "#10b981",
  violet: "#8b5cf6",
}

const DEFAULT_WIDGETS: DashboardWidget[] = [
  { id: "translation-progress", type: "translation-progress", title: "번역 진행률", enabled: true, position: 0 },
  { id: "api-usage", type: "api-usage", title: "API 사용량", enabled: true, position: 1 },
  { id: "recent-activity", type: "recent-activity", title: "최근 활동", enabled: true, position: 2 },
  { id: "glossary-stats", type: "glossary-stats", title: "용어집 통계", enabled: true, position: 3 },
]

export default function DashboardPage() {
  const params = useParams<{ id: string }>()
  const project = useProjectStore((s) => s.project)
  const load = useProjectStore((s) => s.load)

  useEffect(() => {
    if (!params?.id) return
    load(params.id)
  }, [params?.id, load])

  const widgets = useMemo(() => {
    return (project?.dashboardWidgets || DEFAULT_WIDGETS)
      .filter((w) => w.enabled)
      .sort((a, b) => a.position - b.position)
  }, [project?.dashboardWidgets])

  const translationStats = useMemo(() => {
    if (!project) return []
    const statusCounts = new Map<string, number>()

    project.entries.forEach((entry) => {
      const status = project.statuses.find((s) => s.id === entry.statusId)
      if (status) {
        statusCounts.set(status.name, (statusCounts.get(status.name) || 0) + 1)
      }
    })

    return project.statuses.map((status) => ({
      name: status.name,
      value: statusCounts.get(status.name) || 0,
      color: COLORS[status.color as keyof typeof COLORS] || COLORS.slate,
    }))
  }, [project])

  const apiUsageStats = useMemo(() => {
    if (!project?.apiUsage) return []

    // Group by day for the last 7 days
    const now = new Date()
    const days = []
    for (let i = 6; i >= 0; i--) {
      const date = new Date(now)
      date.setDate(date.getDate() - i)
      days.push({
        date: date.toISOString().split("T")[0],
        tokens: 0,
        requests: 0,
      })
    }

    project.apiUsage.forEach((usage) => {
      const usageDate = new Date(usage.timestamp).toISOString().split("T")[0]
      const dayData = days.find((d) => d.date === usageDate)
      if (dayData) {
        dayData.tokens += usage.inputTokens + usage.outputTokens
        dayData.requests += 1
      }
    })

    return days.map((day) => ({
      ...day,
      date: new Date(day.date).toLocaleDateString("ko-KR", { month: "short", day: "numeric" }),
    }))
  }, [project?.apiUsage])

  const totalTokens = useMemo(() => {
    return project?.apiUsage?.reduce((sum, usage) => sum + usage.inputTokens + usage.outputTokens, 0) || 0
  }, [project?.apiUsage])

  const totalRequests = useMemo(() => {
    return project?.apiUsage?.length || 0
  }, [project?.apiUsage])

  function toggleWidget(widgetId: string) {
    if (!project) return
    useProjectStore.getState().update((p) => ({
      ...p,
      dashboardWidgets: (p.dashboardWidgets || DEFAULT_WIDGETS).map((w) =>
        w.id === widgetId ? { ...w, enabled: !w.enabled } : w,
      ),
    }))
  }

  if (!project) return <div>프로젝트를 찾을 수 없습니다.</div>

  const completionRate =
    project.entries.length > 0
      ? Math.round(
          (project.entries.filter((e) => {
            const status = project.statuses.find((s) => s.id === e.statusId)
            return status?.name === "번역 완료" || status?.name === "검수 완료"
          }).length /
            project.entries.length) *
            100,
        )
      : 0

  return (
    <div className="space-y-6">
      <header className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold">{project.name} 대시보드</h2>
          <p className="text-muted-foreground">프로젝트 진행 상황과 통계를 한눈에 확인하세요</p>
        </div>
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" className="gap-2 bg-transparent">
              <Settings size={16} />
              위젯 설정
            </Button>
          </PopoverTrigger>
          <PopoverContent align="end" className="w-64">
            <div className="space-y-3">
              <h4 className="font-medium">표시할 위젯 선택</h4>
              {(project.dashboardWidgets || DEFAULT_WIDGETS).map((widget) => (
                <div key={widget.id} className="flex items-center justify-between">
                  <span className="text-sm">{widget.title}</span>
                  <Switch checked={widget.enabled} onCheckedChange={() => toggleWidget(widget.id)} />
                </div>
              ))}
            </div>
          </PopoverContent>
        </Popover>
      </header>

      {/* Key Metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">전체 진행률</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{completionRate}%</div>
            <p className="text-xs text-muted-foreground">
              {
                project.entries.filter((e) => {
                  const status = project.statuses.find((s) => s.id === e.statusId)
                  return status?.name === "번역 완료" || status?.name === "검수 완료"
                }).length
              }{" "}
              / {project.entries.length} 완료
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">총 항목 수</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{project.entries.length.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">번역 대상 항목</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">용어집</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{project.glossary.length.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">등록된 용어</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">API 사용량</CardTitle>
            <Zap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalTokens.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">{totalRequests}회 요청</p>
          </CardContent>
        </Card>
      </div>

      {/* Widgets Grid */}
      <div className="grid gap-6 md:grid-cols-2">
        {widgets.map((widget) => {
          switch (widget.type) {
            case "translation-progress":
              return (
                <Card key={widget.id}>
                  <CardHeader>
                    <CardTitle>{widget.title}</CardTitle>
                    <CardDescription>상태별 번역 진행 현황</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="h-[300px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={translationStats}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            label={({ name, value, percent }) => `${name}: ${value} (${(percent * 100).toFixed(0)}%)`}
                            outerRadius={80}
                            fill="#8884d8"
                            dataKey="value"
                          >
                            {translationStats.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                          </Pie>
                          <Tooltip />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>
              )

            case "api-usage":
              return (
                <Card key={widget.id}>
                  <CardHeader>
                    <CardTitle>{widget.title}</CardTitle>
                    <CardDescription>최근 7일간 API 사용 추이</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="h-[300px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={apiUsageStats}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="date" />
                          <YAxis />
                          <Tooltip />
                          <Line type="monotone" dataKey="tokens" stroke="#8884d8" strokeWidth={2} name="토큰 수" />
                          <Line type="monotone" dataKey="requests" stroke="#82ca9d" strokeWidth={2} name="요청 수" />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>
              )

            case "recent-activity":
              return (
                <Card key={widget.id}>
                  <CardHeader>
                    <CardTitle>{widget.title}</CardTitle>
                    <CardDescription>최근 번역 활동</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {project.entries
                        .filter((e) => e.target.trim().length > 0)
                        .slice(-5)
                        .reverse()
                        .map((entry) => (
                          <div key={entry.id} className="flex items-center space-x-3">
                            <div className="h-2 w-2 rounded-full bg-emerald-500" />
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium truncate">{entry.key}</p>
                              <p className="text-xs text-muted-foreground truncate">{entry.target}</p>
                            </div>
                          </div>
                        ))}
                      {project.entries.filter((e) => e.target.trim().length > 0).length === 0 && (
                        <p className="text-sm text-muted-foreground">아직 번역된 항목이 없습니다.</p>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )

            case "glossary-stats":
              return (
                <Card key={widget.id}>
                  <CardHeader>
                    <CardTitle>{widget.title}</CardTitle>
                    <CardDescription>용어집 사용 현황</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="text-sm">총 용어 수</span>
                        <span className="text-sm font-medium">{project.glossary.length}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm">메모가 있는 용어</span>
                        <span className="text-sm font-medium">
                          {project.glossary.filter((g) => g.notes && g.notes.trim().length > 0).length}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm">빈 번역 용어</span>
                        <span className="text-sm font-medium text-amber-600">
                          {project.glossary.filter((g) => !g.target || g.target.trim().length === 0).length}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm">완성된 용어</span>
                        <span className="text-sm font-medium text-emerald-600">
                          {
                            project.glossary.filter(
                              (g) => g.source && g.target && g.source.trim().length > 0 && g.target.trim().length > 0,
                            ).length
                          }
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )

            default:
              return null
          }
        })}
      </div>
    </div>
  )
}
