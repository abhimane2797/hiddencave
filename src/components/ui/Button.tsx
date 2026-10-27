import type { ButtonHTMLAttributes, ReactNode } from 'react'
import { cx } from '@/lib/utils'

export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'outline' | 'danger' | 'success'
export type ButtonSize = 'xs' | 'sm' | 'md' | 'lg' | 'icon'

const variantClasses: Record<ButtonVariant, string> = {
  primary:
    'border border-white/10 bg-accent text-white shadow-glow-sm hover:brightness-110 active:brightness-95',
  secondary:
    'border border-white/10 bg-white/[0.06] text-white hover:bg-white/[0.12] active:bg-white/[0.08]',
  ghost: 'border border-transparent text-slate-300 hover:border-white/10 hover:bg-white/[0.06] hover:text-white',
  outline: 'border border-accent/40 bg-accent/5 text-white hover:border-accent/70 hover:bg-accent/15',
  danger: 'border border-rose-400/20 bg-rose-500/90 text-white hover:bg-rose-500 active:bg-rose-600',
  success:
    'border border-emerald-400/20 bg-emerald-500/90 text-white hover:bg-emerald-500 active:bg-emerald-600',
}

const sizeClasses: Record<ButtonSize, string> = {
  xs: 'h-7 gap-1.5 rounded-lg px-2.5 text-[11px]',
  sm: 'h-9 gap-2 rounded-xl px-3.5 text-xs',
  md: 'h-11 gap-2 rounded-xl px-5 text-sm',
  lg: 'h-13 gap-2.5 rounded-2xl px-7 text-base',
  icon: 'h-9 w-9 rounded-xl',
}

export function buttonClasses(
  variant: ButtonVariant = 'primary',
  size: ButtonSize = 'md',
  className?: string,
) {
  return cx(
    'inline-flex select-none items-center justify-center font-semibold tracking-wide transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/50 focus-visible:ring-offset-2 focus-visible:ring-offset-ink-950 disabled:pointer-events-none disabled:opacity-50',
    variantClasses[variant],
    sizeClasses[size],
    className,
  )
}

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant
  size?: ButtonSize
  icon?: ReactNode
  iconRight?: ReactNode
}

export function Button({
  variant = 'primary',
  size = 'md',
  icon,
  iconRight,
  className,
  children,
  ...rest
}: ButtonProps) {
  return (
    <button className={buttonClasses(variant, size, className)} {...rest}>
      {icon}
      {children}
      {iconRight}
    </button>
  )
}

export function IconButton({
  label,
  variant = 'ghost',
  size = 'icon',
  className,
  icon,
  ...rest
}: Omit<ButtonProps, 'children'> & { label: string; icon: ReactNode }) {
  return (
    <button aria-label={label} title={label} className={buttonClasses(variant, size, className)} {...rest}>
      {icon}
    </button>
  )
}