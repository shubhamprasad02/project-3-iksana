import Link from 'next/link'
import Image from 'next/image'
import { MapPin, Users } from 'lucide-react'
import type { RoomWithImage } from '@/lib/rooms'

export function RoomCard({ room }: { room: RoomWithImage }) {
  return (
    <Link
      href={`/rooms/${room.id}`}
      className="group flex flex-col overflow-hidden rounded-2xl border border-border bg-card transition-all hover:-translate-y-0.5 hover:shadow-lg hover:shadow-brand/5 focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
    >
      <div className="relative aspect-[4/3] w-full overflow-hidden bg-secondary">
        <Image
          src={room.image_url || '/placeholder.svg'}
          alt={room.name}
          fill
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          className="object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <span className="absolute right-3 top-3 rounded-full bg-background/90 px-2.5 py-1 text-xs font-semibold text-foreground backdrop-blur">
          ₹{room.price_per_hour}/hr
        </span>
      </div>

      <div className="flex flex-1 flex-col p-4">
        <h3 className="text-pretty text-base font-semibold text-foreground">
          {room.name}
        </h3>
        <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-sm text-muted-foreground">
          <span className="inline-flex items-center gap-1.5">
            <MapPin className="size-3.5" aria-hidden="true" />
            {room.floor}
          </span>
          {room.capacity ? (
            <span className="inline-flex items-center gap-1.5">
              <Users className="size-3.5" aria-hidden="true" />
              {room.capacity} seats
            </span>
          ) : null}
        </div>
      </div>
    </Link>
  )
}
