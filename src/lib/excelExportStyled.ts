import XLSX from "xlsx-js-style"
import type { ColumnColorRules } from "@/components/features/excel-extractor/color-rule-modal"
import { resolveCellColor } from "@/components/features/excel-extractor/color-rule-modal"

const RTL_ALIGNMENT = {
  horizontal: "right" as const,
  vertical: "center" as const,
  wrapText: true,
  readingOrder: 2,
}

function toExcelRgb(hex: string): string {
  const h = hex.replace("#", "").slice(0, 6)
  return /^[0-9A-Fa-f]{6}$/.test(h) ? h.toUpperCase() : "FFFFFF"
}

function solidFill(hex: string) {
  return {
    patternType: "solid" as const,
    fgColor: { rgb: toExcelRgb(hex) },
  }
}

export function setWorkbookRtl(wb: XLSX.WorkBook) {
  if (!wb.Workbook) wb.Workbook = {}
  if (!wb.Workbook.Views) wb.Workbook.Views = []
  if (!wb.Workbook.Views[0]) wb.Workbook.Views[0] = {}
  wb.Workbook.Views[0].RTL = true
}

export function buildStyledSheet(
  headers: string[],
  rows: Record<string, unknown>[],
  colorRules: ColumnColorRules = {},
) {
  const data = rows.map((row) => {
    const r: Record<string, unknown> = {}
    headers.forEach((h) => { r[h] = row[h] ?? "" })
    return r
  })
  const ws = XLSX.utils.json_to_sheet(data, { header: headers })
  const ref = ws["!ref"]
  if (!ref) return ws

  const range = XLSX.utils.decode_range(ref)

  for (let C = range.s.c; C <= range.e.c; C++) {
    const header = headers[C - range.s.c]
    if (!header) continue
    const addr = XLSX.utils.encode_cell({ r: 0, c: C })
    if (!ws[addr]) ws[addr] = { t: "s", v: header }
    ws[addr].s = {
      fill: solidFill("FFFFFF"),
      font: { bold: true, color: { rgb: "0F172A" }, name: "Arial", sz: 11 },
      alignment: RTL_ALIGNMENT,
      border: {
        bottom: { style: "thin", color: { rgb: "E2E8F0" } },
      },
    }
  }

  for (let R = 1; R <= range.e.r; R++) {
    const row = rows[R - 1]
    if (!row) continue
    for (let C = range.s.c; C <= range.e.c; C++) {
      const header = headers[C - range.s.c]
      if (!header) continue
      const addr = XLSX.utils.encode_cell({ r: R, c: C })
      if (!ws[addr]) continue
      const bg = resolveCellColor(colorRules, header, row[header])
      ws[addr].s = {
        alignment: RTL_ALIGNMENT,
        font: { name: "Arial", sz: 11, color: { rgb: "0F172A" } },
        ...(bg ? { fill: solidFill(bg) } : {}),
      }
    }
  }

  ws["!cols"] = headers.map(() => ({ wch: 20 }))
  return ws
}

export function downloadStyledExcel(
  headers: string[],
  rows: Record<string, unknown>[],
  fileName: string,
  colorRules: ColumnColorRules = {},
  sheetName = "النتائج",
) {
  const ws = buildStyledSheet(headers, rows, colorRules)
  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, ws, sheetName)
  setWorkbookRtl(wb)
  XLSX.writeFile(wb, `${fileName}_extracted.xlsx`)
}
