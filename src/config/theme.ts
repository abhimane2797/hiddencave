import type {
  BookingStatus,
  PaymentStatus,
  SessionStatus,
  StationStatus,
  ToastVariant,
} from '@/types'

export const ACCENTS = {
  blue: { rgb: '59 125 255', label: 'Electric Blue' },
  violet: { rgb: '139 92 246', label: 'Neon Purple' },
  cyan: { rgb: '34 211 238', label: 'Cyan Pulse' },
  magenta: { rgb: '232 121 249', label: 'Hyper Magenta' },
} as const

export const GAMING_TEXT_GRADIENT = 'bg-gradient-to-br from-white via-brand-300 to-violet-400 bg-clip-text text-transparent'

export type AccentKey = keyof typeof ACCENTS

export interface StatusStyle {
  label: string
  dot: string
  chip: string
  text: string
  glow: string
}

export const STATION_STATUS_STYLE: Record<StationStatus, StatusStyle> = {
  available: {
    label: 'Available',
    dot: 'bg-emerald-400',
    chip: 'border-emerald-400/30 bg-emerald-400/10 text-emerald-300',
    text: 'text-emerald-300',
    glow: 'shadow-[0_0_18px_-6px_rgba(52,211,153,0.8)]',
  },
  occupied: {
    label: 'Occupied',
    dot: 'bg-rose-400',
    chip: 'border-rose-400/30 bg-rose-400/10 text-rose-300',
    text: 'text-rose-300',
    glow: 'shadow-[0_0_18px_-6px_rgba(251,113,133,0.8)]',
  },
  reserved: {
    label: 'Reserved',
    dot: 'bg-amber-400',
    chip: 'border-amber-400/30 bg-amber-400/10 text-amber-300',
    text: 'text-amber-300',
    glow: 'shadow-[0_0_18px_-6px_rgba(251,191,36,0.8)]',
  },
  maintenance: {
    label: 'Maintenance',
    dot: 'bg-slate-400',
    chip: 'border-slate-400/30 bg-slate-400/10 text-slate-300',
    text: 'text-slate-300',
    glow: 'shadow-[0_0_18px_-6px_rgba(148,163,184,0.6)]',
  },
}

export const SESSION_STATE_STYLE: Record<SessionStatus, StatusStyle> = {
  active: {
    label: 'Active',
    dot: 'bg-brand-400',
    chip: 'border-brand-400/30 bg-brand-400/10 text-brand-300',
    text: 'text-brand-300',
    glow: 'shadow-[0_0_18px_-6px_rgba(91,147,255,0.8)]',
  },
  'almost-over': {
    label: 'Almost Over',
    dot: 'bg-amber-400',
    chip: 'border-amber-400/30 bg-amber-400/10 text-amber-300',
    text: 'text-amber-300',
    glow: 'shadow-[0_0_18px_-6px_rgba(251,191,36,0.9)]',
  },
  'time-over': {
    label: 'Time Over',
    dot: 'bg-rose-500',
    chip: 'border-rose-500/40 bg-rose-500/15 text-rose-300',
    text: 'text-rose-300',
    glow: 'shadow-[0_0_22px_-6px_rgba(244,63,94,0.9)]',
  },
  completed: {
    label: 'Completed',
    dot: 'bg-slate-400',
    chip: 'border-slate-400/30 bg-slate-400/10 text-slate-300',
    text: 'text-slate-300',
    glow: '',
  },
}

export const BOOKING_STATUS_STYLE: Record<BookingStatus, StatusStyle> = {
  confirmed: {
    label: 'Confirmed',
    dot: 'bg-brand-400',
    chip: 'border-brand-400/30 bg-brand-400/10 text-brand-300',
    text: 'text-brand-300',
    glow: '',
  },
  pending: {
    label: 'Pending',
    dot: 'bg-amber-400',
    chip: 'border-amber-400/30 bg-amber-400/10 text-amber-300',
    text: 'text-amber-300',
    glow: '',
  },
  'checked-in': {
    label: 'Checked In',
    dot: 'bg-violet-400',
    chip: 'border-violet-400/30 bg-violet-400/10 text-violet-300',
    text: 'text-violet-300',
    glow: '',
  },
  completed: {
    label: 'Completed',
    dot: 'bg-emerald-400',
    chip: 'border-emerald-400/30 bg-emerald-400/10 text-emerald-300',
    text: 'text-emerald-300',
    glow: '',
  },
  cancelled: {
    label: 'Cancelled',
    dot: 'bg-slate-400',
    chip: 'border-slate-400/30 bg-slate-400/10 text-slate-300',
    text: 'text-slate-300',
    glow: '',
  },
  'no-show': {
    label: 'No Show',
    dot: 'bg-rose-400',
    chip: 'border-rose-400/30 bg-rose-400/10 text-rose-300',
    text: 'text-rose-300',
    glow: '',
  },
}

export const PAYMENT_STATUS_STYLE: Record<PaymentStatus, StatusStyle> = {
  paid: {
    label: 'Paid',
    dot: 'bg-emerald-400',
    chip: 'border-emerald-400/30 bg-emerald-400/10 text-emerald-300',
    text: 'text-emerald-300',
    glow: '',
  },
  pending: {
    label: 'Pending',
    dot: 'bg-amber-400',
    chip: 'border-amber-400/30 bg-amber-400/10 text-amber-300',
    text: 'text-amber-300',
    glow: '',
  },
  partial: {
    label: 'Partial',
    dot: 'bg-cyan-400',
    chip: 'border-cyan-400/30 bg-cyan-400/10 text-cyan-300',
    text: 'text-cyan-300',
    glow: '',
  },
  refunded: {
    label: 'Refunded',
    dot: 'bg-slate-400',
    chip: 'border-slate-400/30 bg-slate-400/10 text-slate-300',
    text: 'text-slate-300',
    glow: '',
  },
}

export const TOAST_STYLE: Record<ToastVariant, { ring: string; icon: string }> = {
  success: { ring: 'border-emerald-400/30', icon: 'text-emerald-300' },
  error: { ring: 'border-rose-400/30', icon: 'text-rose-300' },
  info: { ring: 'border-brand-400/30', icon: 'text-brand-300' },
  warning: { ring: 'border-amber-400/30', icon: 'text-amber-300' },
}

export const PAYMENT_METHOD_LABEL: Record<string, string> = {
  cash: 'Cash',
  upi: 'UPI',
  card: 'Card',
  membership: 'Membership',
}