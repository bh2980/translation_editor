"use client";

import * as React from "react";
import { Button } from "@/shared/ui/button";
import { Textarea } from "@/shared/ui/textarea";
import { Wand2, Save } from "lucide-react";
import { TokenizedText } from "./TokenizedText";
import {
  findMissingTokens,
  parseRichText,
  type TagAction,
} from "./lib/tags";

type EditorContentProps = {
  entry: any;
  value: string;
  setValue: (value: string) => void;
  glossary: any[];
  project: any;
  similar?: any[];
  onSave: (entry: any) => void;
};

export function EditorContent({
  entry,
  value,
  setValue,
  glossary,
  similar = [],
  onSave,
}: EditorContentProps) {
  const tokens = React.useMemo(
    () => parseRichText(entry?.source ?? ""),
    [entry?.source]
  );
  const missingTokens = React.useMemo(
    () => findMissingTokens(tokens, value ?? ""),
    [tokens, value]
  );

  const textareaRef = React.useRef<HTMLTextAreaElement>(null);
  const selectionRef = React.useRef<{ start: number; end: number }>({
    start: value.length,
    end: value.length,
  });

  React.useEffect(() => {
    const length = entry?.target?.length ?? 0;
    selectionRef.current = { start: length, end: length };
  }, [entry?.id, entry?.target]);

  const updateSelection = React.useCallback(() => {
    const el = textareaRef.current;
    if (!el) return;
    selectionRef.current = {
      start: el.selectionStart ?? 0,
      end: el.selectionEnd ?? 0,
    };
  }, []);

  const handleTagAction = React.useCallback(
    (action: TagAction) => {
      const currentValue = value ?? "";
      const { start, end } = selectionRef.current ?? {
        start: currentValue.length,
        end: currentValue.length,
      };

      const safeStart = Math.max(0, Math.min(start, currentValue.length));
      const safeEnd = Math.max(0, Math.min(end, currentValue.length));

      let nextValue = currentValue;
      let nextSelectionStart = safeStart;
      let nextSelectionEnd = safeEnd;

      if (action.kind === "pair") {
        if (safeStart !== safeEnd) {
          const selectedText = currentValue.slice(safeStart, safeEnd);
          nextValue =
            currentValue.slice(0, safeStart) +
            action.open +
            selectedText +
            action.close +
            currentValue.slice(safeEnd);
          nextSelectionStart = safeStart + action.open.length;
          nextSelectionEnd = nextSelectionStart + selectedText.length;
        } else {
          nextValue =
            currentValue.slice(0, safeStart) +
            action.open +
            action.close +
            currentValue.slice(safeEnd);
          nextSelectionStart = safeStart + action.open.length;
          nextSelectionEnd = nextSelectionStart;
        }
      } else {
        nextValue =
          currentValue.slice(0, safeStart) +
          action.value +
          currentValue.slice(safeEnd);
        nextSelectionStart = safeStart + action.value.length;
        nextSelectionEnd = nextSelectionStart;
      }

      setValue(nextValue);

      requestAnimationFrame(() => {
        if (!textareaRef.current) return;
        textareaRef.current.focus();
        textareaRef.current.selectionStart = nextSelectionStart;
        textareaRef.current.selectionEnd = nextSelectionEnd;
        selectionRef.current = {
          start: nextSelectionStart,
          end: nextSelectionEnd,
        };
      });
    },
    [setValue, value]
  );

  const handleChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    setValue(event.target.value);
    requestAnimationFrame(updateSelection);
  };

  return (
    <div className="grid gap-4">
      <div>
        <div className="mb-1 text-xs font-medium text-muted-foreground">
          원문
        </div>
        <div className="rounded-md border p-3 text-sm">
          <TokenizedText tokens={tokens} onTagAction={handleTagAction} />
        </div>
      </div>

      <div>
        <div className="mb-1 text-xs font-medium text-muted-foreground">
          번역
        </div>
        <Textarea
          ref={textareaRef}
          value={value}
          onChange={handleChange}
          onSelect={updateSelection}
          onClick={updateSelection}
          onKeyUp={updateSelection}
          onBlur={updateSelection}
          rows={10}
        />
        {missingTokens.length > 0 && (
          <div className="mt-2 text-xs text-amber-600">
            누락된 태그/토큰: {missingTokens.join(", ")}
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
          onClick={() => onSave({ ...entry, target: value })}
        >
          <Save size={16} />
          저장
        </Button>
      </div>

      <div>
        <div className="mb-1 text-xs font-medium text-muted-foreground">
          용어집
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
                  <td colSpan={3} className="px-2 py-2 text-muted-foreground">
                    용어 없음
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div>
        <div className="mb-1 text-xs font-medium text-muted-foreground">
          비슷한 문장
        </div>
        <div className="max-h-40 overflow-auto rounded-md border">
          <table className="w-full text-xs">
            <thead className="bg-muted/50">
              <tr className="text-left">
                <th className="px-2 py-1">key</th>
                <th className="px-2 py-1">원문</th>
                <th className="px-2 py-1">번역</th>
              </tr>
            </thead>
            <tbody>
              {similar.slice(0, 20).map((s: any, index: number) => (
                <tr key={`${s.key}-${index}`} className="border-t">
                  <td className="px-2 py-1 font-mono text-[11px]">{s.key}</td>
                  <td className="px-2 py-1">{s.source}</td>
                  <td className="px-2 py-1">{s.target ?? ""}</td>
                </tr>
              ))}
              {(!similar || similar.length === 0) && (
                <tr>
                  <td colSpan={3} className="px-2 py-2 text-muted-foreground">
                    유사 문장 없음
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

