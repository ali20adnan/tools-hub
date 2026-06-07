"use client"

import { DeviceConnectionStatus } from "@/components/features/image-scanner/DeviceConnectionStatus"
import type { DeviceConnectionState } from "@/hooks/image-scanner/deviceConnection"

const PRINTER_LABELS = {
  connected: "الطابعة متصلة",
  disconnected: "الطابعة غير متصلة",
  checking: "جاري التحقق…",
  disconnectedHint: "شغّل الطابعة",
  checkingHint: "يتم التحقق من الاتصال…",
  refreshTitle: "إعادة فحص الطابعة",
  refreshAriaLabel: "إعادة فحص اتصال الطابعة",
} as const

type PrinterConnectionStatusProps = {
  state: DeviceConnectionState
  lastCheckedAt: Date | null
  onRefresh: () => void
}

export function PrinterConnectionStatus({
  state,
  lastCheckedAt,
  onRefresh,
}: PrinterConnectionStatusProps) {
  return (
    <DeviceConnectionStatus
      state={state}
      lastCheckedAt={lastCheckedAt}
      onRefresh={onRefresh}
      labels={PRINTER_LABELS}
    />
  )
}
