import { motion } from 'framer-motion'
import type { ReactNode } from 'react'
import { cx } from '@/lib/utils'

export interface TabItem<T extends string> {
  id: T
  label: ReactNode
  count?: number
}

export function Tabs<T extends string>({
  items,
  value,
  onChange,
  className,
}: {
  items: Array<TabItem<T>>
  value: T
  onChange: (value: T) => void
  className?: string
}) {
  return (
    <div className={cx('flex items-center gap-1 overflow-x-auto no-scrollbar rounded-2xl border border-white/10 bg-ink-900/60 p-1', className)}>
      {items.map((item) => {
        const active = item.id === value
        return (
          <button
            key={item.id}
            type="button"
            onClick={() => onChange(item.id)}
            className={cx(
              'relative whitespace-nowrap rounded-xl px-3.5 py-2 text-xs font-semibold tracking-wide transition-colors sm:text-sm',
              active ? 'text-white' : 'text-slate-400 hover:text-white',
            )}
          >
            {active ? (
              <motion.span
                layoutId={`tab-${items.map((i) => i.id).join('-')}`}
                className="absolute inset-0 rounded-xl border border-white/10 bg-accent/15"
                transition={{ type: 'spring', stiffness: 420, damping: 34 }}
              />
            ) : null}
            <span className="relative flex items-center gap-2">
              {item.label}
              {typeof item.count === 'number' ? (
                <span className={cx('rounded-full px-1.5 py-0.5 text-[10px]', active ? 'bg-accent/30 text-white' : 'bg-white/[0.07] text-slate-400')}>
                  {item.count}
                </span>
              ) : null}
            </span>
          </button>
        )
      })}
    </div>
  )
}