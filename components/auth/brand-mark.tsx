import { cn } from '@/lib/utils'

export function BrandMark({
  className,
  variant = 'dark',
}: {
  className?: string
  /** "dark" for light backgrounds, "light" for dark/brand backgrounds */
  variant?: 'dark' | 'light'
}) {
  const isLight = variant === 'light'
  return (
    <div className={cn('flex items-center gap-2.5', className)}>
      <span
        className={cn(
          'flex size-9 items-center justify-center rounded-xl',
          isLight ? 'bg-accent-yellow text-accent-yellow-foreground' : 'bg-brand text-brand-foreground',
        )}
        aria-hidden="true"
      >
        <svg viewBox="0 0 24 24" fill="none" className="size-5" strokeWidth={2}>
          <path
            d="M4 19V8.5L12 4l8 4.5V19"
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M9 19v-4.5a3 3 0 0 1 6 0V19"
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </span>
        <span
          className={cn(
            'text-lg font-bold tracking-tight',
            isLight ? 'text-brand-foreground' : 'text-foreground',
          )}
        >
          <span className="lowercase">i</span>KSANA{' '}
          <span className="font-medium opacity-80">Workspace</span>
        </span>
    </div>
  )
}
