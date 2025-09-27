import { useMemo } from "react";

const VOID_ELEMENTS = new Set([
  "area",
  "base",
  "br",
  "col",
  "embed",
  "hr",
  "img",
  "input",
  "link",
  "meta",
  "param",
  "source",
  "track",
  "wbr",
]);

type BaseNode = {
  id: string;
};

export type TextNode = BaseNode & {
  type: "text";
  value: string;
};

export type TagVariant = "paired" | "selfClosing" | "openOnly" | "closeOnly";

export type TagNode = BaseNode & {
  type: "tag";
  name: string;
  attributes?: string;
  rawOpen: string;
  rawClose?: string;
  selfClosing: boolean;
  children: RichTextNode[];
  variant: TagVariant;
};

export type PlaceholderNode = BaseNode & {
  type: "placeholder";
  raw: string;
};

type ParentNode = {
  children: RichTextNode[];
};

export type RichTextNode = TextNode | TagNode | PlaceholderNode;

export type TokenInstance = {
  id: string;
  action: TagAction;
  /**
   * Composite key representing the serialized form of the token. Used to
   * compare occurrences across source/translation strings.
   */
  key: string;
  /**
   * Zero-based index of this token among tokens sharing the same key.
   */
  index: number;
  sourceType: "tag" | "placeholder";
};

const createIdFactory = () => {
  let id = 0;
  return () => `token-${id++}`;
};

export function parseRichText(input: string): RichTextNode[] {
  const nextId = createIdFactory();
  const root: ParentNode = { children: [] };
  const stack: (ParentNode | TagNode)[] = [root];

  const addNode = (node: RichTextNode) => {
    const parent = stack[stack.length - 1];
    parent.children.push(node);
  };

  const addText = (segment: string) => {
    if (!segment) return;
    addNode({ type: "text", id: nextId(), value: segment });
  };

  let index = 0;
  while (index < input.length) {
    const char = input[index];

    if (char === "<") {
      const end = input.indexOf(">", index + 1);
      if (end === -1) {
        addText(input.slice(index));
        break;
      }

      const raw = input.slice(index, end + 1);
      const inner = raw.slice(1, -1).trim();

      if (!inner) {
        addText(raw);
        index = end + 1;
        continue;
      }

      if (inner.startsWith("!--")) {
        // Treat comments as plain text
        const commentEnd = input.indexOf("-->", index + 4);
        if (commentEnd === -1) {
          addText(input.slice(index));
          break;
        }
        addText(input.slice(index, commentEnd + 3));
        index = commentEnd + 3;
        continue;
      }

      if (inner.startsWith("/")) {
        const name = inner.slice(1).split(/\s+/)[0];
        if (!name) {
          addText(raw);
          index = end + 1;
          continue;
        }

        const top = stack[stack.length - 1];
        if (top !== root && (top as TagNode).type === "tag") {
          const tagNode = top as TagNode;
          if (tagNode.name.toLowerCase() === name.toLowerCase()) {
            tagNode.rawClose = raw;
            tagNode.variant = "paired";
            stack.pop();
            index = end + 1;
            continue;
          }
        }

        const orphanNode: TagNode = {
          type: "tag",
          id: nextId(),
          name,
          rawOpen: raw,
          rawClose: raw,
          selfClosing: false,
          children: [],
          variant: "closeOnly",
        };
        addNode(orphanNode);
        index = end + 1;
        continue;
      }

      let content = inner;
      let selfClosing = false;
      if (content.endsWith("/")) {
        selfClosing = true;
        content = content.slice(0, -1).trim();
      }

      const firstSpace = content.search(/\s/);
      const name = firstSpace === -1 ? content : content.slice(0, firstSpace);
      if (!name) {
        addText(raw);
        index = end + 1;
        continue;
      }

      const attrs =
        firstSpace === -1 ? "" : content.slice(firstSpace + 1).trim();

      if (VOID_ELEMENTS.has(name.toLowerCase())) {
        selfClosing = true;
      }

      const tagNode: TagNode = {
        type: "tag",
        id: nextId(),
        name,
        attributes: attrs || undefined,
        rawOpen: raw,
        selfClosing,
        children: [],
        variant: selfClosing ? "selfClosing" : "openOnly",
      };

      addNode(tagNode);
      if (!selfClosing) {
        stack.push(tagNode);
      }

      index = end + 1;
      continue;
    }

    if (char === "{") {
      const closeIndex = input.indexOf("}", index + 1);
      if (closeIndex === -1) {
        addText(input.slice(index));
        break;
      }

      const raw = input.slice(index, closeIndex + 1);
      addNode({ type: "placeholder", id: nextId(), raw });
      index = closeIndex + 1;
      continue;
    }

    let nextIndex = input.length;
    const nextTag = input.indexOf("<", index + 1);
    if (nextTag !== -1) {
      nextIndex = Math.min(nextIndex, nextTag);
    }
    const nextPlaceholder = input.indexOf("{", index + 1);
    if (nextPlaceholder !== -1) {
      nextIndex = Math.min(nextIndex, nextPlaceholder);
    }

    addText(input.slice(index, nextIndex));
    index = nextIndex;
  }

  return root.children;
}

export type SingleTagRole =
  | "selfClosing"
  | "placeholder"
  | "open"
  | "close";

export type TagAction =
  | {
      kind: "pair";
      open: string;
      close: string;
      label: string;
    }
  | {
      kind: "single";
      value: string;
      label: string;
      role: SingleTagRole;
    };

const TOKEN_KEY_PREFIX = {
  pair: "pair",
  single: "single",
} as const satisfies Record<TagAction["kind"], string>;

const createTokenKey = (action: TagAction) => {
  return action.kind === "pair"
    ? `${TOKEN_KEY_PREFIX.pair}:${action.open}|${action.close}`
    : `${TOKEN_KEY_PREFIX.single}:${action.value}`;
};

export function buildTagActionFromNode(
  node: TagNode | PlaceholderNode
): TagAction {
  if (node.type === "placeholder") {
    return {
      kind: "single",
      value: node.raw,
      label: node.raw,
      role: "placeholder",
    };
  }

  const label = [node.name, node.attributes].filter(Boolean).join(" ");
  switch (node.variant) {
    case "selfClosing":
      return {
        kind: "single",
        value: node.rawOpen,
        label,
        role: "selfClosing",
      };
    case "openOnly":
      return {
        kind: "single",
        value: node.rawOpen,
        label,
        role: "open",
      };
    case "closeOnly": {
      const raw = node.rawClose ?? node.rawOpen;
      return {
        kind: "single",
        value: raw,
        label,
        role: "close",
      };
    }
    case "paired":
    default: {
      const closeTag = node.rawClose ?? `</${node.name}>`;
      return {
        kind: "pair",
        open: node.rawOpen,
        close: closeTag,
        label,
      };
    }
  }
}

export function collectTokenStrings(nodes: RichTextNode[]): string[] {
  const seen = new Set<string>();
  const tokens: string[] = [];

  const visit = (node: RichTextNode) => {
    if (node.type === "tag") {
      if (node.variant !== "closeOnly") {
        if (!seen.has(node.rawOpen)) {
          tokens.push(node.rawOpen);
          seen.add(node.rawOpen);
        }
      }

      if (node.variant === "paired") {
        const closeTag = node.rawClose ?? `</${node.name}>`;
        if (!seen.has(closeTag)) {
          tokens.push(closeTag);
          seen.add(closeTag);
        }
      }

      if (node.variant === "closeOnly") {
        const raw = node.rawClose ?? node.rawOpen;
        if (!seen.has(raw)) {
          tokens.push(raw);
          seen.add(raw);
        }
      }

      node.children.forEach(visit);
      return;
    }

    if (node.type === "placeholder") {
      if (!seen.has(node.raw)) {
        tokens.push(node.raw);
        seen.add(node.raw);
      }
    }
  };

  nodes.forEach(visit);
  return tokens;
}

export function enumerateTokenInstances(
  nodes: RichTextNode[]
): TokenInstance[] {
  const instances: TokenInstance[] = [];
  const occurrences = new Map<string, number>();

  const visit = (node: RichTextNode) => {
    if (node.type === "tag") {
      const action = buildTagActionFromNode(node);
      const key = createTokenKey(action);
      const index = occurrences.get(key) ?? 0;
      occurrences.set(key, index + 1);

      instances.push({
        id: node.id,
        action,
        key,
        index,
        sourceType: "tag",
      });

      node.children.forEach(visit);
      return;
    }

    if (node.type === "placeholder") {
      const action = buildTagActionFromNode(node);
      const key = createTokenKey(action);
      const index = occurrences.get(key) ?? 0;
      occurrences.set(key, index + 1);

      instances.push({
        id: node.id,
        action,
        key,
        index,
        sourceType: "placeholder",
      });
      return;
    }
  };

  nodes.forEach(visit);
  return instances;
}

export function removeTokenInstance(
  text: string,
  target: TokenInstance
): {
  text: string;
  removed: boolean;
  selectionStart?: number;
  selectionEnd?: number;
} {
  if (!text) {
    return { text, removed: false };
  }

  const nodes = parseRichText(text);
  const occurrences = new Map<string, number>();
  let removed = false;
  let selectionStart: number | undefined;
  let selectionEnd: number | undefined;

  type VisitResult = {
    text: string;
    length: number;
  };

  const visit = (node: RichTextNode, startOffset: number): VisitResult => {
    if (node.type === "text") {
      const value = node.value;
      return { text: value, length: value.length };
    }

    if (node.type === "placeholder") {
      const action = buildTagActionFromNode(node);
      const key = createTokenKey(action);
      const index = occurrences.get(key) ?? 0;
      occurrences.set(key, index + 1);

      const raw = node.raw;
      if (!removed && key === target.key && index === target.index) {
        removed = true;
        selectionStart = startOffset;
        selectionEnd = startOffset;
        return { text: "", length: raw.length };
      }

      return { text: raw, length: raw.length };
    }

    const action = buildTagActionFromNode(node);
    const key = createTokenKey(action);
    const index = occurrences.get(key) ?? 0;
    occurrences.set(key, index + 1);

    const variant = node.variant ?? (node.selfClosing ? "selfClosing" : "openOnly");

    if (variant === "closeOnly") {
      const raw = node.rawClose ?? node.rawOpen;
      const rawLength = raw.length;
      if (!removed && key === target.key && index === target.index) {
        removed = true;
        selectionStart = startOffset;
        selectionEnd = startOffset;
        return { text: "", length: rawLength };
      }

      return { text: raw, length: rawLength };
    }

    const open = node.rawOpen;
    const openLength = open.length;

    let childText = "";
    let childLength = 0;
    for (const child of node.children) {
      const childResult = visit(
        child,
        startOffset + openLength + childLength
      );
      childText += childResult.text;
      childLength += childResult.length;
    }

    if (variant === "openOnly") {
      if (!removed && key === target.key && index === target.index) {
        removed = true;
        selectionStart = startOffset;
        selectionEnd = startOffset;
        return {
          text: childText,
          length: openLength + childLength,
        };
      }

      return {
        text: open + childText,
        length: openLength + childLength,
      };
    }

    if (variant === "selfClosing") {
      if (!removed && key === target.key && index === target.index) {
        removed = true;
        selectionStart = startOffset;
        selectionEnd = startOffset;
        return { text: "", length: openLength };
      }

      return { text: open, length: openLength };
    }

    const close = node.rawClose ?? `</${node.name}>`;
    const closeLength = close.length;

    if (!removed && key === target.key && index === target.index) {
      removed = true;
      selectionStart = startOffset;
      selectionEnd = startOffset;
      return {
        text: childText,
        length: openLength + childLength + closeLength,
      };
    }

    return {
      text: open + childText + close,
      length: openLength + childLength + closeLength,
    };
  };

  let nextText = "";
  let offset = 0;
  for (const node of nodes) {
    const result = visit(node, offset);
    nextText += result.text;
    offset += result.length;
  }

  return {
    text: nextText,
    removed,
    selectionStart,
    selectionEnd,
  };
}

export function findMissingTokens(
  nodes: RichTextNode[],
  translation: string
): string[] {
  const tokens = collectTokenStrings(nodes);
  if (!translation) return tokens;
  return tokens.filter((token) => !translation.includes(token));
}

export function useParsedRichText(text: string) {
  return useMemo(() => parseRichText(text), [text]);
}

