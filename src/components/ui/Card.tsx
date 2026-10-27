import type { HTMLAttributes, ReactNode } from 'react'
import { cx } from '@/lib/utils'

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  interactive?: boolean
  glow?: boolean
  padded?: boolean
}

export function Card({ interactive, glow, padded = true, className, children, ...rest }: CardProps) {
  return (
    <div
      className={cx(
        'panel',
        padded && 'p-4 sm:p-5',
        interactive && 'panel-hover cursor-pointer',
        glow && 'shadow-glow',
        className,
      )}
      {...rest}
    >
      {children}
    </div>
  )
}

export function CardHeader({
  title,
  subtitle,
  icon,
  action,
  className,
}: {
  title: ReactNode
  subtitle?: ReactNode
  icon?: ReactNode
  action?: ReactNode
  className?: string
}) {
  return (
    <div className={cx('mb-4 flex items-start justify-between gap-3', className)}>
      <div className="flex items-start gap-3">
        {icon ? (
          <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-white/[0.05] text-brand-300">
            {icon}
          </span>
        ) : null}
        <div>
          <h3 className="font-display text-sm font-semibold tracking-wide text-white sm:text-base">
            {title}
          </h3>
          {subtitle ? <p className="mt-0.5 text-xs text-slate-400">{subtitle}</p> : null}
        </div>
      </div>
      {action}
    </div>
  )
}

export function SectionHeading({
  eyebrow,
  title,
  subtitle,
  align = 'center',
  className,
}: {
  eyebrow?: string
  title: ReactNode
  subtitle?: ReactNode
  align?: 'left' | 'center'
  className?: string
}) {
  return (
    <div
      className={cx(
        'max-w-3xl',
        align === 'center' ? 'mx-auto text-center' : 'text-left',
        className,
      )}
    >
      {eyebrow ? <span className="eyebrow">{eyebrow}</span> : null}
      <h2 className="mt-4 font-display text-3xl font-bold tracking-tight text-white sm:text-4xl">
        {title}
      </h2>
      {subtitle ? <p className="mt-3 text-sm leading-relaxed text-slate-400 sm:text-base">{subtitle}</p> : null}
    </div>
  )
}

export function EmptyState({
  icon,
  title,
  message,
  action,
  className,
}: {
  icon?: ReactNode
  title: string
  message?: string
  action?: ReactNode
  className?: string
}) {
  return (
    <div
      className={cx(
        'flex flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-white/10 bg-white/[0.02] px-6 py-12 text-center',
        className,
      )}
    >
      {icon ? (
        <span className="flex h-12 w-12 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.04] text-slate-400">
          {icon}
        </span>
      ) : null}
      <div>
        <p className="font-display text-base font-semibold text-white">{title}</p>
        {message ? <p className="mt-1 text-sm text-slate-400">{message}</p> : null}
      </div>
      {action}
    </div>
  )
}