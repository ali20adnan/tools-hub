"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import { requestBridgeHealth } from "@/lib/image-scanner/bridgeClient"
import {
  DEVICE_CONNECTION_POLL_MS,
  type DeviceConnectionState,
} from "@/hooks/image-scanner/deviceConnection"

export type BridgeConnectionState = DeviceConnectionState

export function useBridgeHealth() {
  const [state, setState] = useState<DeviceConnectionState>("checking")
  const [serviceName, setServiceName] = useState<string | null>(null)
  const [lastCheckedAt, setLastCheckedAt] = useState<Date | null>(null)
  const mountedRef = useRef(true)

  const check = useCallback(async () => {
    setState("checking")
    try {
      const data = await requestBridgeHealth()
      if (!mountedRef.current) return
      setLastCheckedAt(new Date())
      if (data.ok) {
        setState("connected")
        setServiceName(data.service ?? null)
      } else {
        setState("disconnected")
        setServiceName(null)
      }
    } catch {
      if (!mountedRef.current) return
      setState("disconnected")
      setServiceName(null)
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

  return { state, serviceName, lastCheckedAt, refresh: check }
}
