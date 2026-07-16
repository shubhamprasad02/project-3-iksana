import Link from 'next/link'
import Image from 'next/image'
import { MapPin, Users, ArrowRight } from 'lucide-react'
import type { RoomWithImage } from '@/lib/rooms'

export function RoomCard({ room }: { room: RoomWithImage }) {
  return (
    <Link
      href={`/rooms/${room.id}`}
      className="group relative flex flex-col overflow-hidden rounded-2xl bg-card shadow-sm ring-1 ring-border transition-all duration-200 hover:-translate-y-1 hover:shadow-xl hover:ring-brand/30 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 focus-visible:ring-offset-background"
      aria-label={`Book ${room.name} — ${room.floor}`}
    >
      {/* Photo */}
      <div className="relative h-60 w-full overflow-hidden bg-secondary sm:h-64">
        {room.image_url ? (
          <Image
            src={room.image_url}
            alt={room.name}
            fill
            sizes="(max-width: 640px) 100vw, 50vw"
            className="object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
            No photo
          </div>
        )}

        {/* Price badge */}
        <span className="absolute right-3 top-3 rounded-full bg-black/55 px-2.5 py-1 text-xs font-semibold text-white backdrop-blur-sm">
          ₹{Number(room.price_per_hour).toLocaleString('en-IN')}/hr
        </span>

        {/* Gradient scrim at bottom of photo */}
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-black/60 to-transparent" />

        {/* Capacity overlay on photo */}
        {room.capacity && (
          <span className="absolute bottom-3 left-3 inline-flex items-center gap-1.5 text-xs font-medium text-white/90">
            <Users className="size-3.5" aria-hidden="true" />
            {room.capacity} seats
          </span>
        )}
      </div>

      {/* Info below photo */}
      <div className="flex items-center justify-between gap-3 px-4 py-4">
        <div className="min-w-0">
          <h3 className="truncate text-base font-semibold text-foreground group-hover:text-brand transition-colors duration-150">
            {room.name}
          </h3>
          <span className="mt-0.5 inline-flex items-center gap-1 text-sm text-muted-foreground">
            <MapPin className="size-3.5 shrink-0" aria-hidden="true" />
            {room.floor}
          </span>
        </div>

        {/* Book now CTA */}
        <span className="inline-flex shrink-0 items-center gap-1.5 rounded-xl bg-brand px-4 py-2 text-sm font-semibold text-brand-foreground transition-colors group-hover:bg-brand/85">
          Book
          <ArrowRight className="size-3.5 transition-transform duration-150 group-hover:translate-x-0.5" aria-hidden="true" />
        </span>
      </div>
    </Link>
  )
}
