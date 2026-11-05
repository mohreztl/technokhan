import type { Booking, Order } from '@technokhan/shared';
import { findService, toPersianDigits, trackingCodeFromId } from '@technokhan/shared';
import { fromIsoDate } from '@/lib/jalali';

/** «OR-3F9A2C» — the customer-facing order code. */
export const orderCode = (o: Pick<Order, 'id' | 'trackingCode'>): string =>
  o.trackingCode ?? trackingCodeFromId('OR', o.id);

/** «BK-3F9A2C» — the customer-facing booking code. */
export const bookingCode = (b: Pick<Booking, 'id' | 'trackingCode'>): string =>
  b.trackingCode ?? trackingCodeFromId('BK', b.id);

/** Booking dates are `yyyy-MM-dd` (or an ISO midnight); parse as a local day. */
export const bookingDate = (b: Pick<Booking, 'date'>): Date => fromIsoDate(String(b.date).slice(0, 10));

export const bookingServiceName = (b: Pick<Booking, 'serviceId' | 'service'>): string =>
  b.service?.name ?? findService(b.serviceId)?.name ?? b.serviceId;

const LOCATION_LABELS: Record<string, string> = {
  center: 'در مرکز اتولانژ',
  onsite: 'در محل مشتری',
};

export const locationLabel = (location: string): string => LOCATION_LABELS[location] ?? location;

/** «۱۰:۰۰ - ۱۲:۰۰» */
export const timeSlotFa = (slot: string): string => toPersianDigits(slot);

/** Last six characters of a db id, upper-cased. */
export const shortId = (id: string): string => id.replace(/[^a-z0-9]/gi, '').slice(-6).toUpperCase();

/** Phone with Persian digits for display (`dir="ltr"` on the element keeps the order). */
export const phoneFa = (phone?: string): string => (phone ? toPersianDigits(phone) : '—');

export const ROLE_LABELS: Record<string, string> = {
  admin: 'مدیر',
  customer: 'مشتری',
};
