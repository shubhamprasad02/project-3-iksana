'use client'

import { forwardRef, useId } from 'react'
import { Check, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'

export const SubmitButton = forwardRef<
  HTMLButtonElement,
  React.ButtonHTMLAttributes<HTMLButtonElement> & { loading?: boolean }
>(function SubmitButton({ className, children, loading, disabled, ...props }, ref) {
  return (
    <button
      ref={ref}
      type="submit"
      disabled={disabled || loading}
      className={cn(
        'group relative flex h-11 w-full items-center justify-center gap-2 rounded-lg bg-brand px-4 text-sm font-semibold text-brand-foreground shadow-sm transition-all duration-150',
        'hover:bg-brand/90 hover:shadow-md',
        'focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-accent-yellow/50',
        'active:translate-y-px',
        'disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:shadow-sm',
        className,
      )}
      {...props}
    >
      {loading ? <Loader2 className="size-4 animate-spin" aria-hidden="true" /> : null}
      {children}
    </button>
  )
})

type CheckboxProps = Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'> & {
  label: React.ReactNode
}

export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(
  function Checkbox({ label, className, id, ...props }, ref) {
    const generatedId = useId()
    const fieldId = id ?? generatedId
    return (
      <label
        htmlFor={fieldId}
        className="group flex cursor-pointer select-none items-center gap-2.5 text-sm text-muted-foreground"
      >
        <span className="relative flex size-[18px] items-center justify-center">
          <input
            ref={ref}
            id={fieldId}
            type="checkbox"
            className={cn('peer size-[18px] appearance-none rounded-[5px] border border-input bg-card transition-colors checked:border-brand checked:bg-brand focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-brand/15', className)}
            {...props}
          />
          <Check
            className="pointer-events-none absolute size-3 text-brand-foreground opacity-0 peer-checked:opacity-100"
            strokeWidth={3}
            aria-hidden="true"
          />
        </span>
        {label}
      </label>
    )
  },
)
