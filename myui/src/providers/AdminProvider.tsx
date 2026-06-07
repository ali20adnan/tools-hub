import React, { useEffect } from "react"
import { ThemeProvider } from "next-themes"
import { Toaster } from "sonner"
import { SiteConfigProvider } from "../context/site-config-context"
import { setApiBase } from "../lib/api"
import type { SiteConfig } from "../context/site-config-context"

export interface AdminProviderProps {
  children: React.ReactNode
  /** API origin prefix, e.g. "" (same host) or "https://api.myapp.com" */
  apiBaseUrl?: string
  /** Skip loading config from /api/config (useful for Storybook or offline demos) */
  skipRemoteConfig?: boolean
  /** Override default site config template */
  initialConfig?: Partial<SiteConfig>
  /** Custom loading message while config loads */
  loadingMessage?: string
  defaultTheme?: "light" | "dark" | "system"
}

export function AdminProvider({
  children,
  apiBaseUrl = "",
  skipRemoteConfig = false,
  initialConfig,
  loadingMessage,
  defaultTheme = "system",
}: AdminProviderProps) {
  useEffect(() => {
    setApiBase(apiBaseUrl)
  }, [apiBaseUrl])

  return (
    <ThemeProvider attribute="class" defaultTheme={defaultTheme} enableSystem>
      <SiteConfigProvider
        skipRemoteLoad={skipRemoteConfig}
        initialConfig={initialConfig}
        loadingMessage={loadingMessage}
      >
        {children}
        <Toaster richColors position="top-center" />
      </SiteConfigProvider>
    </ThemeProvider>
  )
}
