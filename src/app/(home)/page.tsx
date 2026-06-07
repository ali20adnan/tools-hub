"use client"

import Link from "next/link"
import { useEffect, useMemo, useState } from "react"
import { Clock, Trash2, X, Loader2, LayoutGrid, Search } from "lucide-react"
import { Button, cn } from "myui"
import { useActivityStore, ToolId } from "@/store/activity/activityStore"
import { useActivitySync } from "@/hooks/useActivitySync"
import { useToolsAvailability } from "@/context/tools-availability-context"
import { TOOL_DEFINITIONS } from "@/lib/tools/registry"

const TOOL_ACTIVITY_COLORS: Record<ToolId, string> = {
  "excel-extractor": "text-emerald-600 dark:text-emerald-400",
  "duplicate-detector": "text-violet-600 dark:text-violet-400",
  "excel-merger": "text-sky-600 dark:text-sky-400",
  "excel-compare": "text-orange-600 dark:text-orange-400",
  "image-scanner": "text-cyan-600 dark:text-cyan-400",
}

const TOOL_META = TOOL_DEFINITIONS.reduce(
  (acc, tool) => {
    acc[tool.slug as ToolId] = {
      label: tool.title,
      icon: tool.icon,
      color: TOOL_ACTIVITY_COLORS[tool.slug as ToolId],
      href: tool.href,
    }
    return acc
  },
  {} as Record<ToolId, { label: string; icon: React.ElementType; color: string; href: string }>,
)

function formatRelative(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime()
  const mins = Math.floor(diff / 60000)
  const hours = Math.floor(diff / 3600000)
  const days = Math.floor(diff / 86400000)
  if (mins < 1) return "الآن"
  if (mins < 60) return `منذ ${mins} دقيقة`
  if (hours < 24) return `منذ ${hours} ساعة`
  if (days === 1) return "أمس"
  return `منذ ${days} يوم`
}

function Panel({
  title,
  icon: Icon,
  action,
  children,
  className,
}: {
  title: string
  icon?: React.ComponentType<{ className?: string }>
  action?: React.ReactNode
  children: React.ReactNode
  className?: string
}) {
  return (
    <section
      className={cn(
        "bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden",
        className,
      )}
    >
      <div className="flex items-center justify-between gap-2 px-3 sm:px-5 py-3 sm:py-4 border-b border-slate-100 dark:border-slate-800">
        <div className="flex items-center gap-2.5 min-w-0">
          {Icon && (
            <div className="w-9 h-9 rounded-xl bg-cyan-600/10 flex items-center justify-center shrink-0">
              <Icon className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />
            </div>
          )}
          <h2 className="text-base font-bold dark:text-white truncate">{title}</h2>
        </div>
        {action}
      </div>
      <div className="p-3 sm:p-5">{children}</div>
    </section>
  )
}

function ToolsGrid() {
  const { isToolEnabled, loading: toolsLoading } = useToolsAvailability()

  if (toolsLoading) {
    return (
      <div className="flex items-center justify-center py-10 text-muted-foreground gap-2 text-sm">
        <Loader2 className="w-4 h-4 animate-spin text-cyan-600" />
        جاري تحميل الأدوات...
      </div>
    )
  }

  const visibleTools = TOOL_DEFINITIONS.filter((tool) => isToolEnabled(tool.slug))

  if (visibleTools.length === 0) {
    return (
      <p className="text-sm text-muted-foreground py-6 text-center">
        لا توجد أدوات مفعّلة حالياً. تواصل مع المشرف.
      </p>
    )
  }

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
      {visibleTools.map((tool) => {
        const Icon = tool.icon
        return (
          <Link
            key={tool.href}
            href={tool.href}
            className="group flex flex-col gap-3 sm:gap-4 p-3.5 sm:p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-700/80 hover:border-cyan-500/30 hover:shadow-md hover:shadow-cyan-500/5 transition-all min-h-[120px] sm:min-h-0"
          >
            <div
              className={cn(
                "w-10 h-10 sm:w-12 sm:h-12 rounded-xl text-white flex items-center justify-center shadow-lg shrink-0",
                tool.color,
              )}
            >
              <Icon className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <div className="space-y-0.5 sm:space-y-1 min-w-0">
              <p className="font-bold text-xs sm:text-sm dark:text-white group-hover:text-cyan-600 dark:group-hover:text-cyan-400 transition-colors leading-snug">
                {tool.title}
              </p>
              <p className="text-[10px] sm:text-xs text-muted-foreground leading-relaxed line-clamp-2 sm:line-clamp-none">
                {tool.description}
              </p>
            </div>
          </Link>
        )
      })}
    </div>
  )
}

function ActivitySearch({
  value,
  onChange,
}: {
  value: string
  onChange: (value: string) => void
}) {
  return (
    <div className="relative">
      <Search className="absolute top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 start-3 pointer-events-none" />
      <input
        type="search"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="بحث في العمليات..."
        dir="rtl"
        className="w-full py-2.5 ps-10 pe-4 text-sm text-start bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-cyan-500/20"
      />
    </div>
  )
}

function ActivityList({
  mounted,
  activityInitialized,
  activityLoading,
  searchQuery,
}: {
  mounted: boolean
  activityInitialized: boolean
  activityLoading: boolean
  searchQuery: string
}) {
  const { entries, clear, remove } = useActivityStore()

  const filteredEntries = useMemo(() => {
    const q = searchQuery.trim().toLowerCase()
    if (!q) return entries
    return entries.filter((entry) => {
      const meta = TOOL_META[entry.tool]
      return (
        entry.label.toLowerCase().includes(q) ||
        (entry.detail?.toLowerCase().includes(q) ?? false) ||
        meta.label.toLowerCase().includes(q)
      )
    })
  }, [entries, searchQuery])

  if (!mounted || (!activityInitialized && activityLoading)) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
        <Loader2 className="w-8 h-8 mb-3 animate-spin text-cyan-600" />
        <p className="text-sm font-medium">جاري تحميل العمليات...</p>
      </div>
    )
  }

  if (entries.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center text-muted-foreground">
        <Clock className="w-10 h-10 mb-3 opacity-25" />
        <p className="text-sm font-medium dark:text-slate-300">لا توجد عمليات بعد</p>
        <p className="text-xs mt-1">ستظهر هنا بعد استخدام أي أداة</p>
      </div>
    )
  }

  if (filteredEntries.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center text-muted-foreground">
        <Search className="w-9 h-9 mb-3 opacity-25" />
        <p className="text-sm font-medium dark:text-slate-300">لا توجد نتائج للبحث</p>
        <p className="text-xs mt-1">جرّب كلمات أخرى</p>
      </div>
    )
  }

  return (
    <div className="space-y-2 max-h-[min(60dvh,560px)] overflow-y-auto custom-scrollbar pr-0.5">
      {filteredEntries.map((entry) => {
        const meta = TOOL_META[entry.tool]
        const Icon = meta.icon
        const href =
          entry.tool === "excel-extractor"
            ? entry.attachmentId
              ? `/excel-extractor?fileId=${entry.attachmentId}`
              : "/excel-extractor?from=history"
            : meta.href
        return (
          <div key={entry.id} className="relative group">
            <Link
              href={href}
              className="flex items-start gap-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-transparent hover:border-slate-200 dark:hover:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <div className="w-10 h-10 rounded-xl bg-white dark:bg-slate-900 border dark:border-slate-700 flex items-center justify-center shrink-0 shadow-sm">
                <Icon className={cn("w-5 h-5", meta.color)} />
              </div>
              <div className="flex-1 min-w-0 space-y-1">
                <p className="text-sm font-semibold dark:text-white leading-snug truncate">
                  {entry.label}
                </p>
                {entry.detail && (
                  <p className="text-xs text-muted-foreground truncate">{entry.detail}</p>
                )}
                <div className="flex items-center gap-2 flex-wrap">
                  <span
                    className={cn(
                      "text-[10px] font-bold px-2 py-0.5 rounded-full",
                      "bg-cyan-100 text-cyan-700 dark:bg-cyan-500/20 dark:text-cyan-300",
                    )}
                  >
                    {meta.label}
                  </span>
                  <span className="text-[10px] text-muted-foreground">
                    {formatRelative(entry.at)}
                  </span>
                </div>
              </div>
              <div className="w-6 shrink-0" />
            </Link>
            <button
              type="button"
              onClick={() => remove(entry.id)}
              className="absolute top-3 left-3 opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded-lg text-muted-foreground hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10"
              aria-label="إزالة"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )
      })}
    </div>
  )
}

export default function PortalPage() {
  const { entries, clear, isLoading: activityLoading, isInitialized: activityInitialized } =
    useActivityStore()
  const [mounted, setMounted] = useState(false)
  const [activitySearch, setActivitySearch] = useState("")

  useEffect(() => {
    setMounted(true)
  }, [])
  useActivitySync()

  const activityHeaderAction =
    mounted && entries.length > 0 ? (
      <div className="flex items-center gap-2 shrink-0">
        <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-cyan-100 text-cyan-700 dark:bg-cyan-500/20 dark:text-cyan-300">
          {entries.length}
        </span>
        <Button
          type="button"
          variant="ghost"
          onClick={clear}
          className="h-8 gap-1.5 text-xs text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-500/10 px-3"
        >
          <Trash2 className="w-3.5 h-3.5" />
          مسح
        </Button>
      </div>
    ) : null

  return (
    <div className="w-full space-y-4 sm:space-y-6">
      <Panel title="الأدوات المتاحة" icon={LayoutGrid}>
        <ToolsGrid />
      </Panel>
      <Panel title="العمليات الأخيرة" icon={Clock} action={activityHeaderAction}>
        <div className="space-y-3">
          <ActivitySearch value={activitySearch} onChange={setActivitySearch} />
          <ActivityList
            mounted={mounted}
            activityInitialized={activityInitialized}
            activityLoading={activityLoading}
            searchQuery={activitySearch}
          />
        </div>
      </Panel>
    </div>
  )
}
