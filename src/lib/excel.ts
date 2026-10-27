import * as XLSX from 'xlsx'
import type { Entry } from '@/types'

export interface ExcelRow {
  'Entry ID': string
  'Customer Name': string
  'Start Time': string
  'End Time': string
  'Duration (minutes)': number
  'Amount (₹)': number
  'Payment Status': 'Paid' | 'Unpaid'
  'Session Status': string
  Notes: string
  'Created At': string
  'Updated At': string
}

const STATUS_MAP: Record<string, Entry['sessionStatus']> = {
  Active: 'active',
  'Almost Over': 'almost-over',
  'Time Over': 'time-over',
  Completed: 'completed',
  active: 'active',
  'almost-over': 'almost-over',
  'time-over': 'time-over',
  completed: 'completed',
}

const PAYMENT_MAP: Record<string, Entry['paymentStatus']> = {
  Paid: 'paid',
  Unpaid: 'unpaid',
  paid: 'paid',
  unpaid: 'unpaid',
}

function entryToRow(entry: Entry): ExcelRow {
  return {
    'Entry ID': entry.id,
    'Customer Name': entry.customerName,
    'Start Time': new Date(entry.startTime).toLocaleString('en-IN', { hour12: false }),
    'End Time': new Date(entry.endTime).toLocaleString('en-IN', { hour12: false }),
    'Duration (minutes)': entry.durationMinutes,
    'Amount (₹)': entry.amount,
    'Payment Status': entry.paymentStatus === 'paid' ? 'Paid' : 'Unpaid',
    'Session Status': entry.sessionStatus
      .split('-')
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(' '),
    Notes: entry.notes ?? '',
    'Created At': new Date(entry.createdAt).toLocaleString('en-IN', { hour12: false }),
    'Updated At': new Date(entry.updatedAt).toLocaleString('en-IN', { hour12: false }),
  }
}

function rowToEntry(row: ExcelRow): Entry {
  const parseTime = (val: string): number => {
    const parsed = new Date(val).getTime()
    return isNaN(parsed) ? Date.now() : parsed
  }

  return {
    id: row['Entry ID'] || `entry-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
    customerName: row['Customer Name']?.trim() || 'Unknown',
    startTime: parseTime(row['Start Time']),
    endTime: parseTime(row['End Time']),
    durationMinutes: Number(row['Duration (minutes)']) || 60,
    amount: Number(row['Amount (₹)']) || 0,
    paymentStatus: PAYMENT_MAP[row['Payment Status']] || 'unpaid',
    sessionStatus: STATUS_MAP[row['Session Status']] || 'active',
    notes: row.Notes?.trim() || undefined,
    createdAt: parseTime(row['Created At']),
    updatedAt: parseTime(row['Updated At']),
  }
}

export function exportEntriesToExcel(entries: Entry[], filename = 'hidden-cave-entries'): void {
  const rows = entries.map(entryToRow)
  const worksheet = XLSX.utils.json_to_sheet(rows)
  const workbook = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Entries')

  const dateStr = new Date().toISOString().slice(0, 10)
  XLSX.writeFile(workbook, `${filename}-${dateStr}.xlsx`)
}

export function exportTodayEntriesToExcel(entries: Entry[], filename = 'hidden-cave-entries-today'): void {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const todayStart = today.getTime()
  today.setHours(23, 59, 59, 999)
  const todayEnd = today.getTime()

  const todayEntries = entries.filter((e) => e.createdAt >= todayStart && e.createdAt <= todayEnd)
  exportEntriesToExcel(todayEntries, filename)
}

export interface ImportPreview {
  validEntries: Entry[]
  invalidRows: Array<{ row: number; error: string; data: ExcelRow }>
  duplicates: Entry[]
  totalRows: number
}

export function previewImportFromExcel(
  file: File,
  existingEntries: Entry[]
): Promise<ImportPreview> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const data = e.target?.result
        const workbook = XLSX.read(data, { type: 'array' })
        const sheetName = workbook.SheetNames[0]
        const worksheet = workbook.Sheets[sheetName]
        const json = XLSX.utils.sheet_to_json<ExcelRow>(worksheet)

        const existingIds = new Set(existingEntries.map((e) => e.id))
        const validEntries: Entry[] = []
        const invalidRows: Array<{ row: number; error: string; data: ExcelRow }> = []
        const duplicates: Entry[] = []

        json.forEach((row, index) => {
          const rowNum = index + 2
          try {
            if (!row['Customer Name'] || !row['Customer Name'].trim()) {
              invalidRows.push({ row: rowNum, error: 'Customer name is required', data: row })
              return
            }
            if (!row['Amount (₹)'] || Number(row['Amount (₹)']) <= 0) {
              invalidRows.push({ row: rowNum, error: 'Amount must be a positive number', data: row })
              return
            }

            const entry = rowToEntry(row)

            if (existingIds.has(entry.id)) {
              duplicates.push(entry)
            } else {
              validEntries.push(entry)
              existingIds.add(entry.id)
            }
          } catch (err) {
            invalidRows.push({ row: rowNum, error: err instanceof Error ? err.message : 'Invalid row format', data: row })
          }
        })

        resolve({
          validEntries,
          invalidRows,
          duplicates,
          totalRows: json.length,
        })
      } catch (err) {
        reject(err instanceof Error ? err : new Error('Failed to parse Excel file'))
      }
    }
    reader.onerror = () => reject(new Error('Failed to read file'))
    reader.readAsArrayBuffer(file)
  })
}

export interface ImportResult {
  imported: number
  skipped: number
  errors: string[]
}

export async function importEntriesToDB(
  validEntries: Entry[],
  existingEntries: Entry[]
): Promise<ImportResult> {
  const existingIds = new Set(existingEntries.map((e) => e.id))
  const toImport = validEntries.filter((e) => !existingIds.has(e.id))
  const skipped = validEntries.length - toImport.length

  if (toImport.length > 0) {
    await import('./idb').then(({ saveEntries }) => saveEntries(toImport))
  }

  return {
    imported: toImport.length,
    skipped,
    errors: [],
  }
}

export function downloadBackup(entries: Entry[]): void {
  exportEntriesToExcel(entries, 'hidden-cave-backup')
}