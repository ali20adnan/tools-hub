"use client"

import { DeviceConnectionStatus } from "@/components/features/image-scanner/DeviceConnectionStatus"
import type { DeviceConnectionState } from "@/hooks/image-scanner/deviceConnection"

const SCANNER_LABELS = {
  connected: "الماسح متصل",
  disconnected: "الماسح غير متصل",
  checking: "جاري التحقق…",
  disconnectedHint: "شغّل التطبيق",
  checkingHint: "يتم التحقق من الاتصال…",
  refreshTitle: "إعادة فحص الاتصال",
  refreshAriaLabel: "إعادة فحص الاتصال بالماسح",
} as const

type BridgeConnectionStatusProps = {
  state: DeviceConnectionState
  lastCheckedAt: Date | null
  onRefresh: () => void
}

export function BridgeConnectionStatus({
  state,
  lastCheckedAt,
  onRefresh,
}: BridgeConnectionStatusProps) {
  return (
    <DeviceConnectionStatus
      state={state}
      lastCheckedAt={lastCheckedAt}
      onRefresh={onRefresh}
      labels={SCANNER_LABELS}
    />
  )
}
