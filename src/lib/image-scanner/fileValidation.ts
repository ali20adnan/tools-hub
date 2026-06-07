import { SUPPORTED_IMAGE_TYPES } from "@/types/image-scanner/image";

export function validateImageFile(file: File): string | null {
  if (!SUPPORTED_IMAGE_TYPES.includes(file.type)) {
    return "صيغة الملف غير مدعومة. يرجى رفع صورة من نوع JPG أو PNG أو WEBP أو TIFF.";
  }

  return null;
}
