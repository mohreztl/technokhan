import { BOOKING_MAX_DAYS_AHEAD } from '@technokhan/shared';
import type { SiteSettings } from '@technokhan/shared';
import { config } from '../config';

const YMD = /^\d{4}-\d{2}-\d{2}$/;
const DAY_MS = 86_400_000;

/** `yyyy-MM-dd` → Date at UTC midnight (how booking dates are stored) */
export function utcMidnight(ymd: string): Date {
  return new Date(`${ymd}T00:00:00.000Z`);
}

export function isValidYmd(ymd: string): boolean {
  if (!YMD.test(ymd)) return false;
  const d = utcMidnight(ymd);
  return !Number.isNaN(d.getTime()) && d.toISOString().slice(0, 10) === ymd;
}

/** Prisma range filter covering the whole day */
export function dayRange(ymd: string): { gte: Date; lt: Date } {
  const gte = utcMidnight(ymd);
  return { gte, lt: new Date(gte.getTime() + DAY_MS) };
}

/** JS weekday (0 = Sunday … 5 = Friday, 6 = Saturday) */
export function weekdayOf(ymd: string): number {
  return utcMidnight(ymd).getUTCDay();
}

/** Current wall-clock date/time in the workshop's timezone */
export function nowInZone(timeZone: string = config.bookingTimezone): {
  ymd: string;
  hour: number;
  minute: number;
} {
  let parts: Intl.DateTimeFormatPart[];
  try {
    parts = new Intl.DateTimeFormat('en-US', {
      timeZone,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      hourCycle: 'h23',
    }).formatToParts(new Date());
  } catch {
    const d = new Date();
    return { ymd: d.toISOString().slice(0, 10), hour: d.getUTCHours(), minute: d.getUTCMinutes() };
  }
  const get = (type: Intl.DateTimeFormatPartTypes) => parts.find((p) => p.type === type)?.value ?? '00';
  return {
    ymd: `${get('year')}-${get('month')}-${get('day')}`,
    hour: parseInt(get('hour'), 10) % 24,
    minute: parseInt(get('minute'), 10),
  };
}

/** Whole days between today (workshop timezone) and `ymd`; negative = past */
export function daysFromToday(ymd: string): number {
  const today = nowInZone().ymd;
  return Math.round((utcMidnight(ymd).getTime() - utcMidnight(today).getTime()) / DAY_MS);
}

/** "08:00 - 10:00" → 8 */
export function slotStartHour(slot: string): number {
  const m = /^(\d{1,2}):(\d{2})/.exec(slot.trim());
  return m ? parseInt(m[1], 10) : Number.NaN;
}

/** True when the slot's start hour has already passed (only relevant for today) */
export function isSlotPast(ymd: string, slot: string): boolean {
  const now = nowInZone();
  if (ymd > now.ymd) return false;
  if (ymd < now.ymd) return true;
  const hour = slotStartHour(slot);
  return !Number.isNaN(hour) && now.hour >= hour;
}

export type DateCheck = { ok: true } | { ok: false; message: string };

/**
 * Business rules for a booking date: valid, not in the past, within the
 * booking window, and not a day the workshop is closed. Which days those are
 * comes from the site settings an admin controls, not from a constant.
 */
export function validateBookingDate(
  ymd: string,
  settings: Pick<SiteSettings, 'closedWeekdays' | 'closedDates'>
): DateCheck {
  if (!isValidYmd(ymd)) return { ok: false, message: 'تاریخ نامعتبر است' };
  const diff = daysFromToday(ymd);
  if (diff < 0) return { ok: false, message: 'تاریخ انتخاب‌شده گذشته است' };
  if (diff > BOOKING_MAX_DAYS_AHEAD) {
    return { ok: false, message: `رزرو حداکثر تا ${BOOKING_MAX_DAYS_AHEAD} روز آینده امکان‌پذیر است` };
  }
  if (settings.closedDates.includes(ymd)) {
    return { ok: false, message: 'مرکز در این تاریخ تعطیل است' };
  }
  if (settings.closedWeekdays.includes(weekdayOf(ymd))) {
    return { ok: false, message: 'مرکز در این روز تعطیل است' };
  }
  return { ok: true };
}
