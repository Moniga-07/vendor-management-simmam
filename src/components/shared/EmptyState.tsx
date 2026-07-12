import { type ReactNode } from 'react'
import { cn } from '@/utils/cn'

// ─────────────────────────────────────────────
// Empty State Component
// ─────────────────────────────────────────────

interface EmptyStateProps {
  icon?: React.ElementType
  title: string
  description?: string
  action?: ReactNode
  className?: string
}

export function EmptyState({ icon: Icon, title, description, action, className }: EmptyStateProps) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center py-16 px-8 text-center',
        className
      )}
    >
      {Icon && (
        <div className="w-16 h-16 rounded-full bg-simmam-elevated border border-simmam-gold-border flex items-center justify-center mb-4">
          <Icon size={28} className="text-simmam-text-muted" />
        </div>
      )}
      <h3 className="font-display font-semibold text-simmam-text-primary uppercase tracking-wide text-base">
        {title}
      </h3>
      {description && (
        <p className="mt-2 text-sm text-simmam-text-secondary max-w-xs leading-relaxed">
          {description}
        </p>
      )}
      {action && <div className="mt-5">{action}</div>}
    </div>
  )
}

// ─────────────────────────────────────────────
// Page Header
// ─────────────────────────────────────────────

interface PageHeaderProps {
  title: string
  subtitle?: string
  actions?: ReactNode
  onBack?: () => void
}

export function PageHeader({ title, subtitle, actions, onBack }: PageHeaderProps) {
  return (
    <div className="flex items-start justify-between gap-4 mb-6">
      <div className="flex items-center gap-3">
        {onBack && (
          <button 
            onClick={onBack}
            className="p-2 rounded-full bg-simmam-elevated border border-simmam-gold-border hover:bg-simmam-gold/10 hover:text-simmam-gold transition-colors text-simmam-text-secondary"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m12 19-7-7 7-7"/><path d="M19 12H5"/></svg>
          </button>
        )}
        <div>
          <h1 className="font-display font-bold text-simmam-text-primary uppercase tracking-wider text-xl sm:text-2xl">
            {title}
          </h1>
          {subtitle && (
            <p className="mt-1 text-sm text-simmam-text-secondary">{subtitle}</p>
          )}
        </div>
      </div>
      {actions && <div className="flex items-center gap-2 shrink-0">{actions}</div>}
    </div>
  )
}

// ─── Divider ──────────────────────────────────
export function GoldDivider({ className }: { className?: string }) {
  return (
    <div className={cn('h-px bg-simmam-gold-border', className)} />
  )
}
