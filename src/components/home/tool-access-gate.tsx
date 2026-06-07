"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Loader2, ShieldOff } from "lucide-react"
import { Button } from "@/components/ui/button"
import { pathnameToToolSlug } from "@/lib/tools/registry"
import { useToolsAvailability } from "@/context/tools-availability-context"
import { useAuthStore } from "@/store/auth/authStore"

export function ToolAccessGate({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const { loading, isToolEnabled } = useToolsAvailability()
  const user = useAuthStore((s) => s.user)
  const isAdmin = user?.role?.toLowerCase() === "admin"

  const slug = pathnameToToolSlug(pathname)

  if (!slug) {
    return <>{children}</>
  }

  if (loading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center text-muted-foreground">
        <Loader2 className="w-6 h-6 animate-spin text-cyan-600" />
      </div>
    )
  }

  if (!isToolEnabled(slug) && !isAdmin) {
    return (
      <div className="flex min-h-[50vh] flex-col items-center justify-center gap-4 px-4 text-center">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-500/10">
          <ShieldOff className="h-7 w-7 text-amber-600 dark:text-amber-400" />
        </div>
        <div className="space-y-1 max-w-md">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
            هذه الأداة غير متاحة حالياً
          </h2>
          <p className="text-sm text-muted-foreground">
            تم تعطيلها من لوحة الأدمن. تواصل مع المشرف إذا كنت تحتاجها.
          </p>
        </div>
        <Button asChild>
          <Link href="/">العودة للرئيسية</Link>
        </Button>
      </div>
    )
  }

  return <>{children}</>
}
