"use client"

import { Moon, Sun } from "lucide-react"
import { cn } from "myui"
import { useTheme } from "@/context/theme-context"

export function ThemeToggleButton({
  expanded = true,
  className,
}: {
  expanded?: boolean
  className?: string
}) {
  const { mounted, isDark, toggleTheme } = useTheme()

  const label = !mounted ? "المظهر" : isDark ? "وضع فاتح" : "وضع داكن"

  return (
    <button
      type="button"
      onClick={toggleTheme}
      disabled={!mounted}
      aria-label={label}
      className={cn(
        "relative w-full flex items-center overflow-hidden",
        "text-slate-600 dark:text-slate-300",
        "hover:bg-slate-100 dark:hover:bg-slate-800",
        "rounded-xl px-4 py-2.5 h-auto",
        "active:scale-[0.98]",
        !expanded && "justify-center px-2",
        className,
      )}
    >
      <span className="relative flex h-4 w-4 shrink-0 items-center justify-center">
        {!mounted ? (
          <Sun className="h-4 w-4 opacity-45" />
        ) : isDark ? (
          <Sun className="h-4 w-4 text-amber-400" />
        ) : (
          <Moon className="h-4 w-4 text-cyan-600 dark:text-cyan-400" />
        )}
      </span>

      {expanded && (
        <span className="mr-3 font-bold text-sm truncate">{label}</span>
      )}
    </button>
  )
}
