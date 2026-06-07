"use client"

import { memo } from "react"
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table"
import { Checkbox } from "@/components/ui/checkbox"
import { Palette } from "lucide-react"
import { ColumnColorRules, coloredCellStyle, resolveCellColor } from "./color-rule-modal"
import { cn } from "myui"
import { myui } from "@/components/myui/myui-styles"

interface ResultsTableProps {
  headers: string[]
  rows: Record<string, unknown>[]
  /** Original index in allRows for stable selection tracking */
  rowKeys: number[]
  selectedKeys: Set<number>
  onToggleRow: (key: number) => void
  onSelectAll: () => void
  onClearAll: () => void
  totalCount: number
  colorRules?: ColumnColorRules
  /** Called when user clicks a column header to open color picker */
  onColorHeader?: (col: string) => void
}

const PAGE_SIZE = 200

export const ResultsTable = memo(function ResultsTable({
  headers,
  rows,
  rowKeys,
  selectedKeys,
  onToggleRow,
  onSelectAll,
  onClearAll,
  totalCount,
  colorRules = {},
  onColorHeader,
}: ResultsTableProps) {
  const displayRows = rows.slice(0, PAGE_SIZE)
  const displayKeys = rowKeys.slice(0, PAGE_SIZE)
  const allSelected = displayKeys.length > 0 && displayKeys.every((k) => selectedKeys.has(k))
  const someSelected = displayKeys.some((k) => selectedKeys.has(k))

  return (
    <div className="flex flex-col w-full min-w-0">
      <div className={myui.tableBar}>
        <span>
          <span className="font-semibold text-foreground">{totalCount}</span> صف
          {totalCount > PAGE_SIZE && <span> · يُعرض أول {PAGE_SIZE}</span>}
        </span>
        {selectedKeys.size > 0 && (
          <span className="text-cyan-700 dark:text-cyan-300 font-medium">
            {selectedKeys.size} محدد
          </span>
        )}
      </div>

      <div dir="rtl" className={myui.tableScroll}>
        <Table unwrapped className="w-max min-w-full border-collapse">
          <TableHeader className="sticky top-0 z-10">
            <TableRow className="bg-slate-50 dark:bg-slate-800/95 hover:bg-slate-50 dark:hover:bg-slate-800/95 shadow-[inset_0_-1px_0_0_rgb(226_232_240)] dark:shadow-[inset_0_-1px_0_0_rgb(51_65_85)]">
              <TableHead className="w-10 text-center px-3">
                <Checkbox
                  checked={allSelected}
                  data-state={someSelected && !allSelected ? "indeterminate" : undefined}
                  onCheckedChange={() => allSelected ? onClearAll() : onSelectAll()}
                  aria-label="تحديد الكل"
                />
              </TableHead>
              {headers.map((h) => {
                const hasRule = !!colorRules[h]
                return (
                  <TableHead key={h} className="whitespace-nowrap text-right font-semibold p-0">
                    <button
                      className={cn(
                        "flex items-center gap-1.5 px-4 py-3 w-full text-right transition-colors",
                        "text-slate-800 dark:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800 group",
                        hasRule && "bg-cyan-50/60 dark:bg-cyan-950/25",
                      )}
                      onClick={() => onColorHeader?.(h)}
                      title={`تلوين عمود "${h}"`}
                    >
                      {h}
                      <Palette
                        className={cn(
                          "w-3.5 h-3.5 shrink-0",
                          hasRule
                            ? "text-cyan-600 dark:text-cyan-400 opacity-100"
                            : "text-muted-foreground opacity-70 group-hover:opacity-100",
                        )}
                      />
                    </button>
                  </TableHead>
                )
              })}
            </TableRow>
          </TableHeader>
          <TableBody>
            {displayRows.length === 0 ? (
              <TableRow>
                <TableCell colSpan={headers.length + 1} className="text-center text-muted-foreground py-10">
                  لا توجد نتائج مطابقة
                </TableCell>
              </TableRow>
            ) : (
              displayRows.map((row, i) => {
                const key = displayKeys[i]
                const selected = selectedKeys.has(key)

                return (
                  <TableRow
                    key={key}
                    data-selected={selected}
                    className={cn(
                      "cursor-pointer",
                      selected
                        ? "data-[selected=true]:bg-primary/8 data-[selected=true]:hover:bg-primary/12"
                        : "hover:bg-muted/30",
                    )}
                    onClick={() => onToggleRow(key)}
                  >
                    <TableCell className="w-10 text-center px-3" onClick={(e) => e.stopPropagation()}>
                      <Checkbox
                        checked={selected}
                        onCheckedChange={() => onToggleRow(key)}
                        aria-label="تحديد الصف"
                      />
                    </TableCell>
                    {headers.map((h) => {
                      const cellColor = resolveCellColor(colorRules, h, row[h])
                      return (
                        <TableCell
                          key={h}
                          className="whitespace-nowrap text-right"
                          style={coloredCellStyle(cellColor)}
                        >
                          {String(row[h] ?? "")}
                        </TableCell>
                      )
                    })}
                  </TableRow>
                )
              })
            )}
          </TableBody>
        </Table>
      </div>
      {Object.keys(colorRules).length > 0 && (
        <p className={myui.tableFooter}>
          انقر على رأس العمود الملوّن لتعديل قاعدة التلوين
        </p>
      )}
    </div>
  )
})
