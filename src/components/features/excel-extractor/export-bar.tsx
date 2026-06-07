"use client"

import { useEffect, useRef, useState } from "react"
import { Download, Copy, Printer, Check } from "lucide-react"
import { Button, cn } from "myui"
import { Badge } from "@/components/ui/badge"
import { myui } from "@/components/myui/myui-styles"
import { toast } from "sonner"
import { copyTableToClipboard } from "@/lib/copyTable"
import { downloadStyledExcel } from "@/lib/excelExportStyled"
import type { ColumnColorRules } from "@/components/features/excel-extractor/color-rule-modal"
import {
  mixHexWithWhite,
  resolveCellColor,
} from "@/components/features/excel-extractor/color-rule-modal"

interface ExportBarProps {
  headers: string[]
  allRows: Record<string, unknown>[]
  selectedRows: Record<string, unknown>[]
  fileName: string
  colorRules?: ColumnColorRules
  /** ملتصق أسفل الجدول داخل نفس الإطار */
  attached?: boolean
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
}

function printCellStyle(colorRules: ColumnColorRules, header: string, value: unknown): string {
  const color = resolveCellColor(colorRules, header, value)
  const base = "text-align:right;unicode-bidi:plaintext;direction:rtl;"
  if (!color) return base
  return `${base}background-color:${mixHexWithWhite(color, 0.2)};`
}

export function ExportBar({
  headers,
  allRows,
  selectedRows,
  fileName,
  colorRules = {},
  attached = false,
}: ExportBarProps) {
  const [copied, setCopied] = useState(false)
  const copiedTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const exportTarget = selectedRows.length > 0 ? selectedRows : allRows
  const label = selectedRows.length > 0
    ? `تصدير المحدد (${selectedRows.length})`
    : `تصدير الكل (${allRows.length})`
  const hasData = headers.length > 0 && exportTarget.length > 0

  function buildPrintHtml() {
    const thCells = headers
      .map((h) => `<th>${escapeHtml(h)}</th>`)
      .join("")
    const bodyRows = exportTarget
      .map((row) => {
        const tds = headers
          .map((h) => {
            const val = String(row[h] ?? "")
            return `<td style="${printCellStyle(colorRules, h, row[h])}">${escapeHtml(val)}</td>`
          })
          .join("")
        return `<tr>${tds}</tr>`
      })
      .join("")

    return `<!DOCTYPE html>
<html dir="rtl" lang="ar">
<head>
  <meta charset="UTF-8">
  <title>طباعة — ${escapeHtml(fileName)}</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: 'Segoe UI', 'Cairo', Arial, sans-serif;
      direction: rtl;
      unicode-bidi: bidi-override;
      padding: 24px;
      color: #111;
      background: #fff;
    }
    h2 { font-size: 16px; font-weight: 700; margin-bottom: 4px; text-align: right; }
    p.meta { font-size: 11px; color: #666; margin-bottom: 16px; text-align: right; }
    table {
      border-collapse: collapse;
      width: 100%;
      font-size: 12px;
      direction: rtl;
      table-layout: auto;
    }
    thead tr { background: #1e40af; color: #fff; }
    th {
      padding: 8px 12px;
      text-align: right;
      font-weight: 600;
      border: 1px solid #1e3a8a;
      direction: rtl;
    }
    td {
      padding: 7px 12px;
      border: 1px solid #d1d5db;
    }
    tbody tr:nth-child(even) td:not([style*="background-color"]) {
      background: #f8fafc;
    }
    @media print {
      body { padding: 10px; }
      @page { margin: 1cm; size: A4 landscape; }
      * {
        -webkit-print-color-adjust: exact !important;
        print-color-adjust: exact !important;
        color-adjust: exact !important;
      }
    }
  </style>
</head>
<body>
  <h2>${escapeHtml(fileName)}</h2>
  <p class="meta">
    ${exportTarget.length} صف · ${headers.length} عمود
    ${selectedRows.length > 0 ? "· صفوف محددة فقط" : ""}
  </p>
  <table>
    <thead><tr>${thCells}</tr></thead>
    <tbody>${bodyRows}</tbody>
  </table>
  <script>window.onload = () => { window.print(); window.close(); }<\/script>
</body>
</html>`
  }

  function exportExcel() {
    if (!hasData) {
      toast.error("لا توجد بيانات للتصدير")
      return
    }
    try {
      downloadStyledExcel(headers, exportTarget, fileName, colorRules)
      toast.success("تم تصدير الملف بنجاح (عربي RTL + الألوان)")
    } catch {
      toast.error("تعذّر تصدير الملف")
    }
  }

  async function copyToClipboard() {
    if (!hasData) {
      toast.error("لا توجد بيانات للنسخ")
      return
    }
    try {
      await copyTableToClipboard(headers, exportTarget)
      setCopied(true)
      if (copiedTimerRef.current) clearTimeout(copiedTimerRef.current)
      copiedTimerRef.current = setTimeout(() => setCopied(false), 1800)
      toast.success(`تم نسخ ${exportTarget.length} صف — الصقها في Excel أو Word`)
    } catch {
      try {
        const tsv = [
          headers.join("\t"),
          ...exportTarget.map((r) => headers.map((h) => String(r[h] ?? "")).join("\t")),
        ].join("\n")
        const ta = document.createElement("textarea")
        ta.value = tsv
        ta.style.position = "fixed"
        ta.style.top = "-9999px"
        ta.style.direction = "rtl"
        document.body.appendChild(ta)
        ta.focus()
        ta.select()
        const ok = document.execCommand("copy")
        document.body.removeChild(ta)
        if (!ok) throw new Error("execCommand copy failed")
        toast.success(`تم نسخ ${exportTarget.length} صف`)
      } catch {
        toast.error("تعذّر النسخ على هذا المتصفح")
      }
    }
  }

  useEffect(() => {
    return () => {
      if (copiedTimerRef.current) clearTimeout(copiedTimerRef.current)
    }
  }, [])

  function printTable() {
    if (!hasData) {
      toast.error("لا توجد بيانات للطباعة")
      return
    }

    const win = window.open("", "_blank", "width=1000,height=700")
    if (win) {
      win.document.write(buildPrintHtml())
      win.document.close()
      return
    }

    const iframe = document.createElement("iframe")
    iframe.style.position = "fixed"
    iframe.style.right = "0"
    iframe.style.bottom = "0"
    iframe.style.width = "0"
    iframe.style.height = "0"
    iframe.style.border = "0"
    document.body.appendChild(iframe)
    const doc = iframe.contentWindow?.document
    if (!doc || !iframe.contentWindow) {
      toast.error("تعذّر فتح الطباعة")
      document.body.removeChild(iframe)
      return
    }
    doc.open()
    doc.write(buildPrintHtml())
    doc.close()
    setTimeout(() => {
      iframe.contentWindow?.focus()
      iframe.contentWindow?.print()
      setTimeout(() => document.body.removeChild(iframe), 1000)
    }, 250)
  }

  return (
    <div
      className={cn(
        "flex flex-wrap items-stretch sm:items-center gap-2 sm:gap-3 p-3 sm:px-4 sm:py-3 w-full min-w-0",
        attached
          ? "rounded-none border-0 border-t border-cyan-200/60 dark:border-cyan-800/40 bg-cyan-50/50 dark:bg-cyan-950/20"
          : "rounded-xl border border-cyan-200/60 dark:border-cyan-800/40 bg-cyan-50/50 dark:bg-cyan-950/20",
      )}
    >
      {selectedRows.length > 0 && (
        <Badge className={cn("text-xs gap-1 w-full sm:w-auto justify-center", myui.badge)}>
          {selectedRows.length} صف محدد
        </Badge>
      )}
      <Button onClick={exportExcel} className="gap-2 w-full sm:w-auto bg-cyan-600 hover:bg-cyan-700 text-white">
        <Download className="w-4 h-4" />
        {label}
      </Button>
      <Button
        variant="outline"
        onClick={copyToClipboard}
        className={cn(
          "gap-2 border-cyan-300/60 dark:border-cyan-700 hover:bg-cyan-50 dark:hover:bg-cyan-950/30 hover:text-cyan-700 flex-1 sm:flex-none transition-all",
          copied && "bg-emerald-50 border-emerald-300 text-emerald-700 dark:bg-emerald-950/30",
        )}
        disabled={!hasData}
      >
        {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
        {copied ? "تم النسخ" : "نسخ"}
      </Button>
      <Button
        variant="outline"
        onClick={printTable}
        className="gap-2 border-cyan-300/60 dark:border-cyan-700 hover:bg-cyan-50 dark:hover:bg-cyan-950/30 hover:text-cyan-700 flex-1 sm:flex-none"
        disabled={!hasData}
      >
        <Printer className="w-4 h-4" />
        طباعة {selectedRows.length > 0 ? `(${selectedRows.length})` : `(${allRows.length})`}
      </Button>
    </div>
  )
}
