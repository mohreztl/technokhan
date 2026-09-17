'use client';

import * as React from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Eye, ShoppingBag } from 'lucide-react';
import type { Order } from '@autolounge/shared';
import { formatToman, toPersianDigits } from '@autolounge/shared';
import { useAdminOrders } from '@/lib/hooks/use-admin';
import { formatJalaliDateTime } from '@/lib/jalali';
import { IconButton } from '@/components/ui/icon-button';
import { AdminPageHeader } from '@/components/admin/admin-page-header';
import { DataTable, type DataTableColumn } from '@/components/admin/data-table';
import { FiltersBar } from '@/components/admin/filters-bar';
import { SearchInput } from '@/components/admin/search-input';
import { ErrorBanner } from '@/components/admin/error-banner';
import { ORDER_STATUSES, StatusBadge, statusLabel } from '@/components/admin/status-badge';
import { orderCode, phoneFa } from '@/components/admin/format';

const PAGE_SIZE = 20;

const STATUS_CHIPS = [
  { value: '', label: 'همه' },
  ...ORDER_STATUSES.map((s) => ({ value: s, label: statusLabel('order', s) })),
];

const columns: DataTableColumn<Order>[] = [
  {
    key: 'code',
    header: 'کد',
    cell: (o) => (
      <div>
        <span className="font-bold text-foreground" dir="ltr">
          {orderCode(o)}
        </span>
        <span className="block text-[11px] text-muted-foreground">{toPersianDigits(o.items.length)} قلم</span>
      </div>
    ),
  },
  {
    key: 'customer',
    header: 'مشتری',
    cell: (o) => (
      <div className="min-w-0">
        <span className="block truncate font-semibold text-foreground">{o.shippingAddress?.fullName ?? '—'}</span>
        <span className="block text-xs text-muted-foreground" dir="ltr">
          {phoneFa(o.shippingAddress?.phoneNumber)}
        </span>
      </div>
    ),
  },
  { key: 'amount', header: 'مبلغ', cell: (o) => <span className="whitespace-nowrap font-semibold">{formatToman(o.totalPrice)}</span> },
  { key: 'payment', header: 'پرداخت', cell: (o) => <StatusBadge kind="payment" status={o.paymentStatus} size="sm" /> },
  { key: 'status', header: 'وضعیت', cell: (o) => <StatusBadge kind="order" status={o.status} size="sm" /> },
  {
    key: 'date',
    header: 'تاریخ',
    cell: (o) => <span className="whitespace-nowrap text-xs text-muted-foreground">{formatJalaliDateTime(o.createdAt)}</span>,
  },
  {
    key: 'actions',
    header: <span className="sr-only">عملیات</span>,
    className: 'w-14 text-end',
    cell: (o) => (
      <IconButton asChild label={`مشاهدهٔ سفارش ${orderCode(o)}`} icon={<Eye />} size="sm">
        <Link href={`/admin/orders/${o.id}`} onClick={(e) => e.stopPropagation()} />
      </IconButton>
    ),
  },
];

export function AdminOrdersClient() {
  const params = useSearchParams();
  const [status, setStatus] = React.useState(params.get('status') ?? '');
  const [search, setSearch] = React.useState(params.get('search') ?? '');
  const [page, setPage] = React.useState(1);

  const query = React.useMemo(
    () => ({ status: status || undefined, search: search || undefined, page, limit: PAGE_SIZE }),
    [status, search, page]
  );
  const { data, isLoading, isFetching, isError, error, refetch } = useAdminOrders(query);
  const rows = data?.items ?? [];

  return (
    <>
      <AdminPageHeader
        title="سفارش‌ها"
        subtitle={data?.pagination ? `${toPersianDigits(data.pagination.total)} سفارش` : 'مدیریت سفارش‌های فروشگاه'}
      />

      <FiltersBar
        className="mb-4"
        chips={STATUS_CHIPS}
        value={status}
        onChange={(v) => {
          setStatus(v);
          setPage(1);
        }}
        end={
          <SearchInput
            value={search}
            onChange={(v) => {
              setSearch(v);
              setPage(1);
            }}
            placeholder="جست‌وجو با کد پیگیری، نام یا موبایل…"
          />
        }
      />

      {isError && <ErrorBanner message={error.message} onRetry={() => refetch()} className="mb-4" />}

      <DataTable
        caption="فهرست سفارش‌ها"
        columns={columns}
        rows={rows}
        rowKey={(o) => o.id}
        rowHref={(o) => `/admin/orders/${o.id}`}
        loading={isLoading}
        fetching={isFetching && !isLoading}
        pagination={data?.pagination}
        onPageChange={setPage}
        empty={{
          icon: <ShoppingBag />,
          title: 'سفارشی یافت نشد',
          description: status || search ? 'فیلترها را تغییر دهید یا عبارت دیگری جست‌وجو کنید.' : 'هنوز سفارشی ثبت نشده است.',
        }}
        mobile={(o) => (
          <div className="space-y-2">
            <div className="flex items-center justify-between gap-2">
              <span className="font-bold text-foreground" dir="ltr">
                {orderCode(o)}
              </span>
              <StatusBadge kind="order" status={o.status} size="sm" />
            </div>
            <div className="flex items-center justify-between gap-2 text-sm">
              <span className="truncate font-semibold">{o.shippingAddress?.fullName ?? '—'}</span>
              <span className="whitespace-nowrap font-bold">{formatToman(o.totalPrice)}</span>
            </div>
            <div className="flex items-center justify-between gap-2 text-xs text-muted-foreground">
              <span>{formatJalaliDateTime(o.createdAt)}</span>
              <StatusBadge kind="payment" status={o.paymentStatus} size="sm" withDot={false} />
            </div>
          </div>
        )}
      />
    </>
  );
}
