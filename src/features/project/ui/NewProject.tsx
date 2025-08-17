import { useForm, Controller } from "react-hook-form";
import { DevTool } from "@hookform/devtools";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ChevronLeft, Upload, X } from "lucide-react";
import { useState } from "react";
import { Project } from "../types";

const LANGS = [
  { code: "ko", label: "Korean (ko)" },
  { code: "en", label: "English (en)" },
  { code: "ja", label: "Japanese (ja)" },
  { code: "zh-CN", label: "Chinese Simplified (zh-CN)" },
  { code: "zh-TW", label: "Chinese Traditional (zh-TW)" },
  { code: "de", label: "German (de)" },
  { code: "fr", label: "French (fr)" },
  { code: "es", label: "Spanish (es)" },
];

export default function NewProjectPage() {
  const { control, register } = useForm<Project>({
    defaultValues: {
      name: "새 프로젝트",
      sourceLang: "ko",
      targetLang: "en",
    },
    mode: "onChange",
  });
  const [file, setFile] = useState<File | null>();

  return (
    <main className="mx-auto max-w-3xl px-6 py-10">
      <Card>
        <CardHeader>
          <Link to=".." className="w-fit">
            <Button variant="ghost" className="text-muted-foreground flex items-center gap-0.5 !p-0 !pr-2 !pl-1">
              <ChevronLeft size={20} />
              뒤로가기
            </Button>
          </Link>
          <div className="h-2" />
          <CardTitle>새 프로젝트 생성</CardTitle>
          <CardDescription>프로젝트 정보를 설정하고 CSV 파일을 불러옵니다.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <form className="grid gap-6 sm:grid-cols-2">
            <div className="space-y-2 col-span-2">
              <Label htmlFor="name">프로젝트 이름</Label>
              <Input id="name" {...register("name", { required: true })} />
            </div>
            <div className="space-y-2">
              <Label>소스 언어</Label>
              <Controller
                control={control}
                name="sourceLang"
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="소스 언어" />
                    </SelectTrigger>
                    <SelectContent>
                      {LANGS.map((l) => (
                        <SelectItem key={l.code} value={l.code}>
                          {l.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
            </div>
            <div className="space-y-2">
              <Label>타겟 언어</Label>
              <Controller
                control={control}
                name="targetLang"
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="타겟 언어" />
                    </SelectTrigger>
                    <SelectContent>
                      {LANGS.map((l) => (
                        <SelectItem key={l.code} value={l.code}>
                          {l.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
            </div>
            <div className="space-y-2 col-span-2">
              <Label>파일 불러오기</Label>
              <div className="relative rounded-md border p-4">
                <div className="flex items-center justify-between">
                  <div className="flex flex-col gap-2">
                    {file ? (
                      <div className="text-sm flex gap-1 items-center">
                        선택된 파일: {file.name}
                        <button className="text-red-500 hover:bg-red-100 p-1 rounded-sm cursor-pointer">
                          <X size={12} />
                        </button>
                      </div>
                    ) : (
                      <div className="text-sm">파일이 없습니다</div>
                    )}
                    <div className="text-xs text-muted-foreground">CSV 또는 XLSX 형식 지원</div>
                  </div>
                  <div>
                    <label htmlFor="upload" className="inline-flex">
                      <Button className="gap-2" asChild>
                        <span>
                          <Upload size={16} />
                          파일 선택
                        </span>
                      </Button>
                    </label>
                    <input id="upload" type="file" accept=".csv, .xlsx, .xls" className="hidden" />
                  </div>
                </div>
              </div>
            </div>
          </form>
          {import.meta.env.DEV && <DevTool control={control} />}
        </CardContent>
        <CardFooter className="justify-end">
          <Button type="submit">생성하기</Button>
        </CardFooter>
      </Card>
    </main>
  );
}
