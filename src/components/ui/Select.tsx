import { forwardRef, type SelectHTMLAttributes } from 'react'
import { ChevronDown } from 'lucide-react'
import { cn } from '@/utils/cn'

// ─────────────────────────────────────────────
// Select Component
// ─────────────────────────────────────────────

interface SelectOption {
  value: string
  label: string
  disabled?: boolean
}

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string
  error?: string
  hint?: string
  options: SelectOption[]
  placeholder?: string
  containerClassName?: string
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  (
    {
      label,
      error,
      hint,
      options,
      placeholder = 'Select an option',
      containerClassName,
      className,
      id,
      ...props
    },
    ref
  ) => {
    const selectId = id ?? `select-${Math.random().toString(36).slice(2)}`

    return (
      <div className={cn('flex flex-col gap-1.5', containerClassName)}>
        {label && (
          <label
            htmlFor={selectId}
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

        <div className="relative">
          <select
            ref={ref}
            id={selectId}
            aria-invalid={!!error}
            className={cn(
              'w-full h-10 bg-simmam-elevated border rounded-simmam font-body text-sm',
              'text-simmam-text-primary appearance-none',
              'pl-3 pr-9 transition-all duration-200 outline-none',
              'border-simmam-gold-border',
              'hover:border-simmam-gold/30',
              'focus:border-simmam-gold/60 focus:ring-1 focus:ring-simmam-gold/30',
              error && 'border-simmam-error/60 focus:border-simmam-error',
              'disabled:opacity-50 disabled:cursor-not-allowed',
              className
            )}
            {...props}
          >
            {placeholder && (
              <option value="" disabled>
                {placeholder}
              </option>
            )}
            {options.map((opt) => (
              <option key={opt.value} value={opt.value} disabled={opt.disabled}>
                {opt.label}
              </option>
            ))}
          </select>
          <ChevronDown
            size={16}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-simmam-text-muted pointer-events-none"
          />
        </div>

        {error && <p role="alert" className="text-xs text-simmam-error">{error}</p>}
        {hint && !error && <p className="text-xs text-simmam-text-muted">{hint}</p>}
      </div>
    )
  }
)

Select.displayName = 'Select'
