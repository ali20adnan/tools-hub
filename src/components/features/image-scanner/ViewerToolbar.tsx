"use client"

import { Crop, FlipHorizontal2, FlipVertical2, Loader2, RotateCcw, Save } from "lucide-react"
import { cn } from "myui"
import {
  actionBtnGhost,
  actionBtnPrimary,
  pillBtn,
} from "./image-scanner-ui"

type ViewerToolbarProps = {
  disabled?: boolean
  isSaving?: boolean
  cropPreparing?: boolean
  scale: number
  rotation: number
  flipX: boolean
  flipY: boolean
  onScaleChange: (value: number) => void
  onRotationChange: (value: number) => void
  onFlipXChange: (enabled: boolean) => void
  onFlipYChange: (enabled: boolean) => void
  onOpenCrop: () => void
  onReset: () => void
  onSaveImage: () => void
}

const rangeClass =
  "w-full h-2 rounded-lg appearance-none bg-slate-200 dark:bg-slate-700 accent-cyan-600 cursor-pointer disabled:opacity-50"

export function ViewerToolbar({
  disabled = false,
  isSaving = false,
  cropPreparing = false,
  scale,
  rotation,
  flipX,
  flipY,
  onScaleChange,
  onRotationChange,
  onFlipXChange,
  onFlipYChange,
  onOpenCrop,
  onReset,
  onSaveImage,
}: ViewerToolbarProps) {
  return (
    <div className="space-y-3">
      <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900/50 p-3 space-y-3">
        <label className="block text-xs font-medium text-muted-foreground">
          التكبير: {Math.round(scale * 100)}%
          <input
            type="range"
            min={20}
            max={300}
            step={1}
            value={Math.round(scale * 100)}
            onChange={(e) => onScaleChange(Number(e.target.value) / 100)}
            disabled={disabled}
            className={cn(rangeClass, "mt-2")}
          />
        </label>
        <label className="block text-xs font-medium text-muted-foreground">
          الدوران: {Math.round(rotation)}°
          <input
            type="range"
            min={0}
            max={360}
            step={1}
            value={Math.round(rotation)}
            onChange={(e) => onRotationChange(Number(e.target.value))}
            disabled={disabled}
            className={cn(rangeClass, "mt-2")}
          />
        </label>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <button
          type="button"
          disabled={disabled}
          onClick={() => onFlipXChange(!flipX)}
          className={cn(
            "min-h-10 px-3 py-2.5 rounded-xl text-xs font-medium border transition-colors",
            "inline-flex items-center justify-center gap-2",
            pillBtn(flipX),
          )}
        >
          <FlipHorizontal2 className="w-3.5 h-3.5 shrink-0" />
          <span className="truncate">قلب أفقي</span>
        </button>
        <button
          type="button"
          disabled={disabled}
          onClick={() => onFlipYChange(!flipY)}
          className={cn(
            "min-h-10 px-3 py-2.5 rounded-xl text-xs font-medium border transition-colors",
            "inline-flex items-center justify-center gap-2",
            pillBtn(flipY),
          )}
        >
          <FlipVertical2 className="w-3.5 h-3.5 shrink-0" />
          <span className="truncate">قلب عمودي</span>
        </button>
      </div>

      <div className="flex flex-col gap-2">
        <button
          type="button"
          disabled={disabled}
          onClick={onReset}
          className={actionBtnGhost}
        >
          <RotateCcw className="w-4 h-4 shrink-0" />
          <span>إعادة ضبط</span>
        </button>
        <button
          type="button"
          disabled={disabled || cropPreparing}
          onClick={onOpenCrop}
          className={actionBtnGhost}
        >
          {cropPreparing ? (
            <Loader2 className="w-4 h-4 shrink-0 animate-spin" />
          ) : (
            <Crop className="w-4 h-4 shrink-0" />
          )}
          <span>{cropPreparing ? "جاري التجهيز…" : "قص"}</span>
        </button>
        <button
          type="button"
          disabled={disabled || isSaving}
          onClick={onSaveImage}
          className={actionBtnPrimary}
        >
          {isSaving ? (
            <Loader2 className="w-4 h-4 shrink-0 animate-spin" />
          ) : (
            <Save className="w-4 h-4 shrink-0" />
          )}
          <span>{isSaving ? "جاري الحفظ…" : "حفظ الصورة"}</span>
        </button>
      </div>
    </div>
  )
}
