"use client";
import { useId, useRef } from "react";
import { Download, Upload, Search, Globe } from "lucide-react";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/shared/ui/select";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/shared/ui/dropdown-menu";
import { LANGUAGE_CODE_MAP, type LanguageCode } from "@/shared/constants/language-codes";

export function EditorToolbar({
  targetLangs = [],
  currentLang,
  onChangeLang,
  onAddLanguage,
  onImportJson,
  onImportCsv,
  onExportJson,
  globalFilter,
  setGlobalFilter,
  selectionCount = 0,
  onDeleteSelected,
}: {
  targetLangs?: LanguageCode[];
  currentLang?: LanguageCode;
  onChangeLang: (lang: LanguageCode) => void;
  onAddLanguage?: () => void;
  onImportJson: (file: File) => void;
  onImportCsv: (file: File) => void;
  onExportJson: () => void;
  globalFilter: string;
  setGlobalFilter: (v: string) => void;
  selectionCount?: number;
  onDeleteSelected?: () => void;
}) {
  const jsonInputRef = useRef<HTMLInputElement | null>(null);
  const csvInputRef = useRef<HTMLInputElement | null>(null);
  const jsonInputId = useId();
  const csvInputId = useId();

  return (
    <header className="flex items-center gap-3 justify-between">
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2">
          <Globe size={16} className="text-muted-foreground" />
          <Select
            value={currentLang}
            onValueChange={(v) => {
              if (v === "__add__") {
                onAddLanguage?.();
                return;
              }
              onChangeLang(v as LanguageCode);
            }}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="번역 언어" />
            </SelectTrigger>
            <SelectContent>
              {targetLangs.map((code) => (
                <SelectItem key={code} value={code}>
                  {LANGUAGE_CODE_MAP[code]} ({code})
                </SelectItem>
              ))}
              <SelectItem value="__add__">언어 추가…</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="gap-2 bg-transparent">
              <Upload size={16} /> 불러오기
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start">
            <DropdownMenuItem onSelect={() => jsonInputRef.current?.click()}>JSON 불러오기</DropdownMenuItem>
            <DropdownMenuItem onSelect={() => csvInputRef.current?.click()}>CSV 불러오기</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
        <input
          id={jsonInputId}
          ref={jsonInputRef}
          type="file"
          accept="application/json,.json"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) onImportJson(file);
            e.currentTarget.value = "";
          }}
        />
        <input
          id={csvInputId}
          ref={csvInputRef}
          type="file"
          accept="text/csv,.csv"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) onImportCsv(file);
            e.currentTarget.value = "";
          }}
        />

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="gap-2 bg-transparent">
              <Download size={16} /> 내보내기
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start">
            <DropdownMenuItem onSelect={onExportJson}>JSON으로 내보내기</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        {selectionCount > 0 && (
          <Button
            variant="destructive"
            className="gap-2"
            onClick={onDeleteSelected}
          >
            선택 {selectionCount}건 삭제
          </Button>
        )}
      </div>

      <div className="relative">
        <Search className="absolute left-2 top-2.5 text-muted-foreground" size={16} />
        <Input
          className="w-[260px] pl-8"
          placeholder="검색 (key/원문/번역)"
          value={globalFilter}
          onChange={(e) => setGlobalFilter(e.target.value)}
        />
      </div>
    </header>
  );
}

export default EditorToolbar;
