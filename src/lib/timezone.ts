const KOLKATA_TIMEZONE = 'Asia/Kolkata'

function getKolkataDate(date: Date = new Date()): Date {
  const formatter = new Intl.DateTimeFormat('en-IN', {
    timeZone: KOLKATA_TIMEZONE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  })

  const parts = formatter.formatToParts(date)
  const year = parseInt(parts.find(p => p.type === 'year')!.value, 10)
  const month = parseInt(parts.find(p => p.type === 'month')!.value, 10) - 1
  const day = parseInt(parts.find(p => p.type === 'day')!.value, 10)
  const hour = parseInt(parts.find(p => p.type === 'hour')!.value, 10)
  const minute = parseInt(parts.find(p => p.type === 'minute')!.value, 10)
  const second = parseInt(parts.find(p => p.type === 'second')!.value, 10)

  return new Date(year, month, day, hour, minute, second)
}

export function getKolkataDateKey(date: Date = new Date()): string {
  const d = getKolkataDate(date)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

export function getKolkataTimestamp(date: Date = new Date()): number {
  return getKolkataDate(date).getTime()
}

export function formatKolkataTime(timestamp: number): string {
  return new Date(timestamp).toLocaleString('en-IN', {
    timeZone: KOLKATA_TIMEZONE,
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  })
}

export function formatKolkataDateTime(timestamp: number): string {
  return new Date(timestamp).toLocaleString('en-IN', {
    timeZone: KOLKATA_TIMEZONE,
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  })
}

export function getNextMidnightKolkata(): number {
  const now = new Date()
  const kolkataNow = getKolkataDate(now)
  const nextMidnight = new Date(kolkataNow)
  nextMidnight.setDate(nextMidnight.getDate() + 1)
  nextMidnight.setHours(0, 0, 0, 0)

  // Convert back to actual timestamp
  const diff = nextMidnight.getTime() - kolkataNow.getTime()
  return now.getTime() + diff
}

export function isPastMidnightKolkata(): boolean {
  const kolkataNow = getKolkataDate(new Date())
  return kolkataNow.getHours() === 0 && kolkataNow.getMinutes() === 0 && kolkataNow.getSeconds() === 0
}

export function getPreviousBusinessDate(date: Date = new Date()): string {
  const d = getKolkataDate(date)
  d.setDate(d.getDate() - 1)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

export function getBusinessDateForTimestamp(timestamp: number): string {
  return getKolkataDateKey(new Date(timestamp))
}