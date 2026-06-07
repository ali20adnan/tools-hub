import React, { useEffect, useState } from "react"
import { AdminLogin } from "./login"
import { AdminDashboard } from "./dashboard"

const TOKEN_KEY = "myui-admin-token"

export interface AdminAppProps {
  isRTL: boolean
  onToggleLanguage: () => void
  /** localStorage key for auth token */
  tokenKey?: string
  /** Called after successful login with the token */
  onLogin?: (token: string) => void
  /** Called on logout */
  onLogout?: () => void
  /** Login validator — must be provided for authentication */
  validateLogin?: (username: string, password: string) => Promise<string | null>
  /** Link target for "back to site" on login page */
  homePath?: string
}

export function AdminApp({
  isRTL,
  onToggleLanguage,
  tokenKey = TOKEN_KEY,
  onLogin,
  onLogout,
  validateLogin,
  homePath = "/",
}: AdminAppProps) {
  const [authenticated, setAuthenticated] = useState(false)

  useEffect(() => {
    if (localStorage.getItem(tokenKey)) setAuthenticated(true)
  }, [tokenKey])

  const handleLogin = (token: string) => {
    localStorage.setItem(tokenKey, token)
    setAuthenticated(true)
    onLogin?.(token)
  }

  const handleLogout = () => {
    localStorage.removeItem(tokenKey)
    setAuthenticated(false)
    onLogout?.()
  }

  if (authenticated) {
    return (
      <AdminDashboard
        onLogout={handleLogout}
        isRTL={isRTL}
        onToggleLanguage={onToggleLanguage}
      />
    )
  }

  return (
    <AdminLogin
      isRTL={isRTL}
      homePath={homePath}
      onLogin={handleLogin}
      validateLogin={validateLogin}
    />
  )
}
