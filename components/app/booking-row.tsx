import { Calendar, Clock, MapPin } from 'lucide-react'
import type { Booking } from '@/lib/bookings'

function formatTime(t: string) {
  const [h, m] = t.split(':').map(Number)
  const period = h >= 12 ? 'PM' : 'AM'
  const hour = h % 12 || 12
  return `${hour}:${String(m).padStart(2, '0')} ${period}`
}

function formatDate(dateStr: string) {
  const d = new Date(`${dateStr}T00:00:00`)
  return d.toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

export function BookingRow({ booking }: { booking: Booking }) {
  const roomName = booking.rooms?.name ?? 'Unknown room'
  const floor = booking.rooms?.floor ?? ''

  return (
    <div className="flex flex-col gap-3 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex flex-col gap-1.5">
        <p className="font-semibold text-foreground">{roomName}</p>
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground">
          {floor && (
            <span className="inline-flex items-center gap-1.5">
              <MapPin className="size-3.5" aria-hidden="true" />
              {floor}
            </span>
          )}
          <span className="inline-flex items-center gap-1.5">
            <Calendar className="size-3.5" aria-hidden="true" />
            {booking.day_name}, {formatDate(booking.booking_date)}
          </span>
          <span className="inline-flex items-center gap-1.5">
            <Clock className="size-3.5" aria-hidden="true" />
            {formatTime(booking.start_time)} – {formatTime(booking.end_time)}
          </span>
        </div>
      </div>
      <div className="flex shrink-0 items-center gap-3">
        <span className="rounded-full border border-brand/20 bg-brand/8 px-2.5 py-1 text-xs font-semibold text-brand">
          Confirmed
        </span>
        <span className="text-sm font-semibold text-foreground">
          ₹{Number(booking.total_price).toLocaleString('en-IN')}
        </span>
      </div>
    </div>
  )
}
