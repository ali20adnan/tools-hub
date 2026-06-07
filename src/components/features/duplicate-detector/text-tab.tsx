"use client"

import { useState } from "react"
import { AlignLeft, Type } from "lucide-react"
import { Button, cn } from "myui"
import { myui } from "@/components/myui/myui-styles"
import { Textarea } from "@/components/ui/textarea"
import { DuplicatesResult } from "./duplicates-result"
import { findDuplicates } from "@/lib/detectDuplicates"
import { toast } from "sonner"
import { useActivityStore } from "@/store/activity/activityStore"

type Separator = "newline" | "comma"

const fieldClass =
  "rounded-xl bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 focus-visible:ring-cyan-500/20 focus-visible:border-cyan-500"

const subPanelClass =
  "rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/25 overflow-hidden"

export function TextTab() {
  const [text, setText] = useState("")
  const [separator, setSeparator] = useState<Separator>("newline")
  const [results, setResults] = useState<ReturnType<typeof findDuplicates> | null>(null)
  const [totalRows, setTotalRows] = useState(0)
  const logActivity = useActivityStore((s) => s.log)

  function scan() {
    if (!text.trim()) {
      toast.error("الرجاء إدخال نص أولاً")
      return
    }
    const values =
      separator === "newline"
        ? text.split("\n").map((v) => v.trim()).filter(Boolean)
        : text.split(",").map((v) => v.trim()).filter(Boolean)

    if (values.length < 2) {
      toast.error("أدخل قيمتين على الأقل")
      return
    }
    const dupes = findDuplicates(values)
    setTotalRows(values.length)
    setResults(dupes)
    logActivity({
      tool: "duplicate-detector",
      label: `فحص نص — ${values.length} قيمة`,
      detail: `${dupes.length} قيمة مكررة`,
    })
  }

  function reset() {
    setText("")
    setResults(null)
    setTotalRows(0)
  }

  return (
    <div className="space-y-4 sm:space-y-5">
      <section className={subPanelClass}>
        <div className={cn(myui.cardHeader, "border-b border-slate-100 dark:border-slate-800")}>
          <div className="flex items-center gap-2.5">
            <div className={cn(myui.iconBox, "w-8 h-8 bg-cyan-600/10")}>
              <AlignLeft className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />
            </div>
            <span className={cn(myui.sectionTitle, "text-sm")}>الفاصل بين القيم</span>
          </div>
        </div>
        <div className="p-3 sm:p-4 flex flex-wrap gap-2">
          {(["newline", "comma"] as Separator[]).map((sep) => (
            <button
              key={sep}
              type="button"
              onClick={() => setSeparator(sep)}
              className={cn(
                "px-4 py-2 rounded-xl text-sm font-medium border transition-colors",
                separator === sep
                  ? "border-cyan-500/40 bg-cyan-50 dark:bg-cyan-950/30 text-cyan-700 dark:text-cyan-300"
                  : "border-slate-200 dark:border-slate-700 text-muted-foreground hover:bg-white dark:hover:bg-slate-900",
              )}
            >
              {sep === "newline" ? "سطر جديد" : "فاصلة"}
            </button>
          ))}
        </div>
      </section>

      <section className={subPanelClass}>
        <div className={cn(myui.cardHeader, "border-b border-slate-100 dark:border-slate-800")}>
          <div className="flex items-center gap-2.5">
            <div className={cn(myui.iconBox, "w-8 h-8 bg-cyan-600/10")}>
              <Type className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />
            </div>
            <span className={cn(myui.sectionTitle, "text-sm")}>الصق القيم هنا</span>
          </div>
        </div>
        <div className="p-3 sm:p-4 space-y-3">
          <Textarea
            placeholder={separator === "newline" ? "قيمة 1\nقيمة 2\nقيمة 3" : "قيمة 1, قيمة 2, قيمة 3"}
            value={text}
            onChange={(e) => setText(e.target.value)}
            rows={8}
            className={cn(fieldClass, "text-sm resize-y min-h-[160px]")}
          />
          <div className="flex flex-col-reverse sm:flex-row gap-2">
            <Button
              type="button"
              variant="ghost"
              onClick={reset}
              className="h-11 rounded-xl text-muted-foreground hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              إعادة تعيين
            </Button>
            <Button
              type="button"
              onClick={scan}
              className="flex-1 h-11 rounded-xl bg-cyan-600 hover:bg-cyan-700 shadow-sm shadow-cyan-500/20"
            >
              فحص التكرار
            </Button>
          </div>
        </div>
      </section>

      {results !== null && <DuplicatesResult results={results} totalRows={totalRows} />}
    </div>
  )
}
