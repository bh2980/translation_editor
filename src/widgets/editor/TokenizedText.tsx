"use client";

import * as React from "react";
import { cn } from "@/shared/lib/ui/cn";
import {
  parseRichText,
  type PlaceholderNode,
  type RichTextNode,
  type TagNode,
  type TokenInstance,
} from "./lib/tags";
import { type TokenColor } from "./lib/token-colors";

type TokenizedTextProps = {
  text?: string;
  tokens?: RichTextNode[];
  tokenStates?: Record<string, TokenRenderState>;
  onTokenToggle?: (state: TokenRenderState) => void;
  className?: string;
};

export type TokenRenderState = {
  token: TokenInstance;
  applied: boolean;
  color: TokenColor;
};

type SingleTagVariant = "selfClosing" | "openOnly" | "closeOnly";

export function TokenizedText({
  text = "",
  tokens,
  tokenStates,
  onTokenToggle,
  className,
}: TokenizedTextProps) {
  const parsed = React.useMemo(
    () => (tokens ? tokens : parseRichText(text)),
    [tokens, text]
  );

  const renderNode = React.useCallback(
    (node: RichTextNode): React.ReactNode => {
      if (node.type === "text") {
        return (
          <span key={node.id} className="whitespace-pre-wrap">
            {node.value}
          </span>
        );
      }

      if (node.type === "placeholder") {
        return (
          <PlaceholderToken
            key={node.id}
            node={node}
            state={tokenStates?.[node.id]}
            onToggle={onTokenToggle}
          />
        );
      }

      if (node.type === "tag") {
        return (
          <TagToken
            key={node.id}
            node={node}
            state={tokenStates?.[node.id]}
            onToggle={onTokenToggle}
            renderNode={renderNode}
          />
        );
      }

      return null;
    },
    [onTokenToggle, tokenStates]
  );

  return (
    <div
      className={cn(
        "whitespace-pre-wrap leading-relaxed text-sm text-foreground",
        className
      )}
    >
      {parsed.map((node) => renderNode(node))}
    </div>
  );
}

type PlaceholderTokenProps = {
  node: PlaceholderNode;
  state?: TokenRenderState;
  onToggle?: (state: TokenRenderState) => void;
};

function PlaceholderToken({ node, state, onToggle }: PlaceholderTokenProps) {
  const applied = state?.applied ?? false;

  const handleToggle = (event: React.MouseEvent<HTMLSpanElement>) => {
    event.stopPropagation();
    if (state) {
      onToggle?.(state);
    }
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLSpanElement>) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      event.stopPropagation();
      if (state) {
        onToggle?.(state);
      }
    }
  };

  return (
    <span
      role="button"
      tabIndex={0}
      title={node.raw}
      aria-pressed={applied}
      data-applied={applied ? "true" : "false"}
      onClick={handleToggle}
      onKeyDown={handleKeyDown}
      className={cn(
        "inline-flex items-center gap-1 rounded border px-1 py-[1px] align-baseline text-[11px] font-medium transition focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-1",
        state ? "cursor-pointer" : "cursor-default",
        applied ? "opacity-70" : "hover:shadow-sm"
      )}
      style={state ? getChipStyle(state) : undefined}
    >
      <span className="font-mono">{node.raw}</span>
    </span>
  );
}

type TagTokenProps = {
  node: TagNode;
  state?: TokenRenderState;
  onToggle?: (state: TokenRenderState) => void;
  renderNode: (node: RichTextNode) => React.ReactNode;
};

function TagToken({ node, state, onToggle, renderNode }: TagTokenProps) {
  const variant =
    node.variant ?? (node.selfClosing ? "selfClosing" : node.rawClose ? "paired" : "openOnly");
  const applied = state?.applied ?? false;

  const handleToggle = (event: React.MouseEvent<HTMLSpanElement>) => {
    event.stopPropagation();
    if (state) {
      onToggle?.(state);
    }
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLSpanElement>) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      event.stopPropagation();
      if (state) {
        onToggle?.(state);
      }
    }
  };

  const shouldRenderAsChip =
    variant === "selfClosing" ||
    variant === "closeOnly" ||
    (variant === "openOnly" && node.children.length === 0);

  if (shouldRenderAsChip) {
    const chipVariant: SingleTagVariant =
      variant === "closeOnly"
        ? "closeOnly"
        : variant === "openOnly"
        ? "openOnly"
        : "selfClosing";
    return (
      <SingleTagToken
        node={node}
        variant={chipVariant}
        state={state}
        onToggle={onToggle}
      />
    );
  }

  const description =
    variant === "paired"
      ? `${node.rawOpen} … ${node.rawClose ?? `</${node.name}>`}`
      : node.rawOpen;

  const isOpenOnly = variant === "openOnly";
  const baseHighlightStyle = state ? getHighlightStyle(state) : DEFAULT_HIGHLIGHT_STYLE;
  const highlightStyle = isOpenOnly
    ? {
        ...baseHighlightStyle,
        borderColor: state ? state.color.accent : "rgba(148, 163, 184, 0.5)",
      }
    : baseHighlightStyle;

  return (
    <span
      role="button"
      tabIndex={0}
      title={description}
      aria-pressed={applied}
      data-applied={applied ? "true" : "false"}
      onClick={handleToggle}
      onKeyDown={handleKeyDown}
      className={cn(
        "inline-flex flex-wrap items-baseline gap-x-1 gap-y-0.5 align-baseline transition focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-1",
        state ? "cursor-pointer" : "cursor-default",
        applied ? "opacity-70" : "hover:brightness-110"
      )}
      style={state ? { color: state.color.text } : undefined}
    >
      <span
        className="inline-flex items-center rounded px-[0.35rem] text-[10px] font-semibold uppercase tracking-tight"
        style={state ? getLabelStyle(state) : undefined}
      >
        {node.name}
      </span>
      {node.attributes ? (
        <span
          className="text-[10px]"
          style={state ? { color: state.color.mutedText } : undefined}
        >
          {node.attributes}
        </span>
      ) : null}
      {isOpenOnly ? (
        <span
          className="text-[9px] font-semibold uppercase tracking-wide"
          style={state ? { color: state.color.accent } : undefined}
        >
          OPEN
        </span>
      ) : null}
      {node.children.length > 0 ? (
        <span
          className={cn(
            "inline whitespace-pre-wrap rounded-sm px-1 align-baseline text-sm leading-relaxed",
            isOpenOnly ? "border-b border-dashed" : undefined
          )}
          style={highlightStyle}
        >
          {node.children.map((child) => renderNode(child))}
        </span>
      ) : null}
    </span>
  );
}

type SingleTagTokenProps = {
  node: TagNode;
  variant: SingleTagVariant;
  state?: TokenRenderState;
  onToggle?: (state: TokenRenderState) => void;
};

function SingleTagToken({ node, variant, state, onToggle }: SingleTagTokenProps) {
  const applied = state?.applied ?? false;
  const rawValue = variant === "closeOnly" ? node.rawClose ?? node.rawOpen : node.rawOpen;

  const handleToggle = (event: React.MouseEvent<HTMLSpanElement>) => {
    event.stopPropagation();
    if (state) {
      onToggle?.(state);
    }
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLSpanElement>) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      event.stopPropagation();
      if (state) {
        onToggle?.(state);
      }
    }
  };

  const metaLabel =
    variant === "openOnly" ? "OPEN" : variant === "closeOnly" ? "CLOSE" : undefined;

  return (
    <span
      role="button"
      tabIndex={0}
      title={rawValue}
      aria-pressed={applied}
      data-applied={applied ? "true" : "false"}
      onClick={handleToggle}
      onKeyDown={handleKeyDown}
      className={cn(
        "inline-flex items-center gap-1 rounded border px-1 py-[1px] align-baseline text-[11px] font-medium transition focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-1",
        state ? "cursor-pointer" : "cursor-default",
        applied ? "opacity-70" : "hover:shadow-sm",
        variant === "openOnly" || variant === "closeOnly" ? "border-dashed" : "border-solid"
      )}
      style={state ? getChipStyle(state) : undefined}
    >
      <span className="font-mono">{rawValue}</span>
      {metaLabel ? (
        <span
          className="text-[9px] font-semibold uppercase tracking-wide"
          style={state ? { color: state.color.accent } : undefined}
        >
          {metaLabel}
        </span>
      ) : null}
    </span>
  );
}

const DEFAULT_HIGHLIGHT_STYLE: React.CSSProperties = {
  backgroundColor: "rgba(148, 163, 184, 0.18)",
  color: "inherit",
  borderRadius: "0.35rem",
  paddingInline: "0.25rem",
  paddingBlock: "0.05rem",
  boxShadow: "inset 0 -1px 0 0 rgba(148, 163, 184, 0.35)",
};

function getChipStyle(state: TokenRenderState) {
  return {
    backgroundColor: state.color.background,
    borderColor: state.color.border,
    color: state.color.text,
    boxShadow: state.applied
      ? `inset 0 0 0 1px ${state.color.accent}`
      : undefined,
  } satisfies React.CSSProperties;
}

function getLabelStyle(state: TokenRenderState) {
  return {
    backgroundColor: state.color.accent,
    color: state.color.accentText,
  } satisfies React.CSSProperties;
}

function getHighlightStyle(state: TokenRenderState) {
  return {
    backgroundColor: withAlpha(state.color.accent, 0.18),
    color: state.color.text,
    borderRadius: "0.35rem",
    paddingInline: "0.25rem",
    paddingBlock: "0.05rem",
    boxShadow: state.applied
      ? `inset 0 -1px 0 0 ${state.color.accent}`
      : `inset 0 -1px 0 0 ${withAlpha(state.color.accent, 0.4)}`,
  } satisfies React.CSSProperties;
}

function withAlpha(hex: string, alpha: number) {
  const normalized = hex.replace("#", "");
  if (normalized.length !== 6) {
    return hex;
  }

  const r = parseInt(normalized.slice(0, 2), 16);
  const g = parseInt(normalized.slice(2, 4), 16);
  const b = parseInt(normalized.slice(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

