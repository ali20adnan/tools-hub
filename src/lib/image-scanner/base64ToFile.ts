function extensionForMime(mime: string): string {
  if (mime === "image/jpeg") return ".jpg";
  if (mime === "image/png") return ".png";
  if (mime === "image/webp") return ".webp";
  if (mime === "image/tiff") return ".tif";
  return ".bin";
}

export function base64ToFile(base64: string, mime: string, baseName = "scan"): File {
  const binary = atob(base64);
  const len = binary.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i += 1) {
    bytes[i] = binary.charCodeAt(i);
  }
  const ext = extensionForMime(mime);
  return new File([bytes], `${baseName}${ext}`, { type: mime });
}
