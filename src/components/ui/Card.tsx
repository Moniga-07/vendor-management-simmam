import { type HTMLAttributes } from 'react'
import { cn } from '@/utils/cn'

// ─────────────────────────────────────────────
// Card Component
// ─────────────────────────────────────────────

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'elevated' | 'gold' | 'ghost'
  padding?: 'none' | 'sm' | 'md' | 'lg'
  hover?: boolean
}

const variantStyles = {
  default: 'bg-simmam-surface border border-simmam-gold-border',
  elevated: 'bg-simmam-elevated border border-simmam-gold-border shadow-surface',
  gold: 'bg-simmam-surface border border-simmam-gold/30 shadow-gold',
  ghost: 'bg-transparent border border-simmam-gold-border',
}

const paddingStyles = {
  none: '',
  sm: 'p-4',
  md: 'p-5',
  lg: 'p-6',
}

export function Card({
  variant = 'default',
  padding = 'md',
  hover = false,
  children,
  className,
  ...props
}: CardProps) {
  return (
    <div
      className={cn(
        'rounded-simmam-lg',
        variantStyles[variant],
        paddingStyles[padding],
        hover && [
          'transition-all duration-200 cursor-pointer',
          'hover:border-simmam-gold/40 hover:shadow-gold',
          'hover:translate-y-[-1px]',
        ],
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
}

export function CardHeader({ children, className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn('flex items-center justify-between mb-4', className)} {...props}>
      {children}
    </div>
  )
}

export function CardTitle({ children, className, ...props }: HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h3
      className={cn('font-display font-semibold text-simmam-text-primary text-base uppercase tracking-wide', className)}
      {...props}
    >
      {children}
    </h3>
  )
}

export function CardContent({ children, className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn('', className)} {...props}>
      {children}
    </div>
  )
}
