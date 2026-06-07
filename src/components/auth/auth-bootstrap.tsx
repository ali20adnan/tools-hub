"use client"

import { useEffect } from "react"
import apiClient from "@/lib/axiosClients"
import { getAuthEndpoint } from "@/lib/auth-endpoints"
import { tokenManager } from "@/lib/tokenManager"
import { useAuthStore } from "@/store/auth/authStore"
import type { User } from "@/store/auth/authTypes"

/**
 * Rehydrates the authenticated user from the API on load.
 * Auth state is not persisted in the browser — only the token cookie is,
 * so the user object is fetched from /auth/me whenever a token is present.
 */
export function AuthBootstrap() {
  const setUser = useAuthStore((s) => s.setUser)
  const clearAuth = useAuthStore((s) => s.clearAuth)
  const setLoading = useAuthStore((s) => s.setLoading)

  useEffect(() => {
    if (!tokenManager.hasToken()) {
      clearAuth()
      return
    }
    let active = true
    const run = async () => {
      setLoading(true)
      try {
        const res = await apiClient.get(getAuthEndpoint("me"))
        const data = res.data as { data?: User } | User
        const resolved = (data as { data?: User })?.data ?? (data as User)
        if (active && resolved) setUser(resolved)
      } catch {
        if (active) clearAuth()
      } finally {
        if (active) setLoading(false)
      }
    }
    void run()
    return () => {
      active = false
    }
  }, [clearAuth, setLoading, setUser])

  return null
}
