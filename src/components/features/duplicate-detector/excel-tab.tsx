"use client"

import { useState } from "react"
import * as XLSX from "xlsx"
import { Button, cn } from "myui"
import { myui } from "@/components/myui/myui-styles"
import { MyuiPanel } from "@/components/myui/myui-panel"
import { FileSpreadsheet } from "lucide-react"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { FileUploadZone } from "@/components/features/excel-extractor/file-upload-zone"
import { DuplicatesResult } from "./duplicates-result"
import { findDuplicates } from "@/lib/detectDuplicates"
import { toast } from "sonner"
import { X } from "lucide-react"
import { useActivityStore } from "@/store/activity/activityStore"

const fieldClass =
  "h-11 rounded-xl bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 focus-visible:ring-cyan-500/20 focus-visible:border-cyan-500"

export function ExcelTab() {
  const [fileName, setFileName] = useState("")
  const [headers, setHeaders] = useState<string[]>([])
  const [rows, setRows] = useState<Record<string, unknown>[]>([])
  const [column, setColumn] = useState("")
  const [results, setResults] = useState<ReturnType<typeof findDuplicates> | null>(null)
  const [totalRows, setTotalRows] = useState(0)
  const logActivity = useActivityStore((s) => s.log)

  function handleFile(file: File) {
    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer)
        const wb = XLSX.read(data, { type: "array" })
        const ws = wb.Sheets[wb.SheetNames[0]]
        const parsed = XLSX.utils.sheet_to_json<Record<string, unknown>>(ws, { defval: "" })
        if (parsed.length === 0) {
          toast.error("الملف فارغ")
          return
        }
        setFileName(file.name)
        setHeaders(Object.keys(parsed[0]))
        setRows(parsed)
        setColumn("")
        setResults(null)
        toast.success(`تم تحميل ${parsed.length} صف`)
      } catch {
        toast.error("تعذّر قراءة الملف")
      }
    }
    reader.readAsArrayBuffer(file)
  }

  function scan() {
    if (!column) {
      toast.error("اختر العمود أولاً")
      return
    }
    const values = rows.map((r) => String(r[column] ?? ""))
    const dupes = findDuplicates(values)
    setTotalRows(values.length)
    setResults(dupes)
    logActivity({
      tool: "duplicate-detector",
      label: `فحص "${fileName}" — عمود: ${column}`,
      detail: `${dupes.length} قيمة مكررة من أصل ${values.length} صف`,
    })
  }

  function reset() {
    setFileName("")
    setHeaders([])
    setRows([])
    setColumn("")
    setResults(null)
    setTotalRows(0)
  }

  if (!fileName) {
    return (
      <MyuiPanel title="رفع ملف Excel" icon={FileSpreadsheet} bodyClassName="p-3 sm:p-5">
        <FileUploadZone onFile={handleFile} />
      </MyuiPanel>
    )
  }

  return (
    <div className="space-y-4 sm:space-y-5">
      <div className={myui.toolbar}>
        <span className={cn(myui.badge, "max-w-[min(100%,320px)] truncate")}>{fileName}</span>
        <Button variant="ghost" size="sm" onClick={reset} className="gap-1.5 ms-auto text-muted-foreground hover:text-red-600">
          <X className="w-4 h-4" />
          إعادة تعيين
        </Button>
      </div>

      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/25 p-3 sm:p-4 flex flex-col sm:flex-row sm:items-end gap-3">
        <div className="flex-1 space-y-1.5">
          <Label className="text-xs text-muted-foreground">العمود المراد فحصه</Label>
          <Select value={column} onValueChange={setColumn}>
            <SelectTrigger className={cn(fieldClass, "w-full")}>
              <SelectValue placeholder="اختر عموداً" />
            </SelectTrigger>
            <SelectContent>
              {headers.map((h) => (
                <SelectItem key={h} value={h}>{h}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <Button
          onClick={scan}
          disabled={!column}
          className="h-11 rounded-xl bg-cyan-600 hover:bg-cyan-700 text-white w-full sm:w-auto shadow-sm shadow-cyan-500/20"
        >
          فحص التكرار
        </Button>
      </div>

      {results !== null && (
        <DuplicatesResult
          results={results}
          totalRows={totalRows}
          allRows={rows}
          headers={headers}
          scannedColumn={column}
        />
      )}
    </div>
  )
}
