'use client'

import Link from 'next/link'
import { useState, type FormEvent } from 'react'
import { ArrowLeft, Mail, MailCheck } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { TextField } from './form-field'
import { SubmitButton } from './controls'

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export function ForgotPasswordForm() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string>()
  const [sentTo, setSentTo] = useState<string>()

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const form = new FormData(e.currentTarget)
    const email = String(form.get('email') ?? '').trim()

    if (!email) return setError('Please enter your email address.')
    if (!EMAIL_RE.test(email)) return setError('Enter a valid email address.')
    setError(undefined)

    setLoading(true)
    try {
      const supabase = createClient()
      // We always show the success state regardless, to avoid leaking
      // whether an account exists.
      await supabase.auth.resetPasswordForEmail(email, {
        redirectTo:
          process.env.NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL ??
          `${window.location.origin}/auth/callback`,
      })
    } catch {
      // Intentionally ignored — see comment above.
    } finally {
      setLoading(false)
      setSentTo(email)
    }
  }

  if (sentTo) {
    return (
      <div>
        <span
          className="mb-6 flex size-12 items-center justify-center rounded-2xl bg-accent-yellow text-accent-yellow-foreground"
          aria-hidden="true"
        >
          <MailCheck className="size-6" />
        </span>
        <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
          Check your inbox
        </h1>
        <p className="mt-2 leading-relaxed text-muted-foreground">
          If an account exists for{' '}
          <span className="font-medium text-foreground">{sentTo}</span>, we&apos;ve
          sent a link to reset your password. It may take a minute to arrive.
        </p>

        <button
          type="button"
          onClick={() => setSentTo(undefined)}
          className="mt-6 text-sm font-medium text-brand underline-offset-4 transition-colors hover:underline"
        >
          Use a different email
        </button>

        <div className="mt-8">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm font-semibold text-foreground transition-colors hover:text-brand"
          >
            <ArrowLeft className="size-4" aria-hidden="true" />
            Back to sign in
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div>
      <header className="mb-8">
        <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
          Forgot password?
        </h1>
        <p className="mt-2 leading-relaxed text-muted-foreground">
          Enter the email tied to your account and we&apos;ll send you a secure
          reset link.
        </p>
      </header>

      <form onSubmit={handleSubmit} noValidate className="space-y-5">
        <TextField
          label="Email address"
          name="email"
          type="email"
          autoComplete="email"
          placeholder="you@company.com"
          icon={Mail}
          error={error}
        />

        <SubmitButton loading={loading}>
          {loading ? 'Sending link…' : 'Send reset link'}
        </SubmitButton>
      </form>

      <div className="mt-8 text-center">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm font-semibold text-foreground transition-colors hover:text-brand"
        >
          <ArrowLeft className="size-4" aria-hidden="true" />
          Back to sign in
        </Link>
      </div>
    </div>
  )
}
