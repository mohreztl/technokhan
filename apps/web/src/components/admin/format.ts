import type { Order } from '@technokhan/shared';
import { toPersianDigits, trackingCodeFromId } from '@technokhan/shared';

export const orderCode = (order: Pick<Order, 'id' | 'trackingCode'>): string =>
  order.trackingCode ?? trackingCodeFromId('OR', order.id);

export const shortId = (id: string): string => id.replace(/[^a-z0-9]/gi, '').slice(-6).toUpperCase();

export const phoneFa = (phone?: string): string => (phone ? toPersianDigits(phone) : '—');

export const ROLE_LABELS: Record<string, string> = {
  admin: 'مدیر',
  customer: 'مشتری',
};
