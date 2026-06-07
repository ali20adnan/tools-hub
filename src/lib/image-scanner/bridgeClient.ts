export type ScanBackend = "auto" | "wia" | "twain";

export type BridgeHealthResponse = {
  ok: boolean;
  service?: string;
  error?: string;
};

export async function requestBridgeHealth(): Promise<BridgeHealthResponse> {
  const res = await fetch("/api/bridge/health", { cache: "no-store" });
  const data = (await res.json()) as BridgeHealthResponse;
  if (!res.ok && data.ok !== true) {
    return { ok: false, error: data.error ?? "bridge_unreachable" };
  }
  return data;
}

export type PrinterHealthResponse = {
  ok: boolean;
  printer?: string;
  error?: string;
};

export async function requestPrinterHealth(): Promise<PrinterHealthResponse> {
  const res = await fetch("/api/bridge/printer-health", { cache: "no-store" });
  const data = (await res.json()) as PrinterHealthResponse;
  if (!res.ok && data.ok !== true) {
    return { ok: false, error: data.error ?? "printer_unreachable" };
  }
  return data;
}

export type BridgeScanResponse = {
  ok: boolean;
  backend?: "wia" | "twain";
  mime?: string;
  base64?: string;
  original_mime?: string;
  original_base64?: string;
  error?: string;
};

export async function requestBridgeScan(body: {
  backend?: ScanBackend;
  paper_size?: string;
}): Promise<BridgeScanResponse> {
  const res = await fetch("/api/bridge/scan", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      backend: body.backend ?? "auto",
      paper_size: body.paper_size ?? "a4",
    }),
  });
  const data = (await res.json()) as BridgeScanResponse;
  return data;
}
