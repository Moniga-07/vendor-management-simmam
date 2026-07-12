import { type HTMLAttributes } from 'react'
import { cn } from '@/utils/cn'

// ─────────────────────────────────────────────
// Badge Component
// ─────────────────────────────────────────────

type BadgeVariant = 'default' | 'success' | 'error' | 'warning' | 'info' | 'gold' | 'ghost'

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant
  size?: 'sm' | 'md'
  dot?: boolean
}

const variantStyles: Record<BadgeVariant, string> = {
  default: 'bg-simmam-elevated text-simmam-text-secondary border-simmam-gold-border',
  success: 'bg-green-500/15 text-green-400 border-green-500/30',
  error: 'bg-red-500/15 text-red-400 border-red-500/30',
  warning: 'bg-yellow-500/15 text-yellow-400 border-yellow-500/30',
  info: 'bg-blue-500/15 text-blue-400 border-blue-500/30',
  gold: 'bg-simmam-gold/15 text-simmam-gold border-simmam-gold/30',
  ghost: 'bg-transparent text-simmam-text-muted border-simmam-gold-border',
}

const dotColors: Record<BadgeVariant, string> = {
  default: 'bg-simmam-text-muted',
  success: 'bg-green-400',
  error: 'bg-red-400',
  warning: 'bg-yellow-400',
  info: 'bg-blue-400',
  gold: 'bg-simmam-gold',
  ghost: 'bg-simmam-text-muted',
}

const sizeStyles = {
  sm: 'text-2xs px-2 py-0.5 gap-1',
  md: 'text-xs px-2.5 py-1 gap-1.5',
}

export function Badge({
  variant = 'default',
  size = 'md',
  dot = false,
  children,
  className,
  ...props
}: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center border rounded-full font-body font-medium uppercase tracking-wide',
        variantStyles[variant],
        sizeStyles[size],
        className
      )}
      {...props}
    >
      {dot && (
        <span
          className={cn('w-1.5 h-1.5 rounded-full shrink-0', dotColors[variant])}
          aria-hidden
        />
      )}
      {children}
    </span>
  )
}
