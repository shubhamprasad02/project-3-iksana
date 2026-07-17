'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState, type FormEvent } from 'react'
import { Lock, Mail, User } from 'lucide-react'
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
  const [errors, setErrors] = useState<Errors>({})
  const [formError, setFormError] = useState<string>()

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setFormError(undefined)
    const form = new FormData(e.currentTarget)
    const name = String(form.get('name') ?? '').trim()
    const email = String(form.get('email') ?? '').trim()
    const password = String(form.get('password') ?? '')
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
      const { data: signUpData, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { full_name: name },
        },
      })
      if (error) {
        // "User already registered" gives a cleaner message
        if (error.message.toLowerCase().includes('already registered')) {
          setFormError('An account with this email already exists. Please sign in.')
        } else {
          setFormError(error.message)
        }
        setLoading(false)
        return
      }
      // If email confirmation is still on at the Supabase project level,
      // identities will be empty and there will be no session.
      if (!signUpData.session) {
        setFormError('Could not sign in automatically. Please go to Sign in and log in with your credentials.')
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

        <PasswordField
          label="Password"
          name="password"
          autoComplete="new-password"
          placeholder="Create a password (min. 8 characters)"
          icon={Lock}
          error={errors.password}
        />

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
