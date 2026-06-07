"use client"

import { createContext, useContext, useMemo } from "react"
import { translate } from "@/lib/i18n"

type LocaleContextValue = {
  locale: "ar"
  dir: "rtl"
  t: typeof translate
}

const LocaleContext = createContext<LocaleContextValue>({
  locale: "ar",
  dir: "rtl",
  t: translate,
})

export function LocaleProvider({ children }: { children: React.ReactNode }) {
  const value = useMemo(
    () => ({
      locale: "ar" as const,
      dir: "rtl" as const,
      t: translate,
    }),
    [],
  )

  return <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>
}

export function useLocale() {
  return useContext(LocaleContext)
}
