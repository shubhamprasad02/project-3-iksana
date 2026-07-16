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

      <main className="mx-auto w-full max-w-6xl px-4 pb-16 pt-8 sm:px-6">

        {/* Upcoming bookings */}
        {upcomingBookings.length > 0 && (
          <section className="mb-10" aria-labelledby="upcoming-heading">
            <div className="mb-4 flex items-center justify-between">
              <h2
                id="upcoming-heading"
                className="text-lg font-semibold text-foreground"
              >
                Your upcoming bookings
              </h2>
            </div>
            <div className="divide-y divide-border overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
              {upcomingBookings.map((booking) => (
                <BookingRow key={booking.id} booking={booking} />
              ))}
            </div>
          </section>
        )}

        {/* Available rooms */}
        <section aria-labelledby="rooms-heading">
          <div className="mb-5">
            <h2
              id="rooms-heading"
              className="text-xl font-bold text-foreground"
            >
              {firstName ? `Hi ${firstName}, pick a room` : 'Pick a room'}
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Select a space below to view availability and book your slot.
            </p>
          </div>
          {rooms.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No rooms available at the moment.
            </p>
          ) : (
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-2">
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
