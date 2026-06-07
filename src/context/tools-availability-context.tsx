"use client"

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react"
import apiClient from "@/lib/axiosClients"
import { useAuthStore } from "@/store/auth/authStore"
import { defaultToolsEnabledMap } from "@/lib/tools/defaults"
import type { ToolSlug } from "@/lib/tools/registry"

type ToolAvailabilityRow = {
  slug: ToolSlug
  labelAr: string
  enabled: boolean
}

type ToolsAvailabilityContextValue = {
  loading: boolean
  enabledBySlug: Record<ToolSlug, boolean>
  isToolEnabled: (slug: ToolSlug) => boolean
  refresh: () => Promise<void>
}

const ToolsAvailabilityContext = createContext<ToolsAvailabilityContextValue | null>(null)

function parseToolsResponse(data: unknown): ToolAvailabilityRow[] {
  const body = data as { data?: { tools?: ToolAvailabilityRow[] }; tools?: ToolAvailabilityRow[] }
  const payload = body.data ?? body
  return Array.isArray(payload.tools) ? payload.tools : []
}

export function ToolsAvailabilityProvider({ children }: { children: ReactNode }) {
  const user = useAuthStore((s) => s.user)
  const authLoading = useAuthStore((s) => s.isLoading)
  const [loading, setLoading] = useState(true)
  const [enabledBySlug, setEnabledBySlug] = useState<Record<ToolSlug, boolean>>(defaultToolsEnabledMap())

  const refresh = useCallback(async () => {
    if (!user) {
      setEnabledBySlug(defaultToolsEnabledMap())
      setLoading(false)
      return
    }

    setLoading(true)
    try {
      const res = await apiClient.get("/system/tools")
      const rows = parseToolsResponse(res.data)
      const next = defaultToolsEnabledMap()
      for (const row of rows) {
        if (row.slug in next) {
          next[row.slug as ToolSlug] = Boolean(row.enabled)
        }
      }
      setEnabledBySlug(next)
    } catch {
      setEnabledBySlug(defaultToolsEnabledMap())
    } finally {
      setLoading(false)
    }
  }, [user])

  useEffect(() => {
    if (authLoading) return
    void refresh()
  }, [authLoading, refresh])

  const isToolEnabled = useCallback(
    (slug: ToolSlug) => Boolean(enabledBySlug[slug]),
    [enabledBySlug],
  )

  const value = useMemo(
    () => ({ loading, enabledBySlug, isToolEnabled, refresh }),
    [loading, enabledBySlug, isToolEnabled, refresh],
  )

  return (
    <ToolsAvailabilityContext.Provider value={value}>
      {children}
    </ToolsAvailabilityContext.Provider>
  )
}

export function useToolsAvailability() {
  const ctx = useContext(ToolsAvailabilityContext)
  if (!ctx) {
    throw new Error("useToolsAvailability must be used within ToolsAvailabilityProvider")
  }
  return ctx
}
