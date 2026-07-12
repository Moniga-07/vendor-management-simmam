import { forwardRef, type TextareaHTMLAttributes } from 'react'
import { cn } from '@/utils/cn'

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string
  error?: string
  hint?: string
  containerClassName?: string
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ label, error, hint, containerClassName, className, id, ...props }, ref) => {
    const textareaId = id ?? `textarea-${Math.random().toString(36).slice(2)}`

    return (
      <div className={cn('flex flex-col gap-1.5', containerClassName)}>
        {label && (
          <label htmlFor={textareaId} className="text-sm font-medium text-simmam-text-secondary">
            {label}
            {props.required && <span className="ml-1 text-simmam-gold">*</span>}
          </label>
        )}
        <textarea
          ref={ref}
          id={textareaId}
          aria-invalid={!!error}
          rows={4}
          className={cn(
            'w-full bg-simmam-elevated border rounded-simmam font-body text-sm resize-y',
            'text-simmam-text-primary placeholder:text-simmam-text-muted',
            'px-3 py-2.5 transition-all duration-200 outline-none',
            'border-simmam-gold-border hover:border-simmam-gold/30',
            'focus:border-simmam-gold/60 focus:ring-1 focus:ring-simmam-gold/30',
            error && 'border-simmam-error/60',
            className
          )}
          {...props}
        />
        {error && <p role="alert" className="text-xs text-simmam-error">{error}</p>}
        {hint && !error && <p className="text-xs text-simmam-text-muted">{hint}</p>}
      </div>
    )
  }
)
Textarea.displayName = 'Textarea'
