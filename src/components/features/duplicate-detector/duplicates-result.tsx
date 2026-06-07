"use client"

import { useEffect, useRef, useState } from "react"
import { Copy, ChevronDown, ChevronUp, Check } from "lucide-react"
import { Button, cn } from "myui"
import { myui } from "@/components/myui/myui-styles"
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table"
import { DuplicateResult } from "@/lib/detectDuplicates"
import { copyTableToClipboard } from "@/lib/copyTable"
import { toast } from "sonner"

interface DuplicatesResultProps {
  results: DuplicateResult[]
  totalRows: number
  allRows?: Record<string, unknown>[]
  headers?: string[]
  scannedColumn?: string
}

function StatCard({
  label,
  value,
  tone = "neutral",
}: {
  label: string
  value: number
  tone?: "neutral" | "warning" | "success"
}) {
  const valueClass =
    tone === "warning"
      ? "text-amber-500 dark:text-amber-400"
      : tone === "success"
        ? "text-cyan-500 dark:text-cyan-400"
        : "text-slate-100 dark:text-white"
  const borderClass =
    tone === "warning"
      ? "border-amber-500/30 bg-amber-500/10 dark:bg-amber-950/30"
      : tone === "success"
        ? "border-cyan-500/30 bg-cyan-500/10 dark:bg-cyan-950/30"
        : "border-slate-200/20 bg-slate-800/40 dark:bg-slate-800/60"

  return (
    <div className={cn("rounded-2xl border p-5 text-center flex flex-col items-center gap-2", borderClass)}>
      <p className={cn("text-4xl font-extrabold tabular-nums leading-none", valueClass)}>
        {value.toLocaleString()}
      </p>
      <p className="text-xs font-medium text-muted-foreground">{label}</p>
    </div>
  )
}

export function DuplicatesResult({
  results,
  totalRows,
  allRows,
  headers,
  scannedColumn,
}: DuplicatesResultProps) {
  const [expanded, setExpanded] = useState<Set<string>>(new Set())
  const [copied, setCopied] = useState(false)
  const copiedTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const duplicateExtra = results.reduce((acc, r) => acc + r.count - 1, 0)
  const uniqueCount = Math.max(0, totalRows - duplicateExtra)

  function toggleExpand(value: string) {
    setExpanded((prev) => {
      const next = new Set(prev)
      if (next.has(value)) next.delete(value)
      else next.add(value)
      return next
    })
  }

  async function copyDuplicates() {
    if (allRows && headers && results.length > 0) {
      const dupRows = results.flatMap((r) =>
        r.indices.map((idx) => allRows[idx]).filter(Boolean),
      )
      try {
        await copyTableToClipboard(headers, dupRows)
        setCopied(true)
        if (copiedTimerRef.current) clearTimeout(copiedTimerRef.current)
        copiedTimerRef.current = setTimeout(() => setCopied(false), 1800)
        toast.success(`تم نسخ ${dupRows.length} صف مكرر`)
      } catch {
        toast.error("تعذّر النسخ")
      }
    } else {
      const text = results.map((r) => `${r.value} (${r.count} مرات)`).join("\n")
      await navigator.clipboard.writeText(text)
      setCopied(true)
      if (copiedTimerRef.current) clearTimeout(copiedTimerRef.current)
      copiedTimerRef.current = setTimeout(() => setCopied(false), 1800)
      toast.success("تم النسخ")
    }
  }

  useEffect(() => {
    return () => {
      if (copiedTimerRef.current) clearTimeout(copiedTimerRef.current)
    }
  }, [])

  return (
    <div className="space-y-4 sm:space-y-5">
      <div className="grid grid-cols-3 gap-3">
        <StatCard label="إجمالي القيم" value={totalRows} tone="neutral" />
        <StatCard
          label="قيم مكررة"
          value={results.length}
          tone={results.length > 0 ? "warning" : "success"}
        />
        <StatCard label="قيم فريدة" value={uniqueCount} tone="success" />
      </div>

      {results.length === 0 ? (
        <div className="rounded-2xl border border-cyan-500/30 bg-cyan-500/5 dark:bg-cyan-950/20 py-12 text-center flex flex-col items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-cyan-500/15 flex items-center justify-center">
            <Check className="w-6 h-6 text-cyan-500" />
          </div>
          <div>
            <p className="text-cyan-600 dark:text-cyan-300 font-semibold text-base">لا توجد قيم مكررة</p>
            <p className="text-xs text-muted-foreground mt-1">جميع القيم فريدة</p>
          </div>
        </div>
      ) : (
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
          <div className={cn(myui.cardHeader, "border-b border-slate-100 dark:border-slate-800")}>
            <p className={cn(myui.sectionTitle, "text-sm")}>
              القيم المكررة
              {scannedColumn && (
                <span className="text-muted-foreground font-normal text-xs ms-1">
                  — عمود: {scannedColumn}
                </span>
              )}
            </p>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={copyDuplicates}
              className={cn(
                "h-9 rounded-xl gap-1.5 text-xs",
                copied
                  ? "text-cyan-700 bg-cyan-50 dark:text-cyan-300 dark:bg-cyan-950/40"
                  : "text-muted-foreground hover:text-cyan-700 dark:hover:text-cyan-300",
              )}
            >
              {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              {copied ? "تم النسخ" : "نسخ الكل"}
            </Button>
          </div>

          <div className="p-2 sm:p-3 space-y-2 max-h-[min(52dvh,520px)] overflow-y-auto custom-scrollbar">
            {(() => {
              const sorted = [...results].sort((a, b) =>
                a.value.localeCompare(b.value, "ar", { sensitivity: "base" }),
              )
              const groups: Record<string, DuplicateResult[]> = {}
              for (const r of sorted) {
                const letter = r.value.trim().charAt(0) || "#"
                if (!groups[letter]) groups[letter] = []
                groups[letter].push(r)
              }
              const groupEntries = Object.entries(groups).sort(([a], [b]) =>
                a.localeCompare(b, "ar", { sensitivity: "base" }),
              )

              return groupEntries.map(([letter, group]) => (
                <div key={letter} className="space-y-2">
                  <div className="sticky top-0 z-10 flex items-center gap-2 py-1">
                    <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-cyan-600 text-white text-sm font-bold shrink-0">
                      {letter}
                    </span>
                    <span className="text-xs text-muted-foreground">{group.length} قيمة</span>
                    <div className="flex-1 h-px bg-slate-200 dark:bg-slate-700" />
                  </div>

                  {group.map((r) => {
                    const isOpen = expanded.has(r.value)

                    const rowsWithIdx = allRows
                      ? r.indices
                          .map((idx) => ({ row: allRows[idx], idx }))
                          .filter(({ row }) => Boolean(row))
                      : []

                    const sortCol = headers?.find((h) => h !== scannedColumn) ?? headers?.[0]

                    // ترتيب أبجدي — يرتب حسب آخر كلمة ثم الكلمات السابقة
                    const arabicNameSort = (a: string, b: string): number => {
                      const wa = a.trim().split(/\s+/)
                      const wb = b.trim().split(/\s+/)
                      // قارن آخر كلمة أولاً (الاسم المميز)
                      const lastCmp = (wa[wa.length - 1] ?? "").localeCompare(
                        wb[wb.length - 1] ?? "",
                        "ar",
                      )
                      if (lastCmp !== 0) return lastCmp
                      // إذا تساوت آخر كلمة قارن الكلمات السابقة
                      const len = Math.max(wa.length, wb.length)
                      for (let i = 0; i < len - 1; i++) {
                        const cmp = (wa[i] ?? "").localeCompare(wb[i] ?? "", "ar")
                        if (cmp !== 0) return cmp
                      }
                      return 0
                    }

                    const sortedRows = [...rowsWithIdx].sort((a, b) =>
                      arabicNameSort(
                        String(a.row[sortCol ?? ""] ?? ""),
                        String(b.row[sortCol ?? ""] ?? ""),
                      ),
                    )

                    const rowsForValue = sortedRows.map(({ row }) => row)

                    return (
                      <div
                        key={r.value || `empty-${r.indices.join("-")}`}
                        className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 overflow-hidden"
                      >
                        <button
                          type="button"
                          className={cn(
                            "w-full flex items-center justify-between gap-3 px-3 sm:px-4 py-3 text-start transition-colors",
                            "hover:bg-slate-50 dark:hover:bg-slate-800/50",
                            isOpen && "bg-slate-50/80 dark:bg-slate-800/40",
                          )}
                          onClick={() => allRows && toggleExpand(r.value)}
                          disabled={!allRows}
                        >
                          <div className="flex items-center gap-2.5 min-w-0 flex-1">
                            <span
                              className={cn(
                                myui.badge,
                                "shrink-0 bg-amber-100 text-amber-800 dark:bg-amber-500/20 dark:text-amber-300",
                              )}
                            >
                              {r.count} مرات
                            </span>
                            <span className="text-sm font-medium truncate">
                              {r.value || <span className="text-muted-foreground italic">فارغ</span>}
                            </span>
                          </div>
                          {allRows && (
                            <div className="flex items-center gap-2 shrink-0 text-xs text-muted-foreground">
                              <span className="hidden sm:inline">
                                الصفوف: {r.indices.map((i) => i + 2).join("، ")}
                              </span>
                              {isOpen ? (
                                <ChevronUp className="w-4 h-4" />
                              ) : (
                                <ChevronDown className="w-4 h-4" />
                              )}
                            </div>
                          )}
                        </button>

                        {isOpen && headers && rowsForValue.length > 0 && (
                          <div className={cn(myui.tableWrap, "border-0 rounded-none border-t")}>
                            <div className={myui.tableScroll}>
                              <Table>
                                <TableHeader>
                                  <TableRow className="bg-slate-50/80 dark:bg-slate-800/40 hover:bg-slate-50/80">
                                    <TableHead className="w-12 text-start text-xs py-2">الصف</TableHead>
                                    {headers.map((h) => (
                                      <TableHead
                                        key={h}
                                        className={cn(
                                          "whitespace-nowrap text-start text-xs py-2",
                                          h === scannedColumn && "text-cyan-600 dark:text-cyan-400",
                                        )}
                                      >
                                        {h}
                                        {h === scannedColumn && " ★"}
                                      </TableHead>
                                    ))}
                                  </TableRow>
                                </TableHeader>
                                <TableBody>
                                  {sortedRows.map(({ row, idx }, i) => (
                                    <TableRow key={i} className="text-xs">
                                      <TableCell className="text-start py-2 text-muted-foreground font-mono">
                                        {idx + 2}
                                      </TableCell>
                                      {headers.map((h) => (
                                        <TableCell
                                          key={h}
                                          className={cn(
                                            "whitespace-nowrap text-start py-2",
                                            h === scannedColumn && "font-semibold text-cyan-700 dark:text-cyan-300",
                                          )}
                                        >
                                          {String(row?.[h] ?? "")}
                                        </TableCell>
                                      ))}
                                    </TableRow>
                                  ))}
                                </TableBody>
                              </Table>
                            </div>
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              ))
            })()}
          </div>
        </div>
      )}
    </div>
  )
}
