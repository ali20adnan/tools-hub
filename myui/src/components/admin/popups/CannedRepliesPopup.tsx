import { motion, AnimatePresence } from "motion/react"
import { cn } from "../../../lib/utils"

interface CannedReply {
  id: string
  label: string
  body: string
}

interface CannedRepliesPopupProps {
  isOpen: boolean
  isRTL: boolean
  replies: CannedReply[]
  onPick: (body: string) => void
}

export function CannedRepliesPopup({ isOpen, isRTL, replies, onPick }: CannedRepliesPopupProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, y: 6, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 6, scale: 0.97 }}
          transition={{ duration: 0.16 }}
          className={cn(
            "absolute bottom-full z-30 mb-2 max-h-56 w-[min(84vw,16rem)] overflow-y-auto rounded-xl border bg-white py-1 shadow-xl dark:border-slate-700 dark:bg-slate-900",
            isRTL ? "end-0" : "start-0",
          )}
        >
          {replies.map((c) => (
            <button
              key={c.id}
              type="button"
              className="block w-full px-3 py-2 text-start text-sm hover:bg-slate-100 dark:hover:bg-slate-800"
              onClick={() => onPick(c.body)}
            >
              <span className="block font-semibold text-foreground">{c.label}</span>
              <span className="mt-0.5 line-clamp-2 text-xs text-muted-foreground">{c.body}</span>
            </button>
          ))}
        </motion.div>
      )}
    </AnimatePresence>
  )
}
