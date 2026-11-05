'use client';

import * as React from 'react';
import { useSearchParams } from 'next/navigation';
import { Eye, Users } from 'lucide-react';
import { toPersianDigits } from '@technokhan/shared';
import type { AdminUser } from '@/lib/api/endpoints';
import { useAdminUsers } from '@/lib/hooks/use-admin';
import { formatJalali } from '@/lib/jalali';
import { Avatar } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { IconButton } from '@/components/ui/icon-button';
import { AdminPageHeader } from '@/components/admin/admin-page-header';
import { DataTable, type DataTableColumn } from '@/components/admin/data-table';
import { ErrorBanner } from '@/components/admin/error-banner';
import { FiltersBar } from '@/components/admin/filters-bar';
import { SearchInput } from '@/components/admin/search-input';
import { UserDetailSheet } from '@/components/admin/user-detail-sheet';
import { ROLE_LABELS, phoneFa } from '@/components/admin/format';

const PAGE_SIZE = 20;

function RoleBadge({ role }: { role?: string }) {
  return (
    <Badge variant={role === 'admin' ? 'secondary' : 'outline'} size="sm">
      {ROLE_LABELS[role ?? 'customer'] ?? role}
    </Badge>
  );
}

export function AdminUsersClient() {
  const params = useSearchParams();
  const [search, setSearch] = React.useState(params.get('search') ?? '');
  const [page, setPage] = React.useState(1);
  const [selected, setSelected] = React.useState<AdminUser | null>(null);
  const [sheetOpen, setSheetOpen] = React.useState(false);

  const query = React.useMemo(() => ({ search: search || undefined, page, limit: PAGE_SIZE }), [search, page]);
  const { data, isLoading, isFetching, isError, error, refetch } = useAdminUsers(query);
  const rows = data?.items ?? [];

  const open = (u: AdminUser) => {
    setSelected(u);
    setSheetOpen(true);
  };

  const columns: DataTableColumn<AdminUser>[] = [
    {
      key: 'name',
      header: 'نام',
      cell: (u) => (
        <div className="flex items-center gap-3">
          <Avatar size="sm" fallback={(u.name ?? 'ک').charAt(0)} />
          <div className="min-w-0">
            <span className="block truncate font-semibold text-foreground">{u.name || 'بدون نام'}</span>
            {u.email && (
              <span className="block truncate text-xs text-muted-foreground" dir="ltr">
                {u.email}
              </span>
            )}
          </div>
        </div>
      ),
    },
    {
      key: 'phone',
      header: 'موبایل',
      cell: (u) => (
        <span className="whitespace-nowrap tabular-nums" dir="ltr">
          {phoneFa(u.phoneNumber)}
        </span>
      ),
    },
    { key: 'role', header: 'نقش', cell: (u) => <RoleBadge role={u.role} /> },
    { key: 'orders', header: 'سفارش‌ها', className: 'text-center', cell: (u) => <span className="tabular-nums">{toPersianDigits(u._count?.orders ?? 0)}</span> },
    { key: 'bookings', header: 'رزروها', className: 'text-center', cell: (u) => <span className="tabular-nums">{toPersianDigits(u._count?.bookings ?? 0)}</span> },
    {
      key: 'joined',
      header: 'تاریخ عضویت',
      cell: (u) => <span className="whitespace-nowrap text-xs text-muted-foreground">{formatJalali(u.createdAt)}</span>,
    },
    {
      key: 'actions',
      header: <span className="sr-only">عملیات</span>,
      className: 'w-14 text-end',
      cell: (u) => (
        <IconButton
          label={`جزئیات ${u.name || u.phoneNumber}`}
          icon={<Eye />}
          size="sm"
          onClick={(e) => {
            e.stopPropagation();
            open(u);
          }}
        />
      ),
    },
  ];

  return (
    <>
      <AdminPageHeader
        title="کاربران"
        subtitle={data?.pagination ? `${toPersianDigits(data.pagination.total)} کاربر` : 'مدیریت حساب‌های کاربری'}
      />

      <FiltersBar
        className="mb-4"
        end={
          <SearchInput
            value={search}
            onChange={(v) => {
              setSearch(v);
              setPage(1);
            }}
            placeholder="جست‌وجو با نام، موبایل یا ایمیل…"
          />
        }
      />

      {isError && <ErrorBanner message={error.message} onRetry={() => refetch()} className="mb-4" />}

      <DataTable
        caption="فهرست کاربران"
        columns={columns}
        rows={rows}
        rowKey={(u) => u.id}
        onRowClick={open}
        loading={isLoading}
        fetching={isFetching && !isLoading}
        pagination={data?.pagination}
        onPageChange={setPage}
        empty={{
          icon: <Users />,
          title: 'کاربری یافت نشد',
          description: search ? 'عبارت دیگری جست‌وجو کنید.' : 'هنوز کاربری ثبت‌نام نکرده است.',
        }}
        mobile={(u) => (
          <div className="flex items-center gap-3">
            <Avatar size="md" fallback={(u.name ?? 'ک').charAt(0)} />
            <div className="min-w-0 flex-1">
              <div className="flex items-center justify-between gap-2">
                <span className="truncate font-bold text-foreground">{u.name || 'بدون نام'}</span>
                <RoleBadge role={u.role} />
              </div>
              <p className="text-sm text-muted-foreground" dir="ltr">
                {phoneFa(u.phoneNumber)}
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                {toPersianDigits(u._count?.orders ?? 0)} سفارش · {toPersianDigits(u._count?.bookings ?? 0)} رزرو · عضو از {formatJalali(u.createdAt)}
              </p>
            </div>
          </div>
        )}
      />

      <UserDetailSheet user={selected} open={sheetOpen} onOpenChange={setSheetOpen} />
    </>
  );
}
