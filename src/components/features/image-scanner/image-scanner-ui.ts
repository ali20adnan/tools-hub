import { myui } from "@/components/myui/myui-styles"

export const subPanelClass =
  "rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/25 overflow-hidden"

export const fieldClass =
  "rounded-xl bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 focus-visible:ring-cyan-500/20 focus-visible:border-cyan-500"

export const viewerFrameClass =
  "relative w-full min-h-[280px] sm:min-h-[360px] lg:min-h-[420px] rounded-xl border border-dashed border-slate-300 dark:border-slate-600 bg-slate-50/80 dark:bg-slate-900/50 overflow-hidden touch-none"

export const pillBtn = (active: boolean) =>
  active
    ? "border-cyan-500/40 bg-cyan-50 dark:bg-cyan-950/30 text-cyan-700 dark:text-cyan-300"
    : "border-slate-200 dark:border-slate-700 text-muted-foreground hover:bg-white dark:hover:bg-slate-900"

export const subPanelHeader = myui.cardHeader + " border-b border-slate-100 dark:border-slate-800"

/** أزرار بعرض كامل — تجنّب ضغط myui Button في الشريط الجانبي الضيق */
export const actionBtnBase =
  "w-full min-h-11 inline-flex items-center justify-center gap-2.5 rounded-xl px-4 py-2.5 text-sm font-medium transition-colors disabled:opacity-50 disabled:pointer-events-none"

export const actionBtnGhost =
  actionBtnBase +
  " border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900/80 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800"

export const actionBtnPrimary =
  actionBtnBase +
  " border-0 bg-cyan-600 text-white hover:bg-cyan-700 shadow-sm shadow-cyan-500/20 font-semibold"
