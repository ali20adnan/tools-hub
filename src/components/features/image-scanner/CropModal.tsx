"use client"

import Image from "next/image"
import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import { Button, cn } from "myui"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  clampCropSelection,
  cropSelectionToContainerStyle,
  DEFAULT_CROP_SELECTION,
  getObjectContainBounds,
  letterboxOverlayStyles,
  type CropSelection,
  type ImageDisplayBounds,
} from "@/lib/image-scanner/cropBounds"

type HandleType = "top-left" | "top-right" | "bottom-left" | "bottom-right"
type DragMode =
  | { kind: "resize"; handle: HandleType }
  | { kind: "move" }

type CropModalProps = {
  imageUrl: string
  initialSelection?: CropSelection | null
  onClose: () => void
  onApply: (selection: CropSelection) => void
}

const MIN_SIZE = 0.08

const HANDLE_HIT = 44
const HANDLE_VIS = 14

const CORNER_POS: Record<
  HandleType,
  { className: string; cursor: string }
> = {
  "top-left": { className: "left-0 top-0", cursor: "nwse-resize" },
  "top-right": { className: "right-0 top-0", cursor: "nesw-resize" },
  "bottom-left": { className: "left-0 bottom-0", cursor: "nesw-resize" },
  "bottom-right": { className: "right-0 bottom-0", cursor: "nwse-resize" },
}

function updateSelectionFromResize(
  handle: HandleType,
  deltaX: number,
  deltaY: number,
  initial: CropSelection,
): CropSelection {
  let { x, y, width, height } = initial

  if (handle === "top-left") {
    x = initial.x + deltaX
    y = initial.y + deltaY
    width = initial.width - deltaX
    height = initial.height - deltaY
  } else if (handle === "top-right") {
    y = initial.y + deltaY
    width = initial.width + deltaX
    height = initial.height - deltaY
  } else if (handle === "bottom-left") {
    x = initial.x + deltaX
    width = initial.width - deltaX
    height = initial.height + deltaY
  } else {
    width = initial.width + deltaX
    height = initial.height + deltaY
  }

  return clampCropSelection({
    x,
    y,
    width: Math.max(MIN_SIZE, width),
    height: Math.max(MIN_SIZE, height),
  })
}

function CropCornerHandle({
  corner,
  onPointerDown,
}: {
  corner: HandleType
  onPointerDown: (event: React.PointerEvent<HTMLDivElement>, corner: HandleType) => void
}) {
  const { className, cursor } = CORNER_POS[corner]
  const offset = HANDLE_HIT / 2

  return (
    <div
      role="button"
      tabIndex={0}
      aria-label={`مقبض ${corner}`}
      className={cn("absolute z-30 flex items-center justify-center", className, cursor)}
      style={{
        width: HANDLE_HIT,
        height: HANDLE_HIT,
        marginLeft: corner.includes("left") ? -offset : undefined,
        marginRight: corner.includes("right") ? -offset : undefined,
        marginTop: corner.includes("top") ? -offset : undefined,
        marginBottom: corner.includes("bottom") ? -offset : undefined,
        touchAction: "none",
      }}
      onPointerDown={(e) => onPointerDown(e, corner)}
    >
      <span
        className="rounded-full border-2 border-white bg-cyan-600 shadow-md pointer-events-none block"
        style={{ width: HANDLE_VIS, height: HANDLE_VIS }}
      />
    </div>
  )
}

export function CropModal({ imageUrl, initialSelection, onClose, onApply }: CropModalProps) {
  const containerRef = useRef<HTMLDivElement | null>(null)
  const [naturalSize, setNaturalSize] = useState<{ w: number; h: number } | null>(null)
  const [containerSize, setContainerSize] = useState<{ w: number; h: number } | null>(null)
  const [selection, setSelection] = useState<CropSelection>(
    clampCropSelection(initialSelection ?? DEFAULT_CROP_SELECTION),
  )
  const dragRef = useRef<{
    mode: DragMode
    startX: number
    startY: number
    initial: CropSelection
  } | null>(null)

  const measureContainer = useCallback(() => {
    const el = containerRef.current
    if (!el) return
    const rect = el.getBoundingClientRect()
    setContainerSize({ w: rect.width, h: rect.height })
  }, [])

  useEffect(() => {
    measureContainer()
    const el = containerRef.current
    if (!el) return
    const ro = new ResizeObserver(() => measureContainer())
    ro.observe(el)
    return () => ro.disconnect()
  }, [measureContainer])

  const imageBounds: ImageDisplayBounds | null = useMemo(() => {
    if (!naturalSize || !containerSize) return null
    return getObjectContainBounds(
      containerSize.w,
      containerSize.h,
      naturalSize.w,
      naturalSize.h,
    )
  }, [naturalSize, containerSize])

  const overlayStyle = useMemo(() => {
    if (!imageBounds) return null
    return cropSelectionToContainerStyle(selection, imageBounds)
  }, [selection, imageBounds])

  const letterbox = useMemo(
    () => (imageBounds ? letterboxOverlayStyles(imageBounds) : null),
    [imageBounds],
  )

  const handleImageLoad = (event: React.SyntheticEvent<HTMLImageElement>) => {
    const img = event.currentTarget
    setNaturalSize({ w: img.naturalWidth, h: img.naturalHeight })
    measureContainer()
  }

  const getImageDeltas = (clientX: number, clientY: number, startX: number, startY: number) => {
    const area = containerRef.current
    if (!area || !imageBounds) return { deltaX: 0, deltaY: 0 }
    const rect = area.getBoundingClientRect()
    if (rect.width <= 0 || rect.height <= 0) return { deltaX: 0, deltaY: 0 }
    return {
      deltaX: (clientX - startX) / (rect.width * imageBounds.width),
      deltaY: (clientY - startY) / (rect.height * imageBounds.height),
    }
  }

  const handlePointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
    const drag = dragRef.current
    if (!drag) return

    const { deltaX, deltaY } = getImageDeltas(
      event.clientX,
      event.clientY,
      drag.startX,
      drag.startY,
    )

    if (drag.mode.kind === "move") {
      setSelection(
        clampCropSelection({
          x: drag.initial.x + deltaX,
          y: drag.initial.y + deltaY,
          width: drag.initial.width,
          height: drag.initial.height,
        }),
      )
      return
    }

    setSelection(
      updateSelectionFromResize(drag.mode.handle, deltaX, deltaY, drag.initial),
    )
  }

  const startDrag = (
    event: React.PointerEvent<HTMLDivElement>,
    mode: DragMode,
  ) => {
    event.preventDefault()
    event.stopPropagation()
    dragRef.current = {
      mode,
      startX: event.clientX,
      startY: event.clientY,
      initial: selection,
    }
    containerRef.current?.setPointerCapture(event.pointerId)
  }

  const handleCornerPointerDown = (
    event: React.PointerEvent<HTMLDivElement>,
    corner: HandleType,
  ) => {
    event.stopPropagation()
    startDrag(event, { kind: "resize", handle: corner })
  }

  const handleMovePointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
    startDrag(event, { kind: "move" })
  }

  const stopDrag = (event: React.PointerEvent<HTMLDivElement>) => {
    if (!dragRef.current) return
    dragRef.current = null
    if (containerRef.current?.hasPointerCapture(event.pointerId)) {
      containerRef.current.releasePointerCapture(event.pointerId)
    }
  }

  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-[min(900px,95vw)] gap-4" dir="rtl">
        <DialogHeader>
          <DialogTitle>قص الصورة</DialogTitle>
          <DialogDescription>
            اسحب الزوايا لتغيير الحجم، أو اسحب داخل الإطار لتحريك منطقة القص.
          </DialogDescription>
        </DialogHeader>

        <div
          ref={containerRef}
          className="relative w-full aspect-[4/3] max-h-[min(60vh,480px)] touch-none"
          onPointerMove={handlePointerMove}
          onPointerUp={stopDrag}
          onPointerCancel={stopDrag}
          onLostPointerCapture={stopDrag}
        >
          <div className="absolute inset-0 overflow-hidden rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-200/80 dark:bg-slate-800">
            <Image
              src={imageUrl}
              alt="معاينة القص"
              fill
              unoptimized
              className="object-contain pointer-events-none select-none"
              onLoad={handleImageLoad}
            />

            {letterbox &&
              (["top", "bottom", "left", "right"] as const).map((side) => (
                <div
                  key={side}
                  className="absolute bg-slate-900/45 pointer-events-none z-[5]"
                  style={letterbox[side]}
                />
              ))}
          </div>

          {imageBounds && overlayStyle && (
            <div
              dir="ltr"
              className="absolute z-10 box-border ring-2 ring-cyan-500 bg-cyan-500/10 cursor-move"
              style={overlayStyle}
              onPointerDown={handleMovePointerDown}
            >
              <div className="absolute inset-0 pointer-events-none border border-cyan-400/80" />

              {(
                ["top-left", "top-right", "bottom-left", "bottom-right"] as HandleType[]
              ).map((corner) => (
                <CropCornerHandle
                  key={corner}
                  corner={corner}
                  onPointerDown={handleCornerPointerDown}
                />
              ))}
            </div>
          )}
        </div>

        <DialogFooter className="gap-2 sm:gap-2">
          <Button type="button" variant="ghost" onClick={onClose} className="rounded-xl">
            إلغاء
          </Button>
          <Button
            type="button"
            onClick={() => onApply(clampCropSelection(selection))}
            disabled={!naturalSize}
            className="rounded-xl bg-cyan-600 hover:bg-cyan-700"
          >
            تطبيق القص
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
