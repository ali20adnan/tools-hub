"use client"

import { Loader2, RefreshCw, Wifi, WifiOff } from "lucide-react"
import { Button, cn } from "myui"
import { myui } from "@/components/myui/myui-styles"
import type { DeviceConnectionState } from "@/hooks/image-scanner/deviceConnection"
import { subPanelClass } from "./image-scanner-ui"

export type DeviceConnectionLabels = {
  connected: string
  disconnected: string
  checking: string
  disconnectedHint: string
  checkingHint: string
  refreshTitle: string
  refreshAriaLabel: string
}

type DeviceConnectionStatusProps = {
  state: DeviceConnectionState
  lastCheckedAt: Date | null
  onRefresh: () => void
  labels: DeviceConnectionLabels
}

function formatCheckedAt(date: Date | null): string {
  if (!date) return ""
  return date.toLocaleTimeString("ar-SA", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  })
}

export function DeviceConnectionStatus({
  state,
  lastCheckedAt,
  onRefresh,
  labels,
}: DeviceConnectionStatusProps) {
  const isChecking = state === "checking"
  const connected = state === "connected"

  const label = connected
    ? labels.connected
    : state === "disconnected"
      ? labels.disconnected
      : labels.checking

  const hint = connected
    ? null
    : state === "disconnected"
      ? labels.disconnectedHint
      : labels.checkingHint

  const borderTone = connected
    ? "border-emerald-500/30 bg-emerald-50/50 dark:bg-emerald-950/20"
    : state === "disconnected"
      ? "border-amber-500/30 bg-amber-50/50 dark:bg-amber-950/20"
      : "border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900/50"

  return (
    <div className={cn(subPanelClass, borderTone)}>
      <div className="p-3 sm:p-4 flex items-start gap-3">
        <div
          className={cn(
            myui.iconBox,
            connected
              ? "bg-emerald-600/10"
              : state === "disconnected"
                ? "bg-amber-600/10"
                : "bg-cyan-600/10",
          )}
        >
          {isChecking ? (
            <Loader2 className="w-4 h-4 text-cyan-600 animate-spin" />
          ) : connected ? (
            <Wifi className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          ) : (
            <WifiOff className="w-4 h-4 text-amber-600 dark:text-amber-400" />
          )}
        </div>
        <div className="flex-1 min-w-0 text-start">
          <p className={cn(myui.sectionTitle, "text-sm")}>{label}</p>
          {hint ? (
            <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">{hint}</p>
          ) : null}
          {lastCheckedAt && !isChecking ? (
            <p className="text-[11px] text-muted-foreground mt-1">
              آخر فحص: {formatCheckedAt(lastCheckedAt)}
            </p>
          ) : null}
        </div>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => void onRefresh()}
          disabled={isChecking}
          className="h-9 w-9 shrink-0 rounded-xl p-0 text-muted-foreground hover:text-cyan-700 dark:hover:text-cyan-300"
          title={labels.refreshTitle}
          aria-label={labels.refreshAriaLabel}
        >
          <RefreshCw className={cn("w-4 h-4", isChecking && "animate-spin")} />
        </Button>
      </div>
    </div>
  )
}
