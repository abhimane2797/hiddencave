import { useEffect, type ReactNode } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { X } from 'lucide-react'
import { Button } from './Button'

export function Drawer({
  open,
  onClose,
  title,
  subtitle,
  children,
  footer,
  width = 'md',
}: {
  open: boolean
  onClose: () => void
  title?: ReactNode
  subtitle?: ReactNode
  children: ReactNode
  footer?: ReactNode
  width?: 'sm' | 'md' | 'lg'
}) {
  useEffect(() => {
    if (!open) return
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handler)
    const previous = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      window.removeEventListener('keydown', handler)
      document.body.style.overflow = previous
    }
  }, [open, onClose])

  const widthClass = width === 'sm' ? 'sm:max-w-md' : width === 'lg' ? 'sm:max-w-2xl' : 'sm:max-w-xl'

  return (
    <AnimatePresence>
      {open ? (
        <div className="fixed inset-0 z-[70]">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="absolute inset-0 bg-ink-950/70 backdrop-blur-sm"
            onClick={onClose}
          />
          <motion.aside
            role="dialog"
            aria-modal="true"
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', stiffness: 320, damping: 32 }}
            className={`absolute inset-y-0 right-0 flex w-full flex-col border-l border-white/10 bg-ink-850/95 shadow-panel backdrop-blur-2xl ${widthClass}`}
          >
            <div className="flex items-start justify-between gap-3 border-b border-white/[0.06] px-5 py-4">
              <div className="min-w-0">
                <h2 className="truncate font-display text-lg font-semibold text-white">{title}</h2>
                {subtitle ? <p className="mt-0.5 text-xs text-slate-400">{subtitle}</p> : null}
              </div>
              <Button variant="ghost" size="icon" onClick={onClose} aria-label="Close panel">
                <X size={18} />
              </Button>
            </div>
            <div className="min-h-0 flex-1 overflow-y-auto px-5 py-5">{children}</div>
            {footer ? (
              <div className="flex flex-wrap justify-end gap-2 border-t border-white/[0.06] bg-ink-900/50 px-5 py-4">
                {footer}
              </div>
            ) : null}
          </motion.aside>
        </div>
      ) : null}
    </AnimatePresence>
  )
}