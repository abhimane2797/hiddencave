import { cx } from '@/lib/utils'

export function PaymentBadge({ status }: { status: 'paid' | 'unpaid' }) {
  return status === 'paid' ? (
    <span className="inline-flex items-center gap-1 rounded-full border border-emerald-400/30 bg-emerald-400/10 px-2.5 py-0.5 text-[11px] font-semibold text-emerald-300">
      Paid
    </span>
  ) : (
    <span className="inline-flex items-center gap-1 rounded-full border border-rose-400/30 bg-rose-400/10 px-2.5 py-0.5 text-[11px] font-semibold text-rose-300">
      Unpaid
    </span>
  )
}
