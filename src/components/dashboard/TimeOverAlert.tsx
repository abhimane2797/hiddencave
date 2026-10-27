import { useEffect, useRef } from 'react'
import { BellRing, Clock, X, Square, RotateCcw } from 'lucide-react'
import { useEntries } from '@/store/entries'
import { useTimer } from '@/store/timer'
import { formatClock } from '@/lib/utils'
import { Button } from '@/components/ui/Button'
import { cx } from '@/lib/utils'
import { playAlarmRing, playWarningChime, unlockAudio } from '@/lib/sound'

export function TimeOverAlert() {
  const { entries, endSession, extendSession, renewSession, setMuted, muted } = useEntries()
  const { now } = useTimer()
  const alarmRef = useRef<number | null>(null)
  const warnedRef = useRef<Set<string>>(new Set())

  // Unlock AudioContext on first user gesture (browsers block audio until then)
  useEffect(() => {
    const handleGesture = () => unlockAudio()
    document.addEventListener('pointerdown', handleGesture, { once: true })
    document.addEventListener('keydown', handleGesture, { once: true })
    return () => {
      document.removeEventListener('pointerdown', handleGesture)
      document.removeEventListener('keydown', handleGesture)
    }
  }, [])

  const overdue = entries.filter(
    (e) => e.sessionStatus !== 'completed' && e.endTime - now <= 0,
  )

  const almostOver = entries.filter(
    (e) => e.sessionStatus !== 'completed' && e.endTime - now > 0 && e.endTime - now <= 5 * 60_000,
  )

  const current = overdue[0]

  // Play warning chime once when a session enters almost-over
  useEffect(() => {
    almostOver.forEach((e) => {
      if (warnedRef.current.has(e.id)) return
      warnedRef.current.add(e.id)
      if (!muted) playWarningChime()
    })
    const stillAlmostOver = new Set(almostOver.map((e) => e.id))
    warnedRef.current = new Set([...warnedRef.current].filter((id) => stillAlmostOver.has(id)))
  }, [almostOver, now, muted])

  // Play alarm ring repeatedly while a session is time-over
  useEffect(() => {
    if (!current || muted) {
      if (alarmRef.current) {
        clearInterval(alarmRef.current)
        alarmRef.current = null
      }
      return
    }
    unlockAudio()
    playAlarmRing()
    alarmRef.current = window.setInterval(() => playAlarmRing(), 3000)
    return () => {
      if (alarmRef.current) clearInterval(alarmRef.current)
      alarmRef.current = null
    }
  }, [current, muted])

  const handleRenew = () => {
    renewSession(current.id)
    setMuted(true)
  }

  if (!current) return null

  return (
    <div className="fixed inset-x-3 bottom-20 z-[65] sm:inset-x-auto sm:right-4 sm:bottom-4 sm:w-[380px]">
      <div className="overflow-hidden rounded-2xl border border-rose-500/40 bg-ink-850/97 shadow-[0_24px_60px_-24px_rgba(244,63,94,0.6)] backdrop-blur-2xl">
        <div className="flex items-center gap-2 border-b border-rose-500/20 bg-rose-500/10 px-4 py-2.5">
          <span className="flex h-7 w-7 items-center justify-center rounded-full bg-rose-500/20 text-rose-300 animate-alert-flash">
            <BellRing size={14} />
          </span>
          <p className="flex-1 text-xs font-bold uppercase tracking-[0.18em] text-rose-200">
            Session Time Over
          </p>
          <button
            onClick={() => setMuted(true)}
            className="text-rose-200/80 transition hover:text-white"
            aria-label="Mute alarm"
          >
            <X size={15} />
          </button>
        </div>
        <div className="px-4 py-3.5">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="font-display text-base font-bold text-white">{current.customerName}</p>
              <p className="mt-0.5 text-xs text-slate-400">
                Session ended at {formatClock(current.endTime)} · {formatClock(current.startTime)} started
              </p>
            </div>
            <div className="text-right">
              <p className="flex items-center justify-end gap-1.5 text-[10px] font-semibold uppercase tracking-wider text-rose-300">
                Time Over
              </p>
            </div>
          </div>
          <div className="mt-3 grid grid-cols-4 gap-2">
            <Button size="xs" variant="secondary" onClick={() => extendSession(current.id, 15)}>
              +15 min
            </Button>
            <Button size="xs" variant="secondary" onClick={() => extendSession(current.id, 30)}>
              +30 min
            </Button>
            <Button size="xs" variant="primary" onClick={handleRenew} className="bg-amber-500 hover:bg-amber-400 text-ink-950">
              <RotateCcw size={12} className="mr-1" /> Renew ₹70
            </Button>
            <Button size="xs" variant="danger" onClick={() => endSession(current.id)}>
              End Session
            </Button>
          </div>
          <div className="mt-3 flex items-center justify-between border-t border-white/[0.06] pt-2.5">
            <button
              onClick={() => endSession(current.id)}
              className="inline-flex items-center gap-1.5 text-[11px] font-medium text-slate-400 transition hover:text-white"
            >
              <Square size={12} /> Mark Completed
            </button>
            <span className={cx('text-[10px] text-slate-500', muted && 'text-amber-400')}>
              {muted ? 'Alarm muted' : 'Alarm active'}
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}
