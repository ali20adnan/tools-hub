import {
  ArrowLeftRight,
  FileSpreadsheet,
  Layers,
  ScanLine,
  ScanSearch,
  type LucideIcon,
} from "lucide-react"

export type ToolSlug =
  | "excel-extractor"
  | "duplicate-detector"
  | "excel-merger"
  | "excel-compare"
  | "image-scanner"

export type ToolDefinition = {
  slug: ToolSlug
  href: `/${string}`
  title: string
  description: string
  color: string
  icon: LucideIcon
  navLabelKey?:
    | "nav.excelExtractor"
    | "nav.duplicateDetector"
    | "nav.excelMerger"
    | "nav.excelCompare"
    | "nav.imageScanner"
  pageMetaKey?:
    | "pages.excelExtractor"
    | "pages.duplicateDetector"
    | "pages.excelMerger"
    | "pages.excelCompare"
    | "pages.imageScanner"
}

export const TOOL_DEFINITIONS: ToolDefinition[] = [
  {
    slug: "excel-extractor",
    href: "/excel-extractor",
    title: "استخراج Excel",
    description: "استخراج وتصفية وتلوين البيانات",
    color: "bg-emerald-500",
    icon: FileSpreadsheet,
    navLabelKey: "nav.excelExtractor",
    pageMetaKey: "pages.excelExtractor",
  },
  {
    slug: "duplicate-detector",
    href: "/duplicate-detector",
    title: "كشف التكرار",
    description: "اكتشاف القيم المكررة في عمود",
    color: "bg-violet-500",
    icon: ScanSearch,
    navLabelKey: "nav.duplicateDetector",
    pageMetaKey: "pages.duplicateDetector",
  },
  {
    slug: "excel-merger",
    href: "/excel-merger",
    title: "دمج الملفات",
    description: "دمج عدة ملفات في ورقة واحدة",
    color: "bg-sky-500",
    icon: Layers,
    navLabelKey: "nav.excelMerger",
    pageMetaKey: "pages.excelMerger",
  },
  {
    slug: "excel-compare",
    href: "/excel-compare",
    title: "مقارنة الملفات",
    description: "مقارنة نسختين من البيانات",
    color: "bg-orange-500",
    icon: ArrowLeftRight,
    navLabelKey: "nav.excelCompare",
    pageMetaKey: "pages.excelCompare",
  },
  {
    slug: "image-scanner",
    href: "/image-scanner",
    title: "ماسح ضوئي",
    description: "رفع، ماسح ضوئي، قص وتعديل الصور",
    color: "bg-cyan-500",
    icon: ScanLine,
    navLabelKey: "nav.imageScanner",
    pageMetaKey: "pages.imageScanner",
  },
]

export const TOOL_SLUGS = new Set(TOOL_DEFINITIONS.map((t) => t.slug))

export function pathnameToToolSlug(pathname: string): ToolSlug | null {
  const match = TOOL_DEFINITIONS.find((t) => pathname.startsWith(t.href))
  return match?.slug ?? null
}
