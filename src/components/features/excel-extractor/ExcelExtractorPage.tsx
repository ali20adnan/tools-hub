"use client"

import { useState, useMemo, useCallback, useEffect, useRef } from "react"
import * as XLSX from "xlsx"
import { FileSpreadsheet, Loader2, Palette, RefreshCw, X, Trash2, SlidersHorizontal, Table2 } from "lucide-react"
import { Button, cn } from "myui"
import { MyuiPanel } from "@/components/myui/myui-panel"
import { myui } from "@/components/myui/myui-styles"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { FilterPanel } from "@/components/features/excel-extractor/filter-panel"
import { ResultsTable } from "@/components/features/excel-extractor/results-table"
import { SelectedRowsTable } from "@/components/features/excel-extractor/selected-rows-table"
import {
  ResultsViewModeToggle,
  type ResultsViewMode,
} from "@/components/features/excel-extractor/results-view-mode-toggle"
import { ExportBar } from "@/components/features/excel-extractor/export-bar"
import { ProcessingProgress, ProcessingStep } from "@/components/features/excel-extractor/processing-progress"
import { FileUploadZone } from "@/components/features/excel-extractor/file-upload-zone"
import {
  ColorRuleModal, ColorRule,
} from "@/components/features/excel-extractor/color-rule-modal"
import { useExcelExtractorStore } from "@/store/excel/excelExtractorStore"
import { useExtractedSelectionStore } from "@/store/excel/extractedSelectionStore"
import { useActivityStore } from "@/store/activity/activityStore"
import { useExcelExtractorSync } from "@/hooks/useExcelExtractorSync"
import apiClient from "@/lib/axiosClients"
import { getImageUrl } from "@/lib/imageUtils"
import { toast } from "sonner"

const RESULTS_VIEW_STORAGE_KEY = "tools-hub-excel-results-view"

function normalizeBaseName(name: string) {
  return name.replace(/\.[^.]+$/, "").trim().toLowerCase()
}

function matchSavedRowsToIndices(
  allRows: Record<string, unknown>[],
  headers: string[],
  savedRows: Record<string, unknown>[],
): Set<number> {
  const keys = new Set<number>()
  for (const saved of savedRows) {
    const idx = allRows.findIndex((row) =>
      headers.every((h) => String(row[h] ?? "") === String(saved[h] ?? "")),
    )
    if (idx >= 0) keys.add(idx)
  }
  return keys
}

interface Props {
  initialAttachmentId?: number
  /** فتح من العمليات الأخيرة — عرض المحفوظ فقط دون إبقاء ملف سابق في الذاكرة */
  openSavedOnly?: boolean
}

export function ExcelExtractorPage({ initialAttachmentId, openSavedOnly = false }: Props = {}) {
  // ── Ephemeral local state ────────────────────────────────────────────────────
  const [step, setStep]           = useState<ProcessingStep>("idle")
  const [fileName, setFileName]   = useState("")
  const [headers, setHeaders]     = useState<string[]>([])
  const [allRows, setAllRows]     = useState<Record<string, unknown>[]>([])
  const [selectedKeys, setSelectedKeys] = useState<Set<number>>(new Set())
  const [activeTab, setActiveTab] = useState<"browse" | "selected">("browse")
  const [resultsViewMode, setResultsViewMode] = useState<ResultsViewMode>("tabs")
  const [colorModalCol, setColorModalCol] = useState<string | null>(null)
  const [colorModalKey, setColorModalKey] = useState(0)
  const fileInputRef = useRef<HTMLInputElement | null>(null)
  const loadedIdRef = useRef<number | null>(null)
  const savedViewAppliedRef = useRef(false)
  const [preferSelectedOnly, setPreferSelectedOnly] = useState(false)

  // ── Persisted store state ────────────────────────────────────────────────────
  const {
    filterColumn, setFilterColumn,
    filterValue, setFilterValue,
    selectedColumns, setSelectedColumns, toggleColumn,
    colorRules, updateColorRule,
    resetSettings,
  } = useExcelExtractorStore()

  const {
    settingsRestoredFrom,
    clearRestoredHint,
  } = useExcelExtractorStore()
  const logActivity = useActivityStore((s) => s.log)
  const savedSelection = useExtractedSelectionStore((s) => s.savedSelection)
  const savedSelectionInitialized = useExtractedSelectionStore((s) => s.isInitialized)
  const savedSelectionLoading = useExtractedSelectionStore((s) => s.isLoading)
  const loadSavedSelection = useExtractedSelectionStore((s) => s.fetchSavedSelection)
  const saveSelection = useExtractedSelectionStore((s) => s.saveSelection)
  const clearSavedSelection = useExtractedSelectionStore((s) => s.clearSavedSelection)
  useExcelExtractorSync()
  useEffect(() => {
    loadSavedSelection()
  }, [loadSavedSelection])

  useEffect(() => {
    try {
      const saved = localStorage.getItem(RESULTS_VIEW_STORAGE_KEY)
      if (saved === "tabs" || saved === "split") setResultsViewMode(saved)
    } catch {
      /* ignore */
    }
  }, [])

  const clearLoadedFileState = useCallback(() => {
    setAllRows([])
    setSelectedKeys(new Set())
    setStep("idle")
  }, [])

  const applySavedSelectionView = useCallback(() => {
    if (!savedSelection?.rows.length) return
    const hdrs = savedSelection.headers
    const rows = savedSelection.rows
    setFileName(savedSelection.fileName)
    setHeaders(hdrs)
    setAllRows(rows)
    setSelectedKeys(new Set(rows.map((_, i) => i)))
    setSelectedColumns(hdrs)
    setFilterColumn("")
    setFilterValue("")
    setActiveTab("selected")
    setPreferSelectedOnly(false)
    setStep("idle")
    savedViewAppliedRef.current = true
  }, [savedSelection, setSelectedColumns, setFilterColumn, setFilterValue])

  // فتح من العمليات الأخيرة — افتراضي على المحدد مرة واحدة
  useEffect(() => {
    if (!openSavedOnly) return
    setActiveTab("selected")
  }, [openSavedOnly])

  // استخراج جديد من الأدوات: لا تفتح ملفاً محفوظاً تلقائياً
  useEffect(() => {
    if (openSavedOnly || initialAttachmentId) return
    clearLoadedFileState()
    setPreferSelectedOnly(false)
    savedViewAppliedRef.current = false
  }, [openSavedOnly, initialAttachmentId, clearLoadedFileState])

  // فقط من «العمليات الأخيرة»: اعرض المحفوظ بعد التحميل
  useEffect(() => {
    if (!openSavedOnly) return
    if (!savedSelectionInitialized || savedSelectionLoading || savedViewAppliedRef.current) return
    if (initialAttachmentId) return
    if (!savedSelection?.rows.length) {
      savedViewAppliedRef.current = true
      return
    }
    applySavedSelectionView()
  }, [
    openSavedOnly,
    savedSelectionInitialized,
    savedSelectionLoading,
    savedSelection,
    initialAttachmentId,
    applySavedSelectionView,
  ])

  // بعد تحميل ملف من مرفق (fileId): طابق الصفوف المحفوظة واعرض نفس واجهة «المحدد»
  useEffect(() => {
    if (!savedSelection?.rows.length || !fileName || allRows.length === 0) return
    if (normalizeBaseName(savedSelection.fileName) !== normalizeBaseName(fileName)) return

    const cols = savedSelection.headers.filter((h) => headers.includes(h))
    const keys = matchSavedRowsToIndices(allRows, headers, savedSelection.rows)
    if (keys.size > 0) {
      setSelectedKeys(keys)
      if (cols.length > 0) setSelectedColumns(cols)
      setActiveTab("selected")
      setPreferSelectedOnly(keys.size < allRows.length)
    }
  }, [savedSelection, fileName, allRows, headers, setSelectedColumns])

  // ── File parsing (async) ─────────────────────────────────────────────────────
  const handleFile = useCallback(async (file: File, skipActivity = false) => {
    setStep("reading")

    // Upload to server in parallel with reading (silent on failure)
    const uploadPromise: Promise<number | undefined> = skipActivity
      ? Promise.resolve(undefined)
      : (async () => {
          try {
            const fd = new FormData()
            fd.append("file", file)
            const res = await apiClient.post("/attachments/upload", fd)
            return (res.data as { data?: { id?: number } })?.data?.id
          } catch {
            return undefined
          }
        })()

    // Read file as ArrayBuffer
    let arrayBuffer: ArrayBuffer
    try {
      arrayBuffer = await new Promise<ArrayBuffer>((resolve, reject) => {
        const reader = new FileReader()
        reader.onload = (e) => resolve(e.target?.result as ArrayBuffer)
        reader.onerror = () => reject(new Error("FileReader error"))
        reader.readAsArrayBuffer(file)
      })
    } catch {
      toast.error("فشل في قراءة الملف")
      setStep("idle")
      return
    }

    setStep("parsing")

    let rows: Record<string, unknown>[]
    let hdrs: string[]
    try {
      const data = new Uint8Array(arrayBuffer)
      const wb   = XLSX.read(data, { type: "array" })
      const ws   = wb.Sheets[wb.SheetNames[0]]
      rows = XLSX.utils.sheet_to_json<Record<string, unknown>>(ws, { defval: "" })
      if (rows.length === 0) { toast.error("الملف فارغ"); setStep("idle"); return }
      hdrs = Object.keys(rows[0])
    } catch {
      toast.error("تعذّر قراءة الملف")
      setStep("idle")
      return
    }

    const baseName = file.name.replace(/\.[^.]+$/, "")
    const { selectedColumns: storedCols } = useExcelExtractorStore.getState()
    const matching = storedCols.filter((c) => hdrs.includes(c))

    setHeaders(hdrs)
    setAllRows(rows)
    setSelectedKeys(new Set())
    setSelectedColumns(matching.length > 0 ? matching : hdrs)
    setFilterColumn("")
    setFilterValue("")
    setFileName(baseName)
    setPreferSelectedOnly(false)
    setActiveTab("browse")
    setStep("idle")
    toast.success(`تم تحميل ${rows.length} صف`)

    if (!skipActivity) {
      void uploadPromise.then((attachmentId) => {
        logActivity({
          tool: "excel-extractor",
          label: `تحميل ${rows.length} صف من "${baseName}"`,
          detail: `${hdrs.length} عمود`,
          attachmentId,
        })
      })
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [logActivity, setFilterColumn, setFilterValue, setSelectedColumns])

  // ── Auto-load from attachment ID (for deep links) ────────────────────────────
  useEffect(() => {
    if (!initialAttachmentId || loadedIdRef.current === initialAttachmentId) return
    loadedIdRef.current = initialAttachmentId

    ;(async () => {
      try {
        const res = await apiClient.get(`/attachments/${initialAttachmentId}`)
        const att = (res.data as { data?: { originalName: string; path: string; mimeType: string } })?.data
        if (!att) throw new Error("not found")
        const fileUrl = getImageUrl(att.path)
        const fetchRes = await fetch(fileUrl)
        if (!fetchRes.ok) throw new Error("download failed")
        const blob = await fetchRes.blob()
        const file = new File(
          [blob],
          att.originalName,
          { type: att.mimeType || "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" }
        )
        await handleFile(file, true)
      } catch {
        toast.error("تعذر تحميل الملف من الخادم")
      }
    })()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialAttachmentId])

  // ── Filter ───────────────────────────────────────────────────────────────────
  const browseFilteredIndices = useMemo(() => {
    const searchTerms = filterValue
      .split(/[\n,،]/)
      .map((v) => v.trim().toLowerCase())
      .filter(Boolean)
    if (searchTerms.length === 0) return allRows.map((_, i) => i)
    return allRows.reduce<number[]>((acc, row, i) => {
      const cols = filterColumn ? [filterColumn] : headers
      const hasMatch = cols.some((c) => {
        const cellValue = String(row[c] ?? "").toLowerCase()
        return searchTerms.some((term) => cellValue.startsWith(term))
      })
      if (hasMatch) acc.push(i)
      return acc
    }, [])
  }, [allRows, filterColumn, filterValue, headers])

  const filteredIndices = browseFilteredIndices

  const filteredRows   = useMemo(() => filteredIndices.map((i) => allRows[i]), [filteredIndices, allRows])
  const visibleHeaders = useMemo(() => headers.filter((h) => selectedColumns.includes(h)), [headers, selectedColumns])
  const visibleRows    = useMemo(() => filteredRows.map((row) => {
    const out: Record<string, unknown> = {}
    visibleHeaders.forEach((h) => { out[h] = row[h] })
    return out
  }), [filteredRows, visibleHeaders])

  // ── Selection ────────────────────────────────────────────────────────────────
  const toggleRow = useCallback((key: number) => {
    setSelectedKeys((prev) => {
      const next = new Set(prev)
      if (next.has(key)) { next.delete(key) } else { next.add(key) }
      return next
    })
  }, [])

  function selectAllVisible() {
    setSelectedKeys((prev) => { const next = new Set(prev); filteredIndices.forEach((k) => next.add(k)); return next })
  }
  function clearAllVisible() {
    setSelectedKeys((prev) => { const next = new Set(prev); filteredIndices.forEach((k) => next.delete(k)); return next })
  }

  const selectedRows = useMemo(() =>
    [...selectedKeys]
      .filter((k) => k < allRows.length)
      .map((k) => {
        const out: Record<string, unknown> = {}
        visibleHeaders.forEach((h) => { out[h] = allRows[k][h] })
        return out
      }),
    [selectedKeys, allRows, visibleHeaders]
  )
  const selectedRowsWithKey = useMemo(
    () =>
      [...selectedKeys]
        .filter((k) => k < allRows.length)
        .map((k) => ({
          key: k,
          row: visibleHeaders.reduce<Record<string, unknown>>((acc, h) => {
            acc[h] = allRows[k][h]
            return acc
          }, {}),
        })),
    [selectedKeys, allRows, visibleHeaders]
  )

  const savedRows = useMemo(() => {
    if (!savedSelection) return []
    return savedSelection.rows
  }, [savedSelection])

  const savedHeaders = useMemo(() => {
    if (!savedSelection) return []
    return savedSelection.headers
  }, [savedSelection])
  const savedRowsWithKey = useMemo(
    () => savedRows.map((row, i) => ({ key: `saved-${i}`, row })),
    [savedRows]
  )
  const selectedTabRows = useMemo(() => {
    if (selectedRowsWithKey.length > 0) return selectedRowsWithKey
    if (openSavedOnly || preferSelectedOnly) return savedRowsWithKey
    return []
  }, [selectedRowsWithKey, savedRowsWithKey, openSavedOnly, preferSelectedOnly])

  const selectedTabHeaders = useMemo(() => {
    if (selectedRowsWithKey.length > 0) {
      return visibleHeaders.length > 0 ? visibleHeaders : headers
    }
    return savedHeaders.length > 0 ? savedHeaders : headers
  }, [selectedRowsWithKey.length, visibleHeaders, headers, savedHeaders])

  const filteredSelectedTabRows = useMemo(() => {
    const searchTerms = filterValue
      .split(/[\n,،]/)
      .map((v) => v.trim().toLowerCase())
      .filter(Boolean)
    if (searchTerms.length === 0) return selectedTabRows
    return selectedTabRows.filter(({ row }) => {
      const cols = filterColumn && selectedTabHeaders.includes(filterColumn)
        ? [filterColumn]
        : selectedTabHeaders
      return cols.some((h) => {
        const cellValue = String(row[h] ?? "").toLowerCase()
        return searchTerms.some((term) => cellValue.startsWith(term))
      })
    })
  }, [selectedTabRows, filterValue, filterColumn, selectedTabHeaders])

  async function handleSaveSelection() {
    if (selectedKeys.size === 0 || selectedRows.length === 0) {
      toast.error("لا توجد صفوف محددة للحفظ")
      return
    }
    try {
      await saveSelection({
        fileName: fileName || "extract",
        headers: visibleHeaders,
        rows: selectedRows,
        savedAt: new Date().toISOString(),
      })
      toast.success(`تم حفظ ${selectedRows.length} صف في قاعدة البيانات`)
    } catch {
      toast.error("تعذر حفظ الصفوف في قاعدة البيانات")
    }
  }

  // ── Color rules ──────────────────────────────────────────────────────────────
  function handleColorSave(rule: ColorRule | null) {
    if (!colorModalCol) return
    updateColorRule(colorModalCol, rule)
    setColorModalCol(null)
  }

  // ── Reset ────────────────────────────────────────────────────────────────────
  function reset() {
    setFileName(""); setHeaders([]); setAllRows([])
    setSelectedKeys(new Set()); setStep("idle")
    setPreferSelectedOnly(false)
    savedViewAppliedRef.current = false
    resetSettings()
  }

  function openAnotherFilePicker() {
    fileInputRef.current?.click()
  }

  const isLoadingFile = step === "reading" || step === "parsing"
  const isFilterActive = filterValue.trim().length > 0
  const hasActiveFileView = !!fileName && visibleHeaders.length > 0 && allRows.length > 0
  const hasSavedView =
    (openSavedOnly || preferSelectedOnly) && savedRows.length > 0 && !hasActiveFileView
  const showSavedLoading = openSavedOnly && (!savedSelectionInitialized || savedSelectionLoading)
  const hasWorkingView = hasActiveFileView || hasSavedView || showSavedLoading
  const showBrowseTab = hasActiveFileView
  const showSelectedSection = hasActiveFileView || hasSavedView
  const canSplitView = showBrowseTab && showSelectedSection

  function handleResultsViewChange(mode: ResultsViewMode) {
    setResultsViewMode(mode)
    try {
      localStorage.setItem(RESULTS_VIEW_STORAGE_KEY, mode)
    } catch {
      /* ignore */
    }
  }
  /** منطقة السحب — فقط عند بدء استخراج جديد */
  const showUploadZone =
    !openSavedOnly &&
    !initialAttachmentId &&
    !hasActiveFileView &&
    !hasSavedView &&
    !isLoadingFile
  /** زر اختيار ملف — عند فتح من العمليات السابقة أو ملف محمّل */
  const showChooseAnotherFile =
    !isLoadingFile &&
    savedSelectionInitialized &&
    !savedSelectionLoading &&
    (openSavedOnly || !!initialAttachmentId || hasActiveFileView || hasSavedView)

  function openColorModal(col: string) {
    setColorModalCol(col)
    setColorModalKey((k) => k + 1)
  }

  // إذا تبويب «جميع الصفوف» غير متاح (عرض محفوظ فقط) انتقل للمحدد
  useEffect(() => {
    if (!showBrowseTab && activeTab === "browse") {
      setActiveTab("selected")
    }
  }, [showBrowseTab, activeTab])

  const selectedSectionTitle =
    selectedRowsWithKey.length > 0
      ? "الصفوف المحددة"
      : savedRows.length > 0
        ? "الصفوف المحفوظة"
        : "الصفوف المحددة"

  const emptySelectedHint =
    canSplitView && resultsViewMode === "split"
      ? "حدّد الصفوف من قسم «جميع الصفوف» أعلاه"
      : "انتقل إلى تبويب «جميع الصفوف» وحدّد ما تريد"

  const browseResultsBlock = showBrowseTab ? (
    <div className={myui.tableWrap}>
      <ResultsTable
        headers={visibleHeaders}
        rows={visibleRows}
        rowKeys={filteredIndices}
        selectedKeys={selectedKeys}
        onToggleRow={toggleRow}
        onSelectAll={selectAllVisible}
        onClearAll={clearAllVisible}
        totalCount={filteredIndices.length}
        colorRules={colorRules}
        onColorHeader={openColorModal}
      />
    </div>
  ) : null

  const selectedResultsBlock = showSelectedSection ? (
    <div className={myui.tableWrap}>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 px-3 sm:px-4 py-3 border-b border-slate-100 dark:border-slate-800 bg-cyan-50/50 dark:bg-cyan-950/20">
        <span className="font-semibold text-sm text-cyan-800 dark:text-cyan-200">
          {selectedSectionTitle}
        </span>
        <div className="flex items-center gap-2 shrink-0">
          <span className={myui.badge}>
            {filteredSelectedTabRows.length}
            {selectedTabRows.length !== filteredSelectedTabRows.length
              ? ` / ${selectedTabRows.length}`
              : ""}
            {" "}صف
          </span>
          {selectedRowsWithKey.length > 0 && (
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6 text-muted-foreground hover:text-destructive"
              onClick={() => setSelectedKeys(new Set())}
            >
              <Trash2 className="w-3.5 h-3.5" />
            </Button>
          )}
          {selectedRowsWithKey.length === 0 && savedRows.length > 0 && (
            <Button
              variant="ghost"
              size="sm"
              className="text-destructive hover:text-destructive"
              onClick={async () => {
                try {
                  await clearSavedSelection()
                  toast.success("تم مسح الصفوف المحفوظة من قاعدة البيانات")
                } catch {
                  toast.error("تعذر مسح الصفوف المحفوظة")
                }
              }}
            >
              مسح الحفظ
            </Button>
          )}
        </div>
      </div>

      {selectedTabRows.length === 0 ? (
        !savedSelectionInitialized || savedSelectionLoading ? (
          <div className="flex items-center justify-center gap-2 py-16 px-6 text-center text-muted-foreground">
            <Loader2 className="w-4 h-4 animate-spin" />
            <p className="text-sm">جاري تحميل الصفوف المحفوظة...</p>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-16 px-6 text-center text-muted-foreground">
            <FileSpreadsheet className="w-10 h-10 mb-3 opacity-20" />
            <p className="text-sm">{emptySelectedHint}</p>
          </div>
        )
      ) : (
        <div className="flex flex-col w-full min-w-0">
          {selectedKeys.size > 0 && (
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 px-3 sm:px-4 py-2 border-b border-slate-100 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-800/30">
              <p className="text-xs text-muted-foreground leading-relaxed">
                احفظ التحديد الحالي ليبقى بعد إعادة تحميل الصفحة
              </p>
              <Button
                size="sm"
                className="w-full sm:w-auto bg-cyan-600 hover:bg-cyan-700 text-white"
                onClick={handleSaveSelection}
              >
                حفظ التحديد
              </Button>
            </div>
          )}
          <SelectedRowsTable
            headers={selectedTabHeaders}
            rows={filteredSelectedTabRows}
            colorRules={colorRules}
            onColorHeader={openColorModal}
            showRemove={selectedKeys.size > 0}
            onRemoveRow={(key) => toggleRow(key)}
          />
          <ExportBar
            attached
            headers={selectedTabHeaders}
            allRows={filteredSelectedTabRows.map(({ row }) => row)}
            selectedRows={[]}
            fileName={
              selectedKeys.size > 0
                ? fileName
                : `${savedSelection?.fileName ?? "saved"}_saved`
            }
            colorRules={colorRules}
          />
        </div>
      )}
    </div>
  ) : null

  return (
    <div className={myui.main}>

      {(fileName || hasSavedView) && !isLoadingFile && (
        <div className={myui.toolbar}>
          {fileName && (
            <span className="text-[10px] sm:text-xs text-muted-foreground flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              حفظ تلقائي للإعدادات
            </span>
          )}
          <span className={cn(myui.badge, "max-w-[min(100%,280px)] truncate")}>
            {fileName || savedSelection?.fileName || "محفوظ"}
          </span>
          <div className="flex flex-wrap items-center gap-2 ms-auto">
            {showChooseAnotherFile && (
              <Button
                variant="outline"
                size="sm"
                className="gap-2 border-slate-200 dark:border-slate-700 hover:border-cyan-500/50"
                onClick={openAnotherFilePicker}
              >
                <RefreshCw className="w-4 h-4" />
                اختيار ملف آخر
              </Button>
            )}
            <Button
              variant="ghost"
              size="sm"
              className="gap-1.5 text-muted-foreground hover:text-red-600"
              onClick={reset}
            >
              <X className="w-4 h-4" />
              إغلاق
            </Button>
          </div>
        </div>
      )}

      {settingsRestoredFrom && (
        <p className="text-xs text-cyan-700 dark:text-cyan-300 px-1">
          تم استعادة إعدادات: {settingsRestoredFrom}
          <button type="button" className="mr-2 underline" onClick={clearRestoredHint}>إخفاء</button>
        </p>
      )}

      {!isLoadingFile && openSavedOnly && savedSelectionInitialized && !savedSelectionLoading && savedRows.length === 0 && (
        <p className="text-sm text-muted-foreground">لا توجد صفوف محفوظة بعد. اختر ملف Excel جديد.</p>
      )}

      {showUploadZone && (
        <MyuiPanel title="رفع ملف Excel" icon={FileSpreadsheet}>
          <FileUploadZone onFile={(f) => { handleFile(f).catch(() => {}) }} />
        </MyuiPanel>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept=".xlsx,.xls"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0]
          if (file) handleFile(file).catch(() => {})
          e.currentTarget.value = ""
        }}
      />

      {isLoadingFile && <ProcessingProgress step={step} />}

      {(hasWorkingView || (openSavedOnly && (savedSelectionLoading || !savedSelectionInitialized))) && (
        <div className="space-y-4 sm:space-y-5">
          {hasActiveFileView && (
            <MyuiPanel title="التصفية والأعمدة" icon={SlidersHorizontal}>
              <FilterPanel
                headers={headers}
                filterColumn={filterColumn}
                filterValue={filterValue}
                selectedColumns={selectedColumns}
                colorRules={colorRules}
                onColorColumn={openColorModal}
                onColumnChange={setFilterColumn}
                onValueChange={setFilterValue}
                onToggleColumn={toggleColumn}
                onClearFilter={() => setFilterValue("")}
              />
            </MyuiPanel>
          )}

          <MyuiPanel title="النتائج" icon={Table2} bodyClassName="p-3 sm:p-4 flex flex-col">
            {canSplitView && resultsViewMode === "split" ? (
              <div className="space-y-5 sm:space-y-6">
                <section className="space-y-2">
                  <div className="flex items-center gap-2 px-1">
                    <h3 className="text-sm font-bold text-foreground">جميع الصفوف</h3>
                    <Badge variant="secondary" className="text-xs tabular-nums">
                      {filteredIndices.length}
                    </Badge>
                    {isFilterActive && (
                      <span className="w-2 h-2 rounded-full bg-amber-400 shrink-0" title="مفلتر" />
                    )}
                  </div>
                  {browseResultsBlock}
                </section>
                <section className="space-y-2">
                  <h3 className="text-sm font-bold text-foreground px-1">{selectedSectionTitle}</h3>
                  {selectedResultsBlock}
                </section>
              </div>
            ) : (
              <Tabs
                value={activeTab}
                onValueChange={(v) => setActiveTab(v as "browse" | "selected")}
                dir="rtl"
              >
                <div className="overflow-x-auto pb-2">
                  <TabsList className={cn(myui.tabsList, "w-full min-w-max sm:min-w-0")}>
                    {showBrowseTab && (
                      <TabsTrigger
                        value="browse"
                        className={cn(myui.tabTrigger, "gap-2 min-w-[130px] sm:min-w-0")}
                      >
                        جميع الصفوف
                        <Badge variant="secondary" className="text-xs tabular-nums">
                          {filteredIndices.length}
                        </Badge>
                        {isFilterActive && (
                          <span className="w-2 h-2 rounded-full bg-amber-400 shrink-0" title="مفلتر" />
                        )}
                      </TabsTrigger>
                    )}
                    {showSelectedSection && (
                      <TabsTrigger
                        value="selected"
                        className={cn(myui.tabTrigger, "gap-2 min-w-[130px] sm:min-w-0")}
                      >
                        {selectedSectionTitle}
                        {selectedTabRows.length > 0 && (
                          <span className={myui.badge}>{selectedTabRows.length}</span>
                        )}
                      </TabsTrigger>
                    )}
                  </TabsList>
                </div>

                {showBrowseTab && (
                  <TabsContent
                    value="browse"
                    forceMount
                    className="mt-3 focus-visible:outline-none data-[state=inactive]:hidden"
                  >
                    {browseResultsBlock}
                  </TabsContent>
                )}

                {showSelectedSection && (
                  <TabsContent
                    value="selected"
                    forceMount
                    className="mt-3 focus-visible:outline-none data-[state=inactive]:hidden"
                  >
                    {selectedResultsBlock}
                  </TabsContent>
                )}
              </Tabs>
            )}

            {canSplitView && (
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-4 mt-4 border-t border-slate-100 dark:border-slate-800">
                <p className="text-sm font-medium text-foreground">طريقة عرض النتائج</p>
                <ResultsViewModeToggle
                  mode={resultsViewMode}
                  onChange={handleResultsViewChange}
                />
              </div>
            )}
          </MyuiPanel>
        </div>
      )}

      {/* ── Color Rule Modal ── */}
      {colorModalCol && (
        <ColorRuleModal
          key={`${colorModalCol}-${colorModalKey}`}
          column={colorModalCol}
          allRows={allRows}
          existingRule={colorRules[colorModalCol]}
          open={!!colorModalCol}
          onClose={() => setColorModalCol(null)}
          onSave={handleColorSave}
        />
      )}
    </div>
  )
}
