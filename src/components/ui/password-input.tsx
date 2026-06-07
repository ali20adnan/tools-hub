"use client"

import { useState } from "react"
import { Eye, EyeOff } from "lucide-react"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"

export function PasswordInput({
  className,
  ...props
}: React.ComponentProps<typeof Input>) {
  const [show, setShow] = useState(false)

  return (
    <div className="relative">
      <Input
        type={show ? "text" : "password"}
        className={cn("pe-10", className)}
        {...props}
      />
      <button
        type="button"
        tabIndex={-1}
        onClick={() => setShow((v) => !v)}
        className="absolute inset-y-0 end-0 flex items-center px-3 text-muted-foreground hover:text-cyan-600 dark:hover:text-cyan-400 transition-colors"
        aria-label={show ? "إخفاء كلمة المرور" : "إظهار كلمة المرور"}
      >
        {show ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
      </button>
    </div>
  )
}
