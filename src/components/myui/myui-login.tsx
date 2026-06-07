"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { AdminLogin } from "myui"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useAuthStore } from "@/store/auth/authStore"
import { useAuth } from "@/hooks/useAuth"
import { getAuthEndpoint } from "@/lib/auth-endpoints"
import { apiAuth } from "@/lib/axiosClients"
import type { User, ChangePasswordData } from "@/store/auth/authTypes"
import { Loader2, Lock, AlertTriangle } from "lucide-react"
import { toast } from "sonner"
import { useLocale } from "@/context/locale-context"

export function MyuiLoginPage() {
  const router = useRouter()
  const { setAuth } = useAuthStore()
  const { changePassword, loading } = useAuth()
  const { dir, t } = useLocale()
  const [showChangePassword, setShowChangePassword] = useState(false)
  const [loggedInUser, setLoggedInUser] = useState<User | null>(null)
  const [accessToken, setAccessToken] = useState("")
  const [changePasswordData, setChangePasswordData] = useState<ChangePasswordData>({
    currentPassword: "",
    newPassword: "",
  })
  const [errors, setErrors] = useState<Record<string, string>>({})

  async function validateLogin(userName: string, password: string): Promise<string | null> {
    try {
      const res = await apiAuth.post(getAuthEndpoint("login"), { userName, password })
      const body = res.data as { data?: { access_token?: string; user?: User }; access_token?: string; user?: User }
      const payload = body.data ?? body
      const token = payload.access_token
      const user = payload.user
      if (!token || !user) return null

      if (user.isTempPass) {
        setLoggedInUser(user)
        setAccessToken(token)
        setChangePasswordData({ currentPassword: password, newPassword: "" })
        setShowChangePassword(true)
        return token
      }

      setAuth(user, token)
      router.push("/")
      return token
    } catch {
      return null
    }
  }

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!changePasswordData.newPassword.trim()) {
      setErrors({ newPassword: t("auth.newPasswordRequired") })
      return
    }
    if (changePasswordData.newPassword.length < 6) {
      setErrors({ newPassword: t("auth.passwordMinLength") })
      return
    }
    if (loggedInUser && accessToken) setAuth(loggedInUser, accessToken)

    try {
      await changePassword({
        data: changePasswordData,
        onSuccess: () => {
          toast.success(t("auth.passwordChanged"))
          if (loggedInUser && accessToken) {
            setAuth(loggedInUser, accessToken)
            router.push("/")
          }
        },
        onError: () => toast.error(t("auth.passwordChangeFailed")),
      })
    } catch {
      toast.error(t("auth.passwordChangeFailed"))
    }
  }

  if (showChangePassword) {
    return (
        <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-slate-50 dark:bg-[#0a0c10]" dir={dir}>
          <Card className="w-full max-w-md">
            <CardHeader className="text-center">
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-yellow-100 dark:bg-yellow-900/20">
                <Lock className="h-6 w-6 text-yellow-600 dark:text-yellow-400" />
              </div>
              <CardTitle className="text-2xl font-bold">{t("auth.changePasswordTitle")}</CardTitle>
              <CardDescription>
                {t("auth.changePasswordWelcome", { name: loggedInUser?.fullName ?? "" })}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="mb-4 p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-md">
                <div className="flex items-center">
                  <AlertTriangle className="h-4 w-4 text-yellow-600 dark:text-yellow-400 me-2" />
                  <p className="text-sm text-yellow-800 dark:text-yellow-400">
                    {t("auth.tempPasswordWarning")}
                  </p>
                </div>
              </div>
              <form onSubmit={handleChangePassword} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="newPassword">{t("auth.newPassword")}</Label>
                  <Input
                    id="newPassword"
                    type="password"
                    value={changePasswordData.newPassword}
                    onChange={(e) => setChangePasswordData((p) => ({ ...p, newPassword: e.target.value }))}
                    className={errors.newPassword ? "border-red-500" : ""}
                  />
                  {errors.newPassword && (
                    <p className="text-sm text-red-600 dark:text-red-400">{errors.newPassword}</p>
                  )}
                </div>
                <Button type="submit" className="w-full" disabled={loading.changePassword}>
                  {loading.changePassword && <Loader2 className="h-4 w-4 me-2 animate-spin" />}
                  {t("auth.changePasswordSubmit")}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
    )
  }

  return (
      <div className="min-h-screen relative" dir={dir}>
        <AdminLogin
          isRTL
          homePath="/"
          validateLogin={validateLogin}
          onLogin={() => {
            /* redirect handled in validateLogin */
          }}
        />
      </div>
  )
}
