"use client";

import { useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import { useLiveQuery } from "dexie-react-hooks";
import { db } from "@/shared/lib/db";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/shared/ui/card";
import { Download, Check, ChevronsUpDown } from "lucide-react";
import { StatusManager } from "@/features/settings/ui/StatusManager";
import { LANGUAGE_CODE_LIST, LANGUAGE_CODE_MAP, type LanguageCode } from "@/shared/constants/language-codes";
import { Popover, PopoverContent, PopoverTrigger } from "@/shared/ui/popover";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/shared/ui/command";
import { Checkbox } from "@/shared/ui/checkbox";
import { cn } from "@/shared/lib/ui/cn";

export default function SettingsPage() {
  const { id } = useParams<{ id: string }>();
  const project = useLiveQuery(async () => (id ? db.projects.get(Number(id)) : undefined), [id]);
  const [name, setName] = useState<string>("");
  const [sourceLang, setSourceLang] = useState<LanguageCode | undefined>(undefined);
  const [targetLangs, setTargetLangs] = useState<LanguageCode[]>([]);
  const [statuses, setStatuses] = useState([
    { id: "1", name: "미번역", color: "slate", order: 0 },
    { id: "2", name: "초벌 번역", color: "amber", order: 1 },
    { id: "3", name: "번역 완료", color: "emerald", order: 2 },
    { id: "4", name: "검수 완료", color: "violet", order: 3 },
  ]);

  useMemo(() => {
    if (!project) return;
    setName(project.name ?? "");
    setSourceLang(project.sourceLang as LanguageCode | undefined);
    setTargetLangs((project.targetLang as LanguageCode[] | undefined) ?? []);
  }, [project]);

  const saveProjectBasics = async () => {
    if (!id) return;
    await db.projects.update(Number(id), {
      name,
      sourceLang,
      targetLang: targetLangs,
      updatedAt: Date.now(),
    } as any);
    alert("저장되었습니다");
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>프로젝트 설정</CardTitle>
          <CardDescription>소스/번역 언어와 이름을 설정합니다.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2 col-span-2">
              <label className="text-sm">프로젝트 이름</label>
              <Input value={name} onChange={(e) => setName(e.target.value)} />
            </div>
            <div className="space-y-2">
              <label className="text-sm">소스 언어</label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    type="button"
                    variant="outline"
                    role="combobox"
                    className={cn("w-full justify-between", !sourceLang && "text-muted-foreground")}
                  >
                    {sourceLang ? `${LANGUAGE_CODE_MAP[sourceLang]} (${sourceLang})` : "소스 언어 선택"}
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="p-0 w-[var(--radix-popover-trigger-width)]">
                  <Command>
                    <CommandInput placeholder="언어 검색..." />
                    <CommandEmpty>검색 결과가 없습니다.</CommandEmpty>
                    <CommandList>
                      <CommandGroup>
                        {LANGUAGE_CODE_LIST.map((langCode) => (
                          <CommandItem key={langCode} onSelect={() => setSourceLang(langCode)}>
                            {`${LANGUAGE_CODE_MAP[langCode]} (${langCode})`}
                            {sourceLang === langCode ? <Check className="ml-auto h-4 w-4 opacity-60" /> : null}
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
            </div>
            <div className="space-y-2">
              <label className="text-sm">번역 언어</label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    type="button"
                    variant="outline"
                    role="combobox"
                    className={cn("w-full justify-between", targetLangs.length === 0 && "text-muted-foreground")}
                  >
                    {targetLangs.length
                      ? targetLangs.map((c) => `${LANGUAGE_CODE_MAP[c]} (${c})`).join(", ")
                      : "대상 언어 선택"}
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="p-0 w-[var(--radix-popover-trigger-width)]">
                  <Command>
                    <CommandInput placeholder="언어 검색..." />
                    <CommandEmpty>검색 결과가 없습니다.</CommandEmpty>
                    <CommandList>
                      <CommandGroup>
                        {LANGUAGE_CODE_LIST.map((langCode) => {
                          const language = LANGUAGE_CODE_MAP[langCode];
                          const checked = targetLangs.includes(langCode as LanguageCode);
                          return (
                            <CommandItem
                              key={langCode}
                              className="gap-2"
                              onSelect={() => {
                                const next = checked
                                  ? targetLangs.filter((c) => c !== (langCode as LanguageCode))
                                  : Array.from(new Set([...targetLangs, langCode as LanguageCode]));
                                const ordered = LANGUAGE_CODE_LIST.filter((c) => next.includes(c));
                                setTargetLangs(ordered as LanguageCode[]);
                              }}
                            >
                              <Checkbox checked={checked} onCheckedChange={() => {}} />
                              <span className="flex-1">{`${language} (${langCode})`}</span>
                              {checked ? <Check className="h-4 w-4 opacity-60" /> : null}
                            </CommandItem>
                          );
                        })}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
            </div>
            <div className="sm:col-span-2 flex justify-end gap-2">
              <Button onClick={saveProjectBasics}>저장</Button>
              <Button variant="outline" className="gap-2 bg-transparent" onClick={() => alert("JSON 내보내기 (더미)")}>
                <Download size={16} /> JSON 내보내기
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>번역 상태</CardTitle>
          <CardDescription>상태를 자유롭게 추가/편집하여 워크플로우에 맞게 구성합니다.</CardDescription>
        </CardHeader>
        <CardContent>
          <StatusManager statuses={statuses} onChange={setStatuses} />
        </CardContent>
      </Card>
    </div>
  );
}
