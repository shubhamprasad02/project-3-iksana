import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getRooms } from '@/lib/rooms'
import { getMyUpcomingBookings } from '@/lib/bookings'
import { AppHeader } from '@/components/app/app-header'
import { RoomCard } from '@/components/app/room-card'
import { UpcomingBookings } from '@/components/app/upcoming-bookings'

export default async function DashboardPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/')

  const [rooms, bookings] = await Promise.all([
    getRooms(),
    getMyUpcomingBookings(),
  ])

  const fullName =
    (user.user_metadata?.full_name as string | undefined) ??
    user.email?.split('@')[0]

  return (
    <div className="min-h-dvh bg-background">
      <AppHeader userName={fullName} />

      <main className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 sm:py-10">
        <div className="mb-8">
          <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
            Book a space
          </h1>
          <p className="mt-2 leading-relaxed text-muted-foreground">
            Choose a meeting room or hall to see availability and reserve your
            time slot.
          </p>
        </div>

        <UpcomingBookings bookings={bookings} />

        <section aria-labelledby="rooms-heading">
          <h2
            id="rooms-heading"
            className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted-foreground"
          >
            All spaces
          </h2>
          {rooms.length === 0 ? (
            <p className="rounded-xl border border-dashed border-border bg-card p-8 text-center text-muted-foreground">
              No rooms are available yet.
            </p>
          ) : (
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {rooms.map((room) => (
                <RoomCard key={room.id} room={room} />
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  )
}
