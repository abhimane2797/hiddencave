import { AnimatePresence, motion } from 'framer-motion'
import { AlertTriangle, CheckCircle2, Info, X, XCircle } from 'lucide-react'
import { TOAST_STYLE } from '@/config/theme'
import { useGaming } from '@/store/gaming'
import type { ToastVariant } from '@/types'
import { cx } from '@/lib/utils'

const icons: Record<ToastVariant, typeof CheckCircle2> = {
  success: CheckCircle2,
  error: XCircle,
  info: Info,
  warning: AlertTriangle,
}

export function ToastViewport() {
  const { toasts, dismissToast } = useGaming()

  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-0 z-[90] flex flex-col items-center gap-2 p-4 sm:inset-x-auto sm:right-4 sm:items-end">
      <AnimatePresence>
        {toasts.map((toast) => {
          const Icon = icons[toast.variant]
          const style = TOAST_STYLE[toast.variant]
          return (
            <motion.div
              key={toast.id}
              layout
              initial={{ opacity: 0, y: 20, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 12, scale: 0.96 }}
              transition={{ type: 'spring', stiffness: 420, damping: 34 }}
              className={cx(
                'pointer-events-auto flex w-full max-w-sm items-start gap-3 rounded-2xl border bg-ink-850/95 p-3.5 shadow-panel backdrop-blur-xl',
                style.ring,
              )}
            >
              <Icon size={18} className={cx('mt-0.5 shrink-0', style.icon)} />
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-white">{toast.title}</p>
                {toast.message ? (
                  <p className="mt-0.5 text-xs leading-relaxed text-slate-400">{toast.message}</p>
                ) : null}
              </div>
              <button
                onClick={() => dismissToast(toast.id)}
                className="text-slate-500 transition hover:text-white"
                aria-label="Dismiss notification"
              >
                <X size={15} />
              </button>
            </motion.div>
          )
        })}
      </AnimatePresence>
    </div>
  )
}