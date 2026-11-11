'use client';

import * as React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ChevronLeft, Filter, Grid2X2, List, RotateCcw, X } from 'lucide-react';
import { toPersianDigits, type Brand, type Category, type PagedList, type Product, type ProductListQuery } from '@technokhan/shared';
import { useProducts } from '@/lib/hooks/use-products';
import { parseShopQuery, shopQueryToSearchParams, SHOP_PRICE_LIMIT } from '@/lib/shop-query';
import { cn } from '@/lib/utils';
import { ProductGrid } from './product-grid';
import { Button } from '@/components/ui/button';
import { Select } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { RangeSlider } from '@/components/ui/range-slider';
import { Switch } from '@/components/ui/switch';
import { Checkbox } from '@/components/ui/checkbox';
import { BottomSheet } from '@/components/ui/bottom-sheet';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';

export interface ShopClientProps {
  initialProducts: PagedList<Product>;
  categories: Category[];
  brands: Brand[];
  initialQuery: ProductListQuery;
  lockedCategory?: Category;
}

/** URL-seeded catalog with composable filters, sorting, grid/list views and mobile filter sheet. */
export function ShopClient({ initialProducts, categories, brands, initialQuery, lockedCategory }: ShopClientProps) {
  const pathname = usePathname();
  const [query, setQuery] = React.useState(initialQuery);
  const [filtersOpen, setFiltersOpen] = React.useState(false);
  const [layout, setLayout] = React.useState<'grid' | 'list'>('grid');
  const initialSignature = React.useRef(JSON.stringify(initialQuery));
  const firstUrlSync = React.useRef(true);
  const signature = JSON.stringify(query);
  const result = useProducts(query, { initialData: signature === initialSignature.current ? initialProducts : undefined });
  const update = React.useCallback((patch: Partial<ProductListQuery>) => setQuery((current) => {
    const next = { ...current, ...patch, page: patch.page ?? 1 };
    if (next.minPrice === 0) next.minPrice = undefined;
    if (next.maxPrice === SHOP_PRICE_LIMIT) next.maxPrice = undefined;
    return next;
  }), []);
  const clear = () => setQuery({ category: lockedCategory?.id, sortBy: 'popular', sortOrder: 'desc', page: 1, limit: 12 });
  const filterPanel = <FilterPanel categories={categories} brands={brands} query={query} lockedCategory={lockedCategory} update={update} clear={clear} />;
  const activeCount = [query.search, query.brands?.length, query.inStock, query.deals, query.minPrice !== undefined || query.maxPrice !== undefined, query.features?.length, !lockedCategory && query.category].filter(Boolean).length;

  React.useEffect(() => {
    if (firstUrlSync.current) {
      firstUrlSync.current = false;
      return;
    }
    const timer = window.setTimeout(() => {
      const nextUrl = `${pathname}${shopQueryToSearchParams(query, { skipCategory: Boolean(lockedCategory) })}`;
      if (`${window.location.pathname}${window.location.search}` !== nextUrl) window.history.pushState(window.history.state, '', nextUrl);
    }, 250);
    return () => window.clearTimeout(timer);
  }, [lockedCategory, pathname, query]);

  React.useEffect(() => {
    const onPopState = () => {
      const params = Object.fromEntries(new URLSearchParams(window.location.search));
      setQuery({ ...parseShopQuery(params), category: lockedCategory?.id });
    };
    window.addEventListener('popstate', onPopState);
    return () => window.removeEventListener('popstate', onPopState);
  }, [lockedCategory?.id]);

  return (
    <div className="container-custom py-6 sm:py-10">
      <nav className="mb-5 flex items-center gap-2 text-xs text-muted-foreground" aria-label="مسیر صفحه"><Link href="/">خانه</Link><ChevronLeft className="size-3" aria-hidden="true" /><span>{lockedCategory?.name ?? 'فروشگاه'}</span></nav>
      <header className="mb-7 flex flex-wrap items-end justify-between gap-4">
        <div><h1 className="text-3xl font-black sm:text-4xl">{lockedCategory?.name ?? 'فروشگاه تکنو خان'}</h1><p className="mt-2 max-w-2xl text-sm leading-7 text-muted-foreground">{lockedCategory?.description ?? 'گجت‌ها را بر اساس برند، بودجه و مشخصات واقعی پیدا کنید؛ بدون شلوغی و اطلاعات مبهم.'}</p></div>
        <Badge variant="outline" className="tabular-nums">{toPersianDigits(result.total)} محصول</Badge>
      </header>
      <div className="grid gap-7 lg:grid-cols-[260px_1fr]">
        <aside className="hidden lg:block"><div className="sticky top-28 rounded-2xl border border-border bg-card p-5">{filterPanel}</div></aside>
        <div>
          <div className="mb-4 flex flex-wrap items-center gap-2 rounded-2xl border border-border bg-card p-3">
            <Button variant="outline" className="lg:hidden" onClick={() => setFiltersOpen(true)}><Filter className="size-4" aria-hidden="true" /> فیلترها {activeCount > 0 && <Badge variant="secondary" size="sm">{toPersianDigits(activeCount)}</Badge>}</Button>
            <Select aria-label="مرتب‌سازی محصولات" value={query.sortBy === 'price' ? query.sortOrder === 'asc' ? 'priceAsc' : 'priceDesc' : query.sortBy} onChange={(event) => {
              const value = event.target.value;
              update(value === 'priceAsc' || value === 'priceDesc' ? { sortBy: 'price', sortOrder: value === 'priceAsc' ? 'asc' : 'desc' } : { sortBy: value as ProductListQuery['sortBy'], sortOrder: 'desc' });
            }} containerClassName="ms-auto w-44" options={[{ value: 'popular', label: 'پرفروش‌ترین' }, { value: 'newest', label: 'جدیدترین' }, { value: 'rating', label: 'بالاترین امتیاز' }, { value: 'priceAsc', label: 'ارزان‌ترین' }, { value: 'priceDesc', label: 'گران‌ترین' }]} />
            <div className="flex rounded-xl border border-border p-1" role="group" aria-label="چیدمان محصولات">
              <Button size="icon-sm" variant={layout === 'grid' ? 'primary' : 'ghost'} aria-label="نمایش شبکه‌ای" aria-pressed={layout === 'grid'} onClick={() => setLayout('grid')}><Grid2X2 className="size-4" aria-hidden="true" /></Button>
              <Button size="icon-sm" variant={layout === 'list' ? 'primary' : 'ghost'} aria-label="نمایش فهرستی" aria-pressed={layout === 'list'} onClick={() => setLayout('list')}><List className="size-4" aria-hidden="true" /></Button>
            </div>
          </div>
          <ActiveChips query={query} update={update} lockedCategory={lockedCategory} />
          {result.isLoading ? <ProductSkeletons /> : result.products.length === 0 ? (
            <div className="flex min-h-80 flex-col items-center justify-center rounded-2xl border border-dashed border-border p-8 text-center"><h2 className="text-xl font-black">محصولی با این فیلترها پیدا نشد</h2><p className="mt-2 text-sm text-muted-foreground">بازه قیمت یا برندها را تغییر دهید، یا همه فیلترها را پاک کنید.</p><Button className="mt-5" variant="outline" onClick={clear}><RotateCcw className="size-4" aria-hidden="true" /> پاک کردن فیلترها</Button></div>
          ) : (
            <div className={cn('transition-opacity', result.isFetching && 'opacity-55')} aria-busy={result.isFetching}><ProductGrid products={result.products} layout={layout} /></div>
          )}
          {result.pagination && result.pagination.totalPages > 1 && (
            <nav className="mt-8 flex items-center justify-center gap-2" aria-label="صفحه‌بندی محصولات">
              <Button variant="outline" disabled={!result.pagination.hasPrev} onClick={() => update({ page: (query.page ?? 1) - 1 })}>قبلی</Button>
              <span className="px-4 text-sm tabular-nums">صفحه {toPersianDigits(result.pagination.page)} از {toPersianDigits(result.pagination.totalPages)}</span>
              <Button variant="outline" disabled={!result.pagination.hasNext} onClick={() => update({ page: (query.page ?? 1) + 1 })}>بعدی</Button>
            </nav>
          )}
        </div>
      </div>
      <BottomSheet open={filtersOpen} onOpenChange={setFiltersOpen} title="فیلتر محصولات" description={`${toPersianDigits(result.total)} محصول با فیلترهای فعلی`}><div className="py-3">{filterPanel}<Button className="mt-5 w-full" onClick={() => setFiltersOpen(false)}>نمایش نتایج</Button></div></BottomSheet>
    </div>
  );
}

interface FilterPanelProps {
  categories: Category[];
  brands: Brand[];
  query: ProductListQuery;
  lockedCategory?: Category;
  update: (patch: Partial<ProductListQuery>) => void;
  clear: () => void;
}

/** Controlled filter form shared by the desktop sidebar and mobile sheet. */
function FilterPanel({ categories, brands, query, lockedCategory, update, clear }: FilterPanelProps) {
  const featureOptions = ['GaN', 'بی‌سیم', 'نویزکنسلینگ'];
  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between"><h2 className="font-black">فیلترها</h2><Button variant="ghost" size="sm" onClick={clear}><RotateCcw className="size-3.5" aria-hidden="true" /> پاک کردن</Button></div>
      <Input label="جستجو" type="search" value={query.search ?? ''} onChange={(event) => update({ search: event.target.value || undefined })} placeholder="نام یا مشخصه محصول" />
      {!lockedCategory && <Select label="دسته‌بندی" value={query.category ?? ''} onChange={(event) => update({ category: event.target.value || undefined })} options={[{ value: '', label: 'همه دسته‌ها' }, ...categories.map((category) => ({ value: category.id, label: category.name }))]} />}
      <fieldset><legend className="mb-2 text-sm font-semibold">برند</legend><div className="space-y-1">{brands.map((brand) => <Checkbox key={brand.id} label={brand.nameFa} checked={query.brands?.includes(brand.name) ?? false} onChange={(event) => {
        const current = query.brands ?? [];
        update({ brands: event.target.checked ? [...current, brand.name] : current.filter((item) => item !== brand.name) });
      }} />)}</div></fieldset>
      <RangeSlider min={0} max={SHOP_PRICE_LIMIT} step={500_000} minGap={500_000} value={[query.minPrice ?? 0, query.maxPrice ?? SHOP_PRICE_LIMIT]} onValueChange={([minPrice, maxPrice]) => update({ minPrice, maxPrice })} />
      <fieldset><legend className="mb-2 text-sm font-semibold">ویژگی فنی</legend><div className="space-y-1">{featureOptions.map((feature) => <Checkbox key={feature} label={feature} checked={query.features?.includes(feature) ?? false} onChange={(event) => {
        const current = query.features ?? [];
        update({ features: event.target.checked ? [...current, feature] : current.filter((item) => item !== feature) });
      }} />)}</div></fieldset>
      <div className="flex min-h-11 items-center justify-between border-t border-border pt-4"><span className="text-sm font-semibold">فقط کالاهای موجود</span><Switch checked={query.inStock ?? false} onCheckedChange={(inStock) => update({ inStock: inStock || undefined })} label="فقط کالاهای موجود" /></div>
      <div className="flex min-h-11 items-center justify-between"><span className="text-sm font-semibold">فقط تخفیف‌دار</span><Switch checked={query.deals ?? false} onCheckedChange={(deals) => update({ deals: deals || undefined })} label="فقط تخفیف‌دار" /></div>
    </div>
  );
}

/** Removable summary of the currently active filter state. */
function ActiveChips({ query, update, lockedCategory }: Pick<FilterPanelProps, 'query' | 'update' | 'lockedCategory'>) {
  return (
    <div className="mb-4 flex flex-wrap gap-2" aria-label="فیلترهای فعال">
      {!lockedCategory && query.category && <Chip label={query.category} onRemove={() => update({ category: undefined })} />}
      {query.search && <Chip label={`جستجو: ${query.search}`} onRemove={() => update({ search: undefined })} />}
      {query.brands?.map((brand) => <Chip key={brand} label={brand} onRemove={() => update({ brands: query.brands?.filter((item) => item !== brand) })} />)}
      {(query.minPrice !== undefined || query.maxPrice !== undefined) && <Chip label="بازه قیمت" onRemove={() => update({ minPrice: undefined, maxPrice: undefined })} />}
      {query.inStock && <Chip label="فقط موجود" onRemove={() => update({ inStock: undefined })} />}
      {query.deals && <Chip label="فقط تخفیف‌دار" onRemove={() => update({ deals: undefined })} />}
      {query.features?.map((feature) => <Chip key={feature} label={feature} onRemove={() => update({ features: query.features?.filter((item) => item !== feature) })} />)}
    </div>
  );
}

function Chip({ label, onRemove }: { label: string; onRemove: () => void }) {
  return <Badge variant="outline" className="gap-1 py-1.5">{label}<button type="button" onClick={onRemove} className="-m-2 flex size-11 items-center justify-center rounded-full hover:bg-muted" aria-label={`حذف فیلتر ${label}`}><X className="size-3" aria-hidden="true" /></button></Badge>;
}

function ProductSkeletons() {
  return <div className="grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-4" aria-label="در حال بارگذاری محصولات">{Array.from({ length: 8 }, (_, index) => <div key={index} className="rounded-2xl border border-border p-3"><Skeleton className="aspect-square w-full rounded-xl" /><Skeleton className="mt-4 h-4 w-2/3" /><Skeleton className="mt-3 h-4 w-1/3" /><Skeleton className="mt-4 h-10 w-full" /></div>)}</div>;
}
