"use client"

import { createContext, useContext, useEffect, useMemo, useRef, useState } from "react"
import type { CSSProperties } from "react"
import { SlidersHorizontal } from "lucide-react"
import { cn } from "myui"
import { myui } from "@/components/myui/myui-styles"
import { useActivityStore } from "@/store/activity/activityStore"
import { BridgeConnectionStatus } from "@/components/features/image-scanner/BridgeConnectionStatus"
import { PrinterConnectionStatus } from "@/components/features/image-scanner/PrinterConnectionStatus"
import { BridgeScanPanel } from "@/components/features/image-scanner/BridgeScanPanel"
import { useBridgeHealth } from "@/hooks/image-scanner/useBridgeHealth"
import { usePrinterHealth } from "@/hooks/image-scanner/usePrinterHealth"
import { ImageUploader } from "@/components/features/image-scanner/ImageUploader"
import { CropModal } from "@/components/features/image-scanner/CropModal"
import { ImageViewer } from "@/components/features/image-scanner/ImageViewer"
import { ViewerToolbar } from "@/components/features/image-scanner/ViewerToolbar"
import { useImageTransforms } from "@/hooks/image-scanner/useImageTransforms"
import { validateImageFile } from "@/lib/image-scanner/fileValidation"
import { renderTransformedImageToBlob } from "@/lib/image-scanner/renderTransformedImage"
import type { CropSelection } from "@/lib/image-scanner/cropBounds"
import type { ImageFileState } from "@/types/image-scanner/image"
import { subPanelClass, subPanelHeader } from "./image-scanner-ui"

type ScannerCtx = {
  imageState: ImageFileState | null
  error: string | null
  isDragActive: boolean
  isSavingImage: boolean
  isPanning: boolean
  isCropModalOpen: boolean
  cropPreviewUrl: string | null
  cropPreparing: boolean
  cropSelection: CropSelection | null
  panOffset: { x: number; y: number }
  mergedTransformStyle: CSSProperties
  transforms: ReturnType<typeof useImageTransforms>["transforms"]
  actions: ReturnType<typeof useImageTransforms>["actions"]
  bridgeHealth: ReturnType<typeof useBridgeHealth>
  printerHealth: ReturnType<typeof usePrinterHealth>
  handleFileSelected: (file: File) => void
  handleWheelZoom: (deltaY: number) => void
  handlePanStart: (x: number, y: number) => void
  handlePanMove: (x: number, y: number) => void
  handlePanEnd: () => void
  handleResetAll: () => void
  handleOpenCropModal: () => void
  handleApplyCrop: (sel: CropSelection) => Promise<void>
  handleSaveImage: () => Promise<void>
  closeCropModal: () => void
  setIsDragActive: (v: boolean) => void
  setError: (v: string | null) => void
}

const ScannerContext = createContext<ScannerCtx | null>(null)

function useScannerContext() {
  const ctx = useContext(ScannerContext)
  if (!ctx) throw new Error("Must be inside ImageScannerProvider")
  return ctx
}

export function ImageScannerProvider({ children }: { children: React.ReactNode }) {
  const logActivity = useActivityStore((s) => s.log)
  const bridgeHealth = useBridgeHealth()
  const printerHealth = usePrinterHealth()
  const [imageState, setImageState] = useState<ImageFileState | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isDragActive, setIsDragActive] = useState(false)
  const [isSavingImage, setIsSavingImage] = useState(false)
  const [isPanning, setIsPanning] = useState(false)
  const [isCropModalOpen, setIsCropModalOpen] = useState(false)
  const [cropPreviewUrl, setCropPreviewUrl] = useState<string | null>(null)
  const [cropPreparing, setCropPreparing] = useState(false)
  const [cropSelection, setCropSelection] = useState<CropSelection | null>(null)
  const [panOffset, setPanOffset] = useState({ x: 0, y: 0 })
  const panStartRef = useRef({ x: 0, y: 0 })
  const { transforms, transformStyle, actions } = useImageTransforms()

  useEffect(() => {
    return () => { if (imageState?.previewUrl) URL.revokeObjectURL(imageState.previewUrl) }
  }, [imageState])

  useEffect(() => {
    return () => { if (cropPreviewUrl) URL.revokeObjectURL(cropPreviewUrl) }
  }, [cropPreviewUrl])

  function closeCropModal() {
    setIsCropModalOpen(false)
    if (cropPreviewUrl) { URL.revokeObjectURL(cropPreviewUrl); setCropPreviewUrl(null) }
  }

  const logImageLoaded = (file: File, source: string) => {
    logActivity({ tool: "image-scanner", label: `صورة — ${file.name}`, detail: `${source} · ${(file.size / 1024).toFixed(0)} KB` })
  }

  const applyImageFile = (file: File, source = "رفع") => {
    const validationError = validateImageFile(file)
    if (validationError) { setError(validationError); return }
    setError(null)
    actions.reset()
    setPanOffset({ x: 0, y: 0 })
    setCropSelection(null)
    setIsCropModalOpen(false)
    setImageState((current) => {
      if (current?.previewUrl) URL.revokeObjectURL(current.previewUrl)
      return { file, previewUrl: URL.createObjectURL(file) }
    })
    logImageLoaded(file, source)
  }

  const handleFileSelected = (file: File) => applyImageFile(file, "رفع")

  const handleWheelZoom = (deltaY: number) => {
    if (!imageState) return
    if (deltaY < 0) actions.zoomIn(); else actions.zoomOut()
  }

  const handlePanStart = (x: number, y: number) => {
    if (!imageState) return
    setIsPanning(true)
    panStartRef.current = { x: x - panOffset.x, y: y - panOffset.y }
  }

  const handlePanMove = (x: number, y: number) => {
    if (!isPanning) return
    setPanOffset({ x: x - panStartRef.current.x, y: y - panStartRef.current.y })
  }

  const handlePanEnd = () => setIsPanning(false)

  const handleResetAll = () => {
    actions.reset()
    setPanOffset({ x: 0, y: 0 })
    setCropSelection(null)
    setIsCropModalOpen(false)
  }

  const handleOpenCropModal = async () => {
    if (!imageState?.previewUrl || cropPreparing) return
    setCropPreparing(true)
    setError(null)
    try {
      if (cropPreviewUrl) { URL.revokeObjectURL(cropPreviewUrl); setCropPreviewUrl(null) }
      const blob = await renderTransformedImageToBlob(imageState.previewUrl, transforms, "image/png")
      setCropPreviewUrl(URL.createObjectURL(blob))
      setIsCropModalOpen(true)
    } catch { setError("تعذر تجهيز معاينة القص. حاول مرة أخرى.") }
    finally { setCropPreparing(false) }
  }

  const handleApplyCrop = async (selection: CropSelection) => {
    const sourceUrl = cropPreviewUrl ?? imageState?.previewUrl
    if (!sourceUrl || !imageState) return
    try {
      const sourceImage = new Image()
      sourceImage.src = sourceUrl
      await sourceImage.decode()
      const sx = Math.round(sourceImage.naturalWidth * selection.x)
      const sy = Math.round(sourceImage.naturalHeight * selection.y)
      const sw = Math.max(1, Math.round(sourceImage.naturalWidth * selection.width))
      const sh = Math.max(1, Math.round(sourceImage.naturalHeight * selection.height))
      const canvas = document.createElement("canvas")
      canvas.width = sw; canvas.height = sh
      const ctx = canvas.getContext("2d")
      if (!ctx) throw new Error("canvas_context_error")
      ctx.drawImage(sourceImage, sx, sy, sw, sh, 0, 0, sw, sh)
      const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/png"))
      if (!blob) throw new Error("blob_creation_error")
      const croppedFile = new File([blob], `${imageState.file.name.replace(/\.[^/.]+$/, "")}-crop.png`, { type: "image/png" })
      setImageState((current) => {
        if (current?.previewUrl) URL.revokeObjectURL(current.previewUrl)
        return { file: croppedFile, previewUrl: URL.createObjectURL(croppedFile) }
      })
      actions.reset(); setPanOffset({ x: 0, y: 0 }); setCropSelection(selection); closeCropModal(); setError(null)
      logImageLoaded(croppedFile, "قص")
    } catch { setError("تعذر تطبيق القص. حاول تحديد المنطقة مرة أخرى.") }
  }

  const mergedTransformStyle = useMemo<CSSProperties>(() => {
    const translate = `translate(${panOffset.x}px, ${panOffset.y}px)`
    const baseTransform = typeof transformStyle.transform === "string" ? transformStyle.transform : ""
    return { ...transformStyle, transform: `${translate} ${baseTransform}`.trim(), transition: isPanning ? "none" : "transform 180ms ease" }
  }, [transformStyle, panOffset, isPanning])

  const handleSaveImage = async () => {
    if (!imageState?.previewUrl || isSavingImage) return
    setIsSavingImage(true)
    try {
      const sourceImage = new Image()
      sourceImage.src = imageState.previewUrl
      await sourceImage.decode()
      const radians = (transforms.rotation * Math.PI) / 180
      const absCos = Math.abs(Math.cos(radians))
      const absSin = Math.abs(Math.sin(radians))
      const sw = sourceImage.naturalWidth * transforms.scale
      const sh = sourceImage.naturalHeight * transforms.scale
      const ow = Math.max(1, Math.round(sw * absCos + sh * absSin))
      const oh = Math.max(1, Math.round(sw * absSin + sh * absCos))
      const canvas = document.createElement("canvas")
      canvas.width = ow; canvas.height = oh
      const ctx = canvas.getContext("2d")
      if (!ctx) throw new Error("canvas_context_error")
      ctx.translate(ow / 2, oh / 2)
      ctx.rotate(radians)
      ctx.scale(transforms.flipX ? -transforms.scale : transforms.scale, transforms.flipY ? -transforms.scale : transforms.scale)
      ctx.drawImage(sourceImage, -sourceImage.naturalWidth / 2, -sourceImage.naturalHeight / 2, sourceImage.naturalWidth, sourceImage.naturalHeight)
      const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/png"))
      if (!blob) throw new Error("blob_creation_error")
      const downloadUrl = URL.createObjectURL(blob)
      const anchor = document.createElement("a")
      anchor.href = downloadUrl
      anchor.download = `${imageState.file.name.replace(/\.[^/.]+$/, "")}-edited.png`
      anchor.click()
      URL.revokeObjectURL(downloadUrl)
      logActivity({ tool: "image-scanner", label: "تصدير صورة معدّلة", detail: imageState.file.name })
    } catch { setError("تعذر حفظ الصورة بعد التعديلات. حاول مرة أخرى.") }
    finally { setIsSavingImage(false) }
  }

  return (
    <ScannerContext.Provider value={{
      imageState, error, isDragActive, isSavingImage, isPanning,
      isCropModalOpen, cropPreviewUrl, cropPreparing, cropSelection,
      panOffset, mergedTransformStyle, transforms, actions,
      bridgeHealth, printerHealth,
      handleFileSelected, handleWheelZoom, handlePanStart, handlePanMove,
      handlePanEnd, handleResetAll, handleOpenCropModal, handleApplyCrop,
      handleSaveImage, closeCropModal, setIsDragActive, setError,
    }}>
      {children}
    </ScannerContext.Provider>
  )
}

export function ImageScannerControls() {
  const {
    bridgeHealth, printerHealth, error,
    handleFileSelected, setError, transforms, actions,
    isSavingImage, cropPreparing, handleResetAll, handleOpenCropModal, handleSaveImage,
    imageState,
  } = useScannerContext()

  return (
    <div className="space-y-4">
      <ImageUploader onFileSelected={handleFileSelected} />

      <BridgeScanPanel
        onScannedImage={(file) => handleFileSelected(file)}
        onBridgeError={setError}
        bridgeConnected={bridgeHealth.state === "connected"}
        bridgeChecking={bridgeHealth.state === "checking"}
      />

      <BridgeConnectionStatus
        state={bridgeHealth.state}
        lastCheckedAt={bridgeHealth.lastCheckedAt}
        onRefresh={bridgeHealth.refresh}
      />

      <PrinterConnectionStatus
        state={printerHealth.state}
        lastCheckedAt={printerHealth.lastCheckedAt}
        onRefresh={printerHealth.refresh}
      />

      {error ? (
        <div className="rounded-xl border border-red-500/30 bg-red-50/80 dark:bg-red-950/30 px-3 py-2.5 text-sm text-red-700 dark:text-red-300">
          {error}
        </div>
      ) : null}

      <section className={subPanelClass}>
        <div className={subPanelHeader}>
          <div className="flex items-center gap-2.5">
            <div className={cn(myui.iconBox, "w-8 h-8 bg-cyan-600/10")}>
              <SlidersHorizontal className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />
            </div>
            <span className={cn(myui.sectionTitle, "text-sm")}>أدوات المعالجة</span>
          </div>
        </div>
        <div className="p-3 sm:p-4">
          <ViewerToolbar
            disabled={!imageState}
            isSaving={isSavingImage}
            scale={transforms.scale}
            rotation={transforms.rotation}
            flipX={transforms.flipX}
            flipY={transforms.flipY}
            onScaleChange={actions.setScale}
            onRotationChange={actions.setRotation}
            onFlipXChange={actions.setFlipX}
            onFlipYChange={actions.setFlipY}
            cropPreparing={cropPreparing}
            onOpenCrop={() => void handleOpenCropModal()}
            onReset={handleResetAll}
            onSaveImage={handleSaveImage}
          />
        </div>
      </section>
    </div>
  )
}

export function ImageScannerPreview() {
  const {
    imageState, mergedTransformStyle, isDragActive, isPanning,
    handleFileSelected, setIsDragActive, handleWheelZoom,
    handlePanStart, handlePanMove, handlePanEnd,
    isCropModalOpen, cropPreviewUrl, cropSelection,
    closeCropModal, handleApplyCrop,
  } = useScannerContext()

  return (
    <>
      <ImageViewer
        imageUrl={imageState?.previewUrl ?? null}
        transformStyle={mergedTransformStyle}
        isDragActive={isDragActive}
        isPanning={isPanning}
        onFileDrop={handleFileSelected}
        onDragStateChange={setIsDragActive}
        onWheelZoom={handleWheelZoom}
        onPanStart={handlePanStart}
        onPanMove={handlePanMove}
        onPanEnd={handlePanEnd}
      />

      {isCropModalOpen && cropPreviewUrl ? (
        <CropModal
          imageUrl={cropPreviewUrl}
          initialSelection={cropSelection}
          onClose={closeCropModal}
          onApply={handleApplyCrop}
        />
      ) : null}
    </>
  )
}
