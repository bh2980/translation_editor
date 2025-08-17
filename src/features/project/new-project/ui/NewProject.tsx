import type React from "react";

import { useMemo, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { DevTool } from "@hookform/devtools";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/shared/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/shared/ui/card";
import { Input } from "@/shared/ui/input";
import { Label } from "@/shared/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/shared/ui/select";
import { ChevronLeft, Upload, X } from "lucide-react";
import { FileMappingDialog } from "@/features/project/new-project/ui/FileMappingDialog";
import { parseSpreadsheet } from "@/features/project/new-project/lib/parse-spreadsheet";
import { createEmptyProject, saveProject, createBlankProject } from "@/entities/project/lib/storage";
import type { Project, ParsedRow } from "@/types";
import { v4 as uuidv4 } from "@/shared/lib/uuid";
import { Spinner } from "@/shared/ui/spinner";
import { useProjectStore } from "@/stores/project-store";

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

type FormValues = {
  name: string;
  sourceLang: string;
  targetLang: string;
};

export default function NewProjectPage() {
  const { control, register, handleSubmit, getValues } = useForm<FormValues>({
    defaultValues: {
      name: "새 프로젝트",
      sourceLang: "ko",
      targetLang: "en",
    },
    mode: "onChange",
  });
  const [file, setFile] = useState<File | null>(null);
  const [rows, setRows] = useState<ParsedRow[]>([]);
  const [columns, setColumns] = useState<string[]>([]);
  const [mappingOpen, setMappingOpen] = useState(false);
  const [isParsing, setIsParsing] = useState(false);
  const [delimiter, setDelimiter] = useState<string>("auto");
  const navigate = useNavigate();
  const setProjectGlobal = useProjectStore((s) => s.set);

  const isCsv = useMemo(() => {
    const nameLower = (file?.name || "").toLowerCase();
    return nameLower.endsWith(".csv") || file?.type === "text/csv";
  }, [file]);

  async function doParse(f: File, delim: string) {
    setIsParsing(true);
    try {
      const { rows, columns } = await parseSpreadsheet(f, { delimiter: delim as any });
      setRows(rows);
      setColumns(columns);
    } finally {
      setIsParsing(false);
    }
  }

  async function onFileSelected(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (!f) return;
    setFile(f);
    e.target.value = "";
    await doParse(f, delimiter);
    setMappingOpen(true);
  }

  async function onCreateBlank() {
    const { name, sourceLang, targetLang } = getValues();
    const id = uuidv4();
    const project: Project = createBlankProject({
      id,
      name,
      sourceLang,
      targetLang,
    });
    saveProject(project);
    setProjectGlobal(project);
    navigate(`/project/${id}/translate`);
  }

  async function onDelimiterChange(d: string) {
    setDelimiter(d);
    if (file) {
      await doParse(file, d);
    }
  }

  function clearFile() {
    setFile(null);
  }

  async function onMappingComplete(mapping: { key: string; source: string; target?: string; status?: string }) {
    if (!rows.length) return;
    const { name, sourceLang, targetLang } = getValues();
    const id = uuidv4();
    const project: Project = createEmptyProject({
      id,
      name,
      sourceLang,
      targetLang,
      rows,
      mapping,
    });
    saveProject(project);
    setProjectGlobal(project);
    navigate(`/project/${id}/translate`);
  }

  function onSubmit() {
    return onCreateBlank();
  }

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
          <form onSubmit={handleSubmit(onSubmit)} className="grid gap-6 sm:grid-cols-2">
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
                        <button
                          className="text-red-500 hover:bg-red-100 p-1 rounded-sm cursor-pointer"
                          onClick={clearFile}
                        >
                          <X size={12} />
                        </button>
                      </div>
                    ) : (
                      <div className="text-sm">파일이 없습니다</div>
                    )}
                    <div className="text-xs text-muted-foreground">CSV 또는 XLSX 형식 지원</div>
                  </div>
                  <div className={isParsing ? "pointer-events-none opacity-60" : ""}>
                    <label htmlFor="upload" className="inline-flex">
                      <Button className="gap-2" asChild disabled={isParsing}>
                        <span>
                          <Upload size={16} />
                          파일 선택
                        </span>
                      </Button>
                    </label>
                    <input
                      id="upload"
                      type="file"
                      accept=".csv, .xlsx, .xls"
                      className="hidden"
                      onChange={onFileSelected}
                      disabled={isParsing}
                    />
                  </div>
                </div>

                {isParsing && (
                  <div className="absolute inset-0 z-10 flex items-center justify-center rounded-md bg-background/70 backdrop-blur-sm">
                    <div className="flex items-center gap-2 rounded-md border bg-background px-3 py-2 text-sm">
                      <Spinner />
                      <span>파일 분석 중…</span>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="col-span-2 flex justify-end">
              <Button type="submit">생성하기</Button>
            </div>
          </form>

          {import.meta.env.DEV && <DevTool control={control} />}
        </CardContent>
        <CardFooter className="justify-end"></CardFooter>
      </Card>

      <FileMappingDialog
        open={mappingOpen}
        onOpenChange={setMappingOpen}
        columns={columns}
        sampleRows={rows.slice(0, 5)}
        onComplete={onMappingComplete}
        isCsv={isCsv}
        delimiter={delimiter}
        onDelimiterChange={onDelimiterChange}
        busy={isParsing}
      />
    </main>
  );
}
