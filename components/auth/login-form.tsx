'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState, type FormEvent } from 'react'
import { Lock, Mail } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { TextField, PasswordField } from './form-field'
import { SubmitButton, Checkbox } from './controls'

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export function LoginForm() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [formError, setFormError] = useState<string>()
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({})

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setFormError(undefined)
    const form = new FormData(e.currentTarget)
    const email = String(form.get('email') ?? '').trim()
    const password = String(form.get('password') ?? '')

    const next: typeof errors = {}
    if (!email) next.email = 'Please enter your email address.'
    else if (!EMAIL_RE.test(email)) next.email = 'Enter a valid email address.'
    if (!password) next.password = 'Please enter your password.'

    setErrors(next)
    if (Object.keys(next).length > 0) return

    setLoading(true)
    try {
      const supabase = createClient()
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })
      if (error) {
        setFormError('Incorrect email or password. Please try again.')
        setLoading(false)
        return
      }
      router.push('/dashboard')
      router.refresh()
    } catch {
      setFormError('Something went wrong. Please try again.')
      setLoading(false)
    }
  }

  return (
    <div>
      <header className="mb-8">
        <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
          Welcome back
        </h1>
        <p className="mt-2 leading-relaxed text-muted-foreground">
          Sign in to manage your room reservations and events.
        </p>
      </header>

      <form onSubmit={handleSubmit} noValidate className="space-y-5">
        {formError ? (
          <div
            role="alert"
            className="rounded-lg border border-destructive/30 bg-destructive/5 px-3.5 py-3 text-sm font-medium text-destructive"
          >
            {formError}
          </div>
        ) : null}

        <TextField
          label="Email address"
          name="email"
          type="email"
          autoComplete="email"
          placeholder="you@company.com"
          icon={Mail}
          error={errors.email}
        />

        <PasswordField
          label="Password"
          name="password"
          autoComplete="current-password"
          placeholder="Enter your password"
          icon={Lock}
          error={errors.password}
          hint={
            <Link
              href="/forgot-password"
              className="text-sm font-medium text-brand underline-offset-4 transition-colors hover:text-brand/70 hover:underline"
            >
              Forgot password?
            </Link>
          }
        />

        <div className="flex items-center justify-between pt-0.5">
          <Checkbox name="remember" label="Remember me" defaultChecked />
        </div>

        <SubmitButton loading={loading}>
          {loading ? 'Signing in…' : 'Sign in'}
        </SubmitButton>
      </form>

      <p className="mt-8 text-center text-sm text-muted-foreground">
        {"Don't have an account? "}
        <Link
          href="/signup"
          className="font-semibold text-brand underline-offset-4 transition-colors hover:underline"
        >
          Create one
        </Link>
      </p>
    </div>
  )
}
