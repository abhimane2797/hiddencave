import { addDays, dateKey } from '@/lib/utils'

export interface DailyRevenuePoint {
  date: string
  label: string
  revenue: number
  customers: number
  sessions: number
}

const revenueValues = [8240, 6120, 7480, 9310, 10240, 12860, 11400, 7890, 6540, 8120, 9760, 10980, 13420, 12150]
const customerValues = [18, 14, 16, 21, 24, 29, 26, 17, 15, 19, 22, 25, 31, 27]
const sessionValues = [22, 17, 20, 26, 28, 34, 31, 21, 18, 23, 27, 30, 38, 33]

export function buildDailyRevenue(now = new Date(), days = 14): DailyRevenuePoint[] {
  const points: DailyRevenuePoint[] = []
  for (let i = days - 1; i >= 0; i--) {
    const date = addDays(now, -i)
    const idx =
      ((revenueValues.length - 1 - i) % revenueValues.length + revenueValues.length) %
      revenueValues.length
    points.push({
      date: dateKey(date),
      label: date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }),
      revenue: revenueValues[idx],
      customers: customerValues[idx],
      sessions: sessionValues[idx],
    })
  }
  return points
}

export const hourlyActivity = [
  { hour: '10 AM', customers: 3, label: '10:00' },
  { hour: '11 AM', customers: 5, label: '11:00' },
  { hour: '12 PM', customers: 7, label: '12:00' },
  { hour: '1 PM', customers: 6, label: '13:00' },
  { hour: '2 PM', customers: 8, label: '14:00' },
  { hour: '3 PM', customers: 9, label: '15:00' },
  { hour: '4 PM', customers: 11, label: '16:00' },
  { hour: '5 PM', customers: 14, label: '17:00' },
  { hour: '6 PM', customers: 19, label: '18:00' },
  { hour: '7 PM', customers: 23, label: '19:00' },
  { hour: '8 PM', customers: 21, label: '20:00' },
  { hour: '9 PM', customers: 17, label: '21:00' },
  { hour: '10 PM', customers: 12, label: '22:00' },
  { hour: '11 PM', customers: 6, label: '23:00' },
]

export const paymentBreakdown = [
  { method: 'UPI', value: 8240, color: '#3b7dff' },
  { method: 'Cash', value: 4120, color: '#8b5cf6' },
  { method: 'Card', value: 5310, color: '#22d3ee' },
  { method: 'Membership', value: 2380, color: '#34d399' },
]

export const stationUtilization = [
  { station: 'Station 01', sessions: 9, hours: 11.5, revenue: 2864, utilization: 82 },
  { station: 'Station 02', sessions: 8, hours: 12, revenue: 2988, utilization: 78 },
  { station: 'Station 03', sessions: 6, hours: 7.5, revenue: 1868, utilization: 54 },
  { station: 'Station 04', sessions: 7, hours: 8.5, revenue: 2117, utilization: 61 },
  { station: 'Station 05', sessions: 5, hours: 6, revenue: 1494, utilization: 45 },
  { station: 'Station 06', sessions: 0, hours: 0, revenue: 0, utilization: 0 },
  { station: 'VIP 01', sessions: 6, hours: 9.5, revenue: 3316, utilization: 71 },
  { station: 'VIP 02', sessions: 4, hours: 7, revenue: 2443, utilization: 58 },
]

export const dailyReportSummary = {
  revenue: 20050,
  customers: 27,
  completedSessions: 22,
  averageSessionMinutes: 74,
  utilization: 62,
  topStation: 'Station 02',
  peakHour: '7 PM - 9 PM',
  repeatCustomerRate: 58,
}

export function buildReportEntries() {
  return Array.from({ length: 18 }).map((_, i) => {
    const hour = 10 + (i % 12)
    const station = `st-0${(i % 5) + 1}`
    const amount = [249, 374, 449, 125, 699, 311][i % 6]
    return {
      id: `RPT-${900 + i}`,
      time: `${String(hour).padStart(2, '0')}:${i % 2 === 0 ? '10' : '40'}`,
      customer: ['Rahul S.', 'Ananya I.', 'Kabir M.', 'Zoya K.', 'Arjun N.', 'Meera J.'][i % 6],
      station,
      duration: [30, 60, 90, 120][i % 4],
      amount,
      method: ['upi', 'cash', 'card', 'membership'][i % 4],
      status: i % 5 === 0 ? 'Pending' : 'Paid',
    }
  })
}

export const WEEKDAY_LABELS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

export function dayKeyOffset(daysAgo: number) {
  return dateKey(addDays(new Date(), -daysAgo))
}