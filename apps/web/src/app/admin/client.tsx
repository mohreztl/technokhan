'use client';

import * as React from 'react';
import Link from 'next/link';
import {
  CalendarDays,
  ChevronLeft,
  Clock,
  ExternalLink,
  Hourglass,
  MailOpen,
  Package,
  Plus,
  RefreshCw,
  ShoppingBag,
  Users,
  Wallet,
  Wrench,
} from 'lucide-react';
import { APP_NAME, ROUTES, formatToman, toPersianDigits } from '@autolounge/shared';
import { useAdminDashboard } from '@/lib/hooks/use-admin';
import { formatJalali, formatJalaliDateTime } from '@/lib/jalali';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { AdminPageHeader } from '@/components/admin/admin-page-header';
import { StatCard } from '@/components/admin/stat-card';
import { StatusBadge } from '@/components/admin/status-badge';
import { DetailCard } from '@/components/admin/detail-card';
import { EmptyState } from '@/components/admin/data-table';
import { ErrorBanner } from '@/components/admin/error-banner';
import { bookingCode, bookingDate, bookingServiceName, orderCode, timeSlotFa } from '@/components/admin/format';

const QUICK_ACTIONS = [
  { href: '/admin/products?new=1', label: 'محصول جدید', icon: Package },
  { href: '/admin/services?new=1', label: 'خدمت جدید', icon: Wrench },
  { href: '/admin/bookings?date=today', label: 'رزروهای امروز', icon: CalendarDays },
  { href: '/admin/orders?status=pending', label: 'سفارش‌های در انتظار', icon: Clock },
] as const;

export function AdminDashboardClient() {
  const { data, isLoading, isFetching, isError, error, refetch } = useAdminDashboard();
  const stats = data;
  const unread = stats?.unreadMessages ?? 0;

  return (
    <>
      <AdminPageHeader
        title="داشبورد"
        subtitle={`خلاصهٔ وضعیت ${APP_NAME} · ${formatJalali(new Date(), true)}`}
        actions={
          <Button type="button" variant="outline" size="sm" className="gap-2" onClick={() => refetch()} disabled={isFetching}>
            <RefreshCw className={isFetching ? 'h-4 w-4 animate-spin' : 'h-4 w-4'} aria-hidden="true" />
            به‌روزرسانی
          </Button>
        }
      />

      {isError && <ErrorBanner message={error.message} onRetry={() => refetch()} className="mb-5" />}

      <div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-6">
        <StatCard
          icon={<Wallet />}
          label="درآمد پرداخت‌شده"
          value={stats?.revenue ?? 0}
          unit="تومان"
          accent="success"
          loading={isLoading}
          className="col-span-2 md:col-span-1"
        />
        <StatCard icon={<Users />} label="کاربران" value={stats?.users ?? 0} href="/admin/users" accent="navy" loading={isLoading} />
        <StatCard icon={<ShoppingBag />} label="سفارش‌ها" value={stats?.orders ?? 0} href="/admin/orders" loading={isLoading} />
        <StatCard icon={<CalendarDays />} label="رزروها" value={stats?.bookings ?? 0} href="/admin/bookings" loading={isLoading} />
        <StatCard
          icon={<Clock />}
          label="سفارش‌های در انتظار"
          value={stats?.pendingOrders ?? 0}
          href="/admin/orders?status=pending"
          accent="warning"
          loading={isLoading}
        />
        <StatCard
          icon={<Hourglass />}
          label="رزروهای در انتظار"
          value={stats?.pendingBookings ?? 0}
          href="/admin/bookings?status=pending"
          accent="warning"
          loading={isLoading}
          className="col-span-2 md:col-span-1"
        />
      </div>

      {unread > 0 && (
        <Link
          href="/admin/messages?filter=unread"
          className="mt-4 flex items-center gap-3 rounded-2xl border border-secondary/50 bg-secondary/10 p-4 transition-colors hover:bg-secondary/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-secondary text-primary" aria-hidden="true">
            <MailOpen className="h-5 w-5" />
          </span>
          <span className="min-w-0 flex-1">
            <span className="block text-sm font-bold text-foreground">
              {toPersianDigits(unread)} پیام خوانده‌نشده دارید
            </span>
            <span className="block text-xs text-muted-foreground">پیام‌های فرم تماس منتظر پاسخ شما هستند.</span>
          </span>
          <ChevronLeft className="h-5 w-5 shrink-0 text-muted-foreground" aria-hidden="true" />
        </Link>
      )}

      <section className="mt-6" aria-label="دسترسی سریع">
        <h2 className="mb-2 text-sm font-bold text-muted-foreground">دسترسی سریع</h2>
        <div className="hide-scrollbar -mx-4 flex gap-2 overflow-x-auto px-4 pb-1 sm:mx-0 sm:flex-wrap sm:px-0">
          {QUICK_ACTIONS.map((a) => {
            const Icon = a.icon;
            return (
              <Button key={a.href} asChild variant="outline" size="sm" className="h-11 shrink-0 gap-2 rounded-xl border-border sm:h-10">
                <Link href={a.href}>
                  {a.href.includes('new=1') ? <Plus className="h-4 w-4" aria-hidden="true" /> : <Icon className="h-4 w-4" aria-hidden="true" />}
                  {a.label}
                </Link>
              </Button>
            );
          })}
          <Button asChild variant="ghost" size="sm" className="h-11 shrink-0 gap-2 rounded-xl sm:h-10">
            <Link href={ROUTES.HOME}>
              <ExternalLink className="h-4 w-4" aria-hidden="true" />
              مشاهدهٔ سایت
            </Link>
          </Button>
        </div>
      </section>

      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        <DetailCard
          title="آخرین سفارش‌ها"
          icon={<ShoppingBag />}
          contentClassName="p-0"
          action={
            <Link href="/admin/orders" className="inline-flex min-h-[44px] items-center gap-1 text-xs font-semibold text-primary hover:underline dark:text-secondary">
              همه
              <ChevronLeft className="h-3.5 w-3.5" aria-hidden="true" />
            </Link>
          }
        >
          {isLoading ? (
            <ListSkeleton />
          ) : !stats || stats.recentOrders.length === 0 ? (
            <div className="py-8">
              <EmptyState icon={<ShoppingBag />} title="هنوز سفارشی ثبت نشده" />
            </div>
          ) : (
            <ul className="divide-y divide-border/50">
              {stats.recentOrders.map((o) => (
                <li key={o.id}>
                  <Link
                    href={`/admin/orders/${o.id}`}
                    className="flex min-h-[64px] items-center gap-3 px-4 py-3 transition-colors hover:bg-secondary/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring"
                  >
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-sm font-bold text-foreground" dir="ltr">
                          {orderCode(o)}
                        </span>
                        <StatusBadge kind="order" status={o.status} size="sm" />
                        <StatusBadge kind="payment" status={o.paymentStatus} size="sm" withDot={false} />
                      </div>
                      <p className="mt-1 truncate text-xs text-muted-foreground">
                        {o.shippingAddress?.fullName ?? '—'} · {formatJalaliDateTime(o.createdAt)}
                      </p>
                    </div>
                    <div className="text-end">
                      <p className="text-sm font-bold text-foreground">{formatToman(o.totalPrice)}</p>
                      <p className="text-[11px] text-muted-foreground">{toPersianDigits(o.items.length)} قلم</p>
                    </div>
                    <ChevronLeft className="h-4 w-4 shrink-0 text-muted-foreground" aria-hidden="true" />
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </DetailCard>

        <DetailCard
          title="آخرین رزروها"
          icon={<CalendarDays />}
          contentClassName="p-0"
          action={
            <Link href="/admin/bookings" className="inline-flex min-h-[44px] items-center gap-1 text-xs font-semibold text-primary hover:underline dark:text-secondary">
              همه
              <ChevronLeft className="h-3.5 w-3.5" aria-hidden="true" />
            </Link>
          }
        >
          {isLoading ? (
            <ListSkeleton />
          ) : !stats || stats.recentBookings.length === 0 ? (
            <div className="py-8">
              <EmptyState icon={<CalendarDays />} title="هنوز رزروی ثبت نشده" />
            </div>
          ) : (
            <ul className="divide-y divide-border/50">
              {stats.recentBookings.map((b) => (
                <li key={b.id}>
                  <Link
                    href={`/admin/bookings/${b.id}`}
                    className="flex min-h-[64px] items-center gap-3 px-4 py-3 transition-colors hover:bg-secondary/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring"
                  >
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="truncate text-sm font-bold text-foreground">{bookingServiceName(b)}</span>
                        <StatusBadge kind="booking" status={b.status} size="sm" />
                      </div>
                      <p className="mt-1 truncate text-xs text-muted-foreground">
                        <span dir="ltr">{bookingCode(b)}</span> · {b.carModel} · {formatJalali(bookingDate(b))} · {timeSlotFa(b.timeSlot)}
                      </p>
                    </div>
                    <p className="text-sm font-bold text-foreground">{formatToman(b.totalPrice)}</p>
                    <ChevronLeft className="h-4 w-4 shrink-0 text-muted-foreground" aria-hidden="true" />
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </DetailCard>
      </div>
    </>
  );
}

function ListSkeleton() {
  return (
    <div className="space-y-3 p-4">
      {Array.from({ length: 3 }).map((_, i) => (
        <div key={i} className="flex items-center gap-3">
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-40" />
            <Skeleton className="h-3 w-56 max-w-full" />
          </div>
          <Skeleton className="h-4 w-20" />
        </div>
      ))}
    </div>
  );
}
