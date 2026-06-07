export type ImageFileState = {
  file: File;
  previewUrl: string;
};

export type ImageTransforms = {
  rotation: number;
  scale: number;
  flipX: boolean;
  flipY: boolean;
};

export const SUPPORTED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp", "image/tiff"];
