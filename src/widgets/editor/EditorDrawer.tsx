"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/shared/ui/sheet";
import { Textarea } from "@/shared/ui/textarea";
import { Button } from "@/shared/ui/button";
import { Wand2, Save } from "lucide-react";

// Dummy implementation, as original dependencies are removed
const TokenizedText = ({ text }: { text: string }) => <span>{text}</span>;
const findMissingTokens = () => [];

export function EditorDrawer({
  open,
  onOpenChange,
  entry,
  onSave,
  glossary,
}: {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  entry: any | null;
  onSave: (entry: any) => void;
  glossary: any[];
  project: any;
}) {
  const [value, setValue] = useState(entry?.target ?? "");
  useEffect(() => setValue(entry?.target ?? ""), [entry?.target]);

  const missing = useMemo(() => findMissingTokens(), [value]);

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full sm:max-w-2xl">
        <SheetHeader>
          <SheetTitle className="truncate">{entry?.key}</SheetTitle>
        </SheetHeader>

        <div className="mt-4 grid gap-4">
          <div>
            <div className="mb-1 text-xs font-medium text-muted-foreground">
              원문
            </div>
            <div className="rounded-md border p-3 text-sm">
              <TokenizedText text={entry?.source ?? ""} />
            </div>
          </div>

          <div>
            <div className="mb-1 text-xs font-medium text-muted-foreground">
              번역
            </div>
            <Textarea
              value={value}
              onChange={(e) => setValue(e.target.value)}
              rows={10}
            />
            {missing.length > 0 && (
              <div className="mt-2 text-xs text-amber-600">
                누락된 토큰: {missing.join(", ")}
              </div>
            )}
          </div>

          <div className="flex items-center gap-2">
            <Button className="gap-2" onClick={() => alert("AI 번역 (더미)")}>
              <Wand2 size={16} />
              AI 번역
            </Button>
            <Button
              variant="secondary"
              className="gap-2"
              onClick={() => entry && onSave({ ...entry, target: value })}
            >
              <Save size={16} />
              저장
            </Button>
          </div>

          <div>
            <div className="mb-1 text-xs font-medium text-muted-foreground">
              용어집 미리보기
            </div>
            <div className="max-h-40 overflow-auto rounded-md border">
              <table className="w-full text-xs">
                <thead className="bg-muted/50">
                  <tr className="text-left">
                    <th className="px-2 py-1">원문</th>
                    <th className="px-2 py-1">번역</th>
                    <th className="px-2 py-1">메모</th>
                  </tr>
                </thead>
                <tbody>
                  {glossary.slice(0, 20).map((g: any) => (
                    <tr key={g.id} className="border-t">
                      <td className="px-2 py-1">{g.source}</td>
                      <td className="px-2 py-1">{g.target}</td>
                      <td className="px-2 py-1">{g.notes}</td>
                    </tr>
                  ))}
                  {glossary.length === 0 && (
                    <tr>
                      <td
                        colSpan={3}
                        className="px-2 py-2 text-muted-foreground"
                      >
                        용어 없음
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
