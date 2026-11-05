import { toPersianDigits } from '@technokhan/shared';

/** JS getDay() order, as Persian day names. */
const WEEKDAY_NAMES = ['یکشنبه', 'دوشنبه', 'سه‌شنبه', 'چهارشنبه', 'پنجشنبه', 'جمعه', 'شنبه'] as const;

export function weekdayName(day: number): string {
  return WEEKDAY_NAMES[((day % 7) + 7) % 7];
}

/**
 * "جمعه‌ها تعطیل" for the usual single closed day, "جمعه‌ها و شنبه‌ها تعطیل"
 * when a shop closes on more. Empty when the shop never closes, so the caller
 * can leave the line out entirely.
 */
export function closedDaysLabel(closedWeekdays: number[]): string {
  if (!closedWeekdays.length) return '';
  const names = [...new Set(closedWeekdays)].sort((a, b) => a - b).map((d) => `${weekdayName(d)}‌ها`);
  return `${names.join(' و ')} تعطیل`;
}

/** yyyy-MM-dd → the same date with Persian digits, for reading back a closure. */
export function ymdFa(ymd: string): string {
  return toPersianDigits(ymd);
}
