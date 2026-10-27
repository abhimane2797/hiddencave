import { useEffect, useRef, useState, type ReactNode } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { MoreVertical } from 'lucide-react'
import { cx } from '@/lib/utils'

export interface MenuItem {
  label: string
  icon?: ReactNode
  onSelect: () => void
  tone?: 'default' | 'danger'
  disabled?: boolean
  hidden?: boolean
}

export function Menu({
  items,
  trigger,
  align = 'right',
  label = 'More actions',
}: {
  items: MenuItem[]
  trigger?: ReactNode
  align?: 'left' | 'right'
  label?: string
}) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    const onPointerDown = (e: PointerEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false)
    }
    document.addEventListener('pointerdown', onPointerDown)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('pointerdown', onPointerDown)
      document.removeEventListener('keydown', onKey)
    }
  }, [open])

  const visible = items.filter((item) => !item.hidden)

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        aria-label={label}
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
        className={cx(
          'inline-flex h-9 w-9 items-center justify-center rounded-xl border border-transparent text-slate-400 transition hover:border-white/10 hover:bg-white/[0.06] hover:text-white',
          open && 'border-white/10 bg-white/[0.08] text-white',
        )}
      >
        {trigger ?? <MoreVertical size={16} />}
      </button>
      <AnimatePresence>
        {open ? (
          <motion.div
            initial={{ opacity: 0, y: -6, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -4, scale: 0.98 }}
            transition={{ duration: 0.14 }}
            className={cx(
              'absolute z-40 mt-1.5 w-52 overflow-hidden rounded-2xl border border-white/10 bg-ink-850/95 p-1.5 shadow-panel backdrop-blur-xl',
              align === 'right' ? 'right-0' : 'left-0',
            )}
          >
            {visible.map((item) => (
              <button
                key={item.label}
                type="button"
                disabled={item.disabled}
                onClick={() => {
                  setOpen(false)
                  item.onSelect()
                }}
                className={cx(
                  'flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-left text-sm font-medium transition',
                  item.tone === 'danger'
                    ? 'text-rose-300 hover:bg-rose-500/10'
                    : 'text-slate-300 hover:bg-white/[0.07] hover:text-white',
                  item.disabled && 'pointer-events-none opacity-40',
                )}
              >
                {item.icon ? <span className="text-slate-400">{item.icon}</span> : null}
                {item.label}
              </button>
            ))}
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  )
}