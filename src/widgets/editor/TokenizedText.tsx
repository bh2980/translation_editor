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
        "inline-flex max-w-full items-center gap-1 rounded border px-1 py-[1px] align-middle text-[11px] font-medium transition focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-1",
        state ? "cursor-pointer" : "cursor-default",
        applied ? "opacity-70" : "hover:shadow-sm"
      )}
      style={state ? getTokenStyle(state) : undefined}
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

  const description = node.selfClosing
    ? node.rawOpen
    : `${node.rawOpen} … ${node.rawClose ?? `</${node.name}>`}`;

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
        "inline-flex max-w-full flex-wrap items-baseline gap-x-1 gap-y-0.5 rounded border px-1 py-[1px] align-middle text-xs transition focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-1",
        state ? "cursor-pointer" : "cursor-default",
        applied ? "opacity-70" : "hover:shadow-sm"
      )}
      style={state ? getTokenStyle(state) : undefined}
    >
      <span
        className="rounded-sm px-[0.35rem] text-[10px] font-semibold uppercase tracking-tight"
        style={state ? getLabelStyle(state) : undefined}
      >
        {node.name}
      </span>
      {node.attributes ? (
        <span
          className="text-[11px]"
          style={state ? { color: state.color.text } : undefined}
        >
          {node.attributes}
        </span>
      ) : null}
      {!node.selfClosing && node.children.length > 0 ? (
        <span
          className="min-w-0 break-words text-sm text-foreground"
          style={state ? getContentStyle(state) : undefined}
        >
          {node.children.map((child) => renderNode(child))}
        </span>
      ) : null}
    </span>
  );
}

function getTokenStyle(state: TokenRenderState) {
  return {
    backgroundColor: state.color.background,
    borderColor: state.color.border,
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

function getContentStyle(state: TokenRenderState) {
  return {
    backgroundColor: withAlpha(state.color.accent, 0.12),
    borderRadius: "0.25rem",
    paddingInline: "0.2rem",
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

