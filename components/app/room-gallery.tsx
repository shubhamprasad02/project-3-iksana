'use client'

import { useState } from 'react'
import Image from 'next/image'
import type { RoomImage } from '@/lib/rooms'

export function RoomGallery({
  images,
  name,
}: {
  images: RoomImage[]
  name: string
}) {
  const [active, setActive] = useState(0)
  const list = images.length ? images : [{ id: 'ph', image_url: '/placeholder.svg', sort_order: 0 }]

  return (
    <div>
      <div className="relative aspect-[16/10] w-full overflow-hidden rounded-2xl border border-border bg-secondary">
        <Image
          src={list[active].image_url || '/placeholder.svg'}
          alt={name}
          fill
          priority
          sizes="(max-width: 1024px) 100vw, 60vw"
          className="object-cover"
        />
      </div>

      {list.length > 1 ? (
        <div className="mt-3 flex gap-2">
          {list.map((img, i) => (
            <button
              key={img.id}
              type="button"
              onClick={() => setActive(i)}
              className={`relative aspect-video w-24 shrink-0 overflow-hidden rounded-lg border-2 transition-colors ${
                i === active ? 'border-brand' : 'border-transparent opacity-70 hover:opacity-100'
              }`}
            >
              <Image
                src={img.image_url || '/placeholder.svg'}
                alt={`${name} view ${i + 1}`}
                fill
                sizes="96px"
                className="object-cover"
              />
            </button>
          ))}
        </div>
      ) : null}
    </div>
  )
}
