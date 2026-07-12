import { motion } from 'framer-motion'
import { cn } from '@/utils/cn'
import { Skeleton } from '@/components/ui/Skeleton'
import { formatNumber } from '@/utils/formatters'

// ─────────────────────────────────────────────
// Stat Card Component
// ─────────────────────────────────────────────

interface StatCardProps {
  title: string
  value: number | string
  subtitle?: string
  icon: React.ElementType
  variant?: 'default' | 'gold' | 'success' | 'error' | 'warning'
  trend?: { value: number; label: string }
  isLoading?: boolean
  suffix?: string
}

const variantConfig = {
  default: {
    iconBg: 'bg-simmam-elevated border-simmam-gold-border',
    iconColor: 'text-simmam-text-secondary',
    valueColor: 'text-simmam-text-primary',
  },
  gold: {
    iconBg: 'bg-simmam-gold/15 border-simmam-gold/30',
    iconColor: 'text-simmam-gold',
    valueColor: 'text-simmam-gold',
  },
  success: {
    iconBg: 'bg-green-500/15 border-green-500/30',
    iconColor: 'text-green-400',
    valueColor: 'text-green-400',
  },
  error: {
    iconBg: 'bg-red-500/15 border-red-500/30',
    iconColor: 'text-red-400',
    valueColor: 'text-red-400',
  },
  warning: {
    iconBg: 'bg-yellow-500/15 border-yellow-500/30',
    iconColor: 'text-yellow-400',
    valueColor: 'text-yellow-400',
  },
}

export function StatCard({
  title,
  value,
  subtitle,
  icon: Icon,
  variant = 'default',
  trend,
  isLoading = false,
  suffix,
}: StatCardProps) {
  const { iconBg, iconColor, valueColor } = variantConfig[variant]

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={cn(
        'bg-simmam-surface border border-simmam-gold-border rounded-simmam-lg p-5',
        'hover:border-simmam-gold/30 hover:shadow-gold-sm transition-all duration-200'
      )}
    >
      <div className="flex items-start justify-between">
        <div className="min-w-0 flex-1">
          <p className="text-xs font-medium text-simmam-text-muted uppercase tracking-wider font-body">
            {title}
          </p>

          {isLoading ? (
            <div className="mt-2 space-y-2">
              <Skeleton className="h-8 w-24" />
              <Skeleton className="h-3 w-32" />
            </div>
          ) : (
            <>
              <p className={cn('mt-2 font-display font-bold text-3xl', valueColor)}>
                {typeof value === 'number' ? formatNumber(value) : value}
                {suffix && <span className="text-xl ml-1">{suffix}</span>}
              </p>
              {subtitle && (
                <p className="mt-1 text-xs text-simmam-text-muted">{subtitle}</p>
              )}
              {trend && (
                <p
                  className={cn(
                    'mt-1 text-xs font-medium',
                    trend.value >= 0 ? 'text-green-400' : 'text-red-400'
                  )}
                >
                  {trend.value >= 0 ? '+' : ''}{trend.value}% {trend.label}
                </p>
              )}
            </>
          )}
        </div>

        <div className={cn('w-10 h-10 rounded-simmam border flex items-center justify-center shrink-0', iconBg)}>
          <Icon size={18} className={iconColor} />
        </div>
      </div>
    </motion.div>
  )
}
