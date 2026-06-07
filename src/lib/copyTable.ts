/**
 * Copies an HTML table to the clipboard in a way that works across
 * Excel 2010, Excel 2016+, Word, and Google Docs.
 */
export async function copyTableToClipboard(
  headers: string[],
  rows: Record<string, unknown>[],
  options?: { rtl?: boolean },
): Promise<void> {
  const rtl = options?.rtl ?? true
  const textAlign = rtl ? "right" : "left"
  const dirAttr = rtl ? "rtl" : "ltr"

  const tsv = [
    headers.join("\t"),
    ...rows.map((r) => headers.map((h) => String(r[h] ?? "")).join("\t")),
  ].join("\n")

  const th = headers
    .map(
      (h) =>
        `<th style="border:1px solid #aaa;padding:6px 10px;background:#e8edf5;font-weight:bold;text-align:${textAlign};">${escape(h)}</th>`
    )
    .join("")

  const tbody = rows
    .map((r) => {
      const tds = headers
        .map(
          (h) =>
            `<td style="border:1px solid #ccc;padding:6px 10px;text-align:${textAlign};">${escape(String(r[h] ?? ""))}</td>`
        )
        .join("")
      return `<tr>${tds}</tr>`
    })
    .join("")

  const html = `<table dir="${dirAttr}" style="border-collapse:collapse;font-family:Arial,sans-serif;font-size:13px;">
<thead><tr>${th}</tr></thead>
<tbody>${tbody}</tbody>
</table>`

  const success = copyViaDOM(html)
  if (success) return

  try {
    await navigator.clipboard.write([
      new ClipboardItem({
        "text/plain": new Blob([tsv], { type: "text/plain" }),
        "text/html": new Blob([html], { type: "text/html" }),
      }),
    ])
    return
  } catch {
    /* fall through */
  }

  await navigator.clipboard.writeText(tsv)
}

function copyViaDOM(html: string): boolean {
  try {
    const wrap = document.createElement("div")
    wrap.style.cssText =
      "position:fixed;top:-99999px;left:-99999px;opacity:0;pointer-events:none;"
    wrap.innerHTML = html
    document.body.appendChild(wrap)

    const range = document.createRange()
    range.selectNode(wrap)
    const sel = window.getSelection()
    sel?.removeAllRanges()
    sel?.addRange(range)

    const ok = document.execCommand("copy")

    sel?.removeAllRanges()
    document.body.removeChild(wrap)
    return ok
  } catch {
    return false
  }
}

function escape(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
}
