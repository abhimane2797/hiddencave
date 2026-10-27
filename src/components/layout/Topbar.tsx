import { useEffect, useState } from 'react'
import {
  Menu as MenuIcon,
  Volume2,
  VolumeX,
  BellRing,
  AlertCircle,
  LogOut,
} from 'lucide-react'
import { useEntries } from '@/store/entries'
import { useAuth } from '@/store/auth'
import { Button } from '@/components/ui/Button'
import { cx } from '@/lib/utils'

export function TopBar({ onOpenMobileNav }: { onOpenMobileNav: () => void }) {
  const { muted, soundUnlocked, setMuted, setSoundUnlocked } = useEntries()
  const { logout, user } = useAuth()
  const [now, setNow] = useState(Date.now())

  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000)
    return () => clearInterval(id)
  }, [])

  const timeStr = new Date(now).toLocaleTimeString('en-IN', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  })
  const dateStr = new Date(now).toLocaleDateString('en-IN', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  })

  const toggleSound = () => {
    if (!soundUnlocked) {
      setSoundUnlocked()
      setMuted(false)
      return
    }
            setMuted(!muted)
  }

  return (
    <header className="z-40 border-b border-white/[0.06] bg-ink-900/80 backdrop-blur-xl flex-shrink-0">
      <div className="flex items-center gap-2.5 px-4 py-3 sm:px-6">
        <button
          onClick={onOpenMobileNav}
          aria-label="Open navigation"
          className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-white/10 bg-white/[0.04] text-slate-300 transition hover:text-white lg:hidden"
        >
          <MenuIcon size={17} />
        </button>

        <div className="min-w-0 flex-1">
          <h1 className="font-display text-sm font-bold tracking-wide text-white">
            Hidden Cave Gaming Zone
          </h1>
          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-brand-300">
            Rajarampuri, Kolhapur
          </p>
        </div>

        <div className="ml-auto flex items-center gap-2">
          <div className="hidden sm:block">
            <div>
              <p className="text-[11px] text-slate-400">{dateStr}</p>
              <p className="font-display text-sm font-bold text-white">{timeStr}</p>
            </div>
          </div>

          <div className="ml-2 flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.03] px-2 py-1">
            <button
              onClick={toggleSound}
              aria-label={muted ? 'Unmute alarm' : 'Mute alarm'}
              className="h-8 w-8 rounded flex items-center justify-center text-slate-300 transition hover:text-white hover:bg-white/[0.06]"
            >
              {muted || !soundUnlocked ? <VolumeX size={14} /> : <Volume2 size={14} />}
            </button>
            {!soundUnlocked && (
              <span className="flex h-8 w-8 items-center justify-center rounded-full border border-amber-400/30 bg-amber-400/10 text-amber-300 text-[10px]">
                <AlertCircle size={12} />
              </span>
            )}
          </div>

          <div className="ml-2 flex items-center gap-2">
            <span className="hidden sm:block text-[11px] font-semibold text-slate-300">{user?.role}</span>
            <Button
              variant="outline"
              size="sm"
              onClick={logout}
              className="px-3"
              icon={<LogOut size={14} />}
            >
              <span className="hidden sm:inline">Sign out</span>
              <span className="inline sm:hidden">Out</span>
            </Button>
          </div>
        </div>
      </div>
    </header>
  )
}
