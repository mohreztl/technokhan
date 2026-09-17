/**
 * Minimal RFC 5545 builder for the «افزودن به تقویم» action. Produces a
 * single VEVENT in UTC so every calendar app agrees on the time.
 */

export interface BuildIcsInput {
  title: string;
  description?: string;
  start: Date;
  durationMinutes: number;
  location?: string;
  /** Stable id so re-importing updates instead of duplicating. */
  uid?: string;
  url?: string;
}

const pad = (n: number) => String(n).padStart(2, '0');

/** `20260910T043000Z` */
export function toIcsUtc(d: Date): string {
  return (
    `${d.getUTCFullYear()}${pad(d.getUTCMonth() + 1)}${pad(d.getUTCDate())}` +
    `T${pad(d.getUTCHours())}${pad(d.getUTCMinutes())}${pad(d.getUTCSeconds())}Z`
  );
}

/** Escapes text per RFC 5545 section 3.3.11. */
export function escapeIcsText(value: string): string {
  return value
    .replace(/\\/g, '\\\\')
    .replace(/;/g, '\\;')
    .replace(/,/g, '\\,')
    .replace(/\r?\n/g, '\\n');
}

/** Folds lines longer than 75 octets (continuation lines start with a space). */
function fold(line: string): string {
  const encoder = typeof TextEncoder !== 'undefined' ? new TextEncoder() : null;
  if (!encoder || encoder.encode(line).length <= 75) return line;
  const out: string[] = [];
  let current = '';
  for (const ch of line) {
    const next = current + ch;
    if (encoder.encode(next).length > (out.length === 0 ? 75 : 74)) {
      out.push(current);
      current = ch;
    } else {
      current = next;
    }
  }
  if (current) out.push(current);
  return out.join('\r\n ');
}

export function buildIcs(input: BuildIcsInput): string {
  const end = new Date(input.start.getTime() + Math.max(15, input.durationMinutes) * 60_000);
  const uid = input.uid ?? `${toIcsUtc(input.start)}-${Math.random().toString(36).slice(2, 10)}@autolounge.ir`;
  const lines = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//AutoLounge//Booking//FA',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'BEGIN:VEVENT',
    `UID:${uid}`,
    `DTSTAMP:${toIcsUtc(new Date())}`,
    `DTSTART:${toIcsUtc(input.start)}`,
    `DTEND:${toIcsUtc(end)}`,
    `SUMMARY:${escapeIcsText(input.title)}`,
  ];
  if (input.description) lines.push(`DESCRIPTION:${escapeIcsText(input.description)}`);
  if (input.location) lines.push(`LOCATION:${escapeIcsText(input.location)}`);
  if (input.url) lines.push(`URL:${input.url}`);
  lines.push(
    'BEGIN:VALARM',
    'TRIGGER:-PT2H',
    'ACTION:DISPLAY',
    `DESCRIPTION:${escapeIcsText(input.title)}`,
    'END:VALARM',
    'STATUS:CONFIRMED',
    'END:VEVENT',
    'END:VCALENDAR'
  );
  return lines.map(fold).join('\r\n') + '\r\n';
}

/** Triggers a browser download of an `.ics` file via a temporary Blob URL. */
export function downloadIcs(filename: string, ics: string): void {
  if (typeof window === 'undefined') return;
  const blob = new Blob([ics], { type: 'text/calendar;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename.endsWith('.ics') ? filename : `${filename}.ics`;
  a.rel = 'noopener';
  document.body.appendChild(a);
  a.click();
  a.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
}
