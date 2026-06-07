import { arMessages } from "./ar"

function getNested(obj: Record<string, unknown>, path: string): string | undefined {
  const parts = path.split(".")
  let node: unknown = obj
  for (const part of parts) {
    if (!node || typeof node !== "object" || !(part in node)) return undefined
    node = (node as Record<string, unknown>)[part]
  }
  return typeof node === "string" ? node : undefined
}

/** ترجمة عربية فقط */
export function translate(
  key: string,
  params?: Record<string, string | number>,
): string {
  let text = getNested(arMessages as unknown as Record<string, unknown>, key) ?? key

  if (params) {
    for (const [k, v] of Object.entries(params)) {
      text = text.replace(new RegExp(`\\{${k}\\}`, "g"), String(v))
    }
  }

  return text
}
