"use client"

import { useEffect, useState } from "react"
import { Loader2 } from "lucide-react"
import apiClient from "@/lib/axiosClients"
import { useAuthStore } from "@/store/auth/authStore"
import { MaintenanceView } from "@/components/home/maintenance-view"

export function MaintenanceGate({ children }: { children: React.ReactNode }) {
  const user = useAuthStore((s) => s.user)
  const isAdmin = user?.role?.toLowerCase() === "admin"
  const [checking, setChecking] = useState(true)
  const [maintenanceEnabled, setMaintenanceEnabled] = useState(false)

  useEffect(() => {
    let active = true

    async function load() {
      try {
        const res = await apiClient.get("/admin/system/maintenance")
        const body = res.data as { data?: { enabled?: boolean }; enabled?: boolean }
        const payload = body.data ?? body
        if (active) {
          setMaintenanceEnabled(Boolean(payload.enabled))
        }
      } catch {
        if (active) setMaintenanceEnabled(false)
      } finally {
        if (active) setChecking(false)
      }
    }

    void load()
    return () => {
      active = false
    }
  }, [])

  if (checking) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center text-muted-foreground">
        <Loader2 className="w-6 h-6 animate-spin text-cyan-600" />
      </div>
    )
  }

  if (maintenanceEnabled && !isAdmin) {
    return <MaintenanceView />
  }

  return <>{children}</>
}
