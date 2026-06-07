"use client"

import { usePathname } from "next/navigation"
import { LayoutGrid, ShieldCheck } from "lucide-react"
import { MyuiDashboardLayout } from "@/components/myui/myui-dashboard-layout"
import { useAuthStore } from "@/store/auth/authStore"
import { useLocale } from "@/context/locale-context"
import { useToolsAvailability } from "@/context/tools-availability-context"
import { TOOL_DEFINITIONS } from "@/lib/tools/registry"

function resolveActiveKey(pathname: string): string {
  if (pathname.startsWith("/admin-dashboard")) return "admin"
  if (pathname.startsWith("/excel-extractor")) return "excel-extractor"
  if (pathname.startsWith("/duplicate-detector")) return "duplicate-detector"
  if (pathname.startsWith("/excel-merger")) return "excel-merger"
  if (pathname.startsWith("/excel-compare")) return "excel-compare"
  if (pathname.startsWith("/image-scanner")) return "image-scanner"
  if (pathname === "/") return "home"
  return "home"
}

const PAGE_PATHS = [
  "/",
  "/excel-extractor",
  "/duplicate-detector",
  "/excel-merger",
  "/excel-compare",
  "/image-scanner",
  "/admin-dashboard",
] as const

export function HomeChrome({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const user = useAuthStore((s) => s.user)
  const { t } = useLocale()
  const { isToolEnabled, loading: toolsLoading } = useToolsAvailability()
  const isAdmin = user?.role?.toLowerCase() === "admin"

  if (pathname.startsWith("/admin-dashboard")) {
    return <>{children}</>
  }

  const pathKey = PAGE_PATHS.find((p) => pathname.startsWith(p)) ?? "/"
  const pageMetaKey =
    pathKey === "/"
      ? "pages.home"
      : pathKey === "/excel-extractor"
        ? "pages.excelExtractor"
        : pathKey === "/duplicate-detector"
          ? "pages.duplicateDetector"
          : pathKey === "/excel-merger"
            ? "pages.excelMerger"
            : pathKey === "/excel-compare"
              ? "pages.excelCompare"
              : pathKey === "/image-scanner"
                ? "pages.imageScanner"
                : "pages.fallbackTitle"

  const navItems = [
    { key: "home", label: t("nav.home"), icon: LayoutGrid, href: "/" },
    ...(!toolsLoading
      ? TOOL_DEFINITIONS.filter((tool) => isToolEnabled(tool.slug))
      : []
    ).map((tool) => ({
      key: tool.slug,
      label: tool.navLabelKey ? t(tool.navLabelKey) : tool.title,
      icon: tool.icon,
      href: tool.href,
    })),
    ...(isAdmin
      ? [{ key: "admin", label: t("nav.admin"), icon: ShieldCheck, href: "/admin-dashboard" }]
      : []),
  ]

  const title = t(`${pageMetaKey}.title`)
  const subtitle =
    pageMetaKey === "pages.fallbackTitle" ? undefined : t(`${pageMetaKey}.subtitle`)

  return (
    <MyuiDashboardLayout
      navItems={navItems}
      activeKey={resolveActiveKey(pathname)}
      pageTitle={title}
      pageSubtitle={subtitle}
      brandTitle={t("brand.title")}
    >
      {children}
    </MyuiDashboardLayout>
  )
}
