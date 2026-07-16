import { CalendarDays, Clock } from 'lucide-react'
import type { Booking } from '@/lib/bookings'
import { formatDate, formatTime } from '@/lib/format'

export function UpcomingBookings({ bookings }: { bookings: Booking[] }) {
  if (bookings.length === 0) return null

  return (
    <section aria-labelledby="upcoming-heading" className="mb-10">
      <h2
        id="upcoming-heading"
        className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted-foreground"
      >
        Your upcoming bookings
      </h2>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {bookings.map((b) => (
          <div
            key={b.id}
            className="rounded-xl border border-border bg-card p-4"
          >
            <div className="flex items-center justify-between gap-2">
              <h3 className="font-semibold text-foreground">
                {b.rooms?.name ?? 'Room'}
              </h3>
              <span className="rounded-full bg-brand/10 px-2 py-0.5 text-xs font-medium text-brand">
                Confirmed
              </span>
            </div>
            <div className="mt-3 space-y-1.5 text-sm text-muted-foreground">
              <p className="inline-flex items-center gap-2">
                <CalendarDays className="size-3.5" aria-hidden="true" />
                {formatDate(b.booking_date)}
              </p>
              <p className="inline-flex items-center gap-2">
                <Clock className="size-3.5" aria-hidden="true" />
                {formatTime(b.start_time)} – {formatTime(b.end_time)}
              </p>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}
