"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { motion, AnimatePresence } from "motion/react"
import {
  LayoutDashboard,
  ExternalLink,
  Menu,
  X,
  Users,
} from "lucide-react"
import { Button, cn } from "myui"
import { useAuthStore } from "@/store/auth/authStore"
import { logoutAndRedirect } from "@/lib/auth-client"
import { useLocale } from "@/context/locale-context"
import { SidebarFooterActions } from "@/components/common/sidebar-footer-actions"
import { MyuiNavItem } from "./myui-nav-item"
import { MyuiPageContent } from "./myui-page-content"
import { myuiEase, myuiMotion } from "./myui-motion"

export type MyuiNavConfig = {
  key: string
  label: string
  icon: React.ComponentType<{ className?: string }>
  href?: string
  onClick?: () => void
  badge?: string
}

export function MyuiDashboardLayout({
  children,
  navItems,
  pageTitle,
  pageSubtitle,
  activeKey,
  brandTitle = "مركز الأدوات",
}: {
  children: React.ReactNode
  navItems: MyuiNavConfig[]
  pageTitle: string
  pageSubtitle?: string
  activeKey?: string
  brandTitle?: string
}) {
  const router = useRouter()
  const user = useAuthStore((s) => s.user)
  const clearAuth = useAuthStore((s) => s.clearAuth)
  const { dir, t } = useLocale()
  const [isSidebarOpen, setIsSidebarOpen] = useState(true)

  async function handleLogout() {
    await logoutAndRedirect({ clearAuth, router })
  }

  return (
    <div
      dir={dir}
      className="theme-surface h-screen bg-slate-50 dark:bg-[#06080a] flex flex-row overflow-hidden font-cairo"
    >
      <AnimatePresence>
        {isSidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsSidebarOpen(false)}
            className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          />
        )}
      </AnimatePresence>

      {/* Sidebar — يمين الشاشة (RTL) */}
      <aside
        dir={dir}
        className={cn(
          "fixed lg:sticky top-0 right-0 z-50 h-screen shrink-0 transition-[width,transform] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]",
          "bg-white dark:bg-slate-900 flex flex-col shadow-xl lg:shadow-none",
          "border-l border-slate-200 dark:border-slate-800",
          isSidebarOpen
            ? "w-72 translate-x-0"
            : "w-72 lg:w-20 max-lg:translate-x-full lg:translate-x-0",
        )}
      >
        <div className="flex flex-col h-full w-full overflow-hidden">
          <div className="p-8 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-cyan-600 flex items-center justify-center shrink-0 shadow-lg shadow-cyan-500/20">
              <LayoutDashboard className="w-6 h-6 text-white" />
            </div>
            {isSidebarOpen && (
              <span className="font-bold text-xl dark:text-white truncate tracking-tight text-start">
                {brandTitle}
              </span>
            )}
          </div>

          <nav className="flex-1 px-4 space-y-2 mt-2 overflow-y-auto custom-scrollbar [scrollbar-gutter:stable]">
            <Link
              href="/"
              className={cn(
                "mb-3 flex items-center gap-2 rounded-xl px-3 py-2.5 text-sm font-medium text-start text-muted-foreground transition-colors hover:bg-slate-100 hover:text-foreground dark:hover:bg-slate-800 dark:hover:text-white",
                !isSidebarOpen && "justify-center px-2",
              )}
            >
              <ExternalLink className="h-4 w-4 shrink-0 opacity-70" />
              {isSidebarOpen && t("nav.publicSite")}
            </Link>

            {navItems.map((item) => {
              const Icon = item.icon
              const handleClick = () => {
                if (item.onClick) item.onClick()
                if (item.href) router.push(item.href)
              }
              return (
                <MyuiNavItem
                  key={item.key}
                  icon={Icon as never}
                  label={item.label}
                  isActive={activeKey === item.key}
                  onClick={handleClick}
                  isOpen={isSidebarOpen}
                  badge={item.badge}
                />
              )
            })}
          </nav>

          <div className="mt-auto p-3 border-t border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
            <div
              className={cn(
                "flex items-center gap-3 p-2 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm mb-2",
                !isSidebarOpen && "justify-center",
              )}
            >
              <div className="w-8 h-8 rounded-full bg-cyan-100 dark:bg-cyan-900/30 flex items-center justify-center shrink-0 border-2 border-white dark:border-slate-700">
                <Users className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />
              </div>
              {isSidebarOpen && (
                <div className="flex-1 min-w-0 text-start">
                  <p className="text-sm font-bold dark:text-white truncate">
                    {user?.fullName ?? t("nav.user")}
                  </p>
                  <p className="text-[10px] text-muted-foreground truncate uppercase font-semibold">
                    {user?.role ?? "—"}
                  </p>
                </div>
              )}
            </div>

            <SidebarFooterActions
              expanded={isSidebarOpen}
              onLogout={handleLogout}
            />
          </div>
        </div>
      </aside>

      <main dir={dir} className="flex-1 min-w-0 overflow-y-auto custom-scrollbar bg-slate-50 dark:bg-[#06080a]">
        <header className="h-20 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-4 sm:px-6 lg:px-8 flex items-center sticky top-0 z-30">
          <div className="flex items-center gap-4 min-w-0 flex-1">
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="shrink-0"
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            >
              {isSidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </Button>
            <div className="min-w-0 hidden sm:block text-start overflow-hidden">
              <AnimatePresence mode="wait">
                <motion.div
                  key={`${pageTitle}-${pageSubtitle ?? ""}`}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -4 }}
                  transition={{ duration: 0.22, ease: myuiEase }}
                >
                  <h1 className="text-lg font-bold dark:text-white truncate">{pageTitle}</h1>
                  {pageSubtitle && (
                    <p className="text-xs text-muted-foreground truncate">{pageSubtitle}</p>
                  )}
                </motion.div>
              </AnimatePresence>
            </div>
          </div>
        </header>

        <div className="p-4 sm:p-6 lg:p-8 text-start w-full">
          <MyuiPageContent contentKey={activeKey ?? pageTitle} className="w-full">
            {children}
          </MyuiPageContent>
        </div>
      </main>
    </div>
  )
}
