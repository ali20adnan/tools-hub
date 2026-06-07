let apiBase = ""

/** Configure API root (e.g. "" or "https://api.example.com") */
export function setApiBase(base: string) {
  apiBase = base.replace(/\/$/, "")
}

export function getApiBase() {
  return apiBase
}

export function apiUrl(path: string) {
  if (!path.startsWith("/")) path = `/${path}`
  return `${apiBase}${path}`
}

export function apiFetch(path: string, init?: RequestInit) {
  return fetch(apiUrl(path), init)
}
