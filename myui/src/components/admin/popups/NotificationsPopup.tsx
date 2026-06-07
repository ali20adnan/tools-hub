import { motion, AnimatePresence } from "motion/react"
import { cn } from "../../../lib/utils"

type AdminNotification = {
  id: string
  title: string
  message: string
  time: string
  unread: boolean
}

interface NotificationsPopupProps {
  isOpen: boolean
  isRTL: boolean
  notifications: AdminNotification[]
  onMarkAllRead: () => void
  onMarkOneRead: (id: string) => void
}

export function NotificationsPopup({
  isOpen,
  isRTL,
  notifications,
  onMarkAllRead,
  onMarkOneRead,
}: NotificationsPopupProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, y: -8, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -8, scale: 0.98 }}
          transition={{ duration: 0.18 }}
          className="absolute end-0 z-[70] mt-2 w-[min(92vw,22rem)] max-w-[calc(100vw-1rem)] overflow-hidden rounded-2xl border bg-white shadow-xl dark:border-slate-700 dark:bg-slate-900"
        >
          <div className="flex items-center justify-between border-b px-4 py-3 dark:border-slate-700">
            <p className="text-sm font-bold dark:text-white">{isRTL ? "الإشعارات" : "Notifications"}</p>
            <button
              type="button"
              className="text-xs font-semibold text-cyan-600 hover:text-cyan-700 dark:text-cyan-400"
              onClick={onMarkAllRead}
            >
              {isRTL ? "تعليم الكل كمقروء" : "Mark all as read"}
            </button>
          </div>
          <div className="max-h-80 overflow-y-auto">
            {notifications.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => onMarkOneRead(item.id)}
                className={cn(
                  "w-full border-b px-4 py-3 text-start transition-colors last:border-b-0 hover:bg-slate-50 dark:border-slate-700 dark:hover:bg-slate-800/70",
                  item.unread && "bg-cyan-50/60 dark:bg-cyan-500/10",
                )}
              >
                <div className="mb-1 flex items-center justify-between gap-2">
                  <p className="text-sm font-semibold dark:text-white">{item.title}</p>
                  {item.unread && <span className="h-2 w-2 rounded-full bg-cyan-500" />}
                </div>
                <p className="text-xs text-muted-foreground">{item.message}</p>
                <p className="mt-1 text-[10px] text-slate-400">{item.time}</p>
              </button>
            ))}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
