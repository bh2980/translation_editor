"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/shared/ui/card";
import { Button } from "@/shared/ui/button";
import { Settings, TrendingUp, FileText, BookOpen, Zap } from "lucide-react";
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
} from "recharts";
import { Switch } from "@/shared/ui/switch";
import { Popover, PopoverContent, PopoverTrigger } from "@/shared/ui/popover";
import { useState } from "react";

const COLORS = {
  slate: "#64748b",
  amber: "#f59e0b",
  emerald: "#10b981",
  violet: "#8b5cf6",
};

const DEFAULT_WIDGETS = [
  {
    id: "translation-progress",
    type: "translation-progress",
    title: "번역 진행률",
    enabled: true,
    position: 0,
  },
  {
    id: "api-usage",
    type: "api-usage",
    title: "API 사용량",
    enabled: true,
    position: 1,
  },
  {
    id: "recent-activity",
    type: "recent-activity",
    title: "최근 활동",
    enabled: true,
    position: 2,
  },
  {
    id: "glossary-stats",
    type: "glossary-stats",
    title: "용어집 통계",
    enabled: true,
    position: 3,
  },
];

const dummyTranslationStats = [
  { name: "미번역", value: 400, color: COLORS.slate },
  { name: "초벌 번역", value: 300, color: COLORS.amber },
  { name: "번역 완료", value: 300, color: COLORS.emerald },
  { name: "검수 완료", value: 200, color: COLORS.violet },
];

const dummyApiUsageStats = [
  { date: "8월 11일", tokens: 4000, requests: 20 },
  { date: "8월 12일", tokens: 3000, requests: 15 },
  { date: "8월 13일", tokens: 2000, requests: 10 },
  { date: "8월 14일", tokens: 2780, requests: 18 },
  { date: "8월 15일", tokens: 1890, requests: 8 },
  { date: "8월 16일", tokens: 2390, requests: 12 },
  { date: "8월 17일", tokens: 3490, requests: 25 },
];

const dummyRecentActivity = [
  { id: "1", key: "GREETING_NPC_01", target: "안녕하세요, 모험가님!" },
  {
    id: "2",
    key: "ITEM_SWORD_DESC",
    target: "전설적인 영웅이 사용했던 검입니다.",
  },
  {
    id: "3",
    key: "QUEST_START_MSG",
    target: "마을을 위협하는 고블린들을 처치해주세요.",
  },
];

export default function DashboardPage() {
  const [widgets, setWidgets] = useState(DEFAULT_WIDGETS);

  const enabledWidgets = widgets
    .filter((w) => w.enabled)
    .sort((a, b) => a.position - b.position);

  function toggleWidget(widgetId: string) {
    setWidgets(
      widgets.map((w) =>
        w.id === widgetId ? { ...w, enabled: !w.enabled } : w
      )
    );
  }

  return (
    <div className="space-y-6">
      <header className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold">샘플 프로젝트 대시보드</h2>
          <p className="text-muted-foreground">
            프로젝트 진행 상황과 통계를 한눈에 확인하세요
          </p>
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
              {widgets.map((widget) => (
                <div
                  key={widget.id}
                  className="flex items-center justify-between"
                >
                  <span className="text-sm">{widget.title}</span>
                  <Switch
                    checked={widget.enabled}
                    onCheckedChange={() => toggleWidget(widget.id)}
                  />
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
            <div className="text-2xl font-bold">50%</div>
            <p className="text-xs text-muted-foreground">500 / 1200 완료</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">총 항목 수</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">1,200</div>
            <p className="text-xs text-muted-foreground">번역 대상 항목</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">용어집</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">150</div>
            <p className="text-xs text-muted-foreground">등록된 용어</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">API 사용량</CardTitle>
            <Zap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">17,550</div>
            <p className="text-xs text-muted-foreground">88회 요청</p>
          </CardContent>
        </Card>
      </div>

      {/* Widgets Grid */}
      <div className="grid gap-6 md:grid-cols-2">
        {enabledWidgets.map((widget) => {
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
                            data={dummyTranslationStats}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            label={({ name, value, percent }) =>
                              `${name}: ${value} (${(percent * 100).toFixed(
                                0
                              )}%)`
                            }
                            outerRadius={80}
                            fill="#8884d8"
                            dataKey="value"
                          >
                            {dummyTranslationStats.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                          </Pie>
                          <Tooltip />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>
              );

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
                        <LineChart data={dummyApiUsageStats}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="date" />
                          <YAxis />
                          <Tooltip />
                          <Line
                            type="monotone"
                            dataKey="tokens"
                            stroke="#8884d8"
                            strokeWidth={2}
                            name="토큰 수"
                          />
                          <Line
                            type="monotone"
                            dataKey="requests"
                            stroke="#82ca9d"
                            strokeWidth={2}
                            name="요청 수"
                          />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>
              );

            case "recent-activity":
              return (
                <Card key={widget.id}>
                  <CardHeader>
                    <CardTitle>{widget.title}</CardTitle>
                    <CardDescription>최근 번역 활동</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {dummyRecentActivity.map((entry) => (
                        <div
                          key={entry.id}
                          className="flex items-center space-x-3"
                        >
                          <div className="h-2 w-2 rounded-full bg-emerald-500" />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate">
                              {entry.key}
                            </p>
                            <p className="text-xs text-muted-foreground truncate">
                              {entry.target}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              );

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
                        <span className="text-sm font-medium">150</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm">메모가 있는 용어</span>
                        <span className="text-sm font-medium">42</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm">빈 번역 용어</span>
                        <span className="text-sm font-medium text-amber-600">
                          12
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm">완성된 용어</span>
                        <span className="text-sm font-medium text-emerald-600">
                          138
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );

            default:
              return null;
          }
        })}
      </div>
    </div>
  );
}
