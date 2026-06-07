"use client"

import { useRef, useState } from "react"
import { UploadCloud } from "lucide-react"
import { cn } from "myui"
import { myui } from "@/components/myui/myui-styles"

interface FileUploadZoneProps {
  onFile: (file: File) => void
}

export function FileUploadZone({ onFile }: FileUploadZoneProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [dragging, setDragging] = useState(false)

  function handleDrop(e: React.DragEvent) {
    e.preventDefault()
    setDragging(false)
    const file = e.dataTransfer.files[0]
    if (file) onFile(file)
  }

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (file) onFile(file)
  }

  return (
    <div
      className={cn(
        myui.uploadZone,
        dragging && "border-cyan-500 bg-cyan-50/50 dark:bg-cyan-950/30",
      )}
      onDragOver={(e) => { e.preventDefault(); setDragging(true) }}
      onDragLeave={() => setDragging(false)}
      onDrop={handleDrop}
      onClick={() => inputRef.current?.click()}
    >
      <div className="w-12 h-12 rounded-xl bg-cyan-600/10 flex items-center justify-center">
        <UploadCloud className="w-7 h-7 text-cyan-600 dark:text-cyan-400" />
      </div>
      <p className="text-sm font-medium">اسحب ملف Excel هنا أو انقر للاختيار</p>
      <p className="text-xs text-muted-foreground">.xlsx, .xls مدعومان</p>
      <input
        ref={inputRef}
        type="file"
        accept=".xlsx,.xls"
        className="hidden"
        onChange={handleChange}
      />
    </div>
  )
}
