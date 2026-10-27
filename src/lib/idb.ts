import type { Entry, DayCloseRecord, BackupRecord, RolloverState } from '@/types'

export type StoredEntry = Entry

export interface BackupMetadata {
  id: string
  timestamp: number
  entryCount: number
  dateRange: { start: number; end: number }
}

const DB_NAME = 'HiddenCaveGamingZone'
const DB_VERSION = 3
const ENTRIES_STORE = 'entries'
const METADATA_STORE = 'metadata'
const DAY_CLOSE_STORE = 'dayClose'
const BACKUP_STORE = 'backups'
const ROLLOVER_STORE = 'rollover'

let dbPromise: Promise<IDBDatabase> | null = null

function initDB(): Promise<IDBDatabase> {
  if (dbPromise) return dbPromise

  dbPromise = new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION)

    request.onerror = () => reject(request.error)
    request.onsuccess = () => resolve(request.result)

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result

      if (!db.objectStoreNames.contains(ENTRIES_STORE)) {
        const store = db.createObjectStore(ENTRIES_STORE, { keyPath: 'id' })
        store.createIndex('createdAt', 'createdAt', { unique: false })
        store.createIndex('sessionStatus', 'sessionStatus', { unique: false })
      }

      if (!db.objectStoreNames.contains(METADATA_STORE)) {
        db.createObjectStore(METADATA_STORE, { keyPath: 'id' })
      }

      if (!db.objectStoreNames.contains(DAY_CLOSE_STORE)) {
        const store = db.createObjectStore(DAY_CLOSE_STORE, { keyPath: 'id' })
        store.createIndex('businessDate', 'businessDate', { unique: true })
        store.createIndex('status', 'status', { unique: false })
      }

      if (!db.objectStoreNames.contains(BACKUP_STORE)) {
        const store = db.createObjectStore(BACKUP_STORE, { keyPath: 'id' })
        store.createIndex('businessDate', 'businessDate', { unique: false })
        store.createIndex('dayCloseId', 'dayCloseId', { unique: false })
        store.createIndex('status', 'status', { unique: false })
      }

      if (!db.objectStoreNames.contains(ROLLOVER_STORE)) {
        const store = db.createObjectStore(ROLLOVER_STORE, { keyPath: 'id' })
        store.createIndex('businessDate', 'businessDate', { unique: false })
        store.createIndex('previousBusinessDate', 'previousBusinessDate', { unique: false })
        store.createIndex('rolloverStatus', 'rolloverStatus', { unique: false })
      }
    }
  })

  return dbPromise
}

export async function getAllEntries(): Promise<StoredEntry[]> {
  const db = await initDB()
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(ENTRIES_STORE, 'readonly')
    const store = transaction.objectStore(ENTRIES_STORE)
    const request = store.getAll()
    request.onsuccess = () => resolve(request.result)
    request.onerror = () => reject(request.error)
  })
}

export async function saveEntry(entry: StoredEntry): Promise<void> {
  const db = await initDB()
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(ENTRIES_STORE, 'readwrite')
    const store = transaction.objectStore(ENTRIES_STORE)
    const request = store.put(entry)
    request.onsuccess = () => resolve()
    request.onerror = () => reject(request.error)
  })
}

export async function saveEntries(entries: StoredEntry[]): Promise<void> {
  const db = await initDB()
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(ENTRIES_STORE, 'readwrite')
    const store = transaction.objectStore(ENTRIES_STORE)
    let completed = 0
    const total = entries.length

    if (total === 0) {
      resolve()
      return
    }

    for (const entry of entries) {
      const request = store.put(entry)
      request.onsuccess = () => {
        completed++
        if (completed === total) resolve()
      }
      request.onerror = () => reject(request.error)
    }
  })
}

export async function deleteEntry(id: string): Promise<void> {
  const db = await initDB()
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(ENTRIES_STORE, 'readwrite')
    const store = transaction.objectStore(ENTRIES_STORE)
    const request = store.delete(id)
    request.onsuccess = () => resolve()
    request.onerror = () => reject(request.error)
  })
}

export async function clearAllEntries(): Promise<void> {
  const db = await initDB()
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(ENTRIES_STORE, 'readwrite')
    const store = transaction.objectStore(ENTRIES_STORE)
    const request = store.clear()
    request.onsuccess = () => resolve()
    request.onerror = () => reject(request.error)
  })
}

export async function getEntry(id: string): Promise<StoredEntry | undefined> {
  const db = await initDB()
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(ENTRIES_STORE, 'readonly')
    const store = transaction.objectStore(ENTRIES_STORE)
    const request = store.get(id)
    request.onsuccess = () => resolve(request.result)
    request.onerror = () => reject(request.error)
  })
}

// Day Close functions
export async function saveDayClose(record: DayCloseRecord): Promise<void> {
  const db = await initDB()
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(DAY_CLOSE_STORE, 'readwrite')
    const store = transaction.objectStore(DAY_CLOSE_STORE)
    const request = store.put(record)
    request.onsuccess = () => resolve()
    request.onerror = () => reject(request.error)
  })
}

export async function getDayCloseByDate(businessDate: string): Promise<DayCloseRecord | undefined> {
  const db = await initDB()
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(DAY_CLOSE_STORE, 'readonly')
    const store = transaction.objectStore(DAY_CLOSE_STORE)
    const index = store.index('businessDate')
    const request = index.get(businessDate)
    request.onsuccess = () => resolve(request.result)
    request.onerror = () => reject(request.error)
  })
}

export async function getAllDayCloses(): Promise<DayCloseRecord[]> {
  const db = await initDB()
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(DAY_CLOSE_STORE, 'readonly')
    const store = transaction.objectStore(DAY_CLOSE_STORE)
    const request = store.getAll()
    request.onsuccess = () => resolve(request.result)
    request.onerror = () => reject(request.error)
  })
}

export async function getLatestDayClose(): Promise<DayCloseRecord | undefined> {
  const db = await initDB()
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(DAY_CLOSE_STORE, 'readonly')
    const store = transaction.objectStore(DAY_CLOSE_STORE)
    const request = store.getAll()
    request.onsuccess = () => {
      const all = request.result as DayCloseRecord[]
      if (all.length === 0) {
        resolve(undefined)
        return
      }
      all.sort((a, b) => b.closedAt - a.closedAt)
      resolve(all[0])
    }
    request.onerror = () => reject(request.error)
  })
}

// Backup functions
export async function saveBackup(record: BackupRecord): Promise<void> {
  const db = await initDB()
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(BACKUP_STORE, 'readwrite')
    const store = transaction.objectStore(BACKUP_STORE)
    const request = store.put(record)
    request.onsuccess = () => resolve()
    request.onerror = () => reject(request.error)
  })
}

export async function getBackupsByDayClose(dayCloseId: string): Promise<BackupRecord[]> {
  const db = await initDB()
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(BACKUP_STORE, 'readonly')
    const store = transaction.objectStore(BACKUP_STORE)
    const index = store.index('dayCloseId')
    const request = index.getAll(dayCloseId)
    request.onsuccess = () => resolve(request.result)
    request.onerror = () => reject(request.error)
  })
}

export async function getAllBackups(): Promise<BackupRecord[]> {
  const db = await initDB()
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(BACKUP_STORE, 'readonly')
    const store = transaction.objectStore(BACKUP_STORE)
    const request = store.getAll()
    request.onsuccess = () => {
      const all = request.result as BackupRecord[]
      all.sort((a, b) => b.createdAt - a.createdAt)
      resolve(all)
    }
    request.onerror = () => reject(request.error)
  })
}

export async function getLatestBackup(): Promise<BackupRecord | undefined> {
  const db = await initDB()
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(BACKUP_STORE, 'readonly')
    const store = transaction.objectStore(BACKUP_STORE)
    const request = store.getAll()
    request.onsuccess = () => {
      const all = request.result as BackupRecord[]
      if (all.length === 0) {
        resolve(undefined)
        return
      }
      all.sort((a, b) => b.createdAt - a.createdAt)
      resolve(all[0])
    }
    request.onerror = () => reject(request.error)
  })
}

export async function getBackupsByDate(businessDate: string): Promise<BackupRecord[]> {
  const db = await initDB()
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(BACKUP_STORE, 'readonly')
    const store = transaction.objectStore(BACKUP_STORE)
    const index = store.index('businessDate')
    const request = index.getAll(businessDate)
    request.onsuccess = () => {
      const all = request.result as BackupRecord[]
      all.sort((a, b) => b.createdAt - a.createdAt)
      resolve(all)
    }
    request.onerror = () => reject(request.error)
  })
}

// Rollover functions
export async function saveRollover(rollover: RolloverState): Promise<void> {
  const db = await initDB()
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(ROLLOVER_STORE, 'readwrite')
    const store = transaction.objectStore(ROLLOVER_STORE)
    const request = store.put(rollover)
    request.onsuccess = () => resolve()
    request.onerror = () => reject(request.error)
  })
}

export async function getLatestRollover(): Promise<RolloverState | undefined> {
  const db = await initDB()
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(ROLLOVER_STORE, 'readonly')
    const store = transaction.objectStore(ROLLOVER_STORE)
    const request = store.getAll()
    request.onsuccess = () => {
      const all = request.result as RolloverState[]
      if (all.length === 0) {
        resolve(undefined)
        return
      }
      all.sort((a, b) => b.updatedAt - a.updatedAt)
      resolve(all[0])
    }
    request.onerror = () => reject(request.error)
  })
}

export async function getRolloverByBusinessDate(businessDate: string): Promise<RolloverState | undefined> {
  const db = await initDB()
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(ROLLOVER_STORE, 'readonly')
    const store = transaction.objectStore(ROLLOVER_STORE)
    const index = store.index('businessDate')
    const request = index.get(businessDate)
    request.onsuccess = () => resolve(request.result)
    request.onerror = () => reject(request.error)
  })
}

const MIGRATION_KEY = 'hcgz-migration-complete'

export function isMigrationComplete(): boolean {
  try {
    return localStorage.getItem(MIGRATION_KEY) === 'true'
  } catch {
    return false
  }
}

export function setMigrationComplete(): void {
  try {
    localStorage.setItem(MIGRATION_KEY, 'true')
  } catch {
    // ignore
  }
}

export async function migrateFromLocalStorage(): Promise<number> {
  if (isMigrationComplete()) return 0

  try {
    const raw = localStorage.getItem('hcgz-entries')
    if (!raw) {
      setMigrationComplete()
      return 0
    }

    const parsed = JSON.parse(raw)
    if (!Array.isArray(parsed) || parsed.length === 0) {
      setMigrationComplete()
      return 0
    }

    const entries: StoredEntry[] = parsed.map((e: any) => ({
      ...e,
      updatedAt: e.updatedAt ?? e.createdAt ?? Date.now(),
    }))

    await saveEntries(entries)
    setMigrationComplete()
    return entries.length
  } catch {
    setMigrationComplete()
    return 0
  }
}

export async function saveBackupMetadata(metadata: BackupMetadata): Promise<void> {
  const db = await initDB()
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(METADATA_STORE, 'readwrite')
    const store = transaction.objectStore(METADATA_STORE)
    const request = store.put(metadata)
    request.onsuccess = () => resolve()
    request.onerror = () => reject(request.error)
  })
}

export async function getLastBackupMetadata(): Promise<BackupMetadata | undefined> {
  const db = await initDB()
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(METADATA_STORE, 'readonly')
    const store = transaction.objectStore(METADATA_STORE)
    const request = store.getAll()
    request.onsuccess = () => {
      const all = request.result as BackupMetadata[]
      if (all.length === 0) {
        resolve(undefined)
        return
      }
      all.sort((a, b) => b.timestamp - a.timestamp)
      resolve(all[0])
    }
    request.onerror = () => reject(request.error)
  })
}