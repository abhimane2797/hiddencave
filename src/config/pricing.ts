import type { OpeningHour, PricingPackage, ZoneProfile } from '@/types'

export const CURRENCY = '₹'

// Per-person pricing that auto-selects based on the current date.
// October 25–31, 2026: ₹120 per person.
// From November 1, 2026: ₹150 per person.
export const PERSON_PRICE_RULES: Array<{
  from: string // inclusive YYYY-MM-DD
  to: string | null // inclusive YYYY-MM-DD, null = open-ended
  price: number
  label: string
}> = [
  { from: '2026-10-25', to: '2026-10-31', price: 120, label: 'Launch week offer' },
  { from: '2026-11-01', to: null, price: 150, label: 'Standard rate' },
]

export function currentPersonPrice(now = new Date()): { price: number; label: string; from: string; to: string | null } {
  const today = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`
  for (const rule of PERSON_PRICE_RULES) {
    const inRange = today >= rule.from && (rule.to === null || today <= rule.to)
    if (inRange) return { price: rule.price, label: rule.label, from: rule.from, to: rule.to }
  }
  return PERSON_PRICE_RULES[PERSON_PRICE_RULES.length - 1]
}

export const DEFAULT_HOURLY_RATE = 249
export const DEFAULT_VIP_HOURLY_RATE = 349
export const EXTRA_PLAYER_RATE = 99

// Base hourly price for session pricing.
// The standard 1-hour session price is derived from the current per-person price
// when available, falling back to DEFAULT_HOURLY_RATE.
export function baseHourlyPrice(now = new Date()): number {
  const p = currentPersonPrice(now)
  return p.price
}

// Calculate session price proportionally to the selected duration.
// Session Price = (Duration in Minutes / 60) × Base Hourly Price
export function sessionPrice(durationMinutes: number, hourlyRate = baseHourlyPrice()): number {
  if (durationMinutes <= 0) return 0
  return Math.round((durationMinutes / 60) * hourlyRate)
}

// Fixed renewal charge per 30-minute renewal (separate from duration-based pricing)
export const RENEWAL_CHARGE = 70
export const RENEWAL_MINUTES = 30

export const PEAK_HOURS = {
  start: '18:00',
  end: '23:00',
  multiplier: 1.25,
  enabled: true,
}

export const DEFAULT_SESSION_MINUTES = 60
export const ALLOWED_DURATIONS = [30, 60, 90, 120, 180, 240]

export const TIMER_DEFAULTS = {
  warningMinutes: 5,
  snoozeMinutes: 5,
}

export const OPENING_HOURS: OpeningHour[] = [
  { day: 'Monday', open: '10:00', close: '23:00', closed: false },
  { day: 'Tuesday', open: '10:00', close: '23:00', closed: false },
  { day: 'Wednesday', open: '10:00', close: '23:00', closed: false },
  { day: 'Thursday', open: '10:00', close: '23:00', closed: false },
  { day: 'Friday', open: '10:00', close: '00:00', closed: false },
  { day: 'Saturday', open: '09:00', close: '00:00', closed: false },
  { day: 'Sunday', open: '09:00', close: '23:30', closed: false },
]

export const ZONE_PROFILE: ZoneProfile = {
  name: 'Hidden Cave Gaming Zone',
  tagline: 'Escape Reality. Enter the Game.',
  phone: '',
  email: '',
  address: 'Basement, 1770 E Shantanand Enclave, Rajarampuri 3rd Lane, Near Heaven Cafe, Kolhapur, Maharashtra 416008, India',
  mapQuery: 'Basement, 1770 E Shantanand Enclave, Rajarampuri 3rd Lane, Near Heaven Cafe, Kolhapur, Maharashtra 416008',
  hours: OPENING_HOURS,
}

export const INSTAGRAM_URL = 'https://www.instagram.com/reel/De4RbNDMkWQ/'

export const PRICING_PACKAGES: PricingPackage[] = [
  {
    id: 'one-hour',
    name: 'One Hour Session',
    tagline: 'Quick solo run',
    durationMinutes: 60,
    price: 249,
    players: 1,
    perPlayerLabel: '+₹99 per extra player',
    features: [
      'Any available station',
      'DualSense controller included',
      'Headset on request',
    ],
    active: true,
  },
  {
    id: 'two-hour',
    name: 'Two Hour Session',
    tagline: 'Most booked at the zone',
    durationMinutes: 120,
    price: 449,
    players: 1,
    perPlayerLabel: 'Save ₹49 vs hourly',
    features: [
      'Priority station choice',
      'Extra controller included',
      'Free locker access',
    ],
    popular: true,
    active: true,
  },
  {
    id: 'multiplayer',
    name: 'Multiplayer Package',
    tagline: 'Squad night',
    durationMinutes: 120,
    price: 799,
    players: 4,
    perPlayerLabel: 'Up to 4 players · 4 controllers',
    features: [
      '4 controllers + 4 headsets',
      'Squad-friendly seating',
      'Tournament mode setup',
    ],
    active: true,
  },
  {
    id: 'custom',
    name: 'Custom Session',
    tagline: 'Play your way',
    durationMinutes: 0,
    price: 199,
    players: 1,
    perPlayerLabel: 'From ₹199 · billed per 30 min',
    features: [
      'Choose any duration',
      'Group or solo',
      'Best for tournaments',
    ],
    custom: true,
    active: true,
  },
]

export const QUICK_DURATIONS = [30, 60, 90, 120]
export const EXTEND_OPTIONS = [15, 30, 60]
