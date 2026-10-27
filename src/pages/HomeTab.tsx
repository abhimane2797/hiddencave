import { useNavigate } from 'react-router-dom'
import {
  Users as UsersIcon,
  Timer,
  CheckCircle2,
  IndianRupee,
  MonitorPlay,
  AlertCircle,
  ArrowRight,
  RotateCcw,
  AlertTriangle,
} from 'lucide-react'
import { useEntries } from '@/store/entries'
import { useTimer } from '@/store/timer'
import { StatCard } from '@/components/dashboard/StatCard'
import { PaymentBadge } from '@/components/dashboard/PaymentBadge'
import { SessionTimer } from '@/components/dashboard/SessionTimer'
import { GameGallery } from '@/components/home/GameGallery'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { cx, formatClock, humanDuration } from '@/lib/utils'

export default function HomeTab() {
  const { entries, stats, endSession, extendSession, renewSession } = useEntries()
  const { now } = useTimer()
  const navigate = useNavigate()
  const s = stats()

  const dateStr = new Date(now).toLocaleDateString('en-IN', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
  const timeStr = new Date(now).toLocaleTimeString('en-IN', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  })

  const activeToday = entries.filter(
    (e) =>
      new Date(e.createdAt).toDateString() === new Date().toDateString() &&
      e.sessionStatus !== 'completed',
  )

  const recent = [...entries]
    .filter((e) => new Date(e.createdAt).toDateString() === new Date().toDateString())
    .sort((a, b) => b.createdAt - a.createdAt)
    .slice(0, 5)

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h1 className="font-display text-xl font-bold text-white sm:text-2xl">Dashboard</h1>
        <p className="text-sm text-slate-400">Welcome to Hidden Cave Gaming Zone</p>
        <p className="text-xs text-slate-500">{dateStr} · {timeStr}</p>
      </div>

      <div className="grid gap-4 sm:gap-5 sm:grid-cols-2 lg:grid-cols-3">
        <StatCard
          label="Today's Customers"
          value={s.todayCustomers}
          icon={<UsersIcon size={17} />}
          tone="blue"
          hint={`${s.availableNow} slots available`}
        />
        <StatCard
          label="Active Sessions"
          value={s.activeSessions}
          icon={<Timer size={17} />}
          tone="emerald"
          hint="Currently playing"
        />
        <StatCard
          label="Completed Sessions"
          value={s.completedSessions}
          icon={<CheckCircle2 size={17} />}
          tone="violet"
          hint="Sessions ended today"
        />
        <StatCard
          label="Time Over Sessions"
          value={s.timeOverSessions}
          icon={<AlertTriangle size={17} />}
          tone="rose"
          hint="Sessions expired"
        />
        <StatCard
          label="Money Collected"
          value={`₹${s.moneyCollected}`}
          icon={<IndianRupee size={17} />}
          tone="cyan"
          hint="Paid entries only"
        />
        <StatCard
          label="Pending Payments"
          value={`₹${s.pendingPayments}`}
          icon={<AlertCircle size={17} />}
          tone="rose"
          hint="Unpaid entries"
        />
        <StatCard
          label="Per Person Price"
          value={`₹${s.perPersonPrice}`}
          icon={<MonitorPlay size={17} />}
          tone="amber"
          hint="Auto-updated by date"
        />
      </div>

      <div className="grid gap-5 lg:grid-cols-[1.5fr_1fr]">
        <div className="space-y-5">
          <GameGallery />

          <Card>
            <div className="flex items-center justify-between gap-3 px-4 py-3 border-b border-white/[0.06]">
              <h2 className="font-display text-sm font-bold text-white">Currently Playing</h2>
              <p className="text-[11px] text-slate-500">{activeToday.length} active</p>
            </div>
            <div className="divide-y divide-white/[0.04]">
              {activeToday.length === 0 ? (
                <div className="px-4 py-8 text-center">
                  <Timer size={32} className="mx-auto opacity-30" />
                  <p className="mt-3 text-sm text-slate-500">No active sessions right now.</p>
                </div>
              ) : (
                activeToday.map((entry) => {
                  const remaining = entry.endTime - now
                  const isWarning = remaining > 0 && remaining <= 5 * 60_000
                  const isOver = remaining <= 0
                  return (
                    <div
                      key={entry.id}
                      className={cx(
                        'px-4 py-3.5 flex items-center justify-between group hover:bg-white/[0.02] transition',
                        isOver ? 'border-l-2 border-l-rose-400 bg-rose-500/5' : 'border-l-2 border-l-brand-400/20',
                      )}
                    >
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-semibold text-white truncate">{entry.customerName}</p>
                        <p className="text-[10px] text-slate-500 mt-0.5">
                          {formatClock(entry.startTime)} → {formatClock(entry.endTime)}
                        </p>
                      </div>
                      <div className="flex items-center gap-3">
                        <SessionTimer endTime={entry.endTime} showLabel={false} />
                        <PaymentBadge status={entry.paymentStatus} />
                        {isOver ? (
                          <>
                            <Button
                              size="xs"
                              variant="primary"
                              onClick={() => renewSession(entry.id)}
                              className="bg-amber-500 hover:bg-amber-400 text-ink-950"
                            >
                              <RotateCcw size={12} className="mr-1" /> Renew ₹70
                            </Button>
                            <Button size="xs" variant="danger" onClick={() => endSession(entry.id)}>
                              End
                            </Button>
                          </>
                        ) : (
                          <Button size="xs" variant="outline" onClick={() => extendSession(entry.id, 30)}>
                            +30
                          </Button>
                        )}
                      </div>
                    </div>
                  )
                })
              )}
            </div>
          </Card>
        </div>

        <div className="space-y-5">
          <Card>
            <div className="px-4 py-3 border-b border-white/[0.06]">
              <h2 className="font-display text-sm font-bold text-white">Recent Entries</h2>
            </div>
            <div className="divide-y divide-white/[0.04]">
              {recent.length === 0 ? (
                <div className="px-4 py-8 text-center">
                  <p className="text-sm text-slate-500">No entries today yet.</p>
                </div>
              ) : (
                recent.map((entry) => {
                  const remaining = entry.endTime - now
                  const status =
                    entry.sessionStatus === 'completed'
                      ? 'Completed'
                      : remaining <= 0
                      ? 'Time Over'
                      : remaining <= 5 * 60_000
                      ? 'Almost Over'
                      : 'Active'
                  return (
                    <div key={entry.id} className="px-4 py-3 flex items-center justify-between">
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium text-white truncate">{entry.customerName}</p>
                        <p className="text-[10px] text-slate-500">
                          {formatClock(entry.startTime)} · {humanDuration(entry.durationMinutes)}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-semibold text-white">₹{entry.amount}</p>
                        <div className="flex flex-col items-end gap-1">
                          <PaymentBadge status={entry.paymentStatus} />
                          <span
                            className={cx(
                              'text-[10px] font-semibold',
                              entry.sessionStatus === 'completed'
                                ? 'text-slate-400'
                                : status === 'Time Over'
                                ? 'text-rose-300'
                                : status === 'Almost Over'
                                ? 'text-amber-300'
                                : 'text-emerald-300',
                            )}
                          >
                            {status}
                          </span>
                        </div>
                      </div>
                    </div>
                  )
                })
              )}
            </div>
            <div className="px-4 py-3">
              <Button size="sm" variant="outline" className="w-full" onClick={() => navigate('/entries')}>
                View All Entries <ArrowRight size={14} />
              </Button>
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}
