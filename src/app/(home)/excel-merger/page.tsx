"use client"

import { useState, useMemo } from "react"
import * as XLSX from "xlsx"
import { Layers, X, Download, Plus } from "lucide-react"
import { Button, cn } from "myui"
import { MyuiPanel } from "@/components/myui/myui-panel"
import { myui } from "@/components/myui/myui-styles"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table"
import { toast } from "sonner"
import { useActivityStore } from "@/store/activity/activityStore"

interface LoadedFile {
  name: string
  rows: Record<string, unknown>[]
  headers: string[]
}

export default function ExcelMergerPage() {
  const [files, setFiles] = useState<LoadedFile[]>([])
  const [addSource, setAddSource] = useState(true)
  const [selectedColumns, setSelectedColumns] = useState<string[]>([])
  const [merged, setMerged] = useState<Record<string, unknown>[] | null>(null)
  const logActivity = useActivityStore((s) => s.log)

  // Union of all headers across all files
  const allHeaders = useMemo(() => {
    const seen = new Set<string>()
    const result: string[] = []
    files.forEach((f) => f.headers.forEach((h) => {
      if (!seen.has(h)) { seen.add(h); result.push(h) }
    }))
    return result
  }, [files])

  // Keep selectedColumns in sync when files change
  function syncColumns(newHeaders: string[]) {
    setSelectedColumns((prev) => {
      const prevSet = new Set(prev)
      return newHeaders.filter((h) => prevSet.size === 0 || prevSet.has(h))
    })
  }

  function loadFile(file: File) {
    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer)
        const wb = XLSX.read(data, { type: "array" })
        const ws = wb.Sheets[wb.SheetNames[0]]
        const rows = XLSX.utils.sheet_to_json<Record<string, unknown>>(ws, { defval: "" })
        if (rows.length === 0) { toast.error(`الملف "${file.name}" فارغ`); return }
        const headers = Object.keys(rows[0])
        const loaded: LoadedFile = { name: file.name, rows, headers }
        setFiles((prev) => {
          const next = [...prev, loaded]
          const union: string[] = []
          const seen = new Set<string>()
          next.forEach((f) => f.headers.forEach((h) => { if (!seen.has(h)) { seen.add(h); union.push(h) } }))
          syncColumns(union)
          return next
        })
        setMerged(null)
        toast.success(`تم تحميل "${file.name}" — ${rows.length} صف`)
      } catch { toast.error(`تعذّر قراءة "${file.name}"`) }
    }
    reader.readAsArrayBuffer(file)
  }

  function handleInput(e: React.ChangeEvent<HTMLInputElement>) {
    Array.from(e.target.files ?? []).forEach(loadFile)
    e.target.value = ""
  }

  function removeFile(idx: number) {
    setFiles((prev) => {
      const next = prev.filter((_, i) => i !== idx)
      if (next.length === 0) { setSelectedColumns([]); setMerged(null) }
      return next
    })
    setMerged(null)
  }

  function toggleColumn(col: string) {
    setSelectedColumns((prev) =>
      prev.includes(col) ? prev.filter((c) => c !== col) : [...prev, col]
    )
  }

  function merge() {
    if (files.length < 2) { toast.error("أضف ملفين على الأقل"); return }
    const cols = selectedColumns.length > 0 ? selectedColumns : allHeaders
    const result: Record<string, unknown>[] = []
    files.forEach((f) => {
      f.rows.forEach((row) => {
        const out: Record<string, unknown> = {}
        if (addSource) out["المصدر"] = f.name.replace(/\.[^.]+$/, "")
        cols.forEach((c) => { out[c] = row[c] ?? "" })
        result.push(out)
      })
    })
    setMerged(result)
    logActivity({
      tool: "excel-merger",
      label: `دمج ${files.length} ملفات — ${result.length} صف`,
      detail: files.map((f) => f.name.replace(/\.[^.]+$/, "")).join("، "),
    })
    toast.success(`تم الدمج: ${result.length} صف إجمالاً`)
  }

  function exportMerged() {
    if (!merged) return
    const ws = XLSX.utils.json_to_sheet(merged)
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, "مدمج")
    XLSX.writeFile(wb, "merged.xlsx")
    toast.success("تم تصدير الملف المدمج")
  }

  const displayHeaders = addSource
    ? ["المصدر", ...(selectedColumns.length > 0 ? selectedColumns : allHeaders)]
    : (selectedColumns.length > 0 ? selectedColumns : allHeaders)

  return (
    <div className={myui.main}>
      <MyuiPanel title="إضافة ملفات" icon={Layers}>
        <div
          className={myui.uploadZone}
          onClick={() => document.getElementById("merger-input")?.click()}
        >
          <div className="w-12 h-12 rounded-xl bg-cyan-600/10 flex items-center justify-center">
            <Plus className="w-7 h-7 text-cyan-600 dark:text-cyan-400" />
          </div>
          <p className="text-sm font-medium">انقر لإضافة ملفات Excel</p>
          <p className="text-xs text-muted-foreground">يمكنك إضافة أكثر من ملف</p>
          <input id="merger-input" type="file" accept=".xlsx,.xls" multiple className="hidden" onChange={handleInput} />
        </div>
      </MyuiPanel>

      {files.length > 0 && (
        <MyuiPanel title="الملفات المحملة" icon={Layers}>
          <div className="space-y-2">
            {files.map((f, i) => (
              <div key={i} className="flex items-center justify-between px-4 py-2.5 border border-slate-200 dark:border-slate-700 rounded-xl bg-slate-50/80 dark:bg-slate-800/40">
                <div className="flex items-center gap-3">
                  <Layers className="w-4 h-4 text-sky-500 shrink-0" />
                  <span className="text-sm font-medium">{f.name}</span>
                  <Badge variant="secondary" className="text-xs">{f.rows.length} صف</Badge>
                </div>
                <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => removeFile(i)}>
                  <X className="w-4 h-4" />
                </Button>
              </div>
            ))}
          </div>
        </MyuiPanel>
      )}

      {files.length >= 2 && (
        <MyuiPanel title="خيارات الدمج" icon={Layers}>
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <Switch checked={addSource} onCheckedChange={setAddSource} id="source-col" />
            <Label htmlFor="source-col" className="cursor-pointer">إضافة عمود &quot;المصدر&quot; (اسم الملف)</Label>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label>الأعمدة المراد دمجها</Label>
              <div className="flex gap-2 text-xs text-muted-foreground">
                <button onClick={() => setSelectedColumns(allHeaders)} className="hover:text-foreground">تحديد الكل</button>
                <span>·</span>
                <button onClick={() => setSelectedColumns([])} className="hover:text-foreground">إلغاء الكل</button>
              </div>
            </div>
            <div className="flex flex-wrap gap-3 pt-1">
              {allHeaders.map((h) => (
                <label key={h} className="flex items-center gap-2 cursor-pointer select-none">
                  <Checkbox checked={selectedColumns.includes(h)} onCheckedChange={() => toggleColumn(h)} />
                  <span className="text-sm">{h}</span>
                </label>
              ))}
            </div>
          </div>

          <Button onClick={merge} className="gap-2 bg-cyan-600 hover:bg-cyan-700 text-white">
            <Layers className="w-4 h-4" />
            دمج الملفات
          </Button>
        </div>
        </MyuiPanel>
      )}

      {merged && (
        <MyuiPanel title="النتيجة" icon={Layers}>
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              النتيجة: <span className="font-semibold text-foreground">{merged.length}</span> صف مدموج
            </p>
            <Button onClick={exportMerged} className="gap-2 bg-cyan-600 hover:bg-cyan-700 text-white">
              <Download className="w-4 h-4" />
              تصدير Excel
            </Button>
          </div>
          <div className={cn(myui.tableWrap, "max-h-[420px] overflow-auto")}>
            <Table>
              <TableHeader>
                <TableRow className="bg-slate-50 dark:bg-slate-800/50 hover:bg-slate-50">
                  {displayHeaders.map((h) => (
                    <TableHead key={h} className="whitespace-nowrap text-start font-semibold">{h}</TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {merged.slice(0, 100).map((row, i) => (
                  <TableRow key={i}>
                    {displayHeaders.map((h) => (
                      <TableCell key={h} className="whitespace-nowrap text-start">{String(row[h] ?? "")}</TableCell>
                    ))}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          {merged.length > 100 && (
            <p className="text-xs text-muted-foreground text-center">يُعرض أول 100 صف — التصدير يشمل الكل</p>
          )}
        </div>
        </MyuiPanel>
      )}
    </div>
  )
}
