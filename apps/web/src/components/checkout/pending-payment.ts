/**
 * The order/booking we sent to the gateway, kept in `sessionStorage` so the
 * callback page can offer «پرداخت مجدد» even when the gateway drops the ids.
 */

export const PENDING_PAYMENT_KEY = 'autolounge_pending_payment';

export interface PendingPayment {
  orderId?: string;
  bookingId?: string;
  authority: string;
  amount?: number;
  createdAt: number;
}

function storage(): Storage | null {
  if (typeof window === 'undefined') return null;
  try {
    return window.sessionStorage;
  } catch {
    return null;
  }
}

export function savePendingPayment(p: Omit<PendingPayment, 'createdAt'>): void {
  const s = storage();
  if (!s) return;
  try {
    s.setItem(PENDING_PAYMENT_KEY, JSON.stringify({ ...p, createdAt: Date.now() }));
  } catch {
    /* ignore quota errors */
  }
}

export function readPendingPayment(): PendingPayment | null {
  const s = storage();
  if (!s) return null;
  try {
    const raw = s.getItem(PENDING_PAYMENT_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as PendingPayment;
    return parsed && typeof parsed.authority === 'string' ? parsed : null;
  } catch {
    return null;
  }
}

export function clearPendingPayment(): void {
  const s = storage();
  if (!s) return;
  try {
    s.removeItem(PENDING_PAYMENT_KEY);
  } catch {
    /* ignore */
  }
}
