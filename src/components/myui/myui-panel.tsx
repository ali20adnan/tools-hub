"use client"

import { motion } from "motion/react"
import { cn } from "myui"
import { myui } from "./myui-styles"
import { myuiMotion } from "./myui-motion"

export function MyuiPanel({
  title,
  icon: Icon,
  action,
  children,
  className,
  bodyClassName,
}: {
  title?: string
  icon?: React.ComponentType<{ className?: string }>
  action?: React.ReactNode
  children: React.ReactNode
  className?: string
  bodyClassName?: string
}) {
  return (
    <motion.section
      initial={myuiMotion.panel.initial}
      animate={myuiMotion.panel.animate}
      transition={myuiMotion.panel.transition}
      className={cn(myui.card, className)}
    >
      {(title || action) && (
        <div className={myui.cardHeader}>
          <div className="flex items-center gap-2.5 min-w-0">
            {Icon && (
              <div className="w-9 h-9 rounded-xl bg-cyan-600/10 flex items-center justify-center shrink-0">
                <Icon className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />
              </div>
            )}
            {title && (
              <h2 className={cn(myui.sectionTitle, "truncate")}>{title}</h2>
            )}
          </div>
          {action}
        </div>
      )}
      <div className={cn(!title && !action ? "p-3 sm:p-5" : myui.cardBody, bodyClassName)}>
        {children}
      </div>
    </motion.section>
  )
}
