'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'

export type BookingResult =
  | { ok: true; bookingId: string }
  | { ok: false; error: string }

export async function createBookingAction(input: {
  roomId: string
  date: string
  dayName: string
  startTime: string
  durationMinutes: number
}): Promise<BookingResult> {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { ok: false, error: 'You need to sign in to book a room.' }

  const { data, error } = await supabase.rpc('create_booking', {
    p_room_id: input.roomId,
    p_booking_date: input.date,
    p_day_name: input.dayName,
    p_start_time: input.startTime,
    p_duration_minutes: input.durationMinutes,
  })

  if (error) {
    if (error.message.includes('TIME_SLOT_TAKEN')) {
      return {
        ok: false,
        error: 'That time slot was just taken. Please pick another.',
      }
    }
    return { ok: false, error: 'Could not complete your booking. Try again.' }
  }

  revalidatePath('/dashboard')
  revalidatePath(`/rooms/${input.roomId}`)

  const booking = Array.isArray(data) ? data[0] : data
  return { ok: true, bookingId: booking?.id ?? '' }
}

export async function getBookedSlotsAction(roomId: string, date: string) {
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
