"use client"

import { motion } from "motion/react"
import { myuiMotion } from "./myui-motion"

/** غلاف محتوى الصفحة — يتحرك عند تغيير المسار أو التبويب */
export function MyuiPageContent({
  children,
  contentKey,
  className,
}: {
  children: React.ReactNode
  contentKey?: string
  className?: string
}) {
  return (
    <motion.div
      key={contentKey}
      initial={myuiMotion.page.initial}
      animate={myuiMotion.page.animate}
      exit={myuiMotion.page.exit}
      transition={myuiMotion.page.transition}
      className={className}
    >
      {children}
    </motion.div>
  )
}
