import * as React from "react"

import { cn } from "@/lib/utils"

function Textarea({ className, ...props }: React.ComponentProps<"textarea">) {
  return (
    <textarea
      data-slot="textarea"
      className={cn(
        "flex field-sizing-content min-h-16 w-full rounded-md border px-3 py-2 text-base shadow-sm transition-[color,box-shadow] outline-none md:text-sm",
        "bg-white text-foreground border-slate-200",
        "dark:bg-slate-800 dark:border-slate-600 dark:text-slate-100",
        "placeholder:text-muted-foreground focus-visible:border-cyan-600 focus-visible:ring-2 focus-visible:ring-cyan-500/25 dark:focus-visible:border-cyan-500",
        "aria-invalid:border-destructive aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40",
        "disabled:cursor-not-allowed disabled:opacity-50",
        className
      )}
      {...props}
    />
  )
}

export { Textarea }
