export interface GameSpot {
  id: string
  title: string
  genre: string
  tag: string
  players: string
  gradient: string
  featured?: boolean
}

/** Placeholder showcase titles — original names, no third-party branding. */
export const games: GameSpot[] = [
  {
    id: 'g1',
    title: 'Neon Drift Racers',
    genre: 'Racing',
    tag: '4K 120Hz showcase',
    players: '1-4 players',
    gradient: 'from-brand-500/70 via-brand-700/50 to-ink-900',
    featured: true,
  },
  {
    id: 'g2',
    title: 'Shadow of Valhalla',
    genre: 'Action',
    tag: 'Story epic',
    players: '1 player',
    gradient: 'from-violet-500/70 via-violet-800/50 to-ink-900',
    featured: true,
  },
  {
    id: 'g3',
    title: 'Kart Rush Legends',
    genre: 'Racing',
    tag: 'Party favourite',
    players: '1-4 players',
    gradient: 'from-amber-400/60 via-orange-700/40 to-ink-900',
  },
  {
    id: 'g4',
    title: 'Final Whistle FC',
    genre: 'Sports',
    tag: 'League nights',
    players: '1-4 players',
    gradient: 'from-emerald-400/60 via-emerald-800/40 to-ink-900',
  },
  {
    id: 'g5',
    title: 'Fists of Aurora',
    genre: 'Fighting',
    tag: 'Tournament ready',
    players: '1-2 players',
    gradient: 'from-rose-500/60 via-rose-800/40 to-ink-900',
  },
  {
    id: 'g6',
    title: 'Horizon Beyond',
    genre: 'Adventure',
    tag: 'Visual masterpiece',
    players: '1 player',
    gradient: 'from-cyan-400/60 via-cyan-800/40 to-ink-900',
    featured: true,
  },
  {
    id: 'g7',
    title: 'Rogue Protocol 7',
    genre: 'Action',
    tag: 'Co-op shooter',
    players: '1-4 players',
    gradient: 'from-slate-400/60 via-slate-800/40 to-ink-900',
  },
  {
    id: 'g8',
    title: 'Apex Speed Circuit',
    genre: 'Racing',
    tag: 'Wheel supported',
    players: '1-2 players',
    gradient: 'from-fuchsia-500/60 via-purple-800/40 to-ink-900',
  },
  {
    id: 'g9',
    title: 'Dunk City 2K',
    genre: 'Sports',
    tag: 'Crowd pleaser',
    players: '1-4 players',
    gradient: 'from-indigo-500/60 via-indigo-800/40 to-ink-900',
  },
  {
    id: 'g10',
    title: 'Mecha Clash Arena',
    genre: 'Fighting',
    tag: 'Ranked mode',
    players: '1-2 players',
    gradient: 'from-teal-400/60 via-teal-800/40 to-ink-900',
  },
  {
    id: 'g11',
    title: 'Co-op Caverns',
    genre: 'Co-op',
    tag: 'Squad puzzle',
    players: '2-4 players',
    gradient: 'from-lime-400/50 via-emerald-800/40 to-ink-900',
  },
  {
    id: 'g12',
    title: 'Starlight Odyssey',
    genre: 'Adventure',
    tag: 'Cinematic',
    players: '1 player',
    gradient: 'from-sky-400/60 via-blue-800/40 to-ink-900',
  },
]

export const GAME_GENRES = ['All', 'Action', 'Racing', 'Sports', 'Fighting', 'Co-op', 'Adventure']

export interface LoungeShot {
  id: string
  title: string
  caption: string
  gradient: string
  span?: string
}

export const loungeShots: LoungeShot[] = [
  {
    id: 'l1',
    title: 'Main floor, big screens',
    caption: 'Six 55" 4K stations with reclining seating and ambient lighting.',
    gradient: 'from-brand-600/50 via-ink-800 to-ink-950',
    span: 'sm:col-span-2 sm:row-span-2',
  },
  {
    id: 'l2',
    title: 'VIP room',
    caption: 'Private room for squads and tournaments with a lounge sofa.',
    gradient: 'from-violet-600/50 via-ink-800 to-ink-950',
  },
  {
    id: 'l3',
    title: 'Controller bar',
    caption: 'DualSense controllers, headsets and racing wheels on request.',
    gradient: 'from-cyan-500/40 via-ink-800 to-ink-950',
  },
  {
    id: 'l4',
    title: 'Snack counter',
    caption: 'Cold drinks, coffee and combo snacks delivered to your station.',
    gradient: 'from-amber-500/40 via-ink-800 to-ink-950',
  },
  {
    id: 'l5',
    title: 'Tournament wall',
    caption: 'Brackets, leaderboards and Friday night cups with prizes.',
    gradient: 'from-rose-500/40 via-ink-800 to-ink-950',
    span: 'sm:col-span-2',
  },
]

export interface Amenity {
  id: string
  title: string
  description: string
  icon: 'ac' | 'wifi' | 'snack' | 'tournament' | 'wheel' | 'locker' | 'parking' | 'coach'
}

export const amenities: Amenity[] = [
  { id: 'a1', title: 'Fully air-conditioned', description: 'Cool, ventilated seating areas for long sessions.', icon: 'ac' },
  { id: 'a2', title: 'High-speed Wi-Fi', description: '300 Mbps fibre for updates and online lobbies.', icon: 'wifi' },
  { id: 'a3', title: 'Snack & drinks bar', description: 'Combos, coffee and chilled drinks at your station.', icon: 'snack' },
  { id: 'a4', title: 'Weekly tournaments', description: 'FIFA, racing and fighting cups with prize pools.', icon: 'tournament' },
  { id: 'a5', title: 'Racing wheel & headset', description: 'Logitech wheels and headsets on request.', icon: 'wheel' },
  { id: 'a6', title: 'Locker storage', description: 'Free lockers for bags and helmets.', icon: 'locker' },
  { id: 'a7', title: 'Free parking', description: 'Two-wheeler and car parking at the arcade.', icon: 'parking' },
  { id: 'a8', title: 'Coach-led sessions', description: 'Optional coaching for beginners on request.', icon: 'coach' },
]

export const HOME_FAQ = [
  {
    q: 'Do I need to book in advance?',
    a: 'Walk-ins are welcome, but peak evening slots (6 PM – 10 PM) usually fill up. Booking online takes under a minute and you pay at the venue.',
  },
  {
    q: 'How many controllers come with a station?',
    a: 'Every station starts with one controller. Extra controllers are ₹99 each, and the Multiplayer package includes four.',
  },
  {
    q: 'Can we bring our own games?',
    a: 'Yes — disc and digital libraries are pre-loaded, and you can bring discs for offline titles. Our staff can help with setup.',
  },
  {
    q: 'Is there a time limit per session?',
    a: 'Sessions start at 30 minutes and go up to 4 hours. You can extend on the spot if the next slot is free.',
  },
]
