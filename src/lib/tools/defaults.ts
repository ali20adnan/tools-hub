import type { ToolSlug } from "@/lib/tools/registry"

export function defaultToolsEnabledMap(): Record<ToolSlug, boolean> {
  return {
    "excel-extractor": true,
    "duplicate-detector": true,
    "excel-merger": true,
    "excel-compare": true,
    "image-scanner": true,
  }
}
