import { useState } from 'react'
import { motion } from 'framer-motion'
import { Gamepad2, Gamepad as GamepadIcon, Users, Sparkles, ArrowRight } from 'lucide-react'
import { GAMES, type GameConfig } from '@/config/games'
import { cx } from '@/lib/utils'

function GameImage({
  game,
  className,
  alt,
}: {
  game: GameConfig
  className?: string
  alt?: string
}) {
  const [loaded, setLoaded] = useState(false)
  const [failed, setFailed] = useState(false)

  if (failed) {
    return (
      <div className={cx('flex items-center justify-center bg-ink-950/60', className)}>
        <GamepadIcon size={28} className="text-slate-600" />
      </div>
    )
  }

  return (
    <div className={cx('relative', className)}>
      {!loaded && (
        <div className="absolute inset-0 flex items-center justify-center bg-ink-950/60">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-brand-400 border-t-transparent" />
        </div>
      )}
      <img
        src={game.image}
        alt={alt || game.title}
        className={cx(
          'w-full h-full object-cover transition duration-500',
          loaded ? 'opacity-100' : 'opacity-0'
        )}
        loading="lazy"
        decoding="async"
        onLoad={() => setLoaded(true)}
        onError={() => setFailed(true)}
      />
    </div>
  )
}

export function GameGallery() {
  const [hovered, setHovered] = useState<string | null>(null)

  const displayGames = GAMES.filter((g) => g.availability === 'Available')

  return (
    <section className="py-6">
      <div className="flex items-center justify-between gap-3 mb-5">
        <h2 className="font-display text-lg font-bold text-white">Popular Games</h2>
        <p className="text-[11px] text-slate-500">Informational gallery · availability set by venue</p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {displayGames.map((game) => (
          <motion.div
            key={game.id}
            whileHover={{ y: -4 }}
            className={cx(
              'relative overflow-hidden rounded-2xl border border-white/[0.08] bg-ink-900/60 p-3 transition duration-300 group',
              hovered === game.id && 'ring-1 ring-brand-400/50 shadow-[0_0_40px_-20px_rgba(59,125,255,0.3)]',
            )}
            onMouseEnter={() => setHovered(game.id)}
            onMouseLeave={() => setHovered(null)}
          >
            <div className="relative h-40 overflow-hidden rounded-xl mb-3">
              <GameImage game={game} className="h-full w-full" />
              <div className="absolute inset-0 bg-gradient-to-t from-ink-950 via-ink-950/40 to-transparent opacity-80" />
              <div className="absolute left-2 top-2 flex items-center gap-1.5 px-2 py-0.5 rounded-full border border-brand-400/30 bg-brand-400/10 text-[10px] font-bold text-brand-300">
                <GamepadIcon size={10} /> PS5
              </div>
              <span
                className={cx(
                  'absolute right-2 top-2 px-2 py-0.5 rounded-full text-[10px] font-bold',
                  game.availability === 'Available'
                    ? 'border-emerald-400/30 bg-emerald-400/10 text-emerald-300'
                    : game.availability === 'Coming Soon'
                    ? 'border-amber-400/30 bg-amber-400/10 text-amber-300'
                    : 'border-slate-400/30 bg-slate-400/10 text-slate-300',
                )}
              >
                {game.availability}
              </span>
            </div>
            <h3 className="font-display text-sm font-bold text-white">{game.title}</h3>
            <p className="text-[10px] text-slate-500 uppercase tracking-wider">{game.genre}</p>
            <div className="mt-2 flex items-center justify-between">
              <span className="text-[10px] font-medium text-slate-400">{game.players}</span>
              <button className="text-brand-300 text-[10px] font-semibold hover:text-white transition">
                View <ArrowRight size={12} />
              </button>
            </div>
          </motion.div>
        ))}
      </div>

      <p className="mt-4 text-center text-[10px] text-slate-600">
        Game cards are informational. Confirm availability at the reception desk.
      </p>
    </section>
  )
}

export function GameCardSmall({ game, className }: { game: GameConfig; className?: string }) {
  return (
    <div className={cx('flex items-center gap-3', className)}>
      <div className="h-12 w-12 shrink-0 overflow-hidden rounded-lg">
        <GameImage game={game} className="h-full w-full" />
      </div>
      <div className="min-w-0">
        <p className="truncate text-sm font-semibold text-white">{game.title}</p>
        <p className="text-[10px] text-slate-500">{game.genre}</p>
      </div>
    </div>
  )
}

export function getGameImageSrc(gameId: string): string {
  const game = GAMES.find((g) => g.id === gameId)
  return game?.image ?? ''
}