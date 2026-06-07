"use client"

import Link from "next/link"
import { motion } from "motion/react"
import type { LucideIcon } from "lucide-react"
import { cn } from "myui"
import { myuiMotion } from "./myui-motion"

const itemClass = (isActive: boolean, isOpen: boolean) =>
  cn(
    "relative w-full flex items-center text-start rounded-xl transition-colors duration-200",
    isOpen ? "px-4 py-3 gap-3" : "p-3 justify-center",
    isActive
      ? "text-white"
      : "text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 dark:text-slate-400",
  )

const tapHover = {
  whileHover: { scale: 1.02 },
  whileTap: { scale: 0.97 },
  transition: myuiMotion.spring,
}

function NavItemContent({
  icon: Icon,
  label,
  isActive,
  isOpen,
  badge,
}: {
  icon: LucideIcon
  label: string
  isActive: boolean
  isOpen: boolean
  badge?: string
}) {
  return (
    <>
      <Icon className="w-5 h-5 shrink-0" />
      {isOpen && (
        <div className="flex-1 flex items-center justify-between min-w-0">
          <span className="font-medium truncate">{label}</span>
          {badge && (
            <span
              className={cn(
                "text-[10px] font-bold px-2 py-0.5 rounded-full",
                isActive
                  ? "bg-white/20 text-white"
                  : "bg-cyan-100 text-cyan-600 dark:bg-cyan-500/20 dark:text-cyan-400",
              )}
            >
              {badge}
            </span>
          )}
        </div>
      )}
    </>
  )
}

export function MyuiNavItem({
  icon,
  label,
  isActive,
  onClick,
  isOpen,
  badge,
  href,
}: {
  icon: LucideIcon
  label: string
  isActive: boolean
  onClick?: () => void
  isOpen: boolean
  badge?: string
  href?: string
}) {
  const className = itemClass(isActive, isOpen)

  const content = (
    <>
      {isActive && (
        <motion.span
          layoutId="myui-nav-active"
          className="absolute inset-0 rounded-xl bg-cyan-600 shadow-lg shadow-cyan-500/20"
          transition={myuiMotion.spring}
        />
      )}
      <span
        className={cn(
          "relative z-[1] flex w-full items-center",
          isOpen ? "gap-3" : "justify-center",
        )}
      >
        <NavItemContent icon={icon} label={label} isActive={isActive} isOpen={isOpen} badge={badge} />
      </span>
    </>
  )

  if (href) {
    return (
      <motion.div {...tapHover}>
        <Link href={href} prefetch className={className} onClick={onClick}>
          {content}
        </Link>
      </motion.div>
    )
  }

  return (
    <motion.button type="button" onClick={onClick} className={className} {...tapHover}>
      {content}
    </motion.button>
  )
}
