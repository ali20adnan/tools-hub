"use client"

import { useEffect, useState, useMemo } from "react"
import { useRouter } from "next/navigation"
import { AnimatePresence, motion } from "motion/react"
import { myuiMotion } from "@/components/myui/myui-motion"
import { MyuiDashboardLayout } from "@/components/myui/myui-dashboard-layout"
import { Loader2, UserPlus, Wrench, History, Users, LayoutGrid } from "lucide-react"
import { AdminToolsSection } from "@/components/features/admin/admin-tools-section"
import { useToolsAvailability } from "@/context/tools-availability-context"
import {
  AdminUsersSection,
  type AdminAppUser,
  type UserEditForm,
} from "@/components/features/admin/admin-users-section"
import { AdminRoleSelect } from "@/components/features/admin/admin-role-select"
import { myui } from "@/components/myui/myui-styles"
import { toast } from "sonner"
import { useAuthStore } from "@/store/auth/authStore"
import type { User } from "@/store/auth/authTypes"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { PasswordInput } from "@/components/ui/password-input"
import { Label } from "@/components/ui/label"
import { hasPermission } from "@/lib/permissions"
import apiClient from "@/lib/axiosClients"
import { getApiErrorMessage } from "@/lib/apiErrors"
import { useLocale } from "@/context/locale-context"
import { cn } from "myui"

type AuditLogEntry = {
  id: number
  actorUserName: string
  actorRole: string
  action: string
  targetType: string
  targetId: string
  createdAt: string
}

type AdminSection = "create" | "users" | "tools" | "maintenance" | "audit"

function AdminDashboardContent() {
  const router = useRouter()
  const { t } = useLocale()
  const user = useAuthStore((s) => s.user)
  const authLoading = useAuthStore((s) => s.isLoading)
  const [activeSection, setActiveSection] = useState<AdminSection>("create")
  const [maintenanceLoading, setMaintenanceLoading] = useState(true)
  const [maintenanceEnabled, setMaintenanceEnabled] = useState(false)
  const [maintenanceSource, setMaintenanceSource] = useState<"db" | "env">("db")
  const [usersLoading, setUsersLoading] = useState(true)
  const [users, setUsers] = useState<AdminAppUser[]>([])
  const [auditLoading, setAuditLoading] = useState(true)
  const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>([])
  const [auditQuery, setAuditQuery] = useState("")
  const [auditActionFilter, setAuditActionFilter] = useState("")
  const [editingUserId, setEditingUserId] = useState<number | null>(null)
  const [savingUserId, setSavingUserId] = useState<number | null>(null)
  const [userEditForm, setUserEditForm] = useState<UserEditForm>({
    fullName: "",
    userName: "",
    role: "user",
    isTempPass: false,
    password: "",
  })
  const [createForm, setCreateForm] = useState({
    fullName: "",
    email: "",
    role: "user",
    password: "",
  })

  async function getJson<T>(url: string): Promise<T> {
    const res = await apiClient.get(url)
    return res.data as T
  }

  async function sendJson<T>(method: "POST" | "PATCH" | "PUT", url: string, body?: unknown): Promise<T> {
    const res = await apiClient.request({
      method,
      url,
      data: body,
    })
    return res.data as T
  }

  async function loadMaintenance() {
    setMaintenanceLoading(true)
    try {
      const res = await getJson<{ data?: { enabled?: boolean; source?: "db" | "env" } }>("/admin/system/maintenance")
      const data = (res as { data?: { enabled?: boolean; source?: "db" | "env" } }).data
      setMaintenanceEnabled(Boolean(data?.enabled))
      setMaintenanceSource((data?.source ?? "db") as "db" | "env")
    } catch {
      toast.error("تعذر قراءة حالة الصيانة")
    } finally {
      setMaintenanceLoading(false)
    }
  }

  async function loadUsers() {
    setUsersLoading(true)
    try {
      const res = await getJson<{ data?: { items?: AdminAppUser[] } }>("/users")
      const data = (res as { data?: { items?: AdminAppUser[] } }).data?.items ?? []
      setUsers(data)
    } catch {
      toast.error("تعذر تحميل الحسابات الحالية")
    } finally {
      setUsersLoading(false)
    }
  }

  async function loadAuditLogs() {
    setAuditLoading(true)
    try {
      const params = new URLSearchParams()
      if (auditQuery.trim()) params.set("q", auditQuery.trim())
      if (auditActionFilter.trim()) params.set("action", auditActionFilter.trim())
      params.set("limit", "120")
      const query = params.toString()
      const res = await getJson<{ data?: AuditLogEntry[] }>(`/admin/audit-logs${query ? `?${query}` : ""}`)
      const data = (res as { data?: AuditLogEntry[] })?.data ?? []
      setAuditLogs(data)
    } catch {
      toast.error("تعذر تحميل سجل التدقيق")
    } finally {
      setAuditLoading(false)
    }
  }

  async function toggleMaintenance(nextState: boolean) {
    try {
      await sendJson("PUT", "/admin/system/maintenance", { enabled: nextState })
      setMaintenanceEnabled(nextState)
      toast.success(nextState ? "تم تفعيل وضع الصيانة" : "تم إيقاف وضع الصيانة")
      await loadMaintenance()
    } catch (error) {
      const msg = getApiErrorMessage(error)
      toast.error(msg || "فشل تحديث وضع الصيانة")
    }
  }

  const canReadUsers = hasPermission(user, "users:read")
  const canManageUsers = hasPermission(user, "users:manage")
  const canReadMaintenance = hasPermission(user, "maintenance:read")
  const canManageTools = hasPermission(user, "tools:manage")
  const canReadAudit = hasPermission(user, "audit_logs:read")
  const { refresh: refreshToolsAvailability } = useToolsAvailability()

  useEffect(() => {
    if (authLoading) return
    if (canReadMaintenance) loadMaintenance()
    if (canReadUsers) loadUsers()
    if (canReadAudit) loadAuditLogs()
  }, [authLoading, canReadUsers, canReadMaintenance, canReadAudit])

  useEffect(() => {
    if (activeSection === "audit" && canReadAudit) {
      loadAuditLogs()
    }
  }, [auditQuery, auditActionFilter, activeSection, canReadAudit])

  async function createEmailAccount(e: React.FormEvent) {
    e.preventDefault()
    try {
      const res = await sendJson<{ data?: { email?: string; password?: string } }>("POST", "/admin/users", createForm)
      const payload = (res as { data?: { email?: string; password?: string } })?.data
      toast.success(
        t("admin.accountCreated", {
          email: payload?.email ?? "",
          password: payload?.password
            ? t("admin.accountCreatedPassword", { password: payload.password })
            : "",
        }),
      )
      setCreateForm({ fullName: "", email: "", role: "user", password: "" })
      await loadUsers()
    } catch (error) {
      const msg = getApiErrorMessage(error)
      toast.error(msg || "فشل إنشاء الحساب")
    }
  }

  function startEditUser(account: AdminAppUser) {
    setEditingUserId(account.id)
    setUserEditForm({
      fullName: account.fullName,
      userName: account.userName,
      role: account.role,
      isTempPass: account.isTempPass,
      password: "",
    })
  }

  function cancelEditUser() {
    setEditingUserId(null)
    setSavingUserId(null)
  }

  async function saveUserEdit(userId: number) {
    setSavingUserId(userId)
    try {
      const target = users.find((u) => u.id === userId)
      const isRootAccount = Boolean(target?.isRoot)
      const payload = userEditForm.password
        ? isRootAccount
          ? { fullName: userEditForm.fullName, password: userEditForm.password }
          : userEditForm
        : isRootAccount
          ? { fullName: userEditForm.fullName }
          : {
              fullName: userEditForm.fullName,
              userName: userEditForm.userName,
              role: userEditForm.role,
              isTempPass: userEditForm.isTempPass,
            }
      await sendJson("PATCH", `/admin/users/${userId}`, payload)
      toast.success(t("admin.accountUpdated"))
      setEditingUserId(null)
      await loadUsers()
      if (userId === user?.id) {
        try {
          const me = await getJson<{ data?: User }>("/auth/me")
          const fresh = (me as { data?: User })?.data
          if (fresh) useAuthStore.getState().setUser(fresh)
        } catch {
          /* ignore */
        }
      }
    } catch (error) {
      const status = (error as { response?: { status?: number } })?.response?.status
      if (status === 403) {
        toast.error("انتهت صلاحية الأدمن — سجّل الدخول بحساب مدير")
        router.push("/login")
        return
      }
      const msg = getApiErrorMessage(error)
      toast.error(msg || t("admin.accountUpdateFailed"))
    } finally {
      setSavingUserId(null)
    }
  }

  const availableSections = [
    canManageUsers ? "create" : null,
    canReadUsers ? "users" : null,
    canManageTools ? "tools" : null,
    canReadMaintenance ? "maintenance" : null,
    canReadAudit ? "audit" : null,
  ].filter(Boolean) as AdminSection[]

  const sectionLabels: Record<AdminSection, string> = {
    create: t("admin.createAccount"),
    users: t("admin.users"),
    tools: t("admin.tools"),
    maintenance: t("admin.maintenanceMode"),
    audit: t("admin.auditLog"),
  }

  useEffect(() => {
    if (availableSections.length > 0 && !availableSections.includes(activeSection)) {
      setActiveSection(availableSections[0])
    }
  }, [activeSection, availableSections])

  const adminNavItems = useMemo(
    () =>
      availableSections.map((section) => ({
        key: section,
        label: sectionLabels[section],
        icon:
          section === "create"
            ? UserPlus
            : section === "users"
              ? Users
              : section === "tools"
                ? LayoutGrid
                : section === "maintenance"
                  ? Wrench
                  : History,
        onClick: () => setActiveSection(section),
      })),
    [availableSections, sectionLabels],
  )

  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-[40vh] gap-2 text-muted-foreground">
        <Loader2 className="w-5 h-5 animate-spin text-cyan-600" />
        جاري التحقق من الصلاحيات...
      </div>
    )
  }

  if (!user || availableSections.length === 0) {
    return (
      <div className="max-w-3xl mx-auto py-10">
        <Card>
          <CardHeader>
            <CardTitle>{t("admin.unauthorizedTitle")}</CardTitle>
            <CardDescription>{t("admin.unauthorizedDesc")}</CardDescription>
          </CardHeader>
        </Card>
      </div>
    )
  }

  return (
    <MyuiDashboardLayout
      navItems={adminNavItems}
      activeKey={activeSection}
      pageTitle={t("pages.admin.title")}
      pageSubtitle={t("pages.admin.subtitle")}
      brandTitle={t("brand.title")}
    >
      <AnimatePresence mode="wait">
        <motion.div
          key={activeSection}
          initial={myuiMotion.page.initial}
          animate={myuiMotion.page.animate}
          exit={myuiMotion.page.exit}
          transition={myuiMotion.page.transition}
          className={cn(myui.main, "max-w-6xl")}
        >
          {activeSection === "create" && canManageUsers && (
            <Card className="rounded-2xl border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm">
              <CardHeader>
                <CardTitle className="text-base">{t("admin.createAccount")}</CardTitle>
                <CardDescription>{t("admin.createAccountDesc")}</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={createEmailAccount} className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label>{t("admin.fullName")}</Label>
                    <Input value={createForm.fullName} onChange={(e) => setCreateForm((p) => ({ ...p, fullName: e.target.value }))} required />
                  </div>
                  <div className="space-y-1.5">
                    <Label>{t("admin.email")}</Label>
                    <Input type="email" value={createForm.email} onChange={(e) => setCreateForm((p) => ({ ...p, email: e.target.value }))} required />
                  </div>
                  <div className="space-y-1.5">
                    <Label>{t("admin.role")}</Label>
                    <AdminRoleSelect
                      value={createForm.role}
                      onValueChange={(role) => setCreateForm((p) => ({ ...p, role }))}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label>{t("admin.passwordOptional")}</Label>
                    <PasswordInput
                      value={createForm.password}
                      onChange={(e) => setCreateForm((p) => ({ ...p, password: e.target.value }))}
                      placeholder={t("admin.passwordPlaceholder")}
                      className="h-11 rounded-xl bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <Button type="submit" className="gap-2">
                      <UserPlus className="w-4 h-4" />
                      {t("admin.createSubmit")}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          )}

          {activeSection === "tools" && canManageTools && (
            <AdminToolsSection onSaved={() => void refreshToolsAvailability()} />
          )}

          {activeSection === "maintenance" && canReadMaintenance && (
            <Card className="rounded-2xl border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm">
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Wrench className="w-4 h-4 text-primary" />
                  وضع الصيانة
                </CardTitle>
                <CardDescription>
                  تحكم بحالة المنصة للحسابات غير الأدمن. يمكنك أيضًا فرض الوضع من `.env` عبر `MAINTENANCE_MODE=true`.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {maintenanceLoading ? (
                  <div className="flex items-center gap-2 text-muted-foreground text-sm">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    جاري قراءة الحالة...
                  </div>
                ) : (
                  <>
                    <div className="flex items-center justify-between border rounded-xl p-3">
                      <div>
                        <p className="font-medium">{maintenanceEnabled ? "الصيانة مفعلة" : "الصيانة متوقفة"}</p>
                        <p className="text-xs text-muted-foreground">
                          مصدر الحالة الحالي: {maintenanceSource === "env" ? "ENV (إجباري)" : "قاعدة البيانات"}
                        </p>
                      </div>
                      <Button
                        variant={maintenanceEnabled ? "destructive" : "default"}
                        onClick={() => toggleMaintenance(!maintenanceEnabled)}
                        disabled={maintenanceSource === "env"}
                      >
                        {maintenanceEnabled ? "إيقاف الصيانة" : "تشغيل الصيانة"}
                      </Button>
                    </div>
                    {maintenanceSource === "env" && (
                      <p className="text-xs text-amber-600">
                        وضع الصيانة مفروض من `.env`. غيّر `MAINTENANCE_MODE=false` لإرجاع التحكم للوحة الأدمن.
                      </p>
                    )}
                  </>
                )}
              </CardContent>
            </Card>
          )}

          {activeSection === "users" && canReadUsers && (
            <AdminUsersSection
              users={users}
              loading={usersLoading}
              canManage={canManageUsers}
              editingUserId={editingUserId}
              savingUserId={savingUserId}
              userEditForm={userEditForm}
              onEditFormChange={(patch) => setUserEditForm((p) => ({ ...p, ...patch }))}
              onStartEdit={startEditUser}
              onCancelEdit={cancelEditUser}
              onSaveEdit={saveUserEdit}
            />
          )}

          {activeSection === "audit" && canReadAudit && (
            <Card className="rounded-2xl border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm">
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <History className="w-4 h-4 text-primary" />
                  سجل التدقيق ({auditLogs.length})
                </CardTitle>
                <CardDescription>تتبع أحدث الإجراءات الحساسة في المنصة</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                  <Input
                    value={auditQuery}
                    onChange={(e) => setAuditQuery(e.target.value)}
                    placeholder="بحث بالمستخدم/الإجراء/الهدف"
                    className="md:col-span-2"
                  />
                  <Input
                    value={auditActionFilter}
                    onChange={(e) => setAuditActionFilter(e.target.value)}
                    placeholder="فلتر action (اختياري)"
                  />
                </div>
                {auditLoading ? (
                  <div className="flex items-center gap-2 text-muted-foreground text-sm">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    جاري تحميل السجل...
                  </div>
                ) : auditLogs.length === 0 ? (
                  <p className="text-sm text-muted-foreground">لا توجد سجلات مطابقة.</p>
                ) : (
                  auditLogs.map((log) => (
                    <div key={log.id} className="border rounded-xl p-3 space-y-1.5">
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1">
                        <p className="font-medium text-sm">{log.action}</p>
                        <span className="text-xs text-muted-foreground">{new Date(log.createdAt).toLocaleString("ar-SA")}</span>
                      </div>
                      <p className="text-sm"><strong>المنفذ:</strong> {log.actorUserName || "غير معروف"} {log.actorRole ? `(${log.actorRole})` : ""}</p>
                      <p className="text-sm"><strong>الهدف:</strong> {log.targetType || "-"} {log.targetId ? `#${log.targetId}` : ""}</p>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>
          )}
        </motion.div>
      </AnimatePresence>
    </MyuiDashboardLayout>
  )
}

export default function AdminDashboardPage() {
  return <AdminDashboardContent />
}
