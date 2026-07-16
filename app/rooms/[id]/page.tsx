import { notFound, redirect } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { ArrowLeft, MapPin, Users } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { AppHeader } from '@/components/app/app-header'
import { BookingForm } from '@/components/app/booking-form'
import { getRoom } from '@/lib/rooms'
import { getBookedSlots } from '@/lib/bookings'

interface Props {
  params: Promise<{ id: string }>
}

export default async function RoomDetailPage({ params }: Props) {
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

  const result = await getRoom(id)
  if (!result) notFound()

  const { room, images } = result

  // Pre-fetch today's booked slots
  const today = new Date().toISOString().slice(0, 10)
  const bookedSlots = await getBookedSlots(id, today)

  const primaryImage = images[0]?.image_url ?? null

  return (
    <div className="min-h-svh bg-background">
      <AppHeader userName={userName} />

      <main className="mx-auto w-full max-w-6xl px-4 pb-16 pt-8 sm:px-6">
        {/* Back */}
        <Link
          href="/dashboard"
          className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="size-4" aria-hidden="true" />
          Back to rooms
        </Link>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-5">
          {/* Left: room info */}
          <div className="lg:col-span-3">
            <div className="overflow-hidden rounded-2xl border border-border bg-card">
              {/* Image */}
              <div className="relative aspect-[16/9] w-full overflow-hidden bg-secondary">
                {primaryImage ? (
                  <Image
                    src={primaryImage}
                    alt={room.name}
                    fill
                    priority
                    sizes="(max-width: 1024px) 100vw, 60vw"
                    className="object-cover"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
                    No image available
                  </div>
                )}
              </div>

              {/* Info */}
              <div className="p-6">
                <h1 className="text-2xl font-bold tracking-tight text-foreground">
                  {room.name}
                </h1>

                <div className="mt-3 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-muted-foreground">
                  <span className="inline-flex items-center gap-1.5">
                    <MapPin className="size-4" aria-hidden="true" />
                    {room.floor}
                  </span>
                  {room.capacity && (
                    <span className="inline-flex items-center gap-1.5">
                      <Users className="size-4" aria-hidden="true" />
                      {room.capacity} seats
                    </span>
                  )}
                </div>

                {room.description && (
                  <p className="mt-4 leading-relaxed text-muted-foreground">
                    {room.description}
                  </p>
                )}

                <div className="mt-6 flex flex-wrap gap-3">
                  <div className="rounded-xl border border-border bg-secondary px-4 py-3 text-center">
                    <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                      Per hour
                    </p>
                    <p className="mt-0.5 text-lg font-bold text-foreground">
                      ₹{Number(room.price_per_hour).toLocaleString('en-IN')}
                    </p>
                  </div>
                  <div className="rounded-xl border border-border bg-secondary px-4 py-3 text-center">
                    <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                      Per 30 min
                    </p>
                    <p className="mt-0.5 text-lg font-bold text-foreground">
                      ₹{Number(room.price_per_30_min).toLocaleString('en-IN')}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right: booking form */}
          <div className="lg:col-span-2">
            <div className="sticky top-24">
              <BookingForm
                room={room}
                initialBookedSlots={bookedSlots}
                userId={user.id}
              />
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
