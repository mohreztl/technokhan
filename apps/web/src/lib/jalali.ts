import { format, getDate, getDay, getMonth, getYear, newDate } from 'date-fns-jalali';
import { toPersianDigits } from '@autolounge/shared';

export const JALALI_MONTHS = [
  'فروردین',
  'اردیبهشت',
  'خرداد',
  'تیر',
  'مرداد',
  'شهریور',
  'مهر',
  'آبان',
  'آذر',
  'دی',
  'بهمن',
  'اسفند',
] as const;

/** Saturday-first week (Iranian calendar). Index 0 = Saturday. */
export const JALALI_WEEKDAYS = ['شنبه', 'یکشنبه', 'دوشنبه', 'سه‌شنبه', 'چهارشنبه', 'پنجشنبه', 'جمعه'] as const;
export const JALALI_WEEKDAYS_SHORT = ['ش', 'ی', 'د', 'س', 'چ', 'پ', 'ج'] as const;

/** JS `getDay()` (0 = Sunday) → Saturday-first column index (0 = Saturday). */
export const weekColumn = (date: Date): number => (getDay(date) + 1) % 7;

const asDate = (d: Date | string | number) => (d instanceof Date ? d : new Date(d));

/** «۱۴ شهریور ۱۴۰۵» */
export function formatJalali(d: Date | string | number, withWeekday = false): string {
  const date = asDate(d);
  const day = toPersianDigits(getDate(date));
  const month = JALALI_MONTHS[getMonth(date)];
  const year = toPersianDigits(getYear(date));
  const base = `${day} ${month} ${year}`;
  return withWeekday ? `${JALALI_WEEKDAYS[weekColumn(date)]}، ${base}` : base;
}

/** «۱۴۰۵/۰۶/۱۴» */
export function formatJalaliNumeric(d: Date | string | number): string {
  return toPersianDigits(format(asDate(d), 'yyyy/MM/dd'));
}

/** «۱۴ شهریور ۱۴۰۵ · ۱۰:۳۰» */
export function formatJalaliDateTime(d: Date | string | number): string {
  const date = asDate(d);
  return `${formatJalali(date)} · ${toPersianDigits(format(date, 'HH:mm'))}`;
}

/** Relative label for lists: امروز / فردا / weekday */
export function relativeJalaliLabel(d: Date | string | number, now = new Date()): string {
  const date = asDate(d);
  const a = new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime();
  const b = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  const diff = Math.round((a - b) / 86_400_000);
  if (diff === 0) return 'امروز';
  if (diff === 1) return 'فردا';
  if (diff === -1) return 'دیروز';
  return formatJalali(date, true);
}

/** Gregorian `yyyy-MM-dd` for API payloads (local time, no timezone shift). */
export function toIsoDate(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

/** Parse `yyyy-MM-dd` as a local date (avoids the UTC shift of `new Date(str)`). */
export function fromIsoDate(s: string): Date {
  const [y, m, d] = s.split('-').map(Number);
  return new Date(y, (m || 1) - 1, d || 1);
}

/** Build a Date from Jalali parts. */
export const jalaliDate = (year: number, month1to12: number, day: number) => newDate(year, month1to12 - 1, day);
