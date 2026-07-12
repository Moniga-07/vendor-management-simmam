import { createPortal } from 'react-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { X, CheckCircle, AlertCircle, AlertTriangle, Info } from 'lucide-react'
import { cn } from '@/utils/cn'
import { useToast, type Toast } from '@/hooks/useToast'

// ─────────────────────────────────────────────
// Toast Notification System
// ─────────────────────────────────────────────

const config = {
  success: {
    icon: CheckCircle,
    className: 'border-green-500/40 bg-green-500/10',
    iconClass: 'text-green-400',
  },
  error: {
    icon: AlertCircle,
    className: 'border-red-500/40 bg-red-500/10',
    iconClass: 'text-red-400',
  },
  warning: {
    icon: AlertTriangle,
    className: 'border-yellow-500/40 bg-yellow-500/10',
    iconClass: 'text-yellow-400',
  },
  info: {
    icon: Info,
    className: 'border-blue-500/40 bg-blue-500/10',
    iconClass: 'text-blue-400',
  },
}

function ToastItem({ toast, onDismiss }: { toast: Toast; onDismiss: (id: string) => void }) {
  const { icon: Icon, className, iconClass } = config[toast.type]

  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: 100, scale: 0.95 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      exit={{ opacity: 0, x: 100, scale: 0.95 }}
      transition={{ duration: 0.25, ease: 'easeOut' }}
      role="alert"
      aria-live="polite"
      className={cn(
        'flex items-start gap-3 w-full max-w-sm',
        'bg-simmam-surface border rounded-simmam-lg p-4',
        'shadow-surface-lg',
        className
      )}
    >
      <Icon size={18} className={cn('shrink-0 mt-0.5', iconClass)} />
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-simmam-text-primary">{toast.title}</p>
        {toast.description && (
          <p className="mt-0.5 text-xs text-simmam-text-secondary">{toast.description}</p>
        )}
      </div>
      <button
        onClick={() => onDismiss(toast.id)}
        aria-label="Dismiss notification"
        className="shrink-0 p-0.5 text-simmam-text-muted hover:text-simmam-text-primary transition-colors"
      >
        <X size={14} />
      </button>
    </motion.div>
  )
}

export function ToastContainer() {
  const { toasts, dismiss } = useToast()

  return createPortal(
    <div
      aria-label="Notifications"
      className="fixed top-4 right-4 z-[100] flex flex-col gap-2 pointer-events-none"
    >
      <AnimatePresence mode="sync">
        {toasts.map((t) => (
          <div key={t.id} className="pointer-events-auto">
            <ToastItem toast={t} onDismiss={dismiss} />
          </div>
        ))}
      </AnimatePresence>
    </div>,
    document.body
  )
}
