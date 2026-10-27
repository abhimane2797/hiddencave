import { useState, useMemo } from 'react'
import {
  UserPlus,
  Clock,
  IndianRupee,
  Filter,
  Search,
  Timer,
  Square,
  Play,
  Trash2,
  ChevronDown,
  ChevronUp,
  X,
  Edit,
  Save,
  Download,
  Upload,
  FileSpreadsheet,
  AlertCircle,
  CheckCircle,
  RotateCcw,
} from 'lucide-react'
import { useEntries, DURATION_OPTIONS } from '@/store/entries'
import { useTimer } from '@/store/timer'
import { baseHourlyPrice, sessionPrice } from '@/config/pricing'
import type { Entry, ImportPreview } from '@/types'
import { PaymentBadge } from '@/components/dashboard/PaymentBadge'
import { SessionTimer } from '@/components/dashboard/SessionTimer'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Field, Input, Select, Textarea, Segmented } from '@/components/ui/Inputs'
import { ConfirmDialog } from '@/components/dashboard/ConfirmDialog'
import { cx, formatClock, formatDuration, humanDuration, dateKey, INR } from '@/lib/utils'
import { motion, AnimatePresence } from 'framer-motion'

const parseDateTimeLocal = (value: string): number => {
  if (!value) return Date.now()
  const parsed = new Date(value).getTime()
  return isNaN(parsed) ? Date.now() : parsed
}

const formatLocalDateTime = (timestamp: number) => {
  const d = new Date(timestamp)
  const year = d.getFullYear()
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  const hours = String(d.getHours()).padStart(2, '0')
  const minutes = String(d.getMinutes()).padStart(2, '0')
  return `${year}-${month}-${day}T${hours}:${minutes}`
}

const DURATION_LABELS: Record<number, string> = {
  30: '30 min',
  45: '45 min',
  60: '1 hour',
  90: '1 hour 30 min',
  120: '2 hours',
}

const RENEWAL_MINUTES = 30
const RENEWAL_CHARGE = 70

export default function EntriesTab() {
  const {
    entries,
    addEntry,
    updateEntry,
    updatePaymentStatus,
    recordRenewalPayment,
    recordPayment,
    extendSession,
    renewSession,
    endSession,
    deleteEntry,
    exportAll,
    exportToday,
    previewImport,
    confirmImport,
    loading,
    lastBackup,
    soundUnlocked,
    setSoundUnlocked,
    muted,
    setMuted,
  } = useEntries()
  const { now } = useTimer()

  // Form state
  const [customerName, setCustomerName] = useState('')
  const [durationMinutes, setDurationMinutes] = useState(60)
  const [amount, setAmount] = useState(String(sessionPrice(60, baseHourlyPrice(new Date()))))
  const [paymentStatus, setPaymentStatus] = useState<'paid' | 'unpaid'>('unpaid')
  const [startTime, setStartTime] = useState(Date.now())
  const [notes, setNotes] = useState('')
  const [showAddForm, setShowAddForm] = useState(false)
  const [toast, setToast] = useState<string | null>(null)
  const [priceOverride, setPriceOverride] = useState(false)

  // Add form validation errors
  const [addNameError, setAddNameError] = useState('')
  const [addAmountError, setAddAmountError] = useState('')

  // Auto-calculated price based on duration
  const calculatedPrice = sessionPrice(durationMinutes, baseHourlyPrice(new Date(startTime)))
  const displayAmount = priceOverride ? amount : String(calculatedPrice)

  // Update amount when duration changes (unless manually overridden)
  const handleDurationChange = (minutes: number) => {
    setDurationMinutes(minutes)
    if (!priceOverride) {
      setAmount(String(sessionPrice(minutes, baseHourlyPrice(new Date(startTime)))))
    }
  }

  // Edit form state
const [editEntry, setEditEntry] = useState<Entry | null>(null)
  const [editCustomerName, setEditCustomerName] = useState('')
  const [editDurationMinutes, setEditDurationMinutes] = useState(60)
  const [editAmount, setEditAmount] = useState('')
  const [editTotalAmount, setEditTotalAmount] = useState('')
  const [editPaidAmount, setEditPaidAmount] = useState('')
  const [editPaymentStatus, setEditPaymentStatus] = useState<'paid' | 'unpaid'>('unpaid')
  const [editStartTime, setEditStartTime] = useState(Date.now())
  const [editEndTime, setEditEndTime] = useState(Date.now())
  const [editSessionStatus, setEditSessionStatus] = useState<'active' | 'almost-over' | 'time-over' | 'completed'>('active')
  const [editNotes, setEditNotes] = useState('')
  const [showEditForm, setShowEditForm] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [editPriceOverride, setEditPriceOverride] = useState(false)

  // Edit form validation errors
  const [editNameError, setEditNameError] = useState('')
  const [editAmountError, setEditAmountError] = useState('')
  const [editTotalError, setEditTotalError] = useState('')
  const [editPaidError, setEditPaidError] = useState('')

  // Table state
  const [query, setQuery] = useState('')
  const [paymentFilter, setPaymentFilter] = useState<'all' | 'paid' | 'unpaid'>('all')
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'almost-over' | 'time-over' | 'completed'>('all')
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null)

  // Import/Export state
  const [showImportDialog, setShowImportDialog] = useState(false)
  const [importFile, setImportFile] = useState<File | null>(null)
  const [importPreview, setImportPreview] = useState<ImportPreview | null>(null)
  const [isImporting, setIsImporting] = useState(false)

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    return entries
      .filter((e) => {
        if (q && !e.customerName.toLowerCase().includes(q)) return false
        if (paymentFilter !== 'all' && e.paymentStatus !== paymentFilter) return false
        if (statusFilter !== 'all' && e.sessionStatus !== statusFilter) return false
        return true
      })
      .sort((a, b) => b.createdAt - a.createdAt)
  }, [entries, query, paymentFilter, statusFilter])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setAddNameError('')
    setAddAmountError('')

    let valid = true
    if (!customerName.trim()) {
      setAddNameError('Customer name is required')
      valid = false
    }
    if (!displayAmount || Number(displayAmount) <= 0) {
      setAddAmountError('Enter a valid amount')
      valid = false
    }
    if (!valid) return

    addEntry({
      customerName,
      durationMinutes,
      amount: Number(displayAmount),
      paymentStatus,
      startTime,
      notes,
    })

    setCustomerName('')
    setAmount('')
    setPaymentStatus('unpaid')
    setStartTime(Date.now())
    setNotes('')
    setShowAddForm(false)
    setToast('Entry added successfully')
    setTimeout(() => setToast(null), 2000)
  }

  const handleExtend = (id: string, minutes: number) => {
    extendSession(id, minutes)
  }

  const handleEnd = (id: string) => {
    endSession(id)
  }

  const handleDelete = (id: string) => {
    deleteEntry(id)
    setDeleteTarget(null)
  }

  const [renewTarget, setRenewTarget] = useState<Entry | null>(null)

  const handleRenew = (entry: Entry) => {
    setRenewTarget(entry)
  }

  const handleConfirmRenew = () => {
    if (!renewTarget) return
    renewSession(renewTarget.id)
    setToast(`Renewed 30 minutes for ${renewTarget.customerName}. Added ₹70.`)
    setTimeout(() => setToast(null), 2000)
    setRenewTarget(null)
  }

  const handleEditDurationChange = (minutes: number) => {
    setEditDurationMinutes(minutes)
    if (!editPriceOverride) {
      setEditAmount(String(sessionPrice(minutes, baseHourlyPrice(new Date(editStartTime)))))
    }
  }

  const handleEdit = (entry: Entry) => {
    setEditEntry(entry)
    setEditCustomerName(entry.customerName)
    setEditDurationMinutes(entry.durationMinutes)
    setEditAmount(String(entry.amount))
    setEditTotalAmount(String(entry.totalAmount ?? entry.amount))
    setEditPaidAmount(String(entry.paidAmount ?? (entry.paymentStatus === 'paid' ? entry.amount : 0)))
    setEditPaymentStatus(entry.paymentStatus)
    setEditStartTime(entry.startTime)
    setEditEndTime(entry.endTime)
    setEditSessionStatus(entry.sessionStatus)
    setEditNotes(entry.notes || '')
    setEditPriceOverride(false)
    setShowEditForm(true)
  }

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setEditNameError('')
    setEditAmountError('')
    setEditTotalError('')
    setEditPaidError('')

    let valid = true
    if (!editCustomerName.trim()) {
      setEditNameError('Customer name is required')
      valid = false
    }
    if (!editAmount || Number(editAmount) <= 0) {
      setEditAmountError('Enter a valid amount')
      valid = false
    }
    if (!editTotalAmount || Number(editTotalAmount) <= 0) {
      setEditTotalError('Enter a valid total')
      valid = false
    }
    if (editPaidAmount === '' || Number(editPaidAmount) < 0) {
      setEditPaidError('Enter a valid paid amount')
      valid = false
    }
    if (!valid || !editEntry) return

    const newPaidAmount = Number(editPaidAmount)
    const newTotalAmount = Number(editTotalAmount)
    const newPaymentStatus = editPaymentStatus

    // Keep paidAmount in sync with status: paid => full total, unpaid => keep entered amount
    const finalPaidAmount = newPaymentStatus === 'paid' ? newTotalAmount : newPaidAmount

    setIsSaving(true)
    try {
      updateEntry(editEntry.id, {
        customerName: editCustomerName.trim(),
        durationMinutes: editDurationMinutes,
        amount: Number(editAmount),
        totalAmount: newTotalAmount,
        paidAmount: finalPaidAmount,
        paymentStatus: newPaymentStatus,
        startTime: editStartTime,
        sessionStatus: editSessionStatus,
        notes: editNotes.trim() || undefined,
      })
      setToast('Entry updated successfully')
      setTimeout(() => setToast(null), 2000)
    } finally {
      setIsSaving(false)
      setShowEditForm(false)
      setEditEntry(null)
    }
  }

  const handleCancelEdit = () => {
    setShowEditForm(false)
    setEditEntry(null)
  }

  const handleExportAll = () => {
    exportAll()
    setToast('All entries exported to Excel')
    setTimeout(() => setToast(null), 2000)
  }

  const handleExportToday = () => {
    exportToday()
    setToast("Today's entries exported to Excel")
    setTimeout(() => setToast(null), 2000)
  }

  const handleImportFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setImportFile(file)
      setShowImportDialog(true)
    }
  }

  const handlePreviewImport = async () => {
    if (!importFile) return
    setIsImporting(true)
    try {
      const preview = await previewImport(importFile)
      setImportPreview(preview)
    } catch (err) {
      setToast('Failed to parse Excel file')
      setTimeout(() => setToast(null), 2000)
    } finally {
      setIsImporting(false)
    }
  }

  const handleConfirmImport = async () => {
    if (!importPreview) return
    setIsImporting(true)
    try {
      const result = await confirmImport(importPreview)
      setToast(`Imported ${result.imported} entries${result.skipped > 0 ? `, skipped ${result.skipped} duplicates` : ''}`)
      setTimeout(() => setToast(null), 3000)
      setShowImportDialog(false)
      setImportFile(null)
      setImportPreview(null)
    } catch (err) {
      setToast('Import failed')
      setTimeout(() => setToast(null), 2000)
    } finally {
      setIsImporting(false)
    }
  }

  const handleCancelImport = () => {
    setShowImportDialog(false)
    setImportFile(null)
    setImportPreview(null)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'text-emerald-300'
      case 'almost-over': return 'text-amber-300'
      case 'time-over': return 'text-rose-300'
      case 'completed': return 'text-slate-400'
      default: return 'text-slate-400'
    }
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

      {loading && (
        <div className="fixed inset-x-4 top-20 z-[70] sm:inset-x-auto sm:right-4 sm:w-[380px]">
          <div className="overflow-hidden rounded-xl border border-amber-500/30 bg-ink-850/97 shadow-[0_24px_60px_-24px_rgba(251,191,36,0.6)] backdrop-blur-2xl p-4 flex items-center gap-3">
            <div className="animate-spin rounded-full h-5 w-5 border-2 border-amber-400 border-t-transparent" />
            <span className="text-sm text-amber-200">Loading entries from IndexedDB...</span>
          </div>
        </div>
      )}

      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="font-display text-xl font-bold text-white sm:text-2xl">Customer Entries</h1>
          <p className="text-sm text-slate-400">
            Manage gaming sessions and payments
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button size="sm" variant="outline" onClick={handleExportToday}>
            <Download size={14} /> Today
          </Button>
          <Button size="sm" variant="outline" onClick={handleExportAll}>
            <Download size={14} /> All
          </Button>
          <input
            type="file"
            accept=".xlsx,.xls"
            className="hidden"
            id="import-file"
            onChange={handleImportFileChange}
          />
          <Button size="sm" variant="outline" onClick={() => document.getElementById('import-file')?.click()}>
            <Upload size={14} /> Import
          </Button>
          <Button
            size="sm"
            onClick={() => {
              setStartTime(Date.now())
              setShowAddForm(true)
            }}
          >
            <UserPlus size={14} /> + Add Entry
          </Button>
          <Button
            size="sm"
            variant={muted || !soundUnlocked ? 'outline' : 'secondary'}
            onClick={() => {
              if (!soundUnlocked) {
                setSoundUnlocked()
                setMuted(false)
                return
              }
              setMuted(!muted)
            }}
          >
            {muted || !soundUnlocked ? <span className="flex items-center gap-1"><span className="text-slate-400">🔇</span> Sound Off</span> : <span className="flex items-center gap-1">🔊 Sound On</span>}
          </Button>
        </div>
      </div>

      {lastBackup && (
        <div className="flex items-center justify-between text-xs text-slate-500 px-1">
          <span>
            <Clock size={12} className="inline-block align-middle mr-1" /> Last backup: {new Date(lastBackup.timestamp).toLocaleString('en-IN', { hour12: false })} · {lastBackup.count} entries
          </span>
          {loading && (
            <span className="flex items-center gap-1 text-amber-400">
              <div className="animate-spin rounded-full h-4 w-4 border-2 border-amber-400 border-t-transparent" />
              Loading...
            </span>
          )}
        </div>
      )}

      <AnimatePresence>
        {showAddForm && (
          <div className="fixed inset-0 z-[90] flex items-end sm:items-center justify-center">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-ink-950/80 backdrop-blur-sm"
              onClick={() => setShowAddForm(false)}
            />
            <motion.div
              initial={{ y: '100%', opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: '100%', opacity: 0 }}
              transition={{ type: 'spring', stiffness: 320, damping: 32 }}
              className="relative w-full sm:max-w-lg max-h-[90vh] overflow-auto rounded-t-2xl sm:rounded-2xl border border-white/10 bg-ink-900/95 shadow-2xl"
            >
              <div className="flex items-center justify-between px-4 py-3 border-b border-white/[0.06]">
                <div>
                  <h2 className="font-display text-sm font-bold text-white">Add Entry</h2>
                  <p className="text-xs text-slate-400">Start a new gaming session</p>
                </div>
                <button
                  onClick={() => setShowAddForm(false)}
                  className="h-8 w-8 flex items-center justify-center rounded-lg text-slate-400 hover:text-white hover:bg-white/[0.06]"
                >
                  <X size={16} />
                </button>
              </div>
              <form onSubmit={handleSubmit} className="p-4 space-y-3">
                <Field label="Customer Name" required error={addNameError || undefined}>
                  <Input
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    placeholder="e.g. Rahul Sharma"
                    autoFocus
                  />
                </Field>

                <Field label="Session Duration">
                  <Segmented
                    size="sm"
                    options={DURATION_OPTIONS.map((m) => ({ value: m, label: DURATION_LABELS[m] }))}
                    value={durationMinutes}
                    onChange={handleDurationChange}
                  />
                </Field>

                <Field label="Amount (₹)" required error={addAmountError || undefined}>
                  <Input
                    type="number"
                    value={displayAmount}
                    onChange={(e) => {
                      setAmount(e.target.value.replace(/\D/g, ''))
                      setPriceOverride(true)
                    }}
                    placeholder="e.g. 150"
                    inputMode="numeric"
                  />
                </Field>

                <Field label="Payment Status">
                  <Select
                    value={paymentStatus}
                    onChange={(e) => setPaymentStatus(e.target.value as 'paid' | 'unpaid')}
                  >
                    <option value="paid">Paid</option>
                    <option value="unpaid">Unpaid</option>
                  </Select>
                </Field>

                <Field label="Start Time">
                  <Input
                    type="datetime-local"
                    value={formatLocalDateTime(startTime)}
                    onChange={(e) => setStartTime(parseDateTimeLocal(e.target.value))}
                  />
                </Field>

                <Field label="Notes">
                  <Textarea
                    rows={2}
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Optional notes…"
                  />
                </Field>

                <div className="flex items-center gap-2 pt-2">
                  <Button type="submit" size="sm" className="flex-1">
                    Start Session
                  </Button>
                  <Button type="button" size="sm" variant="outline" className="flex-1" onClick={() => setShowAddForm(false)}>
                    Cancel
                  </Button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showImportDialog && (
          <div className="fixed inset-0 z-[90] flex items-end sm:items-center justify-center">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-ink-950/80 backdrop-blur-sm"
              onClick={handleCancelImport}
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
                    <FileSpreadsheet size={16} className="text-brand-300" />
                    Import Excel Backup
                  </h2>
                  <p className="text-xs text-slate-400">Preview and confirm before importing</p>
                </div>
                <button
                  onClick={handleCancelImport}
                  className="h-8 w-8 flex items-center justify-center rounded-lg text-slate-400 hover:text-white hover:bg-white/[0.06]"
                >
                  <X size={16} />
                </button>
              </div>
              {!importPreview ? (
                <div className="p-4 space-y-4 text-center">
                  <div className="flex flex-col items-center gap-2 text-slate-400">
                    <FileSpreadsheet size={48} />
                    <p>Select an Excel file to preview</p>
                    <input
                      type="file"
                      accept=".xlsx,.xls"
                      className="hidden"
                      id="import-file-dialog"
                      onChange={handleImportFileChange}
                    />
                    <Button variant="outline" onClick={() => document.getElementById('import-file-dialog')?.click()} disabled={isImporting}>
                      <Upload size={14} className="mr-2" /> Choose File
                    </Button>
                  </div>
                  {importFile && (
                    <Button onClick={handlePreviewImport} disabled={isImporting} className="w-full">
                      {isImporting ? 'Previewing...' : 'Preview Import'}
                    </Button>
                  )}
                </div>
              ) : (
                <div className="p-4 space-y-4">
                  <div className="grid gap-2 sm:grid-cols-3 text-sm">
                    <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
                      <p className="text-[10px] font-semibold uppercase tracking-wider text-emerald-300">Valid Entries</p>
                      <p className="text-2xl font-bold text-emerald-200">{importPreview.validEntries.length}</p>
                    </div>
                    <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20">
                      <p className="text-[10px] font-semibold uppercase tracking-wider text-amber-300">Duplicates (skipped)</p>
                      <p className="text-2xl font-bold text-amber-200">{importPreview.duplicates.length}</p>
                    </div>
                    <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20">
                      <p className="text-[10px] font-semibold uppercase tracking-wider text-rose-300">Invalid Rows</p>
                      <p className="text-2xl font-bold text-rose-200">{importPreview.invalidRows.length}</p>
                    </div>
                  </div>

                  {importPreview.invalidRows.length > 0 && (
                    <div className="border border-rose-500/20 rounded-xl p-3 max-h-40 overflow-auto">
                      <p className="text-[10px] font-semibold uppercase tracking-wider text-rose-300 mb-2">Invalid Rows</p>
                      {importPreview.invalidRows.slice(0, 10).map((row, i) => (
                        <div key={i} className="text-xs text-rose-200 font-mono">
                          Row {row.row}: {row.error}
                        </div>
                      ))}
                      {importPreview.invalidRows.length > 10 && (
                        <p className="text-xs text-slate-500 mt-1">...and {importPreview.invalidRows.length - 10} more</p>
                      )}
                    </div>
                  )}

                  {importPreview.validEntries.length > 0 && (
                    <div className="border border-brand-500/20 rounded-xl p-3 max-h-60 overflow-auto">
                      <p className="text-[10px] font-semibold uppercase tracking-wider text-brand-300 mb-2">Entries to Import</p>
                      {importPreview.validEntries.slice(0, 20).map((entry, i) => (
                        <div key={i} className="flex items-center justify-between text-xs py-1 border-b border-white/[0.04] last:border-0">
                          <span className="text-white">{entry.customerName}</span>
                          <span className="text-slate-400">₹{entry.amount} · {entry.paymentStatus === 'paid' ? 'Paid' : 'Unpaid'}</span>
                        </div>
                      ))}
                      {importPreview.validEntries.length > 20 && (
                        <p className="text-xs text-slate-500 mt-1 text-center">...and {importPreview.validEntries.length - 20} more</p>
                      )}
                    </div>
                  )}

                  <div className="flex items-center gap-2 pt-2 border-t border-white/[0.06]">
                    <Button type="button" variant="outline" className="flex-1" onClick={handleCancelImport}>
                      Cancel
                    </Button>
                    <Button className="flex-1" onClick={handleConfirmImport} disabled={isImporting || importPreview.validEntries.length === 0}>
                      {isImporting ? 'Importing...' : 'Confirm Import'}
                    </Button>
                  </div>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showEditForm && editEntry && (
          <div className="fixed inset-0 z-[90] flex items-end sm:items-center justify-center">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-ink-950/80 backdrop-blur-sm"
              onClick={handleCancelEdit}
            />
            <motion.div
              initial={{ y: '100%', opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: '100%', opacity: 0 }}
              transition={{ type: 'spring', stiffness: 320, damping: 32 }}
              className="relative w-full sm:max-w-lg max-h-[90vh] overflow-auto rounded-t-2xl sm:rounded-2xl border border-white/10 bg-ink-900/95 shadow-2xl"
            >
              <div className="flex items-center justify-between px-4 py-3 border-b border-white/[0.06]">
                <div>
                  <h2 className="font-display text-sm font-bold text-white">Edit Customer Entry</h2>
                  <p className="text-xs text-slate-400">{editEntry.customerName} · ID: {editEntry.id.slice(-8)}</p>
                </div>
                <button
                  onClick={handleCancelEdit}
                  className="h-8 w-8 flex items-center justify-center rounded-lg text-slate-400 hover:text-white hover:bg-white/[0.06]"
                >
                  <X size={16} />
                </button>
              </div>
              <form onSubmit={handleEditSubmit} className="p-4 space-y-3">
                <Field label="Customer Name" required error={editNameError || undefined}>
                  <Input
                    value={editCustomerName}
                    onChange={(e) => setEditCustomerName(e.target.value)}
                    placeholder="e.g. Rahul Sharma"
                    autoFocus
                  />
                </Field>

                <Field label="Session Duration">
                  <Segmented
                    size="sm"
                    options={DURATION_OPTIONS.map((m) => ({ value: m, label: DURATION_LABELS[m] }))}
                    value={editDurationMinutes}
                    onChange={handleEditDurationChange}
                  />
                </Field>

                <Field label="Amount (₹)" required error={editAmountError || undefined}>
                  <Input
                    type="number"
                    value={editAmount}
                    onChange={(e) => {
                      setEditAmount(e.target.value.replace(/\D/g, ''))
                      setEditPriceOverride(true)
                    }}
                    placeholder="e.g. 150"
                    inputMode="numeric"
                  />
                </Field>

                <Field label="Total Payable (₹)" required error={editTotalError || undefined}>
                  <Input
                    type="number"
                    value={editTotalAmount}
                    onChange={(e) => setEditTotalAmount(e.target.value.replace(/\D/g, ''))}
                    placeholder="e.g. 190"
                    inputMode="numeric"
                  />
                </Field>

                <Field label="Amount Paid (₹)" required error={editPaidError || undefined}>
                  <Input
                    type="number"
                    value={editPaidAmount}
                    onChange={(e) => setEditPaidAmount(e.target.value.replace(/\D/g, ''))}
                    placeholder="e.g. 120"
                    inputMode="numeric"
                  />
                </Field>

                <Field label="Payment Status">
                  <Select
                    value={editPaymentStatus}
                    onChange={(e) => setEditPaymentStatus(e.target.value as 'paid' | 'unpaid')}
                  >
                    <option value="paid">Paid</option>
                    <option value="unpaid">Unpaid</option>
                  </Select>
                </Field>

                <Field label="Start Time">
                  <Input
                    type="datetime-local"
                    value={formatLocalDateTime(editStartTime)}
                    onChange={(e) => setEditStartTime(parseDateTimeLocal(e.target.value))}
                  />
                </Field>

                <Field label="End Time">
                  <Input
                    type="datetime-local"
                    value={formatLocalDateTime(editEndTime)}
                    onChange={(e) => setEditEndTime(parseDateTimeLocal(e.target.value))}
                  />
                </Field>

                <Field label="Session Status">
                  <Select
                    value={editSessionStatus}
                    onChange={(e) => setEditSessionStatus(e.target.value as 'active' | 'almost-over' | 'time-over' | 'completed')}
                  >
                    <option value="active">Active</option>
                    <option value="almost-over">Almost Over</option>
                    <option value="time-over">Time Over</option>
                    <option value="completed">Completed</option>
                  </Select>
                </Field>

                <Field label="Notes">
                  <Textarea
                    rows={2}
                    value={editNotes}
                    onChange={(e) => setEditNotes(e.target.value)}
                    placeholder="Optional notes…"
                  />
                </Field>

                <div className="flex items-center gap-2 pt-2">
                  <Button type="submit" size="sm" className="flex-1" disabled={isSaving}>
                    {isSaving ? 'Saving...' : 'Save Changes'}
                  </Button>
                  <Button type="button" size="sm" variant="outline" className="flex-1" onClick={handleCancelEdit}>
                    Cancel
                  </Button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Entries Table / Cards */}
      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between gap-3">
          <div className="relative w-full sm:w-80">
            <Search size={15} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
            <Input
              className="pl-9"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search customer name…"
            />
          </div>
          <div className="flex items-center gap-2">
            <Segmented
              size="sm"
              options={[
                { value: 'all', label: 'All' },
                { value: 'paid', label: 'Paid' },
                { value: 'unpaid', label: 'Unpaid' },
              ]}
              value={paymentFilter}
              onChange={setPaymentFilter}
            />
            <Segmented
              size="sm"
              options={[
                { value: 'all', label: 'All' },
                { value: 'active', label: 'Active' },
                { value: 'almost-over', label: 'Almost Over' },
                { value: 'time-over', label: 'Time Over' },
                { value: 'completed', label: 'Completed' },
              ]}
              value={statusFilter}
              onChange={setStatusFilter}
            />
          </div>
          <span className="ml-auto text-[11px] text-slate-500">
            {filtered.length} entr{filtered.length === 1 ? 'y' : 'ies'}
          </span>
        </div>

        <Card>
          {filtered.length === 0 ? (
            <div className="px-6 py-10 text-center">
              <p className="text-sm text-slate-500">No entries match your filters.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-white/[0.06]">
                    <th className="px-4 py-3 text-[10px] font-semibold uppercase tracking-wider text-slate-500">Customer</th>
                    <th className="px-4 py-3 text-[10px] font-semibold uppercase tracking-wider text-slate-500">Start</th>
                    <th className="px-4 py-3 text-[10px] font-semibold uppercase tracking-wider text-slate-500">End</th>
                    <th className="px-4 py-3 text-[10px] font-semibold uppercase tracking-wider text-slate-500">Duration</th>
                    <th className="px-4 py-3 text-[10px] font-semibold uppercase tracking-wider text-slate-500">Remaining</th>
                    <th className="px-4 py-3 text-[10px] font-semibold uppercase tracking-wider text-slate-500 text-right">Amount</th>
                    <th className="px-4 py-3 text-[10px] font-semibold uppercase tracking-wider text-slate-500">Payment</th>
                    <th className="px-4 py-3 text-[10px] font-semibold uppercase tracking-wider text-slate-500">Status</th>
                    <th className="px-4 py-3 text-[10px] font-semibold uppercase tracking-wider text-slate-500 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/[0.04]">
                  {filtered.map((entry) => {
                    const remaining = entry.endTime - now
                    const isOver = remaining <= 0
                    const isWarning = remaining > 0 && remaining <= 5 * 60_000
                    const status = entry.sessionStatus === 'completed' ? 'Completed' : isOver ? 'Time Over' : isWarning ? 'Almost Over' : 'Active'
                    return (
                      <tr key={entry.id} className="hover:bg-white/[0.02] transition group">
                        <td className="px-4 py-3">
                          <p className="text-sm font-medium text-white">{entry.customerName}</p>
                          <p className="text-[10px] text-slate-500">{dateKey(new Date(entry.createdAt))}</p>
                        </td>
                        <td className="px-4 py-3 text-sm text-slate-300">{formatClock(entry.startTime)}</td>
                        <td className="px-4 py-3 text-sm text-slate-300">{formatClock(entry.endTime)}</td>
                        <td className="px-4 py-3 text-sm text-slate-300">{humanDuration(entry.durationMinutes)}</td>
                        <td className="px-4 py-3">
                          <SessionTimer endTime={entry.endTime} showLabel={false} />
                        </td>
                        <td className="px-4 py-3 text-sm font-semibold text-white text-right">₹{entry.amount}</td>
                        <td className="px-4 py-3">
                          <PaymentBadge status={entry.paymentStatus} />
                        </td>
                        <td className="px-4 py-3">
                          <span className={cx('text-[10px] font-semibold uppercase', getStatusColor(entry.sessionStatus))}>
                            {status}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-right">
                          <div className="flex items-center gap-1">
                            <Button
                              size="xs"
                              variant="ghost"
                              onClick={() => handleEdit(entry)}
                              aria-label={`Edit ${entry.customerName}`}
                            >
                              <Edit size={12} className="text-brand-300 hover:text-white" />
                            </Button>
                            {entry.sessionStatus !== 'completed' && (
                              <>
                                <Button
                                  size="xs"
                                  variant="outline"
                                  onClick={() => updatePaymentStatus(entry.id, entry.paymentStatus === 'paid' ? 'unpaid' : 'paid')}
                                >
                                  {entry.paymentStatus === 'paid' ? 'Mark Unpaid' : 'Mark Paid'}
                                </Button>
                                <Button
                                  size="xs"
                                  variant="secondary"
                                  onClick={() => handleExtend(entry.id, 30)}
                                >
                                  +30 min
                                </Button>
                                {entry.sessionStatus === 'active' || entry.sessionStatus === 'time-over' ? (
                                  <Button
                                    size="xs"
                                    variant="primary"
                                    onClick={() => handleRenew(entry)}
                                    className="bg-amber-500 hover:bg-amber-400 text-ink-950"
                                  >
                                    <RotateCcw size={12} className="mr-1" /> Renew ₹70
                                  </Button>
                                ) : null}
                              </>
                            )}
                            <Button
                              size="xs"
                              variant={entry.sessionStatus === 'completed' ? 'ghost' : 'danger'}
                              onClick={() => handleEnd(entry.id)}
                              disabled={entry.sessionStatus === 'completed'}
                            >
                              {entry.sessionStatus === 'completed' ? 'Completed' : 'End Session'}
                            </Button>
                            <Button
                              size="xs"
                              variant="ghost"
                              onClick={() => setDeleteTarget(entry.id)}
                              aria-label={`Delete ${entry.customerName}`}
                            >
                              <Trash2 size={12} className="text-rose-300" />
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
        </Card>
      </div>

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        onConfirm={() => {
          if (deleteTarget) handleDelete(deleteTarget)
        }}
        title="Delete Entry?"
        message="This will remove the customer entry from today's records."
        confirmLabel="Delete"
        cancelLabel="Keep"
      />

      <ConfirmDialog
        open={Boolean(renewTarget)}
        onClose={() => setRenewTarget(null)}
        onConfirm={handleConfirmRenew}
        title="Confirm Renewal"
        message={
          renewTarget && (
            <div className="space-y-2 text-sm">
              <p>Customer: <span className="font-semibold text-white">{renewTarget.customerName}</span></p>
              <p>Current Status: <span className="font-semibold text-amber-300">{renewTarget.sessionStatus === 'time-over' ? 'Time Over' : 'Active'}</span></p>
              <p>Additional Time: <span className="font-semibold text-white">30 minutes</span></p>
              <p>Additional Charge: <span className="font-semibold text-white">₹70</span></p>
              <p>
                New End Time:{' '}
                <span className="font-semibold text-white">
                  {new Date(
                    renewTarget.endTime > Date.now()
                      ? renewTarget.endTime + RENEWAL_MINUTES * 60_000
                      : Date.now() + RENEWAL_MINUTES * 60_000
                  ).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                </span>
              </p>
              <p>
                Current Payment: <span className="font-semibold">{renewTarget.paymentStatus === 'paid' ? 'Paid' : 'Unpaid'}</span>
              </p>
              <p className="text-xs text-slate-400 mt-2">
                The ₹70 renewal charge will be added to the total amount. Payment for the renewal must be collected separately.
              </p>
            </div>
          )
        }
        confirmLabel="Confirm Renewal"
        cancelLabel="Cancel"
      />
    </div>
  )
}