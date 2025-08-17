"use client"

import * as XLSX from "xlsx"
import Papa from "papaparse"
import type { ParsedRow } from "@/types/common"

function isValidHeaderRow(cells: any[]): boolean {
  if (!cells || cells.length === 0) return false
  const strings = cells.every((v) => typeof v === "string" && String(v).trim().length > 0)
  if (!strings) return false
  const uniq = new Set(cells.map((v) => String(v).trim()))
  return uniq.size === cells.length
}

type ParseOptions = {
  delimiter?: string | "auto"
}

export async function parseSpreadsheet(
  file: File,
  opts?: ParseOptions,
): Promise<{ rows: ParsedRow[]; columns: string[] }> {
  const name = (file.name || "").toLowerCase()
  const isCSV = name.endsWith(".csv") || file.type === "text/csv"
  const delimiter = opts?.delimiter && opts.delimiter !== "auto" ? opts.delimiter : undefined

  if (isCSV) {
    const text = await file.text()
    // Parse as array of arrays
    const parsed = Papa.parse<string[]>(text, {
      delimiter, // undefined => auto-detect
      skipEmptyLines: false,
    })
    if (parsed.errors?.length) {
      // Still try to use any data parsed
      // console.warn("CSV parse errors", parsed.errors)
    }
    const aoa = parsed.data as any[][]
    if (!aoa || aoa.length === 0) return { rows: [], columns: [] }

    const firstRow = aoa[0] ?? []
    const maxCols = Math.max(...aoa.map((r) => (Array.isArray(r) ? r.length : 0)))

    let columns: string[]
    let dataRows: any[][]

    if (isValidHeaderRow(firstRow)) {
      columns = firstRow.map((h, i) => (String(h).trim().length > 0 ? String(h).trim() : `Column ${i + 1}`))
      dataRows = aoa.slice(1)
    } else {
      columns = Array.from({ length: maxCols }, (_, i) => `Column ${i + 1}`)
      dataRows = aoa
    }

    const rows: ParsedRow[] = dataRows.map((r) => {
      const obj: ParsedRow = {}
      for (let i = 0; i < columns.length; i++) {
        obj[columns[i]] = Array.isArray(r) ? (r[i] ?? "") : ""
      }
      return obj
    })

    return { rows, columns }
  }

  // XLSX/XLS path
  const buf = await file.arrayBuffer()
  const wb = XLSX.read(buf, { type: "array" })
  const sheetName = wb.SheetNames[0]
  const sheet = wb.Sheets[sheetName]
  const aoa = XLSX.utils.sheet_to_json<any[]>(sheet, { header: 1, defval: "" }) as any[][]
  if (!aoa || aoa.length === 0) {
    return { rows: [], columns: [] }
  }

  const firstRow = aoa[0] ?? []
  const maxCols = Math.max(...aoa.map((r) => (Array.isArray(r) ? r.length : 0)))

  let columns: string[]
  let dataRows: any[][]

  if (isValidHeaderRow(firstRow)) {
    columns = firstRow.map((h, i) => (String(h).trim().length > 0 ? String(h).trim() : `Column ${i + 1}`))
    dataRows = aoa.slice(1)
  } else {
    columns = Array.from({ length: maxCols }, (_, i) => `Column ${i + 1}`)
    dataRows = aoa
  }

  const rows: ParsedRow[] = dataRows.map((r) => {
    const obj: ParsedRow = {}
    for (let i = 0; i < columns.length; i++) {
      obj[columns[i]] = Array.isArray(r) ? (r[i] ?? "") : ""
    }
    return obj
  })

  return { rows, columns }
}
