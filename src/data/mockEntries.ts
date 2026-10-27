import type { WalkInEntry } from '@/types'
import { computeSessionAmount } from '@/lib/utils'

interface EntrySpec {
  customerName: string
  mobile: string
  stationId: string
  hoursAgo: number
  plannedMinutes: number
  hourlyRate: number
  paymentMethod: WalkInEntry['paymentMethod']
  paymentStatus: WalkInEntry['paymentStatus']
  completed: boolean
}

const specs: EntrySpec[] = [
  { customerName: 'Rahul Sharma', mobile: '+91 98765 41021', stationId: 'st-01', hoursAgo: 0.3, plannedMinutes: 60, hourlyRate: 249, paymentMethod: 'upi', paymentStatus: 'paid', completed: false },
  { customerName: 'Ananya Iyer', mobile: '+91 98220 77190', stationId: 'st-02', hoursAgo: 1, plannedMinutes: 120, hourlyRate: 249, paymentMethod: 'card', paymentStatus: 'paid', completed: false },
  { customerName: 'Kabir Mehta', mobile: '+91 90045 33218', stationId: 'st-03', hoursAgo: 0.95, plannedMinutes: 60, hourlyRate: 249, paymentMethod: 'cash', paymentStatus: 'pending', completed: false },
  { customerName: 'Zoya Khan', mobile: '+91 97654 88213', stationId: 'st-04', hoursAgo: 0.6, plannedMinutes: 30, hourlyRate: 249, paymentMethod: 'upi', paymentStatus: 'pending', completed: false },
  { customerName: 'Arjun Nair', mobile: '+91 99870 12004', stationId: 'st-vip-01', hoursAgo: 0.5, plannedMinutes: 90, hourlyRate: 349, paymentMethod: 'membership', paymentStatus: 'partial', completed: false },
  { customerName: 'Neha Verma', mobile: '+91 98901 23455', stationId: 'st-05', hoursAgo: 2.4, plannedMinutes: 60, hourlyRate: 249, paymentMethod: 'upi', paymentStatus: 'paid', completed: true },
  { customerName: 'Rohit Deshmukh', mobile: '+91 98111 55001', stationId: 'st-01', hoursAgo: 3.2, plannedMinutes: 90, hourlyRate: 249, paymentMethod: 'cash', paymentStatus: 'paid', completed: true },
  { customerName: 'Yash Patil', mobile: '+91 98123 45009', stationId: 'st-04', hoursAgo: 4.1, plannedMinutes: 90, hourlyRate: 249, paymentMethod: 'cash', paymentStatus: 'paid', completed: true },
  { customerName: 'Meera Joshi', mobile: '+91 99887 44051', stationId: 'st-03', hoursAgo: 5.0, plannedMinutes: 60, hourlyRate: 249, paymentMethod: 'upi', paymentStatus: 'paid', completed: true },
  { customerName: 'Sahil Bhatia', mobile: '+91 93333 21007', stationId: 'st-02', hoursAgo: 5.6, plannedMinutes: 60, hourlyRate: 249, paymentMethod: 'card', paymentStatus: 'paid', completed: true },
  { customerName: 'Tanvi Rane', mobile: '+91 91234 77601', stationId: 'st-vip-01', hoursAgo: 6.3, plannedMinutes: 120, hourlyRate: 349, paymentMethod: 'card', paymentStatus: 'paid', completed: true },
  { customerName: 'Vivaan Kapoor', mobile: '+91 98119 30922', stationId: 'st-05', hoursAgo: 7.1, plannedMinutes: 30, hourlyRate: 249, paymentMethod: 'upi', paymentStatus: 'paid', completed: true },
  { customerName: 'Kiara Fernandes', mobile: '+91 97456 32018', stationId: 'st-02', hoursAgo: 7.8, plannedMinutes: 60, hourlyRate: 249, paymentMethod: 'card', paymentStatus: 'paid', completed: true },
  { customerName: 'Aarav Singh', mobile: '+91 96543 09981', stationId: 'st-03', hoursAgo: 8.4, plannedMinutes: 60, hourlyRate: 249, paymentMethod: 'upi', paymentStatus: 'paid', completed: true },
]

const seedSessionIds = ['seed-1', 'seed-2', 'seed-3', 'seed-4', 'seed-5']

export function createSeedEntries(now = new Date()): WalkInEntry[] {
  return specs.map((spec, i) => {
    const checkedIn = now.getTime() - spec.hoursAgo * 3600_000
    return {
      id: `WE-${1001 + i}`,
      customerId: null,
      customerName: spec.customerName,
      mobile: spec.mobile,
      stationId: spec.stationId,
      checkedInAt: checkedIn,
      plannedMinutes: spec.plannedMinutes,
      hourlyRate: spec.hourlyRate,
      amount: computeSessionAmount(spec.hourlyRate, spec.plannedMinutes),
      paymentMethod: spec.paymentMethod,
      paymentStatus: spec.paymentStatus,
      sessionId: i < seedSessionIds.length ? seedSessionIds[i] : null,
      completed: spec.completed,
      endedAt: spec.completed ? checkedIn + spec.plannedMinutes * 60_000 : null,
    }
  })
}