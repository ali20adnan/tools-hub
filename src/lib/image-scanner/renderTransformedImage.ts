import type { ImageTransforms } from "@/types/image-scanner/image"

export function transformsAreDefault(transforms: ImageTransforms): boolean {
  return (
    transforms.rotation === 0 &&
    transforms.scale === 1 &&
    !transforms.flipX &&
    !transforms.flipY
  )
}

/** يرسم الصورة مع التكبير/الدوران/القلب كما في المعاينة (بدون إزاحة السحب) */
export async function renderTransformedImageToBlob(
  imageUrl: string,
  transforms: ImageTransforms,
  mime: string = "image/png",
): Promise<Blob> {
  const sourceImage = new Image()
  sourceImage.src = imageUrl
  await sourceImage.decode()

  if (transformsAreDefault(transforms)) {
    const flat = document.createElement("canvas")
    flat.width = sourceImage.naturalWidth
    flat.height = sourceImage.naturalHeight
    const ctx = flat.getContext("2d")
    if (!ctx) throw new Error("canvas_context_error")
    ctx.drawImage(sourceImage, 0, 0)
    const blob = await canvasToBlob(flat, mime)
    if (!blob) throw new Error("blob_creation_error")
    return blob
  }

  const radians = (transforms.rotation * Math.PI) / 180
  const absCos = Math.abs(Math.cos(radians))
  const absSin = Math.abs(Math.sin(radians))

  const scaledWidth = sourceImage.naturalWidth * transforms.scale
  const scaledHeight = sourceImage.naturalHeight * transforms.scale

  const outputWidth = Math.max(1, Math.round(scaledWidth * absCos + scaledHeight * absSin))
  const outputHeight = Math.max(1, Math.round(scaledWidth * absSin + scaledHeight * absCos))

  const canvas = document.createElement("canvas")
  canvas.width = outputWidth
  canvas.height = outputHeight

  const context = canvas.getContext("2d")
  if (!context) throw new Error("canvas_context_error")

  context.translate(outputWidth / 2, outputHeight / 2)
  context.rotate(radians)
  context.scale(
    transforms.flipX ? -transforms.scale : transforms.scale,
    transforms.flipY ? -transforms.scale : transforms.scale,
  )
  context.drawImage(
    sourceImage,
    -sourceImage.naturalWidth / 2,
    -sourceImage.naturalHeight / 2,
    sourceImage.naturalWidth,
    sourceImage.naturalHeight,
  )

  const blob = await canvasToBlob(canvas, mime)
  if (!blob) throw new Error("blob_creation_error")
  return blob
}

function canvasToBlob(canvas: HTMLCanvasElement, mime: string): Promise<Blob | null> {
  return new Promise((resolve) => canvas.toBlob(resolve, mime))
}
