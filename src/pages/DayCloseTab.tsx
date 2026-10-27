import { useState, useMemo, useEffect } from 'react'
import {
  Sun,
  Moon,
  CheckCircle,
  AlertCircle,
  Clock,
  IndianRupee,
  Users,
  Download,
  RotateCcw,
  FileText,
  AlertTriangle,
  Check,
  X,
  Trash2,
  Save,
  Database,
} from 'lucide-react'
import { useEntries } from '@/store/entries'
import { useTimer } from '@/store/timer'
import type { DayCloseRecord, DayCloseStatus, Entry, BackupRecord } from '@/types'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Field, Input, Select, Textarea } from '@/components/ui/Inputs'
import { ConfirmDialog } from '@/components/dashboard/ConfirmDialog'
import { cx, formatClock, humanDuration, INR } from '@/lib/utils'
import { motion, AnimatePresence } from 'framer-motion'

const getStatusConfig = (status: DayCloseStatus) => {
  switch (status) {
    case 'closed':
      return { label: 'Closed', color: 'text-emerald-300', bg: 'bg-emerald-500/10 border-emerald-500/20', icon: CheckCircle }
    case 'pending':
      return { label: 'Closing...', color: 'text-amber-300', bg: 'bg-amber-500/10 border-amber-500/20', icon: Clock }
    default:
      return { label: 'Open', color: 'text-brand-300', bg: 'bg-brand-500/10 border-brand-500/20', icon: Sun }
  }
}

const getSessionStatusConfig = (status: Entry['sessionStatus']) => {
  switch (status) {
    case 'active':
      return { label: 'Active', color: 'text-emerald-300' }
    case 'completed':
      return { label: 'Completed', color: 'text-slate-400' }
    case 'time-over':
      return { label: 'Time Over', color: 'text-rose-300' }
    case 'almost-over':
      return { label: 'Almost Over', color: 'text-amber-300' }
    default:
      return { label: status, color: 'text-slate-400' }
  }
}


function SessionDetailsRow({ entry }: { entry: Entry }) {
  const sessionStatusConfig = getSessionStatusConfig(entry.sessionStatus)
  const pending = Math.max(0, (entry.totalAmount ?? entry.amount) - (entry.paidAmount ?? (entry.paymentStatus === 'paid' ? entry.amount : 0)))
  return (
    <tr key={entry.id} className="hover:bg-white/[0.02]">
      <td className="px-3 py-2">
        <p className="font-medium text-white">{entry.customerName}</p>
        <p className="text-[10px] text-slate-500">{humanDuration(entry.durationMinutes)}</p>
      </td>
      <td className="px-3 py-2 text-slate-300">{formatClock(entry.startTime)}</td>
      <td className="px-3 py-2 text-slate-300">{formatClock(entry.endTime)}</td>
      <td className="px-3 py-2">
        <span className={cx('text-[10px] font-semibold uppercase', sessionStatusConfig.color)}>
          {sessionStatusConfig.label}
        </span>
      </td>
      <td className="px-3 py-2 text-right font-semibold text-white">{INR(entry.totalAmount ?? entry.amount)}</td>
      <td className="px-3 py-2 text-right text-cyan-300">{INR(entry.paidAmount ?? (entry.paymentStatus === 'paid' ? entry.amount : 0))}</td>
      <td className="px-3 py-2 text-right text-rose-300">{INR(pending)}</td>
    </tr>
  )
}

export default function DayCloseTab() {
  const {
    entries,
    stats,
    performDayClose,
    dayCloseStatus,
    currentDayClose,
    dayCloseHistory,
    backupHistory,
    latestBackup,
    backupInProgress,
    createBackup,
    downloadBackup,
    retryBackup,
    recordPayment,
  } = useEntries()
  const { now } = useTimer()

  const [toast, setToast] = useState<string | null>(null)
  const [showConfirm, setShowConfirm] = useState(false)
  const [showBackupConfirm, setShowBackupConfirm] = useState<DayCloseRecord | null>(null)
  const [showRetryConfirm, setShowRetryConfirm] = useState<DayCloseRecord | null>(null)
  const [showPaymentModal, setShowPaymentModal] = useState<Entry | null>(null)
  const [paymentAmount, setPaymentAmount] = useState('')
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'upi' | 'card'>('cash')
  const [paymentNote, setPaymentNote] = useState('')

  const today = new Date().toISOString().slice(0, 10)
  const s = stats()
  const todayEntries = useMemo(() => {
    const d = new Date()
    d.setHours(0, 0, 0, 0)
    const start = d.getTime()
    d.setHours(23, 59, 59, 999)
    const end = d.getTime()
    return entries.filter((e) => e.createdAt >= start && e.createdAt <= end)
  }, [entries])

  const activeSessions = todayEntries.filter((e) => {
    const remaining = e.endTime - now
    return e.sessionStatus !== 'completed' && remaining > 0
  })

  const timeOverSessions = todayEntries.filter((e) => e.sessionStatus !== 'completed' && e.endTime - now <= 0)

  const statusConfig = getStatusConfig(dayCloseStatus)

  const handleShowToast = (msg: string) => {
    setToast(msg)
    setTimeout(() => setToast(null), 3000)
  }

  const handleDayClose = async () => {
    const result = await performDayClose()
    if (result.success) {
      handleShowToast(result.error ? `Day closed! ${result.error}` : 'Day closed successfully')
    } else {
      handleShowToast(`Failed: ${result.error}`)
    }
    setShowConfirm(false
    )
  }

  const handleCreateBackup = async (dayClose: DayCloseRecord) => {
    const result = await createBackup(dayClose)
    if (result.success) {
      handleShowToast('Backup created successfully')
    } else {
      handleShowToast(`Backup failed: ${result.error}`)
    }
    setShowBackupConfirm(null)
  }

  const handleDownloadBackup = (dayClose: DayCloseRecord | BackupRecord) => {
    if ('dayCloseId' in dayClose) {
      downloadBackup(dayClose as BackupRecord)
    } else {
      const backup = backupHistory.find(b => b.dayCloseId === (dayClose as DayCloseRecord).id)
      if (backup) downloadBackup(backup)
    }
    handleShowToast('Backup downloaded')
  }

  const handleRetryBackup = async (dayClose: DayCloseRecord) => {
    try {
      await retryBackup(dayClose)
      handleShowToast('Backup retry successful')
    } catch (err) {
      handleShowToast(`Retry failed: ${err instanceof Error ? err.message : 'Unknown error'}`)
    }
    setShowRetryConfirm(null)
  }

  const handleRecordPayment = () => {
    if (!showPaymentModal || !paymentAmount || Number(paymentAmount) <= 0) return
    recordPayment(showPaymentModal.id, Number(paymentAmount), paymentMethod, paymentNote)
    setPaymentAmount('')
    setPaymentNote('')
    setShowPaymentModal(null)
    handleShowToast('Payment recorded')
  }

  return (
    <div className="space-y-6">
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="fixed top-20 left-1/2 -translate-x-1/2 z-[80] px-4 py-2 rounded-xl bg-emerald-500/20 border border-emerald-400/40 text-emerald-200 text-sm"
          >
            {toast}
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-display text-xl font-bold text-white sm:text-2xl">Day Close</h1>
          <p className="text-sm text-slate-400">End-of-day closing and backup</p>
        </div>
        <div className="flex items-center gap-3">
          <div className={cx('flex items-center gap-2 px-3 py-1.5 rounded-xl border', statusConfig.bg)}>
            <statusConfig.icon size={14} className={statusConfig.color} />
            <span className="text-sm font-semibold">{statusConfig.label}</span>
          </div>
          <span className="hidden sm:block text-xs text-slate-500">Business Date: {today}</span>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="p-4">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">Total Sessions</p>
          <p className="font-display text-2xl font-bold text-white mt-1">{s.todayCustomers}</p>
        </Card>
        <Card className="p-4">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">Active Sessions</p>
          <p className="font-display text-2xl font-bold text-emerald-300 mt-1">{activeSessions.length}</p>
        </Card>
        <Card className="p-4">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">Completed</p>
          <p className="font-display text-2xl font-bold text-violet-300 mt-1">{s.completedSessions}</p>
        </Card>
        <Card className="p-4">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">Time Over</p>
          <p className="font-display text-2xl font-bold text-rose-300 mt-1">{timeOverSessions.length}</p>
        </Card>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="p-4">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">Total Payable</p>
          <p className="font-display text-2xl font-bold text-white mt-1">{INR(s.moneyCollected + s.pendingPayments)}</p>
        </Card>
        <Card className="p-4">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">Money Collected</p>
          <p className="font-display text-2xl font-bold text-cyan-300 mt-1">{INR(s.moneyCollected)}</p>
        </Card>
        <Card className="p-4">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">Pending Payments</p>
          <p className="font-display text-2xl font-bold text-rose-300 mt-1">{INR(s.pendingPayments)}</p>
        </Card>
        <Card className="p-4">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">Renewal Charges</p>
          <p className="font-display text-2xl font-bold text-amber-300 mt-1">
            {INR(todayEntries.reduce((sum, e) => sum + (e.renewals?.reduce((s, r) => s + r.charge, 0) ?? 0), 0))}
          </p>
        </Card>
      </div>

      {dayCloseStatus === 'open' && (
        <Card className="p-4 border-amber-500/30 bg-amber-500/5">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500/10 text-amber-300">
              <AlertTriangle size={20} />
            </div>
            <div className="flex-1">
              <p className="font-semibold text-amber-300">Day is still open</p>
              <p className="text-sm text-slate-400">Click 'Close Day' to finalize today's business and create automatic backup</p>
            </div>
            <Button
              size="lg"
              onClick={() => setShowConfirm(true)}
              className="bg-amber-500 hover:bg-amber-400 text-ink-950 font-semibold"
              disabled={todayEntries.length === 0}
            >
              <Sun size={14} className="mr-2" /> Close Day
            </Button>
          </div>
        </Card>
      )}

      {dayCloseStatus === 'pending' && (
        <Card className="p-4 border-amber-500/30 bg-amber-500/5">
          <div className="flex items-center gap-3">
            <div className="animate-spin rounded-full h-10 w-10 border-2 border-amber-400 border-t-transparent" />
            <div className="flex-1">
              <p className="font-semibold text-amber-300">Closing day...</p>
              <p className="text-sm text-slate-400">Please wait while we finalize the day and create backup</p>
            </div>
          </div>
        </Card>
      )}

      {dayCloseStatus === 'closed' && currentDayClose && (
        <div className="space-y-4">
          <Card className="p-4 border-emerald-500/30 bg-emerald-500/5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-300">
                  <CheckCircle size={20} />
                </div>
                <div>
                  <p className="font-semibold text-emerald-300">Day Closed Successfully</p>
                  <p className="text-sm text-slate-400">
                    Closed at {formatClock(currentDayClose.closedAt)} · {currentDayClose.totalSessions} sessions
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {currentDayClose && (
                  <>
                    <Button
                      variant="outline"
                      onClick={() => setShowBackupConfirm(currentDayClose)}
                      disabled={backupInProgress}
                    >
                      <Database size={14} className="mr-2" /> Create Backup
                    </Button>
                    {latestBackup && latestBackup.dayCloseId === currentDayClose.id && (
                      <Button
                        variant="secondary"
                        onClick={() => handleDownloadBackup(currentDayClose!)}
                      >
                        <Download size={14} className="mr-2" /> Download Backup
                      </Button>
                    )}
                  </>
                )}
              </div>
            </div>
          </Card>

          {latestBackup && latestBackup.dayCloseId === currentDayClose.id && (
            <Card className="p-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-display text-sm font-bold text-white flex items-center gap-2">
                  <Database size={14} className="text-brand-300" />
                  Backup Status
                </h3>
                <span className={cx(
                  'text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full',
                  latestBackup.status === 'downloaded'
                    ? 'border-emerald-400/30 bg-emerald-400/10 text-emerald-300'
                    : latestBackup.status === 'failed'
                    ? 'border-rose-400/30 bg-rose-400/10 text-rose-300'
                    : 'border-brand-400/30 bg-brand-400/10 text-brand-300'
                )}>
                  {latestBackup.status.charAt(0).toUpperCase() + latestBackup.status.slice(1)}
                </span>
              </div>
              <div className="grid gap-2 sm:grid-cols-2 text-sm">
                <div className="p-2 rounded-xl bg-white/[0.03]">
                  <p className="text-slate-500">Created</p>
                  <p className="font-semibold text-white">{formatClock(latestBackup.createdAt)}</p>
                </div>
                <div className="p-2 rounded-xl bg-white/[0.03]">
                  <p className="text-slate-500">Entries</p>
                  <p className="font-semibold text-white">{latestBackup.entryCount}</p>
                </div>
                <div className="p-2 rounded-xl bg-white/[0.03]">
                  <p className="text-slate-500">Total Payable</p>
                  <p className="font-semibold text-white">{INR(latestBackup.dayCloseSummary.totalPayable)}</p>
                </div>
                <div className="p-2 rounded-xl bg-white/[0.03]">
                  <p className="text-slate-500">Collected</p>
                  <p className="font-semibold text-cyan-300">{INR(latestBackup.dayCloseSummary.totalCollected)}</p>
                </div>
              </div>
              {latestBackup.status === 'failed' && (
                <div className="mt-3 p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-center gap-2">
                  <AlertTriangle size={16} className="text-rose-300" />
                  <p className="text-sm text-rose-300 flex-1">{latestBackup.error || 'Backup failed'}</p>
                  <Button size="sm" variant="outline" onClick={() => setShowRetryConfirm(currentDayClose!)}>
                    <RotateCcw size={12} className="mr-1" /> Retry
                  </Button>
                </div>
              )}
            </Card>
          )}

          <Card className="p-4">
            <h3 className="font-display text-sm font-bold text-white mb-3">Session Details at Close</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-sm">
                <thead>
                  <tr className="border-b border-white/[0.06]">
                    <th className="px-3 py-2 text-[10px] font-semibold uppercase tracking-wider text-slate-500">Customer</th>
                    <th className="px-3 py-2 text-[10px] font-semibold uppercase tracking-wider text-slate-500">Start</th>
                    <th className="px-3 py-2 text-[10px] font-semibold uppercase tracking-wider text-slate-500">End</th>
                    <th className="px-3 py-2 text-[10px] font-semibold uppercase tracking-wider text-slate-500">Status</th>
                    <th className="px-3 py-2 text-[10px] font-semibold uppercase tracking-wider text-slate-500 text-right">Payable</th>
                    <th className="px-3 py-2 text-[10px] font-semibold uppercase tracking-wider text-slate-500 text-right">Collected</th>
                    <th className="px-3 py-2 text-[10px] font-semibold uppercase tracking-wider text-slate-500 text-right">Pending</th>
                    <th className="px-3 py-2 text-[10px] font-semibold uppercase tracking-wider text-slate-500 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/[0.04]">
                  {currentDayClose.sessions.map((entry) => {
                    const sessionStatusConfig = getSessionStatusConfig(entry.sessionStatus)
                    const pending = Math.max(0, (entry.totalAmount ?? entry.amount) - (entry.paidAmount ?? (entry.paymentStatus === 'paid' ? entry.amount : 0)))
                    return (
                      <tr key={entry.id} className="hover:bg-white/[0.02]">
                        <td className="px-3 py-2">
                          <p className="font-medium text-white">{entry.customerName}</p>
                          <p className="text-[10px] text-slate-500">{humanDuration(entry.durationMinutes)}</p>
                        </td>
                        <td className="px-3 py-2 text-slate-300">{formatClock(entry.startTime)}</td>
                        <td className="px-3 py-2 text-slate-300">{formatClock(entry.endTime)}</td>
                        <td className="px-3 py-2">
                          <span className={cx('text-[10px] font-semibold uppercase', sessionStatusConfig.color)}>
                            {sessionStatusConfig.label}
                          </span>
                        </td>
                        <td className="px-3 py-2 text-right font-semibold text-white">{INR(entry.totalAmount ?? entry.amount)}</td>
                        <td className="px-3 py-2 text-right text-cyan-300">{INR(entry.paidAmount ?? (entry.paymentStatus === 'paid' ? entry.amount : 0))}</td>
                        <td className="px-3 py-2 text-right text-rose-300">{INR(pending)}</td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      )}

      <div className="space-y-4">
        <Card className="p-4">
          <h3 className="font-display text-sm font-bold text-white mb-3">Today's Sessions</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="border-b border-white/[0.06]">
                  <th className="px-3 py-2 text-[10px] font-semibold uppercase tracking-wider text-slate-500">Customer</th>
                  <th className="px-3 py-2 text-[10px] font-semibold uppercase tracking-wider text-slate-500">Start</th>
                  <th className="px-3 py-2 text-[10px] font-semibold uppercase tracking-wider text-slate-500">End</th>
                  <th className="px-3 py-2 text-[10px] font-semibold uppercase tracking-wider text-slate-500">Status</th>
                  <th className="px-3 py-2 text-[10px] font-semibold uppercase tracking-wider text-slate-500 text-right">Payable</th>
                  <th className="px-3 py-2 text-[10px] font-semibold uppercase tracking-wider text-slate-500 text-right">Collected</th>
                  <th className="px-3 py-2 text-[10px] font-semibold uppercase tracking-wider text-slate-500 text-right">Pending</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.04]">
                {todayEntries.length === 0 && (
                  <tr>
                    <td className="px-3 py-8 text-center text-slate-500" colSpan={7}>No sessions today</td>
                  </tr>
                )}
                {todayEntries.length > 0 && todayEntries.map((entry) => (
                  <SessionDetailsRow key={entry.id} entry={entry} />
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        {dayCloseHistory.length > 0 && (
          <Card className="p-4">
            <h3 className="font-display text-sm font-bold text-white mb-3">Previous Day Closes</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-sm">
                <thead>
                  <tr className="border-b border-white/[0.06]">
                    <th className="px-3 py-2 text-[10px] font-semibold uppercase tracking-wider text-slate-500">Date</th>
                    <th className="px-3 py-2 text-[10px] font-semibold uppercase tracking-wider text-slate-500">Closed At</th>
                    <th className="px-3 py-2 text-[10px] font-semibold uppercase tracking-wider text-slate-500">Sessions</th>
                    <th className="px-3 py-2 text-[10px] font-semibold uppercase tracking-wider text-slate-500 text-right">Payable</th>
                    <th className="px-3 py-2 text-[10px] font-semibold uppercase tracking-wider text-slate-500 text-right">Collected</th>
                    <th className="px-3 py-2 text-[10px] font-semibold uppercase tracking-wider text-slate-500 text-right">Pending</th>
                    <th className="px-3 py-2 text-[10px] font-semibold uppercase tracking-wider text-slate-500 text-right">Renewals</th>
                    <th className="px-3 py-2 text-[10px] font-semibold uppercase tracking-wider text-slate-500 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/[0.04]">
                  {dayCloseHistory.map((dc) => {
                    const backup = backupHistory.find(b => b.dayCloseId === dc.id && b.status !== 'failed')
                    return (
                      <tr key={dc.id} className="hover:bg-white/[0.02]">
                        <td className="px-3 py-2 font-medium text-white">{dc.businessDate}</td>
                        <td className="px-3 py-2 text-slate-300">{formatClock(dc.closedAt)}</td>
                        <td className="px-3 py-2 text-white">{dc.totalSessions}</td>
                        <td className="px-3 py-2 text-right font-semibold text-white">{INR(dc.totalPayable)}</td>
                        <td className="px-3 py-2 text-right text-cyan-300">{INR(dc.totalCollected)}</td>
                        <td className="px-3 py-2 text-right text-rose-300">{INR(dc.totalPending)}</td>
                        <td className="px-3 py-2 text-right text-amber-300">{dc.renewalCount} (₹{dc.renewalCharges})</td>
                        <td className="px-3 py-2 text-right">
                          <Button size="xs" variant="ghost" onClick={() => setShowBackupConfirm(dc)}>
                            <FileText size={12} className="mr-1" /> Backup
                          </Button>
                          {backup && (
                            <Button size="xs" variant="secondary" onClick={() => handleDownloadBackup(backup)}>
                              <Download size={12} className="mr-1" />
                            </Button>
                          )}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </Card>
        )}
      </div>

      <ConfirmDialog
        open={showConfirm}
        onClose={() => setShowConfirm(false)}
        onConfirm={handleDayClose}
        title="Close Day?"
        message={
          <div className="space-y-2 text-sm">
            <p>This will finalize <span className="font-semibold text-white">{todayEntries.length}</span> sessions for today.</p>
            <p>Total Payable: <span className="font-semibold text-white">{INR(s.moneyCollected + s.pendingPayments)}</span></p>
            <p>Collected: <span className="font-semibold text-cyan-300">{INR(s.moneyCollected)}</span></p>
            <p>Pending: <span className="font-semibold text-rose-300">{INR(s.pendingPayments)}</span></p>
            <p className="text-xs text-slate-400 mt-2">
              An automatic backup will be created after closing. This action cannot be undone.
            </p>
          </div>
        }
        confirmLabel="Close Day"
        cancelLabel="Cancel"
      />

      <ConfirmDialog
        open={Boolean(showBackupConfirm)}
        onClose={() => setShowBackupConfirm(null)}
        onConfirm={() => showBackupConfirm && handleCreateBackup(showBackupConfirm)}
        title="Create Backup"
        message={
          showBackupConfirm && (
            <div className="space-y-2 text-sm">
              <p>Create backup for <span className="font-semibold text-white">{showBackupConfirm.businessDate}</span>?</p>
              <p>Sessions: <span className="font-semibold text-white">{showBackupConfirm.totalSessions}</span></p>
              <p>Total Payable: <span className="font-semibold text-white">{INR(showBackupConfirm.totalPayable)}</span></p>
            </div>
          )
        }
        confirmLabel="Create Backup"
        cancelLabel="Cancel"
        tone="primary"
      />

      <ConfirmDialog
        open={Boolean(showRetryConfirm)}
        onClose={() => setShowRetryConfirm(null)}
        onConfirm={() => showRetryConfirm && handleRetryBackup(showRetryConfirm)}
        title="Retry Backup"
        message={
          showRetryConfirm && (
            <div className="space-y-2 text-sm">
              <p>Retry backup for <span className="font-semibold text-white">{showRetryConfirm.businessDate}</span>?</p>
              <p className="text-xs text-slate-400">This will create a new backup without repeating the day close operation.</p>
            </div>
          )
        }
        confirmLabel="Retry"
        cancelLabel="Cancel"
        tone="primary"
      />

      <AnimatePresence>
        {showPaymentModal && (
          <div className="fixed inset-0 z-[90] flex items-end sm:items-center justify-center">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-ink-950/80 backdrop-blur-sm"
              onClick={() => { setShowPaymentModal(null); setPaymentAmount(''); setPaymentNote(''); }}
            />
            <motion.div
              initial={{ y: '100%', opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: '100%', opacity: 0 }}
              transition={{ type: 'spring', stiffness: 320, damping: 32 }}
              className="relative w-full sm:max-w-md max-h-[90vh] overflow-auto rounded-t-2xl sm:rounded-2xl border border-white/10 bg-ink-900/95 shadow-2xl"
            >
              <div className="flex items-center justify-between px-4 py-3 border-b border-white/[0.06]">
                <div>
                  <h2 className="font-display text-sm font-bold text-white">Record Payment</h2>
                  <p className="text-xs text-slate-400">{showPaymentModal.customerName}</p>
                </div>
                <button
                  onClick={() => { setShowPaymentModal(null); setPaymentAmount(''); setPaymentNote(''); }}
                  className="h-8 w-8 flex items-center justify-center rounded-lg text-slate-400 hover:text-white hover:bg-white/[0.06]"
                >
                  <X size={16} />
                </button>
              </div>
              <form onSubmit={(e) => { e.preventDefault(); handleRecordPayment(); }} className="p-4 space-y-3">
                <Field label="Amount (₹)" required>
                  <Input
                    type="number"
                    value={paymentAmount}
                    onChange={(e) => setPaymentAmount(e.target.value.replace(/\D/g, ''))}
                    placeholder="Amount"
                    inputMode="numeric"
                    autoFocus
                  />
                </Field>

                <Field label="Payment Method">
                  <Select
                    value={paymentMethod}
                    onChange={(e) => setPaymentMethod(e.target.value as 'cash' | 'upi' | 'card')}
                  >
                    <option value="cash">Cash</option>
                    <option value="upi">UPI</option>
                    <option value="card">Card</option>
                  </Select>
                </Field>

                <Field label="Note">
                  <Textarea
                    rows={2}
                    value={paymentNote}
                    onChange={(e) => setPaymentNote(e.target.value)}
                    placeholder="Optional note…"
                  />
                </Field>

                <div className="flex items-center gap-2 pt-2">
                  <Button type="submit" size="sm" className="flex-1">
                    <Save size={12} className="mr-1" /> Record Payment
                  </Button>
                  <Button type="button" size="sm" variant="outline" className="flex-1" onClick={() => { setShowPaymentModal(null); setPaymentAmount(''); setPaymentNote(''); }}>
                    Cancel
                  </Button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}