import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import {
  BOOKING_STATUS_LABELS,
  ORDER_STATUS_LABELS,
  ROUTES,
  formatToman,
} from '@autolounge/shared';
import type { Booking, Order } from '@autolounge/shared';

export type NotificationKind = 'order' | 'booking' | 'payment';

export interface AppNotification {
  /** Stable and status-scoped, so a re-sync never duplicates an event. */
  id: string;
  kind: NotificationKind;
  title: string;
  body: string;
  href: string;
  /** ISO timestamp of the event itself, not of when we noticed it. */
  createdAt: string;
  read: boolean;
}

export const NOTIFICATIONS_STORAGE_KEY = 'autolounge_notifications';
/** Older entries fall off the end; this is a feed, not an archive. */
const MAX_NOTIFICATIONS = 50;

export interface NotificationState {
  items: AppNotification[];
  /** Whose feed this is — a different login starts from scratch. */
  userId: string | null;
  /** false until the first sync, whose entries arrive already read. */
  initialized: boolean;
  sync: (userId: string, seeds: AppNotification[]) => void;
  markRead: (id: string) => void;
  markAllRead: () => void;
  remove: (id: string) => void;
  clear: () => void;
  reset: () => void;
}

const newest = (a: AppNotification, b: AppNotification) =>
  Date.parse(b.createdAt) - Date.parse(a.createdAt);

export const useNotificationStore = create<NotificationState>()(
  persist(
    (set, get) => ({
      items: [],
      userId: null,
      initialized: false,
      sync: (userId, seeds) => {
        const switched = get().userId !== userId;
        const base = switched ? [] : get().items;
        const initialized = switched ? false : get().initialized;

        const known = new Set(base.map((n) => n.id));
        const fresh = seeds
          .filter((s) => !known.has(s.id))
          // The first sync is a backfill of what already happened: show it in
          // the list, but do not light up the badge for old news.
          .map((s) => ({ ...s, read: initialized ? s.read : true }));

        if (!switched && fresh.length === 0 && initialized) return;

        set({
          userId,
          initialized: true,
          items: [...base, ...fresh].sort(newest).slice(0, MAX_NOTIFICATIONS),
        });
      },
      markRead: (id) =>
        set((s) => ({ items: s.items.map((n) => (n.id === id ? { ...n, read: true } : n)) })),
      markAllRead: () => set((s) => ({ items: s.items.map((n) => ({ ...n, read: true })) })),
      remove: (id) => set((s) => ({ items: s.items.filter((n) => n.id !== id) })),
      clear: () => set({ items: [] }),
      reset: () => set({ items: [], userId: null, initialized: false }),
    }),
    {
      name: NOTIFICATIONS_STORAGE_KEY,
      storage: createJSONStorage(() => localStorage),
      skipHydration: true,
    }
  )
);

export function useNotifications() {
  const items = useNotificationStore((s) => s.items);
  const markRead = useNotificationStore((s) => s.markRead);
  const markAllRead = useNotificationStore((s) => s.markAllRead);
  const remove = useNotificationStore((s) => s.remove);
  const clear = useNotificationStore((s) => s.clear);
  return {
    items,
    unread: items.reduce((n, item) => n + (item.read ? 0 : 1), 0),
    markRead,
    markAllRead,
    remove,
    clear,
  };
}

/* ------------------------------------------------------------------ */
/* Deriving the feed from the customer's own orders and bookings       */
/* ------------------------------------------------------------------ */

const iso = (value: unknown): string => {
  const d = value instanceof Date ? value : new Date(String(value ?? ''));
  return Number.isNaN(d.getTime()) ? new Date().toISOString() : d.toISOString();
};

const ORDER_BODY: Record<string, string> = {
  pending: 'سفارش شما ثبت شد و در انتظار پرداخت است.',
  processing: 'سفارش شما در حال آماده‌سازی است.',
  shipped: 'سفارش شما ارسال شد.',
  delivered: 'سفارش شما تحویل داده شد. ممنون که اتولانژ را انتخاب کردید.',
  cancelled: 'سفارش شما لغو شد.',
};

const BOOKING_BODY: Record<string, string> = {
  pending: 'نوبت شما ثبت شد و در انتظار تأیید است.',
  confirmed: 'نوبت شما تأیید شد؛ منتظر دیدنتان هستیم.',
  in_progress: 'کار روی خودروی شما شروع شد.',
  completed: 'خدمت شما انجام شد. خوشحال می‌شویم نظرتان را بدانیم.',
  cancelled: 'نوبت شما لغو شد.',
};

/** One entry per order status the customer has reached, plus its payment. */
export function orderNotifications(orders: Order[]): AppNotification[] {
  return orders.flatMap((o) => {
    const ref = o.trackingCode ?? o.id.slice(0, 8);
    const href = `${ROUTES.ORDERS}/${o.id}`;
    const seeds: AppNotification[] = [
      {
        id: `order:${o.id}:status:${o.status}`,
        kind: 'order',
        title: `سفارش ${ref} — ${ORDER_STATUS_LABELS[o.status] ?? o.status}`,
        body: ORDER_BODY[o.status] ?? 'وضعیت سفارش شما به‌روزرسانی شد.',
        href,
        createdAt: iso(o.updatedAt ?? o.createdAt),
        read: false,
      },
    ];
    if (o.paymentStatus === 'paid') {
      seeds.push({
        id: `order:${o.id}:paid`,
        kind: 'payment',
        title: `پرداخت سفارش ${ref} تأیید شد`,
        body: `مبلغ ${formatToman(o.totalPrice)} با موفقیت پرداخت شد.`,
        href,
        createdAt: iso(o.updatedAt ?? o.createdAt),
        read: false,
      });
    }
    return seeds;
  });
}

/** One entry per booking status the customer has reached. */
export function bookingNotifications(bookings: Booking[]): AppNotification[] {
  return bookings.map((b) => ({
    id: `booking:${b.id}:status:${b.status}`,
    kind: 'booking' as const,
    title: `${b.service?.name ?? 'نوبت شما'} — ${BOOKING_STATUS_LABELS[b.status] ?? b.status}`,
    body: BOOKING_BODY[b.status] ?? 'وضعیت نوبت شما به‌روزرسانی شد.',
    href: `${ROUTES.PROFILE}?tab=bookings`,
    createdAt: iso(b.updatedAt ?? b.createdAt),
    read: false,
  }));
}
