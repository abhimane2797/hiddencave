export type AvailabilityLabel = 'Available' | 'Coming Soon' | 'Availability to Confirm'

export interface GameConfig {
  id: string
  title: string
  genre: string
  category: string
  description: string
  image: string
  availability: AvailabilityLabel
  players: string
  featured?: boolean
}

export const GAME_CATEGORIES = ['All', 'Sports', 'Action', 'Adventure', 'Racing', 'Fighting', 'Multiplayer']

export const GAMES: GameConfig[] = [
  {
    id: 'ea-fc-26',
    title: 'EA SPORTS FC 26',
    genre: 'Sports',
    category: 'Sports',
    description: 'The latest football simulation with HyperMotionV technology, PlayStyles, and authentic leagues. Take on friends in kick-off matches or manage your ultimate squad.',
    image: 'https://fifauteam.com/images/covers/fc26/hd/standard.webp',
    availability: 'Available',
    players: '1-4 players',
    featured: true,
  },
  {
    id: 'gta-v',
    title: 'Grand Theft Auto V',
    genre: 'Action',
    category: 'Action',
    description: 'Return to Los Santos in the acclaimed open-world action game. Heists, missions and a living city — now on PS5 with enhanced visuals and faster loading.',
    image: 'https://en.wikipedia.org/wiki/File:Grand_Theft_Auto_V.png',
    availability: 'Available',
    players: '1 player',
  },
  {
    id: 'gta-vi',
    title: 'Grand Theft Auto VI',
    genre: 'Action',
    category: 'Action',
    description: 'The next chapter in the Grand Theft Auto series, coming to Vice City. Check with the desk for confirmed availability.',
    image: 'https://images.igdb.com/igdb/image/upload/t_cover_big/co8f1i.png',
    availability: 'Coming Soon',
    players: '1 player',
  },
  {
    id: 'spider-man-2',
    title: "Marvel's Spider-Man 2",
    genre: 'Action',
    category: 'Action',
    description: 'Swing through New York City as Peter Parker and Miles Morales. Battle iconic villains with expanded web-wing traversal and dual-protagonist storytelling.',
    image: 'https://static.wikia.nocookie.net/sony-playstation/images/b/b9/Spider-Man_2_cover_art.png',
    availability: 'Available',
    players: '1 player',
    featured: true,
  },
  {
    id: 'call-of-duty',
    title: 'Call of Duty: Modern Warfare III',
    genre: 'Action',
    category: 'Multiplayer',
    description: 'Fast-paced first-person shooter action. Squad up with friends in multiplayer matches, battle royale, and co-op missions on PS5.',
    image: 'https://images.igdb.com/igdb/image/upload/t_cover_big/co7ntw.png',
    availability: 'Available',
    players: '1-4 players',
  },
  {
    id: 'god-of-war-ragnarok',
    title: 'God of War Ragnarök',
    genre: 'Adventure',
    category: 'Adventure',
    description: 'Join Kratos and Atreus on a Norse mythological journey. Cinematic combat, breathtaking realms, and an emotional story on PS5.',
    image: 'https://images.igdb.com/igdb/image/upload/t_cover_big/co5v3r.png',
    availability: 'Available',
    players: '1 player',
  },
  {
    id: 'ghost-of-tsushima',
    title: 'Ghost of Tsushima Director\'s Cut',
    genre: 'Adventure',
    category: 'Adventure',
    description: 'Explore feudal Japan as Jin Sakai. Open-world samurai action with the Iki Island expansion, optimized for PS5.',
    image: 'https://images.igdb.com/igdb/image/upload/t_cover_big/co4q5a.png',
    availability: 'Available',
    players: '1 player',
  },
  {
    id: 'mortal-kombat-1',
    title: 'Mortal Kombat 1',
    genre: 'Fighting',
    category: 'Fighting',
    description: 'A new fighting game universe from NetherRealm Studios. Brutal kombat, Kameo fighters, and cinematic story mode.',
    image: 'https://en.wikipedia.org/wiki/File:Mortal_Kombat_1_key_art.jpeg',
    availability: 'Available',
    players: '1-2 players',
  },
  {
    id: 'tekken-8',
    title: 'Tekken 8',
    genre: 'Fighting',
    category: 'Fighting',
    description: 'The next generation of the legendary fighting series. Aggressive new mechanics, destructible stages, and spectacular visuals on PS5.',
    image: 'https://en.wikipedia.org/wiki/File:Tekken_8_cover_art.jpg',
    availability: 'Available',
    players: '1-2 players',
  },
  {
    id: 'gran-turismo-7',
    title: 'Gran Turismo 7',
    genre: 'Racing',
    category: 'Racing',
    description: 'The definitive driving simulator. Hundreds of cars, real-world tracks, and photorealistic visuals with racing wheel support.',
    image: 'https://images.igdb.com/igdb/image/upload/t_cover_big/co4c0d.png',
    availability: 'Available',
    players: '1-2 players',
  },
  {
    id: 'astro-bot',
    title: 'Astro Bot',
    genre: 'Adventure',
    category: 'Adventure',
    description: 'A charming platforming adventure built for PS5 and the DualSense controller. Rescue Astro\'s crew across vibrant galaxies.',
    image: 'https://images.igdb.com/igdb/image/upload/t_cover_big/co850b.png',
    availability: 'Available',
    players: '1 player',
  },
]

export function getGameById(id: string): GameConfig | undefined {
  return GAMES.find((g) => g.id === id)
}

export function filterGames(games: GameConfig[], category: string, query: string): GameConfig[] {
  const q = query.trim().toLowerCase()
  return games.filter((g) => {
    const matchCategory = category === 'All' || g.category === category
    const matchQuery =
      q === '' ||
      g.title.toLowerCase().includes(q) ||
      g.genre.toLowerCase().includes(q) ||
      g.description.toLowerCase().includes(q)
    return matchCategory && matchQuery
  })
}

export const availabilityStyles: Record<AvailabilityLabel, { tone: string; glow: string }> = {
  Available: { tone: 'emerald', glow: 'shadow-[0_0_18px_-6px_rgba(52,211,153,0.6)]' },
  'Coming Soon': { tone: 'amber', glow: 'shadow-[0_0_18px_-6px_rgba(251,191,36,0.6)]' },
  'Availability to Confirm': { tone: 'slate', glow: 'shadow-[0_0_18px_-6px_rgba(148,163,184,0.5)]' },
}

export type GameEntry = GameConfig
