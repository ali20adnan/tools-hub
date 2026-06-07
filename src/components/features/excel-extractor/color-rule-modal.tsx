"use client"

import { useState, useMemo, type CSSProperties } from "react"
import { ChevronDown, Palette, RefreshCw, X } from "lucide-react"
import { Button, cn } from "myui"
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { myui } from "@/components/myui/myui-styles"

const fieldClass =
  "w-full text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500"

// ── Types ──────────────────────────────────────────────────────────────────────

export interface ColorRule {
  column: string
  mode: "value" | "range"
  /** value mode: map each unique value → bg color hex */
  valueMap: Record<string, string>
  /** range mode: ordered bands [ {from, to, color} ] */
  rangeBands: RangeBand[]
}

export interface RangeBand {
  from: string   // inclusive, empty = -∞
  to: string     // inclusive, empty = +∞
  color: string
}

// A map of column → ColorRule kept in the parent
export type ColumnColorRules = Record<string, ColorRule>

// ── Palette presets ────────────────────────────────────────────────────────────

const PALETTE = [
  "#f87171", "#fb923c", "#fbbf24", "#a3e635", "#34d399",
  "#22d3ee", "#60a5fa", "#a78bfa", "#e879f9", "#f472b6",
  "#ef4444", "#f97316", "#eab308", "#84cc16", "#10b981",
  "#06b6d4", "#3b82f6", "#8b5cf6", "#d946ef", "#ec4899",
  "#fca5a5", "#fdba74", "#fde68a", "#bbf7d0", "#99f6e4",
  "#e0f2fe", "#bfdbfe", "#ddd6fe", "#f5d0fe", "#fce7f3",
]

function randomColors(n: number): string[] {
  const shuffled = [...PALETTE].sort(() => Math.random() - 0.5)
  const result: string[] = []
  for (let i = 0; i < n; i++) result.push(shuffled[i % shuffled.length])
  return result
}

function gradientColors(n: number): string[] {
  // Generate evenly-spaced hues across HSL spectrum
  return Array.from({ length: n }, (_, i) => {
    const h = Math.round((i / n) * 360)
    return hslToHex(h, 80, 75)
  })
}

function hslToHex(h: number, s: number, l: number): string {
  s /= 100; l /= 100
  const a = s * Math.min(l, 1 - l)
  const f = (n: number) => {
    const k = (n + h / 30) % 12
    const color = l - a * Math.max(-1, Math.min(k - 3, Math.min(9 - k, 1)))
    return Math.round(255 * color).toString(16).padStart(2, "0")
  }
  return `#${f(0)}${f(8)}${f(4)}`
}

// Detect if column values look like dates
function looksLikeDates(values: string[]): boolean {
  const dateRe = /^\d{4}[-/]\d{2}[-/]\d{2}$|^\d{2}[-/]\d{2}[-/]\d{4}$/
  return values.slice(0, 20).filter(Boolean).every((v) => dateRe.test(v.trim()))
}

// ── Sub-component: color swatch picker ────────────────────────────────────────

const NO_COLOR = "none"

function badgeTintStyle(color: string) {
  return {
    backgroundColor: hexToRgba(color, 0.25),
    borderColor: hexToRgba(color, 0.55),
    color: "inherit",
  } as const
}

function ColorPicker({ value, onChange }: { value: string; onChange: (c: string) => void }) {
  return (
    <div className="flex flex-wrap gap-1.5 mt-1.5 justify-end">
      <button
        type="button"
        onClick={() => onChange(NO_COLOR)}
        className={cn(
          "w-7 h-7 rounded-md border-2 transition-transform hover:scale-105 flex items-center justify-center focus:outline-none focus-visible:ring-2 focus-visible:ring-ring",
          value === NO_COLOR ? "border-foreground ring-1 ring-foreground/30" : "border-muted-foreground/40",
        )}
        style={{ background: "#ffffff" }}
        title="بدون لون"
      >
        <X className="w-3 h-3 text-muted-foreground/60" />
      </button>
      {PALETTE.map((c) => (
        <button
          key={c}
          type="button"
          onClick={() => onChange(c)}
          className={cn(
            "w-7 h-7 rounded-md border-2 transition-transform hover:scale-105 focus:outline-none focus-visible:ring-2 focus-visible:ring-ring",
            value === c ? "border-foreground ring-1 ring-foreground/30" : "border-transparent",
          )}
          style={{ background: c }}
          title={c}
        />
      ))}
      {/* Native color input for custom */}
      <label
        className="w-6 h-6 rounded-md border-2 border-dashed border-muted-foreground/40 flex items-center justify-center cursor-pointer hover:border-foreground/60 relative overflow-hidden"
        title="لون مخصص"
      >
        <span className="text-[9px] text-muted-foreground leading-none">+</span>
        <input
          type="color"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
        />
      </label>
    </div>
  )
}

// ── Main Modal ─────────────────────────────────────────────────────────────────

interface ColorRuleModalProps {
  column: string
  allRows: Record<string, unknown>[]
  existingRule?: ColorRule
  open: boolean
  onClose: () => void
  onSave: (rule: ColorRule | null) => void
}

export function ColorRuleModal({
  column, allRows, existingRule, open, onClose, onSave,
}: ColorRuleModalProps) {
  const rawValues = useMemo(
    () => allRows.map((r) => normalizeCellValue(r[column])).filter(Boolean),
    [allRows, column]
  )
  const uniqueValues = useMemo(
    () => [...new Set(rawValues)].sort((a, b) => a.localeCompare(b, "ar")),
    [rawValues]
  )
  const isDateCol = useMemo(() => looksLikeDates(uniqueValues), [uniqueValues])

  const defaultMode: "value" | "range" = isDateCol ? "range" : "value"

  const [mode, setMode] = useState<"value" | "range">(existingRule?.mode ?? defaultMode)
  const [valueMap, setValueMap] = useState<Record<string, string>>(
    () => existingRule?.valueMap ?? Object.fromEntries(
      uniqueValues.map((v, i) => [v, gradientColors(uniqueValues.length)[i]])
    )
  )
  const [rangeBands, setRangeBands] = useState<RangeBand[]>(
    () => existingRule?.rangeBands ?? [
      { from: "", to: "", color: "#fbbf24" },
    ]
  )
  const [expandedValue, setExpandedValue] = useState<string | null>(null)

  function applyGradient() {
    const colors = gradientColors(uniqueValues.length)
    setValueMap(Object.fromEntries(uniqueValues.map((v, i) => [v, colors[i]])))
  }
  function applyRandom() {
    const colors = randomColors(uniqueValues.length)
    setValueMap(Object.fromEntries(uniqueValues.map((v, i) => [v, colors[i]])))
  }

  function addBand() {
    setRangeBands((prev) => [...prev, { from: "", to: "", color: "#60a5fa" }])
  }
  function removeBand(i: number) {
    setRangeBands((prev) => prev.filter((_, idx) => idx !== i))
  }
  function updateBand(i: number, field: keyof RangeBand, val: string) {
    setRangeBands((prev) => prev.map((b, idx) => idx === i ? { ...b, [field]: val } : b))
  }

  function handleSave() {
    const normalizedValueMap =
      mode === "value"
        ? Object.fromEntries(
            Object.entries(valueMap).map(([k, v]) => [normalizeCellValue(k), v]),
          )
        : valueMap
    onSave({ column, mode, valueMap: normalizedValueMap, rangeBands })
  }

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent
        className="flex flex-col max-w-xl w-[calc(100%-1.5rem)] sm:w-full max-h-[min(88dvh,720px)] p-0 gap-0 overflow-hidden rounded-3xl border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xl"
        dir="rtl"
      >
        <DialogHeader className="shrink-0 px-4 sm:px-6 pt-5 pb-3 border-b border-slate-100 dark:border-slate-800 text-right bg-slate-50/50 dark:bg-slate-900/80">
          <DialogTitle className="flex items-center gap-2.5 text-base sm:text-lg justify-start">
            <div className={cn(myui.iconBox, "w-9 h-9 bg-cyan-600/10")}>
              <Palette className="w-4 h-4 text-cyan-600 dark:text-cyan-400 shrink-0" />
            </div>
            <span className="truncate dark:text-white">
              تلوين عمود: <span className="text-cyan-600 dark:text-cyan-400">{column}</span>
            </span>
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 min-h-0 overflow-y-auto overscroll-contain custom-scrollbar px-4 sm:px-6 py-4 space-y-4 [scrollbar-gutter:stable]">

        {/* Mode toggle */}
        <div className={cn(myui.tabsList, "w-full")} role="tablist">
          <button
            type="button"
            role="tab"
            aria-selected={mode === "value"}
            onClick={() => setMode("value")}
            className={cn(
              myui.tabTrigger,
              mode === "value" &&
                "bg-white text-cyan-700 shadow-sm dark:bg-slate-900 dark:text-cyan-300",
            )}
          >
            حسب القيمة
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={mode === "range"}
            onClick={() => setMode("range")}
            className={cn(
              myui.tabTrigger,
              mode === "range" &&
                "bg-white text-cyan-700 shadow-sm dark:bg-slate-900 dark:text-cyan-300",
            )}
          >
            حسب النطاق
          </button>
        </div>

        {/* ── Value mode ── */}
        {mode === "value" && (
          <div className="space-y-3">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-sm text-muted-foreground">
                {uniqueValues.length.toLocaleString("ar-SA")} قيمة فريدة
              </p>
              <div className="flex gap-2 shrink-0">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={applyGradient}
                  className="gap-1.5 text-xs h-9 flex-1 sm:flex-none rounded-xl text-cyan-700 hover:bg-cyan-50 dark:text-cyan-300 dark:hover:bg-cyan-950/40"
                >
                  <Palette className="w-3.5 h-3.5" />
                  تدرج لوني
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={applyRandom}
                  className="gap-1.5 text-xs h-9 flex-1 sm:flex-none rounded-xl text-muted-foreground hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  عشوائي
                </Button>
              </div>
            </div>

            <div className="space-y-2 max-h-[min(38dvh,320px)] overflow-y-auto custom-scrollbar rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/25 p-2 [scrollbar-gutter:stable]">
              {uniqueValues.map((val) => {
                const color = valueMap[val] ?? "#e5e7eb"
                const isNone = color === NO_COLOR
                const isOpen = expandedValue === val
                const rowCount = rawValues.filter((v) => v === val).length
                return (
                  <div
                    key={val}
                    className={cn(
                      "rounded-xl border overflow-hidden bg-white dark:bg-slate-900 transition-colors",
                      isOpen
                        ? "border-cyan-500/40 ring-1 ring-cyan-500/20"
                        : "border-slate-200 dark:border-slate-700",
                    )}
                  >
                    <button
                      type="button"
                      aria-expanded={isOpen}
                      className={cn(
                        "w-full flex items-center gap-2.5 sm:gap-3 px-3 py-2.5",
                        "hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors focus:outline-none",
                        isOpen && "bg-cyan-50/50 dark:bg-cyan-950/20",
                      )}
                      onClick={() => setExpandedValue(isOpen ? null : val)}
                    >
                      <span
                        className="w-8 h-8 rounded-md border shrink-0 flex items-center justify-center"
                        style={{ background: isNone ? "#ffffff" : color }}
                      >
                        {isNone && <X className="w-3.5 h-3.5 text-muted-foreground/50" />}
                      </span>
                      <span
                        className="flex-1 min-w-0 text-sm font-medium leading-snug truncate text-right"
                        title={val}
                      >
                        {val}
                      </span>
                      <Badge
                        variant="secondary"
                        className="text-[11px] shrink-0 tabular-nums"
                        style={isNone ? undefined : badgeTintStyle(color)}
                      >
                        {rowCount.toLocaleString("ar-SA")} صف
                      </Badge>
                      <ChevronDown
                        className={cn(
                          "w-4 h-4 text-muted-foreground shrink-0 transition-transform",
                          isOpen && "rotate-180",
                        )}
                      />
                    </button>
                    {isOpen && (
                      <div className="px-3 pb-3 pt-2 border-t border-slate-100 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-800/30">
                        <p className="text-[11px] text-muted-foreground mb-2 text-right">اختر لوناً لهذه القيمة</p>
                        <ColorPicker
                          value={color}
                          onChange={(c) => setValueMap((prev) => ({ ...prev, [val]: c }))}
                        />
                      </div>
                    )}
                  </div>
                )
              })}
            </div>

            {/* ── Color preview strip ── */}
            <div className="pt-3 border-t border-slate-100 dark:border-slate-800">
              <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/25 p-3 space-y-2.5">
                <p className="text-xs font-medium text-muted-foreground text-right">
                  معاينة التوزيع اللوني
                </p>
                <div className="flex flex-wrap gap-2 justify-start">
                  {uniqueValues.map((val) => {
                    const color = valueMap[val] ?? "#e5e7eb"
                    const isNone = color === NO_COLOR
                    return (
                      <span
                        key={val}
                        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium border max-w-[11.5rem]"
                        style={isNone
                          ? { background: "#f3f4f6", borderColor: "#d1d5db", color: "#6b7280" }
                          : badgeTintStyle(color)}
                        title={val}
                      >
                        <span
                          className="w-3 h-3 rounded-sm shrink-0 border border-black/10"
                          style={{ background: isNone ? "#d1d5db" : color }}
                        />
                        <span className="truncate text-right">{val}</span>
                      </span>
                    )
                  })}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ── Range mode ── */}
        {mode === "range" && (
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground text-right leading-relaxed">
              حدد نطاقات (تاريخ أو رقم) وخصص لوناً لكل نطاق. النطاقات تُطبَّق بالترتيب.
            </p>
            <div className="space-y-2">
              {rangeBands.map((band, i) => (
                <div key={i} className="rounded-2xl border border-slate-200 dark:border-slate-800 p-3 space-y-2 bg-white dark:bg-slate-900">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-muted-foreground">نطاق {i + 1}</span>
                    <button
                      type="button"
                      onClick={() => removeBand(i)}
                      className="text-muted-foreground hover:text-destructive transition-colors p-1 rounded-md hover:bg-muted/50"
                      aria-label={`حذف نطاق ${i + 1}`}
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-xs text-muted-foreground block mb-1">من (اتركه فارغاً = بلا حد)</label>
                      <input
                        type="text"
                        value={band.from}
                        placeholder="2020-01-01"
                        onChange={(e) => updateBand(i, "from", e.target.value)}
                        className={fieldClass}
                        dir="ltr"
                      />
                    </div>
                    <div>
                      <label className="text-xs text-muted-foreground block mb-1">إلى (اتركه فارغاً = بلا حد)</label>
                      <input
                        type="text"
                        value={band.to}
                        placeholder="2022-12-31"
                        onChange={(e) => updateBand(i, "to", e.target.value)}
                        className={fieldClass}
                        dir="ltr"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="text-xs text-muted-foreground block mb-1">اللون</label>
                    <div className="flex items-center gap-2">
                      <span className="w-7 h-7 rounded-md border shrink-0" style={{ background: band.color }} />
                      <ColorPicker value={band.color} onChange={(c) => updateBand(i, "color", c)} />
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={addBand}
              className="w-full gap-1.5 rounded-xl h-10 text-cyan-700 hover:bg-cyan-50 dark:text-cyan-300 dark:hover:bg-cyan-950/30"
            >
              + إضافة نطاق
            </Button>
          </div>
        )}
        </div>

        {/* Actions — RTL: حفظ يمين، إلغاء يسار */}
        <div className="shrink-0 border-t border-slate-100 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-900/90 px-4 sm:px-6 py-3 flex flex-col-reverse sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3">
          <Button
            type="button"
            onClick={handleSave}
            className="sm:min-w-[140px] h-11 rounded-xl bg-cyan-600 hover:bg-cyan-700 shadow-sm shadow-cyan-500/20 transition-transform active:scale-[0.98]"
          >
            حفظ التلوين
          </Button>
          <div className="flex items-center gap-2 sm:me-auto">
            {existingRule && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => onSave(null)}
                className="h-10 rounded-xl gap-1.5 text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950/30"
              >
                <X className="w-4 h-4" />
                إزالة التلوين
              </Button>
            )}
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="h-10 rounded-xl text-muted-foreground hover:text-foreground hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              إلغاء
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

// ── Value normalization (Excel numbers / whitespace) ───────────────────────────

export function normalizeCellValue(value: unknown): string {
  if (value == null || value === "") return ""
  if (typeof value === "number") {
    if (Number.isFinite(value) && Number.isInteger(value)) return String(value)
    if (Number.isFinite(value)) {
      const rounded = Math.round(value * 1e6) / 1e6
      return String(rounded)
    }
  }
  return String(value).trim()
}

/** Blend a hex color toward white (used for print export preview only). */
export function mixHexWithWhite(hex: string, colorWeight: number): string {
  const h = hex.replace("#", "").slice(0, 6)
  if (!/^[0-9A-Fa-f]{6}$/.test(h)) return "#FFFFFF"
  const r = parseInt(h.slice(0, 2), 16)
  const g = parseInt(h.slice(2, 4), 16)
  const b = parseInt(h.slice(4, 6), 16)
  const w = 1 - colorWeight
  const mix = (c: number) => Math.round(c * colorWeight + 255 * w)
  const toHex = (n: number) => n.toString(16).padStart(2, "0")
  return `#${toHex(mix(r))}${toHex(mix(g))}${toHex(mix(b))}`
}

export function hexToRgba(hex: string, alpha: number): string {
  const h = hex.replace("#", "")
  if (h.length !== 6) return hex
  const r = parseInt(h.slice(0, 2), 16)
  const g = parseInt(h.slice(2, 4), 16)
  const b = parseInt(h.slice(4, 6), 16)
  return `rgba(${r}, ${g}, ${b}, ${alpha})`
}

/** تلوين خلية — خلفية فقط بدون حدود عمودية بين الخلايا */
export function coloredCellStyle(color: string | undefined): CSSProperties | undefined {
  if (!color) return undefined
  return { backgroundColor: hexToRgba(color, 0.2) }
}

// ── Utility: resolve cell background ──────────────────────────────────────────

export function resolveCellColor(
  rules: ColumnColorRules,
  column: string,
  value: unknown
): string | undefined {
  const rule = rules[column]
  if (!rule) return undefined
  const str = normalizeCellValue(value)

  if (rule.mode === "value") {
    let mapped: string | undefined =
      rule.valueMap[str] ?? rule.valueMap[String(value ?? "")]
    if (mapped === undefined) {
      const entry = Object.entries(rule.valueMap).find(
        ([k]) => normalizeCellValue(k) === str,
      )
      mapped = entry ? entry[1] : undefined
    }
    if (mapped === undefined || mapped === NO_COLOR) return undefined
    return mapped
  }

  if (rule.mode === "range") {
    for (const band of rule.rangeBands) {
      const afterFrom = !band.from || str >= band.from
      const beforeTo  = !band.to   || str <= band.to
      if (afterFrom && beforeTo) return band.color === NO_COLOR ? undefined : band.color
    }
  }

  return undefined
}
