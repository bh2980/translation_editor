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

export type TagNode = BaseNode & {
  type: "tag";
  name: string;
  attributes?: string;
  rawOpen: string;
  rawClose?: string;
  selfClosing: boolean;
  children: RichTextNode[];
};

export type PlaceholderNode = BaseNode & {
  type: "placeholder";
  raw: string;
};

type ParentNode = {
  children: RichTextNode[];
};

export type RichTextNode = TextNode | TagNode | PlaceholderNode;

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
            stack.pop();
            index = end + 1;
            continue;
          }
        }

        addText(raw);
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
    };

export function buildTagActionFromNode(
  node: TagNode | PlaceholderNode
): TagAction {
  if (node.type === "placeholder") {
    return {
      kind: "single",
      value: node.raw,
      label: node.raw,
    };
  }

  const label = [node.name, node.attributes].filter(Boolean).join(" ");
  if (node.selfClosing) {
    return {
      kind: "single",
      value: node.rawOpen,
      label,
    };
  }

  const closeTag = node.rawClose ?? `</${node.name}>`;
  return {
    kind: "pair",
    open: node.rawOpen,
    close: closeTag,
    label,
  };
}

export function collectTokenStrings(nodes: RichTextNode[]): string[] {
  const seen = new Set<string>();
  const tokens: string[] = [];

  const visit = (node: RichTextNode) => {
    if (node.type === "tag") {
      if (!seen.has(node.rawOpen)) {
        tokens.push(node.rawOpen);
        seen.add(node.rawOpen);
      }

      if (!node.selfClosing) {
        const closeTag = node.rawClose ?? `</${node.name}>`;
        if (!seen.has(closeTag)) {
          tokens.push(closeTag);
          seen.add(closeTag);
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

