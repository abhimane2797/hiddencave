import { useState, useMemo } from 'react'
import {
  Download,
  RotateCcw,
  FileText,
  AlertTriangle,
  CheckCircle,
  XCircle,
  X,
  Database,
  Calendar,
  Trash2,
  Eye,
  IndianRupee,
  Users,
  Clock,
  AlertCircle,
} from 'lucide-react'
import { useEntries } from '@/store/entries'
import type { BackupRecord, DayCloseRecord } from '@/types'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { ConfirmDialog } from '@/components/dashboard/ConfirmDialog'
import { cx, formatClock, INR } from '@/lib/utils'
import { motion, AnimatePresence } from 'framer-motion'

const getBackupStatusConfig = (status: BackupRecord['status']) => {
  switch (status) {
    case 'downloaded':
      return { label: 'Downloaded', color: 'text-emerald-300', bg: 'bg-emerald-500/10 border-emerald-500/20', icon: CheckCircle }
    case 'saved':
      return { label: 'Saved Locally', color: 'text-brand-300', bg: 'bg-brand-500/10 border-brand-500/20', icon: Database }
    case 'failed':
      return { label: 'Failed', color: 'text-rose-300', bg: 'bg-rose-500/10 border-rose-500/20', icon: AlertTriangle }
    default:
      return { label: status, color: 'text-slate-400', bg: 'bg-slate-500/10 border-slate-500/20', icon: FileText }
  }
}

export default function ReportsTab() {
  const {
    entries,
    dayCloseHistory,
    backupHistory,
    downloadBackup,
    retryBackup,
  } = useEntries()

  const [toast, setToast] = useState<string | null>(null)
  const [showPreview, setShowPreview] = useState<BackupRecord | null>(null)
  const [showRetryConfirm, setShowRetryConfirm] = useState<DayCloseRecord | null>(null)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<BackupRecord | null>(null)

  const handleShowToast = (msg: string) => {
    setToast(msg)
    setTimeout(() => setToast(null), 3000)
  }

  const handleDownload = (backup: BackupRecord) => {
    downloadBackup(backup)
    handleShowToast('Backup downloaded')
  }

  const handleRetry = (dayClose: DayCloseRecord) => {
    setShowRetryConfirm(dayClose)
  }

  const handleConfirmRetry = async () => {
    if (!showRetryConfirm) return
    try {
      await retryBackup(showRetryConfirm)
      handleShowToast('Backup retry successful')
    } catch (err) {
      handleShowToast(`Retry failed: ${err instanceof Error ? err.message : 'Unknown error'}`)
    }
    setShowRetryConfirm(null)
  }

  const handleDelete = (backup: BackupRecord) => {
    setShowDeleteConfirm(backup)
  }

  const handleConfirmDelete = () => {
    if (!showDeleteConfirm) return
    handleShowToast('Delete not implemented - backup history is preserved')
    setShowDeleteConfirm(null)
  }

  const stats = useMemo(() => {
    return {
      totalBackups: backupHistory.length,
      downloaded: backupHistory.filter(b => b.status === 'downloaded').length,
      saved: backupHistory.filter(b => b.status === 'saved').length,
      failed: backupHistory.filter(b => b.status === 'failed').length,
      totalDaysClosed: dayCloseHistory.length,
    }
  }, [backupHistory, dayCloseHistory])

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
          <h1 className="font-display text-xl font-bold text-white sm:text-2xl">Reports & Backups</h1>
          <p className="text-sm text-slate-400">Daily backups and business history</p>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="p-4">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">Total Backups</p>
          <p className="font-display text-2xl font-bold text-white mt-1">{stats.totalBackups}</p>
        </Card>
        <Card className="p-4">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">Downloaded</p>
          <p className="font-display text-2xl font-bold text-emerald-300 mt-1">{stats.downloaded}</p>
        </Card>
        <Card className="p-4">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">Saved Locally</p>
          <p className="font-display text-2xl font-bold text-brand-300 mt-1">{stats.saved}</p>
        </Card>
        <Card className="p-4">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">Failed</p>
          <p className="font-display text-2xl font-bold text-rose-300 mt-1">{stats.failed}</p>
        </Card>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="p-4">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">Days Closed</p>
          <p className="font-display text-2xl font-bold text-white mt-1">{stats.totalDaysClosed}</p>
        </Card>
        <Card className="p-4">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">Total Sessions (All Time)</p>
          <p className="font-display text-2xl font-bold text-white mt-1">{entries.length}</p>
        </Card>
      </div>

      <Card className="p-4">
        <h3 className="font-display text-sm font-bold text-white mb-3">Backup History</h3>
        {backupHistory.length === 0 ? (
          <div className="text-center py-8">
            <FileText size={48} className="mx-auto text-slate-600 mb-3" />
            <p className="text-sm text-slate-500">No backups yet</p>
            <p className="text-xs text-slate-600 mt-1">Backups are created automatically after Day Close</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="border-b border-white/[0.06]">
                  <th className="px-3 py-2 text-[10px] font-semibold uppercase tracking-wider text-slate-500">Date</th>
                  <th className="px-3 py-2 text-[10px] font-semibold uppercase tracking-wider text-slate-500">Created</th>
                  <th className="px-3 py-2 text-[10px] font-semibold uppercase tracking-wider text-slate-500">Day Close</th>
                  <th className="px-3 py-2 text-[10px] font-semibold uppercase tracking-wider text-slate-500 text-center">Status</th>
                  <th className="px-3 py-2 text-[10px] font-semibold uppercase tracking-wider text-slate-500 text-right">Sessions</th>
                  <th className="px-3 py-2 text-[10px] font-semibold uppercase tracking-wider text-slate-500 text-right">Payable</th>
                  <th className="px-3 py-2 text-[10px] font-semibold uppercase tracking-wider text-slate-500 text-right">Collected</th>
                  <th className="px-3 py-2 text-[10px] font-semibold uppercase tracking-wider text-slate-500 text-right">Pending</th>
                  <th className="px-3 py-2 text-[10px] font-semibold uppercase tracking-wider text-slate-500 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.04]">
                {backupHistory.map((backup) => {
                  const statusConfig = getBackupStatusConfig(backup.status)
                  const dayClose = dayCloseHistory.find(d => d.id === backup.dayCloseId)
                  return (
                    <tr key={backup.id} className="hover:bg-white/[0.02]">
                      <td className="px-3 py-2 font-medium text-white">{backup.businessDate}</td>
                      <td className="px-3 py-2 text-slate-300">{formatClock(backup.createdAt)}</td>
                      <td className="px-3 py-2">
                        <span className="text-xs font-medium text-white">{dayClose ? formatClock(dayClose.closedAt) : 'N/A'}</span>
                      </td>
                      <td className="px-3 py-2 text-center">
                        <span className={cx(
                          'inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase',
                          statusConfig.bg
                        )}>
                          <statusConfig.icon size={10} />
                          {statusConfig.label}
                        </span>
                      </td>
                      <td className="px-3 py-2 text-right text-white">{backup.entryCount}</td>
                      <td className="px-3 py-2 text-right font-semibold text-white">{INR(backup.dayCloseSummary.totalPayable)}</td>
                      <td className="px-3 py-2 text-right text-cyan-300">{INR(backup.dayCloseSummary.totalCollected)}</td>
                      <td className="px-3 py-2 text-right text-rose-300">{INR(backup.dayCloseSummary.totalPending)}</td>
                      <td className="px-3 py-2 text-right">
                        <div className="flex items-center justify-end gap-1">
                          {backup.status !== 'downloaded' && (
                            <Button
                              size="xs"
                              variant="secondary"
                              onClick={() => handleDownload(backup)}
                              className="bg-brand-500 hover:bg-brand-400 text-white"
                            >
                              <Download size={10} className="mr-1" />
                            </Button>
                          )}
                          {backup.status === 'downloaded' && (
                            <Button
                              size="xs"
                              variant="outline"
                              onClick={() => handleDownload(backup)}
                            >
                              <RotateCcw size={10} className="mr-1" />
                            </Button>
                          )}
                          {backup.status === 'failed' && dayClose && (
                            <Button
                              size="xs"
                              variant="outline"
                              onClick={() => handleRetry(dayClose)}
                              className="text-amber-300 hover:bg-amber-500/10 border-amber-500/30"
                            >
                              <RotateCcw size={10} className="mr-1" />
                            </Button>
                          )}
                          <Button
                            size="xs"
                            variant="ghost"
                            onClick={() => setShowPreview(backup)}
                            className="text-slate-400 hover:text-white"
                          >
                            <Eye size={10} />
                          </Button>
                          <Button
                            size="xs"
                            variant="ghost"
                            onClick={() => handleDelete(backup)}
                            className="text-rose-400 hover:text-rose-300"
                          >
                            <Trash2 size={10} />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}

        <div className="mt-4 p-4 rounded-xl border border-amber-500/20 bg-amber-500/5">
          <div className="flex items-start gap-3">
            <AlertTriangle size={20} className="text-amber-300 mt-0.5 shrink-0" />
            <div className="text-sm text-slate-300">
              <p className="font-semibold text-amber-300">Important: Local backups are not permanent</p>
              <p className="mt-1">Browser storage can be cleared by the user, browser updates, or device issues. Always download backups and store them externally (USB drive, cloud storage, etc.) for true disaster recovery.</p>
              <p className="mt-2 text-xs text-slate-500">Backups are stored in IndexedDB and survive page refreshes, but not browser data clearing.</p>
            </div>
          </div>
        </div>
      </Card>

      {dayCloseHistory.length > 0 && (
        <Card className="p-4">
          <h3 className="font-display text-sm font-bold text-white mb-3">Day Close History</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="border-b border-white/[0.06]">
                  <th className="px-3 py-2 text-[10px] font-semibold uppercase tracking-wider text-slate-500">Business Date</th>
                  <th className="px-3 py-2 text-[10px] font-semibold uppercase tracking-wider text-slate-500">Closed At</th>
                  <th className="px-3 py-2 text-[10px] font-semibold uppercase tracking-wider text-slate-500">Sessions</th>
                  <th className="px-3 py-2 text-[10px] font-semibold uppercase tracking-wider text-slate-500 text-right">Payable</th>
                  <th className="px-3 py-2 text-[10px] font-semibold uppercase tracking-wider text-slate-500 text-right">Collected</th>
                  <th className="px-3 py-2 text-[10px] font-semibold uppercase tracking-wider text-slate-500 text-right">Pending</th>
                  <th className="px-3 py-2 text-[10px] font-semibold uppercase tracking-wider text-slate-500 text-right">Renewals</th>
                  <th className="px-3 py-2 text-[10px] font-semibold uppercase tracking-wider text-slate-500 text-right">Backup</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.04]">
                {dayCloseHistory.map((dc) => {
                  const backup = backupHistory.find(b => b.dayCloseId === dc.id)
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
                        {backup ? (
                          <span className={cx(
                            'inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase',
                            backup.status === 'downloaded' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-300' :
                            backup.status === 'saved' ? 'bg-brand-500/10 border-brand-500/20 text-brand-300' :
                            'bg-rose-500/10 border-rose-500/20 text-rose-300'
                          )}>
                            <CheckCircle size={10} /> {backup.status}
                          </span>
                        ) : (
                          <span className="text-slate-500 text-xs">No backup</span>
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

      <ConfirmDialog
        open={Boolean(showRetryConfirm)}
        onClose={() => setShowRetryConfirm(null)}
        onConfirm={handleConfirmRetry}
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

      <ConfirmDialog
        open={Boolean(showDeleteConfirm)}
        onClose={() => setShowDeleteConfirm(null)}
        onConfirm={handleConfirmDelete}
        title="Delete Backup"
        message={
          showDeleteConfirm && (
            <div className="space-y-2 text-sm">
              <p>Delete backup for <span className="font-semibold text-white">{showDeleteConfirm.businessDate}</span>?</p>
              <p className="text-xs text-rose-300">This action cannot be undone. Consider downloading first.</p>
            </div>
          )
        }
        confirmLabel="Delete"
        cancelLabel="Cancel"
        tone="danger"
      />

      <AnimatePresence>
        {showPreview && (
          <div className="fixed inset-0 z-[90] flex items-end sm:items-center justify-center">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-ink-950/80 backdrop-blur-sm"
              onClick={() => setShowPreview(null)}
            />
            <motion.div
              initial={{ y: '100%', opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: '100%', opacity: 0 }}
              transition={{ type: 'spring', stiffness: 320, damping: 32 }}
              className="relative w-full sm:max-w-2xl max-h-[90vh] overflow-auto rounded-t-2xl sm:rounded-2xl border border-white/10 bg-ink-900/95 shadow-2xl"
            >
              <div className="flex items-center justify-between px-4 py-3 border-b border-white/[0.06]">
                <div>
                  <h2 className="font-display text-sm font-bold text-white flex items-center gap-2">
                    <FileText size={14} className="text-brand-300" />
                    Backup Preview
                  </h2>
                  <p className="text-xs text-slate-400">{showPreview.businessDate}</p>
                </div>
                <button
                  onClick={() => setShowPreview(null)}
                  className="h-8 w-8 flex items-center justify-center rounded-lg text-slate-400 hover:text-white hover:bg-white/[0.06]"
                >
                  <X size={16} />
                </button>
              </div>
              <div className="p-4 space-y-4 max-h-[60vh] overflow-auto">
                <div className="grid gap-2 sm:grid-cols-2">
                  <div className="p-3 rounded-xl bg-white/[0.03]">
                    <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">Backup ID</p>
                    <p className="font-mono text-xs text-white truncate">{showPreview.id}</p>
                  </div>
                  <div className="p-3 rounded-xl bg-white/[0.03]">
                    <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">Business Date</p>
                    <p className="font-semibold text-white">{showPreview.businessDate}</p>
                  </div>
                  <div className="p-3 rounded-xl bg-white/[0.03]">
                    <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">Created</p>
                    <p className="text-white">{formatClock(showPreview.createdAt)}</p>
                  </div>
                  <div className="p-3 rounded-xl bg-white/[0.03]">
                    <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">Version</p>
                    <p className="font-semibold text-white">v{showPreview.backupVersion}</p>
                  </div>
                  <div className="p-3 rounded-xl bg-white/[0.03]">
                    <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">Status</p>
                    <p className={cx('font-semibold', getBackupStatusConfig(showPreview.status).color)}>
                      {getBackupStatusConfig(showPreview.status).label}
                    </p>
                  </div>
                  <div className="p-3 rounded-xl bg-white/[0.03]">
                    <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">Sessions</p>
                    <p className="font-semibold text-white">{showPreview.entryCount}</p>
                  </div>
                  <div className="p-3 rounded-xl bg-white/[0.03]">
                    <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">Total Payable</p>
                    <p className="font-semibold text-white">{INR(showPreview.dayCloseSummary.totalPayable)}</p>
                  </div>
                  <div className="p-3 rounded-xl bg-white/[0.03]">
                    <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">Collected</p>
                    <p className="font-semibold text-cyan-300">{INR(showPreview.dayCloseSummary.totalCollected)}</p>
                  </div>
                  <div className="p-3 rounded-xl bg-white/[0.03]">
                    <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">Pending</p>
                    <p className="font-semibold text-rose-300">{INR(showPreview.dayCloseSummary.totalPending)}</p>
                  </div>
                </div>

                <div className="border-t border-white/[0.06] pt-4">
                  <div className="flex items-center gap-2">
                    <Button variant="secondary" onClick={() => handleDownload(showPreview)}>
                      <Download size={12} className="mr-1" /> Download JSON
                    </Button>
                    <Button variant="outline" onClick={() => setShowPreview(null)}>Close</Button>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}