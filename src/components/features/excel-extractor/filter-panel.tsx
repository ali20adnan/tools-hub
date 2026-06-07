"use client"

import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Textarea } from "@/components/ui/textarea"
import { Palette, Search, Columns3, X } from "lucide-react"
import type { ColumnColorRules } from "@/components/features/excel-extractor/color-rule-modal"
import { Button, cn } from "myui"
import { myui } from "@/components/myui/myui-styles"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

interface FilterPanelProps {
  headers: string[]
  filterColumn: string
  filterValue: string
  selectedColumns: string[]
  colorRules?: ColumnColorRules
  onColorColumn?: (col: string) => void
  onColumnChange: (col: string) => void
  onValueChange: (val: string) => void
  onToggleColumn: (col: string) => void
  onClearFilter: () => void
}

const fieldClass =
  "rounded-xl bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 focus-visible:ring-cyan-500/20 focus-visible:border-cyan-500"

const subPanelClass =
  "rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/25 overflow-hidden"

function SubPanelHeader({
  icon: Icon,
  title,
  action,
}: {
  icon: React.ComponentType<{ className?: string }>
  title: string
  action?: React.ReactNode
}) {
  return (
    <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between px-3 sm:px-4 py-2.5 sm:py-3 border-b border-slate-200/80 dark:border-slate-800 bg-white/80 dark:bg-slate-900/60">
      <div className="flex items-center gap-2.5 min-w-0">
        <div className={cn(myui.iconBox, "w-8 h-8 bg-cyan-600/10")}>
          <Icon className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />
        </div>
        <span className={cn(myui.sectionTitle, "text-sm")}>{title}</span>
      </div>
      {action}
    </div>
  )
}

export function FilterPanel({
  headers,
  filterColumn,
  filterValue,
  selectedColumns,
  colorRules = {},
  onColorColumn,
  onColumnChange,
  onValueChange,
  onToggleColumn,
  onClearFilter,
}: FilterPanelProps) {
  const selectAll = () => headers.forEach((h) => !selectedColumns.includes(h) && onToggleColumn(h))
  const deselectAll = () => headers.forEach((h) => selectedColumns.includes(h) && onToggleColumn(h))

  return (
    <div className="space-y-4 sm:space-y-5">
      {/* Search */}
      <section className={subPanelClass}>
        <SubPanelHeader icon={Search} title="البحث والتصفية" />
        <div className="p-3 sm:p-4 grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4">
          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">البحث في عمود</Label>
            <Select
              value={filterColumn || "__all__"}
              onValueChange={(v) => onColumnChange(v === "__all__" ? "" : v)}
            >
              <SelectTrigger className={cn(fieldClass, "h-11 w-full")}>
                <SelectValue placeholder="اختر عموداً أو ابحث في الكل" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="__all__">— البحث في كل الأعمدة —</SelectItem>
                {headers.map((h) => (
                  <SelectItem key={h} value={h}>
                    {h}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">قيم البحث (متعدد)</Label>
            <div className="relative">
              <Textarea
                placeholder={"مثال:\nاحمد\nمحمد, خالد"}
                value={filterValue}
                onChange={(e) => onValueChange(e.target.value)}
                className={cn(fieldClass, "text-sm min-h-[100px] resize-y pe-10")}
              />
              {filterValue && (
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={onClearFilter}
                  className="absolute top-2 end-2 h-8 w-8 rounded-lg text-muted-foreground hover:text-cyan-600 hover:bg-cyan-50 dark:hover:bg-cyan-950/30"
                  aria-label="مسح البحث"
                >
                  <X className="w-4 h-4" />
                </Button>
              )}
            </div>
            <p className="text-[11px] sm:text-xs text-muted-foreground leading-relaxed">
              أدخل أكثر من قيمة (كل سطر أو فاصلة). سيتم عرض الصف إذا طابق أي قيمة.
            </p>
          </div>
        </div>
      </section>

      {/* Column visibility */}
      <section className={subPanelClass}>
        <SubPanelHeader
          icon={Columns3}
          title="الأعمدة المعروضة"
          action={
            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={selectAll}
                className="h-8 rounded-xl text-xs text-cyan-700 hover:bg-cyan-50 dark:text-cyan-300 dark:hover:bg-cyan-950/40"
              >
                تحديد الكل
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={deselectAll}
                className="h-8 rounded-xl text-xs text-muted-foreground hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                إلغاء الكل
              </Button>
            </div>
          }
        />
        <div className="p-3 sm:p-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 max-h-48 overflow-auto custom-scrollbar">
            {headers.map((h) => {
              const checked = selectedColumns.includes(h)
              return (
                <label
                  key={h}
                  className={cn(
                    "flex items-center gap-2.5 cursor-pointer select-none rounded-xl border px-3 py-2.5 transition-colors",
                    checked
                      ? "border-cyan-500/40 bg-cyan-50/80 dark:bg-cyan-950/25"
                      : "border-slate-200 dark:border-slate-700 hover:border-cyan-500/20 hover:bg-slate-50 dark:hover:bg-slate-800/50",
                  )}
                >
                  <Checkbox
                    checked={checked}
                    onCheckedChange={() => onToggleColumn(h)}
                    className="data-[state=checked]:bg-cyan-600 data-[state=checked]:border-cyan-600"
                  />
                  <span className="text-sm truncate text-start">{h}</span>
                </label>
              )
            })}
          </div>
        </div>
      </section>

      {/* Column colors */}
      {onColorColumn && headers.length > 0 && (
        <section className={subPanelClass}>
          <SubPanelHeader icon={Palette} title="تلوين الأعمدة" />
          <div className="p-3 sm:p-4 space-y-3">
            <p className="text-[11px] sm:text-xs text-muted-foreground">
              اختر عموداً لفتح لوحة التلوين — الألوان تظهر في الجدول مباشرة بعد الحفظ.
            </p>
            <div className="flex flex-wrap gap-2">
              {headers.map((h) => {
                const hasRule = !!colorRules[h]
                return (
                  <button
                    key={h}
                    type="button"
                    onClick={() => onColorColumn(h)}
                    title={`تلوين عمود ${h}`}
                    className={cn(
                      "inline-flex items-center gap-1.5 max-w-full rounded-xl px-3 py-2 text-xs font-medium transition-all active:scale-[0.98]",
                      hasRule
                        ? "bg-cyan-600 text-white shadow-sm shadow-cyan-500/20 hover:bg-cyan-700"
                        : "border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-muted-foreground hover:border-cyan-500/30 hover:text-cyan-700 dark:hover:text-cyan-300",
                    )}
                  >
                    <Palette className="w-3.5 h-3.5 shrink-0" />
                    <span className="truncate">{h}</span>
                  </button>
                )
              })}
            </div>
          </div>
        </section>
      )}
    </div>
  )
}
