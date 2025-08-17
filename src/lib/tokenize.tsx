"use client"

export type Token = { type: "token"; value: string }
export type TextPart = { type: "text"; value: string } | Token

const TOKEN_REGEX = /(\{[^}]+\}|<[^>]+>|\[[^\]]+\]|%[sdif]|%\d+\$[sdif]|\$\w+|&\w+;)/g

export function extractTokens(text: string): Token[] {
  const tokens: Token[] = []
  text.replace(TOKEN_REGEX, (m) => {
    tokens.push({ type: "token", value: m })
    return m
  })
  return tokens
}

export function tokenize(text: string): TextPart[] {
  if (!text) return []
  const parts: TextPart[] = []
  let lastIndex = 0
  for (const match of text.matchAll(TOKEN_REGEX)) {
    const idx = match.index ?? 0
    if (idx > lastIndex) {
      parts.push({ type: "text", value: text.slice(lastIndex, idx) })
    }
    parts.push({ type: "token", value: match[0] })
    lastIndex = idx + match[0].length
  }
  if (lastIndex < text.length) {
    parts.push({ type: "text", value: text.slice(lastIndex) })
  }
  return parts
}

export function findMissingTokens(source: Token[], target: Token[]): Token[] {
  const targetSet = new Map<string, number>()
  for (const t of target) targetSet.set(t.value, (targetSet.get(t.value) ?? 0) + 1)
  const missing: Token[] = []
  for (const s of source) {
    const count = targetSet.get(s.value) ?? 0
    if (count > 0) {
      targetSet.set(s.value, count - 1)
    } else {
      missing.push(s)
    }
  }
  return missing
}

export function TokenizedText({ text }: { text: string }) {
  const parts = tokenize(text)
  return (
    <span>
      {parts.map((p, i) =>
        p.type === "text" ? (
          <span key={i}>{p.value}</span>
        ) : (
          <span
            key={i}
            className="mx-0.5 rounded border border-emerald-200 bg-emerald-50 px-1 py-0.5 font-mono text-[0.8em] text-emerald-800"
          >
            {p.value}
          </span>
        ),
      )}
    </span>
  )
}
