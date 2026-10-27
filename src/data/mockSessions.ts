import type { GameSession } from '@/types'

interface SeedSpec {
  id: string
  stationId: string
  customerName: string
  mobile: string
  plannedMinutes: number
  elapsedMs: number
  rate: number
  players?: number
  paymentMethod: GameSession['paymentMethod']
  paymentStatus: GameSession['paymentStatus']
}

const specs: SeedSpec[] = [
  {
    id: 'seed-1',
    stationId: 'st-01',
    customerName: 'Rahul Sharma',
    mobile: '+91 98765 41021',
    plannedMinutes: 60,
    elapsedMs: 17 * 60_000 + 25_000,
    rate: 249,
    players: 1,
    paymentMethod: 'upi',
    paymentStatus: 'paid',
  },
  {
    id: 'seed-2',
    stationId: 'st-02',
    customerName: 'Ananya Iyer',
    mobile: '+91 98220 77190',
    plannedMinutes: 120,
    elapsedMs: 60 * 60_000,
    rate: 249,
    players: 2,
    paymentMethod: 'card',
    paymentStatus: 'paid',
  },
  {
    id: 'seed-3',
    stationId: 'st-03',
    customerName: 'Kabir Mehta',
    mobile: '+91 90045 33218',
    plannedMinutes: 60,
    elapsedMs: 55 * 60_000,
    rate: 249,
    players: 1,
    paymentMethod: 'cash',
    paymentStatus: 'pending',
  },
  {
    id: 'seed-4',
    stationId: 'st-04',
    customerName: 'Zoya Khan',
    mobile: '+91 97654 88213',
    plannedMinutes: 30,
    elapsedMs: 34 * 60_000,
    rate: 249,
    players: 2,
    paymentMethod: 'upi',
    paymentStatus: 'pending',
  },
  {
    id: 'seed-5',
    stationId: 'st-vip-01',
    customerName: 'Arjun Nair',
    mobile: '+91 99870 12004',
    plannedMinutes: 90,
    elapsedMs: 30 * 60_000,
    rate: 349,
    players: 3,
    paymentMethod: 'membership',
    paymentStatus: 'partial',
  },
]

/** Sessions created at app start so timers, warnings and alerts are live on load. */
export function createSeedSessions(now: number): GameSession[] {
  return specs.map((spec) => ({
    id: spec.id,
    stationId: spec.stationId,
    customerName: spec.customerName,
    mobile: spec.mobile,
    startedAt: now - spec.elapsedMs,
    plannedMinutes: spec.plannedMinutes,
    extendedMinutes: 0,
    rate: spec.rate,
    players: spec.players ?? 1,
    paymentMethod: spec.paymentMethod,
    paymentStatus: spec.paymentStatus,
    bookingId: null as string | null,
    alertSnoozedUntil: null as number | null,
    completed: false,
    endedAt: null as number | null,
  }))
}