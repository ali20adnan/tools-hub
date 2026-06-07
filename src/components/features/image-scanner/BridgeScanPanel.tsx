"use client"

import { useState } from "react"
import { Loader2, ScanLine } from "lucide-react"
import { cn } from "myui"
import { actionBtnPrimary } from "./image-scanner-ui"
import { requestBridgeScan } from "@/lib/image-scanner/bridgeClient"
import { base64ToFile } from "@/lib/image-scanner/base64ToFile"
import { validateImageFile } from "@/lib/image-scanner/fileValidation"

type BridgeScanPanelProps = {
  onScannedImage: (file: File) => void
  onBridgeError: (message: string | null) => void
  bridgeConnected: boolean
  bridgeChecking?: boolean
}

function pickScanPayload(data: {
  mime?: string
  base64?: string
  original_mime?: string
  original_base64?: string
}): { mime: string; base64: string } | null {
  if (data.base64 && data.mime) return { mime: data.mime, base64: data.base64 }
  if (data.original_base64 && data.original_mime) {
    return { mime: data.original_mime, base64: data.original_base64 }
  }
  return null
}

export function BridgeScanPanel({
  onScannedImage,
  onBridgeError,
  bridgeConnected,
  bridgeChecking = false,
}: BridgeScanPanelProps) {
  const [scanning, setScanning] = useState(false)

  const handleScan = async () => {
    if (!bridgeConnected) {
      onBridgeError("الماسح غير متصل. شغّل التطبيق ثم حدّث حالة الاتصال.")
      return
    }

    setScanning(true)
    onBridgeError(null)
    try {
      const data = await requestBridgeScan({ backend: "auto", paper_size: "a4" })
      if (!data.ok) {
        onBridgeError(data.error ?? "فشل المسح الضوئي.")
        return
      }

      const picked = pickScanPayload(data)
      if (!picked) {
        onBridgeError("لم يُرجع الماسح أي بيانات صورة.")
        return
      }

      const file = base64ToFile(picked.base64, picked.mime, "scan-bridge")
      const validationError = validateImageFile(file)
      if (validationError) {
        onBridgeError(validationError)
        return
      }

      onScannedImage(file)
    } catch {
      onBridgeError("حدث خطأ أثناء المسح. تأكد أن التطبيق يعمل والماسح متصل.")
    } finally {
      setScanning(false)
    }
  }

  const busy = scanning || bridgeChecking

  return (
    <button
      type="button"
      onClick={() => void handleScan()}
      disabled={busy || !bridgeConnected}
      className={cn(actionBtnPrimary, "font-semibold")}
      title={!bridgeConnected ? "شغّل التطبيق أولاً" : undefined}
    >
      {busy ? (
        <Loader2 className="w-4 h-4 shrink-0 animate-spin" />
      ) : (
        <ScanLine className="w-4 h-4 shrink-0" />
      )}
      <span>{scanning ? "جاري المسح…" : "ماسح ضوئي"}</span>
    </button>
  )
}
