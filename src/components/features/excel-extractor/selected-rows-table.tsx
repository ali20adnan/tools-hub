"use client"

import { memo, useEffect, useRef } from "react"
import { Palette, X } from "lucide-react"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { cn } from "myui"
import { myui } from "@/components/myui/myui-styles"
import {
  ColumnColorRules,
  coloredCellStyle,
  resolveCellColor,
} from "./color-rule-modal"

export type SelectedRowItem = {
  key: string | number
  row: Record<string, unknown>
}

interface SelectedRowsTableProps {
  headers: string[]
  rows: SelectedRowItem[]
  colorRules?: ColumnColorRules
  onColorHeader?: (col: string) => void
  onRemoveRow?: (key: number) => void
  showRemove?: boolean
}

export const SelectedRowsTable = memo(function SelectedRowsTable({
  headers,
  rows,
  colorRules = {},
  onColorHeader,
  onRemoveRow,
  showRemove = false,
}: SelectedRowsTableProps) {
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = scrollRef.current
    if (!el) return
    el.scrollLeft = 0
  }, [rows, headers, showRemove])

  return (
    <div
      ref={scrollRef}
      dir="rtl"
      className={cn(myui.tableScroll, "max-h-[460px]")}
    >
      <Table unwrapped className="w-max min-w-full border-collapse">
        <TableHeader className="sticky top-0 z-10">
          <TableRow className="bg-slate-50 dark:bg-slate-800/95 hover:bg-slate-50 dark:hover:bg-slate-800/95 shadow-[inset_0_-1px_0_0_rgb(226_232_240)] dark:shadow-[inset_0_-1px_0_0_rgb(51_65_85)]">
            {showRemove && (
              <TableHead className="w-11 min-w-[2.75rem] text-center px-2 sticky right-0 z-10 bg-slate-50 dark:bg-slate-800/95">
                <span className="sr-only">إزالة</span>
              </TableHead>
            )}
            {headers.map((h) => {
              const hasRule = !!colorRules[h]
              return (
                <TableHead
                  key={h}
                  className="min-w-[7rem] max-w-[14rem] whitespace-nowrap text-right text-xs font-semibold p-0"
                >
                  <button
                    type="button"
                    className={cn(
                      "flex items-center gap-1 px-3 py-2 w-full text-right text-slate-800 dark:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors",
                      hasRule && "bg-cyan-50/60 dark:bg-cyan-950/25",
                    )}
                    onClick={() => onColorHeader?.(h)}
                    title={`تلوين عمود ${h}`}
                  >
                    <span className="truncate">{h}</span>
                    <Palette
                      className={cn(
                        "w-3 h-3 shrink-0",
                        hasRule ? "text-cyan-600" : "text-muted-foreground",
                      )}
                    />
                  </button>
                </TableHead>
              )
            })}
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map(({ key, row }) => (
            <TableRow
              key={key}
              className="text-xs hover:bg-slate-50/80 dark:hover:bg-slate-800/40"
            >
              {showRemove && (
                <TableCell className="w-11 min-w-[2.75rem] text-center px-2 py-2 sticky right-0 z-[1] bg-white dark:bg-slate-900">
                  {typeof key === "number" && onRemoveRow ? (
                    <button
                      type="button"
                      onClick={() => onRemoveRow(key)}
                      className="inline-flex items-center justify-center w-7 h-7 rounded-lg text-muted-foreground hover:text-destructive hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors"
                      aria-label="إزالة من التحديد"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  ) : null}
                </TableCell>
              )}
              {headers.map((h) => {
                const cellColor = resolveCellColor(colorRules, h, row[h])
                return (
                  <TableCell
                    key={h}
                    className="min-w-[7rem] max-w-[14rem] whitespace-nowrap text-right py-2 px-3 truncate"
                    style={coloredCellStyle(cellColor)}
                    title={String(row[h] ?? "")}
                  >
                    {String(row[h] ?? "")}
                  </TableCell>
                )
              })}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
})
