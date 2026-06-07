"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import { requestPrinterHealth } from "@/lib/image-scanner/bridgeClient"
import {
  DEVICE_CONNECTION_POLL_MS,
  type DeviceConnectionState,
} from "@/hooks/image-scanner/deviceConnection"

export function usePrinterHealth() {
  const [state, setState] = useState<DeviceConnectionState>("checking")
  const [printerName, setPrinterName] = useState<string | null>(null)
  const [lastCheckedAt, setLastCheckedAt] = useState<Date | null>(null)
  const mountedRef = useRef(true)

  const check = useCallback(async () => {
    setState("checking")
    try {
      const data = await requestPrinterHealth()
      if (!mountedRef.current) return
      setLastCheckedAt(new Date())
      if (data.ok) {
        setState("connected")
        setPrinterName(data.printer ?? null)
      } else {
        setState("disconnected")
        setPrinterName(null)
      }
    } catch {
      if (!mountedRef.current) return
      setState("disconnected")
      setPrinterName(null)
      setLastCheckedAt(new Date())
    }
  }, [])

  useEffect(() => {
    mountedRef.current = true
    void check()
    const id = window.setInterval(() => void check(), DEVICE_CONNECTION_POLL_MS)
    return () => {
      mountedRef.current = false
      window.clearInterval(id)
    }
  }, [check])

  return { state, printerName, lastCheckedAt, refresh: check }
}
