import Link from 'next/link'
import { BrandMark } from '@/components/auth/brand-mark'
import { SignOutButton } from './sign-out-button'

export function AppHeader({ userName }: { userName?: string | null }) {
  const initials = getInitials(userName)

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/85 backdrop-blur">
      <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
        <Link href="/dashboard" className="shrink-0">
          <BrandMark variant="dark" />
        </Link>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2.5">
            <span
              className="flex size-9 items-center justify-center rounded-full bg-brand text-sm font-semibold text-brand-foreground"
              aria-hidden="true"
            >
              {initials}
            </span>
            {userName ? (
              <span className="hidden text-sm font-medium text-foreground sm:inline">
                {userName}
              </span>
            ) : null}
          </div>
          <SignOutButton />
        </div>
      </div>
    </header>
  )
}

function getInitials(name?: string | null) {
  if (!name) return 'U'
  const parts = name.trim().split(/\s+/)
  const first = parts[0]?.[0] ?? ''
  const second = parts[1]?.[0] ?? ''
  return (first + second).toUpperCase() || 'U'
}
