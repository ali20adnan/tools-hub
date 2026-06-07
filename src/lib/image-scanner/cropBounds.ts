/** منطقة الصورة الفعلية داخل حاوية object-fit: contain (نسب 0–1 من الحاوية) */
export type ImageDisplayBounds = {
  left: number
  top: number
  width: number
  height: number
}

/** تحديد منطقة القص كنسب من أبعاد الصورة الأصلية (ليس الحاوية) */
export type CropSelection = {
  x: number
  y: number
  width: number
  height: number
}

export const DEFAULT_CROP_SELECTION: CropSelection = {
  x: 0.08,
  y: 0.08,
  width: 0.84,
  height: 0.84,
}

export function getObjectContainBounds(
  containerW: number,
  containerH: number,
  imageW: number,
  imageH: number,
): ImageDisplayBounds | null {
  if (containerW <= 0 || containerH <= 0 || imageW <= 0 || imageH <= 0) return null

  const containerAspect = containerW / containerH
  const imageAspect = imageW / imageH

  if (imageAspect > containerAspect) {
    const displayH = (containerW / imageAspect) / containerH
    return {
      left: 0,
      top: (1 - displayH) / 2,
      width: 1,
      height: displayH,
    }
  }

  const displayW = (containerH * imageAspect) / containerW
  return {
    left: (1 - displayW) / 2,
    top: 0,
    width: displayW,
    height: 1,
  }
}

export function clampCropSelection(sel: CropSelection): CropSelection {
  const min = 0.08
  let { x, y, width, height } = sel
  width = Math.max(min, Math.min(1, width))
  height = Math.max(min, Math.min(1, height))
  x = Math.max(0, Math.min(1 - width, x))
  y = Math.max(0, Math.min(1 - height, y))
  return { x, y, width, height }
}

export function cropSelectionToContainerStyle(
  sel: CropSelection,
  bounds: ImageDisplayBounds,
): { left: string; top: string; width: string; height: string } {
  return {
    left: `${(bounds.left + sel.x * bounds.width) * 100}%`,
    top: `${(bounds.top + sel.y * bounds.height) * 100}%`,
    width: `${sel.width * bounds.width * 100}%`,
    height: `${sel.height * bounds.height * 100}%`,
  }
}

export function letterboxOverlayStyles(bounds: ImageDisplayBounds) {
  const { left, top, width, height } = bounds
  const right = left + width
  const bottom = top + height
  return {
    top: { left: 0, top: 0, width: "100%", height: `${top * 100}%` },
    bottom: { left: 0, top: `${bottom * 100}%`, width: "100%", height: `${(1 - bottom) * 100}%` },
    left: {
      left: 0,
      top: `${top * 100}%`,
      width: `${left * 100}%`,
      height: `${height * 100}%`,
    },
    right: {
      left: `${right * 100}%`,
      top: `${top * 100}%`,
      width: `${(1 - right) * 100}%`,
      height: `${height * 100}%`,
    },
  }
}
