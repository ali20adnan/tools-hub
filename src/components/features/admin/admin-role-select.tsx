"use client"

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { cn } from "myui"

export const ADMIN_ROLE_OPTIONS = [
  { value: "user", label: "مستخدم" },
  { value: "admin", label: "مدير" },
] as const

export type AdminRoleValue = (typeof ADMIN_ROLE_OPTIONS)[number]["value"]

const fieldClass =
  "h-11 rounded-xl bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 focus:ring-cyan-500/20 focus-visible:border-cyan-500"

export function AdminRoleSelect({
  value,
  onValueChange,
  className,
  disabled,
}: {
  value: string
  onValueChange: (value: AdminRoleValue) => void
  className?: string
  disabled?: boolean
}) {
  const normalized = value?.toLowerCase() || "user"
  const safeValue = ADMIN_ROLE_OPTIONS.some((o) => o.value === normalized)
    ? normalized
    : "user"

  return (
    <Select
      value={safeValue}
      onValueChange={(v) => onValueChange(v as AdminRoleValue)}
      disabled={disabled}
    >
      <SelectTrigger className={cn(fieldClass, className)}>
        <SelectValue placeholder="اختر الدور" />
      </SelectTrigger>
      <SelectContent>
        {ADMIN_ROLE_OPTIONS.map((option) => (
          <SelectItem key={option.value} value={option.value}>
            {option.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}
