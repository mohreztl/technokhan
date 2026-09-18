'use client';

import * as React from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { CalendarDays, Eye, X } from 'lucide-react';
import type { Booking } from '@autolounge/shared';
import { formatToman, toPersianDigits } from '@autolounge/shared';
import { useAdminBookings } from '@/lib/hooks/use-admin';
import { formatJalali, fromIsoDate, relativeJalaliLabel, toIsoDate } from '@/lib/jalali';
import { Button } from '@/components/ui/button';
import { IconButton } from '@/components/ui/icon-button';
import { AdminPageHeader } from '@/components/admin/admin-page-header';
import { DataTable, type DataTableColumn } from '@/components/admin/data-table';
import { DateFilterDialog } from '@/components/admin/date-filter-dialog';
import { FiltersBar } from '@/components/admin/filters-bar';
import { ErrorBanner } from '@/components/admin/error-banner';
import { BOOKING_STATUSES, StatusBadge, statusLabel } from '@/components/admin/status-badge';
import { bookingCode, bookingDate, bookingServiceName, timeSlotFa } from '@/components/admin/format';

const PAGE_SIZE = 20;

const STATUS_CHIPS = [
  { value: '', label: 'همه' },
  ...BOOKING_STATUSES.map((s) => ({ value: s, label: statusLabel('booking', s) })),
];

function initialDate(raw: string | null): Date | null {
  if (!raw) return null;
  if (raw === 'today') return new Date();
  return /^\d{4}-\d{2}-\d{2}$/.test(raw) ? fromIsoDate(raw) : null;
}

const columns: DataTableColumn<Booking>[] = [
  {
    key: 'code',
    header: 'کد',
    cell: (b) => (
      <span className="font-bold text-foreground" dir="ltr">
        {bookingCode(b)}
      </span>
    ),
  },
  {
    key: 'service',
    header: 'خدمت',
    cell: (b) => <span className="block max-w-56 truncate font-semibold text-foreground">{bookingServiceName(b)}</span>,
  },
  {
    key: 'car',
    header: 'مشتری / خودرو',
    cell: (b) => (
      <div className="min-w-0">
        <span className="block truncate">
          {b.carModel} {b.carYear ? `(${toPersianDigits(b.carYear)})` : ''}
        </span>
        <span className="block text-xs text-muted-foreground">
          {b.carColor}
          {b.carPlate && (
            <>
              {' '}
              · <span dir="ltr">{toPersianDigits(b.carPlate)}</span>
            </>
          )}
        </span>
      </div>
    ),
  },
  {
    key: 'when',
    header: 'تاریخ و ساعت',
    cell: (b) => (
      <div className="whitespace-nowrap">
        <span className="block">{relativeJalaliLabel(bookingDate(b))}</span>
        <span className="block text-xs text-muted-foreground">{timeSlotFa(b.timeSlot)}</span>
      </div>
    ),
  },
  { key: 'status', header: 'وضعیت', cell: (b) => <StatusBadge kind="booking" status={b.status} size="sm" /> },
  { key: 'price', header: 'مبلغ', cell: (b) => <span className="whitespace-nowrap font-semibold">{formatToman(b.totalPrice)}</span> },
  {
    key: 'actions',
    header: <span className="sr-only">عملیات</span>,
    className: 'w-14 text-end',
    cell: (b) => (
      <IconButton asChild label={`مشاهدهٔ رزرو ${bookingCode(b)}`} icon={<Eye />} size="sm">
        <Link href={`/admin/bookings/${b.id}`} onClick={(e) => e.stopPropagation()} />
      </IconButton>
    ),
  },
];

export function AdminBookingsClient() {
  const params = useSearchParams();
  const [status, setStatus] = React.useState(params.get('status') ?? '');
  const [date, setDate] = React.useState<Date | null>(() => initialDate(params.get('date')));
  const [dateOpen, setDateOpen] = React.useState(false);
  const [page, setPage] = React.useState(1);

  const query = React.useMemo(
    () => ({ status: status || undefined, date: date ? toIsoDate(date) : undefined, page, limit: PAGE_SIZE }),
    [status, date, page]
  );
  const { data, isLoading, isFetching, isError, error, refetch } = useAdminBookings(query);
  const rows = data?.items ?? [];

  return (
    <>
      <AdminPageHeader
        title="رزروها"
        subtitle={data?.pagination ? `${toPersianDigits(data.pagination.total)} رزرو` : 'مدیریت رزرو خدمات'}
      />

      <div className="mb-4 flex items-start gap-2">
        <FiltersBar
          className="min-w-0 flex-1"
          chips={STATUS_CHIPS}
          value={status}
          onChange={(v) => {
            setStatus(v);
            setPage(1);
          }}
        />
        <div className="flex shrink-0 items-center gap-1">
          <Button
            type="button"
            variant={date ? 'primary' : 'outline'}
            size="sm"
            className="h-11 gap-2 rounded-full border-border px-4 lg:h-10"
            onClick={() => setDateOpen(true)}
            aria-label={date ? `فیلتر تاریخ: ${formatJalali(date)}` : 'فیلتر تاریخ'}
          >
            <CalendarDays className="h-4 w-4" aria-hidden="true" />
            <span className="hidden sm:inline">{date ? formatJalali(date) : 'تاریخ'}</span>
            {date && <span className="sm:hidden">{relativeJalaliLabel(date)}</span>}
          </Button>
          {date && (
            <IconButton
              label="حذف فیلتر تاریخ"
              icon={<X />}
              size="sm"
              onClick={() => {
                setDate(null);
                setPage(1);
              }}
            />
          )}
        </div>
      </div>

      <DateFilterDialog
        open={dateOpen}
        onOpenChange={setDateOpen}
        value={date}
        onChange={(d) => {
          setDate(d);
          setPage(1);
        }}
        title="فیلتر بر اساس تاریخ رزرو"
      />

      {isError && <ErrorBanner message={error.message} onRetry={() => refetch()} className="mb-4" />}

      <DataTable
        caption="فهرست رزروها"
        columns={columns}
        rows={rows}
        rowKey={(b) => b.id}
        rowHref={(b) => `/admin/bookings/${b.id}`}
        loading={isLoading}
        fetching={isFetching && !isLoading}
        pagination={data?.pagination}
        onPageChange={setPage}
        empty={{
          icon: <CalendarDays />,
          title: 'رزروی یافت نشد',
          description: status || date ? 'فیلترها را تغییر دهید.' : 'هنوز رزروی ثبت نشده است.',
        }}
        mobile={(b) => (
          <div className="space-y-2">
            <div className="flex items-center justify-between gap-2">
              <span className="truncate font-bold text-foreground">{bookingServiceName(b)}</span>
              <StatusBadge kind="booking" status={b.status} size="sm" />
            </div>
            <p className="text-sm text-foreground">
              {b.carModel} · {b.carColor}
            </p>
            <div className="flex items-center justify-between gap-2 text-xs text-muted-foreground">
              <span>
                {relativeJalaliLabel(bookingDate(b))} · {timeSlotFa(b.timeSlot)}
              </span>
              <span className="font-bold text-foreground">{formatToman(b.totalPrice)}</span>
            </div>
          </div>
        )}
      />
    </>
  );
}
