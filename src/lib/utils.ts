import type { Booking, GameSession, Station } from '@/types'

export function cx(...parts: Array<string | false | null | undefined>) {
  return parts.filter(Boolean).join(' ')
}

export function INR(n: number) {
  return `₹${Math.round(n).toLocaleString('en-IN')}`
}

export function pad(n: number) {
  return n.toString().padStart(2, '0')
}

export function dateKey(d: Date) {
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
}

export function addDays(d: Date, n: number) {
  const c = new Date(d)
  c.setDate(c.getDate() + n)
  return c
}

export function startOfDay(d: Date) {
  const c = new Date(d)
  c.setHours(0, 0, 0, 0)
  return c
}

export function timeToMinutes(t: string) {
  const [h, m] = t.split(':').map(Number)
  return h * 60 + (m || 0)
}

export function minutesToTime(mins: number) {
  const m = ((mins % 1440) + 1440) % 1440
  return `${pad(Math.floor(m / 60))}:${pad(m % 60)}`
}

export function atTime(date: Date, time: string) {
  const [h, m] = time.split(':').map(Number)
  const c = new Date(date)
  c.setHours(h, m, 0, 0)
  return c
}

export function formatClock(ts: number | string | Date) {
  return new Date(ts).toLocaleTimeString('en-IN', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  })
}

export function formatDateLong(ts: number | string | Date) {
  return new Date(ts).toLocaleDateString('en-IN', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

export function formatDateShort(ts: number | string | Date) {
  return new Date(ts).toLocaleDateString('en-IN', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
  })
}

export function formatDayLabel(key: string) {
  return formatDateShort(`${key}T12:00:00`)
}

export function relativeDayLabel(key: string) {
  const today = dateKey(new Date())
  if (key === today) return 'Today'
  if (key === dateKey(addDays(new Date(), 1))) return 'Tomorrow'
  if (key === dateKey(addDays(new Date(), -1))) return 'Yesterday'
  return formatDayLabel(key)
}

/** Formats a millisecond duration as mm:ss, or h:mm:ss when an hour or longer. */
export function formatDuration(ms: number) {
  const total = Math.max(0, Math.floor(Math.abs(ms) / 1000))
  const h = Math.floor(total / 3600)
  const m = Math.floor((total % 3600) / 60)
  const s = total % 60
  return h > 0 ? `${h}:${pad(m)}:${pad(s)}` : `${pad(m)}:${pad(s)}`
}

export function humanDuration(minutes: number) {
  const h = Math.floor(minutes / 60)
  const m = Math.round(minutes % 60)
  if (h === 0) return `${m}m`
  if (m === 0) return `${h}h`
  return `${h}h ${m}m`
}

export function clamp(n: number, min: number, max: number) {
  return Math.min(max, Math.max(min, n))
}

let seq = 1204
export function nextSeq() {
  seq += 1
  return seq
}

export function bookingId() {
  return `BK-${nextSeq()}`
}

export function sessionId() {
  return `SES-${nextSeq()}`
}

export function entryId() {
  return `WE-${nextSeq()}`
}

export function isPeakTime(time: string, start: string, end: string) {
  const m = timeToMinutes(time)
  return m >= timeToMinutes(start) && m <= timeToMinutes(end)
}

export function computeSessionAmount(rate: number, totalMinutes: number) {
  return Math.round((rate * totalMinutes) / 60)
}

export function elapsedAndRemaining(startedAt: number, totalMinutes: number, now: number) {
  const durationMs = totalMinutes * 60_000
  const endsAt = startedAt + durationMs
  const elapsedMs = clamp(now - startedAt, 0, durationMs)
  return { endsAt, durationMs, elapsedMs, remainingMs: endsAt - now }
}

export function stationLabel(station?: Station | null) {
  return station ? `${station.name} · ${station.tvNumber}` : 'Any station'
}

export function csvEscape(value: unknown) {
  const s = value === null || value === undefined ? '' : String(value)
  return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s
}

export function downloadCsv(filename: string, rows: Array<Record<string, unknown>>) {
  if (rows.length === 0) return
  const headers = Object.keys(rows[0])
  const body = rows.map((row) => headers.map((h) => csvEscape(row[h])).join(','))
  const csv = [headers.join(','), ...body].join('\n')
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

export function copyText(text: string) {
  if (navigator.clipboard?.writeText) {
    return navigator.clipboard.writeText(text)
  }
  const el = document.createElement('textarea')
  el.value = text
  document.body.appendChild(el)
  el.select()
  document.execCommand('copy')
  document.body.removeChild(el)
  return Promise.resolve()
}

export interface SessionTiming {
  endsAt: number
  durationMs: number
  elapsedMs: number
  remainingMs: number
  progress: number
  state: 'active' | 'ending-soon' | 'overdue'
  overdueMs: number
}

export function sessionTiming(
  session: GameSession,
  now: number,
  warningMinutes = 5,
): SessionTiming {
  const totalMinutes = session.plannedMinutes + session.extendedMinutes
  const { endsAt, durationMs, elapsedMs, remainingMs } = elapsedAndRemaining(
    session.startedAt,
    totalMinutes,
    now,
  )
  const state: SessionTiming['state'] =
    remainingMs <= 0 ? 'overdue' : remainingMs <= warningMinutes * 60_000 ? 'ending-soon' : 'active'
  return {
    endsAt,
    durationMs,
    elapsedMs,
    remainingMs,
    progress: durationMs === 0 ? 1 : clamp(elapsedMs / durationMs, 0, 1),
    state,
    overdueMs: Math.max(0, -remainingMs),
  }
}

export function bookingEndMinutes(booking: Booking) {
  return timeToMinutes(booking.startTime) + booking.durationMinutes
}

export function bookingsOverlap(
  a: { start: number; duration: number },
  b: { start: number; duration: number },
) {
  return a.start < b.start + b.duration && b.start < a.start + a.duration
}