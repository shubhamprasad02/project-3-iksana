import { createClient } from '@/lib/supabase/server'

export type Room = {
  id: string
  name: string
  floor: string
  description: string | null
  price_per_hour: number
  price_per_30_min: number
  capacity: number | null
}

export type RoomWithImage = Room & { image_url: string | null }

export type RoomImage = {
  id: string
  image_url: string
  sort_order: number
}

export async function getRooms(): Promise<RoomWithImage[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('rooms')
    .select('*, room_images(image_url, sort_order)')
    .order('created_at', { ascending: true })

  if (error || !data) return []

  return data.map((room: any) => {
    const images = (room.room_images ?? []).sort(
      (a: RoomImage, b: RoomImage) => a.sort_order - b.sort_order,
    )
    return {
      id: room.id,
      name: room.name,
      floor: room.floor,
      description: room.description,
      price_per_hour: room.price_per_hour,
      price_per_30_min: room.price_per_30_min,
      capacity: room.capacity,
      image_url: images[0]?.image_url ?? null,
    }
  })
}

export async function getRoom(
  id: string,
): Promise<{ room: Room; images: RoomImage[] } | null> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('rooms')
    .select('*, room_images(id, image_url, sort_order)')
    .eq('id', id)
    .single()

  if (error || !data) return null

  const images = ((data as any).room_images ?? []).sort(
    (a: RoomImage, b: RoomImage) => a.sort_order - b.sort_order,
  )

  return {
    room: {
      id: data.id,
      name: data.name,
      floor: data.floor,
      description: data.description,
      price_per_hour: data.price_per_hour,
      price_per_30_min: data.price_per_30_min,
      capacity: data.capacity,
    },
    images,
  }
}
