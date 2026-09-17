'use client';

import * as React from 'react';
import { AnimatePresence, motion, type PanInfo } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import {
  addMonths,
  eachDayOfInterval,
  endOfMonth,
  getDate,
  getMonth,
  getYear,
  isAfter,
  isBefore,
  isSameDay,
  isSameMonth,
  startOfDay,
  startOfMonth,
} from 'date-fns-jalali';
import { toPersianDigits } from '@autolounge/shared';
import { JALALI_MONTHS, JALALI_WEEKDAYS, JALALI_WEEKDAYS_SHORT, weekColumn } from '@/lib/jalali';
import { useReducedMotion } from '@/lib/hooks/use-reduced-motion';
import { cn } from '@/lib/utils';

export interface JalaliCalendarProps {
  value?: Date | null;
  onChange: (date: Date) => void;
  /** Earliest selectable day (inclusive). Defaults to today. */
  minDate?: Date;
  /** Latest selectable day (inclusive). */
  maxDate?: Date;
  /** JS weekday numbers (0 = Sunday … 5 = Friday, 6 = Saturday) that are closed. */
  disabledWeekdays?: number[];
  /** Extra per-day rule (e.g. fully booked). */
  isDateDisabled?: (date: Date) => boolean;
  /** Small dot under days that satisfy the predicate (e.g. has availability). */
  markDay?: (date: Date) => boolean;
  className?: string;
}

/**
 * Persian (Jalali) month grid: Saturday-first, Persian digits, swipe between
 * months on touch, arrow keys move the focused day, Enter/Space selects.
 */
export function JalaliCalendar({
  value,
  onChange,
  minDate,
  maxDate,
  disabledWeekdays = [],
  isDateDisabled,
  markDay,
  className,
}: JalaliCalendarProps) {
  const reduced = useReducedMotion();
  const today = React.useMemo(() => startOfDay(new Date()), []);
  const min = React.useMemo(() => startOfDay(minDate ?? today), [minDate, today]);
  const max = React.useMemo(() => (maxDate ? startOfDay(maxDate) : undefined), [maxDate]);

  const [cursor, setCursor] = React.useState<Date>(() => startOfMonth(value ?? min));
  const [direction, setDirection] = React.useState(0);
  const [focused, setFocused] = React.useState<Date>(value ?? min);
  const gridRef = React.useRef<HTMLDivElement>(null);

  const disabled = React.useCallback(
    (d: Date) =>
      isBefore(d, min) ||
      (max ? isAfter(d, max) : false) ||
      disabledWeekdays.includes(d.getDay()) ||
      (isDateDisabled?.(d) ?? false),
    [min, max, disabledWeekdays, isDateDisabled]
  );

  const canPrev = isAfter(startOfMonth(cursor), startOfMonth(min));
  const canNext = max ? isBefore(endOfMonth(cursor), max) : true;

  const go = (delta: number) => {
    if ((delta < 0 && !canPrev) || (delta > 0 && !canNext)) return;
    setDirection(delta);
    setCursor((c) => startOfMonth(addMonths(c, delta)));
  };

  const days = React.useMemo(
    () => eachDayOfInterval({ start: startOfMonth(cursor), end: endOfMonth(cursor) }),
    [cursor]
  );
  const leading = weekColumn(days[0]);

  const select = (d: Date) => {
    if (disabled(d)) return;
    setFocused(d);
    onChange(d);
  };

  const onKeyDown = (e: React.KeyboardEvent, d: Date) => {
    const map: Record<string, number> = { ArrowLeft: 1, ArrowRight: -1, ArrowUp: -7, ArrowDown: 7 };
    if (e.key in map) {
      e.preventDefault();
      const next = new Date(d);
      next.setDate(d.getDate() + map[e.key]);
      if (!isSameMonth(next, cursor)) {
        setDirection(isAfter(next, d) ? 1 : -1);
        setCursor(startOfMonth(next));
      }
      setFocused(next);
      requestAnimationFrame(() => {
        gridRef.current?.querySelector<HTMLButtonElement>(`[data-day="${next.toDateString()}"]`)?.focus();
      });
    } else if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      select(d);
    }
  };

  const onDragEnd = (_: unknown, info: PanInfo) => {
    // RTL: swiping right (positive x) goes to the NEXT month
    if (info.offset.x > 60 || info.velocity.x > 500) go(1);
    else if (info.offset.x < -60 || info.velocity.x < -500) go(-1);
  };

  const variants = {
    enter: (dir: number) => ({ x: reduced ? 0 : dir > 0 ? -40 : 40, opacity: 0 }),
    center: { x: 0, opacity: 1 },
    exit: (dir: number) => ({ x: reduced ? 0 : dir > 0 ? 40 : -40, opacity: 0 }),
  };

  return (
    <div className={cn('select-none rounded-3xl border border-border bg-background-secondary/50 p-3 sm:p-4', className)}>
      <div className="mb-3 flex items-center justify-between">
        <button
          type="button"
          onClick={() => go(-1)}
          disabled={!canPrev}
          aria-label="ماه قبل"
          className="inline-flex h-11 w-11 items-center justify-center rounded-full text-foreground transition-colors hover:bg-secondary/15 disabled:opacity-30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-secondary"
        >
          <ChevronRight className="h-5 w-5" aria-hidden />
        </button>
        <div className="text-center" aria-live="polite">
          <p className="text-base font-black">
            {JALALI_MONTHS[getMonth(cursor)]} {toPersianDigits(getYear(cursor))}
          </p>
        </div>
        <button
          type="button"
          onClick={() => go(1)}
          disabled={!canNext}
          aria-label="ماه بعد"
          className="inline-flex h-11 w-11 items-center justify-center rounded-full text-foreground transition-colors hover:bg-secondary/15 disabled:opacity-30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-secondary"
        >
          <ChevronLeft className="h-5 w-5" aria-hidden />
        </button>
      </div>

      <div className="grid grid-cols-7 text-center text-[11px] font-semibold text-muted-foreground" aria-hidden>
        {JALALI_WEEKDAYS_SHORT.map((w, i) => (
          <span key={w} className={cn('py-1', i === 6 && 'text-destructive/80')}>
            {w}
          </span>
        ))}
      </div>

      <div className="relative overflow-hidden">
        <AnimatePresence initial={false} custom={direction} mode="popLayout">
          <motion.div
            key={cursor.toISOString()}
            ref={gridRef}
            role="grid"
            aria-label={`${JALALI_MONTHS[getMonth(cursor)]} ${toPersianDigits(getYear(cursor))}`}
            custom={direction}
            variants={variants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: reduced ? 0 : 0.22, ease: 'easeOut' }}
            drag={reduced ? false : 'x'}
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={0.15}
            onDragEnd={onDragEnd}
            className="grid grid-cols-7 gap-1 touch-pan-y"
          >
            {Array.from({ length: leading }).map((_, i) => (
              <span key={`pad-${i}`} aria-hidden />
            ))}
            {days.map((d) => {
              const isDisabled = disabled(d);
              const selected = value ? isSameDay(d, value) : false;
              const isToday = isSameDay(d, today);
              const isFocused = isSameDay(d, focused);
              const marked = markDay?.(d) ?? false;
              const friday = d.getDay() === 5;
              return (
                <button
                  key={d.toDateString()}
                  type="button"
                  role="gridcell"
                  data-day={d.toDateString()}
                  tabIndex={isFocused ? 0 : -1}
                  aria-selected={selected}
                  aria-disabled={isDisabled}
                  aria-label={`${JALALI_WEEKDAYS[weekColumn(d)]} ${toPersianDigits(getDate(d))} ${JALALI_MONTHS[getMonth(d)]}`}
                  disabled={isDisabled}
                  onClick={() => select(d)}
                  onKeyDown={(e) => onKeyDown(e, d)}
                  className={cn(
                    'relative flex aspect-square min-h-[40px] flex-col items-center justify-center rounded-xl text-sm font-semibold transition-all',
                    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-secondary',
                    isDisabled
                      ? 'cursor-not-allowed text-muted-foreground/40 line-through decoration-muted-foreground/30'
                      : 'hover:bg-secondary/15 active:scale-95',
                    !isDisabled && friday && 'text-destructive/80',
                    selected && 'bg-secondary text-primary shadow-glow-secondary hover:bg-secondary',
                    isToday && !selected && 'ring-1 ring-secondary/60'
                  )}
                >
                  {toPersianDigits(getDate(d))}
                  {marked && !isDisabled && (
                    <span
                      className={cn('absolute bottom-1 h-1 w-1 rounded-full', selected ? 'bg-primary' : 'bg-secondary')}
                      aria-hidden
                    />
                  )}
                </button>
              );
            })}
          </motion.div>
        </AnimatePresence>
      </div>

      <div className="mt-3 flex items-center justify-between text-[11px] text-muted-foreground">
        <span className="inline-flex items-center gap-1.5">
          <span className="h-3 w-3 rounded-md ring-1 ring-secondary/60" aria-hidden /> امروز
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span className="h-1 w-1 rounded-full bg-secondary" aria-hidden /> دارای زمان خالی
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span className="text-destructive/80">ج</span> تعطیل
        </span>
      </div>
    </div>
  );
}
