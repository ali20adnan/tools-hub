import { NextResponse } from "next/server";
import { bridgeAuthHeaders, bridgeBaseUrl } from "@/lib/image-scanner/bridgeConfig";

export async function GET() {
  const base = bridgeBaseUrl();

  try {
    const res = await fetch(`${base}/health`, {
      cache: "no-store",
      headers: bridgeAuthHeaders(),
    });
    const text = await res.text();
    let body: unknown = text;
    try {
      body = JSON.parse(text) as unknown;
    } catch {
      body = { ok: false, error: "invalid_json", raw: text.slice(0, 200) };
    }
    return NextResponse.json(body, { status: res.status });
  } catch (err) {
    const message = err instanceof Error ? err.message : "bridge_unreachable";
    return NextResponse.json(
      { ok: false, error: message },
      { status: 503 },
    );
  }
}
