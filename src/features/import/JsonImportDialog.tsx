"use client";
import { useEffect, useMemo, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/shared/ui/dialog";
import { Button } from "@/shared/ui/button";
import { Label } from "@/shared/ui/label";
import { Checkbox } from "@/shared/ui/checkbox";
import { Textarea } from "@/shared/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/ui/select";
import { LANGUAGE_CODE_MAP, type LanguageCode } from "@/shared/constants/language-codes";
import { ScrollArea } from "@/shared/ui/scroll-area";
import { db } from "@/shared/lib/db";

type Item = Record<string, unknown>;

function normalizeJson(json: unknown): { items: Item[]; objectKeys?: string[] } {
  if (Array.isArray(json)) {
    const items = json.map((v) => (typeof v === "object" && v !== null ? (v as any) : ({ value: v } as Item)));
    return { items };
  }
  if (typeof json === "object" && json !== null) {
    const obj = json as Record<string, unknown>;
    const keys = Object.keys(obj);
    const items = keys.map((k) => (typeof obj[k] === "object" && obj[k] !== null ? (obj[k] as any) : ({ value: obj[k] } as Item)));
    return { items, objectKeys: keys };
  }
  return { items: [{ value: json }] };
}

export function JsonImportDialog({
  open,
  onOpenChange,
  projectId,
  targetLangs,
  initialText,
  sourceLang,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  projectId: number;
  targetLangs: LanguageCode[];
  initialText?: string;
  sourceLang?: LanguageCode;
}) {
  const [jsonText, setJsonText] = useState<string>("");
  const [parsed, setParsed] = useState<{ items: Item[]; objectKeys?: string[] } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const NONE = "__none__";
  type FormValues = {
    lang?: LanguageCode;
    keyField: string; // 'index' | 'objectKey' | field name
    sourceField: string;
    targetField: string; // field name or NONE
    metaFields: string[];
  };
  const methods = useForm<FormValues>({
    defaultValues: {
      lang: undefined,
      keyField: "index",
      sourceField: "",
      targetField: NONE,
      metaFields: [],
    },
  });
  const { control, setValue, getValues, reset, watch } = methods;

  useEffect(() => {
    if (!open) {
      setJsonText("");
      setParsed(null);
      setError(null);
      reset({ lang: targetLangs[0], keyField: "index", sourceField: "", targetField: NONE, metaFields: [] });
    }
  }, [open, targetLangs]);

  useEffect(() => {
    if (open && initialText) {
      setJsonText(initialText);
      try {
        const norm = normalizeJson(JSON.parse(initialText));
        setParsed(norm);
        setError(null);
        const keys = Object.keys(norm.items[0] ?? {});
        const guessSource = ["source", "src", "text", "original"].find((k) => keys.includes(k));
        const guessTarget = ["target", "translation", "translated"].find((k) => keys.includes(k));
        if (guessSource) setValue("sourceField", guessSource);
        if (guessTarget) setValue("targetField", guessTarget);
        if (!getValues("lang")) setValue("lang", targetLangs[0]);
      } catch (e: any) {
        setError(e?.message || "JSON 파싱 오류");
        setParsed(null);
      }
    }
  }, [open, initialText, targetLangs]);

  const fields = useMemo(() => {
    const first = parsed?.items?.[0] ?? {};
    return Object.keys(first);
  }, [parsed]);

  function handleParse() {
    try {
      const j = JSON.parse(jsonText);
      const norm = normalizeJson(j);
      setParsed(norm);
      setError(null);
      // default source/target guess
      const keys = Object.keys(norm.items[0] ?? {});
      const guessSource = ["source", "src", "text", "original"].find((k) => keys.includes(k));
      const guessTarget = ["target", "translation", "translated"].find((k) => keys.includes(k));
      if (guessSource) setValue("sourceField", guessSource);
      if (guessTarget) setValue("targetField", guessTarget);
      if (!getValues("lang")) setValue("lang", targetLangs[0]);
    } catch (e: any) {
      setError(e?.message || "JSON 파싱 오류");
      setParsed(null);
    }
  }

  async function handleImport() {
    if (!parsed) return;
    const { lang, keyField, sourceField, targetField, metaFields } = getValues();
    if (!sourceField) {
      alert("원문 필드를 선택하세요");
      return;
    }
    if (!lang) {
      alert("대상 언어를 선택하세요");
      return;
    }
    const toSave = parsed.items
      .map((item, i) => {
        let kVal: unknown;
        if (keyField === "index") kVal = i;
        else if (keyField === "objectKey") kVal = parsed.objectKeys?.[i];
        else kVal = (item as any)[keyField];
        const k = kVal == null ? String(i) : String(kVal);
        const source = (item as any)[sourceField];
        const target = targetField && targetField !== NONE ? (item as any)[targetField] : undefined;
        const meta: Record<string, unknown> | undefined = (metaFields?.length ?? 0) > 0
          ? Object.fromEntries(metaFields.map((mf) => [mf, (item as any)[mf]]))
          : undefined;
        return {
          key: k,
          source: String(source ?? ""),
          meta,
          rawData: item,
          createdAt: Date.now(),
          updatedAt: Date.now(),
          // keep for unit creation
          __targetValue: target == null ? undefined : String(target),
        };
      });
    // Save entries (data-only)
    await db.entries.bulkAdd(
      toSave.map(({ __targetValue, ...e }) => ({ projectId, ...e })) as any
    );
    // Save translation units (1:1 per entry + lang)
    await db.translationUnits.bulkAdd(
      toSave.map((e) => ({
        projectId,
        key: e.key,
        sourceLang: sourceLang!,
        targetLang: lang!,
        target: e.__targetValue,
        statusId: "",
        note: undefined,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      })) as any
    );
    onOpenChange(false);
  }

  const selectedMetaFields = watch("metaFields") || [];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[95vw] max-w-6xl max-h-[90vh] overflow-auto">
        <DialogHeader>
          <DialogTitle>JSON 불러오기</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4">
          {!parsed ? (
            <div className="space-y-2">
              <Label>JSON 붙여넣기</Label>
              <Textarea value={jsonText} onChange={(e: any) => setJsonText(e.target.value)} placeholder="여기에 JSON 텍스트를 붙여넣고 파싱을 누르세요" rows={12} />
              <div className="flex justify-end">
                <Button onClick={handleParse}>파싱</Button>
              </div>
              {error ? <p className="text-sm text-red-500">{error}</p> : null}
            </div>
          ) : (
            <div className="space-y-4">
              <div className="grid gap-3 grid-cols-1 sm:grid-cols-2 md:grid-cols-4">
                <div className="space-y-1">
                  <Label>대상 언어</Label>
                  <Controller
                    control={control}
                    name="lang"
                    render={({ field }) => (
                      <Select value={field.value} onValueChange={field.onChange}>
                        <SelectTrigger>
                          <SelectValue placeholder="언어" />
                        </SelectTrigger>
                        <SelectContent>
                          {targetLangs.map((c) => (
                            <SelectItem key={c} value={c}>
                              {LANGUAGE_CODE_MAP[c]} ({c})
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  />
                </div>
                <div className="space-y-1">
                  <Label>Key</Label>
                  <Controller
                    control={control}
                    name="keyField"
                    render={({ field }) => (
                      <Select value={field.value} onValueChange={field.onChange}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="index">index (배열 인덱스)</SelectItem>
                          {parsed?.objectKeys ? (
                            <SelectItem value="objectKey">object key (객체 키)</SelectItem>
                          ) : null}
                          {fields.map((f) => (
                            <SelectItem key={f} value={f}>
                              {f}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  />
                </div>
                <div className="space-y-1">
                  <Label>원문 (필수)</Label>
                  <Controller
                    control={control}
                    name="sourceField"
                    render={({ field }) => (
                      <Select value={field.value} onValueChange={field.onChange}>
                        <SelectTrigger>
                          <SelectValue placeholder="필드 선택" />
                        </SelectTrigger>
                        <SelectContent>
                          {fields.map((f) => (
                            <SelectItem key={f} value={f}>
                              {f}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  />
                </div>
                <div className="space-y-1">
                  <Label>번역 (선택)</Label>
                  <Controller
                    control={control}
                    name="targetField"
                    render={({ field }) => (
                      <Select value={field.value} onValueChange={field.onChange}>
                        <SelectTrigger>
                          <SelectValue placeholder="선택 안함" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value={NONE}>선택 안함</SelectItem>
                          {fields.map((f) => (
                            <SelectItem key={f} value={f}>
                              {f}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>메타 필드 (복수 선택)</Label>
                <div className="flex flex-wrap gap-2">
                  {fields.map((f) => (
                    <label key={f} className="inline-flex items-center gap-2 rounded-md border px-2 py-1 text-sm">
                      <Controller
                        control={control}
                        name="metaFields"
                        render={({ field }) => {
                          const selected: string[] = field.value || [];
                          const isChecked = selected.includes(f);
                          return (
                            <Checkbox
                              checked={isChecked}
                              onCheckedChange={(v) => {
                                const next = v ? Array.from(new Set([...selected, f])) : selected.filter((x) => x !== f);
                                field.onChange(next);
                              }}
                            />
                          );
                        }}
                      />
                      {f}
                    </label>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label>
                    미리보기
                    {parsed ? (
                      <span className="text-muted-foreground ml-2 text-xs">(총 {parsed.length}개 중 {Math.min(parsed.length, 20)}개)</span>
                    ) : null}
                  </Label>
                  <div className="text-xs text-muted-foreground">모든 항목이 가져와집니다</div>
                </div>
                <ScrollArea className="h-64 w-full rounded-md border">
                  <table className="w-max min-w-full text-sm">
                    <thead>
                      <tr className="bg-muted/50 text-left">
                        <th className="px-2 py-1">key</th>
                        <th className="px-2 py-1">원문</th>
                        <th className="px-2 py-1">번역</th>
                        {selectedMetaFields.map((mf: string) => (
                          <th key={`h-${mf}`} className="px-2 py-1">meta:{mf}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {parsed?.items.slice(0, 20).map((item, i) => {
                        const { keyField, sourceField, targetField, metaFields } = getValues();
                        let kVal: unknown;
                        if (keyField === "index") kVal = i;
                        else if (keyField === "objectKey") kVal = parsed.objectKeys?.[i];
                        else kVal = (item as any)[keyField];
                        const k = kVal == null ? i : kVal;
                        const s = (item as any)[sourceField];
                        const t = targetField && targetField !== NONE ? (item as any)[targetField] : undefined;
                        return (
                          <tr key={i} className="border-t">
                            <td className="px-2 py-1 font-mono text-xs max-w-[220px] truncate">{String(k ?? "")}</td>
                            <td className="px-2 py-1 max-w-[420px] truncate">{String(s ?? "")}</td>
                            <td className="px-2 py-1 max-w-[420px] truncate">{t == null ? "" : String(t)}</td>
                            {metaFields?.map((mf) => (
                              <td key={`c-${mf}`} className="px-2 py-1 max-w-[320px] truncate">{String((item as any)[mf] ?? "")}</td>
                            ))}
                          </tr>
                        );
                      })}
                      {parsed && parsed.items.length > 20 ? (
                        <tr className="border-t">
                          <td className="px-2 py-1 text-center" colSpan={3 + (getValues("metaFields")?.length ?? 0)}>…</td>
                        </tr>
                      ) : null}
                    </tbody>
                  </table>
                </ScrollArea>
              </div>

              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => onOpenChange(false)}>
                  취소
                </Button>
                <Button onClick={handleImport}>가져오기</Button>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default JsonImportDialog;
