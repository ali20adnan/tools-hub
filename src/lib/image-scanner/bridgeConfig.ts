export function bridgeBaseUrl(): string {
  return process.env.BRIDGE_URL?.replace(/\/$/, "") ?? "http://127.0.0.1:8888"
}

export function bridgeAuthHeaders(): Record<string, string> {
  const token = process.env.BRIDGE_TOKEN ?? ""
  const headers: Record<string, string> = {}
  if (token) headers.Authorization = `Bearer ${token}`
  return headers
}
