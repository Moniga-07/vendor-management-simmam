import { forwardRef, type ButtonHTMLAttributes } from 'react'
import { cn } from '@/utils/cn'
import { Spinner } from './Spinner'

// ─────────────────────────────────────────────
// Button Component
// ─────────────────────────────────────────────

export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'outline'
export type ButtonSize = 'xs' | 'sm' | 'md' | 'lg'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant
  size?: ButtonSize
  isLoading?: boolean
  leftIcon?: React.ReactNode
  rightIcon?: React.ReactNode
  fullWidth?: boolean
}

const variantStyles: Record<ButtonVariant, string> = {
  primary: [
    'bg-simmam-gold text-simmam-bg font-semibold',
    'hover:bg-simmam-gold-bright',
    'focus:ring-2 focus:ring-simmam-gold/50 focus:ring-offset-2 focus:ring-offset-simmam-bg',
    'disabled:bg-simmam-gold/40 disabled:text-simmam-bg/60',
    'shadow-gold hover:shadow-gold-lg',
  ].join(' '),

  secondary: [
    'bg-simmam-elevated text-simmam-text-primary',
    'border border-simmam-gold-border',
    'hover:border-simmam-gold/50 hover:bg-simmam-surface',
    'focus:ring-2 focus:ring-simmam-gold/30 focus:ring-offset-2 focus:ring-offset-simmam-bg',
    'disabled:opacity-40',
  ].join(' '),

  ghost: [
    'bg-transparent text-simmam-text-secondary',
    'hover:bg-simmam-elevated hover:text-simmam-text-primary',
    'focus:ring-2 focus:ring-simmam-gold/20 focus:ring-offset-2 focus:ring-offset-simmam-bg',
    'disabled:opacity-40',
  ].join(' '),

  outline: [
    'bg-transparent text-simmam-gold',
    'border border-simmam-gold/50',
    'hover:bg-simmam-gold/10 hover:border-simmam-gold',
    'focus:ring-2 focus:ring-simmam-gold/30 focus:ring-offset-2 focus:ring-offset-simmam-bg',
    'disabled:opacity-40',
  ].join(' '),

  danger: [
    'bg-simmam-error text-white font-semibold',
    'hover:bg-red-700',
    'focus:ring-2 focus:ring-red-500/50 focus:ring-offset-2 focus:ring-offset-simmam-bg',
    'disabled:opacity-40',
  ].join(' '),
}

const sizeStyles: Record<ButtonSize, string> = {
  xs: 'h-7 px-3 text-xs gap-1.5 rounded-simmam-sm',
  sm: 'h-8 px-4 text-sm gap-2 rounded-simmam-sm',
  md: 'h-10 px-5 text-sm gap-2 rounded-simmam',
  lg: 'h-12 px-6 text-base gap-2.5 rounded-simmam',
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = 'primary',
      size = 'md',
      isLoading = false,
      leftIcon,
      rightIcon,
      fullWidth = false,
      disabled,
      children,
      className,
      ...props
    },
    ref
  ) => {
    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={cn(
          'inline-flex items-center justify-center font-body font-medium',
          'transition-all duration-200 select-none outline-none',
          'cursor-pointer disabled:cursor-not-allowed',
          variantStyles[variant],
          sizeStyles[size],
          fullWidth && 'w-full',
          className
        )}
        {...props}
      >
        {isLoading ? (
          <>
            <Spinner size="sm" />
            <span>{children}</span>
          </>
        ) : (
          <>
            {leftIcon && <span className="shrink-0">{leftIcon}</span>}
            {children && <span>{children}</span>}
            {rightIcon && <span className="shrink-0">{rightIcon}</span>}
          </>
        )}
      </button>
    )
  }
)

Button.displayName = 'Button'
