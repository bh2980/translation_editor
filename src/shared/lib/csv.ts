"use client"

import Papa from "papaparse"

export function downloadText(filename: string, text: string, mime = "text/plain;charset=utf-8") {
  const blob = new Blob([text], { type: mime })
  const url = URL.createObjectURL(blob)
  const a = document.createElement("a")
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  a.remove()
  URL.revokeObjectURL(url)
}

export function exportObjectsToCsv(
  filename: string,
  rows: Record<string, any>[],
  delimiter: string,
  columns?: { key: string; header: string }[],
) {
  let data = rows
  let fields: string[] | undefined = undefined
  if (columns && columns.length > 0) {
    fields = columns.map((c) => c.key)
    data = rows.map((r) => {
      const o: Record<string, any> = {}
      for (const c of columns) o[c.key] = r[c.key]
      return o
    })
  }
  const csv = Papa.unparse(data, {
    delimiter,
    columns: fields,
  } as any)
  downloadText(filename, csv, "text/csv;charset=utf-8")
}
