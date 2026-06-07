"use client"

import { Toaster } from "sonner"

/** إشعارات sonner — أعلى اليسار، أسلوب myui */
export function MyuiToaster() {
  return (
    <Toaster
      position="top-left"
      dir="rtl"
      richColors={false}
      closeButton
      duration={3500}
      gap={10}
      offset={{ top: "1rem", left: "1rem", right: "1rem", bottom: "1rem" }}
      toastOptions={{
        classNames: {
          toast: "myui-toast",
          title: "myui-toast-title",
          description: "myui-toast-description",
          success: "myui-toast-success",
          error: "myui-toast-error",
          info: "myui-toast-info",
          warning: "myui-toast-warning",
          closeButton: "myui-toast-close",
        },
      }}
    />
  )
}
