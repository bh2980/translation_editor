"use client";

import { Button } from "@/shared/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/shared/ui/card";
import { Input } from "@/shared/ui/input";
import { Plus, UploadCloud, FileText, ArrowRight, Trash2 } from "lucide-react";
import { Link } from "react-router-dom";

// Dummy data for projects
const recent = [
  { id: "1", name: "샘플 프로젝트 1", updatedAt: new Date().getTime() },
  {
    id: "2",
    name: "다른 게임 프로젝트",
    updatedAt: new Date().getTime() - 86400000,
  },
];

export default function HomePage() {
  return (
    <main className="mx-auto max-w-6xl px-6 py-10">
      <header className="mb-10">
        <h1 className="text-3xl font-semibold tracking-tight">
          게임 스크립트 번역 에디터
        </h1>
        <p className="text-muted-foreground mt-2">
          CSV, XLSX 스크립트를 불러와 매핑하고, 표 기반으로 번역하고, AI 도움을
          받아 워크플로우를 가속하세요.
        </p>
      </header>
      <section className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>새 프로젝트</CardTitle>
            <CardDescription>
              새로운 프로젝트를 생성하고 파일을 불러와 시작합니다.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-3">
            <Link to="/project/new">
              <Button className="gap-2">
                <Plus size={16} />새 프로젝트
              </Button>
            </Link>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>기존 프로젝트</CardTitle>
            <CardDescription>
              기존 프로젝트 파일을 불러와 적용합니다.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-3">
            <div>
              <label htmlFor="import-json" className="inline-flex">
                <Button
                  variant="outline"
                  className="gap-2 bg-transparent"
                  asChild
                >
                  <span>
                    <UploadCloud size={16} />
                    프로젝트 JSON 불러오기
                  </span>
                </Button>
              </label>
              <Input
                id="import-json"
                type="file"
                accept="application/json"
                className="hidden"
                onChange={() =>
                  alert(
                    "더미 데이터에서는 파일 불러오기가 비활성화되어 있습니다."
                  )
                }
              />
            </div>
          </CardContent>
        </Card>

        <Card className="col-span-2">
          <CardHeader>
            <CardTitle>최근 프로젝트</CardTitle>
            <CardDescription>
              최근에 작업한 프로젝트에 다시 접속합니다.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {recent.length === 0 ? (
              <div className="text-sm text-muted-foreground">
                최근 프로젝트가 없습니다.
              </div>
            ) : (
              <ul className="space-y-3">
                {recent.map((p) => (
                  <li
                    key={p.id}
                    className="flex items-center justify-between rounded-md border p-3"
                  >
                    <div className="flex min-w-0 items-center gap-3">
                      <FileText className="text-muted-foreground" size={18} />
                      <div className="min-w-0">
                        <div className="truncate font-medium">{p.name}</div>
                        <div className="text-xs text-muted-foreground">
                          {new Date(p.updatedAt).toLocaleString()}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Link to={`/project/${p.id}/translate`}>
                        <Button variant="ghost" size="sm" className="gap-1">
                          열기
                          <ArrowRight size={14} />
                        </Button>
                      </Link>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-red-600 hover:text-red-700"
                        onClick={() =>
                          alert(
                            "더미 데이터에서는 삭제가 비활성화되어 있습니다."
                          )
                        }
                        aria-label="프로젝트 삭제"
                      >
                        <Trash2 size={16} />
                      </Button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </section>
    </main>
  );
}
