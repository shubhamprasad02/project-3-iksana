import Link from 'next/link'
import { notFound, redirect } from 'next/navigation'
import { ArrowLeft, MapPin, Users } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { getRoom } from '@/lib/rooms'
import { AppHeader } from '@/components/app/app-header'
import { RoomGallery } from '@/components/app/room-gallery'
import { BookingPanel } from '@/components/app/booking-panel'

export default async function RoomPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/')

  const data = await getRoom(id)
  if (!data) notFound()

  const { room, images } = data
  const fullName =
    (user.user_metadata?.full_name as string | undefined) ??
    user.email?.split('@')[0]

  return (
    <div className="min-h-dvh bg-background">
      <AppHeader userName={fullName} />

      <main className="mx-auto w-full max-w-6xl px-4 py-6 sm:px-6 sm:py-8">
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="size-4" aria-hidden="true" />
          Back to all spaces
        </Link>

        <div className="mt-5 grid grid-cols-1 gap-8 lg:grid-cols-[1.4fr_1fr]">
          <div>
            <RoomGallery images={images} name={room.name} />

            <div className="mt-6">
              <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
                {room.name}
              </h1>
              <div className="mt-3 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-muted-foreground">
                <span className="inline-flex items-center gap-1.5">
                  <MapPin className="size-4" aria-hidden="true" />
                  {room.floor}
                </span>
                {room.capacity ? (
                  <span className="inline-flex items-center gap-1.5">
                    <Users className="size-4" aria-hidden="true" />
                    Up to {room.capacity} people
                  </span>
                ) : null}
              </div>

              {room.description ? (
                <p className="mt-4 max-w-prose leading-relaxed text-muted-foreground">
                  {room.description}
                </p>
              ) : null}
            </div>
          </div>

          <div className="lg:sticky lg:top-24 lg:self-start">
            <BookingPanel room={room} />
          </div>
        </div>
      </main>
    </div>
  )
}
