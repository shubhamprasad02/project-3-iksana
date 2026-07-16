import type { ReactNode } from 'react'
import { BrandMark } from './brand-mark'

const highlights = [
  'Real-time availability across every room and hall',
  'Instant confirmations and calendar sync',
  'Centralized billing for teams and departments',
]

export function AuthShell({ children }: { children: ReactNode }) {
  return (
    <main className="flex min-h-svh w-full bg-background">
      {/* Brand / visual panel */}
      <aside className="relative hidden w-[46%] max-w-[640px] shrink-0 overflow-hidden bg-brand lg:block">
        <img
          src="/images/meeting-room.png"
          alt="A premium modern corporate meeting room with a polished conference table and floor-to-ceiling windows"
          className="absolute inset-0 size-full object-cover opacity-25"
        />
        <div
          className="absolute inset-0 bg-brand/70"
          aria-hidden="true"
        />

        <div className="relative z-10 flex h-full flex-col justify-between p-10 xl:p-14">
          <BrandMark variant="light" />

          <div className="max-w-md">
            <h2 className="text-pretty text-3xl font-bold leading-tight tracking-tight text-brand-foreground xl:text-4xl">
              Where great meetings begin.
            </h2>
            <p className="mt-4 text-pretty leading-relaxed text-brand-foreground/70">
              Book meeting rooms and event halls in seconds. iKSANA Workspace
              keeps your spaces organized, your teams aligned, and your calendar
              effortless.
            </p>

            <ul className="mt-8 space-y-3.5">
              {highlights.map((item) => (
                <li key={item} className="flex items-start gap-3">
                  <span
                    className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full bg-accent-yellow text-accent-yellow-foreground"
                    aria-hidden="true"
                  >
                    <svg viewBox="0 0 24 24" fill="none" className="size-3" strokeWidth={3}>
                      <path
                        d="M5 13l4 4L19 7"
                        stroke="currentColor"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </span>
                  <span className="text-sm leading-relaxed text-brand-foreground/80">
                    {item}
                  </span>
                </li>
              ))}
            </ul>
          </div>

          <span aria-hidden="true" />
        </div>
      </aside>

      {/* Form panel */}
      <section className="flex flex-1 flex-col items-center justify-center px-5 py-10 sm:px-8">
        <div className="w-full max-w-[420px]">
          <div className="mb-8 lg:hidden">
            <BrandMark />
          </div>
          {children}
        </div>
      </section>
    </main>
  )
}
