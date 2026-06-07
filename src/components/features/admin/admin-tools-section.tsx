"use client"

import { useEffect, useState } from "react"
import { Loader2, LayoutGrid } from "lucide-react"
import { toast } from "sonner"
import { Switch } from "@/components/ui/switch"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { TOOL_DEFINITIONS, type ToolSlug } from "@/lib/tools/registry"
import { defaultToolsEnabledMap } from "@/lib/tools/defaults"
import apiClient from "@/lib/axiosClients"
import { getApiErrorMessage } from "@/lib/apiErrors"

type ToolRow = {
  slug: ToolSlug
  labelAr: string
  enabled: boolean
}

type AdminToolsSectionProps = {
  onSaved?: () => void
}

function parseToolsPayload(data: unknown): ToolRow[] {
  const body = data as { data?: { tools?: ToolRow[] }; tools?: ToolRow[] }
  const payload = body.data ?? body
  return Array.isArray(payload.tools) ? payload.tools : []
}

export function AdminToolsSection({ onSaved }: AdminToolsSectionProps) {
  const [loading, setLoading] = useState(true)
  const [savingSlug, setSavingSlug] = useState<ToolSlug | null>(null)
  const [enabledBySlug, setEnabledBySlug] = useState<Record<ToolSlug, boolean>>(defaultToolsEnabledMap())

  async function load() {
    setLoading(true)
    try {
      const res = await apiClient.get("/admin/system/tools")
      const rows = parseToolsPayload(res.data)
      const next = defaultToolsEnabledMap()
      for (const row of rows) {
        if (row.slug in next) next[row.slug] = Boolean(row.enabled)
      }
      setEnabledBySlug(next)
    } catch (error) {
      toast.error(getApiErrorMessage(error, "تعذر تحميل حالة الأدوات"))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void load()
  }, [])

  async function toggleTool(slug: ToolSlug, enabled: boolean) {
    setSavingSlug(slug)
    const previous = { ...enabledBySlug }
    const next = { ...enabledBySlug, [slug]: enabled }
    setEnabledBySlug(next)

    try {
      await apiClient.put("/admin/system/tools", { tools: next })
      toast.success(enabled ? "تم تفعيل الأداة" : "تم تعطيل الأداة")
      onSaved?.()
      await load()
    } catch (error) {
      setEnabledBySlug(previous)
      toast.error(getApiErrorMessage(error, "فشل تحديث حالة الأداة"))
    } finally {
      setSavingSlug(null)
    }
  }

  return (
    <Card className="rounded-2xl border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm">
      <CardHeader>
        <CardTitle className="text-base flex items-center gap-2">
          <LayoutGrid className="w-4 h-4 text-primary" />
          تفعيل الأدوات
        </CardTitle>
        <CardDescription>
          الأدوات المعطّلة تختفي من القائمة والصفحة الرئيسية. يمكن للمشرف فتحها مباشرة عبر الرابط للاختبار.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        {loading ? (
          <div className="flex items-center gap-2 text-muted-foreground text-sm">
            <Loader2 className="w-4 h-4 animate-spin" />
            جاري تحميل الأدوات...
          </div>
        ) : (
          TOOL_DEFINITIONS.map((tool) => {
            const enabled = enabledBySlug[tool.slug]
            const busy = savingSlug === tool.slug
            return (
              <div
                key={tool.slug}
                className="flex items-center justify-between gap-3 border rounded-xl p-3"
              >
                <div className="min-w-0">
                  <p className="font-medium text-sm">{tool.title}</p>
                  <p className="text-xs text-muted-foreground truncate">{tool.description}</p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <span className="text-xs text-muted-foreground">
                    {enabled ? "مفعّلة" : "معطّلة"}
                  </span>
                  <Switch
                    checked={enabled}
                    disabled={busy}
                    onCheckedChange={(checked) => void toggleTool(tool.slug, checked)}
                    aria-label={`${enabled ? "تعطيل" : "تفعيل"} ${tool.title}`}
                  />
                </div>
              </div>
            )
          })
        )}
      </CardContent>
    </Card>
  )
}
