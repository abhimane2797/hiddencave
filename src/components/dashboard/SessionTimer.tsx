import { useTimer } from '@/store/timer'
import { cx, formatDuration } from '@/lib/utils'

export function SessionTimer({
  endTime,
  warningMinutes = 5,
  showLabel = true,
}: {
  endTime: number
  warningMinutes?: number
  showLabel?: boolean }) {
  const { now } = useTimer()

  const remaining = Math.max(0, endTime - now)
  const isOver = endTime <= now
  const isWarning = remaining > 0 && remaining <= warningMinutes * 60_000

  const tone = isOver ? 'text-rose-300' : isWarning ? 'text-amber-300' : 'text-white'

  return (
    <div className={cx('flex items-center gap-2', showLabel && 'flex-col')}>
      <span className={cx('font-display font-bold tabular-nums text-lg sm:text-xl', tone)}>
        {isOver ? 'Time Over' : formatDuration(remaining)}
      </span>
      {showLabel && (
        <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">
          {isOver ? 'Time Over' : isWarning ? 'Almost Over' : 'Remaining'}
        </span>
      )}
    </div>
  )
}
