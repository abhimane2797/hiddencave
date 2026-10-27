export type StationZone = 'Main Floor' | 'VIP Room'

export type StationStatus = 'available' | 'occupied' | 'reserved' | 'maintenance'

export type SessionStatus = 'active' | 'almost-over' | 'time-over' | 'completed'

export interface Entry {
  id: string
  customerName: string
  startTime: number
  endTime: number
  durationMinutes: number
  amount: number
  paymentStatus: 'paid' | 'unpaid'
  sessionStatus: SessionStatus
  notes?: string
  createdAt: number
  updatedAt: number
  // Payment tracking
  paidAmount?: number
  totalAmount?: number
  hourlyRate?: number
  // Renewal history
  renewals?: Renewal[]
}

export interface Renewal {
  id: string
  timestamp: number
  addedMinutes: number
  charge: number
  paymentStatus: 'paid' | 'unpaid'
  previousEndTime: number
}

export type ImportPreview = {
  validEntries: Entry[]
  invalidRows: Array<{ row: number; error: string; data: any }>
  duplicates: Entry[]
  totalRows: number
}

// Day Close types
export type DayCloseStatus = 'open' | 'closed' | 'pending'

export type ClosingMethod = 'manual' | 'auto_midnight'

export type RolloverStatus = 'not_needed' | 'pending' | 'in_progress' | 'completed' | 'backup_pending' | 'failed'

export interface DayCloseRecord {
  id: string
  businessDate: string // YYYY-MM-DD
  closedAt: number
  closedBy: string
  status: DayCloseStatus
  closingMethod?: ClosingMethod
  closeReason?: string
  // Session summary
  totalSessions: number
  activeSessions: number
  completedSessions: number
  timeOverSessions: number
  // Financial summary
  totalPayable: number
  totalCollected: number
  totalPending: number
  renewalCount: number
  renewalCharges: number
  renewalCollected: number
  renewalPending: number
  // Session details at close time
  sessions: Entry[]
  // Payment details at close time
  payments: PaymentRecord[]
  // Metadata
  createdAt: number
  updatedAt: number
}

export interface PaymentRecord {
  id: string
  entryId: string
  customerName: string
  amount: number
  timestamp: number
  method?: 'cash' | 'upi' | 'card'
  note?: string
}

// Backup types
export interface BackupRecord {
  id: string
  businessDate: string // YYYY-MM-DD
  dayCloseId: string
  backupVersion: number
  createdAt: number
  status: 'saved' | 'downloaded' | 'failed'
  // Backup content summary
  entryCount: number
  dayCloseSummary: {
    totalSessions: number
    totalPayable: number
    totalCollected: number
    totalPending: number
  }
  // File info
  fileName?: string
  fileSize?: number
  error?: string
}

// Rollover tracking
export interface RolloverState {
  id: string
  businessDate: string
  previousBusinessDate: string
  rolloverStatus: RolloverStatus
  closingMethod: ClosingMethod
  closedAt: number
  backupId?: string
  backupStatus?: 'saved' | 'downloaded' | 'failed'
  newDayInitialized: boolean
  createdAt: number
  updatedAt: number
  error?: string
}

export type PaymentMethod = 'cash' | 'upi' | 'card' | 'membership'

export type PaymentStatus = 'paid' | 'pending' | 'partial' | 'refunded'

export type BookingStatus =
  | 'confirmed'
  | 'pending'
  | 'checked-in'
  | 'completed'
  | 'cancelled'
  | 'no-show'

export type ToastVariant = 'success' | 'error' | 'info' | 'warning'

export interface ToastMessage {
  id: string
  title: string
  message?: string
  variant: ToastVariant
}

export interface Station {
  id: string
  name: string
  tvNumber: string
  ps5Number: string
  zone: StationZone
  status: StationStatus
  hourlyRate: number
  notes?: string
  currentSessionId?: string | null
}

export interface GameSession {
  id: string
  stationId: string
  customerId?: string | null
  customerName: string
  mobile: string
  /** epoch ms */
  startedAt: number
  /** planned duration in minutes */
  plannedMinutes: number
  /** total minutes added via extensions */
  extendedMinutes: number
  rate: number
  players: number
  paymentMethod: PaymentMethod
  paymentStatus: PaymentStatus
  bookingId?: string | null
  notes?: string
  /** epoch ms — when the overdue alert should ring again after snoozing */
  alertSnoozedUntil?: number | null
  completed: boolean
  /** epoch ms */
  endedAt?: number | null
}

export interface Booking {
  id: string
  customerName: string
  mobile: string
  /** YYYY-MM-DD */
  date: string
  /** HH:MM (24h) */
  startTime: string
  durationMinutes: number
  stationId: string | 'any'
  players: number
  packageId?: string | null
  status: BookingStatus
  amount: number
  paymentMethod: PaymentMethod
  paymentStatus: PaymentStatus
  notes?: string
  createdAt: string
}

export interface WalkInEntry {
  id: string
  customerId?: string | null
  customerName: string
  mobile: string
  stationId: string
  /** epoch ms */
  checkedInAt: number
  plannedMinutes: number
  hourlyRate: number
  amount: number
  paymentMethod: PaymentMethod
  paymentStatus: PaymentStatus
  sessionId?: string | null
  completed: boolean
  endedAt?: number | null
}

export interface CustomerVisit {
  id: string
  date: string
  stationId: string
  minutes: number
  amount: number
  status: 'completed' | 'active' | 'cancelled'
}

export interface Customer {
  id: string
  name: string
  mobile: string
  email?: string
  joinedAt: string
  favoriteStationId?: string | null
  notes?: string
  visits: CustomerVisit[]
}

export interface PricingPackage {
  id: string
  name: string
  tagline: string
  durationMinutes: number
  price: number
  players: number
  perPlayerLabel?: string
  features: string[]
  popular?: boolean
  custom?: boolean
  active: boolean
}

export interface OpeningHour {
  day: string
  open: string
  close: string
  closed: boolean
}

export interface ZoneProfile {
  name: string
  tagline: string
  phone: string
  email: string
  address: string
  mapQuery: string
  hours: OpeningHour[]
}

export interface PricingSettings {
  currency: string
  hourlyRate: number
  vipHourlyRate: number
  peakStart: string
  peakEnd: string
  peakMultiplier: number
  peakEnabled: boolean
  defaultSessionMinutes: number
  allowedDurations: number[]
}

export interface ZoneSettings {
  warningMinutes: number
  snoozeMinutes: number
  soundEnabled: boolean
  autoExtendOnPause: boolean
}