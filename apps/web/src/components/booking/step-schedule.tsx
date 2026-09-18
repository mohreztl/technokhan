'use client';

import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { CalendarCheck2, CalendarX2, Clock3, RefreshCw } from 'lucide-react';
import { BOOKING_TIME_SLOTS, CLOSED_WEEKDAYS, CONTACT } from '@autolounge/shared';
import { JalaliCalendar } from '@/components/ui/jalali-calendar';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { fieldErrorClass } from '@/components/ui/input';
import { useAvailableSlots } from '@/lib/hooks';
import { bookingMaxDate, bookingMinDate, formatSlot } from '@/lib/booking/wizard';
import { formatJalali, fromIsoDate, toIsoDate } from '@/lib/jalali';
import { cn } from '@/lib/utils';
import type { StepProps } from './step-props';

/** Step ۲ — Jalali day picker and the time-slot chip grid. */
export function StepSchedule({ draft, dispatch, errors }: StepProps) {
  const selected = useMemo(() => (draft.date ? fromIsoDate(draft.date) : null), [draft.date]);
  const minDate = useMemo(bookingMinDate, []);
  const maxDate = useMemo(bookingMaxDate, []);
  const slots = useAvailableSlots(draft.serviceId, draft.date ?? undefined);

  const available = slots.data?.availableSlots ?? [];
  const booked = slots.data?.bookedSlots ?? [];

  return (
    <div className="space-y-6">
      <section className="glass-effect rounded-2xl p-4 sm:p-5">
        <div className="mb-3 flex items-center justify-between gap-2">
          <h3 className="font-bold">روز مراجعه</h3>
          <span className="text-xs text-muted-foreground">{CONTACT.closedDays}</span>
        </div>
        <JalaliCalendar
          value={selected ?? undefined}
          onChange={(d) => dispatch({ type: 'date', date: toIsoDate(d) })}
          minDate={minDate}
          maxDate={maxDate}
          disabledWeekdays={CLOSED_WEEKDAYS}
        />
        {errors.date && (
          <p role="alert" className={cn(fieldErrorClass, 'mt-3')}>
            {errors.date}
          </p>
        )}
      </section>

      <section>
        <div className="mb-3 flex items-center justify-between gap-2">
          <h3 className="flex items-center gap-2 font-bold">
            <Clock3 className="h-4 w-4 text-secondary" aria-hidden="true" />
            بازهٔ زمانی
          </h3>
          <span className="text-xs text-muted-foreground">{CONTACT.workingHours}</span>
        </div>

        {!draft.date ? (
          <p className="rounded-xl border border-dashed border-border/70 p-4 text-center text-sm text-muted-foreground">
            ابتدا روز مراجعه را از تقویم انتخاب کنید.
          </p>
        ) : slots.isLoading ? (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3" aria-busy="true" aria-label="در حال بارگذاری بازه‌ها">
            {BOOKING_TIME_SLOTS.map((slot) => (
              <Skeleton key={slot} className="h-[56px] rounded-xl" />
            ))}
          </div>
        ) : slots.isError ? (
          <div className="rounded-xl border border-destructive/40 bg-destructive/5 p-4 text-center text-sm">
            <p className="mb-3">دریافت بازه‌های خالی ناموفق بود.</p>
            <Button variant="outline" size="sm" onClick={() => slots.refetch()}>
              <RefreshCw className="h-4 w-4" aria-hidden="true" />
              تلاش دوباره
            </Button>
          </div>
        ) : available.length === 0 ? (
          <div className="flex flex-col items-center gap-2 rounded-xl border border-dashed border-border/70 p-6 text-center">
            <CalendarX2 className="h-8 w-8 text-muted-foreground" aria-hidden="true" />
            <p className="text-sm font-medium">برای این روز نوبت خالی نداریم</p>
            <p className="text-xs text-muted-foreground">لطفاً روز دیگری را انتخاب کنید.</p>
          </div>
        ) : (
          <div role="radiogroup" aria-label="بازهٔ زمانی" className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {BOOKING_TIME_SLOTS.map((slot) => {
              const isAvailable = available.includes(slot);
              const isBooked = booked.includes(slot);
              const isSelected = draft.timeSlot === slot;
              return (
                <motion.button
                  key={slot}
                  type="button"
                  role="radio"
                  aria-checked={isSelected}
                  disabled={!isAvailable}
                  whileTap={isAvailable ? { scale: 0.97 } : undefined}
                  onClick={() => dispatch({ type: 'slot', timeSlot: slot })}
                  className={cn(
                    'flex min-h-[56px] flex-col items-center justify-center rounded-xl border px-3 py-2 text-sm font-semibold transition-colors',
                    'focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-secondary/50',
                    isSelected && 'border-secondary bg-secondary/15 text-foreground shadow-glow-secondary',
                    !isSelected && isAvailable && 'border-border bg-card hover:border-secondary/60',
                    !isAvailable && 'cursor-not-allowed border-border/40 bg-muted/40 text-muted-foreground'
                  )}
                >
                  <span dir="ltr" className={cn('tabular-nums', !isAvailable && 'line-through')}>
                    {formatSlot(slot)}
                  </span>
                  {!isAvailable && (
                    <span className="mt-0.5 text-[10px] font-normal">
                      {isBooked ? 'رزرو شده' : 'غیرفعال'}
                    </span>
                  )}
                </motion.button>
              );
            })}
          </div>
        )}
        {errors.timeSlot && (
          <p role="alert" className={cn(fieldErrorClass, 'mt-3')}>
            {errors.timeSlot}
          </p>
        )}
      </section>

      {selected && draft.timeSlot && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-3 rounded-xl border border-secondary/40 bg-secondary/10 p-3 text-sm"
        >
          <CalendarCheck2 className="h-5 w-5 shrink-0 text-secondary" aria-hidden="true" />
          <p>
            <span className="font-bold">{formatJalali(selected, true)}</span>
            <span className="text-muted-foreground"> · </span>
            <span dir="ltr" className="tabular-nums">
              {formatSlot(draft.timeSlot)}
            </span>
          </p>
        </motion.div>
      )}
    </div>
  );
}
