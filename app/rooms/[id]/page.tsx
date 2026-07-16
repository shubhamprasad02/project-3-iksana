import { notFound, redirect } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { ArrowLeft, MapPin, Users, Clock, IndianRupee } from 'lucide-react'
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

  const today = new Date().toISOString().slice(0, 10)
  const bookedSlots = await getBookedSlots(id, today)

  const primaryImage = images[0]?.image_url ?? null

  return (
    <div className="min-h-svh bg-background">
      <AppHeader userName={userName} />

      {/* Hero image — full width, tall */}
      <div className="relative h-64 w-full overflow-hidden bg-secondary sm:h-80 lg:h-96">
        {primaryImage ? (
          <Image
            src={primaryImage}
            alt={room.name}
            fill
            priority
            sizes="100vw"
            className="object-cover"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
            No image available
          </div>
        )}
        {/* dark gradient scrim */}
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />

        {/* Back button over hero */}
        <Link
          href="/dashboard"
          className="absolute left-4 top-4 inline-flex items-center gap-1.5 rounded-full bg-black/40 px-3 py-1.5 text-sm font-medium text-white backdrop-blur-sm transition-colors hover:bg-black/60 sm:left-6"
        >
          <ArrowLeft className="size-4" aria-hidden="true" />
          Back
        </Link>

        {/* Room name on hero */}
        <div className="absolute bottom-0 left-0 px-4 pb-5 sm:px-6">
          <h1 className="text-2xl font-bold text-white drop-shadow sm:text-3xl">
            {room.name}
          </h1>
          <div className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-white/80">
            <span className="inline-flex items-center gap-1.5">
              <MapPin className="size-3.5" aria-hidden="true" />
              {room.floor}
            </span>
            {room.capacity && (
              <span className="inline-flex items-center gap-1.5">
                <Users className="size-3.5" aria-hidden="true" />
                {room.capacity} seats
              </span>
            )}
          </div>
        </div>
      </div>

      <main className="mx-auto w-full max-w-6xl px-4 pb-16 pt-8 sm:px-6">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-5">

          {/* Left: room details */}
          <div className="space-y-6 lg:col-span-3">

            {/* Pricing tiles */}
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-2xl border border-border bg-card p-4 text-center shadow-sm">
                <div className="mb-1 flex items-center justify-center gap-1 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  <Clock className="size-3.5" aria-hidden="true" />
                  Per hour
                </div>
                <p className="text-2xl font-bold text-foreground">
                  ₹{Number(room.price_per_hour).toLocaleString('en-IN')}
                </p>
              </div>
              <div className="rounded-2xl border border-border bg-card p-4 text-center shadow-sm">
                <div className="mb-1 flex items-center justify-center gap-1 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  <IndianRupee className="size-3.5" aria-hidden="true" />
                  Per 30 min
                </div>
                <p className="text-2xl font-bold text-foreground">
                  ₹{Number(room.price_per_30_min).toLocaleString('en-IN')}
                </p>
              </div>
            </div>

            {/* Description */}
            {room.description && (
              <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
                <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                  About this room
                </h2>
                <p className="leading-relaxed text-foreground">
                  {room.description}
                </p>
              </div>
            )}
          </div>

          {/* Right: booking form */}
          <div className="lg:col-span-2">
            <div className="sticky top-20">
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
