import type { ReactNode } from 'react'
import { cx } from '@/lib/utils'
import type { StatusStyle } from '@/config/theme'

export type BadgeTone = 'blue' | 'violet' | 'cyan' | 'emerald' | 'amber' | 'rose' | 'slate'

const toneClasses: Record<BadgeTone, string> = {
  blue: 'border-brand-400/30 bg-brand-400/10 text-brand-300',
  violet: 'border-violet-400/30 bg-violet-400/10 text-violet-300',
  cyan: 'border-cyan-400/30 bg-cyan-400/10 text-cyan-300',
  emerald: 'border-emerald-400/30 bg-emerald-400/10 text-emerald-300',
  amber: 'border-amber-400/30 bg-amber-400/10 text-amber-300',
  rose: 'border-rose-400/30 bg-rose-400/10 text-rose-300',
  slate: 'border-slate-400/30 bg-slate-400/10 text-slate-300',
}

export function Badge({
  tone = 'blue',
  children,
  className,
}: {
  tone?: BadgeTone
  children: ReactNode
  className?: string
}) {
  return (
    <span
      className={cx(
        'inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[11px] font-semibold tracking-wide',
        toneClasses[tone],
        className,
      )}
    >
      {children}
    </span>
  )
}

export function StatusDot({ dot, pulse, className }: { dot: string; pulse?: boolean; className?: string }) {
  return (
    <span className={cx('relative inline-flex h-2.5 w-2.5', className)}>
      {pulse ? <span className={cx('absolute inset-0 animate-ping rounded-full opacity-60', dot)} /> : null}
      <span className={cx('relative inline-block h-2.5 w-2.5 rounded-full', dot)} />
    </span>
  )
}

/** Renders any domain status using the shared design-system styles. */
export function StatusPill({
  style,
  label,
  pulse,
  className,
}: {
  style: StatusStyle
  label?: string
  pulse?: boolean
  className?: string
}) {
  return (
    <span
      className={cx(
        'inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-semibold tracking-wide',
        style.chip,
        className,
      )}
    >
      <StatusDot dot={style.dot} pulse={pulse} />
      {label ?? style.label}
    </span>
  )
}

export function Kbd({ children }: { children: ReactNode }) {
  return (
    <kbd className="rounded-md border border-white/10 bg-white/[0.05] px-1.5 py-0.5 font-sans text-[10px] font-semibold text-slate-400">
      {children}
    </kbd>
  )
}