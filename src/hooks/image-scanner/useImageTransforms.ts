"use client";

import { useMemo, useState } from "react";
import type { CSSProperties } from "react";
import type { ImageTransforms } from "@/types/image-scanner/image";

const INITIAL_TRANSFORMS: ImageTransforms = {
  rotation: 0,
  scale: 1,
  flipX: false,
  flipY: false,
};

const ZOOM_STEP = 0.1;
const MIN_SCALE = 0.2;
const MAX_SCALE = 3;
const MIN_ROTATION = 0;
const MAX_ROTATION = 360;
const SNAP_THRESHOLD_DEGREES = 6;
const SNAP_ANGLES = [0, 45, 90, 135, 180, 225, 270, 315, 360];

function getSnappedRotation(rotation: number): number {
  const nearestAngle = SNAP_ANGLES.reduce((closest, angle) => {
    const currentDistance = Math.abs(rotation - angle);
    const bestDistance = Math.abs(rotation - closest);
    return currentDistance < bestDistance ? angle : closest;
  }, SNAP_ANGLES[0]);

  if (Math.abs(rotation - nearestAngle) <= SNAP_THRESHOLD_DEGREES) {
    return nearestAngle;
  }

  return rotation;
}

export function useImageTransforms() {
  const [transforms, setTransforms] = useState<ImageTransforms>(INITIAL_TRANSFORMS);

  const rotateClockwise = () => {
    setTransforms((current) => ({ ...current, rotation: current.rotation + 90 }));
  };

  const toggleFlipX = () => {
    setTransforms((current) => ({ ...current, flipX: !current.flipX }));
  };

  const toggleFlipY = () => {
    setTransforms((current) => ({ ...current, flipY: !current.flipY }));
  };

  const zoomIn = () => {
    setTransforms((current) => ({
      ...current,
      scale: Math.min(MAX_SCALE, Number((current.scale + ZOOM_STEP).toFixed(2))),
    }));
  };

  const zoomOut = () => {
    setTransforms((current) => ({
      ...current,
      scale: Math.max(MIN_SCALE, Number((current.scale - ZOOM_STEP).toFixed(2))),
    }));
  };

  const reset = () => {
    setTransforms(INITIAL_TRANSFORMS);
  };

  const setScale = (scale: number) => {
    setTransforms((current) => ({
      ...current,
      scale: Math.max(MIN_SCALE, Math.min(MAX_SCALE, Number(scale.toFixed(2)))),
    }));
  };

  const setRotation = (rotation: number) => {
    const clampedRotation = Math.max(MIN_ROTATION, Math.min(MAX_ROTATION, Math.round(rotation)));
    const snappedRotation = getSnappedRotation(clampedRotation);

    setTransforms((current) => ({
      ...current,
      rotation: snappedRotation,
    }));
  };

  const setFlipX = (enabled: boolean) => {
    setTransforms((current) => ({
      ...current,
      flipX: enabled,
    }));
  };

  const setFlipY = (enabled: boolean) => {
    setTransforms((current) => ({
      ...current,
      flipY: enabled,
    }));
  };

  const transformStyle = useMemo<CSSProperties>(() => {
    const xScale = transforms.flipX ? -transforms.scale : transforms.scale;
    const yScale = transforms.flipY ? -transforms.scale : transforms.scale;

    return {
      transform: `rotate(${transforms.rotation}deg) scale(${xScale}, ${yScale})`,
      transition: "transform 180ms ease",
    };
  }, [transforms]);

  return {
    transforms,
    transformStyle,
    actions: {
      rotateClockwise,
      toggleFlipX,
      toggleFlipY,
      zoomIn,
      zoomOut,
      reset,
      setScale,
      setRotation,
      setFlipX,
      setFlipY,
    },
  };
}
