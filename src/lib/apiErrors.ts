type AxiosLikeError = {
  code?: string
  response?: { data?: { message?: string | string[] } }
}

function isAxiosLikeError(error: unknown): error is AxiosLikeError {
  return (
    typeof error === "object" &&
    error !== null &&
    ("response" in error || "code" in error)
  )
}

export function getApiErrorMessage(
  error: unknown,
  fallback = "حدث خطأ غير متوقع",
): string {
  if (isAxiosLikeError(error)) {
    if (error.code === "ERR_NETWORK" || !error.response) {
      return "لا يمكن الاتصال بالخادم (tools-hub-api). شغّل الخادم على المنفذ 3001 ثم أعد المحاولة."
    }
    const message = error.response.data?.message
    if (typeof message === "string" && message.trim()) return message
    if (Array.isArray(message)) return message.join(" — ")
  }

  return fallback
}
