/** أنماط موحّدة مع لوحة myui (slate + cyan + rounded-2xl) */
export const myui = {
  main: "w-full space-y-4 sm:space-y-5",
  card: "bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden",
  cardHeader:
    "flex items-center justify-between gap-2 px-3 sm:px-5 py-3 sm:py-4 border-b border-slate-100 dark:border-slate-800",
  cardBody: "p-3 sm:p-5",
  toolbar:
    "flex flex-wrap items-center gap-2 sm:gap-3 p-3 sm:px-5 sm:py-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm",
  tabsList:
    "flex w-full h-auto p-1 gap-1 rounded-xl bg-slate-100 dark:bg-slate-800/80 border-0",
  tabTrigger:
    "flex-1 min-w-0 rounded-lg !border-0 shadow-none text-xs sm:text-sm font-medium py-2.5 sm:py-2 min-h-[44px] sm:min-h-9 data-[state=active]:bg-white data-[state=active]:text-cyan-700 dark:data-[state=active]:bg-slate-900 dark:data-[state=active]:text-cyan-300",
  uploadZone:
    "border-2 border-dashed rounded-2xl p-8 sm:p-10 flex flex-col items-center gap-3 cursor-pointer transition-colors border-slate-200 dark:border-slate-700 hover:border-cyan-500/50 hover:bg-cyan-50/30 dark:hover:bg-cyan-950/20",
  tableWrap:
    "flex flex-col w-full min-w-0 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden bg-white dark:bg-slate-900",
  tableScroll:
    "overflow-auto max-h-[520px] w-full min-w-0 custom-scrollbar",
  tableBar:
    "flex items-center justify-between text-xs px-4 py-2.5 border-b border-slate-100 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-800/40 text-muted-foreground",
  tableFooter:
    "text-xs text-center text-muted-foreground px-4 py-2.5 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30",
  badge:
    "text-[10px] sm:text-xs font-bold px-2 py-0.5 rounded-full bg-cyan-100 text-cyan-700 dark:bg-cyan-500/20 dark:text-cyan-300",
  iconBox:
    "w-9 h-9 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center shrink-0",
  sectionTitle: "text-sm font-bold dark:text-white",
} as const
