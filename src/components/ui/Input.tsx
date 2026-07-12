import { forwardRef, type InputHTMLAttributes } from 'react'
import { cn } from '@/utils/cn'

// ─────────────────────────────────────────────
// Input Component
// ─────────────────────────────────────────────

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  hint?: string
  leftIcon?: React.ReactNode
  rightElement?: React.ReactNode
  containerClassName?: string
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      label,
      error,
      hint,
      leftIcon,
      rightElement,
      containerClassName,
      className,
      id,
      ...props
    },
    ref
  ) => {
    const inputId = id ?? `input-${Math.random().toString(36).slice(2)}`

    return (
      <div className={cn('flex flex-col gap-1.5', containerClassName)}>
        {label && (
          <label
            htmlFor={inputId}
            className="text-sm font-medium text-simmam-text-secondary font-body"
          >
            {label}
            {props.required && (
              <span className="ml-1 text-simmam-gold" aria-hidden>
                *
              </span>
            )}
          </label>
        )}

        <div className="relative flex items-center">
          {leftIcon && (
            <div className="absolute left-3 text-simmam-text-muted pointer-events-none">
              {leftIcon}
            </div>
          )}

          <input
            ref={ref}
            id={inputId}
            aria-invalid={!!error}
            aria-describedby={error ? `${inputId}-error` : hint ? `${inputId}-hint` : undefined}
            className={cn(
              'w-full h-10 bg-simmam-elevated border rounded-simmam font-body text-sm',
              'text-simmam-text-primary placeholder:text-simmam-text-muted',
              'transition-all duration-200 outline-none',
              'border-simmam-gold-border',
              'hover:border-simmam-gold/30',
              'focus:border-simmam-gold/60 focus:ring-1 focus:ring-simmam-gold/30',
              error && 'border-simmam-error/60 focus:border-simmam-error focus:ring-simmam-error/20',
              leftIcon ? 'pl-10' : 'pl-3',
              rightElement ? 'pr-10' : 'pr-3',
              'disabled:opacity-50 disabled:cursor-not-allowed',
              className
            )}
            {...props}
          />

          {rightElement && (
            <div className="absolute right-3 text-simmam-text-muted">{rightElement}</div>
          )}
        </div>

        {error && (
          <p id={`${inputId}-error`} role="alert" className="text-xs text-simmam-error">
            {error}
          </p>
        )}
        {hint && !error && (
          <p id={`${inputId}-hint`} className="text-xs text-simmam-text-muted">
            {hint}
          </p>
        )}
      </div>
    )
  }
)

Input.displayName = 'Input'
