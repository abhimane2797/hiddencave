import type { LucideIcon } from 'lucide-react'
import {
  BarChart3,
  CalendarCheck,
  ClipboardList,
  LayoutDashboard,
  MonitorPlay,
  Settings2,
  Tags,
  Timer,
  UsersRound,
  Wrench,
} from 'lucide-react'

export interface NavItem {
  to: string
  label: string
  icon: LucideIcon
  end?: boolean
  badgeKey?: 'activeSessions' | 'occupied' | 'todayBookings' | 'pendingPayments'
}

export interface NavSection {
  title: string
  items: NavItem[]
}

export const DASHBOARD_NAV: NavSection[] = [
  {
    title: 'Operations',
    items: [
      { to: '/dashboard', label: 'Overview', icon: LayoutDashboard, end: true },
      { to: '/dashboard/floor', label: 'Live Gaming Floor', icon: MonitorPlay, badgeKey: 'occupied' },
      { to: '/dashboard/bookings', label: 'Slot Bookings', icon: CalendarCheck, badgeKey: 'todayBookings' },
      { to: '/dashboard/walk-ins', label: 'Walk-in Entries', icon: ClipboardList, badgeKey: 'pendingPayments' },
      { to: '/dashboard/sessions', label: 'Active Sessions', icon: Timer, badgeKey: 'activeSessions' },
    ],
  },
  {
    title: 'Insights',
    items: [
      { to: '/dashboard/customers', label: 'Customer History', icon: UsersRound },
      { to: '/dashboard/reports', label: 'Daily Reports', icon: BarChart3 },
    ],
  },
  {
    title: 'Manage',
    items: [
      { to: '/dashboard/stations', label: 'Station Management', icon: Wrench },
      { to: '/dashboard/pricing', label: 'Pricing & Packages', icon: Tags },
      { to: '/dashboard/settings', label: 'Settings', icon: Settings2 },
    ],
  },
]

export const MOBILE_TABS: NavItem[] = [
  { to: '/dashboard', label: 'Home', icon: LayoutDashboard, end: true },
  { to: '/dashboard/floor', label: 'Floor', icon: MonitorPlay },
  { to: '/dashboard/bookings', label: 'Bookings', icon: CalendarCheck },
  { to: '/dashboard/sessions', label: 'Sessions', icon: Timer },
]

export const PUBLIC_NAV = [
  { href: '#stations', label: 'Stations' },
  { href: '#pricing', label: 'Pricing' },
  { href: '#games', label: 'Games' },
  { href: '#lounge', label: 'Lounge' },
  { href: '#contact', label: 'Contact' },
]