import { format, formatDistanceToNow, isToday, isYesterday } from 'date-fns'

// ─── Date ─────────────────────────────────────

export function formatDate(date: string | Date | null): string {
  if (!date) return '—'
  const d = typeof date === 'string' ? new Date(date) : date
  return format(d, 'dd MMM yyyy')
}

export function formatDateTime(date: string | Date | null): string {
  if (!date) return '—'
  const d = typeof date === 'string' ? new Date(date) : date
  return format(d, 'dd MMM yyyy, hh:mm a')
}

export function formatTime(date: string | Date | null): string {
  if (!date) return '—'
  const d = typeof date === 'string' ? new Date(date) : date
  return format(d, 'hh:mm a')
}

export function formatRelative(date: string | Date | null): string {
  if (!date) return '—'
  const d = typeof date === 'string' ? new Date(date) : date
  if (isToday(d)) return `Today, ${format(d, 'hh:mm a')}`
  if (isYesterday(d)) return `Yesterday, ${format(d, 'hh:mm a')}`
  return formatDistanceToNow(d, { addSuffix: true })
}

// ─── String ───────────────────────────────────

export function capitalize(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase()
}

export function truncate(str: string, max: number): string {
  if (str.length <= max) return str
  return str.slice(0, max - 3) + '...'
}

export function maskPhone(phone: string): string {
  if (phone.length < 4) return phone
  return phone.slice(0, -4).replace(/\d/g, '*') + phone.slice(-4)
}

// ─── Numbers ──────────────────────────────────

export function formatPercent(value: number, total: number): string {
  if (total === 0) return '0%'
  return `${Math.round((value / total) * 100)}%`
}

export function formatNumber(n: number): string {
  return n.toLocaleString('en-IN')
}

// ─── Status ───────────────────────────────────

export function getStatusLabel(status: string): string {
  const labels: Record<string, string> = {
    SUCCESS: 'Verified',
    DUPLICATE: 'Duplicate',
    INVALID: 'Invalid',
    RESET: 'Reset',
  }
  return labels[status] ?? status
}

export function getStatusColor(status: string): string {
  const colors: Record<string, string> = {
    SUCCESS: 'text-green-400 bg-green-500/20 border-green-500/30',
    DUPLICATE: 'text-yellow-400 bg-yellow-500/20 border-yellow-500/30',
    INVALID: 'text-red-400 bg-red-500/20 border-red-500/30',
    RESET: 'text-blue-400 bg-blue-500/20 border-blue-500/30',
  }
  return colors[status] ?? 'text-gray-400 bg-gray-500/20 border-gray-500/30'
}
