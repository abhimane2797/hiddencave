import { useState, useEffect } from 'react'
import type { GameSession } from '@/types'
import { sessionTiming, type SessionTiming } from '@/lib/utils'

export interface SessionTimer extends SessionTiming {
  label: string
}

/**
 * Ticks a single gaming session countdown every second.
 * Kept UI-only on purpose: when a backend exists, replace `startedAt` with
 * server timestamps and stream updates instead of ticking locally.
 */
export function useSessionTimer(session: GameSession | null | undefined, warningMinutes = 5) {
  const [now, setNow] = useState(() => Date.now())

  useEffect(() => {
    if (!session || session.completed) return
    const id = window.setInterval(() => setNow(Date.now()), 1000)
    return () => window.clearInterval(id)
  }, [session?.id, session?.completed])

  if (!session) return null

  const timing = sessionTiming(session, now, warningMinutes)
  return {
    ...timing,
    now,
    label: timing.remainingMs > 0 ? 'Remaining' : 'Overdue by',
  }
}

export function useLiveNow(active: boolean, intervalMs = 1000) {
  const [now, setNow] = useState(() => Date.now())
  useEffect(() => {
    if (!active) return
    const id = window.setInterval(() => setNow(Date.now()), intervalMs)
    return () => window.clearInterval(id)
  }, [active, intervalMs])
  return now
}