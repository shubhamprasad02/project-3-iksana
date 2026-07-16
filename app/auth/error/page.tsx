import Link from 'next/link'
import { AlertCircle } from 'lucide-react'

export default function AuthErrorPage() {
  return (
    <main className="flex min-h-svh items-center justify-center p-6">
      <div className="max-w-sm text-center">
        <span className="mb-5 inline-flex size-14 items-center justify-center rounded-2xl bg-destructive/10 text-destructive">
          <AlertCircle className="size-7" />
        </span>
        <h1 className="text-xl font-bold text-foreground">Authentication failed</h1>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
          Something went wrong during sign-in. The link may have expired or already been used.
        </p>
        <Link
          href="/"
          className="mt-6 inline-flex items-center rounded-lg bg-brand px-4 py-2.5 text-sm font-semibold text-brand-foreground transition-colors hover:bg-brand/90"
        >
          Back to sign in
        </Link>
      </div>
    </main>
  )
}
