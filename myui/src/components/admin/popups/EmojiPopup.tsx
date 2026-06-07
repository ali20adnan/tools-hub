import { motion, AnimatePresence } from "motion/react"
import { cn } from "../../../lib/utils"

interface EmojiPopupProps {
  isOpen: boolean
  isRTL: boolean
  emojis: string[]
  onPick: (emoji: string) => void
}

export function EmojiPopup({ isOpen, isRTL, emojis, onPick }: EmojiPopupProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, y: 6, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 6, scale: 0.97 }}
          transition={{ duration: 0.16 }}
          className={cn(
            "absolute bottom-full z-30 mb-2 flex w-[min(80vw,220px)] flex-wrap gap-1 rounded-xl border bg-white p-2 shadow-xl dark:border-slate-700 dark:bg-slate-900",
            isRTL ? "end-0" : "start-0",
          )}
        >
          {emojis.map((em) => (
            <button
              key={em}
              type="button"
              className="rounded-lg p-1.5 text-lg hover:bg-slate-100 dark:hover:bg-slate-800"
              onClick={() => onPick(em)}
            >
              {em}
            </button>
          ))}
        </motion.div>
      )}
    </AnimatePresence>
  )
}
