import { motion } from 'framer-motion'
import { cx } from '@/lib/utils'

export function Progress({
  value,
  tone = 'accent',
  className,
  trackClassName,
}: {
  /** 0 → 1 */
  value: number
  tone?: 'accent' | 'emerald' | 'amber' | 'rose' | 'violet'
  className?: string
  trackClassName?: string
}) {
  const toneClasses = {
    accent: 'bg-accent',
    emerald: 'bg-emerald-400',
    amber: 'bg-amber-400',
    rose: 'bg-rose-500',
    violet: 'bg-violet-400',
  }
  return (
    <div className={cx('h-1.5 w-full overflow-hidden rounded-full bg-white/[0.07]', trackClassName, className)}>
      <motion.div
        className={cx('h-full rounded-full', toneClasses[tone])}
        initial={{ width: 0 }}
        animate={{ width: `${Math.min(100, Math.max(0, value * 100))}%` }}
        transition={{ type: 'spring', stiffness: 120, damping: 22 }}
      />
    </div>
  )
}

export function ProgressRing({
  value,
  size = 84,
  stroke = 6,
  tone = 'accent',
  children,
}: {
  value: number
  size?: number
  stroke?: number
  tone?: 'accent' | 'emerald' | 'amber' | 'rose' | 'violet'
  children?: React.ReactNode
}) {
  const radius = (size - stroke) / 2
  const circumference = 2 * Math.PI * radius
  const clamped = Math.min(1, Math.max(0, value))
  const colors: Record<string, string> = {
    accent: 'rgb(var(--accent-rgb))',
    emerald: '#34d399',
    amber: '#fbbf24',
    rose: '#f43f5e',
    violet: '#a78bfa',
  }
  return (
    <div className="relative inline-flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth={stroke} />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={colors[tone]}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={circumference * (1 - clamped)}
          style={{ transition: 'stroke-dashoffset 0.6s ease' }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">{children}</div>
    </div>
  )
}