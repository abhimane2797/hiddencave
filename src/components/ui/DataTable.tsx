import type { ReactNode } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { cx } from '@/lib/utils'
import { EmptyState } from './Card'
import { Button } from './Button'

export interface Column<T> {
  key: string
  header: ReactNode
  cell: (row: T) => ReactNode
  align?: 'left' | 'right' | 'center'
  className?: string
  headerClassName?: string
  /** omit from the stacked mobile layout */
  desktopOnly?: boolean
  label?: ReactNode
}

export function DataTable<T>({
  columns,
  rows,
  rowKey,
  onRowClick,
  emptyTitle = 'Nothing here yet',
  emptyMessage,
  dense,
  className,
  footer,
}: {
  columns: Array<Column<T>>
  rows: T[]
  rowKey: (row: T, index: number) => string
  onRowClick?: (row: T) => void
  emptyTitle?: string
  emptyMessage?: string
  dense?: boolean
  className?: string
  footer?: ReactNode
}) {
  if (rows.length === 0) {
    return <EmptyState title={emptyTitle} message={emptyMessage} className={className} />
  }

  const alignClass = (align?: Column<T>['align']) =>
    align === 'right' ? 'text-right' : align === 'center' ? 'text-center' : 'text-left'

  return (
    <div className={className}>
      <div className="hidden overflow-x-auto md:block">
        <table className="w-full min-w-[640px] border-separate border-spacing-0">
          <thead>
            <tr>
              {columns.map((col) => (
                <th
                  key={col.key}
                  className={cx(
                    'sticky top-0 z-10 border-b border-white/[0.08] bg-ink-900/90 px-3 py-2.5 text-[11px] font-semibold uppercase tracking-wider text-slate-400 backdrop-blur',
                    alignClass(col.align),
                    col.headerClassName,
                  )}
                >
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, index) => (
              <tr
                key={rowKey(row, index)}
                onClick={onRowClick ? () => onRowClick(row) : undefined}
                className={cx(
                  'group transition-colors',
                  onRowClick && 'cursor-pointer',
                  'hover:bg-white/[0.03]',
                )}
              >
                {columns.map((col) => (
                  <td
                    key={col.key}
                    className={cx(
                      'border-b border-white/[0.05] px-3 text-sm text-slate-300',
                      dense ? 'py-2' : 'py-3',
                      alignClass(col.align),
                      col.className,
                    )}
                  >
                    {col.cell(row)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="space-y-2.5 md:hidden">
        {rows.map((row, index) => (
          <div
            key={rowKey(row, index)}
            onClick={onRowClick ? () => onRowClick(row) : undefined}
            className={cx(
              'rounded-2xl border border-white/[0.08] bg-white/[0.02] p-3.5',
              onRowClick && 'cursor-pointer active:bg-white/[0.05]',
            )}
          >
            <div className="grid grid-cols-2 gap-x-3 gap-y-2.5">
              {columns
                .filter((col) => !col.desktopOnly)
                .map((col) => (
                  <div key={col.key} className={col.key === 'actions' || col.className?.includes('w-full') ? 'col-span-2' : ''}>
                    <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">
                      {col.label ?? col.header}
                    </p>
                    <div className="mt-0.5 text-sm text-slate-200">{col.cell(row)}</div>
                  </div>
                ))}
            </div>
          </div>
        ))}
      </div>

      {footer}
    </div>
  )
}

export function Pagination({
  page,
  pageCount,
  onPage,
  total,
  pageSize,
  onPageSize,
}: {
  page: number
  pageCount: number
  onPage: (page: number) => void
  total?: number
  pageSize?: number
  onPageSize?: (size: number) => void
}) {
  if (pageCount <= 1 && !total) return null
  const start = total && pageSize ? (page - 1) * pageSize + 1 : null
  const end = total && pageSize ? Math.min(page * pageSize, total) : null

  return (
    <div className="mt-4 flex flex-col items-center justify-between gap-3 sm:flex-row">
      <div className="flex items-center gap-3 text-xs text-slate-400">
        {start && end && total ? (
          <span>
            Showing <span className="font-semibold text-slate-200">{start}-{end}</span> of{' '}
            <span className="font-semibold text-slate-200">{total}</span>
          </span>
        ) : null}
        {onPageSize ? (
          <label className="flex items-center gap-1.5">
            <span className="hidden sm:inline">Rows</span>
            <select
              value={pageSize}
              onChange={(e) => onPageSize(Number(e.target.value))}
              className="rounded-lg border border-white/10 bg-ink-900 px-2 py-1 text-xs text-slate-200"
            >
              {[8, 10, 15, 25].map((size) => (
                <option key={size} value={size}>
                  {size}
                </option>
              ))}
            </select>
          </label>
        ) : null}
      </div>
      <div className="flex items-center gap-2">
        <Button
          variant="secondary"
          size="sm"
          disabled={page <= 1}
          onClick={() => onPage(page - 1)}
          icon={<ChevronLeft size={14} />}
        >
          Prev
        </Button>
        <span className="text-xs text-slate-400">
          Page <span className="font-semibold text-slate-200">{page}</span> / {Math.max(1, pageCount)}
        </span>
        <Button
          variant="secondary"
          size="sm"
          disabled={page >= pageCount}
          onClick={() => onPage(page + 1)}
          iconRight={<ChevronRight size={14} />}
        >
          Next
        </Button>
      </div>
    </div>
  )
}