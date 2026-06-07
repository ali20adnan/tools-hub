import React, { useState } from "react"
import { motion } from "motion/react"
import { User, Eye, EyeOff, Loader2, ArrowRight } from "lucide-react"
import { Button } from "../ui/button"
import { cn } from "../../lib/utils"

interface AdminLoginProps {
  onLogin: (token: string) => void
  isRTL: boolean
  homePath?: string
  validateLogin?: (username: string, password: string) => Promise<string | null>
}

export function AdminLogin({ onLogin, isRTL, homePath = "/", validateLogin }: AdminLoginProps) {
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    // Simulated auth delay
    await new Promise(resolve => setTimeout(resolve, 800))

    let token: string | null = null
    if (validateLogin) {
      token = await validateLogin(username.trim(), password.trim())
    }

    if (token) {
      onLogin(token)
    } else {
      setError(isRTL ? "اسم المستخدم أو كلمة المرور غير صحيحة" : "Invalid username or password")
    }
    setIsLoading(false)
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0a0c10] p-4 sm:p-6 lg:p-8">
      <a
        href={homePath}
        className={cn(
          "mb-6 inline-flex items-center gap-2 text-sm font-medium text-muted-foreground transition-colors hover:text-cyan-600 dark:hover:text-cyan-400",
          isRTL && "font-cairo",
        )}
      >
        {isRTL ? "العودة للموقع" : "Back to site"}
      </a>
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="mx-auto w-full max-w-xl overflow-hidden rounded-3xl border border-white/70 bg-white p-6 shadow-2xl dark:border-slate-800 dark:bg-slate-900 sm:p-8 lg:p-10"
      >
        <div className="text-center mb-10">
          <h1 className="text-3xl font-bold dark:text-white mb-3">
            {isRTL ? "بوابة المسؤول" : "Admin Portal"}
          </h1>
          <p className="text-muted-foreground">
            {isRTL ? "يرجى تسجيل الدخول للمتابعة" : "Please sign in to continue"}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className="text-sm font-medium dark:text-slate-300 px-1">
                {isRTL ? "اسم المستخدم" : "Username"}
              </label>
              <div className="relative group">
                <div className={cn(
                  "absolute inset-y-0 flex items-center text-muted-foreground group-focus-within:text-cyan-500 transition-colors px-4",
                  isRTL ? "right-0" : "left-0"
                )}>
                  <User className="w-5 h-5" />
                </div>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className={cn(
                    "w-full h-12 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/50 rounded-xl focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500 outline-none transition-all placeholder:text-slate-400 dark:text-white",
                    isRTL ? "pr-12 text-right" : "pl-12"
                  )}
                  placeholder="admin"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium dark:text-slate-300 px-1">
                {isRTL ? "كلمة المرور" : "Password"}
              </label>
              <div className="relative group">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={cn(
                    "w-full h-12 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/50 rounded-xl focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500 outline-none transition-all placeholder:text-slate-400 dark:text-white",
                    isRTL ? "pr-4 pl-12 text-right" : "pl-4 pr-12"
                  )}
                  placeholder="••••••••"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className={cn(
                    "absolute inset-y-0 flex items-center text-muted-foreground hover:text-cyan-500 px-4",
                    isRTL ? "left-0" : "right-0"
                  )}
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {error && (
              <motion.p 
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                className="text-sm text-red-500 text-center"
              >
                {error}
              </motion.p>
            )}

            <Button
              type="submit"
              disabled={isLoading}
              className="w-full h-12 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 text-white font-semibold transform transition-all active:scale-95 shadow-lg shadow-cyan-500/20 group"
            >
              {isLoading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <span className="flex items-center gap-2">
                  {isRTL ? "تسجيل الدخول" : "Sign In"}
                  <ArrowRight className={cn("w-5 h-5 group-hover:translate-x-1 transition-transform", isRTL && "rotate-180")} />
                </span>
              )}
            </Button>
        </form>

      </motion.div>
    </div>
  )
}
