'use client';

import * as React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { toast } from 'sonner';
import { ExternalLink, Package, Pencil, Plus, Star, Trash2 } from 'lucide-react';
import type { Product } from '@technokhan/shared';
import { PRODUCT_CATEGORY_LABELS, formatToman, toPersianDigits } from '@technokhan/shared';
import { useAdminMutations, useAdminProducts } from '@/lib/hooks/use-admin';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { IconButton } from '@/components/ui/icon-button';
import { Select } from '@/components/ui/select';
import { AdminPageHeader } from '@/components/admin/admin-page-header';
import { ConfirmDialog } from '@/components/admin/confirm-dialog';
import { DataTable, type DataTableColumn } from '@/components/admin/data-table';
import { ErrorBanner } from '@/components/admin/error-banner';
import { FiltersBar } from '@/components/admin/filters-bar';
import { ProductFormDialog } from '@/components/admin/product-form-dialog';
import { SearchInput } from '@/components/admin/search-input';

const PAGE_SIZE = 20;
const PLACEHOLDER = '/images/placeholder-product.webp';

const CATEGORY_CHIPS = [
  { value: '', label: 'همهٔ دسته‌ها' },
  ...Object.entries(PRODUCT_CATEGORY_LABELS).map(([value, label]) => ({ value, label })),
];

const ACTIVE_OPTIONS = [
  { value: '', label: 'همه' },
  { value: 'true', label: 'فقط فعال' },
  { value: 'false', label: 'فقط غیرفعال' },
];

function Thumb({ product, size = 48 }: { product: Product; size?: number }) {
  const src = product.images?.[0] ?? PLACEHOLDER;
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

function Price({ product }: { product: Product }) {
  return (
    <div className="whitespace-nowrap">
      {product.discountPrice ? (
        <>
          <span className="block font-semibold text-foreground">{formatToman(product.discountPrice)}</span>
          <span className="block text-xs text-muted-foreground line-through">{formatToman(product.price)}</span>
        </>
      ) : (
        <span className="font-semibold text-foreground">{formatToman(product.price)}</span>
      )}
    </div>
  );
}

export function AdminProductsClient() {
  const params = useSearchParams();
  const [search, setSearch] = React.useState('');
  const [category, setCategory] = React.useState('');
  const [active, setActive] = React.useState('');
  const [page, setPage] = React.useState(1);
  const [editing, setEditing] = React.useState<Product | null>(null);
  const [formOpen, setFormOpen] = React.useState(() => params.get('new') === '1');
  const [deleting, setDeleting] = React.useState<Product | null>(null);

  const { deleteProduct } = useAdminMutations();

  const query = React.useMemo(
    () => ({
      search: search || undefined,
      category: category || undefined,
      isActive: active || undefined,
      page,
      limit: PAGE_SIZE,
    }),
    [search, category, active, page]
  );
  const { data, isLoading, isFetching, isError, error, refetch } = useAdminProducts(query);
  const rows = data?.items ?? [];

  const openCreate = () => {
    setEditing(null);
    setFormOpen(true);
  };
  const openEdit = (p: Product) => {
    setEditing(p);
    setFormOpen(true);
  };

  const confirmDelete = () => {
    if (!deleting) return;
    const target = deleting;
    deleteProduct.mutate(target.id, {
      onSuccess: () => {
        toast.success('محصول حذف شد', { description: target.name });
        setDeleting(null);
      },
      onError: (e) => toast.error('حذف محصول ناموفق بود', { description: e.message }),
    });
  };

  const columns: DataTableColumn<Product>[] = [
    { key: 'image', header: 'تصویر', className: 'w-16', cell: (p) => <Thumb product={p} /> },
    {
      key: 'name',
      header: 'نام',
      cell: (p) => (
        <div className="min-w-0">
          <span className="block truncate font-semibold text-foreground">{p.name}</span>
          <span className="block truncate text-xs text-muted-foreground" dir="ltr">
            {p.nameEn}
            {p.brand ? ` · ${p.brand}` : ''}
          </span>
        </div>
      ),
    },
    { key: 'category', header: 'دسته', cell: (p) => <span className="whitespace-nowrap">{PRODUCT_CATEGORY_LABELS[p.category] ?? p.category}</span> },
    { key: 'price', header: 'قیمت', cell: (p) => <Price product={p} /> },
    {
      key: 'stock',
      header: 'موجودی',
      cell: (p) => (
        <span className={p.stock === 0 ? 'font-semibold text-destructive' : 'tabular-nums'}>
          {p.stock === 0 ? 'ناموجود' : toPersianDigits(p.stock)}
        </span>
      ),
    },
    {
      key: 'featured',
      header: 'ویژه',
      className: 'w-14 text-center',
      cell: (p) =>
        p.featured ? (
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
      cell: (p) =>
        p.isActive === false ? (
          <Badge variant="outline" size="sm" className="text-muted-foreground">
            غیرفعال
          </Badge>
        ) : (
          <Badge variant="success" size="sm">
            فعال
          </Badge>
        ),
    },
    {
      key: 'actions',
      header: <span className="sr-only">عملیات</span>,
      className: 'w-36 text-end',
      cell: (p) => (
        <div className="flex items-center justify-end gap-0.5" onClick={(e) => e.stopPropagation()}>
          <IconButton asChild label={`مشاهدهٔ ${p.name} در سایت`} icon={<ExternalLink />} size="sm">
            <Link href={`/products/${p.id}`} target="_blank" rel="noopener noreferrer" />
          </IconButton>
          <IconButton label={`ویرایش ${p.name}`} icon={<Pencil />} size="sm" onClick={() => openEdit(p)} />
          <IconButton
            label={`حذف ${p.name}`}
            icon={<Trash2 />}
            size="sm"
            className="text-destructive hover:bg-destructive/10 hover:text-destructive"
            onClick={() => setDeleting(p)}
          />
        </div>
      ),
    },
  ];

  const activeFilters = (category ? 1 : 0) + (active ? 1 : 0);

  return (
    <>
      <AdminPageHeader
        title="محصولات"
        subtitle={data?.pagination ? `${toPersianDigits(data.pagination.total)} محصول` : 'مدیریت محصولات فروشگاه'}
        actions={
          <Button type="button" className="gap-2" onClick={openCreate}>
            <Plus className="h-5 w-5" aria-hidden="true" />
            محصول جدید
          </Button>
        }
      />

      <FiltersBar
        className="mb-4"
        chips={CATEGORY_CHIPS}
        chipsLabel="فیلتر دسته‌بندی"
        value={category}
        onChange={(v) => {
          setCategory(v);
          setPage(1);
        }}
        activeCount={activeFilters}
        onReset={() => {
          setCategory('');
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
            placeholder="جست‌وجو در نام، نام انگلیسی یا برند…"
          />
        }
        extra={
          <div className="w-full md:w-48">
            <Select
              label="وضعیت نمایش"
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
        caption="فهرست محصولات"
        columns={columns}
        rows={rows}
        rowKey={(p) => p.id}
        onRowClick={openEdit}
        loading={isLoading}
        fetching={isFetching && !isLoading}
        pagination={data?.pagination}
        onPageChange={setPage}
        empty={{
          icon: <Package />,
          title: 'محصولی یافت نشد',
          description: search || activeFilters ? 'فیلترها را تغییر دهید.' : 'اولین محصول را اضافه کنید.',
          action: (
            <Button type="button" size="sm" className="gap-2" onClick={openCreate}>
              <Plus className="h-4 w-4" aria-hidden="true" />
              محصول جدید
            </Button>
          ),
        }}
        mobile={(p) => (
          <div className="flex items-start gap-3">
            <Thumb product={p} size={56} />
            <div className="min-w-0 flex-1">
              <div className="flex items-start justify-between gap-2">
                <span className="truncate font-bold text-foreground">{p.name}</span>
                {p.featured && <Star className="h-4 w-4 shrink-0 fill-secondary text-secondary" aria-label="ویژه" />}
              </div>
              <p className="text-xs text-muted-foreground">{PRODUCT_CATEGORY_LABELS[p.category] ?? p.category}</p>
              <div className="mt-1 flex items-center justify-between gap-2">
                <Price product={p} />
                <div className="flex items-center gap-1.5">
                  {p.isActive === false && (
                    <Badge variant="outline" size="sm" className="text-muted-foreground">
                      غیرفعال
                    </Badge>
                  )}
                  <span className={p.stock === 0 ? 'text-xs font-semibold text-destructive' : 'text-xs text-muted-foreground'}>
                    {p.stock === 0 ? 'ناموجود' : `موجودی ${toPersianDigits(p.stock)}`}
                  </span>
                </div>
              </div>
              <div className="mt-2 flex items-center justify-end gap-0.5 border-t border-border/50 pt-1" onClick={(e) => e.stopPropagation()}>
                <IconButton asChild label={`مشاهدهٔ ${p.name} در سایت`} icon={<ExternalLink />} size="sm">
                  <Link href={`/products/${p.id}`} target="_blank" rel="noopener noreferrer" />
                </IconButton>
                <IconButton label={`ویرایش ${p.name}`} icon={<Pencil />} size="sm" onClick={() => openEdit(p)} />
                <IconButton
                  label={`حذف ${p.name}`}
                  icon={<Trash2 />}
                  size="sm"
                  className="text-destructive hover:bg-destructive/10 hover:text-destructive"
                  onClick={() => setDeleting(p)}
                />
              </div>
            </div>
          </div>
        )}
      />

      <ProductFormDialog open={formOpen} onOpenChange={setFormOpen} product={editing} />

      <ConfirmDialog
        open={deleting !== null}
        onOpenChange={(o) => {
          if (!o) setDeleting(null);
        }}
        title={`حذف «${deleting?.name ?? ''}»؟`}
        description="محصول از فروشگاه حذف می‌شود. این کار قابل بازگشت نیست."
        confirmLabel="بله، حذف کن"
        destructive
        loading={deleteProduct.isPending}
        icon={<Trash2 />}
        onConfirm={confirmDelete}
      />
    </>
  );
}
