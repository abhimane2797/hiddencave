import { useState } from 'react'
import { NavLink } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  Gamepad2,
  X,
  ChevronLeft,
  ChevronRight,
  Clock,
  Users,
  IndianRupee,
  Sun,
  FileText,
} from 'lucide-react'
import { useEntries } from '@/store/entries'
import { cx, dateKey } from '@/lib/utils'

const NAV_ITEMS = [
  { to: '/', label: 'Home', icon: Gamepad2 },
  { to: '/entries', label: 'Entries', icon: Users },
  { to: '/day-close', label: 'Day Close', icon: Sun },
  { to: '/reports', label: 'Reports', icon: FileText },
] as const

export function Sidebar({
  mobileOpen,
  onClose,
}: {
  mobileOpen: boolean
  onClose: () => void
}) {
  const [collapsed, setCollapsed] = useState(false)
  const { entries } = useEntries()
  const today = dateKey(new Date())
  const todayCount = entries.filter((e) => dateKey(new Date(e.createdAt)) === today).length

  const showLabels = !collapsed || mobileOpen

  return (
    <aside
      className={cx(
        'shrink-0 border-r border-white/[0.06] bg-ink-900/70 backdrop-blur-xl transition-all duration-300 flex-col h-full',
        // Desktop: always present, collapsible width
        !mobileOpen ? 'lg:flex lg:h-full' : 'w-full',
        // Mobile: hidden when closed, shown inside overlay when open
        mobileOpen ? '' : 'hidden lg:flex',
        // Width
        mobileOpen ? 'w-full' : collapsed ? 'lg:w-[76px]' : 'lg:w-[248px]',
      )}
    >
      <div className="flex h-full flex-col">
        <div className="flex items-center gap-3 px-4 py-5 border-b border-white/[0.06]">
          <span className="flex h-9 w-9 items-center justify-center rounded-2xl border border-white/10 bg-gradient-to-br from-brand-500/30 to-violet-500/30 text-white shadow-glow-sm">
            <Gamepad2 size={20} />
          </span>

          {!mobileOpen && showLabels ? (
            <div className="min-w-0">
              <p className="truncate font-display text-sm font-bold tracking-wide text-white">
                Hidden Cave
              </p>
              <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-brand-300">
                Gaming Zone
              </p>
            </div>
          ) : null}

          {mobileOpen ? (
            <button
              onClick={onClose}
              aria-label="Close navigation"
              className="ml-auto text-slate-400 transition hover:text-white lg:hidden"
            >
              <X size={18} />
            </button>
          ) : (
            <button
              onClick={() => setCollapsed((c) => !c)}
              aria-label={collapsed ? 'Expand navigation' : 'Collapse navigation'}
              className="ml-auto p-1.5 rounded-lg text-slate-400 transition hover:bg-white/[0.05] hover:text-white lg:block hidden"
            >
              {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
            </button>
          )}
        </div>

        <nav className="flex-1 space-y-2 overflow-y-auto px-3 pb-4">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon
            return (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to === '/'}
                onClick={mobileOpen ? onClose : undefined}
                className={({ isActive }) =>
                  cx(
                    'group relative flex items-center gap-3 rounded-xl px-2.5 py-2.5 text-sm font-medium transition-all duration-200',
                    !showLabels ? 'justify-center' : '',
                    isActive
                      ? 'bg-accent/15 text-white shadow-glow-sm'
                      : 'text-slate-400 hover:bg-white/[0.05] hover:text-white',
                  )
                }
              >
                {({ isActive }) => (
                  <>
                    {isActive && showLabels ? (
                      <motion.span
                        layoutId="sidebar-active"
                        className="absolute left-0 top-1/2 h-6 w-[3px] -translate-y-1/2 rounded-r-full bg-accent"
                      />
                    ) : null}
                    <Icon size={17} className={cx('shrink-0', isActive ? 'text-brand-300' : 'text-slate-500 group-hover:text-slate-300')} />
                    {showLabels ? (
                      <span className="flex-1 truncate">{item.label}</span>
                    ) : null}
                    {item.label === 'Entries' && showLabels ? (
                      <Badge tone="blue" className="ml-auto px-1.5 py-0 text-[10px]">
                        {todayCount}
                      </Badge>
                    ) : null}
                  </>
                )}
              </NavLink>
            )
          })}
        </nav>

        <div className="border-t border-white/[0.06] p-3">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-600 px-3 mb-2">
            Rajarampuri, Kolhapur
          </p>
          <div className="flex items-center gap-2 px-3">
            <Clock size={13} className="text-slate-500" />
            <span className="text-xs text-slate-300">
              {new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
            </span>
          </div>
        </div>
      </div>
    </aside>
  )
}

function Badge({ tone, children, className }: { tone: 'blue' | 'violet' | 'cyan' | 'emerald' | 'amber' | 'rose' | 'slate'; children: React.ReactNode; className?: string }) {
  const toneClasses: Record<string, string> = {
    blue: 'border-brand-400/30 bg-brand-400/10 text-brand-300',
    violet: 'border-violet-400/30 bg-violet-400/10 text-violet-300',
    cyan: 'border-cyan-400/30 bg-cyan-400/10 text-cyan-300',
    emerald: 'border-emerald-400/30 bg-emerald-400/10 text-emerald-300',
    amber: 'border-amber-400/30 bg-amber-400/10 text-amber-300',
    rose: 'border-rose-400/30 bg-rose-400/10 text-rose-300',
    slate: 'border-slate-400/30 bg-slate-400/10 text-slate-300',
  }
  return (
    <span
      className={cx(
        'inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[11px] font-semibold tracking-wide',
        toneClasses[tone],
        className,
      )}
    >
      {children}
    </span>
  )
}
