'use client';

import * as React from 'react';
import Link from 'next/link';
import {
  Bell,
  BellOff,
  CalendarCheck,
  CheckCheck,
  CreditCard,
  Package,
  X,
} from 'lucide-react';
import { toPersianDigits } from '@technokhan/shared';
import { ResponsiveDialog } from '@/components/ui/responsive-dialog';
import { Button } from '@/components/ui/button';
import { IconButton } from '@/components/ui/icon-button';
import { useUIStore } from '@/lib/store/ui-store';
import { useAuth } from '@/lib/store/auth-store';
import {
  bookingNotifications,
  orderNotifications,
  useNotificationStore,
  useNotifications,
  type AppNotification,
  type NotificationKind,
} from '@/lib/store/notification-store';
import { useHydrated } from '@/lib/store/hydration';
import { useMyOrders } from '@/lib/hooks/use-orders';
import { useMyBookings } from '@/lib/hooks/use-bookings';
import { timeAgoFa } from '@/lib/jalali';
import { cn } from '@/lib/utils';

/* ------------------------------------------------------------------ */
/* Sync — turns the customer's own orders/bookings into a feed         */
/* ------------------------------------------------------------------ */

/**
 * Mounted once in the app shell. Every order/booking status the customer has
 * reached becomes one entry; ids carry the status, so re-syncing is a no-op
 * until something actually changes.
 */
export function NotificationSync() {
  const { isAuthenticated, user } = useAuth();
  const sync = useNotificationStore((s) => s.sync);
  const reset = useNotificationStore((s) => s.reset);
  const hydrated = useHydrated(useNotificationStore);

  const orders = useMyOrders();
  const bookings = useMyBookings();

  const orderItems = orders.data;
  const bookingItems = bookings.data;
  // Both lists have to land before the first sync: a backfill that sees only
  // half the history would mark the other half as unread news.
  const ready = !orders.isPending && !bookings.isPending;

  React.useEffect(() => {
    if (!hydrated) return;
    if (!isAuthenticated || !user) {
      reset();
      return;
    }
    if (!ready) return;
    sync(user.id, [
      ...orderNotifications(orderItems ?? []),
      ...bookingNotifications(bookingItems ?? []),
    ]);
  }, [hydrated, isAuthenticated, user, ready, orderItems, bookingItems, sync, reset]);

  return null;
}

/* ------------------------------------------------------------------ */
/* Bell                                                                */
/* ------------------------------------------------------------------ */

export interface NotificationBellProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

/** Navbar bell with the unread counter. Silent until the store has hydrated. */
export function NotificationBell({ className, size = 'md' }: NotificationBellProps) {
  const hydrated = useHydrated(useNotificationStore);
  const { unread } = useNotifications();
  const open = useUIStore((s) => s.setNotificationsOpen);

  return (
    <IconButton
      label="اعلان‌ها"
      icon={<Bell />}
      size={size}
      badge={hydrated ? unread : 0}
      className={className}
      onClick={() => open(true)}
    />
  );
}

/* ------------------------------------------------------------------ */
/* Sheet                                                               */
/* ------------------------------------------------------------------ */

const KIND_ICON: Record<NotificationKind, React.ElementType> = {
  order: Package,
  booking: CalendarCheck,
  payment: CreditCard,
};

const KIND_TONE: Record<NotificationKind, string> = {
  order: 'bg-primary/10 text-primary dark:bg-secondary/15 dark:text-secondary',
  booking: 'bg-secondary/15 text-secondary',
  payment: 'bg-success/15 text-success',
};

export function NotificationSheet() {
  const isOpen = useUIStore((s) => s.notificationsOpen);
  const setOpen = useUIStore((s) => s.setNotificationsOpen);
  const { isAuthenticated } = useAuth();
  const openLogin = useUIStore((s) => s.openLoginSheet);
  const { items, unread, markRead, markAllRead, remove, clear } = useNotifications();

  return (
    <ResponsiveDialog
      open={isOpen}
      onOpenChange={setOpen}
      title="اعلان‌ها"
      description={
        unread > 0 ? `${toPersianDigits(unread)} اعلان خوانده‌نشده` : 'وضعیت سفارش‌ها و نوبت‌های شما'
      }
      snapPoints={[0.85]}
      desktopClassName="max-w-md"
      footer={
        items.length > 0 ? (
          <div className="grid grid-cols-2 gap-3">
            <Button type="button" variant="outline" className="gap-1.5" onClick={clear}>
              <X className="h-4 w-4" aria-hidden="true" />
              پاک کردن همه
            </Button>
            <Button type="button" className="gap-1.5" onClick={markAllRead} disabled={unread === 0}>
              <CheckCheck className="h-4 w-4" aria-hidden="true" />
              همه را خواندم
            </Button>
          </div>
        ) : undefined
      }
    >
      {!isAuthenticated ? (
        <EmptyState
          title="برای دیدن اعلان‌ها وارد شوید"
          body="وضعیت سفارش‌ها و نوبت‌هایتان اینجا نمایش داده می‌شود."
          action={
            <Button
              type="button"
              onClick={() => {
                setOpen(false);
                openLogin();
              }}
            >
              ورود به حساب
            </Button>
          }
        />
      ) : items.length === 0 ? (
        <EmptyState
          title="فعلاً اعلانی ندارید"
          body="با ثبت اولین سفارش یا نوبت، پیگیری وضعیت آن را همین‌جا می‌بینید."
        />
      ) : (
        <ul className="divide-y divide-border">
          {items.map((item) => (
            <NotificationRow
              key={item.id}
              item={item}
              onOpen={() => {
                markRead(item.id);
                setOpen(false);
              }}
              onRemove={() => remove(item.id)}
            />
          ))}
        </ul>
      )}
    </ResponsiveDialog>
  );
}

function NotificationRow({
  item,
  onOpen,
  onRemove,
}: {
  item: AppNotification;
  onOpen: () => void;
  onRemove: () => void;
}) {
  const Icon = KIND_ICON[item.kind];
  return (
    <li className={cn('relative flex items-start gap-3 py-3', !item.read && 'bg-secondary/5')}>
      <span
        className={cn('mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl', KIND_TONE[item.kind])}
        aria-hidden="true"
      >
        <Icon className="h-[18px] w-[18px]" />
      </span>

      <Link href={item.href} onClick={onOpen} className="min-w-0 flex-1 focus-visible:outline-hidden">
        <span className="flex items-center gap-2">
          <span className="truncate text-sm font-bold text-foreground">{item.title}</span>
          {!item.read && (
            <span className="h-2 w-2 shrink-0 rounded-full bg-secondary" aria-label="خوانده‌نشده" />
          )}
        </span>
        <span className="mt-0.5 block text-xs leading-6 text-muted-foreground">{item.body}</span>
        <span className="mt-1 block text-[11px] text-muted-foreground/80">{timeAgoFa(item.createdAt)}</span>
      </Link>

      <IconButton label={`حذف اعلان: ${item.title}`} icon={<X />} size="sm" onClick={onRemove} />
    </li>
  );
}

function EmptyState({
  title,
  body,
  action,
}: {
  title: string;
  body: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="py-12 text-center">
      <span
        className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-muted text-muted-foreground"
        aria-hidden="true"
      >
        <BellOff className="h-7 w-7" />
      </span>
      <h3 className="mt-4 text-base font-black text-foreground">{title}</h3>
      <p className="mx-auto mt-2 max-w-xs text-sm leading-7 text-muted-foreground">{body}</p>
      {action && <div className="mt-6 flex justify-center">{action}</div>}
    </div>
  );
}
