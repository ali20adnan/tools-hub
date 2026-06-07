"use client"

import { LayoutGrid, Columns2 } from "lucide-react"
import { cn } from "myui"

export type ResultsViewMode = "tabs" | "split"

export function ResultsViewModeToggle({
  mode,
  onChange,
}: {
  mode: ResultsViewMode
  onChange: (mode: ResultsViewMode) => void
}) {
  return (
    <div
      className="grid grid-cols-2 gap-1 p-1 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 shrink-0"
      role="group"
      aria-label="طريقة عرض النتائج"
    >
      <button
        type="button"
        aria-pressed={mode === "tabs"}
        onClick={() => onChange("tabs")}
        className={cn(
          "inline-flex items-center justify-center gap-1.5 px-2.5 py-2 rounded-lg text-xs font-medium transition-colors min-h-[40px] sm:min-h-0",
          mode === "tabs"
            ? "bg-white dark:bg-slate-900 text-cyan-700 dark:text-cyan-300 shadow-sm"
            : "text-muted-foreground hover:text-foreground",
        )}
      >
        <LayoutGrid className="w-3.5 h-3.5 shrink-0" />
        <span>تبويبات</span>
      </button>
      <button
        type="button"
        aria-pressed={mode === "split"}
        onClick={() => onChange("split")}
        className={cn(
          "inline-flex items-center justify-center gap-1.5 px-2.5 py-2 rounded-lg text-xs font-medium transition-colors min-h-[40px] sm:min-h-0",
          mode === "split"
            ? "bg-white dark:bg-slate-900 text-cyan-700 dark:text-cyan-300 shadow-sm"
            : "text-muted-foreground hover:text-foreground",
        )}
      >
        <Columns2 className="w-3.5 h-3.5 shrink-0" />
        <span>صفحة واحدة</span>
      </button>
    </div>
  )
}
