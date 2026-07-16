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
