import { NextResponse } from "next/server";
import { bridgeAuthHeaders, bridgeBaseUrl } from "@/lib/image-scanner/bridgeConfig";

export async function POST(request: Request) {
  const base = bridgeBaseUrl();
  let payload: unknown;

  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ ok: false, error: "invalid_json_body" }, { status: 400 });
  }

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...bridgeAuthHeaders(),
  };

  try {
    const res = await fetch(`${base}/scan`, {
      method: "POST",
      headers,
      body: JSON.stringify(payload),
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
    return NextResponse.json({ ok: false, error: message }, { status: 503 });
  }
}
