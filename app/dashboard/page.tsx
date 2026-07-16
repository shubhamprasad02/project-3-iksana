import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { AppHeader } from '@/components/app/app-header'
import { RoomCard } from '@/components/app/room-card'
import { BookingRow } from '@/components/app/booking-row'
import { getRooms } from '@/lib/rooms'
import { getMyUpcomingBookings } from '@/lib/bookings'

export default async function DashboardPage() {
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

  const [rooms, upcomingBookings] = await Promise.all([
    getRooms(),
    getMyUpcomingBookings(),
  ])

  const firstName = userName?.split(' ')[0] ?? null

  return (
    <div className="min-h-svh bg-background">
      <AppHeader userName={userName} />

      <main className="mx-auto w-full max-w-6xl px-4 pb-16 pt-10 sm:px-6">
        {/* Greeting */}
        <div className="mb-10">
          <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
            {firstName ? `Welcome back, ${firstName}.` : 'Welcome back.'}
          </h1>
          <p className="mt-1.5 text-muted-foreground">
            Browse available rooms and manage your upcoming bookings.
          </p>
        </div>

        {/* Upcoming bookings */}
        {upcomingBookings.length > 0 && (
          <section className="mb-12" aria-labelledby="upcoming-heading">
            <h2
              id="upcoming-heading"
              className="mb-4 text-lg font-semibold text-foreground"
            >
              Upcoming bookings
            </h2>
            <div className="divide-y divide-border overflow-hidden rounded-xl border border-border bg-card">
              {upcomingBookings.map((booking) => (
                <BookingRow key={booking.id} booking={booking} />
              ))}
            </div>
          </section>
        )}

        {/* Available rooms */}
        <section aria-labelledby="rooms-heading">
          <h2
            id="rooms-heading"
            className="mb-4 text-lg font-semibold text-foreground"
          >
            Available rooms
          </h2>
          {rooms.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No rooms available at the moment.
            </p>
          ) : (
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
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
