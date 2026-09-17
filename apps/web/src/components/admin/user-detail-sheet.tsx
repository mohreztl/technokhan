'use client';

import * as React from 'react';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { CalendarDays, ChevronLeft, Mail, Phone, ShoppingBag } from 'lucide-react';
import { formatToman, toPersianDigits } from '@autolounge/shared';
import { adminApi, type AdminUser } from '@/lib/api/endpoints';
import { unwrap } from '@/lib/api/client';
import { useAuth } from '@/lib/store/auth-store';
import { formatJalali, formatJalaliDateTime } from '@/lib/jalali';
import { ResponsiveDialog } from '@/components/ui/responsive-dialog';
import { Avatar } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { StatusBadge } from './status-badge';
import { ErrorBanner } from './error-banner';
import { EmptyState } from './data-table';
import { ROLE_LABELS, bookingCode, bookingDate, bookingServiceName, orderCode, phoneFa, timeSlotFa } from './format';

export interface UserDetailSheetProps {
  /** Row from the users list — shown immediately while the full record loads. */
  user: AdminUser | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

/** Profile + the user's orders and bookings (`GET /admin/users/:id`). */
export function UserDetailSheet({ user, open, onOpenChange }: UserDetailSheetProps) {
  const { isAdmin } = useAuth();
  const id = user?.id;
  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ['admin', 'user', id ?? ''] as const,
    queryFn: () => unwrap(adminApi.users.get(id!)),
    enabled: open && isAdmin && !!id,
    staleTime: 30_000,
  });

  const u = data ?? user;
  const orders = data?.orders ?? user?.orders ?? [];
  const bookings = data?.bookings ?? user?.bookings ?? [];
  const orderCount = u?._count?.orders ?? orders.length;
  const bookingCount = u?._count?.bookings ?? bookings.length;

  return (
    <ResponsiveDialog
      open={open}
      onOpenChange={onOpenChange}
      title={u?.name || 'کاربر اتولانژ'}
      description={u ? `عضو از ${formatJalali(u.createdAt)}` : undefined}
      snapPoints={[0.7, 0.92]}
      desktopClassName="max-w-xl"
    >
      {!u ? null : (
        <div className="space-y-5 pt-1">
          <div className="flex items-center gap-3">
            <Avatar size="lg" fallback={(u.name ?? 'ک').charAt(0)} className="ring-2 ring-secondary/50" />
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <p className="font-bold text-foreground">{u.name || 'بدون نام'}</p>
                <Badge variant={u.role === 'admin' ? 'secondary' : 'outline'} size="sm">
                  {ROLE_LABELS[u.role ?? 'customer'] ?? u.role}
                </Badge>
                {u.isActive === false && (
                  <Badge variant="destructive" size="sm">
                    غیرفعال
                  </Badge>
                )}
              </div>
              <p className="text-sm text-muted-foreground" dir="ltr">
                {phoneFa(u.phoneNumber)}
              </p>
              {u.email && (
                <p className="truncate text-xs text-muted-foreground" dir="ltr">
                  {u.email}
                </p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <Button asChild variant="outline" size="sm" className="gap-2">
              <a href={`tel:${u.phoneNumber}`}>
                <Phone className="h-4 w-4" aria-hidden="true" />
                تماس
              </a>
            </Button>
            {u.email ? (
              <Button asChild variant="outline" size="sm" className="gap-2">
                <a href={`mailto:${u.email}`}>
                  <Mail className="h-4 w-4" aria-hidden="true" />
                  ایمیل
                </a>
              </Button>
            ) : (
              <Button variant="outline" size="sm" className="gap-2" disabled>
                <Mail className="h-4 w-4" aria-hidden="true" />
                بدون ایمیل
              </Button>
            )}
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div className="rounded-xl bg-background-secondary/70 p-3 text-center">
              <p className="text-2xl font-black text-foreground">{toPersianDigits(orderCount)}</p>
              <p className="text-xs text-muted-foreground">سفارش</p>
            </div>
            <div className="rounded-xl bg-background-secondary/70 p-3 text-center">
              <p className="text-2xl font-black text-foreground">{toPersianDigits(bookingCount)}</p>
              <p className="text-xs text-muted-foreground">رزرو</p>
            </div>
          </div>

          {isError && <ErrorBanner message={error.message} onRetry={() => refetch()} />}

          <section>
            <h3 className="mb-2 flex items-center gap-2 text-sm font-bold text-foreground">
              <ShoppingBag className="h-4 w-4 text-secondary-800 dark:text-secondary-300" aria-hidden="true" />
              سفارش‌ها
            </h3>
            {isLoading && !data ? (
              <SheetListSkeleton />
            ) : orders.length === 0 ? (
              <div className="rounded-xl border border-dashed border-border/70 py-6">
                <EmptyState title="سفارشی ثبت نشده" />
              </div>
            ) : (
              <ul className="divide-y divide-border/50 rounded-xl border border-border/60">
                {orders.map((o) => (
                  <li key={o.id}>
                    <Link
                      href={`/admin/orders/${o.id}`}
                      className="flex min-h-[56px] items-center gap-3 px-3 py-2 transition-colors hover:bg-secondary/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring"
                    >
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-semibold text-foreground" dir="ltr">
                          {orderCode(o)}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {formatJalaliDateTime(o.createdAt)} · {formatToman(o.totalPrice)}
                        </p>
                      </div>
                      <StatusBadge kind="order" status={o.status} size="sm" />
                      <ChevronLeft className="h-4 w-4 shrink-0 text-muted-foreground" aria-hidden="true" />
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </section>

          <section>
            <h3 className="mb-2 flex items-center gap-2 text-sm font-bold text-foreground">
              <CalendarDays className="h-4 w-4 text-secondary-800 dark:text-secondary-300" aria-hidden="true" />
              رزروها
            </h3>
            {isLoading && !data ? (
              <SheetListSkeleton />
            ) : bookings.length === 0 ? (
              <div className="rounded-xl border border-dashed border-border/70 py-6">
                <EmptyState title="رزروی ثبت نشده" />
              </div>
            ) : (
              <ul className="divide-y divide-border/50 rounded-xl border border-border/60">
                {bookings.map((b) => (
                  <li key={b.id}>
                    <Link
                      href={`/admin/bookings/${b.id}`}
                      className="flex min-h-[56px] items-center gap-3 px-3 py-2 transition-colors hover:bg-secondary/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring"
                    >
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-semibold text-foreground">{bookingServiceName(b)}</p>
                        <p className="text-xs text-muted-foreground">
                          <span dir="ltr">{bookingCode(b)}</span> · {formatJalali(bookingDate(b))} · {timeSlotFa(b.timeSlot)}
                        </p>
                      </div>
                      <StatusBadge kind="booking" status={b.status} size="sm" />
                      <ChevronLeft className="h-4 w-4 shrink-0 text-muted-foreground" aria-hidden="true" />
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>
      )}
    </ResponsiveDialog>
  );
}

function SheetListSkeleton() {
  return (
    <div className="space-y-2">
      {Array.from({ length: 2 }).map((_, i) => (
        <Skeleton key={i} className="h-14 w-full rounded-xl" />
      ))}
    </div>
  );
}
