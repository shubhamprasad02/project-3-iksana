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

  type RoomRow = Room & { room_images: RoomImage[] }
  return (data as RoomRow[]).map((room) => {
    const images = [...(room.room_images ?? [])].sort(
      (a, b) => a.sort_order - b.sort_order,
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

  type RoomDetailRow = Room & { room_images: RoomImage[] }
  const roomData = data as unknown as RoomDetailRow
  const images = [...(roomData.room_images ?? [])].sort(
    (a, b) => a.sort_order - b.sort_order,
  )

  return {
    room: {
      id: roomData.id,
      name: roomData.name,
      floor: roomData.floor,
      description: roomData.description,
      price_per_hour: roomData.price_per_hour,
      price_per_30_min: roomData.price_per_30_min,
      capacity: roomData.capacity,
    },
    images,
  }
}
