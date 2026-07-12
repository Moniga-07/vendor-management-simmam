import { cn } from '@/utils/cn'

// ─────────────────────────────────────────────
// Skeleton Loader
// ─────────────────────────────────────────────

interface SkeletonProps {
  className?: string
  lines?: number
}

export function Skeleton({ className }: SkeletonProps) {
  return (
    <div
      aria-hidden
      className={cn(
        'rounded-simmam bg-simmam-elevated',
        'relative overflow-hidden',
        'before:absolute before:inset-0',
        'before:bg-gold-shimmer before:bg-[length:200%_100%]',
        'before:animate-shimmer',
        className
      )}
    />
  )
}

export function SkeletonCard() {
  return (
    <div className="bg-simmam-surface border border-simmam-gold-border rounded-simmam-lg p-5 space-y-3">
      <Skeleton className="h-4 w-1/3" />
      <Skeleton className="h-8 w-1/2" />
      <Skeleton className="h-3 w-2/3" />
    </div>
  )
}

export function SkeletonRow() {
  return (
    <tr className="border-b border-simmam-gold-border/50">
      {Array.from({ length: 6 }).map((_, i) => (
        <td key={i} className="p-4">
          <Skeleton className="h-4 w-full" />
        </td>
      ))}
    </tr>
  )
}

export function SkeletonText({ lines = 3, className }: SkeletonProps) {
  return (
    <div className={cn('space-y-2', className)}>
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton
          key={i}
          className={cn(
            'h-3',
            i === lines - 1 ? 'w-2/3' : 'w-full'
          )}
        />
      ))}
    </div>
  )
}
