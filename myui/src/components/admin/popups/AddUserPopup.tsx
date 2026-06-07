import { motion, AnimatePresence } from "motion/react"
import { X } from "lucide-react"
import { Button } from "../../ui/button"
import { cn } from "../../../lib/utils"

interface AddUserPopupProps {
  isOpen: boolean
  isRTL: boolean
  newUser: { name: string; email: string; role: "admin" | "editor" }
  setNewUser: (value: { name: string; email: string; role: "admin" | "editor" } | ((prev: { name: string; email: string; role: "admin" | "editor" }) => { name: string; email: string; role: "admin" | "editor" })) => void
  onClose: () => void
  onSave: () => void
}

export function AddUserPopup({ isOpen, isRTL, newUser, setNewUser, onClose, onSave }: AddUserPopupProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[70] flex items-center justify-center bg-black/50 p-4"
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0, y: 8 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 8 }}
            transition={{ duration: 0.2 }}
            className="w-full max-w-lg rounded-3xl border bg-white p-4 shadow-2xl dark:border-slate-700 dark:bg-slate-900 sm:p-6"
          >
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-xl font-bold dark:text-white">{isRTL ? "إضافة مستخدم جديد" : "Add New User"}</h3>
              <Button variant="ghost" size="icon" onClick={onClose} aria-label="close">
                <X className="h-4 w-4" />
              </Button>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-500">{isRTL ? "الاسم" : "Name"}</label>
                <input
                  type="text"
                  value={newUser.name}
                  onChange={(e) => setNewUser((prev) => ({ ...prev, name: e.target.value }))}
                  placeholder={isRTL ? "اسم المستخدم" : "User name"}
                  className={cn(
                    "w-full rounded-xl border bg-slate-50 p-3 text-sm outline-none focus:ring-2 focus:ring-cyan-500/20 dark:border-slate-700 dark:bg-slate-800 dark:text-white",
                    isRTL && "text-right font-cairo",
                  )}
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-500">{isRTL ? "البريد الإلكتروني" : "Email"}</label>
                <input
                  type="email"
                  value={newUser.email}
                  onChange={(e) => setNewUser((prev) => ({ ...prev, email: e.target.value }))}
                  placeholder="user@example.com"
                  className={cn(
                    "w-full rounded-xl border bg-slate-50 p-3 text-sm outline-none focus:ring-2 focus:ring-cyan-500/20 dark:border-slate-700 dark:bg-slate-800 dark:text-white",
                    isRTL && "text-right",
                  )}
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-500">{isRTL ? "الصلاحية" : "Role"}</label>
                <select
                  value={newUser.role}
                  onChange={(e) => setNewUser((prev) => ({ ...prev, role: e.target.value as "admin" | "editor" }))}
                  className={cn(
                    "w-full rounded-xl border bg-slate-50 p-3 text-sm outline-none focus:ring-2 focus:ring-cyan-500/20 dark:border-slate-700 dark:bg-slate-800 dark:text-white",
                    isRTL && "text-right font-cairo",
                  )}
                >
                  <option value="editor">{isRTL ? "دعم فني" : "Technical Support"}</option>
                  <option value="admin">{isRTL ? "مدير" : "Admin"}</option>
                </select>
              </div>
            </div>

            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
              <Button
                className="flex-1 bg-cyan-600 transition-transform duration-150 hover:bg-cyan-700 active:scale-95"
                onClick={onSave}
                disabled={!newUser.name.trim() || !newUser.email.trim()}
              >
                {isRTL ? "حفظ المستخدم" : "Save User"}
              </Button>
              <Button
                variant="outline"
                className="flex-1 border-slate-200 text-slate-700 transition-transform duration-150 hover:bg-slate-100 hover:text-slate-900 active:scale-95 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800 dark:hover:text-white"
                onClick={onClose}
              >
                {isRTL ? "إلغاء" : "Cancel"}
              </Button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
