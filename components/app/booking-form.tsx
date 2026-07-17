'use client'

import { useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { Calendar, Clock } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import type { Room } from '@/lib/rooms'

interface BookedSlot {
  start_time: string
  end_time: string
}

interface Props {
  room: Room
  initialBookedSlots: BookedSlot[]
  userId: string
}

// Generate 30-min slots from 07:00 to 21:00
const ALL_SLOTS = Array.from({ length: 28 }, (_, i) => {
  const totalMins = 7 * 60 + i * 30
  const h = Math.floor(totalMins / 60)
  const m = totalMins % 60
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`
})

function toMinutes(t: string) {
  const [h, m] = t.split(':').map(Number)
  return h * 60 + m
}

function formatDisplay(t: string) {
  const [h, m] = t.split(':').map(Number)
  const period = h >= 12 ? 'PM' : 'AM'
  const hour = h % 12 || 12
  return `${hour}:${String(m).padStart(2, '0')} ${period}`
}

function formatDate(dateStr: string) {
  const d = new Date(`${dateStr}T00:00:00`)
  return d.toLocaleDateString('en-IN', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}

function getDayName(dateStr: string) {
  return new Date(`${dateStr}T00:00:00`).toLocaleDateString('en-IN', {
    weekday: 'long',
  })
}

function getTodayStr() {
  return new Date().toISOString().slice(0, 10)
}

function isSlotBooked(slot: string, bookedSlots: BookedSlot[]) {
  const slotStart = toMinutes(slot)
  const slotEnd = slotStart + 30
  return bookedSlots.some((b) => {
    const bStart = toMinutes(b.start_time)
    const bEnd = toMinutes(b.end_time)
    return slotStart < bEnd && slotEnd > bStart
  })
}

export function BookingForm({ room, initialBookedSlots, userId }: Props) {
  const router = useRouter()
  const [selectedDate, setSelectedDate] = useState(getTodayStr())
  const [bookedSlots, setBookedSlots] = useState<BookedSlot[]>(initialBookedSlots)
  const [loadingSlots, setLoadingSlots] = useState(false)
  const [startSlot, setStartSlot] = useState<string | null>(null)
  const [endSlot, setEndSlot] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchSlots = useCallback(async (date: string) => {
    setLoadingSlots(true)
    const supabase = createClient()
    const { data } = await supabase
      .from('bookings')
      .select('start_time, end_time')
      .eq('room_id', room.id)
      .eq('booking_date', date)
      .eq('booking_status', 'confirmed')
    setBookedSlots(data ?? [])
    setLoadingSlots(false)
  }, [room.id])

  function handleDateChange(e: React.ChangeEvent<HTMLInputElement>) {
    const date = e.target.value
    setSelectedDate(date)
    setStartSlot(null)
    setEndSlot(null)
    setError(null)
    fetchSlots(date)
  }

  function handleSlotClick(slot: string) {
    setError(null)
    if (!startSlot || (startSlot && endSlot)) {
      // Start fresh selection
      setStartSlot(slot)
      setEndSlot(null)
      return
    }
    // Set end slot
    if (toMinutes(slot) <= toMinutes(startSlot)) {
      setStartSlot(slot)
      setEndSlot(null)
      return
    }
    // Check no booked slots in range
    const rangeSlots = ALL_SLOTS.filter(
      (s) => toMinutes(s) >= toMinutes(startSlot) && toMinutes(s) < toMinutes(slot),
    )
    const conflict = rangeSlots.some((s) => isSlotBooked(s, bookedSlots))
    if (conflict) {
      setError('Your selected range includes a booked slot. Please choose a different range.')
      setStartSlot(slot)
      setEndSlot(null)
      return
    }
    setEndSlot(slot)
  }

  function getSlotState(slot: string): 'booked' | 'selected' | 'in-range' | 'available' {
    if (isSlotBooked(slot, bookedSlots)) return 'booked'
    if (!startSlot) return 'available'
    const slotMin = toMinutes(slot)
    const startMin = toMinutes(startSlot)
    if (endSlot) {
      const endMin = toMinutes(endSlot)
      if (slot === startSlot || slot === endSlot) return 'selected'
      if (slotMin > startMin && slotMin < endMin) return 'in-range'
    } else {
      if (slot === startSlot) return 'selected'
    }
    return 'available'
  }

  // Computed booking summary
  // The user picks a START slot and an END slot (both are slot start times).
  // The actual booking end time is endSlot + 30 min.
  // Duration = (endSlot + 30) - startSlot = difference between slots + 30.
  const durationMins =
    startSlot && endSlot
      ? toMinutes(endSlot) - toMinutes(startSlot) + 30
      : 0

  const totalPrice = durationMins > 0
    ? (durationMins / 60) * Number(room.price_per_hour)
    : 0

  // endTime is the actual clock end of the booking (last selected slot + 30 min)
  const endTime = endSlot
    ? (() => {
        const m = toMinutes(endSlot) + 30
        return `${String(Math.floor(m / 60)).padStart(2, '0')}:${String(m % 60).padStart(2, '0')}`
      })()
    : null

  async function handleBook() {
    if (!startSlot || !endSlot || !endTime) {
      setError('Please select a start and end slot.')
      return
    }
    setError(null)
    setSubmitting(true)

    try {
      const supabase = createClient()
      const { data: bookingData, error: bookingErr } = await supabase
        .from('bookings')
        .insert({
          user_id: userId,
          room_id: room.id,
          booking_date: selectedDate,
          day_name: getDayName(selectedDate),
          start_time: startSlot,
          end_time: endTime,
          duration_minutes: durationMins,
          total_price: totalPrice,
          booking_status: 'confirmed',
          payment_status: 'pending',
        })
        .select('id')
        .single()

      if (bookingErr || !bookingData) {
        if (bookingErr?.code === '23P01') {
          setError('This slot was just booked by someone else. Please pick a different time.')
        } else {
          setError('Booking failed. Please try again.')
        }
        setSubmitting(false)
        return
      }

      // Create payment record
      await supabase.from('payments').insert({
        booking_id: bookingData.id,
        user_id: userId,
        amount: totalPrice,
        payment_status: 'paid',
        payment_method: 'mock',
      })

      router.push(`/bookings/${bookingData.id}/success`)
    } catch {
      setError('Something went wrong. Please try again.')
      setSubmitting(false)
    }
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-border bg-card">
      <div className="border-b border-border bg-brand px-5 py-4">
        <h2 className="font-semibold text-brand-foreground">Book this room</h2>
      </div>

      <div className="p-5 space-y-5">
        {/* Date picker */}
        <div>
          <label
            htmlFor="booking-date"
            className="mb-1.5 flex items-center gap-1.5 text-sm font-medium text-foreground"
          >
            <Calendar className="size-4" aria-hidden="true" />
            Select date
          </label>
          <input
            id="booking-date"
            type="date"
            value={selectedDate}
            min={getTodayStr()}
            onChange={handleDateChange}
            className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
          />
          <p className="mt-1.5 text-xs text-muted-foreground">
            {formatDate(selectedDate)}
          </p>
        </div>

        {/* Time slot grid */}
        <div>
          <p className="mb-2 flex items-center gap-1.5 text-sm font-medium text-foreground">
            <Clock className="size-4" aria-hidden="true" />
            Select time slots
          </p>
          <p className="mb-3 text-xs text-muted-foreground">
            Click a start slot, then an end slot to set your booking window.
          </p>

          {loadingSlots ? (
            <div className="py-6 text-center text-sm text-muted-foreground">
              Loading availability…
            </div>
          ) : (
            <div className="grid grid-cols-4 gap-1.5">
              {ALL_SLOTS.map((slot) => {
                const state = getSlotState(slot)
                return (
                  <button
                    key={slot}
                    type="button"
                    disabled={state === 'booked'}
                    onClick={() => handleSlotClick(slot)}
                    className={[
                      'rounded-lg px-1 py-1.5 text-[11px] font-medium transition-colors',
                      state === 'booked'
                        ? 'cursor-not-allowed bg-muted text-muted-foreground line-through opacity-50'
                        : state === 'selected'
                          ? 'bg-brand text-brand-foreground'
                          : state === 'in-range'
                            ? 'bg-brand/20 text-brand'
                            : 'bg-secondary text-foreground hover:bg-brand/10 hover:text-brand',
                    ].join(' ')}
                  >
                    {formatDisplay(slot)}
                  </button>
                )
              })}
            </div>
          )}

          {/* Legend */}
          <div className="mt-3 flex flex-wrap gap-3 text-[11px] text-muted-foreground">
            <span className="inline-flex items-center gap-1.5">
              <span className="inline-block size-2.5 rounded-sm bg-brand" />
              Selected
            </span>
            <span className="inline-flex items-center gap-1.5">
              <span className="inline-block size-2.5 rounded-sm bg-brand/20" />
              In range
            </span>
            <span className="inline-flex items-center gap-1.5">
              <span className="inline-block size-2.5 rounded-sm bg-muted opacity-50" />
              Booked
            </span>
          </div>
        </div>

        {/* Summary */}
        {startSlot && endSlot && endTime && (
          <div className="rounded-xl border border-brand/20 bg-brand/5 px-4 py-3 space-y-1.5 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Time</span>
              <span className="font-medium text-foreground">
                {formatDisplay(startSlot)} – {formatDisplay(endTime)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Duration</span>
              <span className="font-medium text-foreground">
                {durationMins >= 60
                  ? `${durationMins / 60} hr${durationMins > 60 ? 's' : ''}`
                  : `${durationMins} min`}
              </span>
            </div>
            <div className="flex justify-between border-t border-brand/15 pt-1.5">
              <span className="font-semibold text-foreground">Total</span>
              <span className="font-bold text-foreground">
                ₹{totalPrice.toLocaleString('en-IN')}
              </span>
            </div>
          </div>
        )}

        {error && (
          <p role="alert" className="text-sm font-medium text-destructive">
            {error}
          </p>
        )}

        <button
          type="button"
          onClick={handleBook}
          disabled={!startSlot || !endSlot || submitting}
          className="w-full rounded-xl bg-brand px-4 py-3 text-sm font-semibold text-brand-foreground transition-colors hover:bg-brand/90 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {submitting ? 'Confirming booking…' : 'Confirm booking'}
        </button>
      </div>
    </div>
  )
}
