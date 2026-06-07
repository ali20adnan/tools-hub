import { NextResponse } from "next/server"
import { bridgeAuthHeaders, bridgeBaseUrl } from "@/lib/image-scanner/bridgeConfig"

type PrinterHealthBody = {
  ok?: boolean
  printer?: string
  printer_name?: string
  name?: string
  error?: string
  printer_ok?: boolean
}

async function parseJsonResponse(res: Response): Promise<PrinterHealthBody> {
  const text = await res.text()
  try {
    return JSON.parse(text) as PrinterHealthBody
  } catch {
    return { ok: false, error: "invalid_json" }
  }
}

function normalizePrinterHealth(body: PrinterHealthBody): { ok: boolean; printer?: string; error?: string } {
  if (body.printer_ok === true) {
    return { ok: true, printer: body.printer_name ?? body.printer ?? body.name }
  }
  if (body.ok === true) {
    return { ok: true, printer: body.printer ?? body.printer_name ?? body.name }
  }
  return { ok: false, error: body.error ?? "printer_unavailable" }
}

async function fetchPrinterHealthPath(base: string, path: string): Promise<Response | null> {
  try {
    const res = await fetch(`${base}${path}`, {
      cache: "no-store",
      headers: bridgeAuthHeaders(),
    })
    if (res.status === 404) return null
    return res
  } catch {
    return null
  }
}

export async function GET() {
  const base = bridgeBaseUrl()

  try {
    for (const path of ["/printer/health", "/print/health"]) {
      const res = await fetchPrinterHealthPath(base, path)
      if (!res) continue
      const body = await parseJsonResponse(res)
      return NextResponse.json(normalizePrinterHealth(body), { status: res.ok ? 200 : res.status })
    }

    const healthRes = await fetch(`${base}/health`, {
      cache: "no-store",
      headers: bridgeAuthHeaders(),
    })
    const healthBody = await parseJsonResponse(healthRes)
    if (typeof healthBody.printer_ok === "boolean") {
      return NextResponse.json(normalizePrinterHealth(healthBody), {
        status: healthBody.printer_ok ? 200 : 503,
      })
    }

    return NextResponse.json(
      { ok: false, error: "printer_health_not_supported" },
      { status: 503 },
    )
  } catch (err) {
    const message = err instanceof Error ? err.message : "bridge_unreachable"
    return NextResponse.json({ ok: false, error: message }, { status: 503 })
  }
}
