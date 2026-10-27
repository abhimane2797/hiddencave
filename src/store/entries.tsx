import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from 'react'
import type { Entry, DayCloseRecord, BackupRecord, PaymentRecord, DayCloseStatus, ClosingMethod, RolloverStatus, RolloverState } from '@/types'
import { currentPersonPrice, baseHourlyPrice, sessionPrice, RENEWAL_CHARGE, RENEWAL_MINUTES } from '@/config/pricing'
import {
  getAllEntries,
  saveEntries as saveEntriesIDB,
  deleteEntry as deleteEntryIDB,
  migrateFromLocalStorage,
  isMigrationComplete,
  getLastBackupMetadata,
  saveDayClose,
  getDayCloseByDate,
  getAllDayCloses,
  getLatestDayClose,
  saveBackup,
  getAllBackups,
  getLatestBackup,
  saveRollover,
  getLatestRollover,
  getRolloverByBusinessDate,
} from '@/lib/idb'
import { exportEntriesToExcel, exportTodayEntriesToExcel, previewImportFromExcel, importEntriesToDB } from '@/lib/excel'
import {
  getKolkataDateKey,
  getPreviousBusinessDate,
  formatKolkataDateTime,
  getNextMidnightKolkata,
} from '@/lib/timezone'

export interface EntryState {
  entries: Entry[]
  muted: boolean
  soundUnlocked: boolean
  loading: boolean
  migrationComplete: boolean
  lastBackup: { timestamp: number; count: number } | null
  // Day Close
  dayCloseStatus: DayCloseStatus
  currentDayClose: DayCloseRecord | null
  dayCloseHistory: DayCloseRecord[]
  // Rollover
  rolloverStatus: RolloverStatus
  currentRollover: RolloverState | null
  rolloverWarning: string | null
  // Backups
  backupHistory: BackupRecord[]
  latestBackup: BackupRecord | null
  backupInProgress: boolean
  // Actions
  addEntry: (input: NewEntryInput) => void
  updateEntry: (id: string, input: Partial<NewEntryInput> & { sessionStatus?: Entry['sessionStatus']; totalAmount?: number; paidAmount?: number }) => void
  updatePaymentStatus: (id: string, status: 'paid' | 'unpaid') => void
  recordPayment: (id: string, amount: number, method?: 'cash' | 'upi' | 'card', note?: string) => void
  recordRenewalPayment: (id: string, amount: number) => void
  extendSession: (id: string, minutes: number) => void
  renewSession: (id: string) => void
  endSession: (id: string) => void
  deleteEntry: (id: string) => void
  setMuted: (muted: boolean) => void
  setSoundUnlocked: () => void
  todayEntries: () => Entry[]
  stats: () => {
    todayCustomers: number
    activeSessions: number
    completedSessions: number
    timeOverSessions: number
    moneyCollected: number
    pendingPayments: number
    availableNow: number
    perPersonPrice: number
  }
  exportAll: () => void
  exportToday: () => void
  previewImport: (file: File) => Promise<ImportPreview>
  confirmImport: (preview: ImportPreview) => Promise<ImportResult>
  refreshEntries: () => Promise<void>
  // Day Close actions
  performDayClose: () => Promise<{ success: boolean; error?: string; dayClose?: DayCloseRecord }>
  // Rollover actions
  checkMidnightRollover: () => Promise<{ rolloverNeeded: boolean; alreadyClosed: boolean; error?: string }>
  performAutoDayClose: () => Promise<{ success: boolean; error?: string; dayClose?: DayCloseRecord; backup?: BackupRecord }>
  retryRolloverBackup: () => Promise<{ success: boolean; error?: string }>
  // Backup actions
  createBackup: (dayClose: DayCloseRecord) => Promise<{ success: boolean; error?: string; backup?: BackupRecord }>
  downloadBackup: (backup: BackupRecord) => void
  retryBackup: (dayClose: DayCloseRecord) => Promise<void>
}

export interface NewEntryInput {
  customerName: string
  durationMinutes: number
  amount: number
  paymentStatus: 'paid' | 'unpaid'
  startTime?: number
  notes?: string
}

export interface ImportPreview {
  validEntries: Entry[]
  invalidRows: Array<{ row: number; error: string; data: any }>
  duplicates: Entry[]
  totalRows: number
}

export interface ImportResult {
  imported: number
  skipped: number
  errors: string[]
}

export const DURATION_OPTIONS = [30, 45, 60, 90, 120]

const now = () => Date.now()

const computeStatus = (entry: Entry, warningMinutes = 5): Entry['sessionStatus'] => {
  if (entry.sessionStatus === 'completed') return 'completed'
  const remaining = entry.endTime - now()
  if (remaining <= 0) return 'time-over'
  if (remaining <= warningMinutes * 60_000) return 'almost-over'
  return 'active'
}

const formatDateKey = (date = new Date()) => {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
}

const EntryContext = createContext<EntryState | null>(null)

export function EntryProvider({ children }: { children: ReactNode }) {
  const [entries, setEntries] = useState<Entry[]>([])
  const [muted, setMuted] = useState(false)
  const [soundUnlocked, setSoundUnlocked] = useState(false)
  const [loading, setLoading] = useState(true)
  const [migrationComplete, setMigrationComplete] = useState(false)
  const [lastBackup, setLastBackup] = useState<{ timestamp: number; count: number } | null>(null)

  // Day Close state
  const [dayCloseStatus, setDayCloseStatus] = useState<DayCloseStatus>('open')
  const [currentDayClose, setCurrentDayClose] = useState<DayCloseRecord | null>(null)
  const [dayCloseHistory, setDayCloseHistory] = useState<DayCloseRecord[]>([])

  // Rollover state
  const [rolloverStatus, setRolloverStatus] = useState<RolloverStatus>('not_needed')
  const [currentRollover, setCurrentRollover] = useState<RolloverState | null>(null)
  const [rolloverWarning, setRolloverWarning] = useState<string | null>(null)

  // Backup state
  const [backupHistory, setBackupHistory] = useState<BackupRecord[]>([])
  const [latestBackup, setLatestBackup] = useState<BackupRecord | null>(null)
  const [backupInProgress, setBackupInProgress] = useState(false)

  useEffect(() => {
    async function init() {
      setLoading(true)
      try {
        const migrated = await migrateFromLocalStorage()
        if (migrated > 0) {
          console.log(`Migrated ${migrated} entries from localStorage to IndexedDB`)
        }
        const loaded = await getAllEntries()
        setEntries(loaded)
        const backup = await getLastBackupMetadata()
        if (backup) {
          setLastBackup({ timestamp: backup.timestamp, count: backup.entryCount })
        }
        // Load Day Close history
        const dayCloses = await getAllDayCloses()
        setDayCloseHistory(dayCloses)
        // Check today's day close status
        const today = getKolkataDateKey()
        const todayDayClose = await getDayCloseByDate(today)
        if (todayDayClose) {
          setCurrentDayClose(todayDayClose)
          setDayCloseStatus(todayDayClose.status)
        }
        // Load backup history
        const backups = await getAllBackups()
        setBackupHistory(backups)
        const latest = await getLatestBackup()
        if (latest) {
          setLatestBackup(latest)
        }
        // Load rollover state
        const rollover = await getLatestRollover()
        if (rollover) {
          setCurrentRollover(rollover)
          setRolloverStatus(rollover.rolloverStatus)
          if (rollover.rolloverStatus === 'backup_pending') {
            setRolloverWarning('Previous day backup failed. Please retry.')
          }
        }
        setMigrationComplete(true)
      } catch (err) {
        console.error('Failed to initialize storage:', err)
      } finally {
        setLoading(false)
      }
    }
    init()
  }, [])

  const refreshEntries = useCallback(async () => {
    try {
      const loaded = await getAllEntries()
      setEntries(loaded)
      const backup = await getLastBackupMetadata()
      if (backup) {
        setLastBackup({ timestamp: backup.timestamp, count: backup.entryCount })
      }
    } catch (err) {
      console.error('Failed to refresh entries:', err)
    }
  }, [])

  const persistEntries = useCallback(async (newEntries: Entry[]) => {
    try {
      await saveEntriesIDB(newEntries)
    } catch (err) {
      console.error('Failed to save entries:', err)
    }
  }, [])

  useEffect(() => {
    if (!loading && migrationComplete) {
      persistEntries(entries)
    }
  }, [entries, loading, migrationComplete, persistEntries])

  const addEntry = useCallback((input: NewEntryInput) => {
    const startTime = input.startTime ?? now()
    const endTime = startTime + input.durationMinutes * 60_000
    const hourlyRate = baseHourlyPrice(new Date(startTime))
    const calculatedAmount = sessionPrice(input.durationMinutes, hourlyRate)
    const entry: Entry = {
      id: `entry-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
      customerName: input.customerName.trim(),
      startTime,
      endTime,
      durationMinutes: input.durationMinutes,
      amount: calculatedAmount,
      totalAmount: calculatedAmount,
      paidAmount: input.paymentStatus === 'paid' ? calculatedAmount : 0,
      paymentStatus: input.paymentStatus,
      sessionStatus: 'active',
      notes: input.notes?.trim() || undefined,
      createdAt: startTime,
      updatedAt: startTime,
      hourlyRate,
      renewals: [],
    }
    setEntries((prev) => [entry, ...prev])
  }, [])

  const updatePaymentStatus = useCallback((id: string, status: 'paid' | 'unpaid') => {
    setEntries((prev) =>
      prev.map((e) => {
        if (e.id !== id) return e
        const paidAmount = status === 'paid' ? (e.totalAmount ?? e.amount) : 0
        return { ...e, paymentStatus: status, paidAmount, updatedAt: now() }
      })
    )
  }, [])

  const recordPayment = useCallback((id: string, amount: number, method?: 'cash' | 'upi' | 'card', note?: string) => {
    setEntries((prev) =>
      prev.map((e) => {
        if (e.id !== id) return e
        const newPaidAmount = Math.min((e.paidAmount ?? 0) + amount, e.totalAmount ?? e.amount)
        const newStatus = newPaidAmount >= (e.totalAmount ?? e.amount) ? 'paid' : 'unpaid'
        return { ...e, paidAmount: newPaidAmount, paymentStatus: newStatus, updatedAt: now() }
      })
    )
  }, [])

  const recordRenewalPayment = useCallback((id: string, amount: number) => {
    setEntries((prev) =>
      prev.map((e) => {
        if (e.id !== id) return e
        const newPaidAmount = Math.min((e.paidAmount ?? 0) + amount, e.totalAmount ?? e.amount)
        const newStatus = newPaidAmount >= (e.totalAmount ?? e.amount) ? 'paid' : 'unpaid'
        return { ...e, paidAmount: newPaidAmount, paymentStatus: newStatus, updatedAt: now() }
      })
    )
  }, [])

  const extendSession = useCallback((id: string, minutes: number) => {
    setEntries((prev) =>
      prev.map((e) => {
        if (e.id === id && e.sessionStatus !== 'completed') {
          const newEnd = now() + minutes * 60_000
          return { ...e, endTime: newEnd, sessionStatus: 'active' as const, updatedAt: now() }
        }
        return e
      })
    )
  }, [])

  const renewSession = useCallback((id: string) => {
    const currentTime = now()

    setEntries((prev) =>
      prev.map((e) => {
        if (e.id !== id || e.sessionStatus === 'completed') return e

        const isExpired = e.endTime <= currentTime
        const newEndTime = isExpired
          ? currentTime + RENEWAL_MINUTES * 60_000
          : e.endTime + RENEWAL_MINUTES * 60_000

        const renewal = {
          id: `renewal-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
          timestamp: currentTime,
          addedMinutes: RENEWAL_MINUTES,
          charge: RENEWAL_CHARGE,
          paymentStatus: 'unpaid' as const,
          previousEndTime: e.endTime,
        }

        const newTotalAmount = (e.totalAmount ?? e.amount) + RENEWAL_CHARGE

        return {
          ...e,
          endTime: newEndTime,
          totalAmount: newTotalAmount,
          sessionStatus: 'active' as const,
          updatedAt: currentTime,
          renewals: [...(e.renewals ?? []), renewal],
        }
      })
    )
  }, [])

  const endSession = useCallback((id: string) => {
    setEntries((prev) =>
      prev.map((e) => (e.id === id ? { ...e, sessionStatus: 'completed' as const, updatedAt: now() } : e))
    )
  }, [])

  const deleteEntry = useCallback(async (id: string) => {
    setEntries((prev) => prev.filter((e) => e.id !== id))
    await deleteEntryIDB(id)
  }, [])

  const updateEntry = useCallback((id: string, input: Partial<NewEntryInput> & { sessionStatus?: Entry['sessionStatus']; totalAmount?: number; paidAmount?: number }) => {
    setEntries((prev) =>
      prev.map((e) => {
        if (e.id !== id) return e
        const updated = { ...e, ...input, updatedAt: now() }
        if (input.startTime !== undefined || input.durationMinutes !== undefined) {
          const start = input.startTime ?? e.startTime
          const duration = input.durationMinutes ?? e.durationMinutes
          updated.endTime = start + duration * 60_000
          updated.durationMinutes = duration
          updated.startTime = start
        }
        if (e.sessionStatus !== 'completed' && (input.startTime !== undefined || input.durationMinutes !== undefined || input.sessionStatus !== undefined)) {
          const statusToUse = input.sessionStatus ?? computeStatus(updated)
          updated.sessionStatus = statusToUse
        } else if (input.sessionStatus !== undefined) {
          updated.sessionStatus = input.sessionStatus
        }
        return updated
      })
    )
  }, [])

  const todayEntries = useCallback(() => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const todayStart = today.getTime()
    today.setHours(23, 59, 59, 999)
    const todayEnd = today.getTime()
    return entries.filter((e) => e.createdAt >= todayStart && e.createdAt <= todayEnd)
  }, [entries])

  const stats = useCallback(() => {
    const today = todayEntries()
    const active = today.filter((e) => computeStatus(e) === 'active').length
    const completed = today.filter((e) => e.sessionStatus === 'completed').length
    const timeOver = today.filter((e) => computeStatus(e) === 'time-over').length
    const moneyCollected = today
      .reduce((sum, e) => sum + (e.paidAmount ?? (e.paymentStatus === 'paid' ? e.amount : 0)), 0)
    const pendingPayments = today
      .reduce((sum, e) => sum + Math.max(0, (e.totalAmount ?? e.amount) - (e.paidAmount ?? (e.paymentStatus === 'paid' ? e.amount : 0))), 0)
    const price = currentPersonPrice()
    const availableNow = Math.max(0, 10 - today.length)
    return {
      todayCustomers: today.length,
      activeSessions: active,
      completedSessions: completed,
      timeOverSessions: timeOver,
      moneyCollected,
      pendingPayments,
      availableNow,
      perPersonPrice: price.price,
    }
  }, [todayEntries])

  // Day Close function
  const performDayClose = useCallback(async () => {
    const today = formatDateKey()
    
    // Check if already closed
    const existing = await getDayCloseByDate(today)
    if (existing && existing.status === 'closed') {
      return { success: false, error: 'Day already closed. Cannot close again.' }
    }

    setDayCloseStatus('pending')

    try {
      const todayEntriesList = todayEntries()
      const currentTime = now()

      // Calculate summary
      const totalSessions = todayEntriesList.length
      const activeSessions = todayEntriesList.filter((e) => computeStatus(e) === 'active').length
      const completedSessions = todayEntriesList.filter((e) => e.sessionStatus === 'completed').length
      const timeOverSessions = todayEntriesList.filter((e) => computeStatus(e) === 'time-over').length

      const totalPayable = todayEntriesList.reduce((sum, e) => sum + (e.totalAmount ?? e.amount), 0)
      const totalCollected = todayEntriesList.reduce((sum, e) => sum + (e.paidAmount ?? (e.paymentStatus === 'paid' ? e.amount : 0)), 0)
      const totalPending = totalPayable - totalCollected

      const renewalCount = todayEntriesList.reduce((sum, e) => sum + (e.renewals?.length ?? 0), 0)
      const renewalCharges = todayEntriesList.reduce((sum, e) => sum + (e.renewals?.reduce((s, r) => s + r.charge, 0) ?? 0), 0)
      const renewalCollected = todayEntriesList.reduce((sum, e) => sum + (e.renewals?.filter(r => r.paymentStatus === 'paid').reduce((s, r) => s + r.charge, 0) ?? 0), 0)
      const renewalPending = renewalCharges - renewalCollected

      // Build payment records from today's entries
      const payments: PaymentRecord[] = todayEntriesList.flatMap((e) => {
        const paid = e.paidAmount ?? (e.paymentStatus === 'paid' ? e.amount : 0)
        if (paid > 0) {
          return [{
            id: `payment-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
            entryId: e.id,
            customerName: e.customerName,
            amount: paid,
            timestamp: e.updatedAt ?? e.createdAt,
            method: undefined,
            note: e.notes,
          }]
        }
        return []
      })

      // Create day close record
      const dayClose: DayCloseRecord = {
        id: `dayclose-${today}`,
        businessDate: today,
        closedAt: currentTime,
        closedBy: 'Operator',
        status: 'closed',
        totalSessions,
        activeSessions,
        completedSessions,
        timeOverSessions,
        totalPayable,
        totalCollected,
        totalPending,
        renewalCount,
        renewalCharges,
        renewalCollected,
        renewalPending,
        sessions: todayEntriesList.map(e => ({ ...e })),
        payments,
        createdAt: currentTime,
        updatedAt: currentTime,
      }

      await saveDayClose(dayClose)
      setCurrentDayClose(dayClose)
      setDayCloseStatus('closed')
      setDayCloseHistory((prev) => {
        const filtered = prev.filter(d => d.businessDate !== today)
        return [dayClose, ...filtered].sort((a, b) => b.closedAt - a.closedAt)
      })

      // Automatically create backup after successful day close
      const backupResult = await createBackupInternal(dayClose)
      if (!backupResult.success) {
        console.error('Auto backup failed after day close:', backupResult.error)
        // Don't fail day close if backup fails, just report
        return { success: true, error: `Day closed but backup failed: ${backupResult.error}`, dayClose }
      }

      return { success: true, dayClose }
    } catch (err) {
      setDayCloseStatus('open')
      return { success: false, error: err instanceof Error ? err.message : 'Failed to close day' }
    }
  }, [entries])

  // Internal backup creation
  const createBackupInternal = async (dayClose: DayCloseRecord): Promise<{ success: boolean; error?: string; backup?: BackupRecord }> => {
    setBackupInProgress(true)
    try {
      const currentTime = now()
      const businessDate = dayClose.businessDate
      const backupVersion = 1

      // Check if backup already exists for this day close
      const existingBackups = await getAllBackups()
      const existingForDayClose = existingBackups.find(b => b.dayCloseId === dayClose.id)
      if (existingForDayClose && existingForDayClose.status !== 'failed') {
        return { success: false, error: 'Backup already exists for this day close' }
      }

      // Create backup record
      const backup: BackupRecord = {
        id: `backup-${businessDate}-${currentTime}`,
        businessDate,
        dayCloseId: dayClose.id,
        backupVersion,
        createdAt: currentTime,
        status: 'saved',
        entryCount: dayClose.sessions.length,
        dayCloseSummary: {
          totalSessions: dayClose.totalSessions,
          totalPayable: dayClose.totalPayable,
          totalCollected: dayClose.totalCollected,
          totalPending: dayClose.totalPending,
        },
      }

      await saveBackup(backup)
      setBackupHistory((prev) => [backup, ...prev].sort((a, b) => b.createdAt - a.createdAt))
      setLatestBackup(backup)

      return { success: true, backup }
    } catch (err) {
      return { success: false, error: err instanceof Error ? err.message : 'Failed to create backup' }
    } finally {
      setBackupInProgress(false)
    }
  }

  const createBackup = useCallback(async (dayClose: DayCloseRecord) => {
    return createBackupInternal(dayClose)
  }, [])

  const downloadBackup = useCallback((backup: BackupRecord) => {
    // Create the full backup data
    const dayClose = dayCloseHistory.find(d => d.id === backup.dayCloseId)
    const backupData = {
      backupVersion: backup.backupVersion,
      businessName: 'Hidden Cave Gaming Zone',
      businessDate: backup.businessDate,
      createdAt: new Date(backup.createdAt).toISOString(),
      dayClose: dayClose ? {
        ...dayClose,
        sessions: dayClose.sessions,
        payments: dayClose.payments,
      } : null,
      dailySummary: backup.dayCloseSummary,
    }

    const blob = new Blob([JSON.stringify(backupData, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `HiddenCave_DailyBackup_${backup.businessDate}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)

    // Update backup status
    const updatedBackup = { ...backup, status: 'downloaded' as const, fileName: `HiddenCave_DailyBackup_${backup.businessDate}.json`, fileSize: blob.size }
    saveBackup(updatedBackup)
    setBackupHistory((prev) => prev.map(b => b.id === backup.id ? updatedBackup : b))
    if (latestBackup?.id === backup.id) {
      setLatestBackup(updatedBackup)
    }
  }, [dayCloseHistory])

  const retryBackup = useCallback(async (dayClose: DayCloseRecord) => {
    const result = await createBackupInternal(dayClose)
    if (!result.success) {
      throw new Error(result.error || 'Retry failed')
    }
  }, [])

  const exportAll = useCallback(() => {
    exportEntriesToExcel(entries)
  }, [entries])

  const exportToday = useCallback(() => {
    exportTodayEntriesToExcel(entries)
  }, [entries])

  const previewImport = useCallback(async (file: File) => {
    const preview = await previewImportFromExcel(file, entries)
    return preview
  }, [entries])

  const confirmImport = useCallback(async (preview: ImportPreview) => {
    const result = await importEntriesToDB(preview.validEntries, entries)
    if (result.imported > 0) {
      await refreshEntries()
    }
    return result
  }, [entries, refreshEntries])

  const value: EntryState = {
    entries,
    muted,
    soundUnlocked,
    loading,
    migrationComplete,
    lastBackup,
    dayCloseStatus,
    currentDayClose,
    dayCloseHistory,
    rolloverStatus,
    currentRollover,
    rolloverWarning,
    backupHistory,
    latestBackup,
    backupInProgress,
    addEntry,
    updateEntry,
    updatePaymentStatus,
    recordPayment,
    recordRenewalPayment,
    extendSession,
    renewSession,
    endSession,
    deleteEntry,
    setMuted: (m) => setMuted(m),
    setSoundUnlocked: () => setSoundUnlocked(true),
    todayEntries,
    stats,
    exportAll,
    exportToday,
    previewImport,
    confirmImport,
    refreshEntries,
    performDayClose,
    checkMidnightRollover: async () => ({ rolloverNeeded: false, alreadyClosed: false }),
    performAutoDayClose: async () => ({ success: false, error: 'Not implemented' }),
    retryRolloverBackup: async () => ({ success: false, error: 'Not implemented' }),
    createBackup,
    downloadBackup,
    retryBackup,
  }

  return <EntryContext.Provider value={value}>{children}</EntryContext.Provider>
}

export function useEntries() {
  const ctx = useContext(EntryContext)
  if (!ctx) throw new Error('useEntries must be used inside EntryProvider')
  return ctx
}