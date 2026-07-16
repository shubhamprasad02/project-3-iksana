'use client'

import { useEffect, useMemo, useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { CalendarDays, Check, CreditCard, Loader2 } from 'lucide-react'
import type { Room } from '@/lib/rooms'
import { formatTime, formatDuration } from '@/lib/format'
import {
  createBookingAction,
  getBookedSlotsAction,
} from '@/app/rooms/[id]/actions'

const OPEN_MIN = 8 * 60 // 08:00
const CLOSE_MIN = 20 * 60 // 20:00
const STEP = 30

const DURATIONS = [30, 60, 90, 120]

type Step = 'select' | 'payment' | 'done'

function toMinutes(time: string) {
  const [h, m] = time.split(':').map(Number)
  return h * 60 + m
}

function minutesToValue(min: number) {
  const h = String(Math.floor(min / 60)).padStart(2, '0')
  const m = String(min % 60).padStart(2, '0')
  return `${h}:${m}`
}

function buildDays(count: number) {
  const days: { value: string; day: string; label: string; num: string }[] = []
  const now = new Date()
  for (let i = 0; i < count; i++) {
    const d = new Date(now)
    d.setDate(now.getDate() + i)
    days.push({
      value: d.toISOString().slice(0, 10),
      day: d.toLocaleDateString('en-US', { weekday: 'long' }),
      label: d.toLocaleDateString('en-US', { weekday: 'short' }),
      num: d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    })
  }
  return days
}

export function BookingPanel({ room }: { room: Room }) {
  const router = useRouter()
  const days = useMemo(() => buildDays(14), [])
  const [date, setDate] = useState(days[0].value)
  const [duration, setDuration] = useState(60)
  const [startMin, setStartMin] = useState<number | null>(null)
  const [booked, setBooked] = useState<{ s: number; e: number }[]>([])
  const [loadingSlots, setLoadingSlots] = useState(false)
  const [step, setStep] = useState<Step>('select')
  const [error, setError] = useState<string>()
  const [isPending, startTransition] = useTransition()

  const selectedDay = days.find((d) => d.value === date)!

  useEffect(() => {
    let active = true
    setLoadingSlots(true)
    setStartMin(null)
    getBookedSlotsAction(room.id, date).then((rows) => {
      if (!active) return
      setBooked(
        rows.map((r) => ({ s: toMinutes(r.start_time), e: toMinutes(r.end_time) })),
      )
      setLoadingSlots(false)
    })
    return () => {
      active = false
    }
  }, [room.id, date])

  const slots = useMemo(() => {
    const result: { min: number; disabled: boolean }[] = []
    for (let t = OPEN_MIN; t + duration <= CLOSE_MIN; t += STEP) {
      const end = t + duration
      const overlaps = booked.some((b) => t < b.e && end > b.s)
      result.push({ min: t, disabled: overlaps })
    }
    return result
  }, [booked, duration])

  const total = (duration / 30) * room.price_per_30_min

  function handleConfirm() {
    if (startMin == null) return
    setError(undefined)
    setStep('payment')
    // Simulate a short mock payment, then persist the booking.
    setTimeout(() => {
      startTransition(async () => {
        const res = await createBookingAction({
          roomId: room.id,
          date,
          dayName: selectedDay.day,
          startTime: minutesToValue(startMin),
          durationMinutes: duration,
        })
        if (res.ok) {
          setStep('done')
        } else {
          setError(res.error)
          setStep('select')
          // Refresh slots in case something was taken.
          const rows = await getBookedSlotsAction(room.id, date)
          setBooked(
            rows.map((r) => ({
              s: toMinutes(r.start_time),
              e: toMinutes(r.end_time),
            })),
          )
        }
      })
    }, 1400)
  }

  if (step === 'done') {
    return (
      <div className="rounded-2xl border border-border bg-card p-6 text-center">
        <span className="mx-auto mb-4 flex size-14 items-center justify-center rounded-full bg-brand text-brand-foreground">
          <Check className="size-7" aria-hidden="true" />
        </span>
        <h3 className="text-xl font-bold text-foreground">Booking confirmed</h3>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
          {room.name} is reserved for{' '}
          <span className="font-medium text-foreground">
            {selectedDay.day}, {selectedDay.num}
          </span>{' '}
          from{' '}
          <span className="font-medium text-foreground">
            {formatTime(minutesToValue(startMin!))}
          </span>{' '}
          for {formatDuration(duration)}.
        </p>
        <div className="mt-4 rounded-lg bg-secondary p-3 text-sm">
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Amount paid</span>
            <span className="font-semibold text-foreground">₹{total}</span>
          </div>
        </div>
        <div className="mt-6 flex flex-col gap-2">
          <button
            type="button"
            onClick={() => router.push('/dashboard')}
            className="w-full rounded-lg bg-brand px-4 py-2.5 text-sm font-semibold text-brand-foreground transition-colors hover:bg-brand/90"
          >
            Go to dashboard
          </button>
          <button
            type="button"
            onClick={() => {
              setStep('select')
              setStartMin(null)
            }}
            className="w-full rounded-lg border border-border px-4 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-secondary"
          >
            Book another slot
          </button>
        </div>
      </div>
    )
  }

  if (step === 'payment') {
    return (
      <div className="rounded-2xl border border-border bg-card p-8 text-center">
        <span className="mx-auto mb-4 flex size-14 items-center justify-center rounded-full bg-secondary text-brand">
          <Loader2 className="size-7 animate-spin" aria-hidden="true" />
        </span>
        <h3 className="text-lg font-semibold text-foreground">
          Processing payment
        </h3>
        <p className="mt-2 text-sm text-muted-foreground">
          Securely confirming your reservation for ₹{total}…
        </p>
      </div>
    )
  }

  return (
    <div className="rounded-2xl border border-border bg-card p-5 sm:p-6">
      <h3 className="text-lg font-semibold text-foreground">Reserve this space</h3>
      <p className="mt-1 text-sm text-muted-foreground">
        ₹{room.price_per_30_min} per 30 min · ₹{room.price_per_hour}/hr
      </p>

      {error ? (
        <div
          role="alert"
          className="mt-4 rounded-lg border border-destructive/30 bg-destructive/5 px-3.5 py-3 text-sm font-medium text-destructive"
        >
          {error}
        </div>
      ) : null}

      {/* Date */}
      <div className="mt-5">
        <label className="mb-2 flex items-center gap-2 text-sm font-medium text-foreground">
          <CalendarDays className="size-4 text-muted-foreground" aria-hidden="true" />
          Select a date
        </label>
        <div className="flex gap-2 overflow-x-auto pb-1">
          {days.map((d) => {
            const active = d.value === date
            return (
              <button
                key={d.value}
                type="button"
                onClick={() => setDate(d.value)}
                className={`flex min-w-16 shrink-0 flex-col items-center rounded-xl border px-3 py-2 text-center transition-colors ${
                  active
                    ? 'border-brand bg-brand text-brand-foreground'
                    : 'border-border bg-background text-foreground hover:bg-secondary'
                }`}
              >
                <span className="text-xs font-medium opacity-80">{d.label}</span>
                <span className="text-sm font-semibold">{d.num}</span>
              </button>
            )
          })}
        </div>
      </div>

      {/* Duration */}
      <div className="mt-5">
        <span className="mb-2 block text-sm font-medium text-foreground">
          Duration
        </span>
        <div className="grid grid-cols-4 gap-2">
          {DURATIONS.map((d) => {
            const active = d === duration
            return (
              <button
                key={d}
                type="button"
                onClick={() => setDuration(d)}
                className={`rounded-lg border px-2 py-2 text-sm font-medium transition-colors ${
                  active
                    ? 'border-brand bg-brand text-brand-foreground'
                    : 'border-border bg-background text-foreground hover:bg-secondary'
                }`}
              >
                {formatDuration(d)}
              </button>
            )
          })}
        </div>
      </div>

      {/* Time slots */}
      <div className="mt-5">
        <span className="mb-2 block text-sm font-medium text-foreground">
          Start time
        </span>
        {loadingSlots ? (
          <div className="flex items-center gap-2 py-6 text-sm text-muted-foreground">
            <Loader2 className="size-4 animate-spin" aria-hidden="true" />
            Checking availability…
          </div>
        ) : slots.every((s) => s.disabled) ? (
          <p className="rounded-lg border border-dashed border-border bg-background p-4 text-center text-sm text-muted-foreground">
            No available slots for this duration on{' '}
            {selectedDay.label}. Try a shorter duration or another day.
          </p>
        ) : (
          <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
            {slots.map((s) => {
              const active = s.min === startMin
              return (
                <button
                  key={s.min}
                  type="button"
                  disabled={s.disabled}
                  onClick={() => setStartMin(s.min)}
                  className={`rounded-lg border px-2 py-2 text-sm font-medium transition-colors ${
                    active
                      ? 'border-brand bg-brand text-brand-foreground'
                      : s.disabled
                        ? 'cursor-not-allowed border-border bg-secondary/50 text-muted-foreground/50 line-through'
                        : 'border-border bg-background text-foreground hover:bg-secondary'
                  }`}
                >
                  {formatTime(minutesToValue(s.min))}
                </button>
              )
            })}
          </div>
        )}
      </div>

      {/* Summary + CTA */}
      <div className="mt-6 border-t border-border pt-4">
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">Total</span>
          <span className="text-lg font-bold text-foreground">₹{total}</span>
        </div>
        <button
          type="button"
          disabled={startMin == null || isPending}
          onClick={handleConfirm}
          className="mt-4 flex w-full items-center justify-center gap-2 rounded-lg bg-brand px-4 py-3 text-sm font-semibold text-brand-foreground transition-colors hover:bg-brand/90 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <CreditCard className="size-4" aria-hidden="true" />
          {startMin == null ? 'Select a time slot' : `Confirm & pay ₹${total}`}
        </button>
        <p className="mt-2 text-center text-xs text-muted-foreground">
          Demo checkout — no real payment is processed.
        </p>
      </div>
    </div>
  )
}
