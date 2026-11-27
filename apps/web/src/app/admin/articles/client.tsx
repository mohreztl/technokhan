'use client';

import * as React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { toast } from 'sonner';
import { ExternalLink, Newspaper, Pencil, Plus, Trash2 } from 'lucide-react';
import type { AdminArticleSummary } from '@technokhan/shared';
import { toPersianDigits } from '@technokhan/shared';
import { useAdminArticles, useAdminMutations } from '@/lib/hooks/use-admin';
import { formatJalali } from '@/lib/jalali';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { IconButton } from '@/components/ui/icon-button';
import { Select } from '@/components/ui/select';
import { AdminPageHeader } from '@/components/admin/admin-page-header';
import { ArticleFormDialog } from '@/components/admin/article-form-dialog';
import { ConfirmDialog } from '@/components/admin/confirm-dialog';
import { DataTable, type DataTableColumn } from '@/components/admin/data-table';
import { ErrorBanner } from '@/components/admin/error-banner';
import { FiltersBar } from '@/components/admin/filters-bar';
import { SearchInput } from '@/components/admin/search-input';

const PAGE_SIZE = 20;
const PLACEHOLDER = '/images/placeholder-product.webp';

const ACTIVE_OPTIONS = [
  { value: '', label: 'همه' },
  { value: 'true', label: 'فقط منتشرشده' },
  { value: 'false', label: 'فقط پیش‌نویس' },
];

function Cover({ article, size = 48 }: { article: AdminArticleSummary; size?: number }) {
  const src = article.coverImage || PLACEHOLDER;
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

export function AdminArticlesClient() {
  const params = useSearchParams();
  const [search, setSearch] = React.useState('');
  const [active, setActive] = React.useState('');
  const [page, setPage] = React.useState(1);
  const [editing, setEditing] = React.useState<AdminArticleSummary | null>(null);
  const [formOpen, setFormOpen] = React.useState(() => params.get('new') === '1');
  const [deleting, setDeleting] = React.useState<AdminArticleSummary | null>(null);

  const { deleteArticle } = useAdminMutations();

  const query = React.useMemo(
    () => ({
      search: search || undefined,
      isActive: active || undefined,
      page,
      limit: PAGE_SIZE,
    }),
    [search, active, page]
  );
  const { data, isLoading, isFetching, isError, error, refetch } = useAdminArticles(query);
  const rows = data?.items ?? [];

  const openCreate = () => {
    setEditing(null);
    setFormOpen(true);
  };
  const openEdit = (a: AdminArticleSummary) => {
    setEditing(a);
    setFormOpen(true);
  };

  const confirmDelete = () => {
    if (!deleting) return;
    const target = deleting;
    deleteArticle.mutate(target.id, {
      onSuccess: () => {
        toast.success('مقاله حذف شد', { description: target.title });
        setDeleting(null);
      },
      onError: (e) => toast.error('حذف مقاله ناموفق بود', { description: e.message }),
    });
  };

  const columns: DataTableColumn<AdminArticleSummary>[] = [
    { key: 'cover', header: 'کاور', className: 'w-16', cell: (a) => <Cover article={a} /> },
    {
      key: 'title',
      header: 'عنوان',
      cell: (a) => (
        <div className="min-w-0">
          <span className="block truncate font-semibold text-foreground">{a.title}</span>
          <span className="block truncate text-xs text-muted-foreground" dir="ltr">
            {a.slug}
          </span>
        </div>
      ),
    },
    { key: 'category', header: 'دسته', cell: (a) => <span className="whitespace-nowrap">{a.category}</span> },
    {
      key: 'publishedAt',
      header: 'انتشار',
      cell: (a) => <span className="whitespace-nowrap text-muted-foreground">{formatJalali(a.publishedAt)}</span>,
    },
    {
      key: 'active',
      header: 'وضعیت',
      className: 'w-24',
      cell: (a) =>
        a.isActive ? (
          <Badge variant="success" size="sm">
            منتشرشده
          </Badge>
        ) : (
          <Badge variant="outline" size="sm" className="text-muted-foreground">
            پیش‌نویس
          </Badge>
        ),
    },
    {
      key: 'actions',
      header: <span className="sr-only">عملیات</span>,
      className: 'w-36 text-end',
      cell: (a) => (
        <div className="flex items-center justify-end gap-0.5" onClick={(e) => e.stopPropagation()}>
          <IconButton asChild label={`مشاهدهٔ ${a.title} در سایت`} icon={<ExternalLink />} size="sm">
            <Link href={`/blog/${a.slug}`} target="_blank" rel="noopener noreferrer" />
          </IconButton>
          <IconButton label={`ویرایش ${a.title}`} icon={<Pencil />} size="sm" onClick={() => openEdit(a)} />
          <IconButton
            label={`حذف ${a.title}`}
            icon={<Trash2 />}
            size="sm"
            className="text-destructive hover:bg-destructive/10 hover:text-destructive"
            onClick={() => setDeleting(a)}
          />
        </div>
      ),
    },
  ];

  return (
    <>
      <AdminPageHeader
        title="مقالات"
        subtitle={data?.pagination ? `${toPersianDigits(data.pagination.total)} مقاله` : 'مدیریت مقالات مجله'}
        actions={
          <Button type="button" className="gap-2" onClick={openCreate}>
            <Plus className="h-5 w-5" aria-hidden="true" />
            مقاله جدید
          </Button>
        }
      />

      <FiltersBar
        className="mb-4"
        activeCount={active ? 1 : 0}
        onReset={() => {
          setActive('');
          setPage(1);
        }}
        end={
          <SearchInput
            value={search}
            onChange={(v) => {
              setSearch(v);
              setPage(1);
            }}
            placeholder="جست‌وجو در عنوان یا اسلاگ…"
          />
        }
        extra={
          <div className="w-full md:w-48">
            <Select
              label="وضعیت انتشار"
              options={ACTIVE_OPTIONS}
              value={active}
              onChange={(e) => {
                setActive(e.target.value);
                setPage(1);
              }}
            />
          </div>
        }
      />

      {isError && <ErrorBanner message={error.message} onRetry={() => refetch()} className="mb-4" />}

      <DataTable
        caption="فهرست مقالات"
        columns={columns}
        rows={rows}
        rowKey={(a) => a.id}
        onRowClick={openEdit}
        loading={isLoading}
        fetching={isFetching && !isLoading}
        pagination={data?.pagination}
        onPageChange={setPage}
        empty={{
          icon: <Newspaper />,
          title: 'مقاله‌ای یافت نشد',
          description: search || active ? 'فیلترها را تغییر دهید.' : 'اولین مقاله را بنویسید.',
          action: (
            <Button type="button" size="sm" className="gap-2" onClick={openCreate}>
              <Plus className="h-4 w-4" aria-hidden="true" />
              مقاله جدید
            </Button>
          ),
        }}
        mobile={(a) => (
          <div className="flex items-start gap-3">
            <Cover article={a} size={56} />
            <div className="min-w-0 flex-1">
              <span className="block truncate font-bold text-foreground">{a.title}</span>
              <p className="text-xs text-muted-foreground">
                {a.category} · {formatJalali(a.publishedAt)}
              </p>
              <div className="mt-1 flex items-center justify-between gap-2">
                {a.isActive ? (
                  <Badge variant="success" size="sm">
                    منتشرشده
                  </Badge>
                ) : (
                  <Badge variant="outline" size="sm" className="text-muted-foreground">
                    پیش‌نویس
                  </Badge>
                )}
              </div>
              <div className="mt-2 flex items-center justify-end gap-0.5 border-t border-border/50 pt-1" onClick={(e) => e.stopPropagation()}>
                <IconButton asChild label={`مشاهدهٔ ${a.title} در سایت`} icon={<ExternalLink />} size="sm">
                  <Link href={`/blog/${a.slug}`} target="_blank" rel="noopener noreferrer" />
                </IconButton>
                <IconButton label={`ویرایش ${a.title}`} icon={<Pencil />} size="sm" onClick={() => openEdit(a)} />
                <IconButton
                  label={`حذف ${a.title}`}
                  icon={<Trash2 />}
                  size="sm"
                  className="text-destructive hover:bg-destructive/10 hover:text-destructive"
                  onClick={() => setDeleting(a)}
                />
              </div>
            </div>
          </div>
        )}
      />

      <ArticleFormDialog open={formOpen} onOpenChange={setFormOpen} article={editing} />

      <ConfirmDialog
        open={deleting !== null}
        onOpenChange={(o) => {
          if (!o) setDeleting(null);
        }}
        title={`حذف «${deleting?.title ?? ''}»؟`}
        description="مقاله از مجله حذف می‌شود. این کار قابل بازگشت نیست."
        confirmLabel="بله، حذف کن"
        destructive
        loading={deleteArticle.isPending}
        icon={<Trash2 />}
        onConfirm={confirmDelete}
      />
    </>
  );
}
