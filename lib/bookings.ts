import { createClient } from '@/lib/supabase/server'

export type Booking = {
  id: string
  room_id: string
  booking_date: string
  day_name: string
  start_time: string
  end_time: string
  duration_minutes: number
  total_price: number
  booking_status: string
  payment_status: string
  rooms: { name: string; floor: string } | null
}

export async function getMyUpcomingBookings(): Promise<Booking[]> {
  const supabase = await createClient()
  const today = new Date().toISOString().slice(0, 10)

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return []

  const { data, error } = await supabase
    .from('bookings')
    .select(
      'id, room_id, booking_date, day_name, start_time, end_time, duration_minutes, total_price, booking_status, payment_status, rooms(name, floor)',
    )
    .eq('user_id', user.id)
    .gte('booking_date', today)
    .eq('booking_status', 'confirmed')
    .order('booking_date', { ascending: true })
    .order('start_time', { ascending: true })

  if (error || !data) return []
  return data as unknown as Booking[]
}

export async function getBookedSlots(roomId: string, date: string) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('bookings')
    .select('start_time, end_time')
    .eq('room_id', roomId)
    .eq('booking_date', date)
    .eq('booking_status', 'confirmed')

  if (error || !data) return []
  return data as { start_time: string; end_time: string }[]
}
