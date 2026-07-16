'use client'

import { forwardRef, useId, useState } from 'react'
import { Eye, EyeOff, type LucideIcon } from 'lucide-react'
import { cn } from '@/lib/utils'

type BaseProps = React.InputHTMLAttributes<HTMLInputElement> & {
  label: string
  error?: string
  icon?: LucideIcon
  hint?: React.ReactNode
}

const fieldWrapper =
  'flex h-11 w-full items-center gap-2.5 rounded-lg border border-input bg-card px-3.5 text-sm shadow-sm transition-all duration-150 focus-within:border-brand focus-within:ring-4 focus-within:ring-brand/10 has-[input:disabled]:cursor-not-allowed has-[input:disabled]:opacity-60 has-[input[aria-invalid=true]]:border-destructive has-[input[aria-invalid=true]]:focus-within:border-destructive has-[input[aria-invalid=true]]:focus-within:ring-destructive/10'

const inputBase =
  'w-full bg-transparent text-foreground placeholder:text-muted-foreground/60 outline-none disabled:cursor-not-allowed'

export const TextField = forwardRef<HTMLInputElement, BaseProps>(
  function TextField({ label, error, icon: Icon, hint, className, id, ...props }, ref) {
    const generatedId = useId()
    const fieldId = id ?? generatedId
    const errorId = `${fieldId}-error`

    return (
      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <label htmlFor={fieldId} className="text-sm font-medium text-foreground">
            {label}
          </label>
          {hint}
        </div>
        <div className={fieldWrapper}>
          {Icon ? (
            <Icon className="size-4 shrink-0 text-muted-foreground" aria-hidden="true" />
          ) : null}
          <input
            ref={ref}
            id={fieldId}
            className={cn(inputBase, className)}
            aria-invalid={error ? true : undefined}
            aria-describedby={error ? errorId : undefined}
            {...props}
          />
        </div>
        {error ? (
          <p id={errorId} className="text-xs font-medium text-destructive">
            {error}
          </p>
        ) : null}
      </div>
    )
  },
)

export const PasswordField = forwardRef<HTMLInputElement, BaseProps>(
  function PasswordField({ label, error, icon: Icon, hint, className, id, ...props }, ref) {
    const generatedId = useId()
    const fieldId = id ?? generatedId
    const errorId = `${fieldId}-error`
    const [visible, setVisible] = useState(false)

    return (
      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <label htmlFor={fieldId} className="text-sm font-medium text-foreground">
            {label}
          </label>
          {hint}
        </div>
        <div className={fieldWrapper}>
          {Icon ? (
            <Icon className="size-4 shrink-0 text-muted-foreground" aria-hidden="true" />
          ) : null}
          <input
            ref={ref}
            id={fieldId}
            type={visible ? 'text' : 'password'}
            className={cn(inputBase, className)}
            aria-invalid={error ? true : undefined}
            aria-describedby={error ? errorId : undefined}
            {...props}
          />
          <button
            type="button"
            onClick={() => setVisible((v) => !v)}
            className="-mr-1 flex size-7 shrink-0 items-center justify-center rounded-md text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/40"
            aria-label={visible ? 'Hide password' : 'Show password'}
            aria-pressed={visible}
          >
            {visible ? (
              <EyeOff className="size-4" aria-hidden="true" />
            ) : (
              <Eye className="size-4" aria-hidden="true" />
            )}
          </button>
        </div>
        {error ? (
          <p id={errorId} className="text-xs font-medium text-destructive">
            {error}
          </p>
        ) : null}
      </div>
    )
  },
)
