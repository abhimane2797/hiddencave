import type { Customer, CustomerVisit } from '@/types'
import { addDays, dateKey } from '@/lib/utils'

interface CustomerSpec {
  id: string
  name: string
  mobile: string
  email?: string
  joinedDaysAgo: number
  favoriteStationId?: string
  notes?: string
  visits: Array<{
    daysAgo: number
    stationId: string
    minutes: number
    amount: number
    status?: CustomerVisit['status']
  }>
}

const specs: CustomerSpec[] = [
  {
    id: 'c-01',
    name: 'Rahul Sharma',
    mobile: '+91 98765 41021',
    email: 'rahul.sharma@example.com',
    joinedDaysAgo: 96,
    favoriteStationId: 'st-01',
    notes: 'Regular on weekday evenings. Prefers FIFA and racing titles.',
    visits: [
      { daysAgo: 0, stationId: 'st-01', minutes: 60, amount: 249 },
      { daysAgo: 6, stationId: 'st-01', minutes: 120, amount: 449 },
      { daysAgo: 13, stationId: 'st-03', minutes: 60, amount: 249 },
      { daysAgo: 20, stationId: 'st-01', minutes: 90, amount: 374 },
      { daysAgo: 33, stationId: 'st-02', minutes: 60, amount: 249 },
      { daysAgo: 41, stationId: 'st-01', minutes: 60, amount: 249 },
    ],
  },
  {
    id: 'c-02',
    name: 'Ananya Iyer',
    mobile: '+91 98220 77190',
    email: 'ananya.iyer@example.com',
    joinedDaysAgo: 64,
    favoriteStationId: 'st-02',
    notes: 'Brings a friend most sessions. Loves co-op adventures.',
    visits: [
      { daysAgo: 0, stationId: 'st-02', minutes: 120, amount: 449 },
      { daysAgo: 9, stationId: 'st-02', minutes: 60, amount: 249 },
      { daysAgo: 18, stationId: 'st-vip-01', minutes: 120, amount: 699 },
      { daysAgo: 27, stationId: 'st-02', minutes: 60, amount: 249 },
      { daysAgo: 44, stationId: 'st-05', minutes: 30, amount: 125 },
    ],
  },
  {
    id: 'c-03',
    name: 'Kabir Mehta',
    mobile: '+91 90045 33218',
    joinedDaysAgo: 38,
    favoriteStationId: 'st-03',
    visits: [
      { daysAgo: 0, stationId: 'st-03', minutes: 60, amount: 249 },
      { daysAgo: 11, stationId: 'st-03', minutes: 60, amount: 249 },
      { daysAgo: 25, stationId: 'st-04', minutes: 30, amount: 125 },
    ],
  },
  {
    id: 'c-04',
    name: 'Zoya Khan',
    mobile: '+91 97654 88213',
    email: 'zoya.khan@example.com',
    joinedDaysAgo: 52,
    favoriteStationId: 'st-04',
    notes: 'Tournament regular. Usually pays pending and settles at exit.',
    visits: [
      { daysAgo: 0, stationId: 'st-04', minutes: 30, amount: 125 },
      { daysAgo: 4, stationId: 'st-04', minutes: 60, amount: 249 },
      { daysAgo: 12, stationId: 'st-vip-01', minutes: 90, amount: 524 },
      { daysAgo: 19, stationId: 'st-04', minutes: 60, amount: 249 },
      { daysAgo: 30, stationId: 'st-01', minutes: 60, amount: 249 },
      { daysAgo: 38, stationId: 'st-04', minutes: 120, amount: 449 },
      { daysAgo: 47, stationId: 'st-02', minutes: 60, amount: 249 },
    ],
  },
  {
    id: 'c-05',
    name: 'Arjun Nair',
    mobile: '+91 99870 12004',
    email: 'arjun.nair@example.com',
    joinedDaysAgo: 121,
    favoriteStationId: 'st-vip-01',
    notes: 'VIP member — 10% off on all sessions. Prefers the private room.',
    visits: [
      { daysAgo: 0, stationId: 'st-vip-01', minutes: 90, amount: 314 },
      { daysAgo: 7, stationId: 'st-vip-01', minutes: 120, amount: 419 },
      { daysAgo: 14, stationId: 'st-vip-02', minutes: 90, amount: 314 },
      { daysAgo: 21, stationId: 'st-vip-01', minutes: 60, amount: 209 },
      { daysAgo: 28, stationId: 'st-vip-01', minutes: 120, amount: 419 },
      { daysAgo: 36, stationId: 'st-vip-02', minutes: 90, amount: 314 },
      { daysAgo: 49, stationId: 'st-vip-01', minutes: 60, amount: 209 },
      { daysAgo: 60, stationId: 'st-vip-01', minutes: 150, amount: 524 },
    ],
  },
  {
    id: 'c-06',
    name: 'Neha Verma',
    mobile: '+91 98901 23455',
    joinedDaysAgo: 22,
    favoriteStationId: 'st-05',
    visits: [
      { daysAgo: 0, stationId: 'st-05', minutes: 60, amount: 249, status: 'active' },
      { daysAgo: 8, stationId: 'st-05', minutes: 60, amount: 249 },
    ],
  },
  {
    id: 'c-07',
    name: 'Rohit Deshmukh',
    mobile: '+91 98111 55001',
    joinedDaysAgo: 45,
    visits: [
      { daysAgo: 0, stationId: 'st-01', minutes: 90, amount: 374 },
      { daysAgo: 15, stationId: 'st-02', minutes: 60, amount: 249 },
      { daysAgo: 22, stationId: 'st-01', minutes: 60, amount: 249 },
    ],
  },
  {
    id: 'c-08',
    name: 'Ishaan Kulkarni',
    mobile: '+91 90222 41008',
    joinedDaysAgo: 17,
    visits: [
      { daysAgo: 0, stationId: 'st-05', minutes: 120, amount: 449, status: 'active' },
      { daysAgo: 10, stationId: 'st-05', minutes: 60, amount: 249 },
    ],
  },
  {
    id: 'c-09',
    name: 'Priya Menon',
    mobile: '+91 98220 65943',
    email: 'priya.menon@example.com',
    joinedDaysAgo: 9,
    visits: [
      { daysAgo: 0, stationId: 'st-02', minutes: 60, amount: 249, status: 'cancelled' },
      { daysAgo: 5, stationId: 'st-03', minutes: 60, amount: 249 },
    ],
  },
  {
    id: 'c-10',
    name: 'Aditya Rao',
    mobile: '+91 98665 11220',
    joinedDaysAgo: 71,
    favoriteStationId: 'st-02',
    notes: 'Plays late-night peak slots. Ask about membership upgrade.',
    visits: [
      { daysAgo: 2, stationId: 'st-02', minutes: 60, amount: 311 },
      { daysAgo: 16, stationId: 'st-02', minutes: 120, amount: 561 },
      { daysAgo: 23, stationId: 'st-01', minutes: 60, amount: 249 },
      { daysAgo: 37, stationId: 'st-02', minutes: 60, amount: 249 },
      { daysAgo: 51, stationId: 'st-04', minutes: 90, amount: 374 },
    ],
  },
  {
    id: 'c-11',
    name: 'Falcon Five Squad',
    mobile: '+91 97001 88310',
    joinedDaysAgo: 58,
    favoriteStationId: 'st-vip-02',
    notes: 'Corporate league squad. Books VIP room on Friday nights.',
    visits: [
      { daysAgo: 0, stationId: 'st-vip-02', minutes: 120, amount: 799, status: 'active' },
      { daysAgo: 7, stationId: 'st-vip-02', minutes: 120, amount: 799 },
      { daysAgo: 14, stationId: 'st-vip-01', minutes: 120, amount: 799 },
      { daysAgo: 28, stationId: 'st-vip-02', minutes: 180, amount: 1099 },
    ],
  },
  {
    id: 'c-12',
    name: 'Devika Suresh',
    mobile: '+91 90909 65123',
    joinedDaysAgo: 14,
    visits: [
      { daysAgo: 1, stationId: 'st-03', minutes: 60, amount: 249, status: 'cancelled' },
      { daysAgo: 6, stationId: 'st-01', minutes: 60, amount: 249 },
    ],
  },
]

export function createSeedCustomers(now = new Date()): Customer[] {
  return specs.map((spec) => ({
    id: spec.id,
    name: spec.name,
    mobile: spec.mobile,
    email: spec.email,
    joinedAt: dateKey(addDays(now, -spec.joinedDaysAgo)),
    favoriteStationId: spec.favoriteStationId ?? null,
    notes: spec.notes,
    visits: spec.visits.map((v, i) => ({
      id: `${spec.id}-v${i + 1}`,
      date: dateKey(addDays(now, -v.daysAgo)),
      stationId: v.stationId,
      minutes: v.minutes,
      amount: v.amount,
      status: v.status ?? 'completed',
    })),
  }))
}