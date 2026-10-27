import type {
  InputHTMLAttributes,
  ReactNode,
  SelectHTMLAttributes,
  TextareaHTMLAttributes,
} from 'react'
import { cx } from '@/lib/utils'
import { Check } from 'lucide-react'

export function Field({
  label,
  hint,
  error,
  required,
  children,
  className,
}: {
  label?: ReactNode
  hint?: ReactNode
  error?: string
  required?: boolean
  children: ReactNode
  className?: string
}) {
  return (
    <label className={cx('block', className)}>
      {label ? (
        <span className="mb-1.5 flex items-center gap-1 text-xs font-semibold uppercase tracking-wider text-slate-400">
          {label}
          {required ? <span className="text-rose-400">*</span> : null}
        </span>
      ) : null}
      {children}
      {error ? (
        <span className="mt-1.5 block text-xs font-medium text-rose-300">{error}</span>
      ) : hint ? (
        <span className="mt-1.5 block text-xs text-slate-500">{hint}</span>
      ) : null}
    </label>
  )
}

export function Input({ className, ...rest }: InputHTMLAttributes<HTMLInputElement>) {
  return <input className={cx('field-input', className)} {...rest} />
}

export function Select({ className, children, ...rest }: SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select className={cx('field-input appearance-none pr-9', className)} {...rest}>
      {children}
    </select>
  )
}

export function Textarea({ className, ...rest }: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea className={cx('field-input min-h-[84px] resize-y', className)} {...rest} />
}

export function Toggle({
  checked,
  onChange,
  label,
  description,
  disabled,
}: {
  checked: boolean
  onChange: (next: boolean) => void
  label?: ReactNode
  description?: ReactNode
  disabled?: boolean
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      disabled={disabled}
      onClick={() => onChange(!checked)}
      className={cx(
        'group flex w-full items-center justify-between gap-4 rounded-xl border border-white/10 bg-white/[0.03] px-3.5 py-3 text-left transition hover:border-white/20',
        disabled && 'pointer-events-none opacity-50',
      )}
    >
      <span>
        {label ? <span className="block text-sm font-semibold text-white">{label}</span> : null}
        {description ? <span className="mt-0.5 block text-xs text-slate-400">{description}</span> : null}
      </span>
      <span
        className={cx(
          'relative inline-flex h-6 w-11 shrink-0 items-center rounded-full border transition-colors',
          checked ? 'border-transparent bg-accent' : 'border-white/15 bg-ink-700',
        )}
      >
        <span
          className={cx(
            'inline-block transform rounded-full bg-white shadow transition-transform',
            checked ? 'translate-x-[22px]' : 'translate-x-[3px]',
          )}
          style={{ height: 18, width: 18 }}
        />
      </span>
    </button>
  )
}

export function Segmented<T extends string | number>({
  options,
  value,
  onChange,
  className,
  size = 'md',
}: {
  options: Array<{ value: T; label: ReactNode }>
  value: T
  onChange: (value: T) => void
  className?: string
  size?: 'sm' | 'md'
}) {
  return (
    <div
      className={cx(
        'inline-flex items-center gap-1 rounded-xl border border-white/10 bg-ink-900/60 p-1',
        className,
      )}
    >
      {options.map((option) => {
        const active = option.value === value
        return (
          <button
            key={String(option.value)}
            type="button"
            onClick={() => onChange(option.value)}
            className={cx(
              'rounded-lg font-semibold transition-all duration-200',
              size === 'sm' ? 'px-2.5 py-1 text-[11px]' : 'px-3.5 py-1.5 text-xs',
              active
                ? 'bg-accent text-white shadow-glow-sm'
                : 'text-slate-400 hover:bg-white/[0.06] hover:text-white',
            )}
          >
            {option.label}
          </button>
        )
      })}
    </div>
  )
}

export function CheckboxRow({
  checked,
  onChange,
  label,
}: {
  checked: boolean
  onChange: (next: boolean) => void
  label: ReactNode
}) {
  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className="flex w-full items-center gap-3 rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2.5 text-left text-sm text-slate-300 transition hover:border-white/20"
    >
      <span
        className={cx(
          'flex h-5 w-5 shrink-0 items-center justify-center rounded-md border transition',
          checked ? 'border-transparent bg-accent text-white' : 'border-white/20 bg-transparent',
        )}
      >
        {checked ? <Check size={13} strokeWidth={3} /> : null}
      </span>
      {label}
    </button>
  )
}