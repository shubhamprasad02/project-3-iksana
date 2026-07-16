import Link from 'next/link'
import { BrandMark } from '@/components/auth/brand-mark'
import { SignOutButton } from './sign-out-button'

export function AppHeader({ userName }: { userName?: string | null }) {
  const initials = getInitials(userName)

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/90 backdrop-blur-md">
      <div className="mx-auto flex h-14 w-full max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
        <Link href="/dashboard" className="shrink-0" aria-label="Go to dashboard">
          <BrandMark variant="dark" />
        </Link>

        <div className="flex items-center gap-2.5">
          {/* Avatar + name */}
          <div className="flex items-center gap-2">
            <span
              className="flex size-8 items-center justify-center rounded-full bg-brand text-xs font-bold text-brand-foreground"
              aria-hidden="true"
            >
              {initials}
            </span>
            {userName && (
              <span className="hidden text-sm font-medium text-foreground sm:inline">
                {userName}
              </span>
            )}
          </div>
          <div className="h-4 w-px bg-border" aria-hidden="true" />
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
