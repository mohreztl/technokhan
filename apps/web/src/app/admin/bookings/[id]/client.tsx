'use client';

import * as React from 'react';
import Link from 'next/link';
import { toast } from 'sonner';
import { ArrowLeft, Ban, CalendarDays, Car, ClipboardList, Save, Wrench } from 'lucide-react';
import { BookingStatus, VEHICLE_SIZES, findService, formatToman, toPersianDigits } from '@technokhan/shared';
import { useAdminBooking, useAdminMutations } from '@/lib/hooks/use-admin';
import { formatJalali, formatJalaliDateTime } from '@/lib/jalali';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { AdminPageHeader } from '@/components/admin/admin-page-header';
import { ConfirmDialog } from '@/components/admin/confirm-dialog';
import { DetailCard, DetailList, DetailRow } from '@/components/admin/detail-card';
import { ErrorBanner } from '@/components/admin/error-banner';
import { EmptyState } from '@/components/admin/data-table';
import { StatusBadge, nextBookingStatus, statusLabel } from '@/components/admin/status-badge';
import { StatusSelect } from '@/components/admin/status-select';
import { bookingCode, bookingDate, bookingServiceName, locationLabel, shortId, timeSlotFa } from '@/components/admin/format';

export function AdminBookingDetailClient({ id }: { id: string }) {
  const { data: booking, isLoading, isError, error, refetch } = useAdminBooking(id);
  const { updateBookingStatus } = useAdminMutations();
  const [status, setStatus] = React.useState('');
  const [cancelOpen, setCancelOpen] = React.useState(false);

  React.useEffect(() => {
    if (booking) setStatus(booking.status);
  }, [booking]);

  const save = (nextStatus: string, onDone?: () => void) => {
    updateBookingStatus.mutate(
      { id, status: nextStatus as BookingStatus },
      {
        onSuccess: () => {
          toast.success('وضعیت رزرو به‌روزرسانی شد', { description: statusLabel('booking', nextStatus) });
          onDone?.();
        },
        onError: (e) => toast.error('به‌روزرسانی ناموفق بود', { description: e.message }),
      }
    );
  };

  if (isLoading) return <DetailSkeleton />;

  if (isError || !booking) {
    const notFound = (error as { status?: number } | null)?.status === 404;
    return (
      <>
        <AdminPageHeader title="جزئیات رزرو" backHref="/admin/bookings" backLabel="رزروها" />
        {notFound ? (
          <div className="rounded-2xl border border-dashed border-border/70 py-12">
            <EmptyState
              icon={<CalendarDays />}
              title="رزرو یافت نشد"
              description="ممکن است این رزرو حذف شده باشد یا شناسهٔ آن اشتباه باشد."
              action={
                <Button asChild variant="outline" size="sm">
                  <Link href="/admin/bookings">بازگشت به فهرست رزروها</Link>
                </Button>
              }
            />
          </div>
        ) : (
          <ErrorBanner message={error?.message} onRetry={() => refetch()} />
        )}
      </>
    );
  }

  const service = findService(booking.serviceId);
  const addons = (booking.addonIds ?? [])
    .map((aid) => service?.addons?.find((a) => a.id === aid))
    .filter((a): a is NonNullable<typeof a> => Boolean(a));
  const sizeLabel = VEHICLE_SIZES.find((s) => s.id === booking.vehicleSize)?.label;
  const next = nextBookingStatus(booking.status);
  const busy = updateBookingStatus.isPending;
  const closed = booking.status === BookingStatus.COMPLETED || booking.status === BookingStatus.CANCELLED;
  const dirty = status !== booking.status;

  return (
    <>
      <AdminPageHeader
        title={
          <span className="flex flex-wrap items-center gap-2">
            <span dir="ltr">{bookingCode(booking)}</span>
            <StatusBadge kind="booking" status={booking.status} />
          </span>
        }
        subtitle={`${bookingServiceName(booking)} · ${formatJalali(bookingDate(booking), true)} · ${timeSlotFa(booking.timeSlot)}`}
        backHref="/admin/bookings"
        backLabel="رزروها"
        actions={
          <>
            {next && (
              <Button type="button" size="sm" className="gap-2" loading={busy} loadingText="در حال ثبت…" onClick={() => save(next)}>
                <ArrowLeft className="h-4 w-4" aria-hidden="true" />
                {statusLabel('booking', next)}
              </Button>
            )}
            {!closed && (
              <Button type="button" variant="outline" size="sm" className="gap-2 border-destructive/50 text-destructive hover:bg-destructive hover:text-destructive-foreground" disabled={busy} onClick={() => setCancelOpen(true)}>
                <Ban className="h-4 w-4" aria-hidden="true" />
                لغو رزرو
              </Button>
            )}
          </>
        }
      />

      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,2fr)]">
        <div className="space-y-4">
          <DetailCard title="تغییر وضعیت" icon={<Save />}>
            <div className="space-y-4">
              <StatusSelect kind="booking" value={status} onChange={setStatus} disabled={busy} />
              <Button type="button" className="w-full gap-2" disabled={!dirty} loading={busy} loadingText="در حال ذخیره…" onClick={() => save(status)}>
                <Save className="h-4 w-4" aria-hidden="true" />
                ذخیرهٔ وضعیت
              </Button>
              <p className="text-xs leading-5 text-muted-foreground">
                مسیر معمول: در انتظار تأیید ← تأیید شده ← در حال انجام ← انجام شده. لغو نیاز به تأیید دارد.
              </p>
            </div>
          </DetailCard>

          <DetailCard title="خلاصهٔ رزرو" icon={<ClipboardList />}>
            <DetailList>
              <DetailRow label="کد رزرو" value={bookingCode(booking)} dir="ltr" />
              <DetailRow label="شناسهٔ کاربر" value={shortId(booking.userId)} dir="ltr" />
              <DetailRow label="محل انجام" value={locationLabel(booking.location)} />
              <DetailRow label="مبلغ" value={<span className="text-base font-black">{formatToman(booking.totalPrice)}</span>} />
              <DetailRow label="ثبت‌شده در" value={formatJalaliDateTime(booking.createdAt)} />
              <DetailRow label="آخرین تغییر" value={formatJalaliDateTime(booking.updatedAt)} />
            </DetailList>
          </DetailCard>
        </div>

        <div className="space-y-4">
          <DetailCard title="خدمت" icon={<Wrench />}>
            <DetailList>
              <DetailRow
                label="نام خدمت"
                value={
                  <Link href={`/services/${booking.serviceId}`} className="hover:underline">
                    {bookingServiceName(booking)}
                  </Link>
                }
              />
              <DetailRow label="تاریخ" value={formatJalali(bookingDate(booking), true)} />
              <DetailRow label="بازهٔ زمانی" value={timeSlotFa(booking.timeSlot)} />
              {(booking.service?.duration ?? service?.duration) && (
                <DetailRow label="مدت تقریبی" value={`${toPersianDigits(booking.service?.duration ?? service?.duration ?? 0)} دقیقه`} />
              )}
              {addons.length > 0 && (
                <DetailRow
                  label="خدمات افزودنی"
                  value={
                    <ul className="space-y-1">
                      {addons.map((a) => (
                        <li key={a.id}>
                          {a.name} <span className="text-xs text-muted-foreground">({formatToman(a.price)})</span>
                        </li>
                      ))}
                    </ul>
                  }
                />
              )}
            </DetailList>
          </DetailCard>

          <DetailCard title="خودرو" icon={<Car />}>
            <DetailList>
              <DetailRow label="مدل" value={booking.carModel} />
              <DetailRow label="سال" value={booking.carYear ? toPersianDigits(booking.carYear) : '—'} />
              <DetailRow label="رنگ" value={booking.carColor} />
              {booking.carPlate && <DetailRow label="پلاک" value={toPersianDigits(booking.carPlate)} dir="ltr" />}
              {sizeLabel && <DetailRow label="اندازه" value={sizeLabel} />}
            </DetailList>
          </DetailCard>

          {booking.notes && (
            <DetailCard title="یادداشت مشتری" icon={<ClipboardList />}>
              <p className="whitespace-pre-wrap text-sm leading-7 text-foreground">{booking.notes}</p>
            </DetailCard>
          )}
        </div>
      </div>

      <ConfirmDialog
        open={cancelOpen}
        onOpenChange={setCancelOpen}
        title="لغو این رزرو؟"
        description="رزرو لغو می‌شود و بازهٔ زمانی آن برای دیگران آزاد خواهد شد. این کار قابل بازگشت نیست."
        confirmLabel="بله، لغو کن"
        destructive
        loading={busy}
        icon={<Ban />}
        onConfirm={() => save(BookingStatus.CANCELLED, () => setCancelOpen(false))}
      />
    </>
  );
}

function DetailSkeleton() {
  return (
    <div className="space-y-5" aria-busy="true">
      <Skeleton className="h-4 w-24" />
      <Skeleton className="h-8 w-56" />
      <Skeleton className="h-4 w-72 max-w-full" />
      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,2fr)]">
        <div className="space-y-4">
          <Skeleton className="h-56 rounded-2xl" />
          <Skeleton className="h-64 rounded-2xl" />
        </div>
        <div className="space-y-4">
          <Skeleton className="h-52 rounded-2xl" />
          <Skeleton className="h-44 rounded-2xl" />
        </div>
      </div>
    </div>
  );
}
