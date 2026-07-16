'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState, type FormEvent } from 'react'
import { Lock, Mail, MailCheck, User } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { TextField, PasswordField } from './form-field'
import { SubmitButton, Checkbox } from './controls'

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

type Errors = {
  name?: string
  email?: string
  password?: string
  terms?: string
}

export function SignupForm() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [password, setPassword] = useState('')
  const [errors, setErrors] = useState<Errors>({})
  const [formError, setFormError] = useState<string>()
  const [sentTo, setSentTo] = useState<string>()

  const strength = getStrength(password)

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setFormError(undefined)
    const form = new FormData(e.currentTarget)
    const name = String(form.get('name') ?? '').trim()
    const email = String(form.get('email') ?? '').trim()
    const terms = form.get('terms') === 'on'

    const next: Errors = {}
    if (!name) next.name = 'Please enter your full name.'
    if (!email) next.email = 'Please enter your email address.'
    else if (!EMAIL_RE.test(email)) next.email = 'Enter a valid email address.'
    if (!password) next.password = 'Please create a password.'
    else if (password.length < 8) next.password = 'Use at least 8 characters.'
    if (!terms) next.terms = 'Please accept the terms to continue.'

    setErrors(next)
    if (Object.keys(next).length > 0) return

    setLoading(true)
    try {
      const supabase = createClient()
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo:
            process.env.NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL ??
            `${window.location.origin}/auth/callback`,
          data: { full_name: name },
        },
      })
      if (error) {
        setFormError(error.message)
        setLoading(false)
        return
      }
      // If email confirmation is on, there is no active session yet.
      if (data.session) {
        router.push('/dashboard')
        router.refresh()
      } else {
        setSentTo(email)
        setLoading(false)
      }
    } catch {
      setFormError('Something went wrong. Please try again.')
      setLoading(false)
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
          Confirm your email
        </h1>
        <p className="mt-2 leading-relaxed text-muted-foreground">
          We&apos;ve sent a confirmation link to{' '}
          <span className="font-medium text-foreground">{sentTo}</span>. Click it
          to activate your account, then sign in.
        </p>
        <div className="mt-8">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm font-semibold text-foreground transition-colors hover:text-brand"
          >
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
          Create your account
        </h1>
        <p className="mt-2 leading-relaxed text-muted-foreground">
          Start booking meeting rooms and halls in minutes.
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
          label="Full name"
          name="name"
          autoComplete="name"
          placeholder="Jordan Avery"
          icon={User}
          error={errors.name}
        />

        <TextField
          label="Work email"
          name="email"
          type="email"
          autoComplete="email"
          placeholder="you@company.com"
          icon={Mail}
          error={errors.email}
        />

        <div>
          <PasswordField
            label="Password"
            name="password"
            autoComplete="new-password"
            placeholder="Create a strong password"
            icon={Lock}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            error={errors.password}
          />
          {password && !errors.password ? (
            <div className="mt-2.5 flex items-center gap-3">
              <div className="flex flex-1 gap-1.5" aria-hidden="true">
                {[0, 1, 2, 3].map((i) => (
                  <span
                    key={i}
                    className="h-1.5 flex-1 rounded-full transition-colors"
                    style={{
                      backgroundColor:
                        i < strength.score ? strength.color : 'var(--border)',
                    }}
                  />
                ))}
              </div>
              <span className="text-xs font-medium text-muted-foreground">
                {strength.label}
              </span>
            </div>
          ) : null}
        </div>

        <div>
          <Checkbox
            name="terms"
            label={
              <span className="leading-relaxed">
                I agree to the{' '}
                <Link href="#" className="font-medium text-brand underline-offset-4 hover:underline">
                  Terms of Service
                </Link>{' '}
                and{' '}
                <Link href="#" className="font-medium text-brand underline-offset-4 hover:underline">
                  Privacy Policy
                </Link>
                .
              </span>
            }
          />
          {errors.terms ? (
            <p className="mt-1.5 text-xs font-medium text-destructive">{errors.terms}</p>
          ) : null}
        </div>

        <SubmitButton loading={loading}>
          {loading ? 'Creating account…' : 'Create account'}
        </SubmitButton>
      </form>

      <p className="mt-8 text-center text-sm text-muted-foreground">
        Already have an account?{' '}
        <Link
          href="/"
          className="font-semibold text-brand underline-offset-4 transition-colors hover:underline"
        >
          Sign in
        </Link>
      </p>
    </div>
  )
}

function getStrength(password: string) {
  let score = 0
  if (password.length >= 8) score++
  if (/[A-Z]/.test(password) && /[a-z]/.test(password)) score++
  if (/\d/.test(password)) score++
  if (/[^A-Za-z0-9]/.test(password)) score++

  const map = [
    { label: 'Weak', color: 'var(--destructive)' },
    { label: 'Weak', color: 'var(--destructive)' },
    { label: 'Fair', color: '#c9a227' },
    { label: 'Good', color: '#7a8b1f' },
    { label: 'Strong', color: 'var(--brand)' },
  ]
  return { score, ...map[score] }
}
