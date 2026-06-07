"use client"

import { Loader2, Pencil, Save, ShieldCheck, User } from "lucide-react"
import { Button, cn } from "myui"
import { MyuiPanel } from "@/components/myui/myui-panel"
import { myui } from "@/components/myui/myui-styles"
import { Input } from "@/components/ui/input"
import { PasswordInput } from "@/components/ui/password-input"
import { Label } from "@/components/ui/label"
import { useLocale } from "@/context/locale-context"
import { AdminRoleSelect } from "@/components/features/admin/admin-role-select"

export type AdminAppUser = {
  id: number
  userName: string
  fullName: string
  role: string
  isTempPass: boolean
  createdAt: string
  isRoot?: boolean
}

export type UserEditForm = {
  fullName: string
  userName: string
  role: string
  isTempPass: boolean
  password: string
}

function roleMeta(role: string) {
  const r = role.toLowerCase()
  if (r === "admin") {
    return {
      label: "مدير",
      badgeClass: "bg-cyan-100 text-cyan-700 dark:bg-cyan-500/20 dark:text-cyan-300",
      iconClass: "text-cyan-600 dark:text-cyan-400",
      Icon: ShieldCheck,
    }
  }
  return {
    label: "مستخدم",
    badgeClass: "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300",
    iconClass: "text-slate-600 dark:text-slate-400",
    Icon: User,
  }
}

const fieldInputClass =
  "h-11 rounded-xl bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 focus-visible:ring-cyan-500/20 focus-visible:border-cyan-500"

export function AdminUsersSection({
  users,
  loading,
  canManage,
  editingUserId,
  savingUserId,
  userEditForm,
  onEditFormChange,
  onStartEdit,
  onCancelEdit,
  onSaveEdit,
}: {
  users: AdminAppUser[]
  loading: boolean
  canManage: boolean
  editingUserId: number | null
  savingUserId: number | null
  userEditForm: UserEditForm
  onEditFormChange: (patch: Partial<UserEditForm>) => void
  onStartEdit: (user: AdminAppUser) => void
  onCancelEdit: () => void
  onSaveEdit: (userId: number) => void
}) {
  const { t } = useLocale()

  return (
    <MyuiPanel
      title={`${t("admin.users")} (${users.length})`}
      icon={User}
      bodyClassName="p-3 sm:p-5"
    >
      <p className="text-sm text-muted-foreground mb-4 sm:mb-5">
        عرض جميع الحسابات المسجلة حاليًا في المنصة
      </p>

      {loading ? (
        <div className="flex items-center justify-center gap-2 py-16 text-muted-foreground text-sm">
          <Loader2 className="w-5 h-5 animate-spin text-cyan-600" />
          جاري تحميل الحسابات...
        </div>
      ) : users.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-200 dark:border-slate-700 py-16 text-center">
          <User className="w-10 h-10 mx-auto mb-3 text-slate-300 dark:text-slate-600" />
          <p className="text-sm text-muted-foreground">لا توجد حسابات مسجلة حاليًا.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-5">
          {users.map((account) => {
            const isEditing = editingUserId === account.id
            const isRootAccount = Boolean(account.isRoot)
            const displayRole = isEditing ? userEditForm.role : account.role
            const meta = roleMeta(displayRole)
            const RoleIcon = meta.Icon
            const displayName = isEditing ? userEditForm.fullName : account.fullName

            return (
              <article
                key={account.id}
                className={cn(
                  "rounded-3xl border bg-white dark:bg-slate-900 p-5 sm:p-6 transition-all",
                  "border-slate-200 dark:border-slate-800 hover:shadow-md hover:border-cyan-500/20",
                  isEditing && "ring-2 ring-cyan-500/30 border-cyan-500/40 shadow-lg",
                )}
              >
                <div className="flex items-start gap-4">
                  <div
                    className={cn(
                      myui.iconBox,
                      "bg-slate-100 dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700",
                    )}
                  >
                    <RoleIcon className={cn("w-6 h-6", meta.iconClass)} />
                  </div>
                  <div className="flex-1 min-w-0 text-start">
                    <h3 className="font-bold text-base dark:text-white truncate">{displayName}</h3>
                    <p className="text-xs text-muted-foreground truncate mt-0.5">
                      {isEditing ? userEditForm.userName : account.userName}
                    </p>
                    <div className="flex flex-wrap items-center gap-2 mt-2">
                      <span className={cn(myui.badge, meta.badgeClass)}>{meta.label}</span>
                      {isRootAccount && (
                        <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-violet-100 text-violet-800 dark:bg-violet-500/15 dark:text-violet-300">
                          حساب الجذر
                        </span>
                      )}
                      {(isEditing ? userEditForm.isTempPass : account.isTempPass) && (
                        <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 dark:bg-amber-500/15 dark:text-amber-300">
                          كلمة مرور مؤقتة
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-muted-foreground mt-2">
                      {new Date(account.createdAt).toLocaleString("ar-SA")}
                    </p>
                  </div>
                </div>

                {isEditing && (
                  <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800 grid grid-cols-1 gap-3">
                    <div className="space-y-1.5">
                      <Label className="text-xs text-muted-foreground">{t("admin.fullName")}</Label>
                      <Input
                        className={fieldInputClass}
                        value={userEditForm.fullName}
                        onChange={(e) => onEditFormChange({ fullName: e.target.value })}
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-xs text-muted-foreground">اسم المستخدم</Label>
                      <Input
                        className={fieldInputClass}
                        value={userEditForm.userName}
                        onChange={(e) => onEditFormChange({ userName: e.target.value })}
                        disabled={isRootAccount}
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-xs text-muted-foreground">{t("admin.role")}</Label>
                      {isRootAccount ? (
                        <p className="text-sm text-muted-foreground rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 px-3 py-2.5">
                          مدير — دور حساب الجذر ثابت ولا يمكن تغييره
                        </p>
                      ) : (
                        <AdminRoleSelect
                          value={userEditForm.role}
                          onValueChange={(role) => onEditFormChange({ role })}
                        />
                      )}
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-xs text-muted-foreground">كلمة مرور جديدة (اختياري)</Label>
                      <PasswordInput
                        className={fieldInputClass}
                        value={userEditForm.password}
                        onChange={(e) => onEditFormChange({ password: e.target.value })}
                        placeholder="اتركه فارغًا بدون تغيير"
                      />
                    </div>
                    {!isRootAccount && (
                      <label className="flex items-center gap-2 text-sm text-muted-foreground">
                        <input
                          type="checkbox"
                          className="w-4 h-4 rounded border-slate-300 text-cyan-600 focus:ring-cyan-500"
                          checked={userEditForm.isTempPass}
                          onChange={(e) => onEditFormChange({ isTempPass: e.target.checked })}
                        />
                        {t("admin.tempPassword")}
                      </label>
                    )}
                  </div>
                )}

                {canManage && (
                  <div className="flex flex-col sm:flex-row gap-2 mt-4 pt-4 border-t border-slate-100 dark:border-slate-800">
                    {isEditing ? (
                      <>
                        <Button
                          type="button"
                          className="flex-1 rounded-xl h-11 bg-cyan-600 hover:bg-cyan-700 gap-1.5 shadow-sm shadow-cyan-500/20 transition-transform active:scale-[0.98]"
                          onClick={() => onSaveEdit(account.id)}
                          disabled={savingUserId === account.id}
                        >
                          {savingUserId === account.id ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <Save className="w-4 h-4" />
                          )}
                          حفظ التعديلات
                        </Button>
                        <Button
                          type="button"
                          variant="ghost"
                          className="flex-1 rounded-xl h-11 text-muted-foreground hover:text-slate-900 hover:bg-slate-100 dark:hover:text-white dark:hover:bg-slate-800/80 transition-transform active:scale-[0.98]"
                          onClick={onCancelEdit}
                        >
                          إلغاء
                        </Button>
                      </>
                    ) : (
                      <Button
                        type="button"
                        variant="ghost"
                        className="w-full rounded-xl h-11 text-slate-600 hover:text-cyan-700 hover:bg-cyan-50 dark:text-slate-300 dark:hover:text-cyan-300 dark:hover:bg-cyan-950/30 gap-1.5 transition-transform active:scale-[0.98]"
                        onClick={() => onStartEdit(account)}
                      >
                        <Pencil className="w-4 h-4" />
                        تعديل التفاصيل
                      </Button>
                    )}
                  </div>
                )}
              </article>
            )
          })}
        </div>
      )}
    </MyuiPanel>
  )
}
