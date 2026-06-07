"use client"

import { useRef, useState } from "react"
import { ImageIcon, Upload } from "lucide-react"
import { cn } from "myui"
import { myui } from "@/components/myui/myui-styles"
import { Label } from "@/components/ui/label"
import { fieldClass, subPanelClass, subPanelHeader, actionBtnPrimary } from "./image-scanner-ui"

type ImageUploaderProps = {
  onFileSelected: (file: File) => void
}

export function ImageUploader({ onFileSelected }: ImageUploaderProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [fileLabel, setFileLabel] = useState<string | null>(null)

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0]
    if (!selectedFile) return
    setFileLabel(selectedFile.name)
    onFileSelected(selectedFile)
    event.target.value = ""
  }

  return (
    <section className={subPanelClass}>
      <div className={subPanelHeader}>
        <div className="flex items-center gap-2.5">
          <div className={cn(myui.iconBox, "w-8 h-8 bg-cyan-600/10")}>
            <ImageIcon className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />
          </div>
          <span className={cn(myui.sectionTitle, "text-sm")}>رفع صورة</span>
        </div>
      </div>
      <div className="p-3 sm:p-4 space-y-3">
        <div className="space-y-2">
          <Label className="text-xs text-muted-foreground">اختر ملفاً من الجهاز</Label>
          <div
            className={cn(
              fieldClass,
              "flex flex-col sm:flex-row sm:items-center gap-2.5 p-3 border",
            )}
          >
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              className={cn(actionBtnPrimary, "sm:w-auto shrink-0 px-4 py-2 min-h-10")}
            >
              <Upload className="w-4 h-4 shrink-0" />
              <span>اختر ملف</span>
            </button>
            <p
              className={cn(
                "text-sm flex-1 min-w-0 truncate text-start",
                fileLabel
                  ? "text-slate-700 dark:text-slate-200 font-medium"
                  : "text-muted-foreground",
              )}
              title={fileLabel ?? undefined}
            >
              {fileLabel ?? "لم يتم اختيار ملف"}
            </p>
          </div>
          <input
            ref={inputRef}
            id="imageUpload"
            type="file"
            accept="image/jpeg,image/png,image/webp,image/tiff"
            className="hidden"
            onChange={handleInputChange}
          />
        </div>
        {fileLabel ? (
          <p className="text-xs text-cyan-700 dark:text-cyan-300 truncate">
            الملف المحدد: {fileLabel}
          </p>
        ) : null}
        <p className="text-xs text-muted-foreground">صيغ مدعومة: JPG، PNG، WEBP، TIFF</p>
      </div>
    </section>
  )
}
