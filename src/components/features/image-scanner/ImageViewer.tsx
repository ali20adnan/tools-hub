"use client"

import Image from "next/image"
import { useEffect, useRef } from "react"
import type { CSSProperties } from "react"
import { ImageIcon } from "lucide-react"
import { cn } from "myui"
import { viewerFrameClass } from "./image-scanner-ui"

type ImageViewerProps = {
  imageUrl: string | null
  transformStyle: CSSProperties
  isDragActive: boolean
  isPanning: boolean
  onFileDrop: (file: File) => void
  onDragStateChange: (isActive: boolean) => void
  onWheelZoom: (deltaY: number) => void
  onPanStart: (x: number, y: number) => void
  onPanMove: (x: number, y: number) => void
  onPanEnd: () => void
}

export function ImageViewer({
  imageUrl,
  transformStyle,
  isDragActive,
  isPanning,
  onFileDrop,
  onDragStateChange,
  onWheelZoom,
  onPanStart,
  onPanMove,
  onPanEnd,
}: ImageViewerProps) {
  const viewerFrameRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    const viewerFrame = viewerFrameRef.current
    if (!viewerFrame) return

    const handleWheel = (event: WheelEvent) => {
      event.preventDefault()
      onWheelZoom(event.deltaY)
    }

    viewerFrame.addEventListener("wheel", handleWheel, { passive: false })
    return () => viewerFrame.removeEventListener("wheel", handleWheel)
  }, [onWheelZoom])

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault()
    onDragStateChange(true)
  }

  const handleDragLeave = () => onDragStateChange(false)

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault()
    onDragStateChange(false)
    const droppedFile = event.dataTransfer.files?.[0]
    if (droppedFile) onFileDrop(droppedFile)
  }

  if (!imageUrl) {
    return (
      <div
        className={cn(
          viewerFrameClass,
          "flex flex-col items-center justify-center gap-2 p-6 text-center transition-colors",
          isDragActive && "border-cyan-500 bg-cyan-50/40 dark:bg-cyan-950/30",
        )}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <div className="w-12 h-12 rounded-xl bg-cyan-600/10 flex items-center justify-center">
          <ImageIcon className="w-7 h-7 text-cyan-600/70 dark:text-cyan-400/70" />
        </div>
        <p className="text-sm font-medium text-slate-700 dark:text-slate-200">لم يتم اختيار صورة بعد</p>
        <p className="text-xs text-muted-foreground max-w-xs">
          اسحب الصورة وأفلتها هنا، أو ارفعها من مركز التحكم
        </p>
      </div>
    )
  }

  return (
    <div
      ref={viewerFrameRef}
      className={cn(viewerFrameClass, isPanning ? "cursor-grabbing" : "cursor-grab")}
      onPointerDown={(e) => onPanStart(e.clientX, e.clientY)}
      onPointerMove={(e) => onPanMove(e.clientX, e.clientY)}
      onPointerUp={onPanEnd}
      onPointerLeave={onPanEnd}
    >
      <Image
        src={imageUrl}
        alt="معاينة الصورة"
        fill
        sizes="(max-width: 768px) 100vw, 960px"
        unoptimized
        style={transformStyle}
        className="object-contain"
      />
    </div>
  )
}
