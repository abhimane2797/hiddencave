import { motion } from 'framer-motion'
import { cx } from '@/lib/utils'
import { Card } from '@/components/ui/Card'

export type StatTone = 'blue' | 'violet' | 'cyan' | 'emerald' | 'amber' | 'rose'

const toneMap: Record<StatTone, { icon: string; ring: string }> = {
  blue: { icon: 'text-brand-300 bg-brand-400/10 border-brand-400/20', ring: 'from-brand-500/20' },
  violet: { icon: 'text-violet-300 bg-violet-400/10 border-violet-400/20', ring: 'from-violet-500/20' },
  cyan: { icon: 'text-cyan-300 bg-cyan-400/10 border-cyan-400/20', ring: 'from-cyan-500/20' },
  emerald: { icon: 'text-emerald-300 bg-emerald-400/10 border-emerald-400/20', ring: 'from-emerald-500/20' },
  amber: { icon: 'text-amber-300 bg-amber-400/10 border-amber-400/20', ring: 'from-amber-500/20' },
  rose: { icon: 'text-rose-300 bg-rose-400/10 border-rose-400/20', ring: 'from-rose-500/20' },
}

export function StatCard({
  label,
  value,
  icon,
  tone = 'blue',
  hint,
  delta,
  deltaLabel,
  className,
}: {
  label: string
  value: React.ReactNode
  icon: React.ReactNode
  tone?: StatTone
  hint?: string
  delta?: number
  deltaLabel?: string
  className?: string
}) {
  const styles = toneMap[tone]
  return (
    <Card
      interactive
      className={cx('relative overflow-hidden group', className)}
    >
      <div className={cx('pointer-events-none absolute -right-10 -top-12 h-32 w-32 rounded-full bg-gradient-to-br to-transparent blur-2xl', styles.ring)} />
      <div className="relative flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">{label}</p>
          <p className="mt-1.5 font-display text-2xl font-bold tracking-tight text-white sm:text-[26px]">
            {value}
          </p>
          {hint ? <p className="mt-1 line-clamp-2 text-xs leading-snug text-slate-400">{hint}</p> : null}
        </div>
        <span
          className={cx(
            'flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl border',
            styles.icon,
          )}
        >
          {icon}
        </span>
      </div>
      {typeof delta === 'number' ? (
        <div className="relative mt-3 flex items-center gap-1.5 text-xs">
          <span
            className={cx(
              'inline-flex items-center gap-1 rounded-full px-2 py-0.5 font-semibold',
              delta >= 0 ? 'bg-emerald-400/10 text-emerald-300' : 'bg-rose-400/10 text-rose-300',
            )}
          >
            {delta >= 0 ? '+' : ''}{delta}%
          </span>
          <span className="text-slate-500">{deltaLabel ?? 'vs yesterday'}</span>
        </div>
      ) : null}
    </Card>
  )
}
