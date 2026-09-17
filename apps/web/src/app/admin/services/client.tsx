'use client';

import * as React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { toast } from 'sonner';
import { ExternalLink, Pencil, Plus, Star, Trash2, Wrench } from 'lucide-react';
import type { Service } from '@autolounge/shared';
import { SERVICE_TYPE_LABELS, formatToman, toPersianDigits } from '@autolounge/shared';
import { useAdminMutations, useAdminServices } from '@/lib/hooks/use-admin';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { IconButton } from '@/components/ui/icon-button';
import { AdminPageHeader } from '@/components/admin/admin-page-header';
import { ConfirmDialog } from '@/components/admin/confirm-dialog';
import { DataTable, type DataTableColumn } from '@/components/admin/data-table';
import { ErrorBanner } from '@/components/admin/error-banner';
import { FiltersBar } from '@/components/admin/filters-bar';
import { SearchInput } from '@/components/admin/search-input';
import { ServiceFormDialog } from '@/components/admin/service-form-dialog';

const PAGE_SIZE = 20;
const PLACEHOLDER = '/images/placeholder-service.webp';

const TYPE_CHIPS = [
  { value: '', label: 'همهٔ انواع' },
  ...Object.entries(SERVICE_TYPE_LABELS).map(([value, label]) => ({ value, label })),
];

function durationFa(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (h === 0) return `${toPersianDigits(m)} دقیقه`;
  if (m === 0) return `${toPersianDigits(h)} ساعت`;
  return `${toPersianDigits(h)} ساعت و ${toPersianDigits(m)} دقیقه`;
}

function Thumb({ service, size = 48 }: { service: Service; size?: number }) {
  const src = service.images?.[0] ?? PLACEHOLDER;
  return (
    <Image
      src={src}
      alt=""
      width={size}
      height={size}
      sizes={`${size}px`}
      unoptimized={src.startsWith('http')}
      className="shrink-0 rounded-lg border border-border/60 object-cover"
      style={{ width: size, height: size }}
    />
  );
}

export function AdminServicesClient() {
  const params = useSearchParams();
  const [search, setSearch] = React.useState('');
  const [type, setType] = React.useState('');
  const [page, setPage] = React.useState(1);
  const [editing, setEditing] = React.useState<Service | null>(null);
  const [formOpen, setFormOpen] = React.useState(() => params.get('new') === '1');
  const [deleting, setDeleting] = React.useState<Service | null>(null);

  const { deleteService } = useAdminMutations();

  const query = React.useMemo(
    () => ({ search: search || undefined, type: type || undefined, page, limit: PAGE_SIZE }),
    [search, type, page]
  );
  const { data, isLoading, isFetching, isError, error, refetch } = useAdminServices(query);
  const rows = data?.items ?? [];

  const openCreate = () => {
    setEditing(null);
    setFormOpen(true);
  };
  const openEdit = (s: Service) => {
    setEditing(s);
    setFormOpen(true);
  };

  const confirmDelete = () => {
    if (!deleting) return;
    const target = deleting;
    deleteService.mutate(target.id, {
      onSuccess: () => {
        toast.success('خدمت حذف شد', { description: target.name });
        setDeleting(null);
      },
      onError: (e) => toast.error('حذف خدمت ناموفق بود', { description: e.message }),
    });
  };

  const actions = (s: Service) => (
    <div className="flex items-center justify-end gap-0.5" onClick={(e) => e.stopPropagation()}>
      <IconButton asChild label={`مشاهدهٔ ${s.name} در سایت`} icon={<ExternalLink />} size="sm">
        <Link href={`/services/${s.id}`} target="_blank" rel="noopener noreferrer" />
      </IconButton>
      <IconButton label={`ویرایش ${s.name}`} icon={<Pencil />} size="sm" onClick={() => openEdit(s)} />
      <IconButton
        label={`حذف ${s.name}`}
        icon={<Trash2 />}
        size="sm"
        className="text-destructive hover:bg-destructive/10 hover:text-destructive"
        onClick={() => setDeleting(s)}
      />
    </div>
  );

  const columns: DataTableColumn<Service>[] = [
    { key: 'image', header: 'تصویر', className: 'w-16', cell: (s) => <Thumb service={s} /> },
    {
      key: 'name',
      header: 'نام',
      cell: (s) => (
        <div className="min-w-0">
          <span className="block truncate font-semibold text-foreground">{s.name}</span>
          <span className="block truncate text-xs text-muted-foreground" dir="ltr">
            {s.nameEn}
          </span>
        </div>
      ),
    },
    { key: 'type', header: 'نوع', cell: (s) => <span className="whitespace-nowrap">{SERVICE_TYPE_LABELS[s.type] ?? s.type}</span> },
    {
      key: 'price',
      header: 'قیمت پایه',
      cell: (s) => (
        <div className="whitespace-nowrap">
          <span className="font-semibold text-foreground">{formatToman(s.price)}</span>
          {s.pricing && (
            <span className="block text-[11px] text-muted-foreground">
              {formatToman(s.pricing.small)} تا {formatToman(s.pricing.large)}
            </span>
          )}
        </div>
      ),
    },
    { key: 'duration', header: 'مدت', cell: (s) => <span className="whitespace-nowrap">{durationFa(s.duration)}</span> },
    {
      key: 'featured',
      header: 'ویژه',
      className: 'w-14 text-center',
      cell: (s) =>
        s.featured ? (
          <Star className="mx-auto h-4 w-4 fill-secondary text-secondary" aria-label="ویژه" />
        ) : (
          <span className="text-muted-foreground" aria-label="عادی">
            —
          </span>
        ),
    },
    {
      key: 'active',
      header: 'فعال',
      className: 'w-20',
      cell: (s) =>
        s.isActive === false ? (
          <Badge variant="outline" size="sm" className="text-muted-foreground">
            غیرفعال
          </Badge>
        ) : (
          <Badge variant="success" size="sm">
            فعال
          </Badge>
        ),
    },
    { key: 'actions', header: <span className="sr-only">عملیات</span>, className: 'w-36 text-end', cell: actions },
  ];

  return (
    <>
      <AdminPageHeader
        title="خدمات"
        subtitle={data?.pagination ? `${toPersianDigits(data.pagination.total)} خدمت` : 'مدیریت خدمات مرکز'}
        actions={
          <Button type="button" className="gap-2" onClick={openCreate}>
            <Plus className="h-5 w-5" aria-hidden="true" />
            خدمت جدید
          </Button>
        }
      />

      <FiltersBar
        className="mb-4"
        chips={TYPE_CHIPS}
        chipsLabel="فیلتر نوع خدمت"
        value={type}
        onChange={(v) => {
          setType(v);
          setPage(1);
        }}
        end={
          <SearchInput
            value={search}
            onChange={(v) => {
              setSearch(v);
              setPage(1);
            }}
            placeholder="جست‌وجو در نام خدمت…"
          />
        }
      />

      {isError && <ErrorBanner message={error.message} onRetry={() => refetch()} className="mb-4" />}

      <DataTable
        caption="فهرست خدمات"
        columns={columns}
        rows={rows}
        rowKey={(s) => s.id}
        onRowClick={openEdit}
        loading={isLoading}
        fetching={isFetching && !isLoading}
        pagination={data?.pagination}
        onPageChange={setPage}
        empty={{
          icon: <Wrench />,
          title: 'خدمتی یافت نشد',
          description: search || type ? 'فیلترها را تغییر دهید.' : 'اولین خدمت را اضافه کنید.',
          action: (
            <Button type="button" size="sm" className="gap-2" onClick={openCreate}>
              <Plus className="h-4 w-4" aria-hidden="true" />
              خدمت جدید
            </Button>
          ),
        }}
        mobile={(s) => (
          <div className="flex items-start gap-3">
            <Thumb service={s} size={56} />
            <div className="min-w-0 flex-1">
              <div className="flex items-start justify-between gap-2">
                <span className="truncate font-bold text-foreground">{s.name}</span>
                {s.featured && <Star className="h-4 w-4 shrink-0 fill-secondary text-secondary" aria-label="ویژه" />}
              </div>
              <p className="text-xs text-muted-foreground">
                {SERVICE_TYPE_LABELS[s.type] ?? s.type} · {durationFa(s.duration)}
              </p>
              <div className="mt-1 flex items-center justify-between gap-2">
                <span className="font-semibold text-foreground">{formatToman(s.price)}</span>
                {s.isActive === false && (
                  <Badge variant="outline" size="sm" className="text-muted-foreground">
                    غیرفعال
                  </Badge>
                )}
              </div>
              <div className="mt-2 border-t border-border/50 pt-1">{actions(s)}</div>
            </div>
          </div>
        )}
      />

      <ServiceFormDialog open={formOpen} onOpenChange={setFormOpen} service={editing} />

      <ConfirmDialog
        open={deleting !== null}
        onOpenChange={(o) => {
          if (!o) setDeleting(null);
        }}
        title={`حذف «${deleting?.name ?? ''}»؟`}
        description="خدمت از سایت حذف می‌شود و دیگر قابل رزرو نخواهد بود. این کار قابل بازگشت نیست."
        confirmLabel="بله، حذف کن"
        destructive
        loading={deleteService.isPending}
        icon={<Trash2 />}
        onConfirm={confirmDelete}
      />
    </>
  );
}
