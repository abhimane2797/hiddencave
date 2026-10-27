import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react'
import type {
  Booking,
  BookingStatus,
  Customer,
  GameSession,
  OpeningHour,
  PaymentMethod,
  PaymentStatus,
  PricingPackage,
  Station,
  StationStatus,
  ToastMessage,
  ToastVariant,
  WalkInEntry,
  ZoneProfile,
  ZoneSettings,
} from '@/types'
import { mockStations } from '@/data/mockStations'
import { createSeedSessions } from '@/data/mockSessions'
import { createSeedBookings } from '@/data/mockBookings'
import { createSeedCustomers } from '@/data/mockCustomers'
import { createSeedEntries } from '@/data/mockEntries'
import {
  ALLOWED_DURATIONS,
  DEFAULT_HOURLY_RATE,
  DEFAULT_SESSION_MINUTES,
  DEFAULT_VIP_HOURLY_RATE,
  PEAK_HOURS,
  PRICING_PACKAGES,
  TIMER_DEFAULTS,
  ZONE_PROFILE,
} from '@/config/pricing'
import { ACCENTS, type AccentKey } from '@/config/theme'
import {
  bookingId as makeBookingId,
  computeSessionAmount,
  dateKey,
  entryId as makeEntryId,
  humanDuration,
  isPeakTime,
  nextSeq,
  INR,
  sessionId as makeSessionId,
} from '@/lib/utils'
import { playSuccessChime, playWarningChime, unlockAudio } from '@/lib/sound'

export interface PricingState {
  hourlyRate: number
  vipHourlyRate: number
  peakStart: string
  peakEnd: string
  peakMultiplier: number
  peakEnabled: boolean
  defaultSessionMinutes: number
  allowedDurations: number[]
}

export interface SessionInput {
  customerName: string
  mobile: string
  stationId: string
  minutes: number
  rate?: number
  players?: number
  paymentMethod: PaymentMethod
  paymentStatus: PaymentStatus
  bookingId?: string | null
  notes?: string
}

export interface BookingInput {
  customerName: string
  mobile: string
  date: string
  startTime: string
  durationMinutes: number
  stationId: string | 'any'
  players: number
  packageId?: string | null
  paymentMethod: PaymentMethod
  paymentStatus: PaymentStatus
  notes?: string
  amount: number
}

export interface Quote {
  base: number
  peakSurcharge: number
  total: number
  rate: number
  peakApplied: boolean
}

interface GamingContextValue {
  stations: Station[]
  sessions: GameSession[]
  bookings: Booking[]
  entries: WalkInEntry[]
  customers: Customer[]
  packages: PricingPackage[]
  pricing: PricingState
  settings: ZoneSettings
  zone: ZoneProfile
  accent: AccentKey
  toasts: ToastMessage[]
  audioUnlocked: boolean
  activeSessions: GameSession[]
  pushToast: (title: string, variant?: ToastVariant, message?: string) => void
  dismissToast: (id: string) => void
  notifyWarning: (title: string, message?: string) => void
  enableAudio: () => void
  getStation: (id: string) => Station | undefined
  sessionForStation: (stationId: string) => GameSession | undefined
  quoteBooking: (durationMinutes: number, stationId: string | 'any', startTime: string) => Quote
  createBooking: (input: BookingInput) => Booking
  updateBooking: (id: string, patch: Partial<Booking>) => void
  setBookingStatus: (id: string, status: BookingStatus) => void
  cancelBooking: (id: string) => void
  checkInBooking: (id: string, stationId: string) => GameSession | null
  createWalkIn: (
    input: SessionInput & { startNow: boolean; linkedSession?: GameSession | null; amount?: number },
  ) => WalkInEntry
  markEntryPaid: (id: string) => void
  startSession: (input: SessionInput) => GameSession | null
  extendSession: (id: string, minutes: number) => void
  endSession: (id: string, opts?: { markPaid?: boolean }) => void
  moveSession: (id: string, stationId: string) => void
  snoozeAlert: (id: string, minutes?: number) => void
  setStationStatus: (id: string, status: StationStatus) => void
  addStation: (input: Partial<Station>) => Station
  updateStation: (id: string, patch: Partial<Station>) => void
  removeStation: (id: string) => void
  updatePricing: (patch: Partial<PricingState>) => void
  updatePackage: (id: string, patch: Partial<PricingPackage>) => void
  addPackage: (input: Omit<PricingPackage, 'id'>) => PricingPackage
  removePackage: (id: string) => void
  updateZone: (patch: Partial<ZoneProfile>) => void
  updateHours: (hours: OpeningHour[]) => void
  updateSettings: (patch: Partial<ZoneSettings>) => void
  setAccent: (key: AccentKey) => void
  updateCustomer: (id: string, patch: Partial<Customer>) => void
  resetDemoData: () => void
  clearAllData: () => void
}

const GamingContext = createContext<GamingContextValue | null>(null)

function defaultPricing(): PricingState {
  return {
    hourlyRate: DEFAULT_HOURLY_RATE,
    vipHourlyRate: DEFAULT_VIP_HOURLY_RATE,
    peakStart: PEAK_HOURS.start,
    peakEnd: PEAK_HOURS.end,
    peakMultiplier: PEAK_HOURS.multiplier,
    peakEnabled: PEAK_HOURS.enabled,
    defaultSessionMinutes: DEFAULT_SESSION_MINUTES,
    allowedDurations: [...ALLOWED_DURATIONS],
  }
}

function defaultSettings(): ZoneSettings {
  return {
    warningMinutes: TIMER_DEFAULTS.warningMinutes,
    snoozeMinutes: TIMER_DEFAULTS.snoozeMinutes,
    soundEnabled: true,
    autoExtendOnPause: false,
  }
}

function buildSeedState() {
  const now = new Date()
  const sessions = createSeedSessions(now.getTime())
  const stations = mockStations.map((station) => {
    const session = sessions.find((s) => s.stationId === station.id)
    return session
      ? { ...station, status: 'occupied' as StationStatus, currentSessionId: session.id }
      : { ...station, currentSessionId: null }
  })
  return {
    stations,
    sessions,
    bookings: createSeedBookings(now),
    entries: createSeedEntries(now),
    customers: createSeedCustomers(now),
  }
}

let toastSeq = 1

export function GamingProvider({ children }: { children: ReactNode }) {
  const seedRef = useRef(buildSeedState())
  const [stations, setStations] = useState<Station[]>(seedRef.current.stations)
  const [sessions, setSessions] = useState<GameSession[]>(seedRef.current.sessions)
  const [bookings, setBookings] = useState<Booking[]>(seedRef.current.bookings)
  const [entries, setEntries] = useState<WalkInEntry[]>(seedRef.current.entries)
  const [customers, setCustomers] = useState<Customer[]>(seedRef.current.customers)
  const [packages, setPackages] = useState<PricingPackage[]>(PRICING_PACKAGES.map((p) => ({ ...p })))
  const [pricing, setPricing] = useState<PricingState>(defaultPricing())
  const [settings, setSettings] = useState<ZoneSettings>(defaultSettings())
  const [zone, setZone] = useState<ZoneProfile>({ ...ZONE_PROFILE, hours: [...ZONE_PROFILE.hours] })
  const [accent, setAccentKey] = useState<AccentKey>('blue')
  const [toasts, setToasts] = useState<ToastMessage[]>([])
  const [audioUnlocked, setAudioUnlocked] = useState(false)

  useEffect(() => {
    document.documentElement.style.setProperty('--accent-rgb', ACCENTS[accent].rgb)
  }, [accent])

  useEffect(() => {
    const handler = () => {
      unlockAudio()
      setAudioUnlocked(true)
    }
    window.addEventListener('pointerdown', handler, { once: true })
    window.addEventListener('keydown', handler, { once: true })
    return () => {
      window.removeEventListener('pointerdown', handler)
      window.removeEventListener('keydown', handler)
    }
  }, [])

  const pushToast = useCallback(
    (title: string, variant: ToastVariant = 'success', message?: string) => {
      const id = `t-${toastSeq++}`
      setToasts((prev) => [...prev.slice(-3), { id, title, message, variant }])
      window.setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id))
      }, 5200)
    },
    [],
  )

  const dismissToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }, [])

  const notifyWarning = useCallback((title: string, message?: string) => {
    pushToast(title, 'warning', message)
    playWarningChime()
  }, [pushToast])

  const enableAudio = useCallback(() => {
    unlockAudio()
    setAudioUnlocked(true)
  }, [])

  const getStation = useCallback(
    (id: string) => stations.find((s) => s.id === id),
    [stations],
  )

  const activeSessions = useMemo(() => sessions.filter((s) => !s.completed), [sessions])

  const sessionForStation = useCallback(
    (stationId: string) => sessions.find((s) => !s.completed && s.stationId === stationId),
    [sessions],
  )

  const resolveRate = useCallback(
    (stationId: string | 'any', customRate?: number) => {
      if (typeof customRate === 'number') return customRate
      const station = stations.find((s) => s.id === stationId)
      if (station) return station.hourlyRate
      return pricing.hourlyRate
    },
    [stations, pricing.hourlyRate],
  )

  const quoteBooking = useCallback(
    (durationMinutes: number, stationId: string | 'any', startTime: string): Quote => {
      const station = stations.find((s) => s.id === stationId)
      const rate =
        station?.hourlyRate ??
        (stationId === 'any'
          ? pricing.hourlyRate
          : pricing.hourlyRate)
      const base = Math.round((rate * durationMinutes) / 60)
      const peakApplied =
        pricing.peakEnabled && isPeakTime(startTime, pricing.peakStart, pricing.peakEnd)
      const peakSurcharge = peakApplied ? Math.round(base * (pricing.peakMultiplier - 1)) : 0
      return { base, peakSurcharge, total: base + peakSurcharge, rate, peakApplied }
    },
    [stations, pricing],
  )

  const resolveCustomer = useCallback(
    (name: string, mobile: string): { customerId: string; isNew: boolean } => {
      const existing = customers.find((c) => c.mobile.replace(/\D/g, '') === mobile.replace(/\D/g, ''))
      if (existing) return { customerId: existing.id, isNew: false }
      const id = `c-${nextSeq()}`
      const fresh: Customer = {
        id,
        name,
        mobile,
        joinedAt: dateKey(new Date()),
        favoriteStationId: null,
        visits: [],
      }
      setCustomers((prev) => [fresh, ...prev])
      return { customerId: id, isNew: true }
    },
    [customers],
  )

  const addVisitToCustomer = useCallback(
    (customerId: string, visit: Customer['visits'][number]) => {
      setCustomers((prev) =>
        prev.map((c) => (c.id === customerId ? { ...c, visits: [visit, ...c.visits] } : c)),
      )
    },
    [],
  )

  const startSession = useCallback(
    (input: SessionInput): GameSession | null => {
      const station = stations.find((s) => s.id === input.stationId)
      if (!station) return null
      if (station.status !== 'available') {
        pushToast(`${station.name} is not available`, 'error', 'Pick an available station first.')
        return null
      }
      const rate = resolveRate(input.stationId, input.rate)
      const session: GameSession = {
        id: makeSessionId(),
        stationId: input.stationId,
        customerId: null,
        customerName: input.customerName,
        mobile: input.mobile,
        startedAt: Date.now(),
        plannedMinutes: input.minutes,
        extendedMinutes: 0,
        rate,
        players: input.players ?? 1,
        paymentMethod: input.paymentMethod,
        paymentStatus: input.paymentStatus,
        bookingId: input.bookingId ?? null,
        notes: input.notes,
        alertSnoozedUntil: null,
        completed: false,
        endedAt: null,
      }
      const { customerId } = resolveCustomer(input.customerName, input.mobile)
      session.customerId = customerId
      setSessions((prev) => [...prev, session])
      setStations((prev) =>
        prev.map((s) =>
          s.id === input.stationId
            ? { ...s, status: 'occupied' as StationStatus, currentSessionId: session.id }
            : s,
        ),
      )
      pushToast(
        `Session started · ${station.name}`,
        'success',
        `${input.customerName} · ${humanDuration(input.minutes)} planned`,
      )
      return session
    },
    [stations, resolveRate, resolveCustomer, pushToast],
  )

  const markEntryPaid = useCallback(
    (id: string) => {
      const entry = entries.find((e) => e.id === id)
      if (!entry) return
      setEntries((prev) =>
        prev.map((e) => (e.id === id ? { ...e, paymentStatus: 'paid' as PaymentStatus } : e)),
      )
      if (entry.sessionId) {
        setSessions((prev) =>
          prev.map((s) => (s.id === entry.sessionId ? { ...s, paymentStatus: 'paid' as PaymentStatus } : s)),
        )
      }
      pushToast('Payment recorded', 'success', `${entry.customerName} · ${INR(entry.amount)}`)
    },
    [entries, pushToast],
  )

  const createWalkIn = useCallback(
    (
      input: SessionInput & { startNow: boolean; linkedSession?: GameSession | null; amount?: number },
    ): WalkInEntry => {
      const station = stations.find((s) => s.id === input.stationId)
      const rate = resolveRate(input.stationId, input.rate)
      const linked = input.linkedSession ?? null
      const entry: WalkInEntry = {
        id: makeEntryId(),
        customerId: linked?.customerId ?? null,
        customerName: input.customerName,
        mobile: input.mobile,
        stationId: input.stationId,
        checkedInAt: Date.now(),
        plannedMinutes: input.minutes,
        hourlyRate: rate,
        amount: input.amount ?? computeSessionAmount(rate, input.minutes),
        paymentMethod: input.paymentMethod,
        paymentStatus: input.paymentStatus,
        sessionId: linked?.id ?? null,
        completed: false,
        endedAt: null,
      }
      if (input.startNow && !linked) {
        const session = startSession(input)
        if (session) {
          entry.sessionId = session.id
          entry.customerId = session.customerId ?? null
        } else {
          entry.sessionId = null
          pushToast('Entry saved without a session', 'warning', `${station?.name ?? 'Station'} is not available.`)
        }
      }
      setEntries((prev) => [entry, ...prev])
      if (entry.customerId) {
        addVisitToCustomer(entry.customerId, {
          id: `${entry.id}-visit`,
          date: dateKey(new Date()),
          stationId: entry.stationId,
          minutes: entry.plannedMinutes,
          amount: entry.amount,
          status: entry.sessionId ? 'active' : 'completed',
        })
      }
      return entry
    },
    [stations, resolveRate, startSession, pushToast, addVisitToCustomer],
  )

  const extendSession = useCallback(
    (id: string, minutes: number) => {
      setSessions((prev) =>
        prev.map((s) => (s.id === id ? { ...s, extendedMinutes: s.extendedMinutes + minutes } : s)),
      )
      const session = sessions.find((s) => s.id === id)
      if (session) {
        setEntries((prev) =>
          prev.map((e) => (e.sessionId === id ? { ...e, plannedMinutes: e.plannedMinutes + minutes, amount: computeSessionAmount(e.hourlyRate, e.plannedMinutes + minutes) } : e)),
        )
        pushToast(
          `Session extended by ${minutes} min`,
          'success',
          `${session.customerName} · new total ${session.plannedMinutes + session.extendedMinutes + minutes} min`,
        )
      }
    },
    [sessions, pushToast],
  )

  const endSession = useCallback(
    (id: string, opts?: { markPaid?: boolean }) => {
      const session = sessions.find((s) => s.id === id)
      if (!session) return
      const endedAt = Date.now()
      const totalMinutes = session.plannedMinutes + session.extendedMinutes
      const amount = computeSessionAmount(session.rate, totalMinutes)
      setSessions((prev) =>
        prev.map((s) =>
          s.id === id
            ? {
                ...s,
                completed: true,
                endedAt,
                paymentStatus: opts?.markPaid ? 'paid' : s.paymentStatus,
              }
            : s,
        ),
      )
      setStations((prev) =>
        prev.map((s) =>
          s.id === session.stationId
            ? { ...s, status: 'available' as StationStatus, currentSessionId: null }
            : s,
        ),
      )
      setEntries((prev) =>
        prev.map((e) =>
          e.sessionId === id
            ? {
                ...e,
                completed: true,
                endedAt,
                paymentStatus: opts?.markPaid ? 'paid' : e.paymentStatus,
              }
            : e,
        ),
      )
      if (session.customerId) {
        setCustomers((prev) =>
          prev.map((c) => {
            if (c.id !== session.customerId) return c
            const previous = c.visits.filter((v) => !(v.status === 'active' && v.stationId === session.stationId))
            return {
              ...c,
              visits: [
                {
                  id: `${id}-visit`,
                  date: dateKey(new Date(endedAt)),
                  stationId: session.stationId,
                  minutes: Math.round((endedAt - session.startedAt) / 60_000),
                  amount,
                  status: 'completed' as const,
                },
                ...previous,
              ],
            }
          }),
        )
      }
      pushToast(
        `Session closed · ${session.customerName}`,
        'success',
        `${totalMinutes} min played · ${opts?.markPaid ? 'marked as paid' : 'payment unchanged'}`,
      )
      playSuccessChime()
    },
    [sessions, pushToast, addVisitToCustomer],
  )

  const moveSession = useCallback(
    (id: string, toStationId: string) => {
      const session = sessions.find((s) => s.id === id)
      const target = stations.find((s) => s.id === toStationId)
      if (!session || !target) return
      if (target.status !== 'available') {
        pushToast(`${target.name} is not free`, 'error', 'Sessions can only move to available stations.')
        return
      }
      const from = stations.find((s) => s.id === session.stationId)
      setSessions((prev) => prev.map((s) => (s.id === id ? { ...s, stationId: toStationId } : s)))
      setStations((prev) =>
        prev.map((s) => {
          if (s.id === session.stationId) {
            return { ...s, status: 'available' as StationStatus, currentSessionId: null }
          }
          if (s.id === toStationId) {
            return { ...s, status: 'occupied' as StationStatus, currentSessionId: id }
          }
          return s
        }),
      )
      setEntries((prev) => prev.map((e) => (e.sessionId === id ? { ...e, stationId: toStationId } : e)))
      pushToast(
        'Session moved',
        'info',
        `${session.customerName} moved from ${from?.name ?? 'station'} to ${target.name}`,
      )
    },
    [sessions, stations, pushToast],
  )

  const snoozeAlert = useCallback((id: string, minutes?: number) => {
    const snooze = minutes ?? TIMER_DEFAULTS.snoozeMinutes
    setSessions((prev) =>
      prev.map((s) =>
        s.id === id ? { ...s, alertSnoozedUntil: Date.now() + snooze * 60_000 } : s,
      ),
    )
  }, [])

  const setStationStatus = useCallback(
    (id: string, status: StationStatus) => {
      const station = stations.find((s) => s.id === id)
      if (!station) return
      if (station.status === 'occupied' && status !== 'occupied') {
        pushToast('End the running session first', 'error', `${station.name} still has a customer.`)
        return
      }
      setStations((prev) => prev.map((s) => (s.id === id ? { ...s, status } : s)))
      pushToast(`${station.name} set to ${status}`, 'info')
    },
    [stations, pushToast],
  )

  const addStation = useCallback(
    (input: Partial<Station>) => {
      const index = stations.length + 1
      const station: Station = {
        id: `st-${nextSeq()}`,
        name: input.name ?? `Station ${String(index).padStart(2, '0')}`,
        tvNumber: input.tvNumber ?? `TV ${String(index).padStart(2, '0')}`,
        ps5Number: input.ps5Number ?? `PS5 ${String(index).padStart(2, '0')}`,
        zone: input.zone ?? 'Main Floor',
        status: input.status ?? 'available',
        hourlyRate: input.hourlyRate ?? pricing.hourlyRate,
        notes: input.notes,
        currentSessionId: null,
      }
      setStations((prev) => [...prev, station])
      pushToast('Station added', 'success', `${station.name} is ready for allocation.`)
      return station
    },
    [stations.length, pricing.hourlyRate, pushToast],
  )

  const updateStation = useCallback(
    (id: string, patch: Partial<Station>) => {
      setStations((prev) => prev.map((s) => (s.id === id ? { ...s, ...patch } : s)))
    },
    [],
  )

  const removeStation = useCallback(
    (id: string) => {
      const station = stations.find((s) => s.id === id)
      if (!station) return
      if (station.status === 'occupied') {
        pushToast('Cannot remove an occupied station', 'error', 'End or move the session first.')
        return
      }
      setStations((prev) => prev.filter((s) => s.id !== id))
      pushToast(`${station.name} removed`, 'warning', 'Demo change only — reversed on reset.')
    },
    [stations, pushToast],
  )

  const updatePricing = useCallback((patch: Partial<PricingState>) => {
    setPricing((prev) => ({ ...prev, ...patch }))
  }, [])

  const updatePackage = useCallback((id: string, patch: Partial<PricingPackage>) => {
    setPackages((prev) => prev.map((p) => (p.id === id ? { ...p, ...patch } : p)))
  }, [])

  const addPackage = useCallback((input: Omit<PricingPackage, 'id'>) => {
    const pkg: PricingPackage = { ...input, id: `pkg-${nextSeq()}` }
    setPackages((prev) => [...prev, pkg])
    return pkg
  }, [])

  const removePackage = useCallback((id: string) => {
    setPackages((prev) => prev.filter((p) => p.id !== id))
  }, [])

  const updateZone = useCallback((patch: Partial<ZoneProfile>) => {
    setZone((prev) => ({ ...prev, ...patch }))
  }, [])

  const updateHours = useCallback((hours: OpeningHour[]) => {
    setZone((prev) => ({ ...prev, hours }))
  }, [])

  const updateSettings = useCallback((patch: Partial<ZoneSettings>) => {
    setSettings((prev) => ({ ...prev, ...patch }))
  }, [])

  const updateCustomer = useCallback((id: string, patch: Partial<Customer>) => {
    setCustomers((prev) => prev.map((c) => (c.id === id ? { ...c, ...patch } : c)))
  }, [])

  const createBooking = useCallback(
    (input: BookingInput): Booking => {
      const booking: Booking = {
        id: makeBookingId(),
        customerName: input.customerName,
        mobile: input.mobile,
        date: input.date,
        startTime: input.startTime,
        durationMinutes: input.durationMinutes,
        stationId: input.stationId,
        players: input.players,
        packageId: input.packageId ?? null,
        status: 'confirmed',
        amount: input.amount,
        paymentMethod: input.paymentMethod,
        paymentStatus: input.paymentStatus,
        notes: input.notes,
        createdAt: new Date().toISOString(),
      }
      setBookings((prev) => [booking, ...prev])
      resolveCustomer(input.customerName, input.mobile)
      return booking
    },
    [resolveCustomer],
  )

  const updateBooking = useCallback((id: string, patch: Partial<Booking>) => {
    setBookings((prev) => prev.map((b) => (b.id === id ? { ...b, ...patch } : b)))
  }, [])

  const setBookingStatus = useCallback(
    (id: string, status: BookingStatus) => {
      setBookings((prev) => prev.map((b) => (b.id === id ? { ...b, status } : b)))
    },
    [],
  )

  const cancelBooking = useCallback(
    (id: string) => {
      const booking = bookings.find((b) => b.id === id)
      setBookings((prev) =>
        prev.map((b) =>
          b.id === id
            ? { ...b, status: 'cancelled' as BookingStatus, paymentStatus: b.paymentStatus === 'paid' ? 'refunded' : b.paymentStatus }
            : b,
        ),
      )
      if (booking) pushToast('Booking cancelled', 'warning', `${booking.id} · ${booking.customerName}`)
    },
    [bookings, pushToast],
  )

  const checkInBooking = useCallback(
    (id: string, stationId: string): GameSession | null => {
      const booking = bookings.find((b) => b.id === id)
      if (!booking) return null
      const session = startSession({
        customerName: booking.customerName,
        mobile: booking.mobile,
        stationId,
        minutes: booking.durationMinutes,
        players: booking.players,
        paymentMethod: booking.paymentMethod,
        paymentStatus: booking.paymentStatus,
        bookingId: booking.id,
      })
      if (session) {
        setBookings((prev) =>
          prev.map((b) => (b.id === id ? { ...b, status: 'checked-in' as BookingStatus, stationId } : b)),
        )
      }
      return session
    },
    [bookings, startSession],
  )

  const resetDemoData = useCallback(() => {
    const fresh = buildSeedState()
    setStations(fresh.stations)
    setSessions(fresh.sessions)
    setBookings(fresh.bookings)
    setEntries(fresh.entries)
    setCustomers(fresh.customers)
    pushToast('Demo data reset', 'info', 'Stations, bookings and timers restored to seed values.')
  }, [pushToast])

  const clearAllData = useCallback(() => {
    setStations([])
    setSessions([])
    setBookings([])
    setEntries([])
    setCustomers([])
    pushToast('All demo data cleared', 'warning', 'Add stations to start the floor again.')
  }, [pushToast])

  const value: GamingContextValue = {
    stations,
    sessions,
    bookings,
    entries,
    customers,
    packages,
    pricing,
    settings,
    zone,
    accent,
    toasts,
    audioUnlocked,
    activeSessions,
    pushToast,
    dismissToast,
    notifyWarning,
    enableAudio,
    getStation,
    sessionForStation,
    quoteBooking,
    createBooking,
    updateBooking,
    setBookingStatus,
    cancelBooking,
    checkInBooking,
    createWalkIn,
    markEntryPaid,
    startSession,
    extendSession,
    endSession,
    moveSession,
    snoozeAlert,
    setStationStatus,
    addStation,
    updateStation,
    removeStation,
    updatePricing,
    updatePackage,
    addPackage,
    removePackage,
    updateZone,
    updateHours,
    updateSettings,
    setAccent: setAccentKey,
    updateCustomer,
    resetDemoData,
    clearAllData,
  }

  return <GamingContext.Provider value={value}>{children}</GamingContext.Provider>
}

export function useGaming() {
  const ctx = useContext(GamingContext)
  if (!ctx) throw new Error('useGaming must be used inside GamingProvider')
  return ctx
}