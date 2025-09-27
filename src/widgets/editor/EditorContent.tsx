"use client";

import * as React from "react";
import { Button } from "@/shared/ui/button";
import { Textarea } from "@/shared/ui/textarea";
import { Wand2, Save } from "lucide-react";
import { TokenizedText, type TokenRenderState } from "./TokenizedText";
import {
  enumerateTokenInstances,
  parseRichText,
  removeTokenInstance,
} from "./lib/tags";
import { TOKEN_COLORS } from "./lib/token-colors";

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
  const tokenInstances = React.useMemo(
    () => enumerateTokenInstances(tokens),
    [tokens]
  );

  const sourceCounts = React.useMemo(() => {
    const map = new Map<string, number>();
    tokenInstances.forEach((instance) => {
      map.set(instance.key, (map.get(instance.key) ?? 0) + 1);
    });
    return map;
  }, [tokenInstances]);

  const tokenRenderStates = React.useMemo<TokenRenderState[]>(() => {
    if (tokenInstances.length === 0) {
      return [];
    }

    const translationNodes = parseRichText(value ?? "");
    const translationInstances = enumerateTokenInstances(translationNodes);
    const translationCounts = new Map<string, number>();

    translationInstances.forEach((instance) => {
      translationCounts.set(
        instance.key,
        (translationCounts.get(instance.key) ?? 0) + 1
      );
    });

    return tokenInstances.map((instance, index) => ({
      token: instance,
      applied:
        (translationCounts.get(instance.key) ?? 0) > instance.index,
      color: TOKEN_COLORS[index % TOKEN_COLORS.length],
    }));
  }, [tokenInstances, value]);

  const tokenStateMap = React.useMemo(() => {
    return tokenRenderStates.reduce<Record<string, TokenRenderState>>(
      (acc, state) => {
        acc[state.token.id] = state;
        return acc;
      },
      {}
    );
  }, [tokenRenderStates]);

  const tokenUsage = React.useMemo(
    () =>
      tokenRenderStates.map((state) => ({
        state,
        total: sourceCounts.get(state.token.key) ?? 1,
      })),
    [sourceCounts, tokenRenderStates]
  );

  const missingCount = React.useMemo(
    () => tokenRenderStates.filter((state) => !state.applied).length,
    [tokenRenderStates]
  );

  const formatTokenLabel = React.useCallback(
    (state: TokenRenderState, total: number) => {
      const baseLabel = state.token.action.label?.trim();
      const fallback =
        state.token.action.kind === "pair"
          ? state.token.action.open
          : state.token.action.value;
      let label: string;
      if (
        state.token.action.kind === "single" &&
        (state.token.action.role === "open" || state.token.action.role === "close")
      ) {
        label = state.token.action.value;
      } else if (baseLabel && baseLabel.length > 0) {
        label = baseLabel;
      } else {
        label = fallback;
      }
      return total > 1 ? `${label} #${state.token.index + 1}` : label;
    },
    []
  );

  const describeToken = React.useCallback((state: TokenRenderState) => {
    if (state.token.action.kind === "pair") {
      return `${state.token.action.open} … ${state.token.action.close}`;
    }
    return state.token.action.value;
  }, []);

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

  const focusTextareaAt = React.useCallback((start: number, end: number) => {
    requestAnimationFrame(() => {
      const el = textareaRef.current;
      if (!el) return;
      const length = el.value.length;
      const safeStart = Math.max(0, Math.min(start, length));
      const safeEnd = Math.max(0, Math.min(end, length));
      el.focus();
      el.selectionStart = safeStart;
      el.selectionEnd = safeEnd;
      selectionRef.current = { start: safeStart, end: safeEnd };
    });
  }, []);

  const handleTokenToggle = React.useCallback(
    (tokenState: TokenRenderState) => {
      const action = tokenState.token.action;

      if (tokenState.applied) {
        const removal = removeTokenInstance(value ?? "", tokenState.token);
        if (!removal.removed) {
          return;
        }

        setValue(removal.text);

        const fallback = selectionRef.current ?? {
          start: removal.text.length,
          end: removal.text.length,
        };
        const nextStart =
          removal.selectionStart ?? fallback.start ?? removal.text.length;
        const nextEnd = removal.selectionEnd ?? nextStart;
        focusTextareaAt(nextStart, nextEnd);
        return;
      }

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
      focusTextareaAt(nextSelectionStart, nextSelectionEnd);
    },
    [focusTextareaAt, setValue, value]
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
          <TokenizedText
            tokens={tokens}
            tokenStates={tokenStateMap}
            onTokenToggle={handleTokenToggle}
          />
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
        {tokenUsage.length > 0 ? (
          <div className="mt-2 space-y-2 text-xs">
            <div className="flex items-center justify-between">
              <span className="font-medium text-muted-foreground">
                태그 사용 현황
              </span>
              <span
                className={
                  missingCount > 0 ? "text-amber-600" : "text-emerald-600"
                }
              >
                {missingCount > 0
                  ? `미사용 ${missingCount}개`
                  : "모든 태그 사용 완료"}
              </span>
            </div>
            <div className="flex flex-wrap gap-2">
              {tokenUsage.map(({ state, total }) => {
                const label = formatTokenLabel(state, total);
                return (
                  <div
                    key={state.token.id}
                    className="flex min-w-[160px] flex-1 items-center justify-between gap-2 rounded border px-2 py-1"
                    style={{
                      borderColor: state.color.border,
                      borderStyle: state.applied ? "solid" : "dashed",
                      backgroundColor: state.applied
                        ? state.color.background
                        : "transparent",
                    }}
                  >
                    <div className="flex min-w-0 items-center gap-2">
                      <span
                        className="inline-flex h-2.5 w-2.5 flex-none rounded-full"
                        style={{ backgroundColor: state.color.accent }}
                      />
                      <span
                        className="truncate text-[11px] font-medium"
                        style={{
                          color: state.applied
                            ? state.color.text
                            : state.color.mutedText,
                        }}
                        title={describeToken(state)}
                      >
                        {label}
                      </span>
                    </div>
                    <span
                      className={`text-[11px] font-semibold ${
                        state.applied ? "text-emerald-600" : "text-amber-600"
                      }`}
                    >
                      {state.applied ? "사용됨" : "미사용"}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        ) : null}
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

