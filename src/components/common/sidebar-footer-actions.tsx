"use client"

import { LogOut } from "lucide-react"
import { motion } from "motion/react"
import { Button, cn } from "myui"
import { ThemeToggleButton } from "@/components/myui/theme-toggle-button"

export function SidebarFooterActions({
  expanded,
  onLogout,
}: {
  expanded: boolean
  onLogout: () => void
}) {
  return (
    <div className="flex flex-col gap-2">
      <ThemeToggleButton expanded={expanded} />
      <motion.div whileTap={{ scale: 0.98 }}>
      <Button
        type="button"
        variant="ghost"
        onClick={onLogout}
        className={cn(
          "w-full justify-start text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-xl px-4 py-2.5 h-auto",
          !expanded && "justify-center px-2",
        )}
      >
        <LogOut className="w-4 h-4 shrink-0" />
        {expanded && <span className="mr-3 font-bold text-sm">تسجيل الخروج</span>}
      </Button>
      </motion.div>
    </div>
  )
}
