import { notFound, redirect } from 'next/navigation'
import Link from 'next/link'
import { CheckCircle2, Calendar, Clock, MapPin, Users } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { AppHeader } from '@/components/app/app-header'

interface Props {
  params: Promise<{ id: string }>
}

function formatTime(t: string) {
  const [h, m] = t.split(':').map(Number)
  const period = h >= 12 ? 'PM' : 'AM'
  const hour = h % 12 || 12
  return `${hour}:${String(m).padStart(2, '0')} ${period}`
}

function formatDate(dateStr: string) {
  const d = new Date(`${dateStr}T00:00:00`)
  return d.toLocaleDateString('en-IN', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}

export default async function BookingSuccessPage({ params }: Props) {
  const { id } = await params

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/')

  const profile = await supabase
    .from('profiles')
    .select('full_name')
    .eq('id', user.id)
    .single()
  const userName =
    profile.data?.full_name ?? user.user_metadata?.full_name ?? null

  const { data: booking, error } = await supabase
    .from('bookings')
    .select(
      'id, room_id, booking_date, day_name, start_time, end_time, duration_minutes, total_price, booking_status, rooms(name, floor, capacity)',
    )
    .eq('id', id)
    .eq('user_id', user.id)
    .single()

  if (error || !booking) notFound()

  const room = booking.rooms as { name: string; floor: string; capacity: number | null } | null
  // end_time stored in DB is already the actual end (e.g. "14:30") — use it directly
  const endTimeStr = booking.end_time

  return (
    <div className="min-h-svh bg-background">
      <AppHeader userName={userName} />

      <main className="mx-auto flex w-full max-w-xl flex-col items-center px-4 pb-16 pt-16 sm:px-6">
        {/* Success icon */}
        <span className="mb-6 flex size-16 items-center justify-center rounded-full bg-brand/10 text-brand">
          <CheckCircle2 className="size-9" strokeWidth={1.75} />
        </span>

        <h1 className="text-center text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
          Booking confirmed!
        </h1>
        <p className="mt-2 text-center text-muted-foreground">
          Your room has been reserved. See the details below.
        </p>

        {/* Booking card */}
        <div className="mt-8 w-full overflow-hidden rounded-2xl border border-border bg-card">
          <div className="border-b border-border bg-brand px-5 py-4">
            <p className="text-xs font-semibold uppercase tracking-widest text-brand-foreground/70">
              Booking reference
            </p>
            <p className="mt-0.5 font-mono text-sm font-medium text-brand-foreground">
              {booking.id.slice(0, 8).toUpperCase()}
            </p>
          </div>

          <div className="divide-y divide-border">
            {room && (
              <>
                <Row icon={<MapPin className="size-4" />} label="Room">
                  <span className="font-semibold">{room.name}</span>
                  <span className="text-muted-foreground"> — {room.floor}</span>
                </Row>
                {room.capacity && (
                  <Row icon={<Users className="size-4" />} label="Capacity">
                    {room.capacity} seats
                  </Row>
                )}
              </>
            )}
            <Row icon={<Calendar className="size-4" />} label="Date">
              {formatDate(booking.booking_date)}
            </Row>
            <Row icon={<Clock className="size-4" />} label="Time">
              {formatTime(booking.start_time)} – {formatTime(endTimeStr)}
              <span className="ml-2 text-muted-foreground">
                ({booking.duration_minutes >= 60
                  ? `${booking.duration_minutes / 60} hr${booking.duration_minutes > 60 ? 's' : ''}`
                  : `${booking.duration_minutes} min`})
              </span>
            </Row>
          </div>

          <div className="flex items-center justify-between bg-secondary px-5 py-4">
            <span className="text-sm font-medium text-foreground">Total paid</span>
            <span className="text-lg font-bold text-foreground">
              ₹{Number(booking.total_price).toLocaleString('en-IN')}
            </span>
          </div>
        </div>

        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <Link
            href="/dashboard"
            className="inline-flex items-center justify-center rounded-xl bg-brand px-6 py-2.5 text-sm font-semibold text-brand-foreground transition-colors hover:bg-brand/90"
          >
            Back to dashboard
          </Link>
          <Link
            href="/dashboard"
            className="inline-flex items-center justify-center rounded-xl border border-border bg-card px-6 py-2.5 text-sm font-semibold text-foreground transition-colors hover:bg-secondary"
          >
            Book another room
          </Link>
        </div>
      </main>
    </div>
  )
}

function Row({
  icon,
  label,
  children,
}: {
  icon: React.ReactNode
  label: string
  children: React.ReactNode
}) {
  return (
    <div className="flex items-start gap-3 px-5 py-3.5 text-sm">
      <span className="mt-0.5 text-muted-foreground" aria-hidden="true">
        {icon}
      </span>
      <div className="flex flex-1 flex-col gap-0.5 sm:flex-row sm:items-center sm:justify-between">
        <span className="text-muted-foreground">{label}</span>
        <span className="text-right font-medium text-foreground">{children}</span>
      </div>
    </div>
  )
}
