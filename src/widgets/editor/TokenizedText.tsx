"use client";

import * as React from "react";
import { cn } from "@/shared/lib/ui/cn";
import {
  buildTagActionFromNode,
  parseRichText,
  type PlaceholderNode,
  type RichTextNode,
  type TagAction,
  type TagNode,
} from "./lib/tags";

type TokenizedTextProps = {
  text?: string;
  tokens?: RichTextNode[];
  onTagAction?: (action: TagAction) => void;
  className?: string;
};

export function TokenizedText({
  text = "",
  tokens,
  onTagAction,
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
        return renderPlaceholder(node, onTagAction);
      }

      if (node.type === "tag") {
        return renderTag(node, onTagAction, renderNode);
      }

      return null;
    },
    [onTagAction]
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

function renderPlaceholder(
  node: PlaceholderNode,
  onTagAction?: (action: TagAction) => void
) {
  const handleClick = (event: React.MouseEvent<HTMLSpanElement>) => {
    event.stopPropagation();
    onTagAction?.(buildTagActionFromNode(node));
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLSpanElement>) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      event.stopPropagation();
      onTagAction?.(buildTagActionFromNode(node));
    }
  };

  return (
    <span
      key={node.id}
      role="button"
      tabIndex={0}
      title={node.raw}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      className="inline-flex cursor-pointer items-center rounded border border-dashed border-amber-300 bg-amber-50 px-1 py-[1px] text-xs font-medium text-amber-700 align-middle hover:bg-amber-100 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:ring-offset-1"
    >
      {node.raw}
    </span>
  );
}

function renderTag(
  node: TagNode,
  onTagAction: ((action: TagAction) => void) | undefined,
  renderNode: (node: RichTextNode) => React.ReactNode
) {
  const handleClick = (event: React.MouseEvent<HTMLSpanElement>) => {
    event.stopPropagation();
    onTagAction?.(buildTagActionFromNode(node));
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLSpanElement>) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      event.stopPropagation();
      onTagAction?.(buildTagActionFromNode(node));
    }
  };

  const description = node.selfClosing
    ? node.rawOpen
    : `${node.rawOpen} … ${node.rawClose ?? `</${node.name}>`}`;

  return (
    <span
      key={node.id}
      role="button"
      tabIndex={0}
      title={description}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      className={cn(
        "inline-flex cursor-pointer items-baseline gap-1 rounded border px-1 py-[1px] align-middle focus:outline-none focus:ring-2 focus:ring-offset-1",
        node.selfClosing
          ? "border-indigo-200 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 focus:ring-indigo-400"
          : "border-sky-300 bg-sky-50 text-sky-700 hover:bg-sky-100 focus:ring-sky-400"
      )}
    >
      <span className="rounded-sm bg-black/10 px-1 text-[10px] font-semibold uppercase tracking-tight text-current">
        {node.name}
      </span>
      {node.attributes ? (
        <span className="text-[11px] text-muted-foreground">{node.attributes}</span>
      ) : null}
      {!node.selfClosing ? (
        <span className="whitespace-pre-wrap text-sm text-foreground">
          {node.children.map((child) => renderNode(child))}
        </span>
      ) : null}
    </span>
  );
}

